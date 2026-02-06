import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';
import type { User, UserRole } from '../types';
import { DEMO_USERS } from '../data/demoData';
import { IS_DEMO_AUTH_ENABLED, STORAGE_KEYS } from '../constants/clinic';

// Tempo de inatividade para logout automático (30 minutos)
const SESSION_TIMEOUT = 30 * 60 * 1000;
const LAST_ACTIVITY_KEY = 'clinica_last_activity';

// Proteção contra tentativas de login inválidas
const LOGIN_SECURITY_KEY = 'clinica_login_security';
const MAX_FAILED_ATTEMPTS = 5;
const BASE_LOCK_MS = 60 * 1000;
const MAX_LOCK_MS = 15 * 60 * 1000;

interface LoginSecurityState {
  failedAttempts: number;
  lockUntil: number | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  lastActivity: Date | null;
  sessionExpiresAt: Date | null;
  failedLoginAttempts: number;
  isLoginLocked: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (requiredRole: UserRole | UserRole[]) => boolean;
  updateActivity: () => void;
  getRemainingSessionTime: () => number;
  getLoginLockRemainingTime: () => number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getInitialLoginSecurityState = (): LoginSecurityState => {
  const raw = localStorage.getItem(LOGIN_SECURITY_KEY);
  if (!raw) {
    return { failedAttempts: 0, lockUntil: null };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<LoginSecurityState>;
    return {
      failedAttempts: typeof parsed.failedAttempts === 'number' ? parsed.failedAttempts : 0,
      lockUntil: typeof parsed.lockUntil === 'number' ? parsed.lockUntil : null
    };
  } catch {
    return { failedAttempts: 0, lockUntil: null };
  }
};

const persistLoginSecurityState = (state: LoginSecurityState) => {
  localStorage.setItem(LOGIN_SECURITY_KEY, JSON.stringify(state));
};

const clearLoginSecurityState = () => {
  localStorage.removeItem(LOGIN_SECURITY_KEY);
};

const getLockoutDuration = (failedAttempts: number): number => {
  const escalationLevel = Math.max(0, failedAttempts - MAX_FAILED_ATTEMPTS);
  const duration = BASE_LOCK_MS * (2 ** escalationLevel);
  return Math.min(duration, MAX_LOCK_MS);
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Verificar se há usuário salvo no localStorage
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (savedUser) {
      try {
        // Verificar se a sessão expirou
        const lastActivityStr = localStorage.getItem(LAST_ACTIVITY_KEY);
        if (lastActivityStr) {
          const lastActivity = new Date(lastActivityStr);
          const now = new Date();
          if (now.getTime() - lastActivity.getTime() > SESSION_TIMEOUT) {
            // Sessão expirou - limpar dados
            localStorage.removeItem(STORAGE_KEYS.USER);
            localStorage.removeItem(LAST_ACTIVITY_KEY);
            return null;
          }
        }
        return JSON.parse(savedUser);
      } catch {
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(LAST_ACTIVITY_KEY);
        return null;
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [lastActivity, setLastActivity] = useState<Date | null>(() => {
    const saved = localStorage.getItem(LAST_ACTIVITY_KEY);
    return saved ? new Date(saved) : null;
  });
  const [loginSecurity, setLoginSecurity] = useState<LoginSecurityState>(() => getInitialLoginSecurityState());

  const getLoginLockRemainingTime = useCallback(() => {
    if (!loginSecurity.lockUntil) return 0;
    return Math.max(0, loginSecurity.lockUntil - Date.now());
  }, [loginSecurity.lockUntil]);

  const isLoginLocked = getLoginLockRemainingTime() > 0;

  useEffect(() => {
    if (loginSecurity.failedAttempts === 0 && !loginSecurity.lockUntil) {
      clearLoginSecurityState();
      return;
    }

    persistLoginSecurityState(loginSecurity);
  }, [loginSecurity]);

  useEffect(() => {
    if (!loginSecurity.lockUntil) return;

    const remaining = getLoginLockRemainingTime();
    if (remaining > 0) return;

    setLoginSecurity(prev => ({ ...prev, lockUntil: null }));
  }, [loginSecurity.lockUntil, getLoginLockRemainingTime]);

  // Atualiza a última atividade
  const updateActivity = useCallback(() => {
    const now = new Date();
    setLastActivity(now);
    localStorage.setItem(LAST_ACTIVITY_KEY, now.toISOString());
  }, []);

  // Calcula quando a sessão expira
  const sessionExpiresAt = useMemo(() => {
    if (!lastActivity || !user) return null;
    return new Date(lastActivity.getTime() + SESSION_TIMEOUT);
  }, [lastActivity, user]);

  // Retorna tempo restante da sessão em milissegundos
  const getRemainingSessionTime = useCallback(() => {
    if (!sessionExpiresAt) return 0;
    const remaining = sessionExpiresAt.getTime() - Date.now();
    return Math.max(0, remaining);
  }, [sessionExpiresAt]);

  const logout = useCallback(() => {
    setUser(null);
    setLastActivity(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(LAST_ACTIVITY_KEY);
  }, []);

  // Verifica sessão expirada e faz logout automático
  useEffect(() => {
    if (!user) return;

    const checkSession = () => {
      const remaining = getRemainingSessionTime();
      if (remaining <= 0) {
        console.log('[Auth] Sessão expirada por inatividade');
        logout();
      }
    };

    // Verifica a cada minuto
    const intervalId = setInterval(checkSession, 60000);

    // Atualiza atividade em eventos do usuário
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => updateActivity();

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      clearInterval(intervalId);
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [user, getRemainingSessionTime, updateActivity, logout]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);

    try {
      // Validação básica
      if (!email || !password) {
        throw new Error('Email e senha são obrigatórios');
      }

      if (!IS_DEMO_AUTH_ENABLED) {
        throw new Error('Autenticação demo desativada. Configure um backend de autenticação para produção.');
      }

      const lockRemaining = getLoginLockRemainingTime();
      if (lockRemaining > 0) {
        const seconds = Math.ceil(lockRemaining / 1000);
        throw new Error(`Muitas tentativas inválidas. Aguarde ${seconds}s para tentar novamente.`);
      }

      // Simular delay de rede (também ajuda contra brute force)
      await new Promise(resolve => setTimeout(resolve, 500));

      // Normaliza email para comparação
      const normalizedEmail = email.toLowerCase().trim();

      const foundUser = DEMO_USERS.find(
        u => u.email.toLowerCase() === normalizedEmail && u.password === password
      );

      if (!foundUser) {
        setLoginSecurity(prev => {
          const nextAttempts = prev.failedAttempts + 1;
          if (nextAttempts < MAX_FAILED_ATTEMPTS) {
            return { ...prev, failedAttempts: nextAttempts };
          }

          const lockDuration = getLockoutDuration(nextAttempts);
          return {
            failedAttempts: nextAttempts,
            lockUntil: Date.now() + lockDuration
          };
        });

        throw new Error('Email ou senha inválidos');
      }

      // Sucesso no login: reset de tentativas inválidas
      setLoginSecurity({ failedAttempts: 0, lockUntil: null });

      const { password: _password, ...userWithoutPassword } = foundUser;
      void _password; // Ignora a senha de propósito

      setUser(userWithoutPassword);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userWithoutPassword));

      // Registra atividade inicial
      const now = new Date();
      setLastActivity(now);
      localStorage.setItem(LAST_ACTIVITY_KEY, now.toISOString());
    } finally {
      setIsLoading(false);
    }
  }, [getLoginLockRemainingTime]);

  const hasPermission = useCallback((requiredRole: UserRole | UserRole[]) => {
    if (!user) return false;
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(user.role);
  }, [user]);

  // Memoiza o valor do contexto
  const contextValue = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    lastActivity,
    sessionExpiresAt,
    failedLoginAttempts: loginSecurity.failedAttempts,
    isLoginLocked,
    login,
    logout,
    hasPermission,
    updateActivity,
    getRemainingSessionTime,
    getLoginLockRemainingTime
  }), [
    user,
    isLoading,
    lastActivity,
    sessionExpiresAt,
    loginSecurity.failedAttempts,
    isLoginLocked,
    login,
    logout,
    hasPermission,
    updateActivity,
    getRemainingSessionTime,
    getLoginLockRemainingTime
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

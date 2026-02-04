import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { LogOut, Bell, Search, Menu, X, User, DollarSign, Calendar } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { logout } = useAuth();
  const { getTodayAppointments, getPendingPayments, searchPatients } = useData();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Busca de pacientes
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return searchPatients(searchTerm).slice(0, 5);
  }, [searchTerm, searchPatients]);

  // Notificações reais
  const todayAppointments = getTodayAppointments();
  const pendingPayments = getPendingPayments();

  const notifications = useMemo(() => {
    const items = [];

    if (todayAppointments.length > 0) {
      items.push({
        id: 'appointments',
        type: 'info' as const,
        icon: Calendar,
        title: `${todayAppointments.length} consulta${todayAppointments.length > 1 ? 's' : ''} hoje`,
        description: `Próxima: ${todayAppointments[0]?.horaInicio}`,
        link: '/agenda'
      });
    }

    if (pendingPayments.length > 0) {
      const totalPending = pendingPayments.reduce((sum, p) => sum + p.valor, 0);
      items.push({
        id: 'payments',
        type: 'warning' as const,
        icon: DollarSign,
        title: `${pendingPayments.length} pagamento${pendingPayments.length > 1 ? 's' : ''} pendente${pendingPayments.length > 1 ? 's' : ''}`,
        description: formatCurrency(totalPending),
        link: '/financeiro'
      });
    }

    return items;
  }, [todayAppointments, pendingPayments]);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Atalho de teclado Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = searchRef.current?.querySelector('input');
        searchInput?.focus();
      }
      if (event.key === 'Escape') {
        setIsSearchFocused(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePatientSelect = (patientId: string) => {
    setSearchTerm('');
    setIsSearchFocused(false);
    navigate(`/pacientes/${patientId}`);
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 shadow-sm transition-all duration-300">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 hover:bg-slate-100 rounded-md transition-colors mr-2"
        aria-label="Abrir menu"
      >
        <Menu className="w-5 h-5 text-slate-600" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md mx-2 md:mx-0" ref={searchRef}>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="Buscar pacientes..."
            aria-label="Buscar pacientes"
            className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white outline-none transition-all text-sm placeholder:text-slate-400"
          />
          {searchTerm ? (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-md transition-colors"
              aria-label="Limpar busca"
            >
              <X className="w-3.5 h-3.5 text-slate-400" />
            </button>
          ) : (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 text-xs opacity-50">
              <span className="text-slate-500 font-sans border border-slate-200 px-1.5 rounded bg-slate-100">⌘K</span>
            </div>
          )}

          {/* Search Results Dropdown */}
          {isSearchFocused && searchTerm && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden z-[70] max-h-[60vh] overflow-y-auto">
              {searchResults.length > 0 ? (
                <ul className="py-1">
                  {searchResults.map(patient => (
                    <li key={patient.id}>
                      <button
                        onClick={() => handlePatientSelect(patient.id)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 text-slate-500">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-900 text-sm truncate">{patient.nome}</p>
                          <p className="text-xs text-slate-500 truncate">{patient.telefone}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-slate-500">
                  <p className="text-sm">Nenhum paciente encontrado</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0 ml-4">
        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
            title="Notificações"
            aria-label="Notificações"
            aria-expanded={showNotifications}
          >
            <Bell className="w-5 h-5" aria-hidden="true" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                <h3 className="font-semibold text-slate-900 text-sm">Notificações</h3>
              </div>
              {notifications.length > 0 ? (
                <ul className="py-1">
                  {notifications.map(notification => (
                    <li key={notification.id}>
                      <Link
                        to={notification.link}
                        onClick={() => setShowNotifications(false)}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                          notification.type === 'warning' ? 'bg-amber-500' : 'bg-primary-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 text-sm">{notification.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{notification.description}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-sm text-slate-500">Nenhuma notificação nova</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 hidden md:block" />

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-rose-600 transition-colors text-sm font-medium"
          title="Sair do sistema"
          aria-label="Sair do sistema"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          <span className="hidden md:inline">Sair</span>
        </button>
      </div>
    </header>
  );
}

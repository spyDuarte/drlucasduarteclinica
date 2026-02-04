import { useState, useEffect, createContext, useContext, useCallback, type ReactNode } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { triggerVictory } from '../utils/confetti';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  celebrate?: boolean;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, celebrate?: boolean) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: 'bg-gradient-to-r from-emerald-50 to-emerald-50/80 text-emerald-800 border-emerald-200/50',
  error: 'bg-gradient-to-r from-rose-50 to-rose-50/80 text-rose-800 border-rose-200/50',
  warning: 'bg-gradient-to-r from-amber-50 to-amber-50/80 text-amber-800 border-amber-200/50',
  info: 'bg-gradient-to-r from-sky-50 to-sky-50/80 text-sky-800 border-sky-200/50',
};

const iconContainerColors = {
  success: 'bg-emerald-100 text-emerald-600',
  error: 'bg-rose-100 text-rose-600',
  warning: 'bg-amber-100 text-amber-600',
  info: 'bg-sky-100 text-sky-600',
};

const progressColors = {
  success: 'bg-emerald-500',
  error: 'bg-rose-500',
  warning: 'bg-amber-500',
  info: 'bg-sky-500',
};

// Animated Check Component
const AnimatedCheck = () => (
  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={3}
      d="M5 13l4 4L19 7"
      className="animate-check-stroke"
      style={{
        strokeDasharray: 24,
        strokeDashoffset: 24,
        animation: 'check-stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards 0.2s'
      }}
    />
  </svg>
);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info', celebrate: boolean = false) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
    setToasts(prev => [...prev, { id, message, type, celebrate }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-3">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const Icon = icons[toast.type];
  const isSuccess = toast.type === 'success';

  useEffect(() => {
    // Trigger confetti if celebrate is true and type is success
    if (isSuccess && toast.celebrate) {
       triggerVictory('basic');
    }

    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast.id, onRemove, isSuccess, toast.celebrate]);

  return (
    <div
      className={`relative flex items-center gap-3 p-4 rounded-xl border shadow-xl shadow-gray-900/10 min-w-[320px] max-w-md animate-slide-in backdrop-blur-sm overflow-hidden ${colors[toast.type]}`}
      role="alert"
    >
      {/* Icon with container */}
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconContainerColors[toast.type]}`}>
        {isSuccess ? <AnimatedCheck /> : <Icon className="w-5 h-5" strokeWidth={2.5} />}
      </div>

      {/* Message */}
      <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>

      {/* Close button */}
      <button
        onClick={() => onRemove(toast.id)}
        className="modal-close-icon flex-shrink-0"
        aria-label="Fechar notificação"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5">
        <div
          className={`h-full ${progressColors[toast.type]} animate-progress`}
          style={{ animation: 'progress 4s linear forwards' }}
        />
      </div>

      <style>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes check-stroke {
          from { stroke-dashoffset: 24; opacity: 0; }
          to { stroke-dashoffset: 0; opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast deve ser usado dentro de um ToastProvider');
  }
  return context;
}

import { useState, useEffect, createContext, useContext, useCallback, type ReactNode } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
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
  error: 'bg-gradient-to-r from-red-50 to-red-50/80 text-red-800 border-red-200/50',
  warning: 'bg-gradient-to-r from-amber-50 to-amber-50/80 text-amber-800 border-amber-200/50',
  info: 'bg-gradient-to-r from-blue-50 to-blue-50/80 text-blue-800 border-blue-200/50',
};

const iconContainerColors = {
  success: 'bg-emerald-100 text-emerald-600',
  error: 'bg-red-100 text-red-600',
  warning: 'bg-amber-100 text-amber-600',
  info: 'bg-blue-100 text-blue-600',
};

const progressColors = {
  success: 'bg-emerald-500',
  error: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
    setToasts(prev => [...prev, { id, message, type }]);
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

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <div
      className={`relative flex items-center gap-3 p-4 rounded-xl border shadow-xl shadow-gray-900/10 min-w-[320px] max-w-md animate-slide-in backdrop-blur-sm overflow-hidden ${colors[toast.type]}`}
      role="alert"
    >
      {/* Icon with container */}
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconContainerColors[toast.type]}`}>
        <Icon className="w-5 h-5" strokeWidth={2.5} />
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

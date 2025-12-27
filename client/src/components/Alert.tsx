import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  title?: string;
  message: string;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function Alert({ type, title, message, onClose, action }: AlertProps) {
  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      iconColor: 'text-emerald-600',
      textColor: 'text-emerald-800',
      titleColor: 'text-emerald-900',
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      iconColor: 'text-rose-600',
      textColor: 'text-rose-800',
      titleColor: 'text-rose-900',
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      iconColor: 'text-amber-600',
      textColor: 'text-amber-800',
      titleColor: 'text-amber-900',
    },
    info: {
      icon: Info,
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-200',
      iconColor: 'text-sky-600',
      textColor: 'text-sky-800',
      titleColor: 'text-sky-900',
    },
  };

  const { icon: Icon, bgColor, borderColor, iconColor, textColor, titleColor } = config[type];

  return (
    <div
      className={`${bgColor} ${borderColor} border rounded-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300`}
      role="alert"
    >
      <Icon className={`${iconColor} w-5 h-5 mt-0.5 flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        {title && <h4 className={`${titleColor} font-semibold text-sm mb-1`}>{title}</h4>}
        <p className={`${textColor} text-sm`}>{message}</p>
        {action && (
          <button
            onClick={action.onClick}
            className={`${iconColor} text-sm font-medium mt-2 hover:underline`}
          >
            {action.label}
          </button>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`${iconColor} hover:opacity-70 transition-opacity flex-shrink-0`}
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

interface FormErrorProps {
  error?: string;
}

export function FormError({ error }: FormErrorProps) {
  if (!error) return null;

  return (
    <div className="flex items-center gap-2 text-rose-600 text-sm mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span>{error}</span>
    </div>
  );
}

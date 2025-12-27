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
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      textColor: 'text-green-800',
      titleColor: 'text-green-900',
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      textColor: 'text-red-800',
      titleColor: 'text-red-900',
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-600',
      textColor: 'text-yellow-800',
      titleColor: 'text-yellow-900',
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-800',
      titleColor: 'text-blue-900',
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
    <div className="flex items-center gap-2 text-red-600 text-sm mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span>{error}</span>
    </div>
  );
}

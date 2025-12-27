import { LucideIcon } from 'lucide-react';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'scheduled'
  | 'confirmed'
  | 'waiting'
  | 'completed'
  | 'cancelled';

export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: LucideIcon;
  dot?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon: Icon,
  dot = false,
  className = ''
}: BadgeProps) {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-sky-100 text-sky-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    scheduled: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-green-100 text-green-800',
    waiting: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const dotColors = {
    default: 'bg-gray-400',
    primary: 'bg-sky-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    scheduled: 'bg-blue-500',
    confirmed: 'bg-green-500',
    waiting: 'bg-yellow-500',
    completed: 'bg-gray-500',
    cancelled: 'bg-red-500',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full
        transition-all duration-200
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`}
          aria-hidden="true"
        />
      )}
      {Icon && <Icon className={iconSizes[size]} aria-hidden="true" />}
      {children}
    </span>
  );
}

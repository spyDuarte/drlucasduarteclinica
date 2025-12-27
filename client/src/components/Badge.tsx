import type { LucideIcon } from 'lucide-react';

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
    default: 'bg-slate-100 text-slate-800',
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-rose-100 text-rose-800',
    info: 'bg-sky-100 text-sky-800',
    scheduled: 'bg-sky-100 text-sky-800',
    confirmed: 'bg-emerald-100 text-emerald-800',
    waiting: 'bg-amber-100 text-amber-800',
    completed: 'bg-slate-100 text-slate-800',
    cancelled: 'bg-rose-100 text-rose-800',
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
    default: 'bg-slate-400',
    primary: 'bg-primary-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-sky-500',
    scheduled: 'bg-sky-500',
    confirmed: 'bg-emerald-500',
    waiting: 'bg-amber-500',
    completed: 'bg-slate-500',
    cancelled: 'bg-rose-500',
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

import type { LucideIcon } from 'lucide-react';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type IconVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'muted';

interface IconProps {
  icon: LucideIcon;
  size?: IconSize;
  variant?: IconVariant;
  className?: string;
  animate?: 'none' | 'spin' | 'pulse' | 'bounce' | 'shake';
  withBackground?: boolean;
  backgroundShape?: 'circle' | 'rounded' | 'square';
  interactive?: boolean;
  strokeWidth?: number;
}

const sizeClasses: Record<IconSize, string> = {
  xs: 'w-3.5 h-3.5',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
  '2xl': 'w-10 h-10'
};

const backgroundSizeClasses: Record<IconSize, string> = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-14 h-14',
  '2xl': 'w-16 h-16'
};

const variantClasses: Record<IconVariant, { icon: string; bg: string }> = {
  default: {
    icon: 'text-gray-600',
    bg: 'bg-gray-100'
  },
  primary: {
    icon: 'text-sky-600',
    bg: 'bg-sky-50'
  },
  success: {
    icon: 'text-emerald-600',
    bg: 'bg-emerald-50'
  },
  warning: {
    icon: 'text-amber-600',
    bg: 'bg-amber-50'
  },
  danger: {
    icon: 'text-red-600',
    bg: 'bg-red-50'
  },
  info: {
    icon: 'text-blue-600',
    bg: 'bg-blue-50'
  },
  muted: {
    icon: 'text-gray-400',
    bg: 'bg-gray-50'
  }
};

const animationClasses: Record<string, string> = {
  none: '',
  spin: 'animate-spin',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
  shake: 'animate-shake'
};

const shapeClasses: Record<string, string> = {
  circle: 'rounded-full',
  rounded: 'rounded-xl',
  square: 'rounded-none'
};

export default function Icon({
  icon: IconComponent,
  size = 'md',
  variant = 'default',
  className = '',
  animate = 'none',
  withBackground = false,
  backgroundShape = 'rounded',
  interactive = false,
  strokeWidth = 2
}: IconProps) {
  const iconSizeClass = sizeClasses[size];
  const variantStyle = variantClasses[variant];
  const animationClass = animationClasses[animate];

  const iconElement = (
    <IconComponent
      className={`
        ${iconSizeClass}
        ${variantStyle.icon}
        ${animationClass}
        transition-all duration-200 ease-in-out
        ${className}
      `.trim()}
      strokeWidth={strokeWidth}
      aria-hidden="true"
    />
  );

  if (withBackground) {
    const bgSizeClass = backgroundSizeClasses[size];
    const shapeClass = shapeClasses[backgroundShape];

    return (
      <div
        className={`
          ${bgSizeClass}
          ${variantStyle.bg}
          ${shapeClass}
          flex items-center justify-center
          transition-all duration-200 ease-in-out
          ${interactive ? 'hover:scale-105 cursor-pointer shadow-sm hover:shadow-md' : ''}
        `.trim()}
      >
        {iconElement}
      </div>
    );
  }

  return iconElement;
}

// Componente especializado para ícones de navegação
interface NavIconProps {
  icon: LucideIcon;
  isActive?: boolean;
  label?: string;
}

export function NavIcon({ icon: IconComponent, isActive = false }: NavIconProps) {
  return (
    <div className={`
      nav-icon-wrapper
      ${isActive ? 'nav-icon-active' : 'nav-icon-inactive'}
    `}>
      <IconComponent
        className="w-5 h-5 transition-all duration-200"
        strokeWidth={isActive ? 2.5 : 2}
        aria-hidden="true"
      />
    </div>
  );
}

// Componente para ícones de estatísticas/cards
interface StatIconProps {
  icon: LucideIcon;
  color: 'blue' | 'green' | 'emerald' | 'purple' | 'amber' | 'red' | 'sky';
}

const statColorClasses: Record<string, { icon: string; bg: string; gradient: string }> = {
  blue: {
    icon: 'text-blue-600',
    bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
    gradient: 'from-blue-500 to-blue-600'
  },
  green: {
    icon: 'text-green-600',
    bg: 'bg-gradient-to-br from-green-50 to-green-100',
    gradient: 'from-green-500 to-green-600'
  },
  emerald: {
    icon: 'text-emerald-600',
    bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
    gradient: 'from-emerald-500 to-emerald-600'
  },
  purple: {
    icon: 'text-purple-600',
    bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
    gradient: 'from-purple-500 to-purple-600'
  },
  amber: {
    icon: 'text-amber-600',
    bg: 'bg-gradient-to-br from-amber-50 to-amber-100',
    gradient: 'from-amber-500 to-amber-600'
  },
  red: {
    icon: 'text-red-600',
    bg: 'bg-gradient-to-br from-red-50 to-red-100',
    gradient: 'from-red-500 to-red-600'
  },
  sky: {
    icon: 'text-sky-600',
    bg: 'bg-gradient-to-br from-sky-50 to-sky-100',
    gradient: 'from-sky-500 to-sky-600'
  }
};

export function StatIcon({ icon: IconComponent, color }: StatIconProps) {
  const colorStyle = statColorClasses[color];

  return (
    <div className={`
      w-14 h-14
      ${colorStyle.bg}
      rounded-2xl
      flex items-center justify-center
      shadow-sm
      stat-icon-container
    `}>
      <IconComponent
        className={`w-7 h-7 ${colorStyle.icon} stat-icon`}
        strokeWidth={1.75}
        aria-hidden="true"
      />
    </div>
  );
}

// Componente para ícones de ação (botões)
interface ActionIconProps {
  icon: LucideIcon;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  tooltip?: string;
}

const actionVariantClasses: Record<string, string> = {
  primary: 'bg-sky-600 text-white hover:bg-sky-700 shadow-sm hover:shadow-md',
  secondary: 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800',
  danger: 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700',
  success: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700',
  ghost: 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
};

const actionSizeClasses: Record<string, { button: string; icon: string }> = {
  sm: { button: 'p-1.5', icon: 'w-4 h-4' },
  md: { button: 'p-2', icon: 'w-5 h-5' },
  lg: { button: 'p-2.5', icon: 'w-6 h-6' }
};

export function ActionIcon({
  icon: IconComponent,
  variant = 'ghost',
  size = 'md',
  onClick,
  disabled = false,
  tooltip
}: ActionIconProps) {
  const variantClass = actionVariantClasses[variant];
  const sizeStyle = actionSizeClasses[size];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={`
        ${sizeStyle.button}
        ${variantClass}
        rounded-lg
        transition-all duration-200 ease-in-out
        transform active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2
      `.trim()}
    >
      <IconComponent
        className={`${sizeStyle.icon} transition-transform duration-200`}
        strokeWidth={2}
        aria-hidden="true"
      />
    </button>
  );
}

// Componente para ícones de status/badge
interface StatusIconProps {
  icon: LucideIcon;
  status: 'success' | 'warning' | 'error' | 'info' | 'pending';
  showPulse?: boolean;
}

const statusColors: Record<string, { icon: string; bg: string; ring: string }> = {
  success: {
    icon: 'text-emerald-600',
    bg: 'bg-emerald-100',
    ring: 'ring-emerald-500'
  },
  warning: {
    icon: 'text-amber-600',
    bg: 'bg-amber-100',
    ring: 'ring-amber-500'
  },
  error: {
    icon: 'text-red-600',
    bg: 'bg-red-100',
    ring: 'ring-red-500'
  },
  info: {
    icon: 'text-blue-600',
    bg: 'bg-blue-100',
    ring: 'ring-blue-500'
  },
  pending: {
    icon: 'text-gray-600',
    bg: 'bg-gray-100',
    ring: 'ring-gray-500'
  }
};

export function StatusIcon({ icon: IconComponent, status, showPulse = false }: StatusIconProps) {
  const colorStyle = statusColors[status];

  return (
    <div className={`
      relative
      w-8 h-8
      ${colorStyle.bg}
      rounded-full
      flex items-center justify-center
    `}>
      <IconComponent
        className={`w-4 h-4 ${colorStyle.icon}`}
        strokeWidth={2}
        aria-hidden="true"
      />
      {showPulse && (
        <span className={`
          absolute -top-0.5 -right-0.5
          w-2.5 h-2.5
          bg-current ${colorStyle.icon}
          rounded-full
          animate-ping
        `} />
      )}
    </div>
  );
}

// Componente para logo/branding com ícone
interface BrandIconProps {
  icon: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const brandSizeClasses: Record<string, { container: string; icon: string }> = {
  sm: { container: 'w-10 h-10', icon: 'w-5 h-5' },
  md: { container: 'w-12 h-12', icon: 'w-6 h-6' },
  lg: { container: 'w-16 h-16', icon: 'w-8 h-8' }
};

export function BrandIcon({ icon: IconComponent, size = 'md', animated = true }: BrandIconProps) {
  const sizeStyle = brandSizeClasses[size];

  return (
    <div className={`
      ${sizeStyle.container}
      bg-gradient-to-br from-sky-500 to-sky-700
      rounded-xl
      flex items-center justify-center
      shadow-lg shadow-sky-500/25
      ${animated ? 'brand-icon-animated' : ''}
    `}>
      <IconComponent
        className={`${sizeStyle.icon} text-white drop-shadow-sm`}
        strokeWidth={2}
        aria-hidden="true"
      />
    </div>
  );
}

// Componente para ícones de formulário/input
interface InputIconProps {
  icon: LucideIcon;
  position?: 'left' | 'right';
  onClick?: () => void;
}

export function InputIcon({ icon: IconComponent, position = 'left', onClick }: InputIconProps) {
  const positionClass = position === 'left'
    ? 'left-3'
    : 'right-3';

  return (
    <div
      className={`
        absolute ${positionClass} top-1/2 -translate-y-1/2
        ${onClick ? 'cursor-pointer hover:text-sky-600' : ''}
        transition-colors duration-200
      `}
      onClick={onClick}
    >
      <IconComponent
        className="w-5 h-5 text-gray-400"
        strokeWidth={2}
        aria-hidden="true"
      />
    </div>
  );
}

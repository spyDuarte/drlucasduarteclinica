interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
};

export default function LoadingSpinner({ fullScreen = true, size = 'md' }: LoadingSpinnerProps) {
  const spinner = (
    <div
      className={`animate-spin rounded-full border-b-2 border-sky-600 ${sizeClasses[size]}`}
      role="status"
      aria-label="Carregando"
    />
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}

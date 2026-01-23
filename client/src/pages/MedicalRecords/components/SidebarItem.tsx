import type { ElementType } from 'react';

interface SidebarItemProps {
  label: string;
  icon: ElementType;
  active: boolean;
  onClick: () => void;
  hasError?: boolean;
}

export function SidebarItem({ label, icon: Icon, active, onClick, hasError }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      type="button"
      aria-current={active ? 'step' : undefined}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative
        ${active
          ? 'bg-primary-50 text-primary-700'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`}
    >
      {active && <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary-600 rounded-r-full" />}
      <div className="flex items-center gap-3 ml-1">
        <Icon className={`w-4 h-4 ${active ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}`} aria-hidden="true" />
        <span>{label}</span>
      </div>
      {hasError && (
        <div
          className="w-2 h-2 rounded-full bg-red-500 shadow-sm animate-pulse"
          aria-label="Contém erros"
          title="Existem erros nesta seção"
        />
      )}
    </button>
  );
}

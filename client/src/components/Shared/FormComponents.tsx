import { ChevronUp, ChevronDown } from 'lucide-react';
import type { ReactNode, ElementType } from 'react';

// ==========================================
// Layout Components
// ==========================================

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ElementType;
}

export function SectionHeader({ title, subtitle, icon: Icon }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3 pb-2 border-b border-slate-200/60 mb-4">
      {Icon && (
        <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div>
        <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}

interface FormSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function FormSection({ title, children, className = "" }: FormSectionProps) {
  return (
    <div className={className}>
      <h3 className="text-sm font-medium text-gray-700 mb-3">{title}</h3>
      {children}
    </div>
  );
}

interface CollapsibleSectionProps {
  title: string;
  icon?: ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function CollapsibleSection({ title, icon, isExpanded, onToggle, children }: CollapsibleSectionProps) {
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white mb-4">
      <button type="button" onClick={onToggle} className="w-full px-4 py-3 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-semibold text-slate-700">{title}</span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {isExpanded && <div className="p-4 border-t border-slate-200">{children}</div>}
    </div>
  );
}

// ==========================================
// Input Components
// ==========================================

interface InputFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  error?: string;
  errorId?: string; // For accessibility
  isSmall?: boolean;
}

export function InputField({ label, value, onChange, error, errorId, isSmall = false, className = "", ...props }: InputFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={props.id} className={`block ${isSmall ? 'text-xs font-bold text-slate-500 uppercase tracking-wide' : 'text-sm font-medium text-slate-700'} mb-1.5`}>
        {label} {props.required && <span className="text-red-500">*</span>}
      </label>
      <input
        {...props}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`input-field w-full ${isSmall ? 'text-sm' : ''} ${error ? 'border-red-500 focus:ring-red-500' : ''} ${props.disabled ? 'bg-gray-50 text-gray-500' : ''}`}
        aria-invalid={!!error}
        aria-describedby={error && errorId ? errorId : undefined}
      />
      {error && <p id={errorId} className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

interface TextAreaFieldProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  rows?: number;
}

export function TextAreaField({ label, value, onChange, error, rows = 3, className = "", ...props }: TextAreaFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={props.id} className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {props.required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        {...props}
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        className={`input-field w-full ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

interface SelectFieldProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  error?: string;
  isSmall?: boolean;
}

export function SelectField({ label, value, onChange, options, error, isSmall = false, className = "", ...props }: SelectFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={props.id} className={`block ${isSmall ? 'text-xs font-bold text-slate-500 uppercase tracking-wide' : 'text-sm font-medium text-slate-700'} mb-1.5`}>
        {label} {props.required && <span className="text-red-500">*</span>}
      </label>
      <select
        {...props}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`input-field w-full ${isSmall ? 'text-sm' : ''} ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

interface NumberFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  error?: string;
}

export function NumberField({ label, value, onChange, error, className = "", ...props }: NumberFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={props.id} className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
        {label} {props.required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="number"
        {...props}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`input-field w-full text-sm ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

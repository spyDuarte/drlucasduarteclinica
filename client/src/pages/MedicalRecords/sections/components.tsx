import { ChevronUp, ChevronDown } from 'lucide-react';
import type { ReactNode, ElementType } from 'react';

// Reusable UI components for sections

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon: ElementType;
}

export function SectionHeader({ title, subtitle, icon: Icon }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3 pb-2 border-b border-slate-200/60">
      <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}

interface InputFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  isSmall?: boolean;
}

export function InputField({ label, value, onChange, placeholder, required, isSmall = true }: InputFieldProps) {
  return (
    <div>
      <label className={`block ${isSmall ? 'text-xs font-bold text-slate-500 uppercase tracking-wide' : 'text-sm font-medium text-slate-700'} mb-1.5`}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input-field w-full text-sm"
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

interface NumberFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

export function NumberField({ label, value, onChange, min, max, step, placeholder }: NumberFieldProps) {
  return (
    <div>
      {label && <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">{label}</label>}
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input-field w-full text-sm"
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
      />
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  isSmall?: boolean;
}

export function SelectField({ label, value, onChange, options, isSmall = true }: SelectFieldProps) {
  return (
    <div>
      <label className={`block ${isSmall ? 'text-xs font-bold text-slate-500 uppercase tracking-wide' : 'text-sm font-medium text-slate-700'} mb-1.5`}>{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input-field w-full text-sm"
      >
        {options.map((opt: { value: string; label: string }) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

interface CollapsibleSectionProps {
  title: string;
  icon: ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function CollapsibleSection({ title, icon, isExpanded, onToggle, children }: CollapsibleSectionProps) {
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
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

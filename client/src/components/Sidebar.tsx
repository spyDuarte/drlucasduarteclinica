import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../types';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  DollarSign,
  BarChart3,
  Stethoscope,
  Activity,
  X,
  Sparkles,
  FileSignature
} from 'lucide-react';
import { BrandIcon, NavIcon } from './Icon';

const menuItems: Array<{
  path: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: UserRole[];
}> = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['medico', 'secretaria'] },
  { path: '/pacientes', label: 'Pacientes', icon: Users, roles: ['medico', 'secretaria'] },
  { path: '/agenda', label: 'Agenda', icon: Calendar, roles: ['medico', 'secretaria'] },
  { path: '/prontuarios', label: 'Prontuários', icon: FileText, roles: ['medico'] },
  { path: '/documentos', label: 'Documentos', icon: FileSignature, roles: ['medico'] },
  { path: '/financeiro', label: 'Financeiro', icon: DollarSign, roles: ['medico', 'secretaria'] },
  { path: '/relatorios', label: 'Relatórios', icon: BarChart3, roles: ['medico'] },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, hasPermission } = useAuth();

  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 bg-white/95 backdrop-blur-xl border-r border-slate-200/60 flex flex-col
        shadow-xl shadow-slate-900/5
        transform transition-all duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-50/40 via-transparent to-medical-50/30 pointer-events-none" />

      {/* Logo */}
      <div className="relative p-6 border-b border-slate-100/80">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <BrandIcon icon={Stethoscope} size="md" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-medical-400 to-medical-500 rounded-full flex items-center justify-center shadow-sm">
                <Sparkles className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="font-bold text-slate-900 tracking-tight text-lg">Dr. Lucas Duarte</h1>
              <div className="flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-medical-500 animate-pulse" />
                <p className="text-xs text-slate-500 font-medium">Sistema Médico</p>
              </div>
            </div>
          </div>
          {/* Close button - Mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden p-2.5 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:rotate-90"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 p-4 space-y-1">
        <div className="flex items-center gap-2 px-3 mb-4">
          <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Menu
          </p>
          <div className="h-px flex-1 bg-gradient-to-l from-slate-200 to-transparent" />
        </div>
        {menuItems.map(item => {
          const hasAccess = hasPermission(item.roles);
          if (!hasAccess) return null;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => onClose()}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  <NavIcon icon={item.icon} isActive={isActive} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User info */}
      <div className="relative p-4 border-t border-slate-100/80">
        <div className="p-3 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25 ring-2 ring-white">
                <span className="text-base font-bold text-white">
                  {user?.nome?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-gradient-to-br from-medical-400 to-medical-500 rounded-full border-[2.5px] border-white shadow-sm flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-white rounded-full" />
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">
                {user?.nome}
              </p>
              <p className="text-xs text-slate-500 capitalize flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 bg-gradient-to-r from-primary-400 to-primary-500 rounded-full" />
                {user?.role === 'medico' ? 'Médico' : 'Secretária'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

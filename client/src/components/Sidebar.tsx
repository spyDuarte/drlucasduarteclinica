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
  X,
  FileSignature
} from 'lucide-react';

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
        w-64 bg-white border-r border-slate-200 flex flex-col
        shadow-sm
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      {/* Logo */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-semibold text-slate-900 text-sm leading-tight">Dr. Lucas Duarte</h1>
            <p className="text-xs text-slate-500">Clínica Médica</p>
          </div>
        </div>
        {/* Close button - Mobile only */}
        <button
          onClick={onClose}
          className="lg:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md"
          aria-label="Fechar menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <div className="px-3 mb-2 mt-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Menu Principal
          </p>
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
                `sidebar-link group ${isActive ? 'active' : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span className="font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm">
            {user?.nome?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {user?.nome}
            </p>
            <p className="text-xs text-slate-500 capitalize">
              {user?.role === 'medico' ? 'Médico' : 'Secretária'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

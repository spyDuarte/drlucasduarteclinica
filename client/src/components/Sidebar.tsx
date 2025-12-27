import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  DollarSign,
  BarChart3,
  Stethoscope,
  Activity
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
  { path: '/financeiro', label: 'Financeiro', icon: DollarSign, roles: ['medico', 'secretaria'] },
  { path: '/relatorios', label: 'Relatórios', icon: BarChart3, roles: ['medico'] },
];

export default function Sidebar() {
  const { user, hasPermission } = useAuth();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <BrandIcon icon={Stethoscope} size="md" />
          <div>
            <h1 className="font-bold text-gray-900 tracking-tight">Dr. Lucas Duarte</h1>
            <div className="flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-emerald-500" />
              <p className="text-xs text-gray-500">Sistema Médico</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5">
        <p className="px-3 mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Menu Principal
        </p>
        {menuItems.map(item => {
          const hasAccess = hasPermission(item.roles);
          if (!hasAccess) return null;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  <NavIcon icon={item.icon} isActive={isActive} />
                  <span className="font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-transparent">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center shadow-md shadow-sky-500/20">
              <span className="text-sm font-bold text-white">
                {user?.nome?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.nome}
            </p>
            <p className="text-xs text-gray-500 capitalize flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-sky-500 rounded-full" />
              {user?.role === 'medico' ? 'Médico' : 'Secretária'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

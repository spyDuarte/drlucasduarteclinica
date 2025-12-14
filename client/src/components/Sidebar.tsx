import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  DollarSign,
  BarChart3,
  Stethoscope
} from 'lucide-react';

const menuItems = [
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
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-600 rounded-lg flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">Dr. Lucas Duarte</h1>
            <p className="text-xs text-gray-500">Sistema de Gestão</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map(item => {
          const hasAccess = hasPermission(item.roles as any);
          if (!hasAccess) return null;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">
              {user?.nome?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.nome}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role === 'medico' ? 'Médico' : 'Secretária'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

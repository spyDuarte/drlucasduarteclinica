import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Bell, Search, CalendarDays, Sparkles, Menu } from 'lucide-react';
import { formatRelativeDate } from '../utils/helpers';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const today = new Date();
  const formattedDate = today.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 shadow-sm">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Abrir menu"
      >
        <Menu className="w-6 h-6 text-gray-600" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-lg hidden md:block">
        <div className="relative input-icon-wrapper group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors duration-200 group-focus-within:text-sky-500" />
          <input
            type="text"
            placeholder="Buscar pacientes, consultas..."
            className="search-input w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:bg-white outline-none transition-all duration-200 text-sm"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden group-focus-within:flex items-center gap-1 text-xs text-gray-400">
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 font-mono">⌘</kbd>
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 font-mono">K</kbd>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1 md:gap-2">
        {/* Date Badge - Hidden on mobile */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg border border-sky-100">
          <CalendarDays className="w-4 h-4 text-sky-600" />
          <span className="text-sm font-medium text-gray-700">
            {formatRelativeDate(today)}
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-sm text-gray-600">
            {formattedDate}
          </span>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-8 bg-gray-200 mx-2" />

        {/* Notifications */}
        <button
          className="header-icon relative group"
          title="Notificações"
        >
          <Bell className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
          <span className="notification-dot" />
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white shadow-sm">
            3
          </span>
        </button>

        {/* Quick Actions - Hidden on small screens */}
        <button
          className="header-icon group hidden sm:flex"
          title="Ações rápidas"
        >
          <Sparkles className="w-5 h-5 transition-transform duration-200 group-hover:scale-110 group-hover:text-amber-500" />
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="logout-icon-btn group"
          title="Sair do sistema"
        >
          <LogOut className="w-5 h-5 transition-all duration-200" />
          <span className="hidden md:inline text-sm font-medium">Sair</span>
        </button>
      </div>
    </header>
  );
}

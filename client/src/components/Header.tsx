import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Bell, Search, CalendarDays, Sparkles, Menu, Command } from 'lucide-react';
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
    weekday: 'long',
    day: '2-digit',
    month: 'long'
  });

  return (
    <header className="h-[72px] bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-4 md:px-6 lg:px-8 shadow-sm shadow-slate-900/5">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2.5 hover:bg-slate-100 rounded-xl transition-all duration-200 active:scale-95"
        aria-label="Abrir menu"
      >
        <Menu className="w-6 h-6 text-slate-600" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-xl hidden md:block">
        <div className="relative input-icon-wrapper group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-all duration-200 group-focus-within:text-primary-500 group-focus-within:scale-110" />
          <input
            type="text"
            placeholder="Buscar pacientes, consultas..."
            className="search-input w-full pl-12 pr-24 py-3 bg-slate-50/80 border border-slate-200/80 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 focus:bg-white outline-none transition-all duration-200 text-sm font-medium placeholder:text-slate-400"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs opacity-60 group-focus-within:opacity-100 transition-opacity">
            <kbd className="px-2 py-1 bg-slate-100 rounded-lg text-slate-500 font-medium flex items-center gap-0.5 border border-slate-200/50">
              <Command className="w-3 h-3" />
              <span>K</span>
            </kbd>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Date Badge - Hidden on mobile */}
        <div className="hidden xl:flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-2xl border border-primary-100/60">
          <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <CalendarDays className="w-4 h-4 text-primary-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-primary-600 uppercase tracking-wide">
              {formatRelativeDate(today)}
            </span>
            <span className="text-sm text-slate-600 capitalize">
              {formattedDate}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-10 bg-gradient-to-b from-transparent via-slate-200 to-transparent mx-1" />

        {/* Notifications */}
        <button
          className="relative p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all duration-200 group active:scale-95"
          title="Notificações"
        >
          <Bell className="w-5 h-5 text-slate-600 transition-transform duration-200 group-hover:scale-110 group-hover:text-slate-700" />
          <span className="absolute top-1 right-1 min-w-[20px] h-[20px] flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br from-rose-500 to-rose-600 rounded-full border-2 border-white shadow-lg shadow-rose-500/30 animate-pulse">
            3
          </span>
        </button>

        {/* Quick Actions - Hidden on small screens */}
        <button
          className="hidden sm:flex p-2.5 rounded-xl bg-slate-50 hover:bg-gradient-to-br hover:from-amber-50 hover:to-orange-50 transition-all duration-200 group active:scale-95"
          title="Ações rápidas"
        >
          <Sparkles className="w-5 h-5 text-slate-600 transition-all duration-200 group-hover:scale-110 group-hover:text-amber-500" />
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-all duration-200 group active:scale-95"
          title="Sair do sistema"
        >
          <LogOut className="w-5 h-5 transition-all duration-200 group-hover:translate-x-0.5" />
          <span className="hidden md:inline text-sm font-semibold">Sair</span>
        </button>
      </div>
    </header>
  );
}

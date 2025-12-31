import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { LogOut, Bell, Search, CalendarDays, Sparkles, Menu, Command, X, User, Calendar, Clock, DollarSign } from 'lucide-react';
import { formatRelativeDate, formatCurrency } from '../utils/helpers';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { logout } = useAuth();
  const { getTodayAppointments, getPendingPayments, searchPatients } = useData();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);

  // Busca de pacientes
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return searchPatients(searchTerm).slice(0, 5);
  }, [searchTerm, searchPatients]);

  // Notificações reais
  const todayAppointments = getTodayAppointments();
  const pendingPayments = getPendingPayments();

  const notifications = useMemo(() => {
    const items = [];

    if (todayAppointments.length > 0) {
      items.push({
        id: 'appointments',
        type: 'info' as const,
        icon: Calendar,
        title: `${todayAppointments.length} consulta${todayAppointments.length > 1 ? 's' : ''} hoje`,
        description: `Próxima: ${todayAppointments[0]?.horaInicio}`,
        link: '/agenda'
      });
    }

    if (pendingPayments.length > 0) {
      const totalPending = pendingPayments.reduce((sum, p) => sum + p.valor, 0);
      items.push({
        id: 'payments',
        type: 'warning' as const,
        icon: DollarSign,
        title: `${pendingPayments.length} pagamento${pendingPayments.length > 1 ? 's' : ''} pendente${pendingPayments.length > 1 ? 's' : ''}`,
        description: formatCurrency(totalPending),
        link: '/financeiro'
      });
    }

    return items;
  }, [todayAppointments, pendingPayments]);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target as Node)) {
        setShowQuickActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Atalho de teclado Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = searchRef.current?.querySelector('input');
        searchInput?.focus();
      }
      if (event.key === 'Escape') {
        setIsSearchFocused(false);
        setShowNotifications(false);
        setShowQuickActions(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePatientSelect = (patientId: string) => {
    setSearchTerm('');
    setIsSearchFocused(false);
    navigate(`/pacientes/${patientId}`);
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
      <div className="flex-1 max-w-xl hidden md:block" ref={searchRef}>
        <div className="relative input-icon-wrapper group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-all duration-200 group-focus-within:text-primary-500 group-focus-within:scale-110 z-10" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="Buscar pacientes..."
            className="search-input w-full pl-12 pr-24 py-3 bg-slate-50/80 border border-slate-200/80 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 focus:bg-white outline-none transition-all duration-200 text-sm font-medium placeholder:text-slate-400"
          />
          {searchTerm ? (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          ) : (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs opacity-60 group-focus-within:opacity-100 transition-opacity">
              <kbd className="px-2 py-1 bg-slate-100 rounded-lg text-slate-500 font-medium flex items-center gap-0.5 border border-slate-200/50">
                <Command className="w-3 h-3" />
                <span>K</span>
              </kbd>
            </div>
          )}

          {/* Search Results Dropdown */}
          {isSearchFocused && searchTerm && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-fade-in">
              {searchResults.length > 0 ? (
                <ul className="py-2">
                  {searchResults.map(patient => (
                    <li key={patient.id}>
                      <button
                        onClick={() => handlePatientSelect(patient.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl flex items-center justify-center">
                          <User className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{patient.nome}</p>
                          <p className="text-sm text-slate-500">{patient.telefone}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-slate-500">
                  <p className="text-sm">Nenhum paciente encontrado</p>
                </div>
              )}
              <div className="border-t border-slate-100 px-4 py-2 bg-slate-50">
                <Link
                  to="/pacientes"
                  onClick={() => setIsSearchFocused(false)}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  Ver todos os pacientes
                </Link>
              </div>
            </div>
          )}
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
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all duration-200 group active:scale-95"
            title="Notificações"
          >
            <Bell className="w-5 h-5 text-slate-600 transition-transform duration-200 group-hover:scale-110 group-hover:text-slate-700" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 min-w-[20px] h-[20px] flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br from-rose-500 to-rose-600 rounded-full border-2 border-white shadow-lg shadow-rose-500/30">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-fade-in">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                <h3 className="font-semibold text-slate-900">Notificações</h3>
              </div>
              {notifications.length > 0 ? (
                <ul className="py-2">
                  {notifications.map(notification => (
                    <li key={notification.id}>
                      <Link
                        to={notification.link}
                        onClick={() => setShowNotifications(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          notification.type === 'warning'
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-primary-100 text-primary-600'
                        }`}>
                          <notification.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 text-sm">{notification.title}</p>
                          <p className="text-xs text-slate-500">{notification.description}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500">Nenhuma notificação</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions - Hidden on small screens */}
        <div className="relative hidden sm:block" ref={quickActionsRef}>
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-gradient-to-br hover:from-amber-50 hover:to-orange-50 transition-all duration-200 group active:scale-95"
            title="Ações rápidas"
          >
            <Sparkles className="w-5 h-5 text-slate-600 transition-all duration-200 group-hover:scale-110 group-hover:text-amber-500" />
          </button>

          {/* Quick Actions Dropdown */}
          {showQuickActions && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-fade-in">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                <h3 className="font-semibold text-slate-900">Ações Rápidas</h3>
              </div>
              <ul className="py-2">
                <li>
                  <Link
                    to="/pacientes"
                    onClick={() => setShowQuickActions(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-700">Novo Paciente</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/agenda"
                    onClick={() => setShowQuickActions(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                  >
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-700">Agendar Consulta</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/financeiro"
                    onClick={() => setShowQuickActions(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                  >
                    <DollarSign className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-700">Registrar Pagamento</span>
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>

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

import { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  UserPlus,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Activity
} from 'lucide-react';
import { formatCurrency, translateAppointmentStatus, getStatusColor } from '../utils/helpers';

export default function Dashboard() {
  const { getDashboardStats, getAppointmentsByDate, patients } = useData();
  const { user } = useAuth();

  // Memoizar stats para evitar recálculo desnecessário
  const stats = useMemo(() => getDashboardStats(), [getDashboardStats]);

  // Memoizar consultas do dia
  const todayAppointments = useMemo(() => {
    return getAppointmentsByDate(new Date().toISOString().split('T')[0]);
  }, [getAppointmentsByDate]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const statCards = [
    {
      label: 'Consultas Hoje',
      value: stats.consultasHoje,
      icon: Calendar,
      color: 'blue' as const,
      trend: '+12%',
      trendUp: true,
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50'
    },
    {
      label: 'Pacientes Total',
      value: stats.pacientesTotal,
      icon: Users,
      color: 'green' as const,
      trend: '+5',
      trendUp: true,
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50'
    },
    {
      label: 'Receita do Mês',
      value: formatCurrency(stats.receitaMes),
      icon: DollarSign,
      color: 'emerald' as const,
      trend: '+8%',
      trendUp: true,
      gradient: 'from-violet-500 to-purple-600',
      bgGradient: 'from-violet-50 to-purple-50'
    },
    {
      label: 'Taxa de Comparecimento',
      value: `${stats.taxaComparecimento.toFixed(0)}%`,
      icon: TrendingUp,
      color: 'purple' as const,
      trend: '+3%',
      trendUp: true,
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-50 to-orange-50'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-semibold text-amber-600 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1 rounded-full border border-amber-100">
              {getGreeting()}!
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            Olá, <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">{user?.nome?.split(' ')[0]}</span>!
          </h1>
          <p className="text-slate-500 text-lg">
            Aqui está o resumo do seu consultório
          </p>
        </div>
        <Link
          to="/agenda"
          className="btn-primary py-3 px-5 text-base group shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30"
        >
          <Calendar className="w-5 h-5" />
          <span>Ver Agenda Completa</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        {statCards.map((stat, index) => (
          <div
            key={stat.label}
            className="group relative bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 cursor-default overflow-hidden"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Background gradient effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

            {/* Decorative element */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-full group-hover:opacity-10 group-hover:scale-150 transition-all duration-500`} />

            <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div className="space-y-2 md:space-y-3">
                <div className={`w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br ${stat.gradient} rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <stat.icon className="w-5 h-5 md:w-7 md:h-7 text-white" />
                </div>
                <div>
                  <p className="text-xl md:text-3xl font-bold text-slate-900 group-hover:text-slate-800 transition-colors">
                    {stat.value}
                  </p>
                  <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5 line-clamp-1">{stat.label}</p>
                </div>
              </div>

              <div className={`hidden sm:flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-full ${stat.trendUp ? 'text-emerald-700 bg-emerald-100' : 'text-rose-700 bg-rose-100'}`}>
                <TrendingUp className={`w-3.5 h-3.5 ${!stat.trendUp && 'rotate-180'}`} />
                {stat.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Consultas de Hoje</h2>
                  <p className="text-xs text-slate-500">{todayAppointments.length} agendamento{todayAppointments.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <Link to="/agenda" className="text-sm text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1.5 group px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-all">
                Ver todas
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          <div className="p-6">
            {todayAppointments.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl flex items-center justify-center">
                  <Calendar className="w-10 h-10 text-slate-300" />
                </div>
                <p className="font-semibold text-slate-700">Nenhuma consulta agendada</p>
                <p className="text-sm text-slate-400 mt-1">Aproveite para organizar sua agenda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayAppointments.slice(0, 5).map((appointment, index) => {
                  const patient = patients.find(p => p.id === appointment.patientId);
                  return (
                    <div
                      key={appointment.id}
                      className="flex items-center gap-4 p-4 bg-slate-50/50 hover:bg-gradient-to-r hover:from-primary-50 hover:to-transparent rounded-xl transition-all duration-200 cursor-pointer group border border-transparent hover:border-primary-100"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="text-center min-w-[68px] py-2.5 px-3 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:border-primary-200 group-hover:shadow-md transition-all">
                        <p className="text-base font-bold text-slate-900">
                          {appointment.horaInicio}
                        </p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">
                          até {appointment.horaFim}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate group-hover:text-primary-700 transition-colors">
                          {patient?.nome || 'Paciente não encontrado'}
                        </p>
                        <p className="text-sm text-slate-500 truncate mt-0.5">
                          {appointment.motivo || 'Consulta de rotina'}
                        </p>
                      </div>
                      <span className={`status-badge ${getStatusColor(appointment.status)}`}>
                        {translateAppointmentStatus(appointment.status)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Resumo Rápido</h2>
                <p className="text-xs text-slate-500">Métricas do período</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 via-primary-50/50 to-transparent rounded-xl hover:shadow-md transition-all duration-200 cursor-default group border border-primary-100/50">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all ring-1 ring-primary-100">
                  <Clock className="w-5 h-5 text-primary-600" />
                </div>
                <span className="text-slate-700 font-semibold">Consultas esta semana</span>
              </div>
              <span className="text-2xl font-bold text-slate-900">{stats.consultasSemana}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 via-emerald-50/50 to-transparent rounded-xl hover:shadow-md transition-all duration-200 cursor-default group border border-emerald-100/50">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all ring-1 ring-emerald-100">
                  <UserPlus className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-slate-700 font-semibold">Novos pacientes (mês)</span>
              </div>
              <span className="text-2xl font-bold text-slate-900">{stats.pacientesNovos}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 via-amber-50/50 to-transparent rounded-xl hover:shadow-md transition-all duration-200 cursor-default group border border-amber-100/50">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all ring-1 ring-amber-100">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <span className="text-slate-700 font-semibold">Pagamentos pendentes</span>
              </div>
              <span className="text-2xl font-bold text-amber-600">{formatCurrency(stats.receitaPendente)}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-50 via-violet-50/50 to-transparent rounded-xl hover:shadow-md transition-all duration-200 cursor-default group border border-violet-100/50">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all ring-1 ring-violet-100">
                  <CheckCircle className="w-5 h-5 text-violet-600" />
                </div>
                <span className="text-slate-700 font-semibold">Consultas no mês</span>
              </div>
              <span className="text-2xl font-bold text-slate-900">{stats.consultasMes}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

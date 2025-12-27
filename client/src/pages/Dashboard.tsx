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
  Zap
} from 'lucide-react';
import { formatCurrency, translateAppointmentStatus, getStatusColor } from '../utils/helpers';
import { StatIcon } from '../components/Icon';

export default function Dashboard() {
  const { getDashboardStats, getAppointmentsByDate, patients } = useData();
  const { user } = useAuth();
  const stats = getDashboardStats();
  const todayAppointments = getAppointmentsByDate(new Date().toISOString().split('T')[0]);

  const statCards = [
    {
      label: 'Consultas Hoje',
      value: stats.consultasHoje,
      icon: Calendar,
      color: 'blue' as const,
      trend: '+12%',
      trendUp: true
    },
    {
      label: 'Pacientes Total',
      value: stats.pacientesTotal,
      icon: Users,
      color: 'green' as const,
      trend: '+5',
      trendUp: true
    },
    {
      label: 'Receita do Mês',
      value: formatCurrency(stats.receitaMes),
      icon: DollarSign,
      color: 'emerald' as const,
      trend: '+8%',
      trendUp: true
    },
    {
      label: 'Taxa de Comparecimento',
      value: `${stats.taxaComparecimento.toFixed(0)}%`,
      icon: TrendingUp,
      color: 'purple' as const,
      trend: '+3%',
      trendUp: true
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              Bom dia!
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Olá, {user?.nome?.split(' ')[0]}!
          </h1>
          <p className="text-slate-600">
            Aqui está o resumo do seu consultório
          </p>
        </div>
        <Link to="/agenda" className="btn-primary flex items-center gap-2 group shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-200">
          <Calendar className="w-5 h-5" />
          <span>Ver Agenda</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map(stat => (
          <div key={stat.label} className="card stat-card flex items-center gap-4 hover:shadow-lg transition-all duration-300 cursor-default group">
            <StatIcon icon={stat.icon} color={stat.color} />
            <div className="flex-1">
              <p className="text-2xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{stat.value}</p>
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
            </div>
            <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${stat.trendUp ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
              <TrendingUp className={`w-3 h-3 ${!stat.trendUp && 'rotate-180'}`} />
              {stat.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-primary-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Consultas de Hoje</h2>
            </div>
            <Link to="/agenda" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 group">
              Ver todas
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <div className="w-16 h-16 mx-auto mb-3 bg-slate-100 rounded-2xl flex items-center justify-center">
                <Calendar className="w-8 h-8 empty-state-icon" />
              </div>
              <p className="font-medium text-slate-600">Nenhuma consulta agendada</p>
              <p className="text-sm text-slate-400 mt-1">Aproveite para organizar sua agenda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.slice(0, 5).map(appointment => {
                const patient = patients.find(p => p.id === appointment.patientId);
                return (
                  <div
                    key={appointment.id}
                    className="flex items-center gap-4 p-3 bg-gradient-to-r from-slate-50 to-transparent rounded-xl hover:from-primary-50 hover:to-transparent transition-all duration-200 cursor-pointer group"
                  >
                    <div className="text-center min-w-[60px] py-2 px-3 bg-white rounded-lg shadow-sm border border-slate-100 group-hover:border-primary-200 group-hover:shadow-md transition-all">
                      <p className="text-sm font-bold text-slate-900">
                        {appointment.horaInicio}
                      </p>
                      <p className="text-xs text-slate-400">
                        até {appointment.horaFim}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate group-hover:text-primary-700 transition-colors">
                        {patient?.nome || 'Paciente não encontrado'}
                      </p>
                      <p className="text-sm text-slate-500 truncate">
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

        {/* Quick Stats */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-violet-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Resumo Rápido</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-primary-50/50 rounded-xl hover:shadow-md transition-all duration-200 cursor-default group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow group-hover:scale-105 transition-all">
                  <Clock className="w-5 h-5 text-primary-600" />
                </div>
                <span className="text-slate-700 font-medium">Consultas esta semana</span>
              </div>
              <span className="text-xl font-bold text-slate-900">{stats.consultasSemana}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-medical-50 to-medical-50/50 rounded-xl hover:shadow-md transition-all duration-200 cursor-default group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow group-hover:scale-105 transition-all">
                  <UserPlus className="w-5 h-5 text-medical-600" />
                </div>
                <span className="text-slate-700 font-medium">Novos pacientes (mês)</span>
              </div>
              <span className="text-xl font-bold text-slate-900">{stats.pacientesNovos}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-amber-50/50 rounded-xl hover:shadow-md transition-all duration-200 cursor-default group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow group-hover:scale-105 transition-all">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <span className="text-slate-700 font-medium">Pagamentos pendentes</span>
              </div>
              <span className="text-xl font-bold text-amber-600">{formatCurrency(stats.receitaPendente)}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-50 to-violet-50/50 rounded-xl hover:shadow-md transition-all duration-200 cursor-default group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow group-hover:scale-105 transition-all">
                  <CheckCircle className="w-5 h-5 text-violet-600" />
                </div>
                <span className="text-slate-700 font-medium">Consultas no mês</span>
              </div>
              <span className="text-xl font-bold text-slate-900">{stats.consultasMes}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  CheckCircle
} from 'lucide-react';
import { formatCurrency, translateAppointmentStatus, getStatusColor } from '../utils/helpers';

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
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Pacientes Total',
      value: stats.pacientesTotal,
      icon: Users,
      color: 'bg-green-500',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Receita do Mês',
      value: formatCurrency(stats.receitaMes),
      icon: DollarSign,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50'
    },
    {
      label: 'Taxa de Comparecimento',
      value: `${stats.taxaComparecimento.toFixed(0)}%`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Olá, {user?.nome?.split(' ')[0]}!
          </h1>
          <p className="text-gray-600">
            Aqui está o resumo do seu consultório
          </p>
        </div>
        <Link to="/agenda" className="btn-primary flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Ver Agenda
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(stat => (
          <div key={stat.label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 text-${stat.color.replace('bg-', '')}`} style={{ color: stat.color.includes('blue') ? '#3b82f6' : stat.color.includes('green') ? '#22c55e' : stat.color.includes('emerald') ? '#10b981' : '#a855f7' }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Consultas de Hoje</h2>
            <Link to="/agenda" className="text-sm text-sky-600 hover:text-sky-700">
              Ver todas
            </Link>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma consulta agendada para hoje</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.slice(0, 5).map(appointment => {
                const patient = patients.find(p => p.id === appointment.patientId);
                return (
                  <div
                    key={appointment.id}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="text-center min-w-[60px]">
                      <p className="text-sm font-semibold text-gray-900">
                        {appointment.horaInicio}
                      </p>
                      <p className="text-xs text-gray-500">
                        {appointment.horaFim}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {patient?.nome || 'Paciente não encontrado'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {appointment.motivo || 'Sem motivo informado'}
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700">Consultas esta semana</span>
              </div>
              <span className="font-semibold text-gray-900">{stats.consultasSemana}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <UserPlus className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Novos pacientes (mês)</span>
              </div>
              <span className="font-semibold text-gray-900">{stats.pacientesNovos}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="text-gray-700">Pagamentos pendentes</span>
              </div>
              <span className="font-semibold text-gray-900">{formatCurrency(stats.receitaPendente)}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <span className="text-gray-700">Consultas no mês</span>
              </div>
              <span className="font-semibold text-gray-900">{stats.consultasMes}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

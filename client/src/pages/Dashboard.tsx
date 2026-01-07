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
  Activity,
  CalendarPlus,
  FileText,
  Stethoscope
} from 'lucide-react';
import { formatCurrency, translateAppointmentStatus } from '../utils/helpers';

export default function Dashboard() {
  const { dashboardStats: stats, getAppointmentsByDate, patients } = useData();
  const { user } = useAuth();

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
      trend: '+12%',
      trendUp: true,
      colorClass: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Pacientes Total',
      value: stats.pacientesTotal,
      icon: Users,
      trend: '+5',
      trendUp: true,
      colorClass: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'Receita do Mês',
      value: formatCurrency(stats.receitaMes),
      icon: DollarSign,
      trend: '+8%',
      trendUp: true,
      colorClass: 'text-violet-600 bg-violet-50',
    },
    {
      label: 'Taxa de Comparecimento',
      value: `${stats.taxaComparecimento.toFixed(0)}%`,
      icon: TrendingUp,
      trend: '+3%',
      trendUp: true,
      colorClass: 'text-amber-600 bg-amber-50',
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {getGreeting()}, Dr. {user?.nome?.split(' ')[0]}
          </h1>
          <p className="text-slate-500">
            Resumo das atividades do consultório.
          </p>
        </div>
        <Link
          to="/agenda"
          className="btn-primary"
        >
          <Calendar className="w-4 h-4" />
          <span>Ver Agenda</span>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/pacientes?action=new"
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-primary-300 hover:shadow-md transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center group-hover:bg-primary-100 transition-colors">
            <UserPlus className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 group-hover:text-primary-700 transition-colors">Novo Paciente</h3>
            <p className="text-sm text-slate-500">Cadastrar paciente</p>
          </div>
        </Link>

        <Link
          to="/agenda?action=new"
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-primary-300 hover:shadow-md transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center group-hover:bg-primary-100 transition-colors">
            <CalendarPlus className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 group-hover:text-primary-700 transition-colors">Agendar Consulta</h3>
            <p className="text-sm text-slate-500">Novo agendamento</p>
          </div>
        </Link>

        <Link
          to="/pacientes"
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-primary-300 hover:shadow-md transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center group-hover:bg-primary-100 transition-colors">
            <FileText className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 group-hover:text-primary-700 transition-colors">Prontuários</h3>
            <p className="text-sm text-slate-500">Buscar registros</p>
          </div>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="card p-5 flex flex-col justify-between h-full hover:border-primary-200 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2.5 rounded-lg ${stat.colorClass}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${stat.trendUp ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>
                 <TrendingUp className={`w-3 h-3 ${!stat.trendUp && 'rotate-180'}`} />
                 {stat.trend}
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Appointments - Takes up 2/3 */}
        <div className="lg:col-span-2 card p-0 overflow-hidden flex flex-col h-full">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
             <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-slate-400" />
                <h2 className="font-bold text-slate-800">Consultas de Hoje</h2>
             </div>
             <Link to="/agenda" className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline">
               Ver todas
             </Link>
          </div>

          <div className="p-0">
             {todayAppointments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500">Nenhuma consulta agendada para hoje.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {todayAppointments.slice(0, 5).map((appointment) => {
                   const patient = patients.find(p => p.id === appointment.patientId);
                   return (
                     <div key={appointment.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center gap-4">
                        <div className="text-center px-3 py-1.5 bg-slate-100 rounded text-slate-700 border border-slate-200">
                           <span className="block text-sm font-bold">{appointment.horaInicio}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-sm font-bold text-slate-900 truncate">{patient?.nome}</p>
                           <p className="text-xs text-slate-500 truncate">{appointment.motivo}</p>
                        </div>

                        <Link
                          to={`/pacientes/${patient?.id}`}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Iniciar Atendimento"
                        >
                          <Stethoscope className="w-4 h-4" />
                        </Link>

                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                          appointment.status === 'confirmada' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          appointment.status === 'agendada' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                           {translateAppointmentStatus(appointment.status)}
                        </span>
                     </div>
                   );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Summary - Takes up 1/3 */}
        <div className="card p-0 overflow-hidden flex flex-col h-full">
           <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <Activity className="w-5 h-5 text-slate-400" />
              <h2 className="font-bold text-slate-800">Resumo</h2>
           </div>
           <div className="p-5 space-y-4">
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                       <Clock className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">Esta semana</span>
                 </div>
                 <span className="font-bold text-slate-900">{stats.consultasSemana}</span>
              </div>

              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                       <UserPlus className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">Novos pacientes</span>
                 </div>
                 <span className="font-bold text-slate-900">{stats.pacientesNovos}</span>
              </div>

              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                       <AlertCircle className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">Pagamentos</span>
                 </div>
                 <span className="font-bold text-slate-900">{formatCurrency(stats.receitaPendente)}</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

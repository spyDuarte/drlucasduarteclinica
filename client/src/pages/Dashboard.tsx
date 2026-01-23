import { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Calendar, Users, DollarSign, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { StatCard } from '../components/dashboard/StatCard';
import { WelcomeHeader } from '../components/dashboard/WelcomeHeader';
import { QuickActions } from '../components/dashboard/QuickActions';
import { RecentAppointments } from '../components/dashboard/RecentAppointments';
import { SummarySection } from '../components/dashboard/SummarySection';

export default function Dashboard() {
  const { dashboardStats: stats, getAppointmentsByDate, patients } = useData();

  const todayAppointments = useMemo(() => {
    return getAppointmentsByDate(new Date().toISOString().split('T')[0]);
  }, [getAppointmentsByDate]);

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
    <div className="space-y-8 animate-fade-in">
      <WelcomeHeader />
      <QuickActions />

      {/* Stats Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Métricas principais</h2>
          <span className="text-xs text-slate-400">Últimos 30 dias</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentAppointments appointments={todayAppointments} patients={patients} />
        <SummarySection stats={stats} />
      </div>
    </div>
  );
}

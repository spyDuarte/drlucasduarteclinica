import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  PieChart
} from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';

const COLORS = ['#0284c7', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Reports() {
  const { patients, appointments, payments, getDashboardStats } = useData();
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const stats = getDashboardStats();

  // Filter data by date range
  const filteredAppointments = appointments.filter(a => {
    const date = new Date(a.data);
    return date >= new Date(dateRange.start) && date <= new Date(dateRange.end);
  });

  const filteredPayments = payments.filter(p => {
    const date = new Date(p.createdAt);
    return date >= new Date(dateRange.start) && date <= new Date(dateRange.end);
  });

  // Appointments by status
  const appointmentsByStatus = [
    { name: 'Finalizadas', value: filteredAppointments.filter(a => a.status === 'finalizada').length },
    { name: 'Agendadas', value: filteredAppointments.filter(a => a.status === 'agendada').length },
    { name: 'Confirmadas', value: filteredAppointments.filter(a => a.status === 'confirmada').length },
    { name: 'Canceladas', value: filteredAppointments.filter(a => a.status === 'cancelada').length },
    { name: 'Faltou', value: filteredAppointments.filter(a => a.status === 'faltou').length }
  ].filter(item => item.value > 0);

  // Appointments by type
  const appointmentsByType = [
    { name: 'Primeira consulta', value: filteredAppointments.filter(a => a.tipo === 'primeira_consulta').length },
    { name: 'Retorno', value: filteredAppointments.filter(a => a.tipo === 'retorno').length },
    { name: 'Urgência', value: filteredAppointments.filter(a => a.tipo === 'urgencia').length },
    { name: 'Exame', value: filteredAppointments.filter(a => a.tipo === 'exame').length },
    { name: 'Procedimento', value: filteredAppointments.filter(a => a.tipo === 'procedimento').length }
  ].filter(item => item.value > 0);

  // Revenue by payment method
  const revenueByMethod = [
    { name: 'PIX', value: filteredPayments.filter(p => p.formaPagamento === 'pix' && p.status === 'pago').reduce((sum, p) => sum + p.valor, 0) },
    { name: 'Cartão Crédito', value: filteredPayments.filter(p => p.formaPagamento === 'cartao_credito' && p.status === 'pago').reduce((sum, p) => sum + p.valor, 0) },
    { name: 'Cartão Débito', value: filteredPayments.filter(p => p.formaPagamento === 'cartao_debito' && p.status === 'pago').reduce((sum, p) => sum + p.valor, 0) },
    { name: 'Dinheiro', value: filteredPayments.filter(p => p.formaPagamento === 'dinheiro' && p.status === 'pago').reduce((sum, p) => sum + p.valor, 0) },
    { name: 'Convênio', value: filteredPayments.filter(p => p.formaPagamento === 'convenio' && p.status === 'pago').reduce((sum, p) => sum + p.valor, 0) }
  ].filter(item => item.value > 0);

  // Monthly data for line chart
  const getMonthlyData = () => {
    const months: Record<string, { appointments: number; revenue: number }> = {};
    const currentYear = new Date().getFullYear();

    for (let i = 0; i < 12; i++) {
      const monthKey = `${currentYear}-${String(i + 1).padStart(2, '0')}`;
      months[monthKey] = { appointments: 0, revenue: 0 };
    }

    appointments.forEach(a => {
      const monthKey = a.data.substring(0, 7);
      if (months[monthKey] && a.status !== 'cancelada') {
        months[monthKey].appointments++;
      }
    });

    payments.forEach(p => {
      if (p.status === 'pago' && p.dataPagamento) {
        const monthKey = p.dataPagamento.substring(0, 7);
        if (months[monthKey]) {
          months[monthKey].revenue += p.valor;
        }
      }
    });

    return Object.entries(months).map(([month, data]) => ({
      month: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'short' }),
      consultas: data.appointments,
      receita: data.revenue
    }));
  };

  const monthlyData = getMonthlyData();

  const totalRevenue = filteredPayments
    .filter(p => p.status === 'pago')
    .reduce((sum, p) => sum + p.valor, 0);

  const totalPending = filteredPayments
    .filter(p => p.status === 'pendente')
    .reduce((sum, p) => sum + p.valor, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Análise de dados do consultório</p>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">De:</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
              className="input-field w-auto"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Até:</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
              className="input-field w-auto"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Consultas</p>
              <p className="text-xl font-bold text-gray-900">{filteredAppointments.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Receita Total</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pendente</p>
              <p className="text-xl font-bold text-yellow-600">{formatCurrency(totalPending)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Pacientes</p>
              <p className="text-xl font-bold text-gray-900">{patients.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Evolução Mensal
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="consultas"
                  stroke="#0284c7"
                  strokeWidth={2}
                  name="Consultas"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="receita"
                  stroke="#22c55e"
                  strokeWidth={2}
                  name="Receita (R$)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointments by Status */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Consultas por Status
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={appointmentsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {appointmentsByStatus.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointments by Type */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Consultas por Tipo
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appointmentsByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Payment Method */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Receita por Forma de Pagamento
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByMethod} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={v => formatCurrency(v)} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
                <Tooltip formatter={v => formatCurrency(v as number)} />
                <Bar dataKey="value" fill="#22c55e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Métricas Principais</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Taxa de Comparecimento</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.taxaComparecimento.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Baseado em consultas finalizadas vs. faltas
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Ticket Médio</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalRevenue / Math.max(filteredPayments.filter(p => p.status === 'pago').length, 1))}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Valor médio por pagamento
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Pacientes Novos (mês)</p>
            <p className="text-2xl font-bold text-gray-900">{stats.pacientesNovos}</p>
            <p className="text-xs text-gray-500 mt-1">
              Cadastrados no mês atual
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

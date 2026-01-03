import { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import {
  DollarSign,
  Plus,
  Search,
  Receipt,
  X,
  CheckCircle,
  Clock,
  CreditCard,
  Banknote,
  Smartphone,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Calendar,
  FileText,
  Building2
} from 'lucide-react';
import {
  formatCurrency,
  formatDate,
  translatePaymentMethod,
  translatePaymentStatus,
  getStatusColor
} from '../utils/helpers';
import type { Payment, PaymentMethod, PaymentStatus, Patient } from '../types';

export default function Financial() {
  const { payments, patients, addPayment, updatePayment } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

  // Stats com useMemo para otimização
  const stats = useMemo(() => {
    const thisMonth = new Date();
    thisMonth.setDate(1);

    const lastMonth = new Date(thisMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const totalReceived = payments
      .filter(p => p.status === 'pago')
      .reduce((sum, p) => sum + p.valor, 0);

    const totalPending = payments
      .filter(p => p.status === 'pendente')
      .reduce((sum, p) => sum + p.valor, 0);

    const monthlyReceived = payments
      .filter(p => p.status === 'pago' && new Date(p.dataPagamento || p.createdAt) >= thisMonth)
      .reduce((sum, p) => sum + p.valor, 0);

    const lastMonthReceived = payments
      .filter(p => {
        const paymentDate = new Date(p.dataPagamento || p.createdAt);
        return p.status === 'pago' && paymentDate >= lastMonth && paymentDate < thisMonth;
      })
      .reduce((sum, p) => sum + p.valor, 0);

    const pendingCount = payments.filter(p => p.status === 'pendente').length;
    const paidCount = payments.filter(p => p.status === 'pago').length;

    // Calcular variação percentual do mês
    const monthlyGrowth = lastMonthReceived > 0
      ? ((monthlyReceived - lastMonthReceived) / lastMonthReceived * 100).toFixed(0)
      : monthlyReceived > 0 ? '100' : '0';

    return {
      totalReceived,
      totalPending,
      monthlyReceived,
      lastMonthReceived,
      pendingCount,
      paidCount,
      monthlyGrowth,
      isGrowthPositive: Number(monthlyGrowth) >= 0
    };
  }, [payments]);

  // Filter payments
  const filteredPayments = payments
    .filter(payment => {
      const patient = patients.find(p => p.id === payment.patientId);
      const matchesSearch = patient?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.descricao.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleOpenModal = (payment?: Payment) => {
    setEditingPayment(payment || null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPayment(null);
  };

  const handleMarkAsPaid = (paymentId: string) => {
    updatePayment(paymentId, {
      status: 'pago',
      dataPagamento: new Date().toISOString().split('T')[0]
    });
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'cartao_credito':
      case 'cartao_debito':
        return <CreditCard className="w-4 h-4" />;
      case 'pix':
        return <Smartphone className="w-4 h-4" />;
      default:
        return <Banknote className="w-4 h-4" />;
    }
  };

  // Dados para os cards de estatísticas
  const statCards = [
    {
      label: 'Recebido no Mês',
      value: formatCurrency(stats.monthlyReceived),
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50',
      trend: `${stats.isGrowthPositive ? '+' : ''}${stats.monthlyGrowth}%`,
      trendUp: stats.isGrowthPositive,
      subtext: `${stats.paidCount} pagamentos`
    },
    {
      label: 'Pendente',
      value: formatCurrency(stats.totalPending),
      icon: Clock,
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-50 to-orange-50',
      trend: `${stats.pendingCount}`,
      trendUp: false,
      subtext: 'aguardando'
    },
    {
      label: 'Total Recebido',
      value: formatCurrency(stats.totalReceived),
      icon: Wallet,
      gradient: 'from-violet-500 to-purple-600',
      bgGradient: 'from-violet-50 to-purple-50',
      trend: 'Histórico',
      trendUp: true,
      subtext: 'todos os tempos'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <DollarSign className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Financeiro</h1>
            <p className="text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Gerencie pagamentos e recebimentos
            </p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all group bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
        >
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
          Novo Lançamento
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={stat.label}
            className="group relative bg-white rounded-2xl p-5 border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 cursor-default overflow-hidden"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Background gradient effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

            {/* Decorative element */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-full group-hover:opacity-10 group-hover:scale-150 transition-all duration-500`} />

            <div className="relative flex items-start justify-between">
              <div className="space-y-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 group-hover:text-slate-800 transition-colors">
                    {stat.value}
                  </p>
                  <p className="text-sm text-slate-500 font-medium mt-0.5">{stat.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{stat.subtext}</p>
                </div>
              </div>

              <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-full ${stat.trendUp ? 'text-emerald-700 bg-emerald-100' : 'text-amber-700 bg-amber-100'}`}>
                {stat.trendUp ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                {stat.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors duration-200 group-focus-within:text-emerald-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por paciente ou descrição..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-200 text-sm shadow-sm"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="appearance-none pl-9 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-200 text-sm shadow-sm cursor-pointer font-medium text-slate-700"
          >
            <option value="all">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-400px)]">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Lançamentos</h2>
              <p className="text-xs text-slate-500">{filteredPayments.length} registro{filteredPayments.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-auto flex-1 scroll-smooth">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-slate-50 to-slate-50/50 border-b border-slate-100 sticky top-0">
            <tr>
              <th className="table-header">Paciente</th>
              <th className="table-header">Descrição</th>
              <th className="table-header">Valor</th>
              <th className="table-header">Forma de Pagamento</th>
              <th className="table-header">Status</th>
              <th className="table-header">Data</th>
              <th className="table-header text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl flex items-center justify-center">
                    <DollarSign className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="font-semibold text-slate-700">Nenhum lançamento encontrado</p>
                  <p className="text-sm text-slate-400 mt-1">
                    {searchTerm || filterStatus !== 'all' ? 'Tente ajustar os filtros' : 'Cadastre seu primeiro lançamento'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredPayments.map((payment, index) => {
                const patient = patients.find(p => p.id === payment.patientId);
                return (
                  <tr
                    key={payment.id}
                    className="hover:bg-emerald-50/50 transition-all duration-200 group"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg flex items-center justify-center group-hover:from-emerald-100 group-hover:to-emerald-50 transition-all">
                          <FileText className="w-4 h-4 text-slate-500 group-hover:text-emerald-600" />
                        </div>
                        <span className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">{patient?.nome || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="table-cell text-slate-600">
                      {payment.descricao}
                    </td>
                    <td className="table-cell">
                      <span className="font-bold text-slate-900 text-base">
                        {formatCurrency(payment.valor)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                          {getPaymentMethodIcon(payment.formaPagamento)}
                        </span>
                        <span className="text-sm font-medium text-slate-700">{translatePaymentMethod(payment.formaPagamento)}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`status-badge ${getStatusColor(payment.status)}`}>
                        {translatePaymentStatus(payment.status)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        </span>
                        <span className="text-sm text-slate-600">
                          {payment.dataPagamento
                            ? formatDate(payment.dataPagamento)
                            : payment.dataVencimento
                            ? <span className="text-amber-600 font-medium">Vence: {formatDate(payment.dataVencimento)}</span>
                            : formatDate(payment.createdAt)}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1">
                        {payment.status === 'pendente' && (
                          <button
                            onClick={() => handleMarkAsPaid(payment.id)}
                            className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-all hover:scale-110"
                            title="Marcar como pago"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenModal(payment)}
                          className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all hover:scale-110"
                          title="Editar"
                        >
                          <Receipt className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Payment Modal */}
      {showModal && (
        <PaymentModal
          payment={editingPayment}
          patients={patients}
          onClose={handleCloseModal}
          onSave={(data) => {
            if (editingPayment) {
              updatePayment(editingPayment.id, data);
            } else {
              addPayment(data as Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>);
            }
            handleCloseModal();
          }}
        />
      )}
    </div>
  );
}

// Payment Modal
interface PaymentModalProps {
  payment: Payment | null;
  patients: Patient[];
  onClose: () => void;
  onSave: (data: Partial<Payment>) => void;
}

interface PaymentFormData {
  patientId: string;
  valor: string;
  descricao: string;
  formaPagamento: string;
  status: string;
  dataPagamento: string;
  dataVencimento: string;
  observacoes: string;
}

function PaymentModal({ payment, patients, onClose, onSave }: PaymentModalProps) {
  const [formData, setFormData] = useState<PaymentFormData>({
    patientId: payment?.patientId || '',
    valor: payment?.valor?.toString() || '',
    descricao: payment?.descricao || 'Consulta',
    formaPagamento: payment?.formaPagamento || 'pix',
    status: payment?.status || 'pendente',
    dataPagamento: payment?.dataPagamento || '',
    dataVencimento: payment?.dataVencimento || '',
    observacoes: payment?.observacoes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: Partial<Payment> = {
      patientId: formData.patientId,
      valor: parseFloat(formData.valor),
      descricao: formData.descricao,
      formaPagamento: formData.formaPagamento as PaymentMethod,
      status: formData.status as PaymentStatus,
      dataPagamento: formData.dataPagamento || undefined,
      dataVencimento: formData.dataVencimento || undefined,
      observacoes: formData.observacoes || undefined
    };

    onSave(data);
  };

  // Opções de forma de pagamento com ícones
  const paymentMethods = [
    { value: 'pix', label: 'PIX', icon: Smartphone, color: 'text-teal-600' },
    { value: 'dinheiro', label: 'Dinheiro', icon: Banknote, color: 'text-emerald-600' },
    { value: 'cartao_credito', label: 'Cartão de Crédito', icon: CreditCard, color: 'text-violet-600' },
    { value: 'cartao_debito', label: 'Cartão de Débito', icon: CreditCard, color: 'text-blue-600' },
    { value: 'transferencia', label: 'Transferência', icon: Building2, color: 'text-slate-600' },
    { value: 'convenio', label: 'Convênio', icon: FileText, color: 'text-amber-600' }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg my-4 max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative border-b border-slate-100 px-6 py-5">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-2xl" />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900">
                {payment ? 'Editar Lançamento' : 'Novo Lançamento'}
              </h2>
              <p className="text-sm text-slate-500">
                {payment ? 'Atualize as informações do pagamento' : 'Registre um novo pagamento ou cobrança'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto overscroll-contain scroll-smooth p-6 space-y-5">
          {/* Paciente */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FileText className="w-4 h-4 text-slate-400" />
              Paciente <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.patientId}
              onChange={e => setFormData({ ...formData, patientId: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all duration-200 text-sm font-medium cursor-pointer"
              required
            >
              <option value="">Selecione um paciente</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Receipt className="w-4 h-4 text-slate-400" />
              Descrição <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.descricao}
              onChange={e => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Ex: Consulta, Retorno, Procedimento..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all duration-200 text-sm"
              required
            />
          </div>

          {/* Valor e Forma de Pagamento */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <DollarSign className="w-4 h-4 text-slate-400" />
                Valor (R$) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valor}
                  onChange={e => setFormData({ ...formData, valor: e.target.value })}
                  placeholder="0,00"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all duration-200 text-sm font-bold"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <CreditCard className="w-4 h-4 text-slate-400" />
                Forma de Pagamento
              </label>
              <select
                value={formData.formaPagamento}
                onChange={e => setFormData({ ...formData, formaPagamento: e.target.value as PaymentMethod })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all duration-200 text-sm font-medium cursor-pointer"
              >
                {paymentMethods.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status e Data */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <CheckCircle className="w-4 h-4 text-slate-400" />
                Status
              </label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as PaymentStatus })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all duration-200 text-sm font-medium cursor-pointer"
              >
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Calendar className="w-4 h-4 text-slate-400" />
                {formData.status === 'pago' ? 'Data do Pagamento' : 'Data de Vencimento'}
              </label>
              <input
                type="date"
                value={formData.status === 'pago' ? formData.dataPagamento : formData.dataVencimento}
                onChange={e => setFormData({
                  ...formData,
                  [formData.status === 'pago' ? 'dataPagamento' : 'dataVencimento']: e.target.value
                })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all duration-200 text-sm"
              />
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FileText className="w-4 h-4 text-slate-400" />
              Observações
            </label>
            <textarea
              value={formData.observacoes}
              onChange={e => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Informações adicionais sobre o pagamento..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all duration-200 text-sm resize-none"
              rows={3}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-4 bg-slate-50/50 rounded-b-2xl">
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-slate-700 font-semibold hover:bg-slate-100 rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              {payment ? 'Salvar Alterações' : 'Criar Lançamento'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

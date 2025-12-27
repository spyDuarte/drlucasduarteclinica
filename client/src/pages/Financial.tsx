import { useState } from 'react';
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
  Smartphone
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

  // Stats
  const totalReceived = payments
    .filter(p => p.status === 'pago')
    .reduce((sum, p) => sum + p.valor, 0);

  const totalPending = payments
    .filter(p => p.status === 'pendente')
    .reduce((sum, p) => sum + p.valor, 0);

  const thisMonth = new Date();
  thisMonth.setDate(1);

  const monthlyReceived = payments
    .filter(p => p.status === 'pago' && new Date(p.dataPagamento || p.createdAt) >= thisMonth)
    .reduce((sum, p) => sum + p.valor, 0);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-gray-600">Gerencie pagamentos e recebimentos</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Lançamento
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Recebido no mês</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(monthlyReceived)}</p>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Pendente</p>
            <p className="text-2xl font-bold text-yellow-600">{formatCurrency(totalPending)}</p>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-sky-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total recebido</p>
            <p className="text-2xl font-bold text-sky-600">{formatCurrency(totalReceived)}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por paciente ou descrição..."
            className="input-field pl-10"
          />
        </div>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="input-field w-auto"
        >
          <option value="all">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="pago">Pago</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
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
          <tbody className="divide-y divide-gray-200">
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  Nenhum lançamento encontrado
                </td>
              </tr>
            ) : (
              filteredPayments.map(payment => {
                const patient = patients.find(p => p.id === payment.patientId);
                return (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <span className="font-medium">{patient?.nome || 'N/A'}</span>
                    </td>
                    <td className="table-cell text-gray-600">
                      {payment.descricao}
                    </td>
                    <td className="table-cell">
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(payment.valor)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        {getPaymentMethodIcon(payment.formaPagamento)}
                        <span>{translatePaymentMethod(payment.formaPagamento)}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`status-badge ${getStatusColor(payment.status)}`}>
                        {translatePaymentStatus(payment.status)}
                      </span>
                    </td>
                    <td className="table-cell text-gray-600">
                      {payment.dataPagamento
                        ? formatDate(payment.dataPagamento)
                        : payment.dataVencimento
                        ? `Vence: ${formatDate(payment.dataVencimento)}`
                        : formatDate(payment.createdAt)}
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-2">
                        {payment.status === 'pendente' && (
                          <button
                            onClick={() => handleMarkAsPaid(payment.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Marcar como pago"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenModal(payment)}
                          className="p-2 text-gray-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {payment ? 'Editar Lançamento' : 'Novo Lançamento'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Paciente *</label>
            <select
              value={formData.patientId}
              onChange={e => setFormData({ ...formData, patientId: e.target.value })}
              className="input-field"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
            <input
              type="text"
              value={formData.descricao}
              onChange={e => setFormData({ ...formData, descricao: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.valor}
                onChange={e => setFormData({ ...formData, valor: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Forma de pagamento</label>
              <select
                value={formData.formaPagamento}
                onChange={e => setFormData({ ...formData, formaPagamento: e.target.value as PaymentMethod })}
                className="input-field"
              >
                <option value="pix">PIX</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="cartao_credito">Cartão de crédito</option>
                <option value="cartao_debito">Cartão de débito</option>
                <option value="transferencia">Transferência</option>
                <option value="convenio">Convênio</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as PaymentStatus })}
                className="input-field"
              >
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formData.status === 'pago' ? 'Data do pagamento' : 'Data de vencimento'}
              </label>
              <input
                type="date"
                value={formData.status === 'pago' ? formData.dataPagamento : formData.dataVencimento}
                onChange={e => setFormData({
                  ...formData,
                  [formData.status === 'pago' ? 'dataPagamento' : 'dataVencimento']: e.target.value
                })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea
              value={formData.observacoes}
              onChange={e => setFormData({ ...formData, observacoes: e.target.value })}
              className="input-field"
              rows={2}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {payment ? 'Salvar' : 'Criar lançamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useToast } from '../components/Toast';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  User,
  X,
  Phone,
  AlertCircle,
  Calendar
} from 'lucide-react';
import {
  formatDate,
  formatRelativeDate,
  translateAppointmentType,
  getStatusColor,
  generateTimeSlots
} from '../utils/helpers';
import type { Appointment, AppointmentStatus, AppointmentType, Patient } from '../types';

const TIME_SLOTS = generateTimeSlots('08:00', '18:00', 30);

export default function Agenda() {
  const { patients, addAppointment, updateAppointment, deleteAppointment, getAppointmentsByDate } = useData();
  const { showToast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  const dateStr = selectedDate.toISOString().split('T')[0];
  const dayAppointments = getAppointmentsByDate(dateStr);

  const navigateDay = (direction: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const getAppointmentAtTime = (time: string) => {
    return dayAppointments.find(a => a.horaInicio === time);
  };

  const handleOpenModal = (appointment?: Appointment, timeSlot?: string) => {
    setEditingAppointment(appointment || null);
    setSelectedTimeSlot(timeSlot || null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAppointment(null);
    setSelectedTimeSlot(null);
  };

  const handleStatusChange = (appointmentId: string, newStatus: AppointmentStatus) => {
    updateAppointment(appointmentId, { status: newStatus });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Agenda</h1>
            <p className="text-sm text-gray-600">Gerencie as consultas do dia</p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Consulta</span>
        </button>
      </div>

      {/* Date Navigation */}
      <div className="card">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => navigateDay(-1)}
            className="p-2 md:p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            aria-label="Dia anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center flex-1 min-w-0">
            <p className="text-xs md:text-sm text-primary-600 font-medium">{formatRelativeDate(selectedDate)}</p>
            <p className="text-sm md:text-xl font-semibold text-gray-900 truncate">
              <span className="hidden sm:inline">{formatDate(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy")}</span>
              <span className="sm:hidden">{formatDate(selectedDate, "EEE, dd/MM/yyyy")}</span>
            </p>
          </div>

          <button
            onClick={() => navigateDay(1)}
            className="p-2 md:p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            aria-label="Próximo dia"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 flex justify-center">
          <button onClick={goToToday} className="btn-secondary text-sm">
            Ir para hoje
          </button>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="card p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-50/50 border-b border-gray-200 px-4 py-3">
          <h2 className="font-medium text-gray-900 flex items-center gap-2">
            <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
            {dayAppointments.length} consulta{dayAppointments.length !== 1 ? 's' : ''} agendada{dayAppointments.length !== 1 ? 's' : ''}
          </h2>
        </div>

        <div className="divide-y divide-gray-100 max-h-[50vh] sm:max-h-[60vh] lg:max-h-[65vh] overflow-y-auto">
          {TIME_SLOTS.map(time => {
            const appointment = getAppointmentAtTime(time);
            const patient = appointment ? patients.find(p => p.id === appointment.patientId) : null;

            return (
              <div
                key={time}
                className={`flex items-stretch hover:bg-gray-50 transition-colors ${
                  appointment ? 'bg-white' : 'bg-gray-50/50'
                }`}
              >
                {/* Time */}
                <div className="w-14 md:w-20 p-2 md:p-4 border-r border-gray-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs md:text-sm font-medium text-gray-500">{time}</span>
                </div>

                {/* Content */}
                <div className="flex-1 p-2 md:p-4 min-w-0">
                  {appointment ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div
                        className="flex items-center gap-2 md:gap-4 flex-1 cursor-pointer min-w-0"
                        onClick={() => handleOpenModal(appointment)}
                      >
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 md:w-5 md:h-5 text-sky-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm md:text-base truncate">
                            {patient?.nome || 'Paciente não encontrado'}
                          </p>
                          <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-500">
                            <span className="truncate">{translateAppointmentType(appointment.tipo)}</span>
                            {appointment.motivo && (
                              <>
                                <span className="hidden sm:inline">•</span>
                                <span className="hidden sm:inline truncate">{appointment.motivo}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status Actions */}
                      <div className="flex items-center gap-2 ml-10 sm:ml-0">
                        <select
                          value={appointment.status}
                          onChange={e => handleStatusChange(appointment.id, e.target.value as AppointmentStatus)}
                          className={`status-badge ${getStatusColor(appointment.status)} border-0 cursor-pointer text-xs md:text-sm`}
                        >
                          <option value="agendada">Agendada</option>
                          <option value="confirmada">Confirmada</option>
                          <option value="aguardando">Aguardando</option>
                          <option value="em_atendimento">Em atendimento</option>
                          <option value="finalizada">Finalizada</option>
                          <option value="cancelada">Cancelada</option>
                          <option value="faltou">Não compareceu</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOpenModal(undefined, time)}
                      className="w-full h-full flex items-center justify-center text-gray-400 hover:text-sky-600 transition-colors py-1"
                    >
                      <Plus className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="ml-1 md:ml-2 text-xs md:text-sm">Agendar</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Appointment Modal */}
      {showModal && (
        <AppointmentModal
          appointment={editingAppointment}
          selectedDate={dateStr}
          selectedTime={selectedTimeSlot}
          patients={patients}
          onClose={handleCloseModal}
          onSave={(data) => {
            try {
              if (editingAppointment) {
                updateAppointment(editingAppointment.id, data);
                showToast('Consulta atualizada com sucesso!', 'success');
              } else {
                addAppointment(data as Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>);
                showToast('Consulta agendada com sucesso!', 'success');
              }
              handleCloseModal();
            } catch (error) {
              showToast(error instanceof Error ? error.message : 'Erro ao salvar consulta', 'error');
            }
          }}
          onDelete={editingAppointment ? () => {
            deleteAppointment(editingAppointment.id);
            showToast('Consulta excluída com sucesso!', 'success');
            handleCloseModal();
          } : undefined}
        />
      )}
    </div>
  );
}

// Appointment Modal Component
interface AppointmentModalProps {
  appointment: Appointment | null;
  selectedDate: string;
  selectedTime: string | null;
  patients: Patient[];
  onClose: () => void;
  onSave: (data: Partial<Appointment>) => void;
  onDelete?: () => void;
}

interface AppointmentFormData {
  patientId: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  tipo: string;
  status: string;
  motivo: string;
  valor: string;
  convenio: boolean;
  observacoes: string;
}

function AppointmentModal({
  appointment,
  selectedDate,
  selectedTime,
  patients,
  onClose,
  onSave,
  onDelete
}: AppointmentModalProps) {
  const [formData, setFormData] = useState<AppointmentFormData>({
    patientId: appointment?.patientId || '',
    data: appointment?.data || selectedDate,
    horaInicio: appointment?.horaInicio || selectedTime || '09:00',
    horaFim: appointment?.horaFim || '',
    tipo: appointment?.tipo || 'primeira_consulta',
    status: appointment?.status || 'agendada',
    motivo: appointment?.motivo || '',
    valor: appointment?.valor?.toString() || '',
    convenio: appointment?.convenio || false,
    observacoes: appointment?.observacoes || ''
  });

  // Auto-calculate end time
  useEffect(() => {
    if (formData.horaInicio && !formData.horaFim) {
      const [hours, minutes] = formData.horaInicio.split(':').map(Number);
      const endMinutes = hours * 60 + minutes + 30;
      const endHours = Math.floor(endMinutes / 60);
      const endMins = endMinutes % 60;
      setFormData(prev => ({
        ...prev,
        horaFim: `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.horaInicio]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: Partial<Appointment> = {
      patientId: formData.patientId,
      data: formData.data,
      horaInicio: formData.horaInicio,
      horaFim: formData.horaFim,
      tipo: formData.tipo as AppointmentType,
      status: formData.status as AppointmentStatus,
      motivo: formData.motivo || undefined,
      valor: formData.valor ? parseFloat(formData.valor) : undefined,
      convenio: formData.convenio,
      observacoes: formData.observacoes || undefined
    };

    onSave(data);
  };

  const selectedPatient = patients.find(p => p.id === formData.patientId);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[85vh] sm:max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {appointment ? 'Editar Consulta' : 'Nova Consulta'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Patient Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paciente *
            </label>
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
            {selectedPatient && (
              <div className="mt-2 p-2 bg-gray-50 rounded-lg flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                {selectedPatient.telefone}
                {selectedPatient.alergias && selectedPatient.alergias.length > 0 && (
                  <span className="ml-auto flex items-center gap-1 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    Alergias: {selectedPatient.alergias.join(', ')}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data *
              </label>
              <input
                type="date"
                value={formData.data}
                onChange={e => setFormData({ ...formData, data: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Início *
              </label>
              <select
                value={formData.horaInicio}
                onChange={e => setFormData({ ...formData, horaInicio: e.target.value, horaFim: '' })}
                className="input-field"
                required
              >
                {TIME_SLOTS.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fim *
              </label>
              <select
                value={formData.horaFim}
                onChange={e => setFormData({ ...formData, horaFim: e.target.value })}
                className="input-field"
                required
              >
                {TIME_SLOTS.filter(t => t > formData.horaInicio).map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Type and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de consulta *
              </label>
              <select
                value={formData.tipo}
                onChange={e => setFormData({ ...formData, tipo: e.target.value as AppointmentType })}
                className="input-field"
              >
                <option value="primeira_consulta">Primeira consulta</option>
                <option value="retorno">Retorno</option>
                <option value="urgencia">Urgência</option>
                <option value="exame">Exame</option>
                <option value="procedimento">Procedimento</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as AppointmentStatus })}
                className="input-field"
              >
                <option value="agendada">Agendada</option>
                <option value="confirmada">Confirmada</option>
                <option value="aguardando">Aguardando</option>
                <option value="em_atendimento">Em atendimento</option>
                <option value="finalizada">Finalizada</option>
                <option value="cancelada">Cancelada</option>
                <option value="faltou">Não compareceu</option>
              </select>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo da consulta
            </label>
            <input
              type="text"
              value={formData.motivo}
              onChange={e => setFormData({ ...formData, motivo: e.target.value })}
              className="input-field"
              placeholder="Ex: Check-up, Dor de cabeça..."
            />
          </div>

          {/* Payment */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor (R$)
              </label>
              <input
                type="number"
                value={formData.valor}
                onChange={e => setFormData({ ...formData, valor: e.target.value })}
                className="input-field"
                placeholder="0,00"
                step="0.01"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.convenio}
                  onChange={e => setFormData({ ...formData, convenio: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                />
                <span className="text-sm text-gray-700">Consulta por convênio</span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <textarea
              value={formData.observacoes}
              onChange={e => setFormData({ ...formData, observacoes: e.target.value })}
              className="input-field"
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-between pt-4 border-t border-gray-200">
            <div>
              {onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="btn-danger"
                >
                  Excluir
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancelar
              </button>
              <button type="submit" className="btn-primary">
                {appointment ? 'Salvar' : 'Agendar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

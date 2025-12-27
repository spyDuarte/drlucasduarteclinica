import { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  User,
  X,
  Phone,
  AlertCircle
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-600">Gerencie as consultas do dia</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nova Consulta
        </button>
      </div>

      {/* Date Navigation */}
      <div className="card">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateDay(-1)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-500">{formatRelativeDate(selectedDate)}</p>
            <p className="text-xl font-semibold text-gray-900">
              {formatDate(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy")}
            </p>
          </div>

          <button
            onClick={() => navigateDay(1)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
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
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
          <h2 className="font-medium text-gray-900">
            {dayAppointments.length} consulta(s) agendada(s)
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
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
                <div className="w-20 p-4 border-r border-gray-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-500">{time}</span>
                </div>

                {/* Content */}
                <div className="flex-1 p-4">
                  {appointment ? (
                    <div className="flex items-center justify-between">
                      <div
                        className="flex items-center gap-4 flex-1 cursor-pointer"
                        onClick={() => handleOpenModal(appointment)}
                      >
                        <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-sky-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">
                            {patient?.nome || 'Paciente não encontrado'}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{translateAppointmentType(appointment.tipo)}</span>
                            {appointment.motivo && (
                              <>
                                <span>•</span>
                                <span className="truncate">{appointment.motivo}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status Actions */}
                      <div className="flex items-center gap-2">
                        <select
                          value={appointment.status}
                          onChange={e => handleStatusChange(appointment.id, e.target.value as AppointmentStatus)}
                          className={`status-badge ${getStatusColor(appointment.status)} border-0 cursor-pointer`}
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
                      className="w-full h-full flex items-center justify-center text-gray-400 hover:text-sky-600 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      <span className="ml-2 text-sm">Agendar</span>
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
            if (editingAppointment) {
              updateAppointment(editingAppointment.id, data);
            } else {
              addAppointment(data as Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>);
            }
            handleCloseModal();
          }}
          onDelete={editingAppointment ? () => {
            deleteAppointment(editingAppointment.id);
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
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
                {selectedPatient.alergias?.length > 0 && (
                  <span className="ml-auto flex items-center gap-1 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    Alergias: {selectedPatient.alergias.join(', ')}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-3 gap-4">
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

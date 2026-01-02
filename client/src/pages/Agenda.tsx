import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Calendar,
  FileText,
  Clock,
  Search,
  Stethoscope,
  RefreshCw,
  AlertTriangle,
  Activity,
  Scissors,
  CreditCard,
  Heart,
  Mail,
  CalendarDays,
  UserCheck,
  Bell,
  Pill,
  ClipboardList,
  Trash2,
  Check,
  Sparkles
} from 'lucide-react';
import {
  formatDate,
  formatRelativeDate,
  translateAppointmentType,
  getStatusColor,
  generateTimeSlots,
  calculateAge
} from '../utils/helpers';
import type { Appointment, AppointmentStatus, AppointmentType, Patient } from '../types';

const TIME_SLOTS = generateTimeSlots('08:00', '18:00', 30);

export default function Agenda() {
  const { patients, addAppointment, updateAppointment, deleteAppointment, getAppointmentsByDate } = useData();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  // Função para navegar para o prontuário do paciente
  const handleOpenMedicalRecord = (patientId: string) => {
    navigate(`/pacientes/${patientId}`);
  };

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

        <div className="divide-y divide-gray-100 max-h-[50vh] sm:max-h-[60vh] lg:max-h-[65vh] overflow-y-auto scroll-smooth overscroll-contain">
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
                        {/* Botão de Prontuário - visível quando em atendimento */}
                        {(appointment.status === 'em_atendimento' || appointment.status === 'aguardando') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenMedicalRecord(appointment.patientId);
                            }}
                            className="p-1.5 md:p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-colors"
                            title="Abrir prontuário"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        )}
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

// Tipos de consulta com ícones e cores
const APPOINTMENT_TYPE_CONFIG: Record<AppointmentType, {
  icon: typeof Stethoscope;
  color: string;
  bgColor: string;
  selectedBg: string;
  label: string;
  subtitle: string;
}> = {
  primeira_consulta: { icon: UserCheck, color: 'text-blue-600', bgColor: 'bg-blue-100', selectedBg: 'bg-gradient-to-br from-blue-500 to-blue-600', label: 'Primeira Consulta', subtitle: 'Novo paciente' },
  retorno: { icon: RefreshCw, color: 'text-green-600', bgColor: 'bg-green-100', selectedBg: 'bg-gradient-to-br from-green-500 to-green-600', label: 'Retorno', subtitle: 'Acompanhamento' },
  urgencia: { icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-100', selectedBg: 'bg-gradient-to-br from-red-500 to-red-600', label: 'Urgência', subtitle: 'Atendimento prioritário' },
  exame: { icon: Activity, color: 'text-purple-600', bgColor: 'bg-purple-100', selectedBg: 'bg-gradient-to-br from-purple-500 to-purple-600', label: 'Exame', subtitle: 'Exames e diagnósticos' },
  procedimento: { icon: Scissors, color: 'text-orange-600', bgColor: 'bg-orange-100', selectedBg: 'bg-gradient-to-br from-orange-500 to-orange-600', label: 'Procedimento', subtitle: 'Intervenções' },
};

// Status com cores
const STATUS_CONFIG: Record<AppointmentStatus, { color: string; bgColor: string; label: string }> = {
  agendada: { color: 'text-blue-700', bgColor: 'bg-blue-100', label: 'Agendada' },
  confirmada: { color: 'text-green-700', bgColor: 'bg-green-100', label: 'Confirmada' },
  aguardando: { color: 'text-yellow-700', bgColor: 'bg-yellow-100', label: 'Aguardando' },
  em_atendimento: { color: 'text-purple-700', bgColor: 'bg-purple-100', label: 'Em Atendimento' },
  finalizada: { color: 'text-gray-700', bgColor: 'bg-gray-100', label: 'Finalizada' },
  cancelada: { color: 'text-red-700', bgColor: 'bg-red-100', label: 'Cancelada' },
  faltou: { color: 'text-orange-700', bgColor: 'bg-orange-100', label: 'Não Compareceu' },
};

// Durações disponíveis
const DURATION_OPTIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1h 30min' },
  { value: 120, label: '2 horas' },
];

// Horários rápidos mais usados
const QUICK_TIMES = ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'];

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
  duracao: number;
  tipo: AppointmentType;
  status: AppointmentStatus;
  motivo: string;
  valor: string;
  convenio: boolean;
  observacoes: string;
  enviarLembrete: boolean;
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
  const { checkAppointmentConflict, getAppointmentsByPatient } = useData();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showPatientSearch, setShowPatientSearch] = useState(false);

  // Calcula duração inicial baseado nos horários
  const calculateDuration = (start: string, end: string): number => {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    return (endH * 60 + endM) - (startH * 60 + startM);
  };

  // Calcula o horário de fim baseado no início e duração
  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  const initialStartTime = appointment?.horaInicio || selectedTime || '09:00';
  const initialDuration = appointment ? calculateDuration(appointment.horaInicio, appointment.horaFim) : 30;

  const [formData, setFormData] = useState<AppointmentFormData>({
    patientId: appointment?.patientId || '',
    data: appointment?.data || selectedDate,
    horaInicio: initialStartTime,
    duracao: initialDuration,
    tipo: appointment?.tipo || 'primeira_consulta',
    status: appointment?.status || 'agendada',
    motivo: appointment?.motivo || '',
    valor: appointment?.valor?.toString() || '',
    convenio: appointment?.convenio || false,
    observacoes: appointment?.observacoes || '',
    enviarLembrete: true,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Pacientes filtrados pela busca
  const filteredPatients = useMemo(() => {
    if (!searchQuery) return patients;
    const query = searchQuery.toLowerCase();
    return patients.filter(p =>
      p.nome.toLowerCase().includes(query) ||
      p.cpf.includes(query) ||
      p.telefone.includes(query)
    );
  }, [patients, searchQuery]);

  // Paciente selecionado
  const selectedPatient = patients.find(p => p.id === formData.patientId);

  // Histórico de consultas do paciente
  const patientAppointments = useMemo(() => {
    if (!formData.patientId) return [];
    return getAppointmentsByPatient(formData.patientId)
      .filter(a => a.status === 'finalizada')
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .slice(0, 3);
  }, [formData.patientId, getAppointmentsByPatient]);

  // Validação de data passada
  const isDateInPast = (dateStr: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateObj = new Date(dateStr + 'T00:00:00');
    return selectedDateObj < today;
  };

  // Validação do formulário
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.patientId) {
      errors.patientId = 'Selecione um paciente';
    }

    if (!formData.data) {
      errors.data = 'Informe a data';
    } else if (isDateInPast(formData.data) && !appointment) {
      errors.data = 'Não é possível agendar para datas passadas';
    }

    if (!formData.horaInicio) {
      errors.horaInicio = 'Informe o horário de início';
    }

    const horaFim = calculateEndTime(formData.horaInicio, formData.duracao);

    // Verifica conflito de horário
    const hasConflict = checkAppointmentConflict(
      formData.data,
      formData.horaInicio,
      horaFim,
      appointment?.id
    );

    if (hasConflict) {
      errors.horaInicio = 'Já existe uma consulta neste horário';
      showToast('Conflito de horário detectado', 'error');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const horaFim = calculateEndTime(formData.horaInicio, formData.duracao);

    const data: Partial<Appointment> = {
      patientId: formData.patientId,
      data: formData.data,
      horaInicio: formData.horaInicio,
      horaFim: horaFim,
      tipo: formData.tipo,
      status: formData.status,
      motivo: formData.motivo || undefined,
      valor: formData.valor ? parseFloat(formData.valor) : undefined,
      convenio: formData.convenio,
      observacoes: formData.observacoes || undefined
    };

    onSave(data);
  };

  const handleSelectPatient = (patientId: string) => {
    setFormData({ ...formData, patientId });
    setShowPatientSearch(false);
    setSearchQuery('');
    if (formErrors.patientId) setFormErrors(prev => ({ ...prev, patientId: '' }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-2 sm:p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl my-4 sm:my-8 max-h-[95vh] flex flex-col shadow-2xl animate-scale-in">
        {/* Header Profissional */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-primary-700 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <CalendarDays className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {appointment ? 'Editar Agendamento' : 'Novo Agendamento'}
              </h2>
              <p className="text-sm text-white/70">
                {formatDate(new Date(formData.data), "EEEE, dd 'de' MMMM")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Seção: Paciente */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <User className="w-4 h-4 text-primary-600" />
              PACIENTE
            </div>

            {/* Busca de Paciente */}
            <div className="relative">
              <div
                className={`input-field flex items-center gap-2 cursor-pointer ${
                  formErrors.patientId ? 'border-red-500' : ''
                }`}
                onClick={() => setShowPatientSearch(true)}
              >
                <Search className="w-4 h-4 text-gray-400" />
                {selectedPatient ? (
                  <span className="text-gray-900">{selectedPatient.nome}</span>
                ) : (
                  <span className="text-gray-400">Buscar paciente por nome, CPF ou telefone...</span>
                )}
              </div>

              {showPatientSearch && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-hidden">
                  <div className="p-2 border-b border-gray-100">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Digite para buscar..."
                      className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredPatients.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        Nenhum paciente encontrado
                      </div>
                    ) : (
                      filteredPatients.map(patient => (
                        <div
                          key={patient.id}
                          onClick={() => handleSelectPatient(patient.id)}
                          className={`p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 ${
                            formData.patientId === patient.id ? 'bg-primary-50' : ''
                          }`}
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{patient.nome}</p>
                            <p className="text-xs text-gray-500">{patient.telefone}</p>
                          </div>
                          {patient.alergias && patient.alergias.length > 0 && (
                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setShowPatientSearch(false)}
                      className="w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              )}
              {formErrors.patientId && (
                <p className="text-red-500 text-xs mt-1">{formErrors.patientId}</p>
              )}
            </div>

            {/* Card do Paciente Selecionado */}
            {selectedPatient && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                    <User className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{selectedPatient.nome}</h3>
                    <p className="text-sm text-gray-500">
                      {calculateAge(selectedPatient.dataNascimento)} anos • {selectedPatient.sexo === 'M' ? 'Masculino' : selectedPatient.sexo === 'F' ? 'Feminino' : 'Outro'}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {selectedPatient.telefone}
                      </span>
                      {selectedPatient.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {selectedPatient.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Alertas */}
                {selectedPatient.alergias && selectedPatient.alergias.length > 0 && (
                  <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-red-800">Alergias:</p>
                      <p className="text-xs text-red-700">{selectedPatient.alergias.join(', ')}</p>
                    </div>
                  </div>
                )}

                {selectedPatient.medicamentosEmUso && selectedPatient.medicamentosEmUso.length > 0 && (
                  <div className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <Pill className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-amber-800">Medicamentos em uso:</p>
                      <p className="text-xs text-amber-700">{selectedPatient.medicamentosEmUso.join(', ')}</p>
                    </div>
                  </div>
                )}

                {/* Últimas consultas */}
                {patientAppointments.length > 0 && (
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-500 mb-2">Últimas consultas:</p>
                    <div className="flex flex-wrap gap-2">
                      {patientAppointments.map(apt => (
                        <span key={apt.id} className="px-2 py-1 bg-white rounded-md text-xs text-gray-600 border border-gray-200">
                          {formatDate(new Date(apt.data), 'dd/MM/yyyy')} - {translateAppointmentType(apt.tipo)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Seção: Data e Horário */}
          <div className="space-y-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary-600" />
              </div>
              <span>DATA E HORÁRIO</span>
            </div>

            {/* Data */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                Data da consulta
              </label>
              <input
                type="date"
                value={formData.data}
                onChange={e => {
                  setFormData({ ...formData, data: e.target.value });
                  if (formErrors.data) setFormErrors(prev => ({ ...prev, data: '' }));
                }}
                className={`input-field text-lg font-medium ${formErrors.data ? 'border-red-500 bg-red-50' : 'bg-white'}`}
                required
              />
              {formErrors.data && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {formErrors.data}
                </p>
              )}
            </div>

            {/* Horários Rápidos */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                Horário (selecione ou escolha abaixo)
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {QUICK_TIMES.map(time => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, horaInicio: time });
                      if (formErrors.horaInicio) setFormErrors(prev => ({ ...prev, horaInicio: '' }));
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.horaInicio === time
                        ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
              <select
                value={formData.horaInicio}
                onChange={e => {
                  setFormData({ ...formData, horaInicio: e.target.value });
                  if (formErrors.horaInicio) setFormErrors(prev => ({ ...prev, horaInicio: '' }));
                }}
                className={`input-field bg-white ${formErrors.horaInicio ? 'border-red-500 bg-red-50' : ''}`}
                required
              >
                {TIME_SLOTS.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
              {formErrors.horaInicio && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {formErrors.horaInicio}
                </p>
              )}
            </div>

            {/* Duração com botões visuais */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                Duração do atendimento
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {DURATION_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, duracao: opt.value })}
                    className={`px-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      formData.duracao === opt.value
                        ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview do horário */}
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl text-white shadow-lg shadow-primary-500/25">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-white/80">Agendamento para</p>
                <p className="text-lg font-bold">
                  {formatDate(new Date(formData.data), "EEEE, dd/MM")} • {formData.horaInicio} - {calculateEndTime(formData.horaInicio, formData.duracao)}
                </p>
              </div>
            </div>
          </div>

          {/* Seção: Tipo de Consulta */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-purple-600" />
              </div>
              <span>TIPO DE ATENDIMENTO</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(Object.keys(APPOINTMENT_TYPE_CONFIG) as AppointmentType[]).map(type => {
                const config = APPOINTMENT_TYPE_CONFIG[type];
                const Icon = config.icon;
                const isSelected = formData.tipo === type;

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, tipo: type })}
                    className={`relative p-4 rounded-xl border-2 transition-all flex items-center gap-4 group ${
                      isSelected
                        ? `border-transparent ${config.selectedBg} shadow-lg shadow-gray-300`
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                      isSelected
                        ? 'bg-white/20 backdrop-blur-sm'
                        : config.bgColor
                    }`}>
                      <Icon className={`w-6 h-6 transition-colors ${isSelected ? 'text-white' : config.color}`} />
                    </div>
                    <div className="text-left flex-1">
                      <span className={`text-sm font-semibold block transition-colors ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                        {config.label}
                      </span>
                      <span className={`text-xs transition-colors ${isSelected ? 'text-white/70' : 'text-gray-500'}`}>
                        {config.subtitle}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-white/30 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seção: Motivo e Observações */}
          <div className="space-y-4 p-4 bg-gradient-to-br from-amber-50/50 to-orange-50/30 rounded-2xl border border-amber-100">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-amber-600" />
              </div>
              <span>DETALHES DO ATENDIMENTO</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                Motivo / Queixa principal
              </label>
              <input
                type="text"
                value={formData.motivo}
                onChange={e => setFormData({ ...formData, motivo: e.target.value })}
                className="input-field bg-white text-base"
                placeholder="Ex: Dor de cabeça persistente, check-up anual..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                Observações adicionais
              </label>
              <textarea
                value={formData.observacoes}
                onChange={e => setFormData({ ...formData, observacoes: e.target.value })}
                className="input-field bg-white resize-none"
                rows={2}
                placeholder="Notas internas, preparativos necessários, informações importantes..."
              />
            </div>
          </div>

          {/* Seção: Status e Pagamento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status */}
            <div className="space-y-3 p-4 bg-white rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <span>STATUS</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(['agendada', 'confirmada', 'aguardando'] as AppointmentStatus[]).map(status => {
                  const config = STATUS_CONFIG[status];
                  const isSelected = formData.status === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFormData({ ...formData, status })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isSelected
                          ? `${config.bgColor} ${config.color} ring-2 ring-offset-1 ring-current`
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pagamento */}
            <div className="space-y-3 p-4 bg-white rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <span>PAGAMENTO</span>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">R$</span>
                  <input
                    type="number"
                    value={formData.valor}
                    onChange={e => setFormData({ ...formData, valor: e.target.value })}
                    className="input-field pl-10 bg-gray-50 font-medium text-lg"
                    placeholder="0,00"
                    step="0.01"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, convenio: !formData.convenio })}
                className={`w-full px-4 py-2.5 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                  formData.convenio
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-gray-50'
                }`}
              >
                <Heart className={`w-4 h-4 ${formData.convenio ? 'fill-emerald-500 text-emerald-500' : ''}`} />
                <span className="text-sm font-medium">{formData.convenio ? 'Via Convênio' : 'Particular'}</span>
              </button>
            </div>
          </div>

          {/* Lembrete */}
          <div className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
            formData.enviarLembrete
              ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-300'
              : 'bg-gray-50 border-gray-200 hover:border-gray-300'
          }`}
            onClick={() => setFormData({ ...formData, enviarLembrete: !formData.enviarLembrete })}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              formData.enviarLembrete ? 'bg-amber-200' : 'bg-gray-200'
            }`}>
              <Bell className={`w-5 h-5 ${formData.enviarLembrete ? 'text-amber-700' : 'text-gray-500'}`} />
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${formData.enviarLembrete ? 'text-amber-800' : 'text-gray-700'}`}>
                Lembrete automático
              </p>
              <p className={`text-xs ${formData.enviarLembrete ? 'text-amber-600' : 'text-gray-500'}`}>
                {formData.enviarLembrete ? 'O paciente receberá um lembrete antes da consulta' : 'Clique para ativar o lembrete'}
              </p>
            </div>
            <div className={`w-12 h-7 rounded-full p-1 transition-all ${
              formData.enviarLembrete ? 'bg-amber-500' : 'bg-gray-300'
            }`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-all ${
                formData.enviarLembrete ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50 rounded-b-2xl">
          <div className="order-2 sm:order-1">
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="w-full sm:w-auto px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-xl font-medium transition-all flex items-center justify-center gap-2 border border-red-200 hover:border-red-300"
              >
                <Trash2 className="w-4 h-4" />
                Excluir agendamento
              </button>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 order-1 sm:order-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-white hover:bg-gray-100 text-gray-700 rounded-xl font-medium transition-all border border-gray-200 hover:border-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all flex items-center justify-center gap-2 group"
            >
              {appointment ? (
                <>
                  <Check className="w-4 h-4" />
                  Salvar Alterações
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
                  Confirmar Agendamento
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

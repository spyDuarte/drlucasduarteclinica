import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useToast } from '../components/Toast';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  User,
  X,
  FileText,
  Search,
  Stethoscope,
  RefreshCw,
  AlertTriangle,
  Activity,
  Scissors,
  Heart,
  UserCheck,
  Trash2,
  Check,
  Phone,
  Mail,
  AlertCircle,
  Pill,
  Bell
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
  const [searchParams] = useSearchParams();
  const { patients, addAppointment, updateAppointment, deleteAppointment, getAppointmentsByDate } = useData();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  // Auto-open modal from query params
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      const timer = setTimeout(() => {
        setShowModal(true);
        setEditingAppointment(null);
        setSelectedTimeSlot(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Agenda</h1>
          <p className="text-slate-500">Gerencie as consultas do dia</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Consulta</span>
        </button>
      </div>

      {/* Date Navigation */}
      <div className="card flex items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateDay(-1)}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Dia anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
               <p className="text-sm font-bold text-slate-900">
                {formatDate(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy")}
              </p>
              <p className="text-xs text-slate-500 font-medium">{formatRelativeDate(selectedDate)}</p>
            </div>
            <button
              onClick={() => navigateDay(1)}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Próximo dia"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button onClick={goToToday} className="btn-secondary text-xs">
            Hoje
          </button>
      </div>

      {/* Schedule Grid */}
      <div className="card p-0 overflow-hidden flex flex-col">
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
           <h2 className="font-semibold text-slate-700 text-sm">
             Agendamentos
           </h2>
           <span className="text-xs font-medium bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
            {dayAppointments.length}
           </span>
        </div>

        <div className="divide-y divide-slate-100 max-h-[calc(100vh-350px)] overflow-y-auto scroll-smooth">
          {TIME_SLOTS.map(time => {
            const appointment = getAppointmentAtTime(time);
            const patient = appointment ? patients.find(p => p.id === appointment.patientId) : null;

            return (
              <div
                key={time}
                className={`flex items-stretch min-h-[80px] group ${
                  appointment ? 'bg-white' : 'bg-slate-50/30 hover:bg-slate-50'
                }`}
              >
                {/* Time */}
                <div className="w-20 p-4 border-r border-slate-100 flex items-start justify-center pt-5">
                  <span className="text-sm font-semibold text-slate-500">{time}</span>
                </div>

                {/* Content */}
                <div className="flex-1 p-2">
                  {appointment ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 h-full p-2 rounded-lg border border-transparent hover:border-slate-200 transition-all">
                      <div
                        className="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
                        onClick={() => handleOpenModal(appointment)}
                      >
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 text-slate-500">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 truncate">
                            {patient?.nome || 'Paciente não encontrado'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                               {translateAppointmentType(appointment.tipo)}
                            </span>
                            {appointment.motivo && (
                              <span className="truncate max-w-[200px]">• {appointment.motivo}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status Actions */}
                      <div className="flex items-center gap-2">
                         {/* Botão de Prontuário */}
                        {(appointment.status === 'em_atendimento' || appointment.status === 'aguardando') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenMedicalRecord(appointment.patientId);
                            }}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Abrir prontuário"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        )}

                        <select
                          value={appointment.status}
                          onChange={e => handleStatusChange(appointment.id, e.target.value as AppointmentStatus)}
                          className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-500 ${getStatusColor(appointment.status)}`}
                        >
                          <option value="agendada">Agendada</option>
                          <option value="confirmada">Confirmada</option>
                          <option value="aguardando">Aguardando</option>
                          <option value="em_atendimento">Em atendimento</option>
                          <option value="finalizada">Finalizada</option>
                          <option value="cancelada">Cancelada</option>
                          <option value="faltou">Faltou</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOpenModal(undefined, time)}
                      className="w-full h-full flex items-center justify-center text-slate-300 hover:text-primary-600 transition-colors gap-2 group-hover:bg-white rounded-lg border border-transparent group-hover:border-slate-200 border-dashed"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-sm font-medium">Agendar</span>
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
  label: string;
}> = {
  primeira_consulta: { icon: UserCheck, color: 'text-blue-600', bgColor: 'bg-blue-50', label: 'Primeira Consulta' },
  retorno: { icon: RefreshCw, color: 'text-green-600', bgColor: 'bg-green-50', label: 'Retorno' },
  urgencia: { icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50', label: 'Urgência' },
  exame: { icon: Activity, color: 'text-purple-600', bgColor: 'bg-purple-50', label: 'Exame' },
  procedimento: { icon: Scissors, color: 'text-orange-600', bgColor: 'bg-orange-50', label: 'Procedimento' },
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
    <div className="modal-overlay fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="modal-container bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {appointment ? 'Editar Consulta' : 'Nova Consulta'}
              </h2>
              <p className="text-sm text-slate-500">
                {formatDate(new Date(formData.data), "EEEE, dd 'de' MMMM")}
              </p>
            </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Paciente */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">Paciente</label>

            <div className="relative">
              <div
                className={`input-field flex items-center gap-2 cursor-pointer ${
                  formErrors.patientId ? 'border-red-500' : ''
                }`}
                onClick={() => setShowPatientSearch(true)}
              >
                <Search className="w-4 h-4 text-slate-400" />
                {selectedPatient ? (
                  <span className="text-slate-900">{selectedPatient.nome}</span>
                ) : (
                  <span className="text-slate-400">Buscar paciente...</span>
                )}
              </div>

              {showPatientSearch && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-hidden">
                  <div className="p-2 border-b border-slate-100">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Digite para buscar..."
                      className="w-full px-3 py-2 bg-slate-50 rounded text-sm outline-none border border-transparent focus:border-primary-300"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredPatients.length === 0 ? (
                      <div className="p-4 text-center text-slate-500 text-sm">
                        Nenhum paciente encontrado
                      </div>
                    ) : (
                      filteredPatients.map(patient => (
                        <div
                          key={patient.id}
                          onClick={() => handleSelectPatient(patient.id)}
                          className={`p-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 ${
                            formData.patientId === patient.id ? 'bg-primary-50' : ''
                          }`}
                        >
                          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-slate-500" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{patient.nome}</p>
                            <p className="text-xs text-slate-500">{patient.telefone}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
               {formErrors.patientId && (
                <p className="text-red-500 text-xs mt-1">{formErrors.patientId}</p>
              )}
            </div>

            {/* Card Detalhes do Paciente (Restored) */}
            {selectedPatient && (
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-2 mt-2">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200 text-slate-400">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900">{selectedPatient.nome}</h3>
                    <p className="text-xs text-slate-500">
                      {calculateAge(selectedPatient.dataNascimento)} anos • {selectedPatient.sexo === 'M' ? 'Masculino' : selectedPatient.sexo === 'F' ? 'Feminino' : 'Outro'}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1 text-xs text-slate-600">
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

                {/* Alertas Médicos */}
                {((selectedPatient.alergias && selectedPatient.alergias.length > 0) || (selectedPatient.medicamentosEmUso && selectedPatient.medicamentosEmUso.length > 0)) && (
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    {selectedPatient.alergias && selectedPatient.alergias.length > 0 && (
                      <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 p-2 rounded border border-red-100">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-bold block">Alergias:</span>
                          {selectedPatient.alergias.join(', ')}
                        </div>
                      </div>
                    )}
                    {selectedPatient.medicamentosEmUso && selectedPatient.medicamentosEmUso.length > 0 && (
                      <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-100">
                        <Pill className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-bold block">Uso contínuo:</span>
                          {selectedPatient.medicamentosEmUso.join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                 {/* Histórico Recente */}
                {patientAppointments.length > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <p className="text-xs font-medium text-slate-500 mb-1">Últimas consultas:</p>
                    <div className="flex flex-wrap gap-1">
                      {patientAppointments.map(apt => (
                        <span key={apt.id} className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-600">
                          {formatDate(new Date(apt.data), 'dd/MM')} - {translateAppointmentType(apt.tipo)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Data */}
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Data</label>
                <input
                  type="date"
                  value={formData.data}
                  onChange={e => setFormData({ ...formData, data: e.target.value })}
                  className="input-field"
                />
             </div>
              {/* Hora */}
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Horário</label>
                <select
                  value={formData.horaInicio}
                  onChange={e => setFormData({ ...formData, horaInicio: e.target.value })}
                  className="input-field"
                >
                  {TIME_SLOTS.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
             </div>
          </div>

          {/* Duração */}
           <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Duração</label>
              <div className="flex flex-wrap gap-2">
                {DURATION_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, duracao: opt.value })}
                    className={`px-3 py-1.5 rounded text-sm font-medium border transition-colors ${
                      formData.duracao === opt.value
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
           </div>

          {/* Tipo de Consulta */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(APPOINTMENT_TYPE_CONFIG) as AppointmentType[]).map(type => {
                const config = APPOINTMENT_TYPE_CONFIG[type];
                const Icon = config.icon;
                const isSelected = formData.tipo === type;

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, tipo: type })}
                    className={`p-3 rounded-lg border text-left flex items-center gap-2 ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                     <div className={`p-1.5 rounded ${isSelected ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-500'}`}>
                       <Icon className="w-4 h-4" />
                     </div>
                     <span className={`text-sm font-medium ${isSelected ? 'text-primary-900' : 'text-slate-700'}`}>
                       {config.label}
                     </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detalhes */}
          <div className="space-y-4">
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Motivo</label>
                <input
                  type="text"
                  value={formData.motivo}
                  onChange={e => setFormData({ ...formData, motivo: e.target.value })}
                  className="input-field"
                  placeholder="Ex: Check-up de rotina"
                />
             </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Valor (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.valor}
                      onChange={e => setFormData({ ...formData, valor: e.target.value })}
                      className="input-field"
                      placeholder="0,00"
                    />
                  </div>
                  <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, convenio: !formData.convenio })}
                        className={`w-full py-2.5 px-4 rounded-lg border flex items-center justify-center gap-2 font-medium ${
                          formData.convenio
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <Heart className="w-4 h-4" />
                        {formData.convenio ? 'Convênio' : 'Particular'}
                      </button>
                  </div>
              </div>
          </div>

          {/* Lembrete (Restored) */}
          <div
             className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
               formData.enviarLembrete ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'
             }`}
             onClick={() => setFormData({ ...formData, enviarLembrete: !formData.enviarLembrete })}
          >
             <div className={`p-2 rounded-full ${formData.enviarLembrete ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-500'}`}>
                <Bell className="w-4 h-4" />
             </div>
             <div className="flex-1">
                <p className={`text-sm font-medium ${formData.enviarLembrete ? 'text-amber-900' : 'text-slate-700'}`}>Lembrete Automático</p>
                <p className="text-xs text-slate-500">Enviar notificação ao paciente antes da consulta</p>
             </div>
             <div className={`w-10 h-6 rounded-full p-1 transition-colors ${formData.enviarLembrete ? 'bg-amber-500' : 'bg-slate-300'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${formData.enviarLembrete ? 'translate-x-4' : 'translate-x-0'}`} />
             </div>
          </div>

        </form>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between rounded-b-lg">
          <div>
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="btn-primary"
            >
              <Check className="w-4 h-4" />
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

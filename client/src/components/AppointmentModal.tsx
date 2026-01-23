import { useState, useMemo } from 'react';
import {
  X,
  User,
  Search,
  AlertCircle,
  Pill,
  Heart,
  Bell,
  Check,
  Trash2,
  Phone,
  Mail
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useToast } from './Toast';
import {
  formatDate,
  calculateAge,
  translateAppointmentType
} from '../utils/helpers';
import type { Appointment, AppointmentStatus, AppointmentType, Patient } from '../types';
import { InputField, SelectField } from './Shared/FormComponents';
import { APPOINTMENT_TYPE_CONFIG, DURATION_OPTIONS, TIME_SLOTS } from '../constants/appointments';

// Types
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

export function AppointmentModal({
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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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
    <div className="modal-overlay fixed inset-0 flex items-center justify-center z-50 p-4 bg-slate-900/50 backdrop-blur-sm">
      <div
        className="modal-container bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col animate-scale-in"
        role="dialog"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 id="modal-title" className="text-lg font-bold text-slate-900">
                {appointment ? 'Editar Consulta' : 'Nova Consulta'}
              </h2>
              <p className="text-sm text-slate-500">
                {formatDate(new Date(formData.data), "EEEE, dd 'de' MMMM")}
              </p>
            </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" aria-hidden="true" />
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
                role="combobox"
                aria-expanded={showPatientSearch}
                aria-haspopup="listbox"
                aria-controls="patient-search-list"
              >
                <Search className="w-4 h-4 text-slate-400" aria-hidden="true" />
                {selectedPatient ? (
                  <span className="text-slate-900">{selectedPatient.nome}</span>
                ) : (
                  <span className="text-slate-400">Buscar paciente...</span>
                )}
              </div>

              {showPatientSearch && (
                <div
                  className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-hidden"
                  id="patient-search-list"
                >
                  <div className="p-2 border-b border-slate-100">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Digite para buscar..."
                      className="w-full px-3 py-2 bg-slate-50 rounded text-sm outline-none border border-transparent focus:border-primary-300"
                      autoFocus
                      aria-label="Filtrar pacientes"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto" role="listbox">
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
                          role="option"
                          aria-selected={formData.patientId === patient.id}
                        >
                          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-slate-500" aria-hidden="true" />
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
                <p className="text-red-500 text-xs mt-1" role="alert">{formErrors.patientId}</p>
              )}
            </div>

            {/* Card Detalhes do Paciente (Restored) */}
            {selectedPatient && (
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-2 mt-2">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200 text-slate-400">
                    <User className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900">{selectedPatient.nome}</h3>
                    <p className="text-xs text-slate-500">
                      {calculateAge(selectedPatient.dataNascimento)} anos • {selectedPatient.sexo === 'M' ? 'Masculino' : selectedPatient.sexo === 'F' ? 'Feminino' : 'Outro'}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" aria-hidden="true" />
                        {selectedPatient.telefone}
                      </span>
                      {selectedPatient.email && (
                         <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" aria-hidden="true" />
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
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                        <div>
                          <span className="font-bold block">Alergias:</span>
                          {selectedPatient.alergias.join(', ')}
                        </div>
                      </div>
                    )}
                    {selectedPatient.medicamentosEmUso && selectedPatient.medicamentosEmUso.length > 0 && (
                      <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-100">
                        <Pill className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
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
             <InputField
                label="Data"
                type="date"
                value={formData.data}
                onChange={v => setFormData({ ...formData, data: v })}
                error={formErrors.data}
              />
              {/* Hora */}
             <SelectField
                label="Horário"
                value={formData.horaInicio}
                onChange={v => setFormData({ ...formData, horaInicio: v })}
                options={TIME_SLOTS.map(time => ({ value: time, label: time }))}
                error={formErrors.horaInicio}
             />
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
                    aria-pressed={formData.duracao === opt.value}
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
                    aria-pressed={isSelected}
                  >
                     <div className={`p-1.5 rounded ${isSelected ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-500'}`}>
                       <Icon className="w-4 h-4" aria-hidden="true" />
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
             <InputField
                label="Motivo"
                value={formData.motivo}
                onChange={v => setFormData({ ...formData, motivo: v })}
                placeholder="Ex: Check-up de rotina"
             />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Valor (R$)"
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={v => setFormData({ ...formData, valor: v })}
                    placeholder="0,00"
                  />
                  <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, convenio: !formData.convenio })}
                        className={`w-full py-2.5 px-4 rounded-lg border flex items-center justify-center gap-2 font-medium ${
                          formData.convenio
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                        aria-pressed={formData.convenio}
                      >
                        <Heart className="w-4 h-4" aria-hidden="true" />
                        {formData.convenio ? 'Convênio' : 'Particular'}
                      </button>
                  </div>
              </div>
          </div>

          {/* Lembrete (Restored) */}
          <button
             type="button"
             className={`w-full flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors text-left ${
               formData.enviarLembrete ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'
             }`}
             onClick={() => setFormData({ ...formData, enviarLembrete: !formData.enviarLembrete })}
             aria-pressed={formData.enviarLembrete}
          >
             <div className={`p-2 rounded-full ${formData.enviarLembrete ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-500'}`}>
                <Bell className="w-4 h-4" aria-hidden="true" />
             </div>
             <div className="flex-1">
                <p className={`text-sm font-medium ${formData.enviarLembrete ? 'text-amber-900' : 'text-slate-700'}`}>Lembrete Automático</p>
                <p className="text-xs text-slate-500">Enviar notificação ao paciente antes da consulta</p>
             </div>
             <div className={`w-10 h-6 rounded-full p-1 transition-colors ${formData.enviarLembrete ? 'bg-amber-500' : 'bg-slate-300'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${formData.enviarLembrete ? 'translate-x-4' : 'translate-x-0'}`} />
             </div>
          </button>

        </form>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between rounded-b-lg">
          <div>
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                aria-label="Excluir consulta"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
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
              <Check className="w-4 h-4" aria-hidden="true" />
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

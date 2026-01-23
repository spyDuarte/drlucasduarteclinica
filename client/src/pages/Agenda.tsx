import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useToast } from '../components/Toast';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  User,
  FileText
} from 'lucide-react';
import {
  formatDate,
  formatRelativeDate,
  translateAppointmentType,
  getStatusColor
} from '../utils/helpers';
import type { Appointment, AppointmentStatus } from '../types';
import { AppointmentModal } from '../components/AppointmentModal';
import { TIME_SLOTS } from '../constants/appointments';

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

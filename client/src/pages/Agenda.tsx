import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useToast } from '../components/Toast';
import {
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import {
  formatDate,
  formatRelativeDate
} from '../utils/helpers';
import type { Appointment, AppointmentStatus } from '../types';
import { AppointmentModal } from '../components/AppointmentModal';
import { AgendaSlot } from '../components/AgendaSlot';
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
  const handleOpenMedicalRecord = useCallback((patientId: string) => {
    navigate(`/pacientes/${patientId}`);
  }, [navigate]);

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

  const handleOpenModal = useCallback((appointment?: Appointment, timeSlot?: string) => {
    setEditingAppointment(appointment || null);
    setSelectedTimeSlot(timeSlot || null);
    setShowModal(true);
  }, []);

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAppointment(null);
    setSelectedTimeSlot(null);
  };

  const handleStatusChange = useCallback((appointmentId: string, newStatus: AppointmentStatus) => {
    updateAppointment(appointmentId, { status: newStatus });
  }, [updateAppointment]);

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
              <AgendaSlot
                key={time}
                time={time}
                appointment={appointment}
                patient={patient}
                onOpenModal={handleOpenModal}
                onOpenMedicalRecord={handleOpenMedicalRecord}
                onStatusChange={handleStatusChange}
              />
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

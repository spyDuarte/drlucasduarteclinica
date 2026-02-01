import React from 'react';
import { Plus, User, FileText } from 'lucide-react';
import type { Appointment, AppointmentStatus, Patient } from '../types';
import { translateAppointmentType, getStatusColor } from '../utils/helpers';

interface AgendaSlotProps {
  time: string;
  appointment?: Appointment;
  patient?: Patient | null;
  onOpenModal: (appointment?: Appointment, timeSlot?: string) => void;
  onOpenMedicalRecord: (patientId: string) => void;
  onStatusChange: (appointmentId: string, status: AppointmentStatus) => void;
}

const AgendaSlot = React.memo(({
  time,
  appointment,
  patient,
  onOpenModal,
  onOpenMedicalRecord,
  onStatusChange
}: AgendaSlotProps) => {
  return (
    <div
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
              onClick={() => onOpenModal(appointment)}
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
                    onOpenMedicalRecord(appointment.patientId);
                  }}
                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  title="Abrir prontuário"
                >
                  <FileText className="w-4 h-4" />
                </button>
              )}

              <select
                value={appointment.status}
                onChange={e => onStatusChange(appointment.id, e.target.value as AppointmentStatus)}
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
            onClick={() => onOpenModal(undefined, time)}
            className="w-full h-full flex items-center justify-center text-slate-300 hover:text-primary-600 transition-colors gap-2 group-hover:bg-white rounded-lg border border-transparent group-hover:border-slate-200 border-dashed"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Agendar</span>
          </button>
        )}
      </div>
    </div>
  );
});

AgendaSlot.displayName = 'AgendaSlot';

export { AgendaSlot };

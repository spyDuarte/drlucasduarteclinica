import { Link } from 'react-router-dom';
import { Calendar, Stethoscope } from 'lucide-react';
import type { Appointment, Patient } from '../../types';
import { getInitials, translateAppointmentStatus } from '../../utils/helpers';

interface RecentAppointmentsProps {
  appointments: Appointment[];
  patients: Patient[];
}

export function RecentAppointments({ appointments, patients }: RecentAppointmentsProps) {
  return (
    <div className="lg:col-span-2 card p-0 overflow-hidden flex flex-col h-full border border-slate-200 shadow-sm">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
         <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-500" />
            <h2 className="font-bold text-slate-800">Consultas de Hoje</h2>
         </div>
         <Link to="/agenda" className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline">
           Ver todas
         </Link>
      </div>

      <div className="p-0">
         {appointments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">Nenhuma consulta agendada para hoje.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {appointments.slice(0, 5).map((appointment) => {
               const patient = patients.find(p => p.id === appointment.patientId);
               return (
                 <div key={appointment.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center gap-4 group">
                    <div className="text-center w-14 py-2 bg-slate-100 rounded-lg text-slate-700 border border-slate-200 font-bold text-sm">
                       {appointment.horaInicio}
                    </div>

                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm border border-primary-200">
                      {getInitials(patient?.nome || 'P')}
                    </div>

                    <div className="flex-1 min-w-0">
                       <p className="text-sm font-bold text-slate-900 truncate group-hover:text-primary-700 transition-colors">
                         {patient?.nome}
                       </p>
                       <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                         {appointment.motivo}
                       </p>
                    </div>

                    <Link
                      to={`/pacientes/${patient?.id}`}
                      className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Iniciar Atendimento"
                      aria-label={`Iniciar atendimento de ${patient?.nome}`}
                    >
                      <Stethoscope className="w-5 h-5" />
                    </Link>

                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                      appointment.status === 'confirmada' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      appointment.status === 'agendada' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                       {translateAppointmentStatus(appointment.status)}
                    </span>
                 </div>
               );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

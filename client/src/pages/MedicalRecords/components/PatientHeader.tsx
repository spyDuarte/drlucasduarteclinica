import { sortBy, calculateAge, formatDate, formatCPF, formatPhone } from '../../../utils/helpers';
import type { Patient, MedicalRecord } from '../../../types';

interface PatientHeaderProps {
  patient: Patient;
  records: MedicalRecord[];
}

export function PatientHeader({ patient, records }: PatientHeaderProps) {
  const sortedRecords = sortBy(records, 'data', 'desc');
  const lastVisit = sortedRecords.length > 0 ? sortedRecords[0] : null;
  const age = calculateAge(patient.dataNascimento);

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 shrink-0">
      <div className="flex flex-col justify-center">
        <h2 className="text-base font-bold text-slate-900 leading-tight">{patient.nome}</h2>
        <p className="text-xs text-slate-500 mt-1 font-mono">{formatCPF(patient.cpf)}</p>
      </div>

      <div className="flex flex-col justify-center border-l border-slate-100 pl-6 md:border-l-0 lg:border-l">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Idade</span>
        <div className="flex items-baseline gap-2">
           <span className="text-sm font-semibold text-slate-700">{age} anos</span>
           <span className="text-[11px] text-slate-400">{formatDate(patient.dataNascimento)}</span>
        </div>
      </div>

      <div className="flex flex-col justify-center lg:border-l border-slate-100 lg:pl-6">
         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Contato</span>
         <div className="text-sm text-slate-700 font-medium">{formatPhone(patient.telefone)}</div>
      </div>

      <div className="flex flex-col justify-center lg:border-l border-slate-100 lg:pl-6">
         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Alergias</span>
         <div className="text-sm font-medium truncate">
            {patient.alergias && patient.alergias.length > 0 ? (
               <span
                 className="text-red-600 bg-red-50 px-2 py-0.5 rounded-full text-xs"
                 title={Array.isArray(patient.alergias) ? patient.alergias.join(', ') : patient.alergias}
               >
                 {Array.isArray(patient.alergias) ? patient.alergias[0] + (patient.alergias.length > 1 ? '...' : '') : patient.alergias}
               </span>
            ) : (
               <span className="text-slate-400 text-xs">Nenhuma registrada</span>
            )}
         </div>
      </div>

      <div className="flex flex-col justify-center lg:border-l border-slate-100 lg:pl-6">
         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Histórico</span>
         <div className="flex items-center gap-4">
            <div>
               <span className="text-lg font-bold text-primary-600">{records.length}</span>
               <span className="text-[10px] text-slate-500 ml-1">Visitas</span>
            </div>
            {lastVisit && (
               <div className="pl-4 border-l border-slate-100">
                  <div className="text-[10px] text-slate-400 uppercase">Última</div>
                  <div className="text-xs font-medium text-slate-700">{formatDate(lastVisit.data, 'dd/MM')}</div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, Edit2, Trash2, FileText, ShieldCheck, ShieldAlert } from 'lucide-react';
import { formatDate, calculateAge, formatCPF, formatPhone, getInitials } from '../utils/helpers';
import type { Patient } from '../types';

interface PatientRowProps {
  patient: Patient;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
}

export const PatientRow = React.memo(({ patient, onEdit, onDelete }: PatientRowProps) => {
  return (
    <tr className="hover:bg-slate-50 transition-colors group">
      <td className="table-cell">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 font-bold border border-primary-100 group-hover:bg-primary-100 group-hover:border-primary-200 transition-colors">
            {getInitials(patient.nome)}
          </div>
          <div>
            <p className="font-semibold text-slate-900 group-hover:text-primary-700 transition-colors">{patient.nome}</p>
            <p className="text-xs text-slate-500 font-mono">{formatCPF(patient.cpf)}</p>
            <div className="mt-1">
              {patient.consents?.find(c => c.type === 'tratamento_dados_saude')?.granted ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                  <ShieldCheck className="h-3 w-3" /> LGPD consentido
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                  <ShieldAlert className="h-3 w-3" /> Sem consentimento LGPD
                </span>
              )}
            </div>
          </div>
        </div>
      </td>
      <td className="table-cell">
        <div className="space-y-1">
          <p className="flex items-center gap-2 text-sm text-slate-700">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatPhone(patient.telefone)}</span>
          </p>
          {patient.email && (
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {patient.email}
            </p>
          )}
        </div>
      </td>
      <td className="table-cell">
         <span className="text-slate-700 font-medium">{formatDate(patient.dataNascimento)}</span>
         <span className="text-slate-400 text-xs ml-1">
              ({calculateAge(patient.dataNascimento)} anos)
         </span>
      </td>
      <td className="table-cell">
        {patient.convenio ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
            {patient.convenio.nome}
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            Particular
          </span>
        )}
      </td>
      <td className="table-cell text-right">
        <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
          <Link
            to={`/pacientes/${patient.id}`}
            className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="Ver prontuário"
          >
            <FileText className="w-4 h-4" />
          </Link>
          <button
            onClick={() => onEdit(patient)}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(patient)}
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Excluir"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
});

PatientRow.displayName = 'PatientRow';

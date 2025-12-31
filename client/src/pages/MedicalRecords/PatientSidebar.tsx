import {
  User,
  Calendar,
  Phone,
  Mail,
  AlertTriangle,
  Pill,
  Shield,
  Users,
  ClipboardList
} from 'lucide-react';
import { formatDate, calculateAge, formatCPF, formatPhone } from '../../utils/helpers';
import type { Patient, MedicalRecord } from '../../types';

interface PatientSidebarProps {
  patient: Patient;
  records: MedicalRecord[];
}

export function PatientSidebar({ patient, records }: PatientSidebarProps) {
  return (
    <div className="space-y-4 lg:sticky lg:top-4 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-2">
      {/* Profile Card Premium */}
      <div className="patient-profile-card p-5">
        <div className="flex items-start gap-4 mb-5">
          <div className="patient-avatar">
            <User className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 truncate">{patient.nome}</h2>
            <p className="text-sm text-slate-500 font-medium">{formatCPF(patient.cpf)}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full text-xs font-semibold">
                <Calendar className="w-3 h-3" />
                {calculateAge(patient.dataNascimento)} anos
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <InfoRow icon={Calendar} label="Nascimento" value={formatDate(patient.dataNascimento)} />
          <InfoRow icon={Phone} label="Telefone" value={formatPhone(patient.telefone)} />
          {patient.email && (
            <InfoRow icon={Mail} label="E-mail" value={patient.email} truncate />
          )}
        </div>

        {patient.convenio && (
          <div className="mt-4 p-3 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-800">{patient.convenio.nome}</span>
            </div>
            <p className="text-xs text-emerald-600 ml-6">
              Carteira: {patient.convenio.numero}
            </p>
          </div>
        )}
      </div>

      {/* Allergies - Alert Card */}
      {patient.alergias && patient.alergias.length > 0 && (
        <div className="alert-card-danger p-4">
          <div className="flex items-center gap-2 text-red-700 mb-3">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <h3 className="font-semibold text-sm">Alergias</h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {patient.alergias.map((alergia, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium"
              >
                {alergia}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Current Medications */}
      {patient.medicamentosEmUso && patient.medicamentosEmUso.length > 0 && (
        <div className="patient-profile-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
              <Pill className="w-4 h-4 text-violet-600" />
            </div>
            <h3 className="font-semibold text-sm text-gray-800">Medicamentos em uso</h3>
          </div>
          <div className="space-y-2">
            {patient.medicamentosEmUso.map((med, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                <div className="w-1.5 h-1.5 bg-violet-400 rounded-full" />
                <span className="text-sm text-gray-700">{med}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Family History */}
      {patient.historicoFamiliar && (
        <div className="patient-profile-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="font-semibold text-sm text-gray-800">Histórico familiar</h3>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{patient.historicoFamiliar}</p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="patient-profile-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <ClipboardList className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="font-semibold text-sm text-gray-800">Resumo</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-slate-50 rounded-xl">
            <p className="text-2xl font-bold text-primary-600">{records.length}</p>
            <p className="text-xs text-slate-500 font-medium">Atendimentos</p>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-xl">
            <p className="text-2xl font-bold text-emerald-600">
              {records.length > 0 ? formatDate(records[0]?.data, 'dd/MM') : '-'}
            </p>
            <p className="text-xs text-slate-500 font-medium">Último</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface InfoRowProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  truncate?: boolean;
}

function InfoRow({ icon: Icon, label, value, truncate }: InfoRowProps) {
  return (
    <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div className={truncate ? 'min-w-0' : ''}>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className={`text-sm text-slate-700 font-medium ${truncate ? 'truncate' : ''}`}>{value}</p>
      </div>
    </div>
  );
}

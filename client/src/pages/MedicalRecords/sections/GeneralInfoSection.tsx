import { Info } from 'lucide-react';
import { SectionHeader, InputField, SelectField } from '../../../components/Shared/FormComponents';
import type { SectionProps } from './types';

export function GeneralInfoSection({ formData, updateField }: SectionProps) {
  return (
    <div className="space-y-6">
       <SectionHeader title="Informações Gerais" subtitle="Dados básicos do atendimento" icon={Info} />
       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <InputField
              label="Data do atendimento"
              type="date"
              value={formData.data}
              onChange={val => updateField('data', val)}
            />
            <SelectField
              label="Tipo de atendimento"
              value={formData.tipoAtendimento}
              onChange={val => updateField('tipoAtendimento', val)}
              options={[
                { value: "consulta", label: "Consulta" },
                { value: "retorno", label: "Retorno" },
                { value: "urgencia", label: "Urgência" },
                { value: "emergencia", label: "Emergência" },
                { value: "teleconsulta", label: "Teleconsulta" },
                { value: "procedimento", label: "Procedimento" },
                { value: "avaliacao_pre_operatoria", label: "Avaliação Pré-operatória" },
                { value: "pos_operatorio", label: "Pós-operatório" }
              ]}
            />
            <InputField
              label="Local"
              value={formData.localAtendimento || ''}
              onChange={val => updateField('localAtendimento', val)}
              placeholder="Consultório, Hospital..."
            />
          </div>
       </div>
    </div>
  );
}

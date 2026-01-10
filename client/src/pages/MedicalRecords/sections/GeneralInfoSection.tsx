import { Info } from 'lucide-react';
import { SectionHeader } from './components';
import type { SectionProps } from './types';

export function GeneralInfoSection({ formData, updateField }: SectionProps) {
  return (
    <div className="space-y-6">
       <SectionHeader title="Informações Gerais" subtitle="Dados básicos do atendimento" icon={Info} />
       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Data do atendimento</label>
              <input
                type="date"
                value={formData.data}
                onChange={e => updateField('data', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo de atendimento</label>
              <select
                value={formData.tipoAtendimento}
                onChange={e => updateField('tipoAtendimento', e.target.value)}
                className="input-field"
              >
                <option value="consulta">Consulta</option>
                <option value="retorno">Retorno</option>
                <option value="urgencia">Urgência</option>
                <option value="emergencia">Emergência</option>
                <option value="teleconsulta">Teleconsulta</option>
                <option value="procedimento">Procedimento</option>
                <option value="avaliacao_pre_operatoria">Avaliação Pré-operatória</option>
                <option value="pos_operatorio">Pós-operatório</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Local</label>
              <input
                type="text"
                value={formData.localAtendimento}
                onChange={e => updateField('localAtendimento', e.target.value)}
                className="input-field"
                placeholder="Consultório, Hospital..."
              />
            </div>
          </div>
       </div>
    </div>
  );
}

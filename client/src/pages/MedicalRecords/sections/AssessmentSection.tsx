import { Clipboard } from 'lucide-react';
import { SectionHeader, InputField } from '../../../components/Shared/FormComponents';
import { CID10Selector } from '../../../components/CID10Selector';
import type { SectionProps } from './types';

export function AssessmentSection({ formData, updateField, formErrors }: SectionProps) {
  return (
    <div className="space-y-6">
       <SectionHeader title="Avaliação" subtitle="Diagnóstico e Raciocínio Clínico" icon={Clipboard} />
       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="bg-amber-50/50 rounded-lg p-5 border border-amber-100/60 mb-6">
             <label className="block text-sm font-bold text-amber-900 mb-2">Diagnóstico Principal (CID-10) <span className="text-red-500">*</span></label>
             <CID10Selector
                selectedCodes={formData.cid10 ? formData.cid10.split(',').map((c: string) => c.trim()).filter(Boolean) : []}
                onChange={(codes) => updateField('cid10', codes.join(', '))}
                error={formErrors?.cid10}
              />
          </div>

          <div className="mb-6">
             <InputField
                label="Diagnóstico por extenso / Hipótese Diagnóstica"
                value={formData.diagnosticoPrincipal || ''}
                onChange={(v: string) => updateField('diagnosticoPrincipal', v)}
                isSmall={false}
             />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             <InputField
                label="Diagnósticos Secundários"
                value={formData.diagnosticosSecundarios || ''}
                onChange={(v: string) => updateField('diagnosticosSecundarios', v)}
                placeholder="Comorbidades..."
                isSmall
             />
             <InputField
                label="Diagnóstico Diferencial"
                value={formData.diagnosticoDiferencial || ''}
                onChange={(v: string) => updateField('diagnosticoDiferencial', v)}
                placeholder="A descartar..."
                isSmall
             />
          </div>
       </div>
    </div>
  );
}

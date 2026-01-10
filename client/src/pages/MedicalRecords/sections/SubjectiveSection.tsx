import { User, AlertCircle, Activity } from 'lucide-react';
import { SectionHeader, InputField, CollapsibleSection } from './components';
import type { SectionWithToggleProps } from './types';

export function SubjectiveSection({ formData, updateField, expandedSections, toggleSection, formErrors }: SectionWithToggleProps) {
  return (
    <div className="space-y-6">
       <SectionHeader title="Subjetivo" subtitle="Anamnese e História Clínica" icon={User} />
       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 gap-6">
            <div className={formErrors?.queixaPrincipal ? 'animate-shake' : ''}>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Queixa Principal <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.queixaPrincipal}
                onChange={e => updateField('queixaPrincipal', e.target.value)}
                className={`w-full px-4 py-3 bg-slate-50 border rounded-lg focus:ring-2 outline-none transition-all text-base
                  ${formErrors?.queixaPrincipal
                    ? 'border-red-300 focus:ring-red-200 bg-red-50 text-red-900 placeholder-red-400'
                    : 'border-slate-200 focus:ring-primary-500/20 focus:border-primary-500'}`}
                placeholder="Descreva o motivo principal do atendimento..."
              />
              {formErrors?.queixaPrincipal && (
                <div className="flex items-center gap-1 mt-2 text-red-600 text-xs font-medium">
                  <AlertCircle className="w-3 h-3" />
                  {formErrors.queixaPrincipal}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Início dos sintomas</label>
                <input
                  type="date"
                  value={formData.dataInicioSintomas}
                  onChange={e => updateField('dataInicioSintomas', e.target.value)}
                  className="input-field"
                />
              </div>
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Duração</label>
                <input
                  type="text"
                  value={formData.duracaoSintomas}
                  onChange={e => updateField('duracaoSintomas', e.target.value)}
                  className="input-field"
                  placeholder="Ex: 3 dias, 2 semanas..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                História da Doença Atual (HDA)
              </label>
              <textarea
                value={formData.historicoDoencaAtual}
                onChange={e => updateField('historicoDoencaAtual', e.target.value)}
                className="input-field min-h-[120px] leading-relaxed"
                placeholder="Descreva a evolução cronológica dos sintomas..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField label="Fatores de Melhora" value={formData.fatoresMelhora} onChange={(v: string) => updateField('fatoresMelhora', v)} placeholder="Repouso, medicação..." />
              <InputField label="Fatores de Piora" value={formData.fatoresPiora} onChange={(v: string) => updateField('fatoresPiora', v)} placeholder="Esforço, alimentação..." />
            </div>

            <CollapsibleSection
              title="Histórico e Hábitos"
              icon={<Activity className="w-4 h-4 text-primary-500" />}
              isExpanded={expandedSections.habitosVida}
              onToggle={() => toggleSection && toggleSection('habitosVida')}
            >
              <div className="space-y-5">
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <InputField label="Tabagismo" value={formData.tabagismo} onChange={(v: string) => updateField('tabagismo', v)} isSmall />
                    <InputField label="Etilismo" value={formData.etilismo} onChange={(v: string) => updateField('etilismo', v)} isSmall />
                    <InputField label="Atividade física" value={formData.atividadeFisica} onChange={(v: string) => updateField('atividadeFisica', v)} isSmall />
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Histórico Familiar</label>
                    <textarea
                      value={formData.historicoFamiliar}
                      onChange={e => updateField('historicoFamiliar', e.target.value)}
                      className="input-field text-sm"
                      rows={2}
                      placeholder="Doenças na família..."
                    />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Cirurgias anteriores" value={formData.cirurgiasAnteriores} onChange={(v: string) => updateField('cirurgiasAnteriores', v)} isSmall />
                    <InputField label="Alergias (adicionais)" value={formData.alergias} onChange={(v: string) => updateField('alergias', v)} isSmall />
                 </div>
              </div>
            </CollapsibleSection>
          </div>
       </div>
    </div>
  );
}

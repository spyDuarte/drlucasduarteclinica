import { User, Activity } from 'lucide-react';
import { SectionHeader, InputField, TextAreaField, CollapsibleSection } from '../../../components/Shared/FormComponents';
import type { SectionWithToggleProps } from './types';

export function SubjectiveSection({ formData, updateField, expandedSections, toggleSection, formErrors }: SectionWithToggleProps) {
  return (
    <div className="space-y-6">
       <SectionHeader title="Subjetivo" subtitle="Anamnese e História Clínica" icon={User} />
       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 gap-6">
            <div className={formErrors?.queixaPrincipal ? 'animate-shake' : ''}>
              <InputField
                label="Queixa Principal"
                required
                value={formData.queixaPrincipal}
                onChange={val => updateField('queixaPrincipal', val)}
                error={formErrors?.queixaPrincipal}
                placeholder="Descreva o motivo principal do atendimento..."
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                label="Início dos sintomas"
                type="date"
                value={formData.dataInicioSintomas || ''}
                onChange={val => updateField('dataInicioSintomas', val)}
              />
              <InputField
                label="Duração"
                value={formData.duracaoSintomas || ''}
                onChange={val => updateField('duracaoSintomas', val)}
                placeholder="Ex: 3 dias, 2 semanas..."
              />
            </div>

            <TextAreaField
              label="História da Doença Atual (HDA)"
              value={formData.historicoDoencaAtual || ''}
              onChange={val => updateField('historicoDoencaAtual', val)}
              rows={4}
              placeholder="Descreva a evolução cronológica dos sintomas..."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField label="Fatores de Melhora" value={formData.fatoresMelhora || ''} onChange={(v: string) => updateField('fatoresMelhora', v)} placeholder="Repouso, medicação..." />
              <InputField label="Fatores de Piora" value={formData.fatoresPiora || ''} onChange={(v: string) => updateField('fatoresPiora', v)} placeholder="Esforço, alimentação..." />
            </div>

            <CollapsibleSection
              title="Histórico e Hábitos"
              icon={<Activity className="w-4 h-4 text-primary-500" />}
              isExpanded={expandedSections.habitosVida}
              onToggle={() => toggleSection && toggleSection('habitosVida')}
            >
              <div className="space-y-5">
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <InputField label="Tabagismo" value={formData.tabagismo || ''} onChange={(v: string) => updateField('tabagismo', v)} isSmall />
                    <InputField label="Etilismo" value={formData.etilismo || ''} onChange={(v: string) => updateField('etilismo', v)} isSmall />
                    <InputField label="Atividade física" value={formData.atividadeFisica || ''} onChange={(v: string) => updateField('atividadeFisica', v)} isSmall />
                 </div>

                 <TextAreaField
                    label="Histórico Familiar"
                    value={formData.historicoFamiliar || ''}
                    onChange={val => updateField('historicoFamiliar', val)}
                    rows={2}
                    placeholder="Doenças na família..."
                    className="input-field text-sm"
                 />

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Cirurgias anteriores" value={formData.cirurgiasAnteriores || ''} onChange={(v: string) => updateField('cirurgiasAnteriores', v)} isSmall />
                    <InputField label="Alergias (adicionais)" value={formData.alergias || ''} onChange={(v: string) => updateField('alergias', v)} isSmall />
                 </div>
              </div>
            </CollapsibleSection>
          </div>
       </div>
    </div>
  );
}

import { Activity, Thermometer, Heart, Wind, Droplets, Gauge, Ruler, Weight, Calculator, Stethoscope } from 'lucide-react';
import { type ReactNode, type ElementType } from 'react';
import { SectionHeader, InputField, NumberField, SelectField, CollapsibleSection } from './components';
import { VitalSignsValidator } from '../../../components/VitalSignsValidator';
import { calculateIMC } from '../../../utils/helpers';
import type { SectionWithToggleProps } from './types';

// Redesigned Vital Sign Card (Local to this section for now, but could be shared)
interface VitalSignCardProps {
  icon: ElementType;
  label: string;
  value: string;
  unit: string;
  colorClass: string;
  children: ReactNode;
}

function VitalSignCard({ icon: Icon, label, value, unit, colorClass, children }: VitalSignCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-md ${colorClass}`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        </div>
      </div>
      <div className="mb-2">
        {children}
      </div>
      {value && (
        <div className="mt-2 pt-2 border-t border-slate-50 flex items-baseline justify-end gap-1">
          <span className="text-xl font-bold text-slate-800 tabular-nums tracking-tight">{value}</span>
          <span className="text-xs font-medium text-slate-400">{unit}</span>
        </div>
      )}
    </div>
  );
}

export function ObjectiveSection({ formData, updateField, expandedSections, toggleSection }: SectionWithToggleProps) {
  const imcData = (() => {
    const peso = formData.peso ? Number(formData.peso) : 0;
    const altura = formData.altura ? Number(formData.altura) : 0;
    return calculateIMC(peso, altura);
  })();

  return (
    <div className="space-y-6">
       <SectionHeader title="Objetivo" subtitle="Exame Físico e Sinais Vitais" icon={Activity} />

       <div className="space-y-8">
        {/* Sinais Vitais Wrapper */}
        <div className="bg-slate-50/50 rounded-xl p-6 border border-slate-200">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
             <Activity className="w-4 h-4 text-slate-500" />
             Sinais Vitais
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            <VitalSignCard
              icon={Thermometer}
              label="Temp"
              value={formData.temperatura || ''}
              unit="°C"
              colorClass="bg-orange-50 text-orange-600"
            >
              <NumberField
                label=""
                value={formData.temperatura}
                onChange={(v: string) => updateField('temperatura', v)}
                step={0.1}
              />
            </VitalSignCard>

            <VitalSignCard
              icon={Heart}
              label="F.C."
              value={formData.frequenciaCardiaca || ''}
              unit="bpm"
              colorClass="bg-red-50 text-red-600"
            >
              <NumberField
                label=""
                value={formData.frequenciaCardiaca}
                onChange={(v: string) => updateField('frequenciaCardiaca', v)}
              />
            </VitalSignCard>

            <VitalSignCard
              icon={Wind}
              label="F.R."
              value={formData.frequenciaRespiratoria || ''}
              unit="irpm"
              colorClass="bg-sky-50 text-sky-600"
            >
              <NumberField
                label=""
                value={formData.frequenciaRespiratoria}
                onChange={(v: string) => updateField('frequenciaRespiratoria', v)}
              />
            </VitalSignCard>

            <VitalSignCard
              icon={Activity}
              label="P.A."
              value={formData.pressaoArterial || ''}
              unit="mmHg"
              colorClass="bg-rose-50 text-rose-600"
            >
              <InputField
                label=""
                value={formData.pressaoArterial}
                onChange={(v: string) => updateField('pressaoArterial', v)}
                placeholder="120/80"
                isSmall
              />
            </VitalSignCard>

            <VitalSignCard
              icon={Droplets}
              label="SpO₂"
              value={formData.saturacaoO2 || ''}
              unit="%"
              colorClass="bg-blue-50 text-blue-600"
            >
              <NumberField
                label=""
                value={formData.saturacaoO2}
                onChange={(v: string) => updateField('saturacaoO2', v)}
              />
            </VitalSignCard>

            <VitalSignCard
              icon={Gauge}
              label="Dor"
              value={formData.escalaDor || ''}
              unit="/10"
              colorClass="bg-slate-100 text-slate-600"
            >
              <NumberField
                label=""
                value={formData.escalaDor}
                onChange={(v: string) => updateField('escalaDor', v)}
                min={0}
                max={10}
              />
            </VitalSignCard>

            <VitalSignCard
              icon={Droplets}
              label="HGT"
              value={formData.glicemiaCapilar || ''}
              unit="mg/dL"
              colorClass="bg-amber-50 text-amber-600"
            >
              <NumberField
                label=""
                value={formData.glicemiaCapilar}
                onChange={(v: string) => updateField('glicemiaCapilar', v)}
              />
            </VitalSignCard>
          </div>

          <div className="mb-4">
             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Ruler className="w-3 h-3" /> Antropometria
             </h4>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <VitalSignCard
                  icon={Weight}
                  label="Peso"
                  value={formData.peso || ''}
                  unit="kg"
                  colorClass="bg-violet-50 text-violet-600"
                >
                  <NumberField
                    label=""
                    value={formData.peso}
                    onChange={(v: string) => updateField('peso', v)}
                    step={0.1}
                  />
                </VitalSignCard>

                <VitalSignCard
                  icon={Ruler}
                  label="Altura"
                  value={formData.altura || ''}
                  unit="cm"
                  colorClass="bg-indigo-50 text-indigo-600"
                >
                  <NumberField
                    label=""
                    value={formData.altura}
                    onChange={(v: string) => updateField('altura', v)}
                  />
                </VitalSignCard>

                <VitalSignCard
                  icon={Calculator}
                  label="IMC"
                  value={imcData.value > 0 ? imcData.value.toString() : ''}
                  unit="kg/m²"
                  colorClass="bg-purple-50 text-purple-600"
                >
                  <div className="text-xs text-slate-600 italic py-2">
                    {imcData.value > 0 ? (
                      <span style={{ color: imcData.color }}>
                        {imcData.classification}
                      </span>
                    ) : 'Calculado auto.'}
                  </div>
                </VitalSignCard>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200/60">
             <VitalSignsValidator
              vitalSigns={{
                pressaoArterial: formData.pressaoArterial,
                frequenciaCardiaca: formData.frequenciaCardiaca ? Number(formData.frequenciaCardiaca) : undefined,
                frequenciaRespiratoria: formData.frequenciaRespiratoria ? Number(formData.frequenciaRespiratoria) : undefined,
                temperatura: formData.temperatura ? Number(formData.temperatura) : undefined,
                saturacaoO2: formData.saturacaoO2 ? Number(formData.saturacaoO2) : undefined,
                peso: formData.peso ? Number(formData.peso) : undefined,
                altura: formData.altura ? Number(formData.altura) : undefined,
                glicemiaCapilar: formData.glicemiaCapilar ? Number(formData.glicemiaCapilar) : undefined,
                escalaDor: formData.escalaDor ? Number(formData.escalaDor) : undefined,
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Exame Físico</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <SelectField
              label="Estado Geral"
              value={formData.estadoGeral}
              onChange={(v: string) => updateField('estadoGeral', v)}
              options={[
                { value: '', label: 'Selecione' },
                { value: 'bom', label: 'Bom' },
                { value: 'regular', label: 'Regular' },
                { value: 'ruim', label: 'Ruim' },
                { value: 'grave', label: 'Grave' }
              ]}
            />
            <SelectField
              label="Consciência"
              value={formData.nivelConsciencia}
              onChange={(v: string) => updateField('nivelConsciencia', v)}
              options={[
                { value: '', label: 'Selecione' },
                { value: 'consciente_orientado', label: 'Consciente e Orientado' },
                { value: 'confuso', label: 'Confuso' },
                { value: 'sonolento', label: 'Sonolento' },
                { value: 'comatoso', label: 'Comatoso' }
              ]}
            />
            <NumberField label="Glasgow" value={formData.escalaGlasgow} onChange={(v: string) => updateField('escalaGlasgow', v)} min={3} max={15} />
          </div>

          <label className="block text-sm font-medium text-slate-700 mb-2">Descrição Detalhada</label>
          <textarea
              value={formData.exameFisico}
              onChange={e => updateField('exameFisico', e.target.value)}
              className="input-field min-h-[100px] leading-relaxed"
              placeholder="Descreva os achados..."
            />
        </div>

        <CollapsibleSection
            title="Exame Segmentar"
            icon={<Stethoscope className="w-4 h-4 text-emerald-500" />}
            isExpanded={expandedSections.exameFisicoDetalhado}
            onToggle={() => toggleSection && toggleSection('exameFisicoDetalhado')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Cabeça e Pescoço" value={formData.exameCabecaPescoco} onChange={(v: string) => updateField('exameCabecaPescoco', v)} isSmall />
              <InputField label="Cardiovascular" value={formData.exameCardiovascular} onChange={(v: string) => updateField('exameCardiovascular', v)} isSmall />
              <InputField label="Respiratório" value={formData.examePulmonar} onChange={(v: string) => updateField('examePulmonar', v)} isSmall />
              <InputField label="Abdome" value={formData.exameAbdome} onChange={(v: string) => updateField('exameAbdome', v)} isSmall />
              <InputField label="Neurológico" value={formData.exameNeurologico} onChange={(v: string) => updateField('exameNeurologico', v)} isSmall />
              <InputField label="Pele e Anexos" value={formData.examePele} onChange={(v: string) => updateField('examePele', v)} isSmall />
            </div>
          </CollapsibleSection>
       </div>
    </div>
  );
}

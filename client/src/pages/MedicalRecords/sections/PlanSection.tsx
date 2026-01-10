import { CheckSquare, ClipboardList, X } from 'lucide-react';
import { SectionHeader, InputField, SelectField, NumberField, TextAreaField } from '../../../components/Shared/FormComponents';
import { DrugInteractionChecker } from '../../../components/DrugInteractionChecker';
import { OrientationTemplateSelector } from '../../../components/OrientationTemplateSelector';
import { MedicationSelector } from '../../../components/MedicationSelector';
import { generateId } from '../../../utils/helpers';
import type { PrescriptionData } from '../types';
import type { Patient } from '../../../types';
import type { SectionProps } from './types';

interface PlanSectionProps extends SectionProps {
  newPrescription: PrescriptionData;
  setNewPrescription: (data: PrescriptionData) => void;
  addPrescription: () => void;
  removePrescription: (index: number) => void;
  patient?: Patient;
}

interface PrescriptionSectionProps {
  prescricoes: PrescriptionData[];
  newPrescription: PrescriptionData;
  setNewPrescription: (data: PrescriptionData) => void;
  addPrescription: () => void;
  removePrescription: (index: number) => void;
}

function PrescriptionSection({ prescricoes, newPrescription, setNewPrescription, addPrescription, removePrescription }: PrescriptionSectionProps) {
  return (
    <div>
      {prescricoes.length > 0 && (
        <div className="space-y-2 mb-4">
          {prescricoes.map((rx: PrescriptionData, idx: number) => (
            <div key={idx} className="flex items-center gap-2 p-3 bg-white rounded-lg border border-slate-100 shadow-sm group">
              <span className="flex-1 text-sm text-slate-700">
                <strong className="text-slate-900">{rx.medicamento}</strong> {rx.concentracao} <span className="text-slate-400 mx-1">•</span> {rx.posologia}
                {rx.viaAdministracao && <span className="text-slate-500"> ({rx.viaAdministracao})</span>}
              </span>
              <button type="button" onClick={() => removePrescription(idx)} className="text-slate-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <MedicationSelector
          value={newPrescription.medicamento}
          onChange={(value: string) => setNewPrescription({ ...newPrescription, medicamento: value })}
          className="input-field text-sm w-full"
        />
        <input type="text" value={newPrescription.concentracao} onChange={e => setNewPrescription({ ...newPrescription, concentracao: e.target.value })} className="input-field text-sm" placeholder="Concentração (ex: 500mg)" />
        <select value={newPrescription.formaFarmaceutica} onChange={e => setNewPrescription({ ...newPrescription, formaFarmaceutica: e.target.value })} className="input-field text-sm">
          <option>Comprimido</option>
          <option>Cápsula</option>
          <option>Solução oral</option>
          <option>Suspensão</option>
          <option>Xarope</option>
          <option>Gotas</option>
          <option>Pomada</option>
          <option>Creme</option>
          <option>Gel</option>
          <option>Injetável</option>
        </select>
        <input type="text" value={newPrescription.posologia} onChange={e => setNewPrescription({ ...newPrescription, posologia: e.target.value })} className="input-field text-sm" placeholder="Posologia (ex: 1cp 8/8h)" />
      </div>
      <div className="flex justify-end">
         <button type="button" onClick={addPrescription} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-900 transition-colors flex items-center gap-2">
            <ClipboardList className="w-3 h-3" />
            Adicionar à Receita
         </button>
      </div>
    </div>
  );
}

export function PlanSection({ formData, updateField, newPrescription, setNewPrescription, addPrescription, removePrescription, formErrors, patient }: PlanSectionProps) {
  return (
    <div className="space-y-6">
       <SectionHeader title="Plano Terapêutico" subtitle="Conduta, Prescrições e Orientações" icon={CheckSquare} />
       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="space-y-8">
             <div>
                <TextAreaField
                  label="Conduta Clínica"
                  required
                  value={formData.conduta || ''}
                  onChange={val => updateField('conduta', val)}
                  rows={4}
                  placeholder="Descreva o plano de tratamento..."
                  error={formErrors?.conduta}
                />
             </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                   <h4 className="font-bold text-slate-700 flex items-center gap-2 text-sm">
                      <ClipboardList className="w-4 h-4" /> Prescrição Medicamentosa
                   </h4>
                </div>
                <div className="p-4 bg-white">
                   <PrescriptionSection
                    prescricoes={formData.prescricoes}
                    newPrescription={newPrescription}
                    setNewPrescription={setNewPrescription}
                    addPrescription={addPrescription}
                    removePrescription={removePrescription}
                  />

                  {formData.prescricoes.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <DrugInteractionChecker
                        prescriptions={formData.prescricoes.map((p: PrescriptionData) => ({
                          id: generateId(),
                          ...p
                        }))}
                        patientMedications={patient?.medicamentosEmUso || []}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <TextAreaField
                      label="Solicitação de Exames"
                      value={formData.solicitacaoExames || ''}
                      onChange={val => updateField('solicitacaoExames', val)}
                      rows={3}
                      placeholder="Exames laboratoriais, imagem..."
                    />
                 </div>
                 <div>
                    <TextAreaField
                      label="Encaminhamentos"
                      value={formData.encaminhamentos || ''}
                      onChange={val => updateField('encaminhamentos', val)}
                      rows={3}
                      placeholder="Especialidade: Motivo"
                    />
                 </div>
              </div>

              <div className="bg-blue-50/50 p-5 rounded-lg border border-blue-100/60">
                 <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-bold text-blue-900">Orientações ao Paciente</label>
                    <OrientationTemplateSelector
                      currentCIDs={formData.cid10 ? formData.cid10.split(',').map((c: string) => c.trim()).filter(Boolean) : []}
                      currentOrientation={formData.orientacoes}
                      onSelect={(content) => updateField('orientacoes', content)}
                      onAppend={(content) => updateField('orientacoes', formData.orientacoes + content)}
                    />
                 </div>
                 <textarea
                  value={formData.orientacoes}
                  onChange={e => updateField('orientacoes', e.target.value)}
                  className="w-full bg-white border border-blue-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none leading-relaxed"
                  rows={4}
                  placeholder="Instruções, cuidados, sinais de alerta..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                    <h4 className="font-semibold text-slate-700 mb-3 text-sm">Retorno</h4>
                    <div className="space-y-3">
                       <InputField label="Previsão" value={formData.retorno || ''} onChange={(v: string) => updateField('retorno', v)} placeholder="Ex: 30 dias" isSmall />
                       <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">Data agendada</label>
                          <input type="date" value={formData.dataRetorno || ''} onChange={e => updateField('dataRetorno', e.target.value)} className="input-field text-sm" />
                       </div>
                    </div>
                 </div>

                 <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                     <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-slate-700 text-sm">Atestado Médico</h4>
                        <input
                          type="checkbox"
                          checked={formData.atestadoEmitido}
                          onChange={e => updateField('atestadoEmitido', e.target.checked)}
                          className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                        />
                     </div>

                     {formData.atestadoEmitido && (
                       <div className="space-y-3 animate-fade-in">
                          <SelectField
                            label="Tipo"
                            value={formData.tipoAtestado || ''}
                            onChange={(v: string) => updateField('tipoAtestado', v)}
                            options={[
                              { value: 'atestado_medico', label: 'Atestado Médico' },
                              { value: 'declaracao', label: 'Declaração' }
                            ]}
                            isSmall
                          />
                          <NumberField label="Dias de afastamento" value={formData.diasAfastamento || ''} onChange={(v: string) => updateField('diasAfastamento', v)} />
                       </div>
                     )}
                 </div>
              </div>
          </div>
       </div>
    </div>
  );
}

import { useState } from 'react';
import {
  Stethoscope,
  X,
  Activity,
  Clipboard,
  ChevronUp,
  ChevronDown,
  ClipboardList,
  FileCheck,
  Paperclip
} from 'lucide-react';
import type { MedicalRecord, MedicalRecordAttachment } from '../../types';
import { useMedicalRecordForm, type FormErrors } from './useMedicalRecordForm';
import type { PrescriptionData } from './types';
import { VitalSignsValidator } from '../../components/VitalSignsValidator';
import { DrugInteractionChecker } from '../../components/DrugInteractionChecker';
import { OrientationTemplateSelector } from '../../components/OrientationTemplateSelector';
import { MedicalAttachments } from '../../components/MedicalAttachments';
import { CID10Selector } from '../../components/CID10Selector';
import { generateId } from '../../utils/helpers';

interface MedicalRecordModalProps {
  patientId: string;
  patient?: { medicamentosEmUso?: string[] };
  record: MedicalRecord | null;
  onClose: () => void;
  onSave: (data: Partial<MedicalRecord>) => void;
}

export function MedicalRecordModal({ patientId, patient, record, onClose, onSave }: MedicalRecordModalProps) {
  const {
    formData,
    updateField,
    newPrescription,
    setNewPrescription,
    addPrescription,
    removePrescription,
    expandedSections,
    toggleSection,
    buildRecordData,
    formErrors,
    validateForm
  } = useMedicalRecordForm(record);

  // Estado para anexos
  const [attachments, setAttachments] = useState<MedicalRecordAttachment[]>(
    record?.attachments || []
  );

  // Handlers para anexos
  const handleAddAttachment = (attachment: Omit<MedicalRecordAttachment, 'id' | 'medicalRecordId' | 'uploadedAt'>) => {
    const newAttachment: MedicalRecordAttachment = {
      ...attachment,
      id: generateId(),
      medicalRecordId: record?.id || 'temp',
      uploadedAt: new Date().toISOString()
    };
    setAttachments(prev => [...prev, newAttachment]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Rola para o primeiro erro
      const firstErrorField = document.querySelector('.field-error');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const recordData = buildRecordData(patientId);
    const now = new Date().toISOString();

    // Adiciona anexos
    const finalData = {
      ...recordData,
      attachments,
      // Adiciona auditoria
      audit: record?.audit
        ? {
            ...record.audit,
            lastEditedBy: 'Usuário Atual', // TODO: pegar do contexto de autenticação
            lastEditedAt: now,
          }
        : {
            createdBy: 'Usuário Atual', // TODO: pegar do contexto de autenticação
            createdAt: now,
          },
    };

    onSave(finalData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-2 sm:p-4 animate-fade-in overflow-y-auto overscroll-contain">
      <div className="medical-modal w-full max-w-5xl my-4 sm:my-8 animate-scale-in max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="medical-modal-header sticky top-0 z-10">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {record ? 'Editar Atendimento' : 'Novo Atendimento'}
                </h2>
                <p className="text-sm text-white/70">Registro SOAP completo</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto overscroll-contain p-6 space-y-6 scroll-smooth">
          {/* Informações Gerais */}
          <GeneralInfoSection formData={formData} updateField={updateField} />

          {/* SOAP Sections */}
          <SubjectiveSection
            formData={formData}
            updateField={updateField}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
            formErrors={formErrors}
          />

          <ObjectiveSection
            formData={formData}
            updateField={updateField}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
            formErrors={formErrors}
          />

          <AssessmentSection formData={formData} updateField={updateField} formErrors={formErrors} />

          <PlanSection
            formData={formData}
            updateField={updateField}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
            newPrescription={newPrescription}
            setNewPrescription={setNewPrescription}
            addPrescription={addPrescription}
            removePrescription={removePrescription}
            formErrors={formErrors}
            patient={patient}
          />

          {/* Anexos e Documentos */}
          <AttachmentsSection
            attachments={attachments}
            onAdd={handleAddAttachment}
            onRemove={handleRemoveAttachment}
          />

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-6 border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/25 transition-all flex items-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              {record ? 'Salvar alterações' : 'Registrar atendimento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// General Info Section
interface FormSectionProps {
  formData: ReturnType<typeof useMedicalRecordForm>['formData'];
  updateField: ReturnType<typeof useMedicalRecordForm>['updateField'];
  formErrors?: FormErrors;
}

function GeneralInfoSection({ formData, updateField }: FormSectionProps) {
  return (
    <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Informações do Atendimento</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Data do atendimento</label>
          <input
            type="date"
            value={formData.data}
            onChange={e => updateField('data', e.target.value)}
            className="input-field text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Tipo de atendimento</label>
          <select
            value={formData.tipoAtendimento}
            onChange={e => updateField('tipoAtendimento', e.target.value)}
            className="input-field text-sm"
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
          <label className="block text-xs text-gray-500 mb-1">Local do atendimento</label>
          <input
            type="text"
            value={formData.localAtendimento}
            onChange={e => updateField('localAtendimento', e.target.value)}
            className="input-field text-sm"
            placeholder="Consultório, Hospital, etc."
          />
        </div>
      </div>
    </div>
  );
}

// Subjective Section
interface ExpandableSectionProps extends FormSectionProps {
  expandedSections: ReturnType<typeof useMedicalRecordForm>['expandedSections'];
  toggleSection: ReturnType<typeof useMedicalRecordForm>['toggleSection'];
  formErrors: FormErrors;
}

function SubjectiveSection({ formData, updateField, expandedSections, toggleSection, formErrors }: ExpandableSectionProps) {
  return (
    <div className="soap-section-s rounded-xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-10 h-10 bg-sky-500 text-white rounded-xl flex items-center justify-center text-lg font-bold shadow-lg shadow-sky-500/20">S</span>
        <div>
          <h3 className="text-lg font-bold text-sky-700">Subjetivo</h3>
          <p className="text-xs text-sky-600/70">Relato do paciente</p>
        </div>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={formErrors.queixaPrincipal ? 'field-error' : ''}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Queixa principal <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.queixaPrincipal}
              onChange={e => updateField('queixaPrincipal', e.target.value)}
              className={`input-field ${formErrors.queixaPrincipal ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="Motivo principal da consulta"
            />
            {formErrors.queixaPrincipal && (
              <p className="text-red-500 text-xs mt-1">{formErrors.queixaPrincipal}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duração dos sintomas</label>
            <input
              type="text"
              value={formData.duracaoSintomas}
              onChange={e => updateField('duracaoSintomas', e.target.value)}
              className="input-field"
              placeholder="Ex: 3 dias, 2 semanas, 1 mês"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            História da doença atual
          </label>
          <textarea
            value={formData.historicoDoencaAtual}
            onChange={e => updateField('historicoDoencaAtual', e.target.value)}
            className="input-field"
            rows={3}
            placeholder="Descreva a evolução dos sintomas..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fatores de melhora</label>
            <input
              type="text"
              value={formData.fatoresMelhora}
              onChange={e => updateField('fatoresMelhora', e.target.value)}
              className="input-field"
              placeholder="O que alivia os sintomas?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fatores de piora</label>
            <input
              type="text"
              value={formData.fatoresPiora}
              onChange={e => updateField('fatoresPiora', e.target.value)}
              className="input-field"
              placeholder="O que agrava os sintomas?"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sintomas associados</label>
            <input
              type="text"
              value={formData.sintomasAssociados}
              onChange={e => updateField('sintomasAssociados', e.target.value)}
              className="input-field"
              placeholder="Outros sintomas relacionados"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tratamentos prévios</label>
            <input
              type="text"
              value={formData.tratamentosPrevios}
              onChange={e => updateField('tratamentosPrevios', e.target.value)}
              className="input-field"
              placeholder="Medicamentos ou tratamentos já tentados"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Impacto na qualidade de vida</label>
          <input
            type="text"
            value={formData.impactoQualidadeVida}
            onChange={e => updateField('impactoQualidadeVida', e.target.value)}
            className="input-field"
            placeholder="Como afeta as atividades diárias?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Revisão de sistemas</label>
          <textarea
            value={formData.revisaoSistemas}
            onChange={e => updateField('revisaoSistemas', e.target.value)}
            className="input-field"
            rows={2}
            placeholder="Cardiovascular, respiratório, gastrointestinal, etc."
          />
        </div>

        {/* Hábitos de Vida */}
        <CollapsibleSection
          title="Hábitos de Vida"
          icon={<Activity className="w-4 h-4 text-sky-500" />}
          isExpanded={expandedSections.habitosVida}
          onToggle={() => toggleSection('habitosVida')}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <InputField label="Tabagismo" value={formData.tabagismo} onChange={v => updateField('tabagismo', v)} placeholder="Nunca, ex-fumante, ativo..." />
            <InputField label="Etilismo" value={formData.etilismo} onChange={v => updateField('etilismo', v)} placeholder="Social, frequente, abstêmio..." />
            <InputField label="Atividade física" value={formData.atividadeFisica} onChange={v => updateField('atividadeFisica', v)} placeholder="Sedentário, moderado, intenso..." />
            <InputField label="Alimentação" value={formData.alimentacao} onChange={v => updateField('alimentacao', v)} placeholder="Equilibrada, restritiva..." />
            <InputField label="Sono" value={formData.sono} onChange={v => updateField('sono', v)} placeholder="Horas/noite, qualidade..." />
            <InputField label="Estresse" value={formData.estresse} onChange={v => updateField('estresse', v)} placeholder="Baixo, moderado, alto..." />
          </div>
        </CollapsibleSection>

        {/* Histórico Patológico */}
        <CollapsibleSection
          title="Histórico Patológico Pregresso"
          icon={<Clipboard className="w-4 h-4 text-sky-500" />}
          isExpanded={expandedSections.historicoPregrasso}
          onToggle={() => toggleSection('historicoPregrasso')}
        >
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Doenças prévias</label>
              <textarea
                value={formData.historicoPatologicoPregrasso}
                onChange={e => updateField('historicoPatologicoPregrasso', e.target.value)}
                className="input-field text-sm"
                rows={2}
                placeholder="HAS, DM, dislipidemia, etc."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <InputField label="Cirurgias anteriores (separadas por vírgula)" value={formData.cirurgiasAnteriores} onChange={v => updateField('cirurgiasAnteriores', v)} placeholder="Apendicectomia (2015), Colecistectomia (2018)..." />
              <InputField label="Internações prévias" value={formData.internacoesPrevias} onChange={v => updateField('internacoesPrevias', v)} placeholder="Motivo e data" />
            </div>
            <InputField label="Vacinação" value={formData.vacinacao} onChange={v => updateField('vacinacao', v)} placeholder="Status vacinal, vacinas recentes..." />
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}

// Objective Section
function ObjectiveSection({ formData, updateField, expandedSections, toggleSection, formErrors }: ExpandableSectionProps) {
  return (
    <div className="soap-section-o rounded-xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center text-lg font-bold shadow-lg shadow-emerald-500/20">O</span>
        <div>
          <h3 className="text-lg font-bold text-emerald-700">Objetivo</h3>
          <p className="text-xs text-emerald-600/70">Exame físico e sinais vitais</p>
        </div>
      </div>
      <div className="space-y-4">
        {/* Estado Geral */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <SelectField
            label="Estado geral"
            value={formData.estadoGeral}
            onChange={v => updateField('estadoGeral', v)}
            options={[
              { value: '', label: 'Selecione' },
              { value: 'bom', label: 'Bom' },
              { value: 'regular', label: 'Regular' },
              { value: 'ruim', label: 'Ruim' },
              { value: 'grave', label: 'Grave' },
              { value: 'gravissimo', label: 'Gravíssimo' }
            ]}
          />
          <SelectField
            label="Nível de consciência"
            value={formData.nivelConsciencia}
            onChange={v => updateField('nivelConsciencia', v)}
            options={[
              { value: '', label: 'Selecione' },
              { value: 'consciente_orientado', label: 'Consciente e Orientado' },
              { value: 'consciente_desorientado', label: 'Consciente e Desorientado' },
              { value: 'sonolento', label: 'Sonolento' },
              { value: 'torporoso', label: 'Torporoso' },
              { value: 'comatoso', label: 'Comatoso' }
            ]}
          />
          <NumberField label="Glasgow (3-15)" value={formData.escalaGlasgow} onChange={v => updateField('escalaGlasgow', v)} min={3} max={15} />
          <NumberField label="Escala de dor (0-10)" value={formData.escalaDor} onChange={v => updateField('escalaDor', v)} min={0} max={10} placeholder="EVA" />
        </div>

        {/* Sinais Vitais */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sinais Vitais</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <InputField label="PA (mmHg)" value={formData.pressaoArterial} onChange={v => updateField('pressaoArterial', v)} placeholder="120/80" />
            <InputField label="PA deitado" value={formData.pressaoArterialDeitado} onChange={v => updateField('pressaoArterialDeitado', v)} placeholder="120/80" />
            <InputField label="PA em pé" value={formData.pressaoArterialEmPe} onChange={v => updateField('pressaoArterialEmPe', v)} placeholder="120/80" />
            <NumberField label="FC (bpm)" value={formData.frequenciaCardiaca} onChange={v => updateField('frequenciaCardiaca', v)} />
            <NumberField label="FR (irpm)" value={formData.frequenciaRespiratoria} onChange={v => updateField('frequenciaRespiratoria', v)} />
            <NumberField label="Temp (°C)" value={formData.temperatura} onChange={v => updateField('temperatura', v)} step={0.1} />
            <NumberField label="SpO2 (%)" value={formData.saturacaoO2} onChange={v => updateField('saturacaoO2', v)} />
            <NumberField label="Glicemia (mg/dL)" value={formData.glicemiaCapilar} onChange={v => updateField('glicemiaCapilar', v)} />
            <NumberField label="Peso (kg)" value={formData.peso} onChange={v => updateField('peso', v)} step={0.1} />
            <NumberField label="Altura (cm)" value={formData.altura} onChange={v => updateField('altura', v)} />
            <NumberField label="Circ. Abdominal (cm)" value={formData.circunferenciaAbdominal} onChange={v => updateField('circunferenciaAbdominal', v)} step={0.1} />
            <NumberField label="Circ. Pescoço (cm)" value={formData.circunferenciaPescoco} onChange={v => updateField('circunferenciaPescoco', v)} step={0.1} />
          </div>
        </div>

        {/* Validação de Sinais Vitais */}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Exame físico geral
          </label>
          <textarea
            value={formData.exameFisico}
            onChange={e => updateField('exameFisico', e.target.value)}
            className="input-field"
            rows={3}
            placeholder="Descreva os achados do exame físico..."
          />
        </div>

        {/* Exame Físico Detalhado */}
        <CollapsibleSection
          title="Exame Físico Detalhado por Sistemas"
          icon={<Stethoscope className="w-4 h-4 text-emerald-500" />}
          isExpanded={expandedSections.exameFisicoDetalhado}
          onToggle={() => toggleSection('exameFisicoDetalhado')}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InputField label="Cabeça e Pescoço" value={formData.exameCabecaPescoco} onChange={v => updateField('exameCabecaPescoco', v)} placeholder="Achados..." />
            <InputField label="Olhos" value={formData.exameOlhos} onChange={v => updateField('exameOlhos', v)} placeholder="Pupilas, conjuntivas, esclerótica..." />
            <InputField label="Ouvidos" value={formData.exameOuvidos} onChange={v => updateField('exameOuvidos', v)} placeholder="Otoscopia, audição..." />
            <InputField label="Boca e Orofaringe" value={formData.exameBoca} onChange={v => updateField('exameBoca', v)} placeholder="Mucosas, dentição, amígdalas..." />
            <InputField label="Cardiovascular" value={formData.exameCardiovascular} onChange={v => updateField('exameCardiovascular', v)} placeholder="RCR, sopros, pulsos..." />
            <InputField label="Pulmonar" value={formData.examePulmonar} onChange={v => updateField('examePulmonar', v)} placeholder="MV, ruídos adventícios..." />
            <InputField label="Abdome" value={formData.exameAbdome} onChange={v => updateField('exameAbdome', v)} placeholder="RHA, dor, massas, visceromegalias..." />
            <InputField label="Neurológico" value={formData.exameNeurologico} onChange={v => updateField('exameNeurologico', v)} placeholder="Força, sensibilidade, reflexos..." />
            <InputField label="Pele" value={formData.examePele} onChange={v => updateField('examePele', v)} placeholder="Coloração, lesões, hidratação..." />
            <InputField label="Extremidades" value={formData.exameExtremidades} onChange={v => updateField('exameExtremidades', v)} placeholder="Edema, perfusão, pulsos..." />
            <InputField label="Musculoesquelético" value={formData.exameMusculoesqueletico} onChange={v => updateField('exameMusculoesqueletico', v)} placeholder="Articulações, coluna, marcha..." />
            <InputField label="Psiquiátrico" value={formData.examePsiquiatrico} onChange={v => updateField('examePsiquiatrico', v)} placeholder="Humor, afeto, pensamento..." />
          </div>
        </CollapsibleSection>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Exames complementares</label>
          <textarea
            value={formData.examesComplementares}
            onChange={e => updateField('examesComplementares', e.target.value)}
            className="input-field"
            rows={2}
            placeholder="Resultados de exames trazidos pelo paciente..."
          />
        </div>
      </div>
    </div>
  );
}

// Assessment Section
function AssessmentSection({ formData, updateField, formErrors }: FormSectionProps) {
  return (
    <div className="soap-section-a rounded-xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center text-lg font-bold shadow-lg shadow-amber-500/20">A</span>
        <div>
          <h3 className="text-lg font-bold text-amber-700">Avaliação</h3>
          <p className="text-xs text-amber-600/70">Diagnóstico e hipóteses</p>
        </div>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Diagnóstico principal" value={formData.diagnosticoPrincipal} onChange={v => updateField('diagnosticoPrincipal', v)} placeholder="Diagnóstico mais provável" isSmall={false} />
          <div className={formErrors?.cid10 ? 'field-error' : ''}>
            <CID10Selector
              selectedCodes={formData.cid10 ? formData.cid10.split(',').map(c => c.trim()).filter(Boolean) : []}
              onChange={(codes) => updateField('cid10', codes.join(', '))}
              error={formErrors?.cid10}
            />
          </div>
        </div>

        <InputField label="Hipóteses diagnósticas (separadas por vírgula)" value={formData.hipotesesDiagnosticas} onChange={v => updateField('hipotesesDiagnosticas', v)} placeholder="Lista de possíveis diagnósticos" isSmall={false} />
        <InputField label="Diagnósticos secundários (separados por vírgula)" value={formData.diagnosticosSecundarios} onChange={v => updateField('diagnosticosSecundarios', v)} placeholder="Comorbidades, diagnósticos associados" isSmall={false} />
        <InputField label="Diagnóstico diferencial (separados por vírgula)" value={formData.diagnosticoDiferencial} onChange={v => updateField('diagnosticoDiferencial', v)} placeholder="Diagnósticos a serem descartados" isSmall={false} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SelectField
            label="Gravidade"
            value={formData.gravidade}
            onChange={v => updateField('gravidade', v)}
            options={[
              { value: '', label: 'Selecione' },
              { value: 'leve', label: 'Leve' },
              { value: 'moderada', label: 'Moderada' },
              { value: 'grave', label: 'Grave' },
              { value: 'critica', label: 'Crítica' }
            ]}
            isSmall={false}
          />
          <InputField label="Prognóstico" value={formData.prognostico} onChange={v => updateField('prognostico', v)} placeholder="Bom, reservado, etc." isSmall={false} />
          <InputField label="Classificação de risco" value={formData.classificacaoRisco} onChange={v => updateField('classificacaoRisco', v)} placeholder="Manchester, ESI, etc." isSmall={false} />
        </div>
      </div>
    </div>
  );
}

// Plan Section
interface PlanSectionProps extends ExpandableSectionProps {
  newPrescription: PrescriptionData;
  setNewPrescription: (data: PrescriptionData) => void;
  addPrescription: () => void;
  removePrescription: (index: number) => void;
  formErrors: FormErrors;
  patient?: { medicamentosEmUso?: string[] };
}

function PlanSection({ formData, updateField, expandedSections, toggleSection, newPrescription, setNewPrescription, addPrescription, removePrescription, formErrors, patient }: PlanSectionProps) {
  return (
    <div className="soap-section-p rounded-xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-10 h-10 bg-violet-500 text-white rounded-xl flex items-center justify-center text-lg font-bold shadow-lg shadow-violet-500/20">P</span>
        <div>
          <h3 className="text-lg font-bold text-violet-700">Plano</h3>
          <p className="text-xs text-violet-600/70">Conduta e tratamento</p>
        </div>
      </div>
      <div className="space-y-4">
        <div className={formErrors.conduta ? 'field-error' : ''}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Conduta <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.conduta}
            onChange={e => updateField('conduta', e.target.value)}
            className={`input-field ${formErrors.conduta ? 'border-red-500 focus:ring-red-500' : ''}`}
            rows={3}
            placeholder="Descreva o plano terapêutico..."
          />
          {formErrors.conduta && (
            <p className="text-red-500 text-xs mt-1">{formErrors.conduta}</p>
          )}
        </div>

        {/* Prescriptions */}
        <PrescriptionSection
          prescricoes={formData.prescricoes}
          newPrescription={newPrescription}
          setNewPrescription={setNewPrescription}
          addPrescription={addPrescription}
          removePrescription={removePrescription}
        />

        {/* Verificação de Interações Medicamentosas */}
        {formData.prescricoes.length > 0 && (
          <DrugInteractionChecker
            prescriptions={formData.prescricoes.map(p => ({
              id: generateId(),
              medicamento: p.medicamento,
              concentracao: p.concentracao,
              formaFarmaceutica: p.formaFarmaceutica,
              posologia: p.posologia,
              quantidade: p.quantidade,
              duracao: p.duracao,
              viaAdministracao: p.viaAdministracao,
              usoControlado: p.usoControlado,
            }))}
            patientMedications={patient?.medicamentosEmUso || []}
          />
        )}

        <InputField label="Prescrições não medicamentosas (separadas por vírgula)" value={formData.prescricoesNaoMedicamentosas} onChange={v => updateField('prescricoesNaoMedicamentosas', v)} placeholder="Repouso, dieta, fisioterapia, etc." isSmall={false} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Solicitação de exames (separados por vírgula)" value={formData.solicitacaoExames} onChange={v => updateField('solicitacaoExames', v)} placeholder="Hemograma, glicemia, etc." isSmall={false} />
          <InputField label="Procedimentos realizados (separados por vírgula)" value={formData.procedimentosRealizados} onChange={v => updateField('procedimentosRealizados', v)} placeholder="Sutura, drenagem, etc." isSmall={false} />
        </div>

        <InputField label="Encaminhamentos (formato: Especialidade: Motivo; separados por ponto e vírgula)" value={formData.encaminhamentos} onChange={v => updateField('encaminhamentos', v)} placeholder="Cardiologia: avaliação de sopro; Ortopedia: dor lombar crônica" isSmall={false} />

        {/* Documentos */}
        <div className="border rounded-lg">
          <button
            type="button"
            onClick={() => toggleSection('documentos')}
            className="w-full px-4 py-2 text-left text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-t-lg flex items-center justify-between"
          >
            <span>Atestados e Documentos</span>
            <span>{expandedSections.documentos ? '−' : '+'}</span>
          </button>
          {expandedSections.documentos && (
            <div className="p-4 space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.atestadoEmitido}
                  onChange={e => updateField('atestadoEmitido', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Atestado emitido</span>
              </label>
              {formData.atestadoEmitido && (
                <div className="grid grid-cols-2 gap-3">
                  <SelectField
                    label="Tipo de atestado"
                    value={formData.tipoAtestado}
                    onChange={v => updateField('tipoAtestado', v)}
                    options={[
                      { value: '', label: 'Selecione' },
                      { value: 'atestado_medico', label: 'Atestado médico' },
                      { value: 'declaracao_comparecimento', label: 'Declaração de comparecimento' },
                      { value: 'laudo', label: 'Laudo médico' }
                    ]}
                  />
                  <NumberField label="Dias de afastamento" value={formData.diasAfastamento} onChange={v => updateField('diasAfastamento', v)} placeholder="Número de dias" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Retorno */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Retorno" value={formData.retorno} onChange={v => updateField('retorno', v)} placeholder="Ex: 30 dias, 1 semana, se necessário" isSmall={false} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data do retorno</label>
            <input
              type="date"
              value={formData.dataRetorno}
              onChange={e => updateField('dataRetorno', e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Orientações ao paciente</label>

          {/* Seletor de Templates */}
          <OrientationTemplateSelector
            currentCIDs={formData.cid10.split(',').map(c => c.trim()).filter(Boolean)}
            currentOrientation={formData.orientacoes}
            onSelect={(content) => updateField('orientacoes', content)}
            onAppend={(content) => updateField('orientacoes', formData.orientacoes + content)}
          />

          <textarea
            value={formData.orientacoes}
            onChange={e => updateField('orientacoes', e.target.value)}
            className="input-field mt-2"
            rows={4}
            placeholder="Instruções gerais para o paciente..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Orientações alimentares</label>
            <textarea
              value={formData.orientacoesAlimentares}
              onChange={e => updateField('orientacoesAlimentares', e.target.value)}
              className="input-field"
              rows={2}
              placeholder="Restrições ou recomendações alimentares..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Restrições de atividades</label>
            <textarea
              value={formData.restricoesAtividades}
              onChange={e => updateField('restricoesAtividades', e.target.value)}
              className="input-field"
              rows={2}
              placeholder="Atividades a evitar..."
            />
          </div>
        </div>

        {/* Plano Terapêutico */}
        <CollapsibleSection
          title="Plano Terapêutico Detalhado"
          icon={<ClipboardList className="w-4 h-4 text-violet-500" />}
          isExpanded={expandedSections.planoTerapeutico}
          onToggle={() => toggleSection('planoTerapeutico')}
        >
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Objetivos do tratamento</label>
              <textarea
                value={formData.objetivosTratamento}
                onChange={e => updateField('objetivosTratamento', e.target.value)}
                className="input-field text-sm"
                rows={2}
                placeholder="Metas a serem alcançadas..."
              />
            </div>
            <InputField label="Metas terapêuticas (separadas por vírgula)" value={formData.metasTerapeuticas} onChange={v => updateField('metasTerapeuticas', v)} placeholder="PA < 140/90, HbA1c < 7%, etc." />
            <InputField label="Alertas e cuidados especiais (separados por vírgula)" value={formData.alertasCuidados} onChange={v => updateField('alertasCuidados', v)} placeholder="Sinais de alerta, quando procurar emergência..." />
          </div>
        </CollapsibleSection>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Intercorrências durante o atendimento</label>
          <textarea
            value={formData.intercorrencias}
            onChange={e => updateField('intercorrencias', e.target.value)}
            className="input-field"
            rows={2}
            placeholder="Eventos ou complicações durante a consulta..."
          />
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.consentimentoInformado}
            onChange={e => updateField('consentimentoInformado', e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-gray-700">
            Paciente recebeu e compreendeu as orientações e consentiu com o plano terapêutico
          </span>
        </label>
      </div>
    </div>
  );
}

// Anexos Section
interface AttachmentsSectionProps {
  attachments: MedicalRecordAttachment[];
  onAdd: (attachment: Omit<MedicalRecordAttachment, 'id' | 'medicalRecordId' | 'uploadedAt'>) => void;
  onRemove: (id: string) => void;
}

function AttachmentsSection({ attachments, onAdd, onRemove }: AttachmentsSectionProps) {
  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-200">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-10 h-10 bg-indigo-500 text-white rounded-xl flex items-center justify-center text-lg font-bold shadow-lg shadow-indigo-500/20">
          <Paperclip className="w-5 h-5" />
        </span>
        <div>
          <h3 className="text-lg font-bold text-indigo-700">Anexos e Documentos</h3>
          <p className="text-xs text-indigo-600/70">Exames, laudos, imagens</p>
        </div>
      </div>
      <MedicalAttachments attachments={attachments} onAdd={onAdd} onRemove={onRemove} />
    </div>
  );
}

// Prescription Section
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
      <label className="block text-sm font-medium text-gray-700 mb-2">Prescrições Medicamentosas</label>
      {prescricoes.length > 0 && (
        <div className="space-y-2 mb-3">
          {prescricoes.map((rx, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <span className="flex-1 text-sm">
                <strong>{rx.medicamento}</strong> {rx.concentracao} - {rx.formaFarmaceutica} - {rx.posologia}
                {rx.viaAdministracao && <span className="text-gray-500"> | Via: {rx.viaAdministracao}</span>}
                {rx.usoControlado && <span className="text-red-500 ml-2">[Controlado]</span>}
              </span>
              <button type="button" onClick={() => removePrescription(idx)} className="text-red-500 hover:text-red-700">×</button>
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 mb-2">
        <input type="text" value={newPrescription.medicamento} onChange={e => setNewPrescription({ ...newPrescription, medicamento: e.target.value })} className="input-field text-sm" placeholder="Medicamento" />
        <input type="text" value={newPrescription.concentracao} onChange={e => setNewPrescription({ ...newPrescription, concentracao: e.target.value })} className="input-field text-sm" placeholder="Concentração" />
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
          <option>Colírio</option>
          <option>Spray nasal</option>
          <option>Inalatório</option>
          <option>Injetável IM</option>
          <option>Injetável IV</option>
          <option>Injetável SC</option>
          <option>Supositório</option>
          <option>Adesivo</option>
        </select>
        <input type="text" value={newPrescription.posologia} onChange={e => setNewPrescription({ ...newPrescription, posologia: e.target.value })} className="input-field text-sm" placeholder="Posologia" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        <input type="text" value={newPrescription.quantidade} onChange={e => setNewPrescription({ ...newPrescription, quantidade: e.target.value })} className="input-field text-sm" placeholder="Quantidade" />
        <input type="text" value={newPrescription.duracao} onChange={e => setNewPrescription({ ...newPrescription, duracao: e.target.value })} className="input-field text-sm" placeholder="Duração" />
        <select value={newPrescription.viaAdministracao} onChange={e => setNewPrescription({ ...newPrescription, viaAdministracao: e.target.value })} className="input-field text-sm">
          <option value="Oral">Oral</option>
          <option value="Sublingual">Sublingual</option>
          <option value="Tópica">Tópica</option>
          <option value="Intramuscular">Intramuscular</option>
          <option value="Intravenosa">Intravenosa</option>
          <option value="Subcutânea">Subcutânea</option>
          <option value="Retal">Retal</option>
          <option value="Inalatória">Inalatória</option>
          <option value="Nasal">Nasal</option>
          <option value="Oftálmica">Oftálmica</option>
          <option value="Otológica">Otológica</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={newPrescription.usoControlado} onChange={e => setNewPrescription({ ...newPrescription, usoControlado: e.target.checked })} className="rounded" />
          Uso controlado
        </label>
        <button type="button" onClick={addPrescription} className="btn-secondary text-sm">Adicionar</button>
      </div>
    </div>
  );
}

// Reusable Components
interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleSection({ title, icon, isExpanded, onToggle, children }: CollapsibleSectionProps) {
  return (
    <div className="collapsible-section">
      <button type="button" onClick={onToggle} className="collapsible-header">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-semibold text-slate-700">{title}</span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {isExpanded && <div className="p-4 space-y-3">{children}</div>}
    </div>
  );
}

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  isSmall?: boolean;
}

function InputField({ label, value, onChange, placeholder, required, isSmall = true }: InputFieldProps) {
  return (
    <div>
      <label className={`block ${isSmall ? 'text-xs text-gray-500' : 'text-sm font-medium text-gray-700'} mb-1`}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`input-field ${isSmall ? 'text-sm' : ''}`}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

interface NumberFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

function NumberField({ label, value, onChange, min, max, step, placeholder }: NumberFieldProps) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input-field text-sm"
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
      />
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  isSmall?: boolean;
}

function SelectField({ label, value, onChange, options, isSmall = true }: SelectFieldProps) {
  return (
    <div>
      <label className={`block ${isSmall ? 'text-xs text-gray-500' : 'text-sm font-medium text-gray-700'} mb-1`}>{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`input-field ${isSmall ? 'text-sm' : ''}`}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

import { useState, type ReactNode, type ElementType } from 'react';
import {
  Stethoscope,
  X,
  Activity,
  Clipboard,
  ChevronUp,
  ChevronDown,
  ClipboardList,
  FileCheck,
  Paperclip,
  History,
  AlertTriangle,
  User,
  CheckSquare,
  Info,
  AlertCircle
} from 'lucide-react';
import type { MedicalRecord, MedicalRecordAttachment, ActiveProblem } from '../../types';
import { useMedicalRecordForm, type FormErrors } from './useMedicalRecordForm';
import type { PrescriptionData, MedicalRecordFormData, ExpandedSections } from './types';
import { VitalSignsValidator } from '../../components/VitalSignsValidator';
import { DrugInteractionChecker } from '../../components/DrugInteractionChecker';
import { OrientationTemplateSelector } from '../../components/OrientationTemplateSelector';
import { MedicalAttachments } from '../../components/MedicalAttachments';
import { CID10Selector } from '../../components/CID10Selector';
import { MedicationSelector } from '../../components/MedicationSelector';
import { ActiveProblemsManager } from '../../components/ActiveProblemsManager';
import { PatientTimeline } from '../../components/PatientTimeline';
import { useData } from '../../contexts/DataContext';
import { generateId } from '../../utils/helpers';

interface MedicalRecordModalProps {
  patientId: string;
  patient?: { medicamentosEmUso?: string[] };
  record: MedicalRecord | null;
  onClose: () => void;
  onSave: (data: Partial<MedicalRecord>) => void;
}

type TabId = 'resumo' | 'geral' | 'subjetivo' | 'objetivo' | 'avaliacao' | 'plano' | 'anexos';

export function MedicalRecordModal({ patientId, record, onClose, onSave }: MedicalRecordModalProps) {
  const { getPatient, updatePatient, getMedicalRecordsByPatient } = useData();
  const currentPatient = getPatient(patientId);
  const patientRecords = getMedicalRecordsByPatient(patientId);
  const [activeTab, setActiveTab] = useState<TabId>('resumo');

  // Alerta de alergias
  const patientAllergies = currentPatient?.alergias && currentPatient.alergias.length > 0
    ? (Array.isArray(currentPatient.alergias) ? currentPatient.alergias.join(', ') : currentPatient.alergias)
    : null;

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

  // Handlers para problemas ativos
  const handleAddProblem = (problem: Omit<ActiveProblem, 'id'>) => {
    if (!currentPatient) return;
    const newProblem: ActiveProblem = {
      ...problem,
      id: generateId(),
      patientId: patientId
    };
    const updatedProblems = [...(currentPatient.activeProblems || []), newProblem];
    updatePatient(patientId, { activeProblems: updatedProblems });
  };

  const handleUpdateProblem = (id: string, updates: Partial<ActiveProblem>) => {
    if (!currentPatient?.activeProblems) return;
    const updatedProblems = currentPatient.activeProblems.map(p =>
      p.id === id ? { ...p, ...updates } : p
    );
    updatePatient(patientId, { activeProblems: updatedProblems });
  };

  const handleRemoveProblem = (id: string) => {
    if (!currentPatient?.activeProblems) return;
    const updatedProblems = currentPatient.activeProblems.filter(p => p.id !== id);
    updatePatient(patientId, { activeProblems: updatedProblems });
  };

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
      // Encontrar a tab com erro e mudar para ela
      if (formErrors.queixaPrincipal) setActiveTab('subjetivo');
      else if (formErrors.cid10) setActiveTab('avaliacao');
      else if (formErrors.conduta) setActiveTab('plano');
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 font-sans">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 shadow-sm border border-primary-100">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {record ? 'Editar Prontuário' : 'Novo Atendimento'}
              </h2>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="font-medium text-slate-700">{currentPatient?.nome}</span>
                <span>•</span>
                <span>{record ? 'Edição de registro' : 'Consulta SOAP'}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerta de Alergias */}
        {patientAllergies && (
          <div className="bg-red-50 border-b border-red-100 px-6 py-3 flex items-start gap-3 shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-red-800">Alergias Conhecidas</h3>
              <p className="text-sm text-red-700 font-medium">{patientAllergies}</p>
            </div>
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Navigation */}
          <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto py-4">
            <nav className="space-y-1 px-3">
              <SidebarItem
                label="Resumo & Problemas"
                icon={History}
                active={activeTab === 'resumo'}
                onClick={() => setActiveTab('resumo')}
              />
              <div className="my-2 border-t border-slate-200 mx-2" />
              <SidebarItem
                label="Informações Gerais"
                icon={Info}
                active={activeTab === 'geral'}
                onClick={() => setActiveTab('geral')}
              />
              <SidebarItem
                label="Subjetivo (S)"
                icon={User}
                active={activeTab === 'subjetivo'}
                onClick={() => setActiveTab('subjetivo')}
                hasError={!!formErrors.queixaPrincipal}
              />
              <SidebarItem
                label="Objetivo (O)"
                icon={Activity}
                active={activeTab === 'objetivo'}
                onClick={() => setActiveTab('objetivo')}
              />
              <SidebarItem
                label="Avaliação (A)"
                icon={Clipboard}
                active={activeTab === 'avaliacao'}
                onClick={() => setActiveTab('avaliacao')}
                hasError={!!formErrors.cid10}
              />
              <SidebarItem
                label="Plano (P)"
                icon={CheckSquare}
                active={activeTab === 'plano'}
                onClick={() => setActiveTab('plano')}
                hasError={!!formErrors.conduta}
              />
              <div className="my-2 border-t border-slate-200 mx-2" />
              <SidebarItem
                label="Anexos"
                icon={Paperclip}
                active={activeTab === 'anexos'}
                onClick={() => setActiveTab('anexos')}
              />
            </nav>

            <div className="mt-auto px-4 pt-6 text-xs text-slate-400 text-center">
              <p>Prontuário Eletrônico v2.0</p>
              <p>Auditado & Verificado</p>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto bg-white p-6 md:p-8 scroll-smooth">
            <form onSubmit={handleSubmit} id="medical-record-form">

              {activeTab === 'resumo' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                     <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <History className="w-5 h-5 text-indigo-500" />
                        Linha do Tempo
                     </h3>
                     <PatientTimeline
                        medicalRecords={patientRecords}
                        patientName={currentPatient?.nome || ''}
                        showLimit={5}
                      />
                  </div>

                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                       <AlertTriangle className="w-5 h-5 text-amber-500" />
                       Lista de Problemas Ativos
                    </h3>
                    <ActiveProblemsManager
                      problems={currentPatient?.activeProblems || []}
                      onAdd={handleAddProblem}
                      onUpdate={handleUpdateProblem}
                      onRemove={handleRemoveProblem}
                      currentMedicalRecordId={record?.id}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'geral' && (
                <div className="animate-fade-in">
                   <SectionHeader title="Informações Gerais do Atendimento" icon={Info} color="bg-blue-500" />
                   <GeneralInfoSection formData={formData} updateField={updateField} />
                </div>
              )}

              {activeTab === 'subjetivo' && (
                <div className="animate-fade-in">
                   <SectionHeader title="Subjetivo" subtitle="Anamnese e História Clínica" icon={User} color="bg-sky-500" />
                   <SubjectiveSection
                      formData={formData}
                      updateField={updateField}
                      expandedSections={expandedSections}
                      toggleSection={toggleSection}
                      formErrors={formErrors}
                    />
                </div>
              )}

              {activeTab === 'objetivo' && (
                <div className="animate-fade-in">
                   <SectionHeader title="Objetivo" subtitle="Exame Físico e Sinais Vitais" icon={Activity} color="bg-emerald-500" />
                   <ObjectiveSection
                      formData={formData}
                      updateField={updateField}
                      expandedSections={expandedSections}
                      toggleSection={toggleSection}
                    />
                </div>
              )}

              {activeTab === 'avaliacao' && (
                <div className="animate-fade-in">
                   <SectionHeader title="Avaliação" subtitle="Diagnóstico e Raciocínio Clínico" icon={Clipboard} color="bg-amber-500" />
                   <AssessmentSection formData={formData} updateField={updateField} formErrors={formErrors} />
                </div>
              )}

              {activeTab === 'plano' && (
                <div className="animate-fade-in">
                   <SectionHeader title="Plano Terapêutico" subtitle="Conduta, Prescrições e Orientações" icon={CheckSquare} color="bg-purple-500" />
                   <PlanSection
                      formData={formData}
                      updateField={updateField}
                      newPrescription={newPrescription}
                      setNewPrescription={setNewPrescription}
                      addPrescription={addPrescription}
                      removePrescription={removePrescription}
                      formErrors={formErrors}
                      patient={currentPatient}
                    />
                </div>
              )}

              {activeTab === 'anexos' && (
                <div className="animate-fade-in">
                   <SectionHeader title="Anexos e Documentos" subtitle="Arquivos complementares ao prontuário" icon={Paperclip} color="bg-slate-500" />
                   <AttachmentsSection
                      attachments={attachments}
                      onAdd={handleAddAttachment}
                      onRemove={handleRemoveAttachment}
                    />
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-end gap-3 shrink-0 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 shadow-lg shadow-primary-200 hover:shadow-primary-300 transition-all flex items-center gap-2"
          >
            <FileCheck className="w-5 h-5" />
            {record ? 'Salvar Alterações' : 'Finalizar Atendimento'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Sub-components
// ----------------------------------------------------------------------

function SidebarItem({ label, icon: Icon, active, onClick, hasError }: {
  label: string;
  icon: ElementType;
  active: boolean;
  onClick: () => void;
  hasError?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2.5 mb-1 rounded-xl text-sm font-medium transition-all duration-200 group
        ${active
          ? 'bg-primary-50 text-primary-700 shadow-sm'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-4 h-4 ${active ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
        <span>{label}</span>
      </div>
      {hasError && <div className="w-2 h-2 rounded-full bg-red-500 shadow-sm animate-pulse" />}
    </button>
  );
}

function SectionHeader({ title, subtitle, icon: Icon, color }: { title: string; subtitle?: string; icon: ElementType; color: string }) {
  const colorClass = color.replace('bg-', 'text-').replace('-500', '-600');
  const bgClass = color.replace('bg-', 'bg-').replace('-500', '-100');

  return (
    <div className="flex items-start gap-4 mb-8 pb-6 border-b border-slate-100">
      <div className={`w-12 h-12 ${bgClass} rounded-2xl flex items-center justify-center shrink-0`}>
        <Icon className={`w-6 h-6 ${colorClass}`} />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        {subtitle && <p className="text-slate-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

interface SectionProps {
  formData: MedicalRecordFormData;
  updateField: <K extends keyof MedicalRecordFormData>(field: K, value: MedicalRecordFormData[K]) => void;
  expandedSections?: ExpandedSections;
  toggleSection?: (section: keyof ExpandedSections) => void;
  formErrors?: FormErrors;
}

interface SectionWithToggleProps extends SectionProps {
  expandedSections: ExpandedSections;
  toggleSection: (section: keyof ExpandedSections) => void;
}

// Reuse existing sections but cleaner
function GeneralInfoSection({ formData, updateField }: SectionProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Data do atendimento</label>
          <input
            type="date"
            value={formData.data}
            onChange={e => updateField('data', e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de atendimento</label>
          <select
            value={formData.tipoAtendimento}
            onChange={e => updateField('tipoAtendimento', e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
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
          <label className="block text-sm font-medium text-slate-700 mb-2">Local do atendimento</label>
          <input
            type="text"
            value={formData.localAtendimento}
            onChange={e => updateField('localAtendimento', e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            placeholder="Consultório, Hospital, etc."
          />
        </div>
      </div>
    </div>
  );
}

// Subjective Section
function SubjectiveSection({ formData, updateField, expandedSections, toggleSection, formErrors }: SectionWithToggleProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div className={formErrors?.queixaPrincipal ? 'animate-shake' : ''}>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Queixa Principal <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.queixaPrincipal}
            onChange={e => updateField('queixaPrincipal', e.target.value)}
            className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 outline-none transition-all text-lg
              ${formErrors?.queixaPrincipal
                ? 'border-red-300 focus:ring-red-200 bg-red-50 text-red-900 placeholder-red-400'
                : 'border-slate-200 focus:ring-primary-500'}`}
            placeholder="Ex: Dor abdominal há 3 dias"
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
            <label className="block text-sm font-medium text-slate-700 mb-2">Início dos sintomas</label>
            <input
              type="date"
              value={formData.dataInicioSintomas}
              onChange={e => updateField('dataInicioSintomas', e.target.value)}
              className="input-field"
            />
          </div>
           <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Duração</label>
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
          <label className="block text-sm font-medium text-slate-700 mb-2">
            História da Doença Atual (HDA)
          </label>
          <textarea
            value={formData.historicoDoencaAtual}
            onChange={e => updateField('historicoDoencaAtual', e.target.value)}
            className="input-field min-h-[120px]"
            placeholder="Descreva a evolução cronológica dos sintomas, características, irradiação, intensidade..."
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
          onToggle={() => toggleSection('habitosVida')}
        >
          <div className="space-y-5">
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <InputField label="Tabagismo" value={formData.tabagismo} onChange={(v: string) => updateField('tabagismo', v)} isSmall />
                <InputField label="Etilismo" value={formData.etilismo} onChange={(v: string) => updateField('etilismo', v)} isSmall />
                <InputField label="Atividade física" value={formData.atividadeFisica} onChange={(v: string) => updateField('atividadeFisica', v)} isSmall />
             </div>

             <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Histórico Familiar</label>
                <textarea
                  value={formData.historicoFamiliar}
                  onChange={e => updateField('historicoFamiliar', e.target.value)}
                  className="input-field"
                  rows={2}
                  placeholder="Doenças na família..."
                />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Cirurgias anteriores" value={formData.cirurgiasAnteriores} onChange={(v: string) => updateField('cirurgiasAnteriores', v)} isSmall />
                <InputField label="Alergias (além das cadastradas)" value={formData.alergias} onChange={(v: string) => updateField('alergias', v)} isSmall />
             </div>
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}

// Objective Section
function ObjectiveSection({ formData, updateField, expandedSections, toggleSection }: SectionWithToggleProps) {
  return (
    <div className="space-y-8">
      {/* Sinais Vitais em destaque */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
        <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
           <Activity className="w-4 h-4 text-slate-500" />
           Sinais Vitais
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <InputField label="PA (mmHg)" value={formData.pressaoArterial} onChange={(v: string) => updateField('pressaoArterial', v)} placeholder="120/80" isSmall />
            <NumberField label="FC (bpm)" value={formData.frequenciaCardiaca} onChange={(v: string) => updateField('frequenciaCardiaca', v)} />
            <NumberField label="FR (irpm)" value={formData.frequenciaRespiratoria} onChange={(v: string) => updateField('frequenciaRespiratoria', v)} />
            <NumberField label="Temp (°C)" value={formData.temperatura} onChange={(v: string) => updateField('temperatura', v)} step={0.1} />
            <NumberField label="SpO2 (%)" value={formData.saturacaoO2} onChange={(v: string) => updateField('saturacaoO2', v)} />
            <NumberField label="Peso (kg)" value={formData.peso} onChange={(v: string) => updateField('peso', v)} step={0.1} />
            <NumberField label="Altura (cm)" value={formData.altura} onChange={(v: string) => updateField('altura', v)} />
            <NumberField label="Glicemia (mg/dL)" value={formData.glicemiaCapilar} onChange={(v: string) => updateField('glicemiaCapilar', v)} />
            <NumberField label="Dor (0-10)" value={formData.escalaDor} onChange={(v: string) => updateField('escalaDor', v)} min={0} max={10} />
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200">
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

      <div>
        <h3 className="text-base font-bold text-slate-800 mb-4">Exame Físico</h3>
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

        <label className="block text-sm font-medium text-slate-700 mb-2">Descrição do Exame Físico</label>
        <textarea
            value={formData.exameFisico}
            onChange={e => updateField('exameFisico', e.target.value)}
            className="input-field min-h-[100px]"
            placeholder="Descreva os achados positivos do exame físico..."
          />
      </div>

      <CollapsibleSection
          title="Exame Segmentar Detalhado"
          icon={<Stethoscope className="w-4 h-4 text-emerald-500" />}
          isExpanded={expandedSections.exameFisicoDetalhado}
          onToggle={() => toggleSection('exameFisicoDetalhado')}
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
  );
}

// Assessment Section
function AssessmentSection({ formData, updateField, formErrors }: SectionProps) {
  return (
    <div className="space-y-6">
      <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
         <label className="block text-sm font-bold text-amber-900 mb-2">Diagnóstico Principal (CID-10) <span className="text-red-500">*</span></label>
         <CID10Selector
            selectedCodes={formData.cid10 ? formData.cid10.split(',').map((c: string) => c.trim()).filter(Boolean) : []}
            onChange={(codes) => updateField('cid10', codes.join(', '))}
            error={formErrors?.cid10}
          />
      </div>

      <div>
         <InputField label="Diagnóstico por extenso / Hipótese Diagnóstica" value={formData.diagnosticoPrincipal} onChange={(v: string) => updateField('diagnosticoPrincipal', v)} isSmall={false} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
         <InputField label="Diagnósticos Secundários" value={formData.diagnosticosSecundarios} onChange={(v: string) => updateField('diagnosticosSecundarios', v)} placeholder="Comorbidades..." isSmall />
         <InputField label="Diagnóstico Diferencial" value={formData.diagnosticoDiferencial} onChange={(v: string) => updateField('diagnosticoDiferencial', v)} placeholder="A descartar..." isSmall />
      </div>
    </div>
  );
}

// Plan Section
import type { Patient } from '../../types';

interface PlanSectionProps extends SectionProps {
  newPrescription: PrescriptionData;
  setNewPrescription: (data: PrescriptionData) => void;
  addPrescription: () => void;
  removePrescription: (index: number) => void;
  patient?: Patient;
}

function PlanSection({ formData, updateField, newPrescription, setNewPrescription, addPrescription, removePrescription, formErrors, patient }: PlanSectionProps) {
  return (
    <div className="space-y-8">
       <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Conduta Clínica <span className="text-red-500">*</span></label>
          <textarea
            value={formData.conduta}
            onChange={e => updateField('conduta', e.target.value)}
            className={`input-field min-h-[120px] ${formErrors?.conduta ? 'border-red-500 focus:ring-red-200' : ''}`}
            placeholder="Descreva o plano de tratamento, conduta tomada..."
          />
          {formErrors?.conduta && <p className="text-red-500 text-xs mt-1">{formErrors.conduta}</p>}
       </div>

       {/* Prescriptions */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
             <h4 className="font-bold text-slate-700 flex items-center gap-2">
                <ClipboardList className="w-4 h-4" /> Prescrição Medicamentosa
             </h4>
          </div>
          <div className="p-4">
             <PrescriptionSection
              prescricoes={formData.prescricoes}
              newPrescription={newPrescription}
              setNewPrescription={setNewPrescription}
              addPrescription={addPrescription}
              removePrescription={removePrescription}
            />

            {/* Drug Interactions */}
            {formData.prescricoes.length > 0 && (
              <div className="mt-4">
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
              <label className="block text-sm font-medium text-slate-700 mb-2">Solicitação de Exames</label>
              <textarea
                value={formData.solicitacaoExames}
                onChange={e => updateField('solicitacaoExames', e.target.value)}
                className="input-field"
                rows={3}
                placeholder="Exames laboratoriais, imagem..."
              />
           </div>
           <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Encaminhamentos</label>
              <textarea
                value={formData.encaminhamentos}
                onChange={e => updateField('encaminhamentos', e.target.value)}
                className="input-field"
                rows={3}
                placeholder="Especialidade: Motivo"
              />
           </div>
        </div>

        {/* Orientações */}
        <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
           <div className="flex justify-between items-center mb-2">
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
            className="w-full bg-white border border-blue-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            rows={4}
            placeholder="Instruções, cuidados, sinais de alerta..."
          />
        </div>

        {/* Retorno e Atestado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
              <h4 className="font-semibold text-slate-700 mb-3">Retorno</h4>
              <div className="space-y-3">
                 <InputField label="Previsão" value={formData.retorno} onChange={(v: string) => updateField('retorno', v)} placeholder="Ex: 30 dias" isSmall />
                 <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Data agendada</label>
                    <input type="date" value={formData.dataRetorno} onChange={e => updateField('dataRetorno', e.target.value)} className="input-field text-sm" />
                 </div>
              </div>
           </div>

           <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
               <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-slate-700">Atestado Médico</h4>
                  <input
                    type="checkbox"
                    checked={formData.atestadoEmitido}
                    onChange={e => updateField('atestadoEmitido', e.target.checked)}
                    className="w-5 h-5 text-primary-600 rounded"
                  />
               </div>

               {formData.atestadoEmitido && (
                 <div className="space-y-3 animate-fade-in">
                    <SelectField
                      label="Tipo"
                      value={formData.tipoAtestado}
                      onChange={(v: string) => updateField('tipoAtestado', v)}
                      options={[
                        { value: 'atestado_medico', label: 'Atestado Médico' },
                        { value: 'declaracao', label: 'Declaração' }
                      ]}
                    />
                    <NumberField label="Dias de afastamento" value={formData.diasAfastamento} onChange={(v: string) => updateField('diasAfastamento', v)} />
                 </div>
               )}
           </div>
        </div>
    </div>
  );
}

// Attachments Section
interface AttachmentsSectionProps {
  attachments: MedicalRecordAttachment[];
  onAdd: (attachment: Omit<MedicalRecordAttachment, 'id' | 'medicalRecordId' | 'uploadedAt'>) => void;
  onRemove: (id: string) => void;
}

function AttachmentsSection({ attachments, onAdd, onRemove }: AttachmentsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="bg-slate-50 p-6 rounded-xl border border-dashed border-slate-300 text-center">
         <p className="text-slate-500 mb-4">Adicione resultados de exames, imagens ou documentos externos.</p>
         <MedicalAttachments attachments={attachments} onAdd={onAdd} onRemove={onRemove} />
      </div>
    </div>
  );
}

// Prescription Section Logic (Reused)
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
            <div key={idx} className="flex items-center gap-2 p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
              <span className="flex-1 text-sm">
                <strong>{rx.medicamento}</strong> {rx.concentracao} - {rx.posologia}
                {rx.viaAdministracao && <span className="text-slate-500"> | Via: {rx.viaAdministracao}</span>}
              </span>
              <button type="button" onClick={() => removePrescription(idx)} className="text-red-500 hover:text-red-700 p-1">×</button>
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
          <option>Injetável</option>
        </select>
        <input type="text" value={newPrescription.posologia} onChange={e => setNewPrescription({ ...newPrescription, posologia: e.target.value })} className="input-field text-sm" placeholder="Posologia" />
      </div>
      <div className="flex justify-end">
         <button type="button" onClick={addPrescription} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors">
            Adicionar Prescrição
         </button>
      </div>
    </div>
  );
}

// Helpers
interface InputFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  isSmall?: boolean;
}

function InputField({ label, value, onChange, placeholder, required, isSmall = true }: InputFieldProps) {
  return (
    <div>
      <label className={`block ${isSmall ? 'text-xs font-medium text-slate-500' : 'text-sm font-medium text-slate-700'} mb-1`}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input-field w-full"
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

interface NumberFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

function NumberField({ label, value, onChange, min, max, step, placeholder }: NumberFieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input-field w-full"
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
      <label className={`block ${isSmall ? 'text-xs font-medium text-slate-500' : 'text-sm font-medium text-slate-700'} mb-1`}>{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input-field w-full"
      >
        {options.map((opt: { value: string; label: string }) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

interface CollapsibleSectionProps {
  title: string;
  icon: ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}

function CollapsibleSection({ title, icon, isExpanded, onToggle, children }: CollapsibleSectionProps) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <button type="button" onClick={onToggle} className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-semibold text-slate-700">{title}</span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {isExpanded && <div className="p-4 border-t border-slate-200">{children}</div>}
    </div>
  );
}

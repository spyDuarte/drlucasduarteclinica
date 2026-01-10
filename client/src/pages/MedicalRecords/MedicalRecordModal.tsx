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
  AlertCircle,
  Heart,
  Wind,
  Thermometer,
  Droplets,
  Weight,
  Ruler,
  Calculator,
  Gauge
} from 'lucide-react';
import type { MedicalRecord, MedicalRecordAttachment, ActiveProblem, Patient } from '../../types';
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
import { generateId, calculateAge, formatDate, formatCPF, formatPhone, sortBy } from '../../utils/helpers';

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
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in">
      <div className="bg-white w-full max-w-[90rem] h-[95vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 font-sans">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 border border-primary-100">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight leading-none">
                {record ? 'Editar Prontuário' : 'Novo Atendimento'}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <span className="font-medium text-slate-600">Prontuário Eletrônico v2.0</span>
                <span>•</span>
                <span>{record ? 'Modo de Edição' : 'Consulta SOAP'}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Patient Header */}
        {currentPatient && (
          <PatientHeader patient={currentPatient} records={patientRecords} />
        )}

        <div className="flex flex-1 overflow-hidden bg-slate-50">
          {/* Sidebar Navigation - Redesigned */}
          <div className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto">
            <nav className="flex-1 py-4 px-3 space-y-0.5">
              <SidebarItem
                label="Resumo & Problemas"
                icon={History}
                active={activeTab === 'resumo'}
                onClick={() => setActiveTab('resumo')}
              />
              <div className="my-3 border-t border-slate-100 mx-2" />
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
              <div className="my-3 border-t border-slate-100 mx-2" />
              <SidebarItem
                label="Anexos"
                icon={Paperclip}
                active={activeTab === 'anexos'}
                onClick={() => setActiveTab('anexos')}
              />
            </nav>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2 text-xs text-slate-400 justify-center">
                <CheckSquare className="w-3 h-3" />
                <span>Auditado & Verificado</span>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth">
            <form onSubmit={handleSubmit} id="medical-record-form" className="max-w-5xl mx-auto">

              {activeTab === 'resumo' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                     <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <History className="w-4 h-4 text-indigo-500" />
                        Histórico Recente
                     </h3>
                     <PatientTimeline
                        medicalRecords={patientRecords}
                        patientName={currentPatient?.nome || ''}
                        showLimit={5}
                      />
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                       <AlertTriangle className="w-4 h-4 text-amber-500" />
                       Problemas Ativos
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
                <div className="animate-fade-in space-y-6">
                   <SectionHeader title="Informações Gerais" subtitle="Dados básicos do atendimento" icon={Info} />
                   <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <GeneralInfoSection formData={formData} updateField={updateField} />
                   </div>
                </div>
              )}

              {activeTab === 'subjetivo' && (
                <div className="animate-fade-in space-y-6">
                   <SectionHeader title="Subjetivo" subtitle="Anamnese e História Clínica" icon={User} />
                   <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                     <SubjectiveSection
                        formData={formData}
                        updateField={updateField}
                        expandedSections={expandedSections}
                        toggleSection={toggleSection}
                        formErrors={formErrors}
                      />
                   </div>
                </div>
              )}

              {activeTab === 'objetivo' && (
                <div className="animate-fade-in space-y-6">
                   <SectionHeader title="Objetivo" subtitle="Exame Físico e Sinais Vitais" icon={Activity} />
                   <ObjectiveSection
                      formData={formData}
                      updateField={updateField}
                      expandedSections={expandedSections}
                      toggleSection={toggleSection}
                    />
                </div>
              )}

              {activeTab === 'avaliacao' && (
                <div className="animate-fade-in space-y-6">
                   <SectionHeader title="Avaliação" subtitle="Diagnóstico e Raciocínio Clínico" icon={Clipboard} />
                   <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <AssessmentSection formData={formData} updateField={updateField} formErrors={formErrors} />
                   </div>
                </div>
              )}

              {activeTab === 'plano' && (
                <div className="animate-fade-in space-y-6">
                   <SectionHeader title="Plano Terapêutico" subtitle="Conduta, Prescrições e Orientações" icon={CheckSquare} />
                   <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
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
                </div>
              )}

              {activeTab === 'anexos' && (
                <div className="animate-fade-in space-y-6">
                   <SectionHeader title="Anexos" subtitle="Documentos complementares" icon={Paperclip} />
                   <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                     <AttachmentsSection
                        attachments={attachments}
                        onAdd={handleAddAttachment}
                        onRemove={handleRemoveAttachment}
                      />
                   </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-800 transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 shadow-sm transition-all flex items-center gap-2 text-sm"
          >
            <FileCheck className="w-4 h-4" />
            {record ? 'Salvar Alterações' : 'Finalizar Atendimento'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Sub-components (Redesigned)
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
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative
        ${active
          ? 'bg-primary-50 text-primary-700'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`}
    >
      {active && <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary-600 rounded-r-full" />}
      <div className="flex items-center gap-3 ml-1">
        <Icon className={`w-4 h-4 ${active ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
        <span>{label}</span>
      </div>
      {hasError && <div className="w-2 h-2 rounded-full bg-red-500 shadow-sm animate-pulse" />}
    </button>
  );
}

function SectionHeader({ title, subtitle, icon: Icon }: { title: string; subtitle?: string; icon: ElementType }) {
  return (
    <div className="flex items-center gap-3 pb-2 border-b border-slate-200/60">
      <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
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

function GeneralInfoSection({ formData, updateField }: SectionProps) {
  return (
    <div className="space-y-6">
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
  );
}

function SubjectiveSection({ formData, updateField, expandedSections, toggleSection, formErrors }: SectionWithToggleProps) {
  return (
    <div className="space-y-6">
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
          onToggle={() => toggleSection('habitosVida')}
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
  );
}

// Redesigned Vital Sign Card
interface VitalSignCardProps {
  icon: ElementType;
  label: string;
  value: string;
  unit: string;
  colorClass: string; // expects something like 'text-blue-600 bg-blue-50'
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

function ObjectiveSection({ formData, updateField, expandedSections, toggleSection }: SectionWithToggleProps) {
  const calculateIMC = () => {
    const peso = formData.peso ? Number(formData.peso) : 0;
    const altura = formData.altura ? Number(formData.altura) : 0;
    if (peso > 0 && altura > 0) {
      const alturaMetros = altura / 100;
      return (peso / (alturaMetros * alturaMetros)).toFixed(1);
    }
    return '';
  };

  const imc = calculateIMC();

  return (
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
                value={imc}
                unit="kg/m²"
                colorClass="bg-purple-50 text-purple-600"
              >
                <div className="text-xs text-slate-600 italic py-2">
                  {imc ? (
                    <span>
                      {Number(imc) < 18.5 && 'Abaixo do peso'}
                      {Number(imc) >= 18.5 && Number(imc) < 25 && 'Peso normal'}
                      {Number(imc) >= 25 && Number(imc) < 30 && 'Sobrepeso'}
                      {Number(imc) >= 30 && 'Obesidade'}
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

function AssessmentSection({ formData, updateField, formErrors }: SectionProps) {
  return (
    <div className="space-y-6">
      <div className="bg-amber-50/50 rounded-lg p-5 border border-amber-100/60">
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
          <label className="block text-sm font-bold text-slate-800 mb-2">Conduta Clínica <span className="text-red-500">*</span></label>
          <textarea
            value={formData.conduta}
            onChange={e => updateField('conduta', e.target.value)}
            className={`input-field min-h-[120px] leading-relaxed ${formErrors?.conduta ? 'border-red-500 focus:ring-red-200' : ''}`}
            placeholder="Descreva o plano de tratamento..."
          />
          {formErrors?.conduta && <p className="text-red-500 text-xs mt-1">{formErrors.conduta}</p>}
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
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Solicitação de Exames</label>
              <textarea
                value={formData.solicitacaoExames}
                onChange={e => updateField('solicitacaoExames', e.target.value)}
                className="input-field"
                rows={3}
                placeholder="Exames laboratoriais, imagem..."
              />
           </div>
           <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Encaminhamentos</label>
              <textarea
                value={formData.encaminhamentos}
                onChange={e => updateField('encaminhamentos', e.target.value)}
                className="input-field"
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
                 <InputField label="Previsão" value={formData.retorno} onChange={(v: string) => updateField('retorno', v)} placeholder="Ex: 30 dias" isSmall />
                 <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Data agendada</label>
                    <input type="date" value={formData.dataRetorno} onChange={e => updateField('dataRetorno', e.target.value)} className="input-field text-sm" />
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

function PatientHeader({ patient, records }: { patient: Patient; records: MedicalRecord[] }) {
  const sortedRecords = sortBy(records, 'data', 'desc');
  const lastVisit = sortedRecords.length > 0 ? sortedRecords[0] : null;
  const age = calculateAge(patient.dataNascimento);

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 shrink-0">
      <div className="flex flex-col justify-center">
        <h2 className="text-base font-bold text-slate-900 leading-tight">{patient.nome}</h2>
        <p className="text-xs text-slate-500 mt-1 font-mono">{formatCPF(patient.cpf)}</p>
      </div>

      <div className="flex flex-col justify-center border-l border-slate-100 pl-6 md:border-l-0 lg:border-l">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Idade</span>
        <div className="flex items-baseline gap-2">
           <span className="text-sm font-semibold text-slate-700">{age} anos</span>
           <span className="text-[11px] text-slate-400">{formatDate(patient.dataNascimento)}</span>
        </div>
      </div>

      <div className="flex flex-col justify-center lg:border-l border-slate-100 lg:pl-6">
         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Contato</span>
         <div className="text-sm text-slate-700 font-medium">{formatPhone(patient.telefone)}</div>
      </div>

      <div className="flex flex-col justify-center lg:border-l border-slate-100 lg:pl-6">
         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Alergias</span>
         <div className="text-sm font-medium truncate">
            {patient.alergias && patient.alergias.length > 0 ? (
               <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-full text-xs" title={Array.isArray(patient.alergias) ? patient.alergias.join(', ') : patient.alergias}>
                 {Array.isArray(patient.alergias) ? patient.alergias[0] + (patient.alergias.length > 1 ? '...' : '') : patient.alergias}
               </span>
            ) : (
               <span className="text-slate-400 text-xs">Nenhuma registrada</span>
            )}
         </div>
      </div>

      <div className="flex flex-col justify-center lg:border-l border-slate-100 lg:pl-6">
         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Histórico</span>
         <div className="flex items-center gap-4">
            <div>
               <span className="text-lg font-bold text-primary-600">{records.length}</span>
               <span className="text-[10px] text-slate-500 ml-1">Visitas</span>
            </div>
            {lastVisit && (
               <div className="pl-4 border-l border-slate-100">
                  <div className="text-[10px] text-slate-400 uppercase">Última</div>
                  <div className="text-xs font-medium text-slate-700">{formatDate(lastVisit.data, 'dd/MM')}</div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}

interface AttachmentsSectionProps {
  attachments: MedicalRecordAttachment[];
  onAdd: (attachment: Omit<MedicalRecordAttachment, 'id' | 'medicalRecordId' | 'uploadedAt'>) => void;
  onRemove: (id: string) => void;
}

function AttachmentsSection({ attachments, onAdd, onRemove }: AttachmentsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="bg-slate-50 p-8 rounded-xl border border-dashed border-slate-300 text-center hover:bg-slate-50/80 transition-colors">
         <p className="text-slate-500 mb-4 text-sm">Arraste arquivos ou clique para adicionar resultados de exames.</p>
         <MedicalAttachments attachments={attachments} onAdd={onAdd} onRemove={onRemove} />
      </div>
    </div>
  );
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

// Helpers (Styled)
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
      <label className={`block ${isSmall ? 'text-xs font-bold text-slate-500 uppercase tracking-wide' : 'text-sm font-medium text-slate-700'} mb-1.5`}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input-field w-full text-sm"
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
      {label && <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">{label}</label>}
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input-field w-full text-sm"
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
      <label className={`block ${isSmall ? 'text-xs font-bold text-slate-500 uppercase tracking-wide' : 'text-sm font-medium text-slate-700'} mb-1.5`}>{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input-field w-full text-sm"
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
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
      <button type="button" onClick={onToggle} className="w-full px-4 py-3 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between transition-colors">
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

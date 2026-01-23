import { useState } from 'react';
import {
  Stethoscope,
  X,
  FileCheck,
  History,
  AlertTriangle,
  Info,
  User,
  Activity,
  Clipboard,
  CheckSquare,
  Paperclip
} from 'lucide-react';
import type { MedicalRecord, MedicalRecordAttachment, ActiveProblem } from '../../types';
import { useMedicalRecordForm } from './useMedicalRecordForm';
import { ActiveProblemsManager } from '../../components/ActiveProblemsManager';
import { PatientTimeline } from '../../components/PatientTimeline';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { generateId } from '../../utils/helpers';
import {
  GeneralInfoSection,
  SubjectiveSection,
  ObjectiveSection,
  AssessmentSection,
  PlanSection,
  AttachmentsSection
} from './sections';
import { PatientHeader } from './components/PatientHeader';
import { SidebarItem } from './components/SidebarItem';

interface MedicalRecordModalProps {
  patientId: string;
  patient?: { medicamentosEmUso?: string[] };
  record: MedicalRecord | null;
  onClose: () => void;
  onSave: (data: Partial<MedicalRecord>) => void;
}

type TabId = 'resumo' | 'geral' | 'subjetivo' | 'objetivo' | 'avaliacao' | 'plano' | 'anexos';

export function MedicalRecordModal({ patientId, record, onClose, onSave }: MedicalRecordModalProps) {
  const { user } = useAuth();
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
    // Obtém nome do usuário para auditoria
    const currentUserName = user?.nome || 'Usuário do Sistema';

    // Adiciona anexos
    const finalData = {
      ...recordData,
      attachments,
      // Adiciona auditoria
      audit: record?.audit
        ? {
            ...record.audit,
            lastEditedBy: currentUserName,
            lastEditedAt: now,
          }
        : {
            createdBy: currentUserName,
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
                  <GeneralInfoSection formData={formData} updateField={updateField} />
                </div>
              )}

              {activeTab === 'subjetivo' && (
                <div className="animate-fade-in space-y-6">
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
                <div className="animate-fade-in space-y-6">
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
                  <AssessmentSection formData={formData} updateField={updateField} formErrors={formErrors} />
                </div>
              )}

              {activeTab === 'plano' && (
                <div className="animate-fade-in space-y-6">
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
                <div className="animate-fade-in space-y-6">
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



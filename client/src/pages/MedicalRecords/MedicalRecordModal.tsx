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
  Paperclip,
  ChevronLeft,
  ChevronRight,
  Check,
  MessageSquare,
  Search as SearchIcon,
  Brain,
  ClipboardCheck,
  AlertCircle
} from 'lucide-react';
import type { MedicalRecord, MedicalRecordAttachment } from '../../types';
import { useMedicalRecordForm, type FormErrors } from './useMedicalRecordForm';
import type { PrescriptionData } from './types';
import { VitalSignsValidator } from '../../components/VitalSignsValidator';
import { DrugInteractionChecker } from '../../components/DrugInteractionChecker';
import { OrientationTemplateSelector } from '../../components/OrientationTemplateSelector';
import { MedicalAttachments } from '../../components/MedicalAttachments';
import { generateId } from '../../utils/helpers';

interface MedicalRecordModalProps {
  patientId: string;
  patient?: { medicamentosEmUso?: string[] };
  record: MedicalRecord | null;
  onClose: () => void;
  onSave: (data: Partial<MedicalRecord>) => void;
}

// Tipos de etapas
type StepId = 'info' | 'subjetivo' | 'objetivo' | 'avaliacao' | 'plano' | 'anexos';

interface Step {
  id: StepId;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

const steps: Step[] = [
  {
    id: 'info',
    label: 'Informações',
    shortLabel: 'Info',
    icon: <Clipboard className="w-4 h-4" />,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-300'
  },
  {
    id: 'subjetivo',
    label: 'Subjetivo',
    shortLabel: 'S',
    icon: <MessageSquare className="w-4 h-4" />,
    color: 'text-sky-600',
    bgColor: 'bg-sky-100',
    borderColor: 'border-sky-300'
  },
  {
    id: 'objetivo',
    label: 'Objetivo',
    shortLabel: 'O',
    icon: <SearchIcon className="w-4 h-4" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-300'
  },
  {
    id: 'avaliacao',
    label: 'Avaliação',
    shortLabel: 'A',
    icon: <Brain className="w-4 h-4" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-300'
  },
  {
    id: 'plano',
    label: 'Plano',
    shortLabel: 'P',
    icon: <ClipboardCheck className="w-4 h-4" />,
    color: 'text-violet-600',
    bgColor: 'bg-violet-100',
    borderColor: 'border-violet-300'
  },
  {
    id: 'anexos',
    label: 'Anexos',
    shortLabel: 'Anexos',
    icon: <Paperclip className="w-4 h-4" />,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    borderColor: 'border-indigo-300'
  },
];

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

  const [currentStep, setCurrentStep] = useState<StepId>('info');
  const [completedSteps, setCompletedSteps] = useState<Set<StepId>>(new Set());
  const [attachments, setAttachments] = useState<MedicalRecordAttachment[]>(
    record?.attachments || []
  );

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  const currentStepData = steps[currentStepIndex];

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

  const goToStep = (stepId: StepId) => {
    // Marca o step atual como completo ao sair
    if (currentStep !== stepId) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
    }
    setCurrentStep(stepId);
  };

  const goNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const goPrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstErrorField = document.querySelector('.field-error');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const recordData = buildRecordData(patientId);
    const now = new Date().toISOString();

    const finalData = {
      ...recordData,
      attachments,
      audit: record?.audit
        ? {
            ...record.audit,
            lastEditedBy: 'Usuário Atual',
            lastEditedAt: now,
          }
        : {
            createdBy: 'Usuário Atual',
            createdAt: now,
          },
    };

    onSave(finalData);
  };

  // Calcular progresso
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  // Verificar se há erros em cada seção
  const hasErrorsInStep = (stepId: StepId): boolean => {
    switch (stepId) {
      case 'subjetivo':
        return !!(formErrors.queixaPrincipal || formErrors.historicoDoencaAtual);
      case 'objetivo':
        return !!formErrors.exameFisico;
      case 'avaliacao':
        return !!formErrors.cid10;
      case 'plano':
        return !!formErrors.conduta;
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-2 sm:p-4 animate-fade-in overflow-y-auto overscroll-contain">
      <div className="medical-modal w-full max-w-5xl my-4 sm:my-8 animate-scale-in max-h-[95vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header Premium */}
        <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-indigo-500 px-6 py-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyek0zNiAyNnYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {record ? 'Editar Atendimento' : 'Novo Atendimento'}
                </h2>
                <p className="text-sm text-white/70">Metodologia SOAP</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-5 relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/80">Progresso do registro</span>
              <span className="text-sm font-medium text-white">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Step Navigation */}
        <div className="border-b border-gray-100 bg-gray-50/50 px-4 py-3">
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {steps.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = completedSteps.has(step.id);
              const hasErrors = hasErrorsInStep(step.id);

              return (
                <button
                  key={step.id}
                  onClick={() => goToStep(step.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap
                    ${isActive
                      ? `${step.bgColor} ${step.color} shadow-sm`
                      : isCompleted
                        ? 'bg-green-50 text-green-600'
                        : 'bg-white text-gray-500 hover:bg-gray-100'
                    }
                    ${hasErrors ? 'ring-2 ring-red-300' : ''}
                  `}
                >
                  <span className={`
                    w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold
                    ${isActive
                      ? `${step.color} bg-white/50`
                      : isCompleted
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-400'
                    }
                  `}>
                    {isCompleted && !isActive ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : hasErrors ? (
                      <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                    ) : (
                      step.shortLabel
                    )}
                  </span>
                  <span className="hidden sm:inline">{step.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-6 space-y-6">
            {/* Informações Gerais */}
            {currentStep === 'info' && (
              <GeneralInfoSection formData={formData} updateField={updateField} />
            )}

            {/* Subjetivo */}
            {currentStep === 'subjetivo' && (
              <SubjectiveSection
                formData={formData}
                updateField={updateField}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
                formErrors={formErrors}
              />
            )}

            {/* Objetivo */}
            {currentStep === 'objetivo' && (
              <ObjectiveSection
                formData={formData}
                updateField={updateField}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
                formErrors={formErrors}
              />
            )}

            {/* Avaliação */}
            {currentStep === 'avaliacao' && (
              <AssessmentSection formData={formData} updateField={updateField} formErrors={formErrors} />
            )}

            {/* Plano */}
            {currentStep === 'plano' && (
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
            )}

            {/* Anexos */}
            {currentStep === 'anexos' && (
              <AttachmentsSection
                attachments={attachments}
                onAdd={handleAddAttachment}
                onRemove={handleRemoveAttachment}
              />
            )}
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={goPrevious}
                disabled={currentStepIndex === 0}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all
                  ${currentStepIndex === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 hidden sm:inline">
                  Etapa {currentStepIndex + 1} de {steps.length}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all"
                >
                  Cancelar
                </button>

                {currentStepIndex < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    className={`
                      flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all
                      ${currentStepData.bgColor} ${currentStepData.color} hover:opacity-90
                    `}
                  >
                    Próximo
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/25 transition-all"
                  >
                    <FileCheck className="w-4 h-4" />
                    {record ? 'Salvar alterações' : 'Registrar atendimento'}
                  </button>
                )}
              </div>
            </div>
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
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
          <Clipboard className="w-5 h-5 text-slate-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Informações do Atendimento</h3>
          <p className="text-sm text-gray-500">Dados básicos do atendimento</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Data do atendimento</label>
          <input
            type="date"
            value={formData.data}
            onChange={e => updateField('data', e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de atendimento</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Local do atendimento</label>
          <input
            type="text"
            value={formData.localAtendimento}
            onChange={e => updateField('localAtendimento', e.target.value)}
            className="input-field"
            placeholder="Consultório, Hospital, etc."
          />
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <h4 className="font-medium text-blue-800 mb-2">Dica rápida</h4>
        <p className="text-sm text-blue-700">
          Navegue pelas etapas usando os botões acima ou avance com o botão "Próximo".
          Todas as seções são salvas automaticamente ao navegar.
        </p>
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
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
          <span className="text-lg font-bold text-sky-600">S</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-sky-700">Subjetivo</h3>
          <p className="text-sm text-sky-600/70">Relato do paciente e histórico</p>
        </div>
      </div>

      <div className="bg-sky-50/50 rounded-xl p-5 border border-sky-100 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={formErrors.queixaPrincipal ? 'field-error' : ''}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Duração dos sintomas</label>
            <input
              type="text"
              value={formData.duracaoSintomas}
              onChange={e => updateField('duracaoSintomas', e.target.value)}
              className="input-field"
              placeholder="Ex: 3 dias, 2 semanas, 1 mês"
            />
          </div>
        </div>

        <div className={formErrors.historicoDoencaAtual ? 'field-error' : ''}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            História da doença atual <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.historicoDoencaAtual}
            onChange={e => updateField('historicoDoencaAtual', e.target.value)}
            className={`input-field ${formErrors.historicoDoencaAtual ? 'border-red-500 focus:ring-red-500' : ''}`}
            rows={4}
            placeholder="Descreva a evolução dos sintomas..."
          />
          {formErrors.historicoDoencaAtual && (
            <p className="text-red-500 text-xs mt-1">{formErrors.historicoDoencaAtual}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fatores de melhora</label>
            <input
              type="text"
              value={formData.fatoresMelhora}
              onChange={e => updateField('fatoresMelhora', e.target.value)}
              className="input-field"
              placeholder="O que alivia os sintomas?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fatores de piora</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Sintomas associados</label>
            <input
              type="text"
              value={formData.sintomasAssociados}
              onChange={e => updateField('sintomasAssociados', e.target.value)}
              className="input-field"
              placeholder="Outros sintomas relacionados"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tratamentos prévios</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Impacto na qualidade de vida</label>
          <input
            type="text"
            value={formData.impactoQualidadeVida}
            onChange={e => updateField('impactoQualidadeVida', e.target.value)}
            className="input-field"
            placeholder="Como afeta as atividades diárias?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Revisão de sistemas</label>
          <textarea
            value={formData.revisaoSistemas}
            onChange={e => updateField('revisaoSistemas', e.target.value)}
            className="input-field"
            rows={2}
            placeholder="Cardiovascular, respiratório, gastrointestinal, etc."
          />
        </div>
      </div>

      {/* Hábitos de Vida */}
      <CollapsibleSection
        title="Hábitos de Vida"
        icon={<Activity className="w-4 h-4 text-sky-500" />}
        isExpanded={expandedSections.habitosVida}
        onToggle={() => toggleSection('habitosVida')}
        bgColor="bg-sky-50/30"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
        bgColor="bg-sky-50/30"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Doenças prévias</label>
            <textarea
              value={formData.historicoPatologicoPregrasso}
              onChange={e => updateField('historicoPatologicoPregrasso', e.target.value)}
              className="input-field"
              rows={2}
              placeholder="HAS, DM, dislipidemia, etc."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Cirurgias anteriores" value={formData.cirurgiasAnteriores} onChange={v => updateField('cirurgiasAnteriores', v)} placeholder="Apendicectomia (2015), Colecistectomia (2018)..." />
            <InputField label="Internações prévias" value={formData.internacoesPrevias} onChange={v => updateField('internacoesPrevias', v)} placeholder="Motivo e data" />
          </div>
          <InputField label="Vacinação" value={formData.vacinacao} onChange={v => updateField('vacinacao', v)} placeholder="Status vacinal, vacinas recentes..." />
        </div>
      </CollapsibleSection>
    </div>
  );
}

// Objective Section
function ObjectiveSection({ formData, updateField, expandedSections, toggleSection, formErrors }: ExpandableSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
          <span className="text-lg font-bold text-emerald-600">O</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-emerald-700">Objetivo</h3>
          <p className="text-sm text-emerald-600/70">Exame físico e sinais vitais</p>
        </div>
      </div>

      <div className="bg-emerald-50/50 rounded-xl p-5 border border-emerald-100 space-y-4">
        {/* Estado Geral */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
          <label className="block text-sm font-semibold text-gray-700 mb-3">Sinais Vitais</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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

        <div className={formErrors.exameFisico ? 'field-error' : ''}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Exame físico geral <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.exameFisico}
            onChange={e => updateField('exameFisico', e.target.value)}
            className={`input-field ${formErrors.exameFisico ? 'border-red-500 focus:ring-red-500' : ''}`}
            rows={4}
            placeholder="Descreva os achados do exame físico..."
          />
          {formErrors.exameFisico && (
            <p className="text-red-500 text-xs mt-1">{formErrors.exameFisico}</p>
          )}
        </div>
      </div>

      {/* Exame Físico Detalhado */}
      <CollapsibleSection
        title="Exame Físico Detalhado por Sistemas"
        icon={<Stethoscope className="w-4 h-4 text-emerald-500" />}
        isExpanded={expandedSections.exameFisicoDetalhado}
        onToggle={() => toggleSection('exameFisicoDetalhado')}
        bgColor="bg-emerald-50/30"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <label className="block text-sm font-medium text-gray-700 mb-2">Exames complementares</label>
        <textarea
          value={formData.examesComplementares}
          onChange={e => updateField('examesComplementares', e.target.value)}
          className="input-field"
          rows={2}
          placeholder="Resultados de exames trazidos pelo paciente..."
        />
      </div>
    </div>
  );
}

// Assessment Section
function AssessmentSection({ formData, updateField, formErrors }: FormSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
          <span className="text-lg font-bold text-amber-600">A</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-amber-700">Avaliação</h3>
          <p className="text-sm text-amber-600/70">Diagnóstico e hipóteses clínicas</p>
        </div>
      </div>

      <div className="bg-amber-50/50 rounded-xl p-5 border border-amber-100 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Diagnóstico principal" value={formData.diagnosticoPrincipal} onChange={v => updateField('diagnosticoPrincipal', v)} placeholder="Diagnóstico mais provável" />
          <div className={formErrors?.cid10 ? 'field-error' : ''}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CID-10 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.cid10}
              onChange={e => updateField('cid10', e.target.value)}
              className={`input-field ${formErrors?.cid10 ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="Ex: J11, R50.9 (separados por vírgula)"
              required
            />
            {formErrors?.cid10 && (
              <p className="text-red-500 text-xs mt-1">{formErrors.cid10}</p>
            )}
          </div>
        </div>

        <InputField label="Hipóteses diagnósticas (separadas por vírgula)" value={formData.hipotesesDiagnosticas} onChange={v => updateField('hipotesesDiagnosticas', v)} placeholder="Lista de possíveis diagnósticos" />
        <InputField label="Diagnósticos secundários (separados por vírgula)" value={formData.diagnosticosSecundarios} onChange={v => updateField('diagnosticosSecundarios', v)} placeholder="Comorbidades, diagnósticos associados" />
        <InputField label="Diagnóstico diferencial (separados por vírgula)" value={formData.diagnosticoDiferencial} onChange={v => updateField('diagnosticoDiferencial', v)} placeholder="Diagnósticos a serem descartados" />

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
          />
          <InputField label="Prognóstico" value={formData.prognostico} onChange={v => updateField('prognostico', v)} placeholder="Bom, reservado, etc." />
          <InputField label="Classificação de risco" value={formData.classificacaoRisco} onChange={v => updateField('classificacaoRisco', v)} placeholder="Manchester, ESI, etc." />
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
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
          <span className="text-lg font-bold text-violet-600">P</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-violet-700">Plano</h3>
          <p className="text-sm text-violet-600/70">Conduta e tratamento</p>
        </div>
      </div>

      <div className="bg-violet-50/50 rounded-xl p-5 border border-violet-100 space-y-4">
        <div className={formErrors.conduta ? 'field-error' : ''}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Conduta <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.conduta}
            onChange={e => updateField('conduta', e.target.value)}
            className={`input-field ${formErrors.conduta ? 'border-red-500 focus:ring-red-500' : ''}`}
            rows={4}
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

        <InputField label="Prescrições não medicamentosas (separadas por vírgula)" value={formData.prescricoesNaoMedicamentosas} onChange={v => updateField('prescricoesNaoMedicamentosas', v)} placeholder="Repouso, dieta, fisioterapia, etc." />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Solicitação de exames (separados por vírgula)" value={formData.solicitacaoExames} onChange={v => updateField('solicitacaoExames', v)} placeholder="Hemograma, glicemia, etc." />
          <InputField label="Procedimentos realizados (separados por vírgula)" value={formData.procedimentosRealizados} onChange={v => updateField('procedimentosRealizados', v)} placeholder="Sutura, drenagem, etc." />
        </div>

        <InputField label="Encaminhamentos (formato: Especialidade: Motivo; separados por ponto e vírgula)" value={formData.encaminhamentos} onChange={v => updateField('encaminhamentos', v)} placeholder="Cardiologia: avaliação de sopro; Ortopedia: dor lombar crônica" />
      </div>

      {/* Documentos */}
      <CollapsibleSection
        title="Atestados e Documentos"
        icon={<FileCheck className="w-4 h-4 text-violet-500" />}
        isExpanded={expandedSections.documentos}
        onToggle={() => toggleSection('documentos')}
        bgColor="bg-violet-50/30"
      >
        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.atestadoEmitido}
              onChange={e => updateField('atestadoEmitido', e.target.checked)}
              className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
            />
            <span className="text-sm font-medium text-gray-700">Atestado emitido</span>
          </label>
          {formData.atestadoEmitido && (
            <div className="grid grid-cols-2 gap-4">
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
      </CollapsibleSection>

      {/* Retorno */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 space-y-4">
        <h4 className="font-semibold text-gray-900">Retorno e Orientações</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Retorno" value={formData.retorno} onChange={v => updateField('retorno', v)} placeholder="Ex: 30 dias, 1 semana, se necessário" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data do retorno</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Orientações alimentares</label>
            <textarea
              value={formData.orientacoesAlimentares}
              onChange={e => updateField('orientacoesAlimentares', e.target.value)}
              className="input-field"
              rows={2}
              placeholder="Restrições ou recomendações alimentares..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Restrições de atividades</label>
            <textarea
              value={formData.restricoesAtividades}
              onChange={e => updateField('restricoesAtividades', e.target.value)}
              className="input-field"
              rows={2}
              placeholder="Atividades a evitar..."
            />
          </div>
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.consentimentoInformado}
            onChange={e => updateField('consentimentoInformado', e.target.checked)}
            className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
          />
          <span className="text-sm text-gray-700">
            Paciente recebeu e compreendeu as orientações e consentiu com o plano terapêutico
          </span>
        </label>
      </div>

      {/* Plano Terapêutico */}
      <CollapsibleSection
        title="Plano Terapêutico Detalhado"
        icon={<ClipboardList className="w-4 h-4 text-violet-500" />}
        isExpanded={expandedSections.planoTerapeutico}
        onToggle={() => toggleSection('planoTerapeutico')}
        bgColor="bg-violet-50/30"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Objetivos do tratamento</label>
            <textarea
              value={formData.objetivosTratamento}
              onChange={e => updateField('objetivosTratamento', e.target.value)}
              className="input-field"
              rows={2}
              placeholder="Metas a serem alcançadas..."
            />
          </div>
          <InputField label="Metas terapêuticas (separadas por vírgula)" value={formData.metasTerapeuticas} onChange={v => updateField('metasTerapeuticas', v)} placeholder="PA < 140/90, HbA1c < 7%, etc." />
          <InputField label="Alertas e cuidados especiais (separados por vírgula)" value={formData.alertasCuidados} onChange={v => updateField('alertasCuidados', v)} placeholder="Sinais de alerta, quando procurar emergência..." />
        </div>
      </CollapsibleSection>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Intercorrências durante o atendimento</label>
        <textarea
          value={formData.intercorrencias}
          onChange={e => updateField('intercorrencias', e.target.value)}
          className="input-field"
          rows={2}
          placeholder="Eventos ou complicações durante a consulta..."
        />
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
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
          <Paperclip className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-indigo-700">Anexos e Documentos</h3>
          <p className="text-sm text-indigo-600/70">Exames, laudos, imagens e documentos</p>
        </div>
      </div>

      <div className="bg-indigo-50/50 rounded-xl p-5 border border-indigo-100">
        <MedicalAttachments attachments={attachments} onAdd={onAdd} onRemove={onRemove} />
      </div>
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
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-gray-700">Prescrições Medicamentosas</label>

      {prescricoes.length > 0 && (
        <div className="space-y-2">
          {prescricoes.map((rx, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-violet-200">
              <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center text-violet-600 font-bold text-sm">
                {idx + 1}
              </div>
              <span className="flex-1 text-sm">
                <strong className="text-gray-900">{rx.medicamento}</strong> {rx.concentracao && `${rx.concentracao} -`} {rx.formaFarmaceutica} - {rx.posologia}
                {rx.viaAdministracao && <span className="text-gray-500"> | Via: {rx.viaAdministracao}</span>}
                {rx.usoControlado && <span className="text-red-500 ml-2 font-medium">[Controlado]</span>}
              </span>
              <button
                type="button"
                onClick={() => removePrescription(idx)}
                className="w-8 h-8 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
        <p className="text-sm font-medium text-gray-600">Adicionar medicamento:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
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
            <input type="checkbox" checked={newPrescription.usoControlado} onChange={e => setNewPrescription({ ...newPrescription, usoControlado: e.target.checked })} className="rounded border-gray-300 text-violet-600" />
            Controlado
          </label>
          <button
            type="button"
            onClick={addPrescription}
            className="px-4 py-2 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded-lg font-medium text-sm transition-colors"
          >
            Adicionar
          </button>
        </div>
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
  bgColor?: string;
}

function CollapsibleSection({ title, icon, isExpanded, onToggle, children, bgColor = 'bg-gray-50' }: CollapsibleSectionProps) {
  return (
    <div className={`rounded-xl border border-gray-200 overflow-hidden ${bgColor}`}>
      <button type="button" onClick={onToggle} className="w-full px-4 py-3 flex items-center justify-between hover:bg-black/5 transition-colors">
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-semibold text-gray-700">{title}</span>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>
      {isExpanded && <div className="px-4 pb-4 pt-2 space-y-4">{children}</div>}
    </div>
  );
}

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

function InputField({ label, value, onChange, placeholder, required }: InputFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input-field"
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
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input-field"
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
}

function SelectField({ label, value, onChange, options }: SelectFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input-field"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

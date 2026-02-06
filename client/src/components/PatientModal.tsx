import { X } from 'lucide-react';
import { usePatientForm } from '../hooks/usePatientForm';
import type { Patient } from '../types';
import { useEffect, useRef } from 'react';
import { FormSection, InputField, SelectField, TextAreaField } from './Shared/FormComponents';

interface PatientModalProps {
  patient: Patient | null;
  onClose: () => void;
  onSave: (data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => void;
  isLoading?: boolean;
}

export default function PatientModal({ patient, onClose, onSave, isLoading = false }: PatientModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const {
    formData,
    errors,
    updateField,
    handleCPFChange,
    handlePhoneChange,
    handleCEPChange,
    validateForm,
    buildPatientData
  } = usePatientForm(patient);

  useEffect(() => {
    previousActiveElement.current = document.activeElement as HTMLElement;

    const modal = modalRef.current;
    if (modal) {
      const focusableElements = modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      firstElement?.focus();

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
        if (e.key === 'Escape') {
          onClose();
        }
      };

      modal.addEventListener('keydown', handleTabKey);
      return () => {
        modal.removeEventListener('keydown', handleTabKey);
        previousActiveElement.current?.focus();
      };
    }
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(buildPatientData());
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl w-full max-w-3xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto animate-scale-in"
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
            {patient ? 'Editar Paciente' : 'Novo Paciente'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Dados Pessoais */}
          <FormSection title="Dados Pessoais">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <InputField
                  id="nome"
                  label="Nome completo"
                  required
                  value={formData.nome}
                  onChange={v => updateField('nome', v)}
                  error={errors.nome}
                  errorId="nome-error"
                />
              </div>
              <InputField
                id="cpf"
                label="CPF"
                required
                value={formData.cpf}
                onChange={handleCPFChange}
                error={errors.cpf}
                errorId="cpf-error"
                placeholder="000.000.000-00"
                maxLength={14}
              />
              <InputField
                id="dataNascimento"
                label="Data de nascimento"
                required
                type="date"
                value={formData.dataNascimento}
                onChange={v => updateField('dataNascimento', v)}
                error={errors.dataNascimento}
                errorId="data-error"
              />
              <div>
                <SelectField
                  id="sexo"
                  label="Sexo"
                  required
                  value={formData.sexo}
                  onChange={v => updateField('sexo', v)}
                  options={[
                    { value: 'M', label: 'Masculino' },
                    { value: 'F', label: 'Feminino' },
                    { value: 'O', label: 'Outro' }
                  ]}
                />
              </div>
              <InputField
                id="telefone"
                label="Telefone"
                required
                type="tel"
                value={formData.telefone}
                onChange={handlePhoneChange}
                error={errors.telefone}
                errorId="telefone-error"
                placeholder="(00) 00000-0000"
                maxLength={15}
              />
              <div className="md:col-span-2">
                <InputField
                  id="email"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={v => updateField('email', v)}
                />
              </div>
            </div>
          </FormSection>

          {/* Endereço */}
          <FormSection title="Endereço">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <InputField
                  id="logradouro"
                  label="Logradouro"
                  value={formData.logradouro}
                  onChange={v => updateField('logradouro', v)}
                />
              </div>
              <InputField
                id="numero"
                label="Número"
                value={formData.numero}
                onChange={v => updateField('numero', v)}
              />
              <InputField
                id="complemento"
                label="Complemento"
                value={formData.complemento}
                onChange={v => updateField('complemento', v)}
              />
              <InputField
                id="bairro"
                label="Bairro"
                value={formData.bairro}
                onChange={v => updateField('bairro', v)}
              />
              <InputField
                id="cidade"
                label="Cidade"
                value={formData.cidade}
                onChange={v => updateField('cidade', v)}
              />
              <InputField
                id="estado"
                label="Estado"
                value={formData.estado}
                onChange={v => updateField('estado', v)}
                maxLength={2}
              />
              <InputField
                id="cep"
                label="CEP"
                value={formData.cep}
                onChange={handleCEPChange}
                placeholder="00000-000"
                maxLength={9}
              />
            </div>
          </FormSection>

          {/* Convênio */}
          <FormSection title="Convênio (opcional)">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField
                id="convenioNome"
                label="Nome do convênio"
                value={formData.convenioNome}
                onChange={v => updateField('convenioNome', v)}
              />
              <InputField
                id="convenioNumero"
                label="Número da carteira"
                value={formData.convenioNumero}
                onChange={v => updateField('convenioNumero', v)}
              />
              <InputField
                id="convenioValidade"
                label="Validade"
                type="date"
                value={formData.convenioValidade}
                onChange={v => updateField('convenioValidade', v)}
              />
            </div>
          </FormSection>

          {/* Histórico Médico */}
          <FormSection title="Histórico Médico">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                id="alergias"
                label="Alergias (separadas por vírgula)"
                value={formData.alergias}
                onChange={v => updateField('alergias', v)}
                placeholder="Ex: Dipirona, Penicilina"
              />
              <InputField
                id="medicamentos"
                label="Medicamentos em uso"
                value={formData.medicamentosEmUso}
                onChange={v => updateField('medicamentosEmUso', v)}
                placeholder="Ex: Losartana 50mg, Metformina 850mg"
              />
              <div className="md:col-span-2">
                <TextAreaField
                  id="historicoFamiliar"
                  label="Histórico familiar"
                  value={formData.historicoFamiliar}
                  onChange={v => updateField('historicoFamiliar', v)}
                  rows={2}
                />
              </div>
              <div className="md:col-span-2">
                <TextAreaField
                  id="observacoes"
                  label="Observações"
                  value={formData.observacoes}
                  onChange={v => updateField('observacoes', v)}
                  rows={2}
                />
              </div>
            </div>
          </FormSection>


          {/* Consentimentos LGPD */}
          <FormSection title="Consentimentos LGPD">
            <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
              <label className="flex items-start gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.consentTratamentoDados}
                  onChange={e => updateField('consentTratamentoDados', e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span>
                  Autorizo o tratamento de dados pessoais sensíveis para fins assistenciais e continuidade do cuidado.
                </span>
              </label>

              <label className="flex items-start gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.consentCompartilhamento}
                  onChange={e => updateField('consentCompartilhamento', e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span>
                  Autorizo compartilhamento de dados com terceiros vinculados ao atendimento (ex.: laboratório, convênio).
                </span>
              </label>

              <label className="flex items-start gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.consentComunicacao}
                  onChange={e => updateField('consentComunicacao', e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span>
                  Autorizo contato por telefone/e-mail/WhatsApp para lembretes, orientações e comunicações da clínica.
                </span>
              </label>

              <TextAreaField
                id="consentRevogadoMotivo"
                label="Motivo de revogação (opcional)"
                value={formData.consentRevogadoMotivo}
                onChange={v => updateField('consentRevogadoMotivo', v)}
                rows={2}
                placeholder="Preencha quando houver revogação de consentimento"
              />
            </div>
          </FormSection>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading
                ? 'Salvando...'
                : patient
                  ? 'Salvar alterações'
                  : 'Cadastrar paciente'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

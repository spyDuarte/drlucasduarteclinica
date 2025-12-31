import { X } from 'lucide-react';
import { usePatientForm } from '../hooks/usePatientForm';
import type { Patient } from '../types';

interface PatientModalProps {
  patient: Patient | null;
  onClose: () => void;
  onSave: (data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => void;
  isLoading?: boolean;
}

export default function PatientModal({ patient, onClose, onSave, isLoading = false }: PatientModalProps) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(buildPatientData());
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
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
                <FormInput
                  id="nome"
                  label="Nome completo *"
                  value={formData.nome}
                  onChange={v => updateField('nome', v)}
                  error={errors.nome}
                  errorId="nome-error"
                />
              </div>
              <FormInput
                id="cpf"
                label="CPF *"
                value={formData.cpf}
                onChange={handleCPFChange}
                error={errors.cpf}
                errorId="cpf-error"
                placeholder="000.000.000-00"
                maxLength={14}
              />
              <FormInput
                id="dataNascimento"
                label="Data de nascimento *"
                type="date"
                value={formData.dataNascimento}
                onChange={v => updateField('dataNascimento', v)}
                error={errors.dataNascimento}
                errorId="data-error"
              />
              <div>
                <label htmlFor="sexo" className="block text-sm text-gray-600 mb-1">Sexo *</label>
                <select
                  id="sexo"
                  value={formData.sexo}
                  onChange={e => updateField('sexo', e.target.value)}
                  className="input-field"
                >
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                  <option value="O">Outro</option>
                </select>
              </div>
              <FormInput
                id="telefone"
                label="Telefone *"
                type="tel"
                value={formData.telefone}
                onChange={handlePhoneChange}
                error={errors.telefone}
                errorId="telefone-error"
                placeholder="(00) 00000-0000"
                maxLength={15}
              />
              <div className="md:col-span-2">
                <FormInput
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
                <FormInput
                  id="logradouro"
                  label="Logradouro"
                  value={formData.logradouro}
                  onChange={v => updateField('logradouro', v)}
                />
              </div>
              <FormInput
                id="numero"
                label="Número"
                value={formData.numero}
                onChange={v => updateField('numero', v)}
              />
              <FormInput
                id="complemento"
                label="Complemento"
                value={formData.complemento}
                onChange={v => updateField('complemento', v)}
              />
              <FormInput
                id="bairro"
                label="Bairro"
                value={formData.bairro}
                onChange={v => updateField('bairro', v)}
              />
              <FormInput
                id="cidade"
                label="Cidade"
                value={formData.cidade}
                onChange={v => updateField('cidade', v)}
              />
              <FormInput
                id="estado"
                label="Estado"
                value={formData.estado}
                onChange={v => updateField('estado', v)}
                maxLength={2}
              />
              <FormInput
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
              <FormInput
                id="convenioNome"
                label="Nome do convênio"
                value={formData.convenioNome}
                onChange={v => updateField('convenioNome', v)}
              />
              <FormInput
                id="convenioNumero"
                label="Número da carteira"
                value={formData.convenioNumero}
                onChange={v => updateField('convenioNumero', v)}
              />
              <FormInput
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
              <FormInput
                id="alergias"
                label="Alergias (separadas por vírgula)"
                value={formData.alergias}
                onChange={v => updateField('alergias', v)}
                placeholder="Ex: Dipirona, Penicilina"
              />
              <FormInput
                id="medicamentos"
                label="Medicamentos em uso"
                value={formData.medicamentosEmUso}
                onChange={v => updateField('medicamentosEmUso', v)}
                placeholder="Ex: Losartana 50mg, Metformina 850mg"
              />
              <div className="md:col-span-2">
                <FormTextarea
                  id="historicoFamiliar"
                  label="Histórico familiar"
                  value={formData.historicoFamiliar}
                  onChange={v => updateField('historicoFamiliar', v)}
                  rows={2}
                />
              </div>
              <div className="md:col-span-2">
                <FormTextarea
                  id="observacoes"
                  label="Observações"
                  value={formData.observacoes}
                  onChange={v => updateField('observacoes', v)}
                  rows={2}
                />
              </div>
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

// Sub-components
interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

function FormSection({ title, children }: FormSectionProps) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-700 mb-3">{title}</h3>
      {children}
    </div>
  );
}

interface FormInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  error?: string;
  errorId?: string;
  placeholder?: string;
  maxLength?: number;
}

function FormInput({
  id,
  label,
  value,
  onChange,
  type = 'text',
  error,
  errorId,
  placeholder,
  maxLength
}: FormInputProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm text-gray-600 mb-1">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`input-field ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-invalid={!!error}
        aria-describedby={error && errorId ? errorId : undefined}
      />
      {error && errorId && (
        <p id={errorId} className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

interface FormTextareaProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}

function FormTextarea({ id, label, value, onChange, rows = 3 }: FormTextareaProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm text-gray-600 mb-1">{label}</label>
      <textarea
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input-field"
        rows={rows}
      />
    </div>
  );
}

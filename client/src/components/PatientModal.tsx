import { useState } from 'react';
import { X } from 'lucide-react';
import { isValidCPF, formatCPF, formatPhone, formatCEP } from '../utils/helpers';
import type { Patient } from '../types';

interface PatientModalProps {
  patient: Patient | null;
  onClose: () => void;
  onSave: (data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => void;
  isLoading?: boolean;
}

interface FormErrors {
  nome?: string;
  cpf?: string;
  dataNascimento?: string;
  telefone?: string;
}

interface PatientFormData {
  nome: string;
  cpf: string;
  dataNascimento: string;
  sexo: string;
  telefone: string;
  email: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  convenioNome: string;
  convenioNumero: string;
  convenioValidade: string;
  alergias: string;
  medicamentosEmUso: string;
  historicoFamiliar: string;
  observacoes: string;
}

export default function PatientModal({ patient, onClose, onSave, isLoading = false }: PatientModalProps) {
  const [formData, setFormData] = useState<PatientFormData>({
    nome: patient?.nome || '',
    cpf: patient?.cpf || '',
    dataNascimento: patient?.dataNascimento || '',
    sexo: patient?.sexo || 'M',
    telefone: patient?.telefone || '',
    email: patient?.email || '',
    logradouro: patient?.endereco?.logradouro || '',
    numero: patient?.endereco?.numero || '',
    complemento: patient?.endereco?.complemento || '',
    bairro: patient?.endereco?.bairro || '',
    cidade: patient?.endereco?.cidade || '',
    estado: patient?.endereco?.estado || '',
    cep: patient?.endereco?.cep || '',
    convenioNome: patient?.convenio?.nome || '',
    convenioNumero: patient?.convenio?.numero || '',
    convenioValidade: patient?.convenio?.validade || '',
    alergias: patient?.alergias?.join(', ') || '',
    medicamentosEmUso: patient?.medicamentosEmUso?.join(', ') || '',
    historicoFamiliar: patient?.historicoFamiliar || '',
    observacoes: patient?.observacoes || ''
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!isValidCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }

    if (!formData.dataNascimento) {
      newErrors.dataNascimento = 'Data de nascimento é obrigatória';
    }

    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCPFChange = (value: string) => {
    const formatted = formatCPF(value);
    setFormData({ ...formData, cpf: formatted });
    if (errors.cpf) {
      setErrors({ ...errors, cpf: undefined });
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    setFormData({ ...formData, telefone: formatted });
    if (errors.telefone) {
      setErrors({ ...errors, telefone: undefined });
    }
  };

  const handleCEPChange = (value: string) => {
    const formatted = formatCEP(value);
    setFormData({ ...formData, cep: formatted });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'> = {
      nome: formData.nome,
      cpf: formData.cpf,
      dataNascimento: formData.dataNascimento,
      sexo: formData.sexo as 'M' | 'F' | 'O',
      telefone: formData.telefone,
      email: formData.email || undefined,
      endereco: {
        logradouro: formData.logradouro,
        numero: formData.numero,
        complemento: formData.complemento || undefined,
        bairro: formData.bairro,
        cidade: formData.cidade,
        estado: formData.estado,
        cep: formData.cep
      },
      alergias: formData.alergias ? formData.alergias.split(',').map(a => a.trim()) : undefined,
      medicamentosEmUso: formData.medicamentosEmUso ? formData.medicamentosEmUso.split(',').map(m => m.trim()) : undefined,
      historicoFamiliar: formData.historicoFamiliar || undefined,
      observacoes: formData.observacoes || undefined
    };

    if (formData.convenioNome) {
      data.convenio = {
        nome: formData.convenioNome,
        numero: formData.convenioNumero,
        validade: formData.convenioValidade
      };
    }

    onSave(data);
  };

  const inputClassName = (error?: string) =>
    `input-field ${error ? 'border-red-500 focus:ring-red-500' : ''}`;

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
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Dados Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="nome" className="block text-sm text-gray-600 mb-1">
                  Nome completo *
                </label>
                <input
                  id="nome"
                  type="text"
                  value={formData.nome}
                  onChange={e => {
                    setFormData({ ...formData, nome: e.target.value });
                    if (errors.nome) setErrors({ ...errors, nome: undefined });
                  }}
                  className={inputClassName(errors.nome)}
                  aria-invalid={!!errors.nome}
                  aria-describedby={errors.nome ? 'nome-error' : undefined}
                />
                {errors.nome && (
                  <p id="nome-error" className="mt-1 text-sm text-red-600">{errors.nome}</p>
                )}
              </div>
              <div>
                <label htmlFor="cpf" className="block text-sm text-gray-600 mb-1">CPF *</label>
                <input
                  id="cpf"
                  type="text"
                  value={formData.cpf}
                  onChange={e => handleCPFChange(e.target.value)}
                  className={inputClassName(errors.cpf)}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  aria-invalid={!!errors.cpf}
                  aria-describedby={errors.cpf ? 'cpf-error' : undefined}
                />
                {errors.cpf && (
                  <p id="cpf-error" className="mt-1 text-sm text-red-600">{errors.cpf}</p>
                )}
              </div>
              <div>
                <label htmlFor="dataNascimento" className="block text-sm text-gray-600 mb-1">
                  Data de nascimento *
                </label>
                <input
                  id="dataNascimento"
                  type="date"
                  value={formData.dataNascimento}
                  onChange={e => {
                    setFormData({ ...formData, dataNascimento: e.target.value });
                    if (errors.dataNascimento) setErrors({ ...errors, dataNascimento: undefined });
                  }}
                  className={inputClassName(errors.dataNascimento)}
                  aria-invalid={!!errors.dataNascimento}
                  aria-describedby={errors.dataNascimento ? 'data-error' : undefined}
                />
                {errors.dataNascimento && (
                  <p id="data-error" className="mt-1 text-sm text-red-600">{errors.dataNascimento}</p>
                )}
              </div>
              <div>
                <label htmlFor="sexo" className="block text-sm text-gray-600 mb-1">Sexo *</label>
                <select
                  id="sexo"
                  value={formData.sexo}
                  onChange={e => setFormData({ ...formData, sexo: e.target.value as 'M' | 'F' | 'O' })}
                  className="input-field"
                >
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                  <option value="O">Outro</option>
                </select>
              </div>
              <div>
                <label htmlFor="telefone" className="block text-sm text-gray-600 mb-1">Telefone *</label>
                <input
                  id="telefone"
                  type="tel"
                  value={formData.telefone}
                  onChange={e => handlePhoneChange(e.target.value)}
                  className={inputClassName(errors.telefone)}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  aria-invalid={!!errors.telefone}
                  aria-describedby={errors.telefone ? 'telefone-error' : undefined}
                />
                {errors.telefone && (
                  <p id="telefone-error" className="mt-1 text-sm text-red-600">{errors.telefone}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label htmlFor="email" className="block text-sm text-gray-600 mb-1">Email</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="logradouro" className="block text-sm text-gray-600 mb-1">Logradouro</label>
                <input
                  id="logradouro"
                  type="text"
                  value={formData.logradouro}
                  onChange={e => setFormData({ ...formData, logradouro: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="numero" className="block text-sm text-gray-600 mb-1">Número</label>
                <input
                  id="numero"
                  type="text"
                  value={formData.numero}
                  onChange={e => setFormData({ ...formData, numero: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="complemento" className="block text-sm text-gray-600 mb-1">Complemento</label>
                <input
                  id="complemento"
                  type="text"
                  value={formData.complemento}
                  onChange={e => setFormData({ ...formData, complemento: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="bairro" className="block text-sm text-gray-600 mb-1">Bairro</label>
                <input
                  id="bairro"
                  type="text"
                  value={formData.bairro}
                  onChange={e => setFormData({ ...formData, bairro: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="cidade" className="block text-sm text-gray-600 mb-1">Cidade</label>
                <input
                  id="cidade"
                  type="text"
                  value={formData.cidade}
                  onChange={e => setFormData({ ...formData, cidade: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="estado" className="block text-sm text-gray-600 mb-1">Estado</label>
                <input
                  id="estado"
                  type="text"
                  value={formData.estado}
                  onChange={e => setFormData({ ...formData, estado: e.target.value })}
                  className="input-field"
                  maxLength={2}
                />
              </div>
              <div>
                <label htmlFor="cep" className="block text-sm text-gray-600 mb-1">CEP</label>
                <input
                  id="cep"
                  type="text"
                  value={formData.cep}
                  onChange={e => handleCEPChange(e.target.value)}
                  className="input-field"
                  placeholder="00000-000"
                  maxLength={9}
                />
              </div>
            </div>
          </div>

          {/* Convênio */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Convênio (opcional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="convenioNome" className="block text-sm text-gray-600 mb-1">Nome do convênio</label>
                <input
                  id="convenioNome"
                  type="text"
                  value={formData.convenioNome}
                  onChange={e => setFormData({ ...formData, convenioNome: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="convenioNumero" className="block text-sm text-gray-600 mb-1">Número da carteira</label>
                <input
                  id="convenioNumero"
                  type="text"
                  value={formData.convenioNumero}
                  onChange={e => setFormData({ ...formData, convenioNumero: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="convenioValidade" className="block text-sm text-gray-600 mb-1">Validade</label>
                <input
                  id="convenioValidade"
                  type="date"
                  value={formData.convenioValidade}
                  onChange={e => setFormData({ ...formData, convenioValidade: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Histórico Médico */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Histórico Médico</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="alergias" className="block text-sm text-gray-600 mb-1">
                  Alergias (separadas por vírgula)
                </label>
                <input
                  id="alergias"
                  type="text"
                  value={formData.alergias}
                  onChange={e => setFormData({ ...formData, alergias: e.target.value })}
                  className="input-field"
                  placeholder="Ex: Dipirona, Penicilina"
                />
              </div>
              <div>
                <label htmlFor="medicamentos" className="block text-sm text-gray-600 mb-1">
                  Medicamentos em uso
                </label>
                <input
                  id="medicamentos"
                  type="text"
                  value={formData.medicamentosEmUso}
                  onChange={e => setFormData({ ...formData, medicamentosEmUso: e.target.value })}
                  className="input-field"
                  placeholder="Ex: Losartana 50mg, Metformina 850mg"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="historicoFamiliar" className="block text-sm text-gray-600 mb-1">
                  Histórico familiar
                </label>
                <textarea
                  id="historicoFamiliar"
                  value={formData.historicoFamiliar}
                  onChange={e => setFormData({ ...formData, historicoFamiliar: e.target.value })}
                  className="input-field"
                  rows={2}
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="observacoes" className="block text-sm text-gray-600 mb-1">
                  Observações
                </label>
                <textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={e => setFormData({ ...formData, observacoes: e.target.value })}
                  className="input-field"
                  rows={2}
                />
              </div>
            </div>
          </div>

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

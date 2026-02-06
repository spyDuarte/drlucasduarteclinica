import { useState, useCallback } from 'react';
import { isValidCPF, formatCPF, formatPhone, formatCEP } from '../utils/helpers';
import type { Patient } from '../types';

export interface PatientFormData {
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
  consentTratamentoDados: boolean;
  consentCompartilhamento: boolean;
  consentComunicacao: boolean;
  consentRevogadoMotivo: string;
}

export interface FormErrors {
  nome?: string;
  cpf?: string;
  dataNascimento?: string;
  telefone?: string;
}

function createInitialFormData(patient: Patient | null): PatientFormData {
  return {
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
    observacoes: patient?.observacoes || '',
    consentTratamentoDados: patient?.consents?.find(c => c.type === 'tratamento_dados_saude')?.granted ?? false,
    consentCompartilhamento: patient?.consents?.find(c => c.type === 'compartilhamento_terceiros')?.granted ?? false,
    consentComunicacao: patient?.consents?.find(c => c.type === 'comunicacao')?.granted ?? false,
    consentRevogadoMotivo: patient?.consents?.find(c => c.revokedReason)?.revokedReason || ''
  };
}

export function usePatientForm(patient: Patient | null) {
  const [formData, setFormData] = useState<PatientFormData>(() =>
    createInitialFormData(patient)
  );
  const [errors, setErrors] = useState<FormErrors>({});

  const updateField = useCallback(<K extends keyof PatientFormData>(
    field: K,
    value: PatientFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field in errors) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const handleCPFChange = useCallback((value: string) => {
    const formatted = formatCPF(value);
    setFormData(prev => ({ ...prev, cpf: formatted }));
    if (errors.cpf) {
      setErrors(prev => ({ ...prev, cpf: undefined }));
    }
  }, [errors.cpf]);

  const handlePhoneChange = useCallback((value: string) => {
    const formatted = formatPhone(value);
    setFormData(prev => ({ ...prev, telefone: formatted }));
    if (errors.telefone) {
      setErrors(prev => ({ ...prev, telefone: undefined }));
    }
  }, [errors.telefone]);

  const handleCEPChange = useCallback((value: string) => {
    const formatted = formatCEP(value);
    setFormData(prev => ({ ...prev, cep: formatted }));
  }, []);

  const validateForm = useCallback((): boolean => {
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
  }, [formData]);

  const buildPatientData = useCallback((): Omit<Patient, 'id' | 'createdAt' | 'updatedAt'> => {
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
      alergias: formData.alergias ? formData.alergias.split(',').map(a => a.trim()).filter(Boolean) : undefined,
      medicamentosEmUso: formData.medicamentosEmUso ? formData.medicamentosEmUso.split(',').map(m => m.trim()).filter(Boolean) : undefined,
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

    const now = new Date().toISOString();
    const revokedReason = formData.consentRevogadoMotivo.trim() || undefined;

    data.consents = [
      {
        type: 'tratamento_dados_saude',
        granted: formData.consentTratamentoDados,
        grantedAt: formData.consentTratamentoDados ? now : undefined,
        revokedAt: formData.consentTratamentoDados ? undefined : now,
        revokedReason,
        legalBasis: 'LGPD Art. 7º, I e Art. 11, I'
      },
      {
        type: 'compartilhamento_terceiros',
        granted: formData.consentCompartilhamento,
        grantedAt: formData.consentCompartilhamento ? now : undefined,
        revokedAt: formData.consentCompartilhamento ? undefined : now,
        revokedReason,
        legalBasis: 'LGPD Art. 7º, I'
      },
      {
        type: 'comunicacao',
        granted: formData.consentComunicacao,
        grantedAt: formData.consentComunicacao ? now : undefined,
        revokedAt: formData.consentComunicacao ? undefined : now,
        revokedReason,
        legalBasis: 'LGPD Art. 7º, I'
      }
    ];

    return data;
  }, [formData]);

  const getInputClassName = useCallback((error?: string) =>
    `input-field ${error ? 'border-red-500 focus:ring-red-500' : ''}`,
  []);

  return {
    formData,
    errors,
    updateField,
    handleCPFChange,
    handlePhoneChange,
    handleCEPChange,
    validateForm,
    buildPatientData,
    getInputClassName
  };
}

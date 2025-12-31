import type { Patient, Appointment, MedicalRecord, Payment, User } from '../types';

/**
 * Configuração de usuários de demonstração
 * As credenciais podem ser sobrescritas por variáveis de ambiente
 * para maior segurança em ambientes de produção
 */
const getDemoUsers = (): (User & { password: string })[] => [
  {
    id: '1',
    nome: import.meta.env.VITE_DEMO_DOCTOR_NAME || 'Dr. Lucas Duarte',
    email: import.meta.env.VITE_DEMO_DOCTOR_EMAIL || 'medico@clinica.com',
    role: 'medico',
    crm: import.meta.env.VITE_DEMO_DOCTOR_CRM || 'CRM/SP 123456',
    password: import.meta.env.VITE_DEMO_DOCTOR_PASSWORD || '123456'
  },
  {
    id: '2',
    nome: import.meta.env.VITE_DEMO_SECRETARY_NAME || 'Maria Silva',
    email: import.meta.env.VITE_DEMO_SECRETARY_EMAIL || 'secretaria@clinica.com',
    role: 'secretaria',
    password: import.meta.env.VITE_DEMO_SECRETARY_PASSWORD || '123456'
  }
];

// Usuários de demonstração (lazy initialization)
export const DEMO_USERS: (User & { password: string })[] = getDemoUsers();

// Pacientes de demonstração
export const DEMO_PATIENTS: Patient[] = [
  {
    id: '1',
    nome: 'João Carlos Santos',
    cpf: '123.456.789-00',
    dataNascimento: '1985-03-15',
    sexo: 'M',
    telefone: '(11) 98765-4321',
    email: 'joao.santos@email.com',
    endereco: {
      logradouro: 'Rua das Flores',
      numero: '123',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567'
    },
    alergias: ['Dipirona'],
    medicamentosEmUso: ['Losartana 50mg'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    nome: 'Maria Fernanda Lima',
    cpf: '987.654.321-00',
    dataNascimento: '1990-07-22',
    sexo: 'F',
    telefone: '(11) 91234-5678',
    email: 'maria.lima@email.com',
    endereco: {
      logradouro: 'Av. Paulista',
      numero: '1000',
      complemento: 'Apto 45',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01310-100'
    },
    convenio: {
      nome: 'Unimed',
      numero: '123456789',
      validade: '2025-12-31'
    },
    createdAt: '2024-02-10T14:30:00Z',
    updatedAt: '2024-02-10T14:30:00Z'
  },
  {
    id: '3',
    nome: 'Pedro Henrique Oliveira',
    cpf: '456.789.123-00',
    dataNascimento: '1978-11-08',
    sexo: 'M',
    telefone: '(11) 99876-5432',
    endereco: {
      logradouro: 'Rua Augusta',
      numero: '500',
      bairro: 'Consolação',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01305-000'
    },
    alergias: ['Penicilina', 'Ibuprofeno'],
    medicamentosEmUso: ['Metformina 850mg', 'Atenolol 25mg'],
    historicoFamiliar: 'Pai diabético, mãe hipertensa',
    createdAt: '2024-03-05T09:15:00Z',
    updatedAt: '2024-03-05T09:15:00Z'
  }
];

// Função para gerar consultas com data atual
export function generateDemoAppointments(): Appointment[] {
  const today = new Date().toISOString().split('T')[0];

  return [
    {
      id: '1',
      patientId: '1',
      data: today,
      horaInicio: '09:00',
      horaFim: '09:30',
      tipo: 'retorno',
      status: 'confirmada',
      motivo: 'Acompanhamento de hipertensão',
      valor: 250,
      createdAt: '2024-12-10T10:00:00Z',
      updatedAt: '2024-12-10T10:00:00Z'
    },
    {
      id: '2',
      patientId: '2',
      data: today,
      horaInicio: '10:00',
      horaFim: '10:30',
      tipo: 'primeira_consulta',
      status: 'agendada',
      motivo: 'Check-up geral',
      convenio: true,
      createdAt: '2024-12-11T14:00:00Z',
      updatedAt: '2024-12-11T14:00:00Z'
    },
    {
      id: '3',
      patientId: '3',
      data: today,
      horaInicio: '11:00',
      horaFim: '11:30',
      tipo: 'retorno',
      status: 'aguardando',
      motivo: 'Revisão de exames',
      valor: 200,
      createdAt: '2024-12-12T16:00:00Z',
      updatedAt: '2024-12-12T16:00:00Z'
    }
  ];
}

// Prontuários de demonstração
export const DEMO_MEDICAL_RECORDS: MedicalRecord[] = [
  {
    id: '1',
    patientId: '1',
    appointmentId: '1',
    data: '2024-11-15',
    subjetivo: {
      queixaPrincipal: 'Cefaleia frequente há 2 semanas',
      historicoDoencaAtual: 'Paciente refere dor de cabeça frontal, pulsátil, de intensidade moderada, que piora no final do dia. Nega náuseas ou vômitos. Associa com estresse no trabalho.',
      revisaoSistemas: 'Nega alterações visuais, febre, rigidez de nuca.'
    },
    objetivo: {
      sinaisVitais: {
        pressaoArterial: '140/90',
        frequenciaCardiaca: 78,
        temperatura: 36.5,
        peso: 82,
        altura: 175,
        imc: 26.8
      },
      exameFisico: 'BEG, corado, hidratado. ACV: RCR 2T BNF. AR: MVU sem RA. Abdome: flácido, indolor. Neurológico: sem déficits focais.'
    },
    avaliacao: {
      hipotesesDiagnosticas: ['Cefaleia tensional', 'Hipertensão arterial sistêmica'],
      cid10: ['G44.2', 'I10']
    },
    plano: {
      conduta: 'Orientado sobre manejo do estresse. Ajuste de medicação anti-hipertensiva.',
      prescricoes: [
        {
          id: '1',
          medicamento: 'Losartana',
          concentracao: '50mg',
          formaFarmaceutica: 'Comprimido',
          posologia: '1 comprimido pela manhã',
          quantidade: '30 comprimidos',
          duracao: '30 dias'
        }
      ],
      solicitacaoExames: ['Hemograma completo', 'Glicemia de jejum', 'Perfil lipídico'],
      retorno: '30 dias',
      orientacoes: 'Dieta hipossódica, atividade física regular, controle de PA domiciliar.'
    },
    createdAt: '2024-11-15T10:30:00Z',
    updatedAt: '2024-11-15T10:30:00Z'
  }
];

// Função para gerar pagamentos com data atual
export function generateDemoPayments(): Payment[] {
  const today = new Date().toISOString().split('T')[0];

  return [
    {
      id: '1',
      patientId: '1',
      appointmentId: '1',
      valor: 250,
      descricao: 'Consulta de retorno',
      formaPagamento: 'pix',
      status: 'pago',
      dataPagamento: '2024-11-15',
      numeroRecibo: 'REC-2024-001',
      createdAt: '2024-11-15T11:00:00Z',
      updatedAt: '2024-11-15T11:00:00Z'
    },
    {
      id: '2',
      patientId: '3',
      valor: 200,
      descricao: 'Consulta',
      formaPagamento: 'cartao_credito',
      status: 'pendente',
      dataVencimento: today,
      createdAt: '2024-12-12T16:30:00Z',
      updatedAt: '2024-12-12T16:30:00Z'
    }
  ];
}

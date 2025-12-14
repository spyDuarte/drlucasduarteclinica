// Tipos baseados em padrões de sistemas EHR (Electronic Health Records)
// Referência: HL7 FHIR (Fast Healthcare Interoperability Resources)

export type UserRole = 'medico' | 'secretaria';

export interface User {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  crm?: string; // Apenas para médicos
}

export interface Patient {
  id: string;
  nome: string;
  cpf: string;
  dataNascimento: string;
  sexo: 'M' | 'F' | 'O';
  telefone: string;
  email?: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  convenio?: {
    nome: string;
    numero: string;
    validade: string;
  };
  alergias?: string[];
  medicamentosEmUso?: string[];
  historicoFamiliar?: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentStatus =
  | 'agendada'      // Agendada
  | 'confirmada'    // Confirmada pelo paciente
  | 'aguardando'    // Paciente na sala de espera
  | 'em_atendimento'// Em atendimento
  | 'finalizada'    // Consulta finalizada
  | 'cancelada'     // Cancelada
  | 'faltou';       // Paciente não compareceu

export type AppointmentType =
  | 'primeira_consulta'
  | 'retorno'
  | 'urgencia'
  | 'exame'
  | 'procedimento';

export interface Appointment {
  id: string;
  patientId: string;
  patient?: Patient;
  data: string;
  horaInicio: string;
  horaFim: string;
  tipo: AppointmentType;
  status: AppointmentStatus;
  motivo?: string;
  observacoes?: string;
  valor?: number;
  convenio?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Prontuário Eletrônico baseado em SOAP (Subjetivo, Objetivo, Avaliação, Plano)
// Metodologia amplamente aceita na literatura médica
export interface MedicalRecord {
  id: string;
  patientId: string;
  appointmentId?: string;
  data: string;
  // SOAP Notes - Método padronizado de documentação clínica
  subjetivo: {
    queixaPrincipal: string;
    historicoDoencaAtual: string;
    revisaoSistemas?: string;
  };
  objetivo: {
    sinaisVitais: {
      pressaoArterial?: string;
      frequenciaCardiaca?: number;
      frequenciaRespiratoria?: number;
      temperatura?: number;
      saturacaoO2?: number;
      peso?: number;
      altura?: number;
      imc?: number;
    };
    exameFisico: string;
    examesComplementares?: string;
  };
  avaliacao: {
    hipotesesDiagnosticas: string[];
    cid10?: string[]; // Classificação Internacional de Doenças
  };
  plano: {
    conduta: string;
    prescricoes?: Prescription[];
    solicitacaoExames?: string[];
    encaminhamentos?: string[];
    retorno?: string;
    orientacoes?: string;
  };
  assinaturaDigital?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: string;
  medicamento: string;
  concentracao?: string;
  formaFarmaceutica: string;
  posologia: string;
  quantidade: string;
  duracao?: string;
  observacoes?: string;
}

export interface Atestado {
  id: string;
  patientId: string;
  medicalRecordId?: string;
  tipo: 'atestado_medico' | 'declaracao_comparecimento';
  dataEmissao: string;
  diasAfastamento?: number;
  cid10?: string;
  descricao: string;
  createdAt: string;
}

// Módulo Financeiro
export type PaymentStatus = 'pendente' | 'pago' | 'cancelado' | 'reembolsado';
export type PaymentMethod = 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'convenio' | 'transferencia';

export interface Payment {
  id: string;
  patientId: string;
  appointmentId?: string;
  valor: number;
  descricao: string;
  formaPagamento: PaymentMethod;
  status: PaymentStatus;
  dataPagamento?: string;
  dataVencimento?: string;
  numeroRecibo?: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

// Dashboard e Estatísticas
export interface DashboardStats {
  consultasHoje: number;
  consultasSemana: number;
  consultasMes: number;
  pacientesTotal: number;
  pacientesNovos: number;
  receitaMes: number;
  receitaPendente: number;
  taxaComparecimento: number;
}

export interface ChartData {
  label: string;
  value: number;
}

// Constantes de configuração da clínica

export const CLINIC_CONFIG = {
  OPENING_HOUR: '08:00',
  CLOSING_HOUR: '18:00',
  SLOT_DURATION_MINUTES: 30,
} as const;

export const STORAGE_KEYS = {
  USER: 'clinica_user',
  PATIENTS: 'clinica_patients',
  APPOINTMENTS: 'clinica_appointments',
  RECORDS: 'clinica_records',
  PAYMENTS: 'clinica_payments',
  DOCUMENTS: 'clinica_documents',
} as const;

export const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
] as const;

export const APPOINTMENT_TYPES = {
  primeira_consulta: 'Primeira consulta',
  retorno: 'Retorno',
  urgencia: 'Urgência',
  exame: 'Exame',
  procedimento: 'Procedimento',
} as const;

export const APPOINTMENT_STATUS = {
  agendada: 'Agendada',
  confirmada: 'Confirmada',
  aguardando: 'Aguardando',
  em_atendimento: 'Em atendimento',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
  faltou: 'Não compareceu',
} as const;

export const PAYMENT_METHODS = {
  dinheiro: 'Dinheiro',
  cartao_credito: 'Cartão de crédito',
  cartao_debito: 'Cartão de débito',
  pix: 'PIX',
  convenio: 'Convênio',
  transferencia: 'Transferência',
} as const;

export const PAYMENT_STATUS = {
  pendente: 'Pendente',
  pago: 'Pago',
  cancelado: 'Cancelado',
  reembolsado: 'Reembolsado',
} as const;

// Informações da Clínica para documentos
export const CLINIC_INFO = {
  nome: 'Clínica Dr. Lucas Duarte',
  endereco: 'Av. Principal, 1000 - Centro',
  cidade: 'São Paulo - SP',
  cep: '01310-100',
  telefone: '(11) 3000-0000',
  email: 'contato@drlucasduarte.com.br',
  cnpj: '00.000.000/0001-00',
} as const;

export const DOCUMENT_TYPES = {
  atestado_medico: 'Atestado Médico',
  declaracao_comparecimento: 'Declaração de Comparecimento',
  laudo_medico: 'Laudo Médico',
  receita: 'Receita Médica',
  solicitacao_exames: 'Solicitação de Exames',
  encaminhamento: 'Encaminhamento',
  termo_consentimento: 'Termo de Consentimento',
  relatorio_medico: 'Relatório Médico',
  declaracao_acompanhante: 'Declaração para Acompanhante',
  orientacoes_medicas: 'Orientações Médicas',
  atestado_aptidao: 'Atestado de Aptidão',
  guia_internacao: 'Guia de Internação',
} as const;

export const DOCUMENT_STATUS = {
  rascunho: 'Rascunho',
  emitido: 'Emitido',
  cancelado: 'Cancelado',
} as const;

// Tipos de aptidão
export const TIPOS_APTIDAO = {
  esporte_recreativo: 'Esporte Recreativo',
  esporte_competitivo: 'Esporte Competitivo',
  atividade_fisica: 'Atividade Física',
  trabalho: 'Trabalho',
  viagem: 'Viagem',
  mergulho: 'Mergulho',
  paraquedismo: 'Paraquedismo',
  outro: 'Outro',
} as const;

// Tipos de procedimento
export const TIPOS_PROCEDIMENTO = {
  cirurgico: 'Cirúrgico',
  diagnostico: 'Diagnóstico',
  terapeutico: 'Terapêutico',
  estetico: 'Estético',
  anestesico: 'Anestésico',
  outro: 'Outro',
} as const;

// Pareceres de aptidão
export const PARECERES_APTIDAO = {
  apto: 'Apto',
  apto_com_restricoes: 'Apto com Restrições',
  inapto_temporario: 'Inapto Temporariamente',
  inapto: 'Inapto',
} as const;

// Tipos de orientação médica
export const TIPOS_ORIENTACAO = {
  pre_operatorio: 'Pré-Operatório',
  pos_operatorio: 'Pós-Operatório',
  tratamento: 'Tratamento',
  dieta: 'Dieta',
  medicacao: 'Medicação',
  geral: 'Geral',
} as const;

// Tipos de leito
export const TIPOS_LEITO = {
  enfermaria: 'Enfermaria',
  apartamento: 'Apartamento',
  uti: 'UTI',
  semi_intensiva: 'Semi-Intensiva',
} as const;

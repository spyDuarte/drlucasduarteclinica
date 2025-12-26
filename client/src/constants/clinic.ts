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

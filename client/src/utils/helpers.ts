import { format, parseISO, differenceInYears, isToday, isTomorrow, isYesterday, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, isBefore, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ==========================================
// SEGURANÇA
// ==========================================

/**
 * Escapes HTML special characters to prevent XSS
 */
export function escapeHtml(unsafe: unknown): string {
  if (unsafe === null || unsafe === undefined) return '';
  const str = String(unsafe);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ==========================================
// GERAÇÃO DE IDs
// ==========================================

/**
 * Gera um ID único usando timestamp e valores aleatórios
 * Mais robusto que o anterior, com menor chance de colisão
 */
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart1 = Math.random().toString(36).substring(2, 8);
  const randomPart2 = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomPart1}-${randomPart2}`;
}

/**
 * Gera um UUID v4 compatível
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ==========================================
// FORMATAÇÃO DE DATA E HORA
// ==========================================

/**
 * Formata data para exibição
 */
export function formatDate(date: string | Date, formatStr: string = 'dd/MM/yyyy'): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, formatStr, { locale: ptBR });
  } catch {
    return 'Data inválida';
  }
}

/**
 * Formata data com texto relativo (Hoje, Amanhã, Ontem)
 */
export function formatRelativeDate(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (isToday(d)) return 'Hoje';
    if (isTomorrow(d)) return 'Amanhã';
    if (isYesterday(d)) return 'Ontem';
    return format(d, "EEEE, dd 'de' MMMM", { locale: ptBR });
  } catch {
    return 'Data inválida';
  }
}

/**
 * Formata data e hora para exibição
 */
export function formatDateTime(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return 'Data inválida';
  }
}

/**
 * Formata apenas a hora
 */
export function formatTime(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'HH:mm', { locale: ptBR });
  } catch {
    return '--:--';
  }
}

/**
 * Calcula a idade a partir da data de nascimento
 */
export function calculateAge(birthDate: string): number {
  try {
    return differenceInYears(new Date(), parseISO(birthDate));
  } catch {
    return 0;
  }
}

/**
 * Retorna a faixa etária baseada na idade
 */
export function getAgeGroup(birthDate: string): string {
  const age = calculateAge(birthDate);
  if (age < 2) return 'Lactente';
  if (age < 12) return 'Criança';
  if (age < 18) return 'Adolescente';
  if (age < 60) return 'Adulto';
  return 'Idoso';
}

/**
 * Verifica se uma data está dentro de um intervalo
 */
export function isDateInRange(date: string | Date, startDate: string | Date, endDate: string | Date): boolean {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
    return isWithinInterval(d, { start, end });
  } catch {
    return false;
  }
}

/**
 * Retorna as datas de início e fim da semana
 */
export function getWeekRange(date: Date = new Date()): { start: Date; end: Date } {
  return {
    start: startOfWeek(date, { weekStartsOn: 0 }),
    end: endOfWeek(date, { weekStartsOn: 0 })
  };
}

/**
 * Retorna as datas de início e fim do mês
 */
export function getMonthRange(date: Date = new Date()): { start: Date; end: Date } {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date)
  };
}

/**
 * Adiciona dias a uma data
 */
export function addDaysToDate(date: string | Date, days: number): Date {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return addDays(d, days);
}

/**
 * Verifica se a primeira data é antes da segunda
 */
export function isDateBefore(date1: string | Date, date2: string | Date): boolean {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return isBefore(d1, d2);
}

/**
 * Verifica se a primeira data é depois da segunda
 */
export function isDateAfter(date1: string | Date, date2: string | Date): boolean {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return isAfter(d1, d2);
}

// ==========================================
// FORMATAÇÃO DE VALORES
// ==========================================

/**
 * Formata valor monetário em Reais
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

/**
 * Formata número com separadores de milhar
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Formata porcentagem
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formata CPF: XXX.XXX.XXX-XX
 */
export function formatCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return cpf;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata telefone brasileiro
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
}

/**
 * Formata CEP: XXXXX-XXX
 */
export function formatCEP(cep: string): string {
  const digits = cep.replace(/\D/g, '');
  if (digits.length !== 8) return cep;
  return digits.replace(/(\d{5})(\d{3})/, '$1-$2');
}

/**
 * Formata CRM: XXXXX/UF
 */
export function formatCRM(crm: string): string {
  const cleaned = crm.replace(/[^a-zA-Z0-9]/g, '');
  const number = cleaned.replace(/\D/g, '');
  const state = cleaned.replace(/\d/g, '').toUpperCase();
  if (number && state) {
    return `${number}/${state}`;
  }
  return crm;
}

/**
 * Formata RG (padrão genérico)
 */
export function formatRG(rg: string): string {
  const digits = rg.replace(/\D/g, '');
  if (digits.length >= 8) {
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d*)/, '$1.$2.$3-$4');
  }
  return rg;
}

// ==========================================
// VALIDAÇÕES
// ==========================================

/**
 * Valida CPF usando algoritmo de verificação de dígitos
 */
export function isValidCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1+$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(digits.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(digits.charAt(10));
}

/**
 * Valida email com regex mais robusto
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
}

/**
 * Valida telefone brasileiro (10 ou 11 dígitos)
 */
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 || digits.length === 11;
}

/**
 * Valida CEP brasileiro (8 dígitos)
 */
export function isValidCEP(cep: string): boolean {
  const digits = cep.replace(/\D/g, '');
  return digits.length === 8;
}

/**
 * Valida data de nascimento (não pode ser no futuro ou mais de 150 anos atrás)
 */
export function isValidBirthDate(birthDate: string): boolean {
  try {
    const date = parseISO(birthDate);
    const now = new Date();
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 150);

    return !isAfter(date, now) && !isBefore(date, minDate);
  } catch {
    return false;
  }
}

/**
 * Valida hora no formato HH:mm
 */
export function isValidTime(time: string): boolean {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

/**
 * Verifica se o valor é um número válido e positivo
 */
export function isPositiveNumber(value: unknown): boolean {
  const num = Number(value);
  return !isNaN(num) && num > 0;
}

// ==========================================
// CÁLCULOS MÉDICOS
// ==========================================

/**
 * Calcula o Índice de Massa Corporal (IMC) e sua classificação
 */
export function calculateIMC(weight: number, height: number): {
  value: number;
  classification: string;
  color: string;
} {
  if (weight <= 0 || height <= 0) {
    return { value: 0, classification: 'Dados inválidos', color: 'gray' };
  }

  const heightInMeters = height / 100;
  const imc = weight / (heightInMeters * heightInMeters);

  let classification = '';
  let color = '';

  if (imc < 18.5) {
    classification = 'Abaixo do peso';
    color = 'yellow';
  } else if (imc < 25) {
    classification = 'Peso normal';
    color = 'green';
  } else if (imc < 30) {
    classification = 'Sobrepeso';
    color = 'yellow';
  } else if (imc < 35) {
    classification = 'Obesidade grau I';
    color = 'orange';
  } else if (imc < 40) {
    classification = 'Obesidade grau II';
    color = 'red';
  } else {
    classification = 'Obesidade grau III';
    color = 'red';
  }

  return { value: parseFloat(imc.toFixed(1)), classification, color };
}

/**
 * Classifica a pressão arterial segundo as diretrizes brasileiras
 * @param sistolica - Pressão sistólica em mmHg
 * @param diastolica - Pressão diastólica em mmHg
 */
export function classifyBloodPressure(sistolica: number, diastolica: number): {
  classification: string;
  severity: 'normal' | 'attention' | 'warning' | 'danger';
} {
  if (sistolica < 120 && diastolica < 80) {
    return { classification: 'Ótima', severity: 'normal' };
  }
  if (sistolica < 130 && diastolica < 85) {
    return { classification: 'Normal', severity: 'normal' };
  }
  if (sistolica < 140 && diastolica < 90) {
    return { classification: 'Limítrofe', severity: 'attention' };
  }
  if (sistolica < 160 && diastolica < 100) {
    return { classification: 'Hipertensão estágio 1', severity: 'warning' };
  }
  if (sistolica < 180 && diastolica < 110) {
    return { classification: 'Hipertensão estágio 2', severity: 'warning' };
  }
  return { classification: 'Hipertensão estágio 3', severity: 'danger' };
}

/**
 * Calcula a frequência cardíaca máxima teórica
 */
export function calculateMaxHeartRate(age: number): number {
  return Math.round(220 - age);
}

/**
 * Calcula as zonas de frequência cardíaca para treino
 */
export function calculateHeartRateZones(age: number): {
  zone1: { min: number; max: number; description: string };
  zone2: { min: number; max: number; description: string };
  zone3: { min: number; max: number; description: string };
  zone4: { min: number; max: number; description: string };
  zone5: { min: number; max: number; description: string };
} {
  const maxHR = calculateMaxHeartRate(age);
  return {
    zone1: { min: Math.round(maxHR * 0.5), max: Math.round(maxHR * 0.6), description: 'Recuperação' },
    zone2: { min: Math.round(maxHR * 0.6), max: Math.round(maxHR * 0.7), description: 'Queima de gordura' },
    zone3: { min: Math.round(maxHR * 0.7), max: Math.round(maxHR * 0.8), description: 'Aeróbico' },
    zone4: { min: Math.round(maxHR * 0.8), max: Math.round(maxHR * 0.9), description: 'Anaeróbico' },
    zone5: { min: Math.round(maxHR * 0.9), max: maxHR, description: 'Máximo' }
  };
}

/**
 * Calcula o peso ideal usando a fórmula de Lorentz
 */
export function calculateIdealWeight(heightCm: number, sex: 'M' | 'F' | 'O'): number {
  const heightM = heightCm - 100;
  const factor = sex === 'M' ? 4 : 2;
  const divisor = sex === 'M' ? 4 : 2;
  return parseFloat((heightM - ((heightCm - 150) / factor) / divisor).toFixed(1));
}

/**
 * Calcula a Taxa Metabólica Basal (TMB) usando Harris-Benedict
 */
export function calculateBMR(weight: number, heightCm: number, age: number, sex: 'M' | 'F' | 'O'): number {
  if (sex === 'M') {
    return Math.round(88.362 + (13.397 * weight) + (4.799 * heightCm) - (5.677 * age));
  }
  return Math.round(447.593 + (9.247 * weight) + (3.098 * heightCm) - (4.330 * age));
}

/**
 * Verifica se os sinais vitais estão em faixas normais
 */
export function checkVitalSigns(vitals: {
  frequenciaCardiaca?: number;
  frequenciaRespiratoria?: number;
  temperatura?: number;
  saturacaoO2?: number;
}): {
  isNormal: boolean;
  alerts: string[]
} {
  const alerts: string[] = [];

  if (vitals.frequenciaCardiaca) {
    if (vitals.frequenciaCardiaca < 60) alerts.push('Bradicardia (FC < 60 bpm)');
    if (vitals.frequenciaCardiaca > 100) alerts.push('Taquicardia (FC > 100 bpm)');
  }

  if (vitals.frequenciaRespiratoria) {
    if (vitals.frequenciaRespiratoria < 12) alerts.push('Bradipneia (FR < 12 irpm)');
    if (vitals.frequenciaRespiratoria > 20) alerts.push('Taquipneia (FR > 20 irpm)');
  }

  if (vitals.temperatura) {
    if (vitals.temperatura < 35) alerts.push('Hipotermia (T < 35°C)');
    if (vitals.temperatura >= 37.8) alerts.push('Febre (T ≥ 37.8°C)');
    if (vitals.temperatura >= 39) alerts.push('Febre alta (T ≥ 39°C)');
  }

  if (vitals.saturacaoO2) {
    if (vitals.saturacaoO2 < 95) alerts.push('Hipoxemia (SpO2 < 95%)');
    if (vitals.saturacaoO2 < 90) alerts.push('Hipoxemia grave (SpO2 < 90%)');
  }

  return { isNormal: alerts.length === 0, alerts };
}

// ==========================================
// TRADUÇÕES E MAPEAMENTOS
// ==========================================

/**
 * Traduz status de consulta para português
 */
export function translateAppointmentStatus(status: string): string {
  const translations: Record<string, string> = {
    agendada: 'Agendada',
    confirmada: 'Confirmada',
    aguardando: 'Aguardando',
    em_atendimento: 'Em atendimento',
    finalizada: 'Finalizada',
    cancelada: 'Cancelada',
    faltou: 'Não compareceu'
  };
  return translations[status] || status;
}

/**
 * Traduz tipo de consulta para português
 */
export function translateAppointmentType(type: string): string {
  const translations: Record<string, string> = {
    primeira_consulta: 'Primeira consulta',
    retorno: 'Retorno',
    urgencia: 'Urgência',
    exame: 'Exame',
    procedimento: 'Procedimento'
  };
  return translations[type] || type;
}

/**
 * Traduz forma de pagamento para português
 */
export function translatePaymentMethod(method: string): string {
  const translations: Record<string, string> = {
    dinheiro: 'Dinheiro',
    cartao_credito: 'Cartão de crédito',
    cartao_debito: 'Cartão de débito',
    pix: 'PIX',
    convenio: 'Convênio',
    transferencia: 'Transferência'
  };
  return translations[method] || method;
}

/**
 * Traduz status de pagamento para português
 */
export function translatePaymentStatus(status: string): string {
  const translations: Record<string, string> = {
    pendente: 'Pendente',
    pago: 'Pago',
    cancelado: 'Cancelado',
    reembolsado: 'Reembolsado'
  };
  return translations[status] || status;
}

/**
 * Traduz sexo para texto legível
 */
export function translateSex(sex: string): string {
  const translations: Record<string, string> = {
    M: 'Masculino',
    F: 'Feminino',
    O: 'Outro'
  };
  return translations[sex] || sex;
}

/**
 * Retorna a sigla do estado brasileiro pelo nome
 */
export function getStateAbbreviation(stateName: string): string {
  const states: Record<string, string> = {
    'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM',
    'Bahia': 'BA', 'Ceará': 'CE', 'Distrito Federal': 'DF',
    'Espírito Santo': 'ES', 'Goiás': 'GO', 'Maranhão': 'MA',
    'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS', 'Minas Gerais': 'MG',
    'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR', 'Pernambuco': 'PE',
    'Piauí': 'PI', 'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN',
    'Rio Grande do Sul': 'RS', 'Rondônia': 'RO', 'Roraima': 'RR',
    'Santa Catarina': 'SC', 'São Paulo': 'SP', 'Sergipe': 'SE', 'Tocantins': 'TO'
  };
  return states[stateName] || stateName;
}

// ==========================================
// AGENDA E HORÁRIOS
// ==========================================

/**
 * Gera array de horários disponíveis
 */
export function generateTimeSlots(start: string, end: string, interval: number): string[] {
  const slots: string[] = [];
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);

  let currentMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  while (currentMinutes < endMinutes) {
    const hour = Math.floor(currentMinutes / 60);
    const min = currentMinutes % 60;
    slots.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
    currentMinutes += interval;
  }

  return slots;
}

/**
 * Verifica se dois intervalos de tempo se sobrepõem
 */
export function doTimesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const toMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const s1 = toMinutes(start1);
  const e1 = toMinutes(end1);
  const s2 = toMinutes(start2);
  const e2 = toMinutes(end2);

  return s1 < e2 && s2 < e1;
}

/**
 * Calcula a duração entre dois horários em minutos
 */
export function calculateDuration(startTime: string, endTime: string): number {
  const toMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  return toMinutes(endTime) - toMinutes(startTime);
}

/**
 * Adiciona minutos a um horário
 */
export function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const totalMinutes = h * 60 + m + minutes;
  const newHour = Math.floor(totalMinutes / 60) % 24;
  const newMin = totalMinutes % 60;
  return `${newHour.toString().padStart(2, '0')}:${newMin.toString().padStart(2, '0')}`;
}

// ==========================================
// CORES E ESTILOS
// ==========================================

/**
 * Retorna classes CSS para status
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    agendada: 'status-scheduled',
    confirmada: 'status-confirmed',
    aguardando: 'status-waiting',
    em_atendimento: 'bg-purple-100 text-purple-800',
    finalizada: 'status-completed',
    cancelada: 'status-cancelled',
    faltou: 'bg-orange-100 text-orange-800',
    pendente: 'status-waiting',
    pago: 'status-confirmed',
    cancelado: 'status-cancelled',
    reembolsado: 'bg-purple-100 text-purple-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Retorna cor do badge para diferentes severidades
 */
export function getSeverityColor(severity: 'success' | 'warning' | 'danger' | 'info' | 'neutral'): string {
  const colors: Record<string, string> = {
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    neutral: 'bg-gray-100 text-gray-800 border-gray-200'
  };
  return colors[severity] || colors.neutral;
}

// ==========================================
// UTILITÁRIOS DE TEXTO
// ==========================================

/**
 * Capitaliza a primeira letra de cada palavra
 */
export function capitalizeWords(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Trunca texto com reticências
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Remove acentos de uma string
 */
export function removeAccents(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Gera iniciais de um nome (máximo 2 letras)
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Sanitiza string para busca (remove acentos e converte para minúsculas)
 */
export function normalizeForSearch(text: string): string {
  return removeAccents(text.toLowerCase().trim());
}

/**
 * Verifica se uma string contém outra (ignorando acentos e case)
 */
export function containsText(text: string, search: string): boolean {
  return normalizeForSearch(text).includes(normalizeForSearch(search));
}

// ==========================================
// UTILITÁRIOS DE ARRAY E OBJETOS
// ==========================================

/**
 * Agrupa array por uma propriedade
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Ordena array por uma propriedade
 */
export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return order === 'asc' ? comparison : -comparison;
  });
}

/**
 * Remove duplicatas de um array baseado em uma propriedade
 */
export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

/**
 * Faz deep clone de um objeto
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Verifica se um objeto está vazio
 */
export function isEmpty(obj: object): boolean {
  return Object.keys(obj).length === 0;
}

// ==========================================
// EXPORTAÇÃO DE DADOS
// ==========================================

/**
 * Converte array de objetos para CSV
 */
export function arrayToCSV<T extends Record<string, unknown>>(data: T[], headers?: string[]): string {
  if (data.length === 0) return '';

  const keys = headers || Object.keys(data[0]);
  const csvRows: string[] = [];

  // Header
  csvRows.push(keys.join(';'));

  // Data rows
  for (const row of data) {
    const values = keys.map(key => {
      const value = row[key];
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      // Escape quotes and wrap in quotes if contains separator
      if (stringValue.includes(';') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csvRows.push(values.join(';'));
  }

  return csvRows.join('\n');
}

/**
 * Faz download de um arquivo
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exporta dados como CSV e faz download
 */
export function exportToCSV<T extends Record<string, unknown>>(data: T[], filename: string, headers?: string[]): void {
  const csv = arrayToCSV(data, headers);
  downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8');
}

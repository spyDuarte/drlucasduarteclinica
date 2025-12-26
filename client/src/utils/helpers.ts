import { format, parseISO, differenceInYears, isToday, isTomorrow, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Gerar ID único
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Formatar data
export function formatDate(date: string | Date, formatStr: string = 'dd/MM/yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr, { locale: ptBR });
}

// Formatar data com texto relativo
export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (isToday(d)) return 'Hoje';
  if (isTomorrow(d)) return 'Amanhã';
  if (isYesterday(d)) return 'Ontem';
  return format(d, "EEEE, dd 'de' MMMM", { locale: ptBR });
}

// Calcular idade
export function calculateAge(birthDate: string): number {
  return differenceInYears(new Date(), parseISO(birthDate));
}

// Formatar moeda
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// Formatar CPF
export function formatCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, '');
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Formatar telefone
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
}

// Formatar CEP
export function formatCEP(cep: string): string {
  const digits = cep.replace(/\D/g, '');
  return digits.replace(/(\d{5})(\d{3})/, '$1-$2');
}

// Validar CPF
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

// Calcular IMC
export function calculateIMC(weight: number, height: number): { value: number; classification: string } {
  const heightInMeters = height / 100;
  const imc = weight / (heightInMeters * heightInMeters);

  let classification = '';
  if (imc < 18.5) classification = 'Abaixo do peso';
  else if (imc < 25) classification = 'Peso normal';
  else if (imc < 30) classification = 'Sobrepeso';
  else if (imc < 35) classification = 'Obesidade grau I';
  else if (imc < 40) classification = 'Obesidade grau II';
  else classification = 'Obesidade grau III';

  return { value: parseFloat(imc.toFixed(1)), classification };
}

// Traduzir status de consulta
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

// Traduzir tipo de consulta
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

// Traduzir forma de pagamento
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

// Traduzir status de pagamento
export function translatePaymentStatus(status: string): string {
  const translations: Record<string, string> = {
    pendente: 'Pendente',
    pago: 'Pago',
    cancelado: 'Cancelado',
    reembolsado: 'Reembolsado'
  };
  return translations[status] || status;
}

// Gerar horários disponíveis
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

// Obter cor do status
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

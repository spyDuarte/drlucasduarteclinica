import { describe, it, expect } from 'vitest';
import {
  generateId,
  formatDate,
  formatRelativeDate,
  calculateAge,
  formatCurrency,
  formatCPF,
  formatPhone,
  formatCEP,
  isValidCPF,
  calculateIMC,
  translateAppointmentStatus,
  translateAppointmentType,
  translatePaymentMethod,
  translatePaymentStatus,
  generateTimeSlots,
  getStatusColor,
} from './helpers';

describe('helpers', () => {
  describe('generateId', () => {
    it('deve gerar IDs únicos', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^[a-z0-9]+$/);
    });
  });

  describe('formatDate', () => {
    it('deve formatar data ISO no formato brasileiro', () => {
      const result = formatDate('2024-12-25');
      expect(result).toBe('25/12/2024');
    });

    it('deve aceitar formato customizado', () => {
      const result = formatDate('2024-12-25', 'yyyy-MM-dd');
      expect(result).toBe('2024-12-25');
    });

    it('deve formatar objeto Date', () => {
      const date = new Date('2024-12-25');
      const result = formatDate(date);
      expect(result).toBe('25/12/2024');
    });
  });

  describe('formatRelativeDate', () => {
    it('deve retornar "Hoje" para data atual', () => {
      const today = new Date().toISOString();
      const result = formatRelativeDate(today);
      expect(result).toBe('Hoje');
    });
  });

  describe('calculateAge', () => {
    it('deve calcular idade corretamente', () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 30);
      const result = calculateAge(birthDate.toISOString().split('T')[0]);
      expect(result).toBe(30);
    });

    it('deve retornar 0 para recém-nascidos', () => {
      const today = new Date().toISOString().split('T')[0];
      const result = calculateAge(today);
      expect(result).toBe(0);
    });
  });

  describe('formatCurrency', () => {
    it('deve formatar valor em reais', () => {
      const result = formatCurrency(1500.50);
      expect(result).toMatch(/R\$\s*1\.500,50/);
      expect(result).toContain('1.500,50');
    });

    it('deve formatar valores negativos', () => {
      const result = formatCurrency(-100);
      expect(result).toMatch(/-?R\$\s*100,00/);
      expect(result).toContain('100,00');
    });

    it('deve formatar zero', () => {
      const result = formatCurrency(0);
      expect(result).toMatch(/R\$\s*0,00/);
      expect(result).toContain('0,00');
    });
  });

  describe('formatCPF', () => {
    it('deve formatar CPF com pontos e hífen', () => {
      const result = formatCPF('12345678900');
      expect(result).toBe('123.456.789-00');
    });

    it('deve formatar CPF já formatado', () => {
      const result = formatCPF('123.456.789-00');
      expect(result).toBe('123.456.789-00');
    });

    it('deve remover caracteres não numéricos', () => {
      const result = formatCPF('123abc456def789ghi00');
      expect(result).toBe('123.456.789-00');
    });
  });

  describe('formatPhone', () => {
    it('deve formatar celular (11 dígitos)', () => {
      const result = formatPhone('11987654321');
      expect(result).toBe('(11) 98765-4321');
    });

    it('deve formatar telefone fixo (10 dígitos)', () => {
      const result = formatPhone('1134567890');
      expect(result).toBe('(11) 3456-7890');
    });

    it('deve remover formatação anterior', () => {
      const result = formatPhone('(11) 98765-4321');
      expect(result).toBe('(11) 98765-4321');
    });
  });

  describe('formatCEP', () => {
    it('deve formatar CEP', () => {
      const result = formatCEP('01310100');
      expect(result).toBe('01310-100');
    });

    it('deve formatar CEP já formatado', () => {
      const result = formatCEP('01310-100');
      expect(result).toBe('01310-100');
    });
  });

  describe('isValidCPF', () => {
    it('deve validar CPF válido', () => {
      expect(isValidCPF('111.444.777-35')).toBe(true);
      expect(isValidCPF('11144477735')).toBe(true);
    });

    it('deve rejeitar CPF com todos dígitos iguais', () => {
      expect(isValidCPF('111.111.111-11')).toBe(false);
      expect(isValidCPF('000.000.000-00')).toBe(false);
      expect(isValidCPF('999.999.999-99')).toBe(false);
    });

    it('deve rejeitar CPF com tamanho incorreto', () => {
      expect(isValidCPF('123.456.789')).toBe(false);
      expect(isValidCPF('123.456.789-001')).toBe(false);
    });

    it('deve rejeitar CPF com dígitos verificadores inválidos', () => {
      expect(isValidCPF('123.456.789-00')).toBe(false);
      expect(isValidCPF('111.444.777-36')).toBe(false);
    });

    it('deve validar CPFs válidos conhecidos', () => {
      // CPF válido gerado
      expect(isValidCPF('52998224725')).toBe(true);
    });
  });

  describe('calculateIMC', () => {
    it('deve calcular IMC abaixo do peso', () => {
      const result = calculateIMC(45, 170);
      expect(result.value).toBe(15.6);
      expect(result.classification).toBe('Abaixo do peso');
    });

    it('deve calcular IMC peso normal', () => {
      const result = calculateIMC(70, 170);
      expect(result.value).toBe(24.2);
      expect(result.classification).toBe('Peso normal');
    });

    it('deve calcular IMC sobrepeso', () => {
      const result = calculateIMC(80, 170);
      expect(result.value).toBe(27.7);
      expect(result.classification).toBe('Sobrepeso');
    });

    it('deve calcular IMC obesidade grau I', () => {
      const result = calculateIMC(90, 170);
      expect(result.value).toBe(31.1);
      expect(result.classification).toBe('Obesidade grau I');
    });

    it('deve calcular IMC obesidade grau II', () => {
      const result = calculateIMC(110, 170);
      expect(result.value).toBe(38.1);
      expect(result.classification).toBe('Obesidade grau II');
    });

    it('deve calcular IMC obesidade grau III', () => {
      const result = calculateIMC(120, 170);
      expect(result.value).toBe(41.5);
      expect(result.classification).toBe('Obesidade grau III');
    });
  });

  describe('translateAppointmentStatus', () => {
    it('deve traduzir status de consulta', () => {
      expect(translateAppointmentStatus('agendada')).toBe('Agendada');
      expect(translateAppointmentStatus('confirmada')).toBe('Confirmada');
      expect(translateAppointmentStatus('em_atendimento')).toBe('Em atendimento');
      expect(translateAppointmentStatus('finalizada')).toBe('Finalizada');
      expect(translateAppointmentStatus('cancelada')).toBe('Cancelada');
      expect(translateAppointmentStatus('faltou')).toBe('Não compareceu');
    });

    it('deve retornar status original se não houver tradução', () => {
      expect(translateAppointmentStatus('unknown')).toBe('unknown');
    });
  });

  describe('translateAppointmentType', () => {
    it('deve traduzir tipo de consulta', () => {
      expect(translateAppointmentType('primeira_consulta')).toBe('Primeira consulta');
      expect(translateAppointmentType('retorno')).toBe('Retorno');
      expect(translateAppointmentType('urgencia')).toBe('Urgência');
      expect(translateAppointmentType('exame')).toBe('Exame');
      expect(translateAppointmentType('procedimento')).toBe('Procedimento');
    });
  });

  describe('translatePaymentMethod', () => {
    it('deve traduzir forma de pagamento', () => {
      expect(translatePaymentMethod('dinheiro')).toBe('Dinheiro');
      expect(translatePaymentMethod('cartao_credito')).toBe('Cartão de crédito');
      expect(translatePaymentMethod('cartao_debito')).toBe('Cartão de débito');
      expect(translatePaymentMethod('pix')).toBe('PIX');
      expect(translatePaymentMethod('convenio')).toBe('Convênio');
      expect(translatePaymentMethod('transferencia')).toBe('Transferência');
    });
  });

  describe('translatePaymentStatus', () => {
    it('deve traduzir status de pagamento', () => {
      expect(translatePaymentStatus('pendente')).toBe('Pendente');
      expect(translatePaymentStatus('pago')).toBe('Pago');
      expect(translatePaymentStatus('cancelado')).toBe('Cancelado');
      expect(translatePaymentStatus('reembolsado')).toBe('Reembolsado');
    });
  });

  describe('generateTimeSlots', () => {
    it('deve gerar slots de horários', () => {
      const slots = generateTimeSlots('08:00', '10:00', 30);
      expect(slots).toEqual(['08:00', '08:30', '09:00', '09:30']);
    });

    it('deve gerar slots de 15 minutos', () => {
      const slots = generateTimeSlots('14:00', '15:00', 15);
      expect(slots).toEqual(['14:00', '14:15', '14:30', '14:45']);
    });

    it('deve gerar slots de 1 hora', () => {
      const slots = generateTimeSlots('08:00', '12:00', 60);
      expect(slots).toEqual(['08:00', '09:00', '10:00', '11:00']);
    });

    it('deve retornar array vazio se hora inicial >= hora final', () => {
      const slots = generateTimeSlots('10:00', '10:00', 30);
      expect(slots).toEqual([]);
    });
  });

  describe('getStatusColor', () => {
    it('deve retornar cor para status conhecidos', () => {
      expect(getStatusColor('agendada')).toBe('status-scheduled');
      expect(getStatusColor('confirmada')).toBe('status-confirmed');
      expect(getStatusColor('aguardando')).toBe('status-waiting');
      expect(getStatusColor('finalizada')).toBe('status-completed');
      expect(getStatusColor('cancelada')).toBe('status-cancelled');
      expect(getStatusColor('pago')).toBe('status-confirmed');
    });

    it('deve retornar cor padrão para status desconhecido', () => {
      expect(getStatusColor('unknown')).toBe('bg-gray-100 text-gray-800');
    });
  });
});

import { renderHook } from '@testing-library/react';
import { DataProvider, useData } from './DataContext';
import { STORAGE_KEYS } from '../constants/clinic';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { Appointment, Patient, Payment } from '../types';

describe('DataContext Dashboard Stats', () => {
  // 2024-10-27 is a Sunday
  const mockDate = new Date('2024-10-27T10:00:00Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('correctly calculates dashboard stats', async () => {
    const appointments: Partial<Appointment>[] = [
      {
        id: '1',
        data: '2024-10-27', // Today (Sun), This Week, This Month
        status: 'agendada',
        horaInicio: '10:00',
        horaFim: '10:30',
        patientId: 'p1',
        valor: 100
      },
      {
        id: '2',
        data: '2024-10-28', // Tomorrow (Mon), This Week, This Month
        status: 'finalizada',
        horaInicio: '11:00',
        horaFim: '11:30',
        patientId: 'p1',
        valor: 150
      },
      {
        id: '3',
        data: '2024-10-20', // Last Sunday, Last Week (if week starts Sun), This Month
        status: 'agendada',
        horaInicio: '10:00',
        horaFim: '10:30',
        patientId: 'p1',
        valor: 100
      },
      {
        id: '4',
        data: '2024-09-30', // Last Month
        status: 'agendada',
        horaInicio: '10:00',
        horaFim: '10:30',
        patientId: 'p1',
        valor: 100
      },
      {
        id: '5',
        data: '2024-10-27',
        status: 'cancelada', // Should not count
        horaInicio: '12:00',
        horaFim: '12:30',
        patientId: 'p1',
        valor: 100
      }
    ];

    const patients: Partial<Patient>[] = [
        { id: 'p1', createdAt: '2024-10-15T10:00:00Z', nome: 'P1', cpf: '123' } as Patient, // New this month
        { id: 'p2', createdAt: '2024-09-15T10:00:00Z', nome: 'P2', cpf: '456' } as Patient  // Old
    ];

    const payments: Partial<Payment>[] = [
        { id: 'pay1', valor: 200, status: 'pago', createdAt: '2024-10-10T10:00:00Z', patientId: 'p1', formaPagamento: 'pix', descricao: 'Test' }, // This month revenue
        { id: 'pay2', valor: 100, status: 'pendente', createdAt: '2024-10-10T10:00:00Z', patientId: 'p1', formaPagamento: 'pix', descricao: 'Test' }, // Pending
        { id: 'pay3', valor: 300, status: 'pago', createdAt: '2024-09-10T10:00:00Z', patientId: 'p1', formaPagamento: 'pix', descricao: 'Test' } // Last month
    ];

    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));

    const { result } = renderHook(() => useData(), { wrapper: DataProvider });

    // State initialization is synchronous from localStorage
    expect(result.current.appointments.length).toBe(5);

    const stats = result.current.dashboardStats;

    // Consultas Hoje: ID 1. (ID 5 cancelled) -> 1
    expect(stats.consultasHoje).toBe(1);

    // Consultas Semana:
    // Week starts Sunday Oct 27.
    // ID 1 (27) >= 27 -> Yes
    // ID 2 (28) >= 27 -> Yes
    // ID 3 (20) < 27 -> No
    // Total 2
    expect(stats.consultasSemana).toBe(2);

    // Consultas Mes:
    // Month starts Oct 1.
    // ID 1 (27) -> Yes
    // ID 2 (28) -> Yes
    // ID 3 (20) -> Yes
    // ID 4 (Sep 30) -> No
    // Total 3
    expect(stats.consultasMes).toBe(3);

    // Pacientes Novos:
    // P1 (Oct 15) -> Yes
    // P2 (Sep 15) -> No
    // Total 1
    expect(stats.pacientesNovos).toBe(1);

    // Receita Mes:
    // Pay1 (200) -> Yes
    // Pay2 (100) -> No (Pendente)
    // Pay3 (300) -> No (Last Month)
    // Total 200
    expect(stats.receitaMes).toBe(200);

    // Receita Pendente:
    // Pay2 (100) -> Yes
    // Total 100
    expect(stats.receitaPendente).toBe(100);

    // Taxa Comparecimento:
    // Finalizadas: 1 (ID 2)
    // Faltou: 0
    // 1 / 1 = 100%
    expect(stats.taxaComparecimento).toBe(100);
  });
});

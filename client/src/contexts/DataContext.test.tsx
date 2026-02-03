import { render, screen } from '@testing-library/react';
import { DataProvider, useData } from './DataContext';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { STORAGE_KEYS } from '../constants/clinic';

// Mock localStorage
const localStorageMock = (function () {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Test component to access context
function TestComponent() {
  const { dashboardStats } = useData();
  return (
    <div>
      <div data-testid="consultasHoje">{dashboardStats.consultasHoje}</div>
      <div data-testid="consultasSemana">{dashboardStats.consultasSemana}</div>
      <div data-testid="consultasMes">{dashboardStats.consultasMes}</div>
      <div data-testid="pacientesNovos">{dashboardStats.pacientesNovos}</div>
      <div data-testid="receitaMes">{dashboardStats.receitaMes}</div>
      <div data-testid="receitaPendente">{dashboardStats.receitaPendente}</div>
      <div data-testid="taxaComparecimento">{dashboardStats.taxaComparecimento}</div>
    </div>
  );
}

describe('DataContext Performance Optimization', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    // Set date to Wednesday, March 15, 2023
    vi.setSystemTime(new Date('2023-03-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calculates dashboard stats correctly', () => {
    // Setup data
    // Week start: Sunday March 12, 2023 (assuming week starts on Sunday)
    // Month start: March 1, 2023

    const appointments = [
      { id: '1', data: '2023-03-15', status: 'agendada', horaInicio: '10:00', horaFim: '11:00', patientId: 'p1' }, // Today
      { id: '2', data: '2023-03-14', status: 'finalizada', horaInicio: '10:00', horaFim: '11:00', patientId: 'p1' }, // This week
      { id: '3', data: '2023-03-05', status: 'agendada', horaInicio: '10:00', horaFim: '11:00', patientId: 'p1' }, // This month, prev week
      { id: '4', data: '2023-02-28', status: 'agendada', horaInicio: '10:00', horaFim: '11:00', patientId: 'p1' }, // Last month
      { id: '5', data: '2023-03-15', status: 'cancelada', horaInicio: '10:00', horaFim: '11:00', patientId: 'p1' }, // Today Cancelled
      { id: '6', data: '2023-03-13', status: 'faltou', horaInicio: '10:00', horaFim: '11:00', patientId: 'p1' }, // This week faltou
    ];

    const patients = [
        { id: 'p1', nome: 'Patient 1', cpf: '123', createdAt: '2023-03-10T10:00:00Z', updatedAt: '2023-03-10T10:00:00Z' }, // This month
        { id: 'p2', nome: 'Patient 2', cpf: '456', createdAt: '2023-02-20T10:00:00Z', updatedAt: '2023-02-20T10:00:00Z' }, // Last month
    ];

    const payments = [
        { id: 'py1', valor: 100, status: 'pago', createdAt: '2023-03-10T10:00:00Z', patientId: 'p1' }, // This month paid
        { id: 'py2', valor: 50, status: 'pendente', createdAt: '2023-03-10T10:00:00Z', patientId: 'p1' }, // Pending
        { id: 'py3', valor: 200, status: 'pago', createdAt: '2023-02-10T10:00:00Z', patientId: 'p1' }, // Last month paid
    ];

    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));

    render(
      <DataProvider>
        <TestComponent />
      </DataProvider>
    );

    // Consultas Hoje: 1 (id 1). (id 5 is cancelled)
    expect(screen.getByTestId('consultasHoje').textContent).toBe('1');

    // Consultas Semana: 3 (id 1, 2, 6).
    expect(screen.getByTestId('consultasSemana').textContent).toBe('3');

    // Consultas Mes: 4 (id 1, 2, 3, 6).
    expect(screen.getByTestId('consultasMes').textContent).toBe('4');

    // Pacientes Novos: 1 (p1).
    expect(screen.getByTestId('pacientesNovos').textContent).toBe('1');

    // Receita Mes: 100 (py1).
    expect(screen.getByTestId('receitaMes').textContent).toBe('100');

    // Receita Pendente: 50 (py2).
    expect(screen.getByTestId('receitaPendente').textContent).toBe('50');

    // Taxa Comparecimento: finalizada / (finalizada + faltou)
    // Finalizada: 1 (id 2). Faltou: 1 (id 6).
    // 1 / 2 = 50%.
    expect(screen.getByTestId('taxaComparecimento').textContent).toBe('50');
  });
});

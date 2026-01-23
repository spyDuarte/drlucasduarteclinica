import { render, screen, act } from '@testing-library/react';
import { DataProvider, useData } from './DataContext';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';

const TestComponent = () => {
  const { dashboardStats, addAppointment } = useData();
  return (
    <div>
      <span data-testid="consultas-hoje">{dashboardStats.consultasHoje}</span>
      <span data-testid="consultas-semana">{dashboardStats.consultasSemana}</span>
      <span data-testid="consultas-mes">{dashboardStats.consultasMes}</span>
      <button onClick={() => addAppointment({
        patientId: '1',
        data: '2023-10-22', // Sunday
        horaInicio: '09:00',
        horaFim: '09:30',
        tipo: 'primeira_consulta',
        status: 'agendada'
      })}>Add Appointment</button>
    </div>
  );
};

describe('DataContext Dashboard Stats', () => {
  beforeEach(() => {
    // Seed localStorage with empty data to prevent loading demo data
    localStorage.setItem('clinica_appointments', '[]');
    localStorage.setItem('clinica_patients', '[]');
    localStorage.setItem('clinica_records', '[]');
    localStorage.setItem('clinica_payments', '[]');
    localStorage.setItem('clinica_documents', '[]');

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('includes appointments on the start of the week correctly', async () => {
    vi.setSystemTime(new Date('2023-10-22T12:00:00'));

    render(
      <DataProvider>
        <TestComponent />
      </DataProvider>
    );

    // Check that we started with 0 (clean state)
    const initialSemana = Number(screen.getByTestId('consultas-semana').textContent);
    expect(initialSemana).toBe(0);

    const addButton = screen.getByText('Add Appointment');

    await act(async () => {
      addButton.click();
    });

    const newSemana = Number(screen.getByTestId('consultas-semana').textContent);

    // Expectation: It should increment by 1.
    // If bug exists (Sunday 00:00 < Sunday 12:00), it won't increment (remains 0).
    expect(newSemana).toBe(1);
  });
});

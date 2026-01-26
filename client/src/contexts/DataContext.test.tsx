import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { DataProvider, useData } from './DataContext';

// Mock localStorage
const localStorageMock = (() => {
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
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('DataContext Dashboard Stats', () => {
  // Set fixed date: 2023-10-15 (Sunday)
  // Start of Week: 2023-10-15
  // Start of Month: 2023-10-01
  const FIXED_DATE = new Date('2023-10-15T12:00:00');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_DATE);
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calculates dashboard stats correctly', async () => {
    const { result } = renderHook(() => useData(), {
      wrapper: DataProvider
    });

    // Clear initial demo data if any (Data Provider might load demo data if empty,
    // but clearing localStorage in beforeEach helps. However, DataContext logic:
    // "if (savedPatients) ... else return DEMO_PATIENTS".
    // So clearing localStorage causes it to load DEMO data.
    // We need to clear the data using the context method if available, or just verify logic with added data.
    // Context has `clearAllData`. Let's use it.

    // Fix: clearAllData uses confirm(), so we mock confirm.
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    // clearAllData resets to DEMO data, so we must manually delete everything to get a clean slate.
    // We need to act() for each deletion or batch them if possible.
    // Note: deletePatient deletes related appointments and payments too, so we start with patients.

    // We need to capture the IDs first to avoid issues with state updating during iteration?
    // But result.current.patients is a state value.

    await act(async () => {
      // Use clearAllData first to reset to known Demo state (in case localStorage had junk)
      result.current.clearAllData();
    });

    // Now delete all patients
    // We need to loop. Since state updates are async/batched in React, we might need multiple acts or just one.
    // However, deletePatient updates state.
    const patients = [...result.current.patients];
    for (const p of patients) {
        await act(async () => {
            result.current.deletePatient(p.id);
        });
    }

    // Verify empty state
    expect(result.current.dashboardStats).toEqual({
      consultasHoje: 0,
      consultasSemana: 0,
      consultasMes: 0,
      pacientesTotal: 0,
      pacientesNovos: 0,
      receitaMes: 0,
      receitaPendente: 0,
      taxaComparecimento: 100
    });

    // Add Patient (Created Now -> This Month)
    await act(async () => {
      result.current.addPatient({
        nome: 'Test Patient',
        cpf: '123.456.789-00',
        dataNascimento: '1990-01-01',
        sexo: 'M',
        telefone: '11999999999',
        endereco: {
          logradouro: 'Rua Teste',
          numero: '123',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01001-000'
        }
      });
    });

    // Add Appointment Today (2023-10-15) - Within Week, Within Month
    await act(async () => {
      const patient = result.current.patients[0];
      result.current.addAppointment({
        patientId: patient.id,
        data: '2023-10-15',
        horaInicio: '14:00',
        horaFim: '14:30',
        tipo: 'primeira_consulta',
        status: 'agendada'
      });
    });

    // Add Appointment Yesterday (2023-10-14) - Previous Week (since week starts Sunday 15th), Within Month
    // Wait, week starts Sunday. 15th is Sunday.
    // So 14th (Saturday) is PREVIOUS week.
    await act(async () => {
      const patient = result.current.patients[0];
      // Force no conflict
      result.current.addAppointment({
        patientId: patient.id,
        data: '2023-10-14',
        horaInicio: '14:00',
        horaFim: '14:30',
        tipo: 'retorno',
        status: 'finalizada'
      });
    });

    // Add Appointment Last Month (2023-09-15) - Not Week, Not Month
    await act(async () => {
      const patient = result.current.patients[0];
      result.current.addAppointment({
        patientId: patient.id,
        data: '2023-09-15',
        horaInicio: '14:00',
        horaFim: '14:30',
        tipo: 'retorno',
        status: 'finalizada'
      });
    });

    // Add Appointment Cancelled Today (Should not count for stats usually, depends on logic)
    // Logic: "status !== 'cancelada'" for volume counts.
    await act(async () => {
        const patient = result.current.patients[0];
        result.current.addAppointment({
          patientId: patient.id,
          data: '2023-10-15',
          horaInicio: '15:00', // Different time
          horaFim: '15:30',
          tipo: 'retorno',
          status: 'cancelada'
        });
      });

    // Add Payment (Paid, This Month)
    await act(async () => {
      const patient = result.current.patients[0];
      result.current.addPayment({
        patientId: patient.id,
        valor: 200,
        descricao: 'Consulta',
        formaPagamento: 'pix',
        status: 'pago' // createdAt will be NOW (This month)
      });
    });

    // Add Payment (Pendente)
    await act(async () => {
      const patient = result.current.patients[0];
      result.current.addPayment({
        patientId: patient.id,
        valor: 150,
        descricao: 'Exame',
        formaPagamento: 'cartao_credito',
        status: 'pendente'
      });
    });

    const stats = result.current.dashboardStats;

    // Assertions
    // Consultas Hoje: 1 (The agendada one). Cancelled ignored. Yesterday ignored.
    expect(stats.consultasHoje).toBe(1);

    // Consultas Semana: 1 (Today is Sunday, start of week. Yesterday is Sat, prev week).
    // The "agendada" one counts.
    expect(stats.consultasSemana).toBe(1);

    // Consultas Mes: 2 (Today + Yesterday). 2023-09-15 is excluded.
    // Note: Yesterday (14th) is in Oct.
    expect(stats.consultasMes).toBe(2);

    // Pacientes Total: 1
    expect(stats.pacientesTotal).toBe(1);

    // Pacientes Novos (This Month): 1
    expect(stats.pacientesNovos).toBe(1);

    // Receita Mes: 200 (Paid one). Pendente excluded.
    expect(stats.receitaMes).toBe(200);

    // Receita Pendente: 150.
    expect(stats.receitaPendente).toBe(150);

    // Taxa Comparecimento
    // Finalizadas: 1 (The one yesterday) + 1 (The one last month) = 2.
    // Faltou: 0.
    // Total considered: 2.
    // Rate: 100%.
    // Wait, let's verify logic:
    // const finalizadas = appointments.filter(a => a.status === 'finalizada').length;
    // const faltou = appointments.filter(a => a.status === 'faltou').length;
    // (finalizadas / (finalizadas + faltou)) * 100
    // We added:
    // 1. Agendada (Today) - Not counted
    // 2. Finalizada (Yesterday) - Counted
    // 3. Finalizada (Last Month) - Counted
    // 4. Cancelada (Today) - Not counted
    // Total Finalizadas = 2. Total Faltou = 0.
    // Rate = 2/2 = 100%.
    expect(stats.taxaComparecimento).toBe(100);
  });
});

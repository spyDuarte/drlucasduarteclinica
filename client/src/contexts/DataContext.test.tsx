import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { DataProvider, useData } from './DataContext';

// Mock localStorage to start clean or handle persistence
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

// Mock confirm for clearAllData
global.confirm = vi.fn(() => true);

describe('DataContext Dashboard Stats', () => {
  beforeEach(() => {
    localStorage.clear();
    // Initialize with empty data to avoid Demo Data fallback
    localStorage.setItem('clinica_patients', '[]');
    localStorage.setItem('clinica_appointments', '[]');
    localStorage.setItem('clinica_records', '[]');
    localStorage.setItem('clinica_payments', '[]');
    localStorage.setItem('clinica_documents', '[]');

    vi.useFakeTimers();
    vi.setSystemTime(new Date(2023, 9, 25, 10, 0, 0)); // Oct 25 2023 10:00:00 Local
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calculates dashboard stats correctly', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DataProvider>{children}</DataProvider>
    );

    const { result } = renderHook(() => useData(), { wrapper });

    // Verify empty stats
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

    // Add Patient
    let patientId: string;
    act(() => {
        const p = result.current.addPatient({
            nome: 'Test Patient',
            cpf: '12345678900',
            telefone: '11999999999',
            email: 'test@example.com',
            dataNascimento: '1990-01-01',
            genero: 'M',
            endereco: '',
            numero: '',
            bairro: '',
            cidade: '',
            estado: '',
            cep: ''
        });
        patientId = p.id;
    });

    // Add Appointment Today (2023-10-25)
    act(() => {
        result.current.addAppointment({
            patientId,
            patientName: 'Test Patient',
            data: '2023-10-25', // Today
            horaInicio: '10:00',
            horaFim: '10:30',
            tipo: 'primeira_consulta',
            status: 'agendada',
            observacoes: ''
        });
    });

    // Add Appointment Yesterday (2023-10-24) - Should be in Week (if week starts Sunday Oct 22)
    act(() => {
        result.current.addAppointment({
            patientId,
            patientName: 'Test Patient',
            data: '2023-10-24',
            horaInicio: '10:00',
            horaFim: '10:30',
            tipo: 'retorno',
            status: 'agendada',
            observacoes: ''
        });
    });

    // Add Appointment Last Month (2023-09-25)
    act(() => {
        result.current.addAppointment({
            patientId,
            patientName: 'Test Patient',
            data: '2023-09-25',
            horaInicio: '10:00',
            horaFim: '10:30',
            tipo: 'retorno',
            status: 'agendada',
            observacoes: ''
        });
    });

    // Stats Check
    // Today: Oct 25. Week: Oct 22-28. Month: Oct 1-31.
    expect(result.current.dashboardStats.consultasHoje).toBe(1);
    expect(result.current.dashboardStats.consultasSemana).toBe(2);
    expect(result.current.dashboardStats.consultasMes).toBe(2);
    expect(result.current.dashboardStats.pacientesNovos).toBe(1); // Added today
    expect(result.current.dashboardStats.pacientesTotal).toBe(1);
  });

  it('handles start of month correctly', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DataProvider>{children}</DataProvider>
    );
    const { result } = renderHook(() => useData(), { wrapper });

    let patientId: string;
    act(() => {
         const p = result.current.addPatient({
            nome: 'Test Patient',
            cpf: '12345678900',
            telefone: '11999999999',
            email: 'test@example.com',
            dataNascimento: '1990-01-01',
            genero: 'M',
            endereco: '',
            numero: '',
            bairro: '',
            cidade: '',
            estado: '',
            cep: ''
        });
        patientId = p.id;
    });

    // Add Appointment on Oct 1st (Start of Month)
    act(() => {
        result.current.addAppointment({
            patientId,
            patientName: 'Test Patient',
            data: '2023-10-01',
            horaInicio: '09:00',
            horaFim: '09:30',
            tipo: 'retorno',
            status: 'agendada',
            observacoes: ''
        });
    });

    // The existing logic might exclude this if timezone bugs exist.
    // If it fails, I'll know existing code is buggy.
    expect(result.current.dashboardStats.consultasMes).toBe(1);
  });
});

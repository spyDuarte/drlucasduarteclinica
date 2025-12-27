import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Patient, Appointment, MedicalRecord, Payment, DashboardStats } from '../types';
import { generateId } from '../utils/helpers';
import { STORAGE_KEYS } from '../constants/clinic';
import {
  DEMO_PATIENTS,
  DEMO_MEDICAL_RECORDS,
  generateDemoAppointments,
  generateDemoPayments
} from '../data/demoData';

interface DataContextType {
  // Pacientes
  patients: Patient[];
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => Patient;
  updatePatient: (id: string, patient: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  getPatient: (id: string) => Patient | undefined;

  // Consultas
  appointments: Appointment[];
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => Appointment;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  getAppointment: (id: string) => Appointment | undefined;
  getAppointmentsByDate: (date: string) => Appointment[];
  getAppointmentsByPatient: (patientId: string) => Appointment[];

  // Prontuários
  medicalRecords: MedicalRecord[];
  addMedicalRecord: (record: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>) => MedicalRecord;
  updateMedicalRecord: (id: string, record: Partial<MedicalRecord>) => void;
  getMedicalRecordsByPatient: (patientId: string) => MedicalRecord[];

  // Pagamentos
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => Payment;
  updatePayment: (id: string, payment: Partial<Payment>) => void;
  getPaymentsByPatient: (patientId: string) => Payment[];

  // Dashboard
  getDashboardStats: () => DashboardStats;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(() => {
    const savedPatients = localStorage.getItem(STORAGE_KEYS.PATIENTS);
    if (savedPatients) {
      try {
        return JSON.parse(savedPatients);
      } catch {
        return DEMO_PATIENTS;
      }
    }
    return DEMO_PATIENTS;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const savedAppointments = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    if (savedAppointments) {
      try {
        return JSON.parse(savedAppointments);
      } catch {
        return generateDemoAppointments();
      }
    }
    return generateDemoAppointments();
  });

  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>(() => {
    const savedRecords = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (savedRecords) {
      try {
        return JSON.parse(savedRecords);
      } catch {
        return DEMO_MEDICAL_RECORDS;
      }
    }
    return DEMO_MEDICAL_RECORDS;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const savedPayments = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    if (savedPayments) {
      try {
        return JSON.parse(savedPayments);
      } catch {
        return generateDemoPayments();
      }
    }
    return generateDemoPayments();
  });

  // Persistir dados no localStorage (consolidado com debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (patients.length > 0) {
        localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
      }
      if (appointments.length > 0) {
        localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
      }
      if (medicalRecords.length > 0) {
        localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(medicalRecords));
      }
      if (payments.length > 0) {
        localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
      }
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [patients, appointments, medicalRecords, payments]);

  // Funções de Pacientes
  const addPatient = useCallback((patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Validar CPF duplicado
    const cpfExists = patients.some(p => p.cpf === patientData.cpf);
    if (cpfExists) {
      throw new Error('Já existe um paciente cadastrado com este CPF');
    }

    const now = new Date().toISOString();
    const newPatient: Patient = {
      ...patientData,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    };
    setPatients(prev => [...prev, newPatient]);
    return newPatient;
  }, [patients]);

  const updatePatient = useCallback((id: string, patientData: Partial<Patient>) => {
    // Validar CPF duplicado ao atualizar (exceto para o próprio paciente)
    if (patientData.cpf) {
      const cpfExists = patients.some(p => p.cpf === patientData.cpf && p.id !== id);
      if (cpfExists) {
        throw new Error('Já existe outro paciente cadastrado com este CPF');
      }
    }

    setPatients(prev => prev.map(p =>
      p.id === id
        ? { ...p, ...patientData, updatedAt: new Date().toISOString() }
        : p
    ));
  }, [patients]);

  const deletePatient = useCallback((id: string) => {
    setPatients(prev => prev.filter(p => p.id !== id));
  }, []);

  const getPatient = useCallback((id: string) => patients.find(p => p.id === id), [patients]);

  // Funções de Consultas
  const addAppointment = useCallback((appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newAppointment: Appointment = {
      ...appointmentData,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    };
    setAppointments(prev => [...prev, newAppointment]);
    return newAppointment;
  }, []);

  const updateAppointment = useCallback((id: string, appointmentData: Partial<Appointment>) => {
    setAppointments(prev => prev.map(a =>
      a.id === id
        ? { ...a, ...appointmentData, updatedAt: new Date().toISOString() }
        : a
    ));
  }, []);

  const deleteAppointment = useCallback((id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
  }, []);

  const getAppointment = useCallback((id: string) => appointments.find(a => a.id === id), [appointments]);

  const getAppointmentsByDate = useCallback((date: string) =>
    appointments
      .filter(a => a.data === date)
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)),
    [appointments]
  );

  const getAppointmentsByPatient = useCallback((patientId: string) =>
    appointments.filter(a => a.patientId === patientId),
    [appointments]
  );

  // Funções de Prontuários
  const addMedicalRecord = useCallback((recordData: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newRecord: MedicalRecord = {
      ...recordData,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    };
    setMedicalRecords(prev => [...prev, newRecord]);
    return newRecord;
  }, []);

  const updateMedicalRecord = useCallback((id: string, recordData: Partial<MedicalRecord>) => {
    setMedicalRecords(prev => prev.map(r =>
      r.id === id
        ? { ...r, ...recordData, updatedAt: new Date().toISOString() }
        : r
    ));
  }, []);

  const getMedicalRecordsByPatient = useCallback((patientId: string) =>
    medicalRecords.filter(r => r.patientId === patientId),
    [medicalRecords]
  );

  // Funções de Pagamentos
  const addPayment = useCallback((paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newPayment: Payment = {
      ...paymentData,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    };
    setPayments(prev => [...prev, newPayment]);
    return newPayment;
  }, []);

  const updatePayment = useCallback((id: string, paymentData: Partial<Payment>) => {
    setPayments(prev => prev.map(p =>
      p.id === id
        ? { ...p, ...paymentData, updatedAt: new Date().toISOString() }
        : p
    ));
  }, []);

  const getPaymentsByPatient = useCallback((patientId: string) =>
    payments.filter(p => p.patientId === patientId),
    [payments]
  );

  // Dashboard Stats - memoizado para evitar recálculos desnecessários
  const getDashboardStats = useCallback((): DashboardStats => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const consultasHoje = appointments.filter(a =>
      a.data === todayStr && a.status !== 'cancelada'
    ).length;

    const consultasSemana = appointments.filter(a => {
      const appDate = new Date(a.data);
      return appDate >= startOfWeek && a.status !== 'cancelada';
    }).length;

    const consultasMes = appointments.filter(a => {
      const appDate = new Date(a.data);
      return appDate >= startOfMonth && a.status !== 'cancelada';
    }).length;

    const pacientesNovos = patients.filter(p => {
      const createdDate = new Date(p.createdAt);
      return createdDate >= startOfMonth;
    }).length;

    const receitaMes = payments.filter(p => {
      const paymentDate = new Date(p.createdAt);
      return paymentDate >= startOfMonth && p.status === 'pago';
    }).reduce((sum, p) => sum + p.valor, 0);

    const receitaPendente = payments.filter(p =>
      p.status === 'pendente'
    ).reduce((sum, p) => sum + p.valor, 0);

    const finalizadas = appointments.filter(a => a.status === 'finalizada').length;
    const faltou = appointments.filter(a => a.status === 'faltou').length;
    const taxaComparecimento = finalizadas + faltou > 0
      ? (finalizadas / (finalizadas + faltou)) * 100
      : 100;

    return {
      consultasHoje,
      consultasSemana,
      consultasMes,
      pacientesTotal: patients.length,
      pacientesNovos,
      receitaMes,
      receitaPendente,
      taxaComparecimento
    };
  }, [appointments, patients, payments]);

  return (
    <DataContext.Provider value={{
      patients,
      addPatient,
      updatePatient,
      deletePatient,
      getPatient,
      appointments,
      addAppointment,
      updateAppointment,
      deleteAppointment,
      getAppointment,
      getAppointmentsByDate,
      getAppointmentsByPatient,
      medicalRecords,
      addMedicalRecord,
      updateMedicalRecord,
      getMedicalRecordsByPatient,
      payments,
      addPayment,
      updatePayment,
      getPaymentsByPatient,
      getDashboardStats
    }}>
      {children}
    </DataContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData deve ser usado dentro de um DataProvider');
  }
  return context;
}

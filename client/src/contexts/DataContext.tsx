import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type { Patient, Appointment, MedicalRecord, Payment, DashboardStats, MedicalDocument, DocumentType } from '../types';
import { generateId, doTimesOverlap, normalizeForSearch, sortBy } from '../utils/helpers';
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
  searchPatients: (query: string) => Patient[];
  getPatientWithAppointments: (id: string) => (Patient & { appointments: Appointment[] }) | undefined;

  // Consultas
  appointments: Appointment[];
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => Appointment;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  getAppointment: (id: string) => Appointment | undefined;
  getAppointmentsByDate: (date: string) => Appointment[];
  getAppointmentsByPatient: (patientId: string) => Appointment[];
  checkAppointmentConflict: (date: string, horaInicio: string, horaFim: string, excludeId?: string) => boolean;
  getUpcomingAppointments: (limit?: number) => Appointment[];
  getTodayAppointments: () => Appointment[];

  // Prontuários
  medicalRecords: MedicalRecord[];
  addMedicalRecord: (record: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>) => MedicalRecord;
  updateMedicalRecord: (id: string, record: Partial<MedicalRecord>) => void;
  getMedicalRecordsByPatient: (patientId: string) => MedicalRecord[];
  getLastMedicalRecord: (patientId: string) => MedicalRecord | undefined;

  // Pagamentos
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => Payment;
  updatePayment: (id: string, payment: Partial<Payment>) => void;
  getPaymentsByPatient: (patientId: string) => Payment[];
  getPendingPayments: () => Payment[];
  markPaymentAsPaid: (id: string) => void;

  // Dashboard
  dashboardStats: DashboardStats;

  // Documentos Médicos
  documents: MedicalDocument[];
  addDocument: (document: Omit<MedicalDocument, 'id' | 'createdAt' | 'updatedAt'>) => MedicalDocument;
  updateDocument: (id: string, document: Partial<MedicalDocument>) => void;
  deleteDocument: (id: string) => void;
  getDocument: (id: string) => MedicalDocument | undefined;
  getDocumentsByPatient: (patientId: string) => MedicalDocument[];
  getDocumentsByType: (type: DocumentType) => MedicalDocument[];
  emitDocument: (id: string) => void;
  cancelDocument: (id: string) => void;

  // Utilitários
  exportData: () => { patients: Patient[]; appointments: Appointment[]; medicalRecords: MedicalRecord[]; payments: Payment[]; documents: MedicalDocument[] };
  clearAllData: () => void;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

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

  const [documents, setDocuments] = useState<MedicalDocument[]>(() => {
    const savedDocuments = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    if (savedDocuments) {
      try {
        return JSON.parse(savedDocuments);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Função auxiliar para salvar dados no localStorage com tratamento de erros
  const safeSetItem = (key: string, data: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      // Tratamento de erro para quota excedida ou outros problemas de storage
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn(`[Storage] Quota excedida ao salvar ${key}. Considere limpar dados antigos.`);
      } else {
        console.error(`[Storage] Erro ao salvar ${key}:`, error);
      }
    }
  };

  // Persistir dados no localStorage (consolidado com debounce e tratamento de erros)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (patients.length > 0) {
        safeSetItem(STORAGE_KEYS.PATIENTS, patients);
      }
      if (appointments.length > 0) {
        safeSetItem(STORAGE_KEYS.APPOINTMENTS, appointments);
      }
      if (medicalRecords.length > 0) {
        safeSetItem(STORAGE_KEYS.RECORDS, medicalRecords);
      }
      if (payments.length > 0) {
        safeSetItem(STORAGE_KEYS.PAYMENTS, payments);
      }
      // Salva documentos mesmo se vazio para limpar storage quando necessário
      safeSetItem(STORAGE_KEYS.DOCUMENTS, documents);
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [patients, appointments, medicalRecords, payments, documents]);

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
    // Também remove consultas, prontuários e pagamentos relacionados
    setAppointments(prev => prev.filter(a => a.patientId !== id));
    setMedicalRecords(prev => prev.filter(r => r.patientId !== id));
    setPayments(prev => prev.filter(p => p.patientId !== id));
  }, []);

  const getPatient = useCallback((id: string) => patients.find(p => p.id === id), [patients]);

  // Busca textual em pacientes (nome, CPF, telefone, email)
  const searchPatients = useCallback((query: string): Patient[] => {
    if (!query.trim()) return patients;

    const normalizedQuery = normalizeForSearch(query);
    return patients.filter(patient => {
      const searchableText = normalizeForSearch(
        `${patient.nome} ${patient.cpf} ${patient.telefone} ${patient.email || ''}`
      );
      return searchableText.includes(normalizedQuery);
    });
  }, [patients]);

  // Retorna paciente com suas consultas
  const getPatientWithAppointments = useCallback((id: string) => {
    const patient = patients.find(p => p.id === id);
    if (!patient) return undefined;

    const patientAppointments = appointments
      .filter(a => a.patientId === id)
      .sort((a, b) => b.data.localeCompare(a.data) || b.horaInicio.localeCompare(a.horaInicio));

    return { ...patient, appointments: patientAppointments };
  }, [patients, appointments]);

  // Verifica conflito de horário
  const checkAppointmentConflict = useCallback((
    date: string,
    horaInicio: string,
    horaFim: string,
    excludeId?: string
  ): boolean => {
    return appointments.some(apt => {
      if (excludeId && apt.id === excludeId) return false;
      if (apt.data !== date) return false;
      if (apt.status === 'cancelada') return false;

      return doTimesOverlap(horaInicio, horaFim, apt.horaInicio, apt.horaFim);
    });
  }, [appointments]);

  // Funções de Consultas
  const addAppointment = useCallback((appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Verificar conflito de horário
    const hasConflict = checkAppointmentConflict(
      appointmentData.data,
      appointmentData.horaInicio,
      appointmentData.horaFim
    );

    if (hasConflict) {
      throw new Error('Já existe uma consulta agendada neste horário');
    }

    const now = new Date().toISOString();
    const newAppointment: Appointment = {
      ...appointmentData,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    };
    setAppointments(prev => [...prev, newAppointment]);
    return newAppointment;
  }, [checkAppointmentConflict]);

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

  // Consultas futuras ordenadas por data
  const getUpcomingAppointments = useCallback((limit: number = 10): Appointment[] => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().slice(0, 5);

    return appointments
      .filter(a => {
        if (a.status === 'cancelada' || a.status === 'finalizada' || a.status === 'faltou') return false;
        if (a.data > today) return true;
        if (a.data === today && a.horaInicio >= now) return true;
        return false;
      })
      .sort((a, b) => a.data.localeCompare(b.data) || a.horaInicio.localeCompare(b.horaInicio))
      .slice(0, limit);
  }, [appointments]);

  // Consultas de hoje ordenadas por horário
  const getTodayAppointments = useCallback((): Appointment[] => {
    const today = new Date().toISOString().split('T')[0];
    return sortBy(
      appointments.filter(a => a.data === today && a.status !== 'cancelada'),
      'horaInicio'
    );
  }, [appointments]);

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
    medicalRecords
      .filter(r => r.patientId === patientId)
      .sort((a, b) => b.data.localeCompare(a.data)),
    [medicalRecords]
  );

  // Retorna o último prontuário de um paciente
  const getLastMedicalRecord = useCallback((patientId: string): MedicalRecord | undefined => {
    const records = getMedicalRecordsByPatient(patientId);
    return records[0]; // Já ordenado por data decrescente
  }, [getMedicalRecordsByPatient]);

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

  // Retorna pagamentos pendentes
  const getPendingPayments = useCallback((): Payment[] => {
    return payments
      .filter(p => p.status === 'pendente')
      .sort((a, b) => (a.dataVencimento || a.createdAt).localeCompare(b.dataVencimento || b.createdAt));
  }, [payments]);

  // Marca um pagamento como pago
  const markPaymentAsPaid = useCallback((id: string) => {
    const now = new Date().toISOString();
    setPayments(prev => prev.map(p =>
      p.id === id
        ? { ...p, status: 'pago' as const, dataPagamento: now.split('T')[0], updatedAt: now }
        : p
    ));
  }, []);

  // Funções de Documentos Médicos
  const addDocument = useCallback((documentData: Omit<MedicalDocument, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newDocument: MedicalDocument = {
      ...documentData,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    };
    setDocuments(prev => [...prev, newDocument]);
    return newDocument;
  }, []);

  const updateDocument = useCallback((id: string, documentData: Partial<MedicalDocument>) => {
    setDocuments(prev => prev.map(d =>
      d.id === id
        ? { ...d, ...documentData, updatedAt: new Date().toISOString() }
        : d
    ));
  }, []);

  const deleteDocument = useCallback((id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  }, []);

  const getDocument = useCallback((id: string) => documents.find(d => d.id === id), [documents]);

  const getDocumentsByPatient = useCallback((patientId: string) =>
    documents
      .filter(d => d.patientId === patientId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [documents]
  );

  const getDocumentsByType = useCallback((type: DocumentType) =>
    documents
      .filter(d => d.type === type)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [documents]
  );

  const emitDocument = useCallback((id: string) => {
    const now = new Date().toISOString();
    setDocuments(prev => prev.map(d =>
      d.id === id
        ? { ...d, status: 'emitido' as const, emitidoAt: now, updatedAt: now }
        : d
    ));
  }, []);

  const cancelDocument = useCallback((id: string) => {
    const now = new Date().toISOString();
    setDocuments(prev => prev.map(d =>
      d.id === id
        ? { ...d, status: 'cancelado' as const, updatedAt: now }
        : d
    ));
  }, []);

  // Dashboard Stats - memoizado para evitar recálculos desnecessários
  const dashboardStats = useMemo((): DashboardStats => {
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

  // Exporta todos os dados
  const exportData = useCallback(() => {
    return {
      patients,
      appointments,
      medicalRecords,
      payments,
      documents
    };
  }, [patients, appointments, medicalRecords, payments, documents]);

  // Limpa todos os dados (volta ao estado inicial)
  const clearAllData = useCallback(() => {
    if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
      setPatients(DEMO_PATIENTS);
      setAppointments(generateDemoAppointments());
      setMedicalRecords(DEMO_MEDICAL_RECORDS);
      setPayments(generateDemoPayments());
      setDocuments([]);

      // Limpa localStorage
      localStorage.removeItem(STORAGE_KEYS.PATIENTS);
      localStorage.removeItem(STORAGE_KEYS.APPOINTMENTS);
      localStorage.removeItem(STORAGE_KEYS.RECORDS);
      localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
      localStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
    }
  }, []);

  // Memoiza o valor do contexto para evitar re-renders desnecessários
  const contextValue = useMemo(() => ({
    patients,
    addPatient,
    updatePatient,
    deletePatient,
    getPatient,
    searchPatients,
    getPatientWithAppointments,
    appointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointment,
    getAppointmentsByDate,
    getAppointmentsByPatient,
    checkAppointmentConflict,
    getUpcomingAppointments,
    getTodayAppointments,
    medicalRecords,
    addMedicalRecord,
    updateMedicalRecord,
    getMedicalRecordsByPatient,
    getLastMedicalRecord,
    payments,
    addPayment,
    updatePayment,
    getPaymentsByPatient,
    getPendingPayments,
    markPaymentAsPaid,
    documents,
    addDocument,
    updateDocument,
    deleteDocument,
    getDocument,
    getDocumentsByPatient,
    getDocumentsByType,
    emitDocument,
    cancelDocument,
    dashboardStats,
    exportData,
    clearAllData
  }), [
    patients, addPatient, updatePatient, deletePatient, getPatient, searchPatients, getPatientWithAppointments,
    appointments, addAppointment, updateAppointment, deleteAppointment, getAppointment,
    getAppointmentsByDate, getAppointmentsByPatient, checkAppointmentConflict, getUpcomingAppointments, getTodayAppointments,
    medicalRecords, addMedicalRecord, updateMedicalRecord, getMedicalRecordsByPatient, getLastMedicalRecord,
    payments, addPayment, updatePayment, getPaymentsByPatient, getPendingPayments, markPaymentAsPaid,
    documents, addDocument, updateDocument, deleteDocument, getDocument, getDocumentsByPatient, getDocumentsByType, emitDocument, cancelDocument,
    dashboardStats, exportData, clearAllData
  ]);

  return (
    <DataContext.Provider value={contextValue}>
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

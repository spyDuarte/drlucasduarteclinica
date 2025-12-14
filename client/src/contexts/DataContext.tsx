import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Patient, Appointment, MedicalRecord, Payment, DashboardStats } from '../types';
import { generateId } from '../utils/helpers';

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

// Dados de demonstração
const DEMO_PATIENTS: Patient[] = [
  {
    id: '1',
    nome: 'João Carlos Santos',
    cpf: '123.456.789-00',
    dataNascimento: '1985-03-15',
    sexo: 'M',
    telefone: '(11) 98765-4321',
    email: 'joao.santos@email.com',
    endereco: {
      logradouro: 'Rua das Flores',
      numero: '123',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567'
    },
    alergias: ['Dipirona'],
    medicamentosEmUso: ['Losartana 50mg'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    nome: 'Maria Fernanda Lima',
    cpf: '987.654.321-00',
    dataNascimento: '1990-07-22',
    sexo: 'F',
    telefone: '(11) 91234-5678',
    email: 'maria.lima@email.com',
    endereco: {
      logradouro: 'Av. Paulista',
      numero: '1000',
      complemento: 'Apto 45',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01310-100'
    },
    convenio: {
      nome: 'Unimed',
      numero: '123456789',
      validade: '2025-12-31'
    },
    createdAt: '2024-02-10T14:30:00Z',
    updatedAt: '2024-02-10T14:30:00Z'
  },
  {
    id: '3',
    nome: 'Pedro Henrique Oliveira',
    cpf: '456.789.123-00',
    dataNascimento: '1978-11-08',
    sexo: 'M',
    telefone: '(11) 99876-5432',
    endereco: {
      logradouro: 'Rua Augusta',
      numero: '500',
      bairro: 'Consolação',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01305-000'
    },
    alergias: ['Penicilina', 'Ibuprofeno'],
    medicamentosEmUso: ['Metformina 850mg', 'Atenolol 25mg'],
    historicoFamiliar: 'Pai diabético, mãe hipertensa',
    createdAt: '2024-03-05T09:15:00Z',
    updatedAt: '2024-03-05T09:15:00Z'
  }
];

const today = new Date().toISOString().split('T')[0];

const DEMO_APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    patientId: '1',
    data: today,
    horaInicio: '09:00',
    horaFim: '09:30',
    tipo: 'retorno',
    status: 'confirmada',
    motivo: 'Acompanhamento de hipertensão',
    valor: 250,
    createdAt: '2024-12-10T10:00:00Z',
    updatedAt: '2024-12-10T10:00:00Z'
  },
  {
    id: '2',
    patientId: '2',
    data: today,
    horaInicio: '10:00',
    horaFim: '10:30',
    tipo: 'primeira_consulta',
    status: 'agendada',
    motivo: 'Check-up geral',
    convenio: true,
    createdAt: '2024-12-11T14:00:00Z',
    updatedAt: '2024-12-11T14:00:00Z'
  },
  {
    id: '3',
    patientId: '3',
    data: today,
    horaInicio: '11:00',
    horaFim: '11:30',
    tipo: 'retorno',
    status: 'aguardando',
    motivo: 'Revisão de exames',
    valor: 200,
    createdAt: '2024-12-12T16:00:00Z',
    updatedAt: '2024-12-12T16:00:00Z'
  }
];

const DEMO_MEDICAL_RECORDS: MedicalRecord[] = [
  {
    id: '1',
    patientId: '1',
    appointmentId: '1',
    data: '2024-11-15',
    subjetivo: {
      queixaPrincipal: 'Cefaleia frequente há 2 semanas',
      historicoDoencaAtual: 'Paciente refere dor de cabeça frontal, pulsátil, de intensidade moderada, que piora no final do dia. Nega náuseas ou vômitos. Associa com estresse no trabalho.',
      revisaoSistemas: 'Nega alterações visuais, febre, rigidez de nuca.'
    },
    objetivo: {
      sinaisVitais: {
        pressaoArterial: '140/90',
        frequenciaCardiaca: 78,
        temperatura: 36.5,
        peso: 82,
        altura: 175,
        imc: 26.8
      },
      exameFisico: 'BEG, corado, hidratado. ACV: RCR 2T BNF. AR: MVU sem RA. Abdome: flácido, indolor. Neurológico: sem déficits focais.'
    },
    avaliacao: {
      hipotesesDiagnosticas: ['Cefaleia tensional', 'Hipertensão arterial sistêmica'],
      cid10: ['G44.2', 'I10']
    },
    plano: {
      conduta: 'Orientado sobre manejo do estresse. Ajuste de medicação anti-hipertensiva.',
      prescricoes: [
        {
          id: '1',
          medicamento: 'Losartana',
          concentracao: '50mg',
          formaFarmaceutica: 'Comprimido',
          posologia: '1 comprimido pela manhã',
          quantidade: '30 comprimidos',
          duracao: '30 dias'
        }
      ],
      solicitacaoExames: ['Hemograma completo', 'Glicemia de jejum', 'Perfil lipídico'],
      retorno: '30 dias',
      orientacoes: 'Dieta hipossódica, atividade física regular, controle de PA domiciliar.'
    },
    createdAt: '2024-11-15T10:30:00Z',
    updatedAt: '2024-11-15T10:30:00Z'
  }
];

const DEMO_PAYMENTS: Payment[] = [
  {
    id: '1',
    patientId: '1',
    appointmentId: '1',
    valor: 250,
    descricao: 'Consulta de retorno',
    formaPagamento: 'pix',
    status: 'pago',
    dataPagamento: '2024-11-15',
    numeroRecibo: 'REC-2024-001',
    createdAt: '2024-11-15T11:00:00Z',
    updatedAt: '2024-11-15T11:00:00Z'
  },
  {
    id: '2',
    patientId: '3',
    valor: 200,
    descricao: 'Consulta',
    formaPagamento: 'cartao_credito',
    status: 'pendente',
    dataVencimento: today,
    createdAt: '2024-12-12T16:30:00Z',
    updatedAt: '2024-12-12T16:30:00Z'
  }
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    // Carregar dados do localStorage ou usar dados de demonstração
    const savedPatients = localStorage.getItem('clinica_patients');
    const savedAppointments = localStorage.getItem('clinica_appointments');
    const savedRecords = localStorage.getItem('clinica_records');
    const savedPayments = localStorage.getItem('clinica_payments');

    setPatients(savedPatients ? JSON.parse(savedPatients) : DEMO_PATIENTS);
    setAppointments(savedAppointments ? JSON.parse(savedAppointments) : DEMO_APPOINTMENTS);
    setMedicalRecords(savedRecords ? JSON.parse(savedRecords) : DEMO_MEDICAL_RECORDS);
    setPayments(savedPayments ? JSON.parse(savedPayments) : DEMO_PAYMENTS);
  }, []);

  // Persistir dados no localStorage
  useEffect(() => {
    if (patients.length > 0) {
      localStorage.setItem('clinica_patients', JSON.stringify(patients));
    }
  }, [patients]);

  useEffect(() => {
    if (appointments.length > 0) {
      localStorage.setItem('clinica_appointments', JSON.stringify(appointments));
    }
  }, [appointments]);

  useEffect(() => {
    if (medicalRecords.length > 0) {
      localStorage.setItem('clinica_records', JSON.stringify(medicalRecords));
    }
  }, [medicalRecords]);

  useEffect(() => {
    if (payments.length > 0) {
      localStorage.setItem('clinica_payments', JSON.stringify(payments));
    }
  }, [payments]);

  // Funções de Pacientes
  const addPatient = (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newPatient: Patient = {
      ...patientData,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    };
    setPatients(prev => [...prev, newPatient]);
    return newPatient;
  };

  const updatePatient = (id: string, patientData: Partial<Patient>) => {
    setPatients(prev => prev.map(p =>
      p.id === id
        ? { ...p, ...patientData, updatedAt: new Date().toISOString() }
        : p
    ));
  };

  const deletePatient = (id: string) => {
    setPatients(prev => prev.filter(p => p.id !== id));
  };

  const getPatient = (id: string) => patients.find(p => p.id === id);

  // Funções de Consultas
  const addAppointment = (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newAppointment: Appointment = {
      ...appointmentData,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    };
    setAppointments(prev => [...prev, newAppointment]);
    return newAppointment;
  };

  const updateAppointment = (id: string, appointmentData: Partial<Appointment>) => {
    setAppointments(prev => prev.map(a =>
      a.id === id
        ? { ...a, ...appointmentData, updatedAt: new Date().toISOString() }
        : a
    ));
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  const getAppointment = (id: string) => appointments.find(a => a.id === id);

  const getAppointmentsByDate = (date: string) =>
    appointments
      .filter(a => a.data === date)
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

  const getAppointmentsByPatient = (patientId: string) =>
    appointments.filter(a => a.patientId === patientId);

  // Funções de Prontuários
  const addMedicalRecord = (recordData: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newRecord: MedicalRecord = {
      ...recordData,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    };
    setMedicalRecords(prev => [...prev, newRecord]);
    return newRecord;
  };

  const updateMedicalRecord = (id: string, recordData: Partial<MedicalRecord>) => {
    setMedicalRecords(prev => prev.map(r =>
      r.id === id
        ? { ...r, ...recordData, updatedAt: new Date().toISOString() }
        : r
    ));
  };

  const getMedicalRecordsByPatient = (patientId: string) =>
    medicalRecords.filter(r => r.patientId === patientId);

  // Funções de Pagamentos
  const addPayment = (paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newPayment: Payment = {
      ...paymentData,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    };
    setPayments(prev => [...prev, newPayment]);
    return newPayment;
  };

  const updatePayment = (id: string, paymentData: Partial<Payment>) => {
    setPayments(prev => prev.map(p =>
      p.id === id
        ? { ...p, ...paymentData, updatedAt: new Date().toISOString() }
        : p
    ));
  };

  const getPaymentsByPatient = (patientId: string) =>
    payments.filter(p => p.patientId === patientId);

  // Dashboard Stats
  const getDashboardStats = (): DashboardStats => {
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
  };

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

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData deve ser usado dentro de um DataProvider');
  }
  return context;
}

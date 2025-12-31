// Tipos baseados em padrões de sistemas EHR (Electronic Health Records)
// Referência: HL7 FHIR (Fast Healthcare Interoperability Resources)

export type UserRole = 'medico' | 'secretaria';

export interface User {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  crm?: string; // Apenas para médicos
}

export interface Patient {
  id: string;
  nome: string;
  cpf: string;
  dataNascimento: string;
  sexo: 'M' | 'F' | 'O';
  telefone: string;
  email?: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  convenio?: {
    nome: string;
    numero: string;
    validade: string;
  };
  alergias?: string[];
  medicamentosEmUso?: string[];
  historicoFamiliar?: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentStatus =
  | 'agendada'      // Agendada
  | 'confirmada'    // Confirmada pelo paciente
  | 'aguardando'    // Paciente na sala de espera
  | 'em_atendimento'// Em atendimento
  | 'finalizada'    // Consulta finalizada
  | 'cancelada'     // Cancelada
  | 'faltou';       // Paciente não compareceu

export type AppointmentType =
  | 'primeira_consulta'
  | 'retorno'
  | 'urgencia'
  | 'exame'
  | 'procedimento';

export interface Appointment {
  id: string;
  patientId: string;
  patient?: Patient;
  data: string;
  horaInicio: string;
  horaFim: string;
  tipo: AppointmentType;
  status: AppointmentStatus;
  motivo?: string;
  observacoes?: string;
  valor?: number;
  convenio?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Prontuário Eletrônico baseado em SOAP (Subjetivo, Objetivo, Avaliação, Plano)
// Metodologia amplamente aceita na literatura médica
// Referência: CFM Resolução 1638/2002, HL7 FHIR R4, SBIS

export type TipoAtendimento =
  | 'consulta'
  | 'retorno'
  | 'urgencia'
  | 'emergencia'
  | 'teleconsulta'
  | 'procedimento'
  | 'avaliacao_pre_operatoria'
  | 'pos_operatorio';

export type EstadoGeral =
  | 'bom'
  | 'regular'
  | 'ruim'
  | 'grave'
  | 'gravissimo';

export type NivelConsciencia =
  | 'consciente_orientado'
  | 'consciente_desorientado'
  | 'sonolento'
  | 'torporoso'
  | 'comatoso';

export interface MedicalRecord {
  id: string;
  patientId: string;
  appointmentId?: string;
  data: string;

  // Informações gerais do atendimento
  tipoAtendimento?: TipoAtendimento;
  localAtendimento?: string;
  medicoResponsavel?: string;
  crmMedico?: string;
  duracaoConsulta?: number; // em minutos

  // SOAP Notes - Método padronizado de documentação clínica
  subjetivo: {
    queixaPrincipal: string;
    duracaoSintomas?: string;
    historicoDoencaAtual: string;
    fatoresMelhora?: string;
    fatoresPiora?: string;
    sintomasAssociados?: string;
    tratamentosPrevios?: string;
    impactoQualidadeVida?: string;
    revisaoSistemas?: string;
    // Anamnese complementar
    habitosVida?: {
      tabagismo?: string;
      etilismo?: string;
      atividadeFisica?: string;
      alimentacao?: string;
      sono?: string;
      estresse?: string;
    };
    historicoPatologicoPregrasso?: string;
    cirurgiasAnteriores?: string[];
    internacoesPrevias?: string;
    vacinacao?: string;
  };

  objetivo: {
    estadoGeral?: EstadoGeral;
    nivelConsciencia?: NivelConsciencia;
    escalaGlasgow?: number;

    sinaisVitais: {
      pressaoArterial?: string;
      pressaoArterialDeitado?: string;
      pressaoArterialEmPe?: string;
      frequenciaCardiaca?: number;
      frequenciaRespiratoria?: number;
      temperatura?: number;
      saturacaoO2?: number;
      peso?: number;
      altura?: number;
      imc?: number;
      circunferenciaAbdominal?: number;
      circunferenciaPescoco?: number;
      glicemiaCapilar?: number;
      escalaDor?: number; // EVA 0-10
    };

    // Exame físico estruturado por sistemas
    exameFisicoGeral?: string;
    exameFisico: string;
    exameFisicoDetalhado?: {
      cabecaPescoco?: string;
      olhos?: string;
      ouvidos?: string;
      nariz?: string;
      boca?: string;
      tireoide?: string;
      cardiovascular?: string;
      pulmonar?: string;
      abdome?: string;
      genitourinario?: string;
      musculoesqueletico?: string;
      neurologico?: string;
      pele?: string;
      extremidades?: string;
      linfatico?: string;
      psiquiatrico?: string;
    };

    examesComplementares?: string;
    resultadosExames?: {
      nome: string;
      data: string;
      resultado: string;
      valorReferencia?: string;
      observacao?: string;
    }[];
  };

  avaliacao: {
    hipotesesDiagnosticas: string[];
    diagnosticoPrincipal?: string;
    diagnosticosSecundarios?: string[];
    cid10?: string[]; // Classificação Internacional de Doenças - OBRIGATÓRIO
    diagnosticoDiferencial?: string[];
    gravidade?: 'leve' | 'moderada' | 'grave' | 'critica';
    estadiamento?: string;
    prognostico?: string;
    riscoCircurgico?: string;
    classificacaoRisco?: string; // Manchester, ESI, etc.
  };

  plano: {
    conduta: string;
    prescricoes?: Prescription[];
    prescricoesNaoMedicamentosas?: string[];
    solicitacaoExames?: string[];
    procedimentosRealizados?: {
      nome: string;
      descricao?: string;
      materiaisUtilizados?: string;
      intercorrencias?: string;
    }[];
    encaminhamentos?: {
      especialidade: string;
      motivo: string;
      urgencia?: 'eletivo' | 'urgente' | 'emergencia';
      profissionalDestino?: string;
    }[];

    // Atestados e documentos
    atestadoEmitido?: boolean;
    tipoAtestado?: 'atestado_medico' | 'declaracao_comparecimento' | 'laudo';
    diasAfastamento?: number;

    // Acompanhamento
    retorno?: string;
    dataRetorno?: string;
    metasTerapeuticas?: string[];
    alertasCuidados?: string[];
    orientacoes?: string;
    orientacoesAlimentares?: string;
    restricoesAtividades?: string;

    // Plano terapêutico
    objetivosTratamento?: string;
    duracaoEstimadaTratamento?: string;
    criteriosAlta?: string;
  };

  // Informações adicionais
  intercorrencias?: string;
  observacoesEnfermagem?: string;
  consentimentoInformado?: boolean;
  termoConsentimento?: string;

  assinaturaDigital?: string;
  dataHoraAssinatura?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: string;
  medicamento: string;
  concentracao?: string;
  formaFarmaceutica: string;
  posologia: string;
  quantidade: string;
  duracao?: string;
  viaAdministracao?: string;
  usoControlado?: boolean;
  observacoes?: string;
}

export interface Atestado {
  id: string;
  patientId: string;
  medicalRecordId?: string;
  tipo: 'atestado_medico' | 'declaracao_comparecimento';
  dataEmissao: string;
  diasAfastamento?: number;
  cid10?: string;
  descricao: string;
  createdAt: string;
}

// Módulo Financeiro
export type PaymentStatus = 'pendente' | 'pago' | 'cancelado' | 'reembolsado';
export type PaymentMethod = 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'convenio' | 'transferencia';

export interface Payment {
  id: string;
  patientId: string;
  appointmentId?: string;
  valor: number;
  descricao: string;
  formaPagamento: PaymentMethod;
  status: PaymentStatus;
  dataPagamento?: string;
  dataVencimento?: string;
  numeroRecibo?: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

// Dashboard e Estatísticas
export interface DashboardStats {
  consultasHoje: number;
  consultasSemana: number;
  consultasMes: number;
  pacientesTotal: number;
  pacientesNovos: number;
  receitaMes: number;
  receitaPendente: number;
  taxaComparecimento: number;
}

export interface ChartData {
  label: string;
  value: number;
}

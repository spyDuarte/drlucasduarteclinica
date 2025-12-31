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

  // NOVAS FUNCIONALIDADES
  // Lista de problemas ativos (problem list)
  activeProblems?: ActiveProblem[];
  // Alertas de segurança ativos
  safetyAlerts?: SafetyAlert[];

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
    // DEPRECATED: Use resultadosExamesDetalhados para novos registros
    resultadosExames?: {
      nome: string;
      data: string;
      resultado: string;
      valorReferencia?: string;
      observacao?: string;
    }[];
    // NOVO: Resultados com interpretação e referência a anexos
    resultadosExamesDetalhados?: ExamResult[];
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

  // NOVAS FUNCIONALIDADES
  // Sistema de anexos
  attachments?: MedicalRecordAttachment[];

  // Sistema de auditoria
  audit?: AuditLog;

  // Alertas de segurança gerados neste atendimento
  safetyAlertsGenerated?: string[]; // IDs dos alertas criados

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

// Sistema de Anexos e Documentos Médicos
export type AttachmentType =
  | 'exame_laboratorial'
  | 'exame_imagem'
  | 'laudo'
  | 'receita'
  | 'atestado'
  | 'termo_consentimento'
  | 'relatorio_medico'
  | 'outros';

export interface MedicalRecordAttachment {
  id: string;
  medicalRecordId: string;
  fileName: string;
  fileType: string; // MIME type: image/jpeg, application/pdf, etc
  fileSize: number; // em bytes
  fileData: string; // Base64 encoded
  attachmentType: AttachmentType;
  description?: string;
  uploadedAt: string;
  uploadedBy?: string;
}

// Sistema de Auditoria
export interface AuditLog {
  createdBy?: string; // ID ou nome do usuário
  createdAt: string;
  lastEditedBy?: string;
  lastEditedAt?: string;
  accessHistory?: {
    userId: string;
    userName: string;
    timestamp: string;
    action: 'view' | 'edit' | 'print' | 'export';
  }[];
  versions?: {
    version: number;
    timestamp: string;
    editedBy: string;
    changes: string; // Descrição das mudanças
    snapshot?: Partial<MedicalRecord>; // Snapshot dos dados antes da edição
  }[];
}

// Sistema de Alertas de Segurança
export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertType =
  | 'alergia'
  | 'medicacao'
  | 'condicao_cronica'
  | 'procedimento_risco'
  | 'interacao_medicamentosa'
  | 'valor_critico'
  | 'outro';

export interface SafetyAlert {
  id: string;
  patientId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  dateCreated: string;
  dateResolved?: string;
  isActive: boolean;
  relatedMedication?: string;
  relatedCondition?: string;
  actionRequired?: string;
}

// Lista de Problemas Ativos (Problem List)
export type ProblemStatus = 'ativo' | 'controlado' | 'resolvido' | 'inativo';
export type ProblemSeverity = 'leve' | 'moderada' | 'grave' | 'critica';

export interface ActiveProblem {
  id: string;
  patientId: string;
  cid10: string;
  description: string;
  dateOnset: string; // Data de início
  dateResolved?: string; // Data de resolução
  status: ProblemStatus;
  severity: ProblemSeverity;
  isPrimary: boolean; // Se é o problema principal
  notes?: string;
  relatedMedicalRecords?: string[]; // IDs dos prontuários relacionados
  currentTreatment?: string;
  goals?: string[];
}

// Validações Clínicas de Valores Críticos
export interface VitalSignValidation {
  field: string;
  displayName: string;
  unit: string;
  minNormal?: number;
  maxNormal?: number;
  minCritical?: number;
  maxCritical?: number;
  minValue?: number; // Valor absoluto mínimo permitido
  maxValue?: number; // Valor absoluto máximo permitido
}

// Base de Dados de Medicamentos (simplificada)
export interface MedicationInfo {
  name: string;
  concentrations: string[];
  maxDailyDose?: string;
  contraindications?: string[];
  interactions?: string[]; // Nomes de outros medicamentos
  sideEffects?: string[];
  isControlled: boolean;
  isPsychotropic: boolean;
  category?: string;
}

// Templates de Orientações
export type OrientationType = 'geral' | 'alimentar' | 'medicacao' | 'atividade_fisica' | 'retorno' | 'cuidados_especiais';

export interface OrientationTemplate {
  id: string;
  type: OrientationType;
  title: string;
  content: string;
  applicableConditions?: string[]; // CIDs relacionados
  tags?: string[];
}

// Resultados de Exames Expandidos
export interface ExamResult {
  id: string;
  name: string;
  date: string;
  result: string;
  referenceValue?: string;
  unit?: string;
  interpretation?: 'normal' | 'alterado_leve' | 'alterado_moderado' | 'alterado_grave' | 'critico';
  notes?: string;
  attachmentId?: string; // Referência ao anexo do resultado
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

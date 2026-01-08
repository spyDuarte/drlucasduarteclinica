import type { MedicalRecord } from '../../types';

export interface MedicalRecordFormData {
  // Informações gerais
  data: string;
  tipoAtendimento: string;
  localAtendimento: string;

  // Subjetivo
  queixaPrincipal: string;
  duracaoSintomas: string;
  historicoDoencaAtual: string;
  fatoresMelhora: string;
  fatoresPiora: string;
  sintomasAssociados: string;
  tratamentosPrevios: string;
  impactoQualidadeVida: string;
  revisaoSistemas: string;
  dataInicioSintomas: string;
  historicoFamiliar: string;
  // Hábitos de vida
  tabagismo: string;
  etilismo: string;
  atividadeFisica: string;
  alimentacao: string;
  sono: string;
  estresse: string;
  // Histórico
  historicoPatologicoPregrasso: string;
  cirurgiasAnteriores: string;
  internacoesPrevias: string;
  vacinacao: string;
  alergias: string; // Adicionado

  // Objetivo
  estadoGeral: string;
  nivelConsciencia: string;
  escalaGlasgow: string;
  pressaoArterial: string;
  pressaoArterialDeitado: string;
  pressaoArterialEmPe: string;
  frequenciaCardiaca: string;
  frequenciaRespiratoria: string;
  temperatura: string;
  saturacaoO2: string;
  peso: string;
  altura: string;
  circunferenciaAbdominal: string;
  circunferenciaPescoco: string;
  glicemiaCapilar: string;
  escalaDor: string;
  exameFisico: string;
  // Exame físico detalhado
  exameCabecaPescoco: string;
  exameOlhos: string;
  exameOuvidos: string;
  exameBoca: string;
  exameCardiovascular: string;
  examePulmonar: string;
  exameAbdome: string;
  exameNeurologico: string;
  examePele: string;
  exameExtremidades: string;
  exameMusculoesqueletico: string;
  examePsiquiatrico: string;
  examesComplementares: string;

  // Avaliação
  hipotesesDiagnosticas: string;
  diagnosticoPrincipal: string;
  diagnosticosSecundarios: string;
  cid10: string;
  diagnosticoDiferencial: string;
  gravidade: string;
  prognostico: string;
  classificacaoRisco: string;

  // Plano
  conduta: string;
  prescricoes: PrescriptionData[];
  prescricoesNaoMedicamentosas: string;
  solicitacaoExames: string;
  procedimentosRealizados: string;
  encaminhamentos: string;
  atestadoEmitido: boolean;
  tipoAtestado: string;
  diasAfastamento: string;
  retorno: string;
  dataRetorno: string;
  metasTerapeuticas: string;
  alertasCuidados: string;
  orientacoes: string;
  orientacoesAlimentares: string;
  restricoesAtividades: string;
  objetivosTratamento: string;

  // Informações adicionais
  intercorrencias: string;
  consentimentoInformado: boolean;
}

export interface PrescriptionData {
  id?: string;
  medicamento: string;
  concentracao: string;
  formaFarmaceutica: string;
  posologia: string;
  quantidade: string;
  duracao: string;
  viaAdministracao: string;
  usoControlado: boolean;
}

export interface ExpandedSections {
  habitosVida: boolean;
  historicoPregrasso: boolean;
  exameFisicoDetalhado: boolean;
  documentos: boolean;
  planoTerapeutico: boolean;
  historico?: boolean;
  problemas?: boolean;
}

export interface AppointmentTypeInfo {
  label: string;
  class: string;
}

export const APPOINTMENT_TYPES: Record<string, AppointmentTypeInfo> = {
  consulta: { label: 'Consulta', class: 'type-consulta' },
  retorno: { label: 'Retorno', class: 'type-retorno' },
  urgencia: { label: 'Urgência', class: 'type-urgencia' },
  emergencia: { label: 'Emergência', class: 'type-emergencia' },
  teleconsulta: { label: 'Teleconsulta', class: 'type-teleconsulta' },
  procedimento: { label: 'Procedimento', class: 'type-procedimento' },
  avaliacao_pre_operatoria: { label: 'Pré-operatório', class: 'type-pre-op' },
  pos_operatorio: { label: 'Pós-operatório', class: 'type-pos-op' }
};

export function getAppointmentTypeLabel(type: string): AppointmentTypeInfo {
  return APPOINTMENT_TYPES[type] || { label: type, class: 'type-consulta' };
}

export function createInitialFormData(record: MedicalRecord | null): MedicalRecordFormData {
  return {
    data: record?.data || new Date().toISOString().split('T')[0],
    tipoAtendimento: record?.tipoAtendimento || 'consulta',
    localAtendimento: record?.localAtendimento || '',
    queixaPrincipal: record?.subjetivo?.queixaPrincipal || '',
    duracaoSintomas: record?.subjetivo?.duracaoSintomas || '',
    historicoDoencaAtual: record?.subjetivo?.historicoDoencaAtual || '',
    fatoresMelhora: record?.subjetivo?.fatoresMelhora || '',
    fatoresPiora: record?.subjetivo?.fatoresPiora || '',
    sintomasAssociados: record?.subjetivo?.sintomasAssociados || '',
    tratamentosPrevios: record?.subjetivo?.tratamentosPrevios || '',
    impactoQualidadeVida: record?.subjetivo?.impactoQualidadeVida || '',
    revisaoSistemas: record?.subjetivo?.revisaoSistemas || '',
    dataInicioSintomas: record?.subjetivo?.dataInicioSintomas || '',
    historicoFamiliar: record?.subjetivo?.historicoFamiliar || '',
    tabagismo: record?.subjetivo?.habitosVida?.tabagismo || '',
    etilismo: record?.subjetivo?.habitosVida?.etilismo || '',
    atividadeFisica: record?.subjetivo?.habitosVida?.atividadeFisica || '',
    alimentacao: record?.subjetivo?.habitosVida?.alimentacao || '',
    sono: record?.subjetivo?.habitosVida?.sono || '',
    estresse: record?.subjetivo?.habitosVida?.estresse || '',
    historicoPatologicoPregrasso: record?.subjetivo?.historicoPatologicoPregrasso || '',
    cirurgiasAnteriores: record?.subjetivo?.cirurgiasAnteriores?.join(', ') || '',
    internacoesPrevias: record?.subjetivo?.internacoesPrevias || '',
    vacinacao: record?.subjetivo?.vacinacao || '',
    alergias: '', // Inicializando
    estadoGeral: record?.objetivo?.estadoGeral || '',
    nivelConsciencia: record?.objetivo?.nivelConsciencia || '',
    escalaGlasgow: record?.objetivo?.escalaGlasgow?.toString() || '',
    pressaoArterial: record?.objetivo?.sinaisVitais?.pressaoArterial || '',
    pressaoArterialDeitado: record?.objetivo?.sinaisVitais?.pressaoArterialDeitado || '',
    pressaoArterialEmPe: record?.objetivo?.sinaisVitais?.pressaoArterialEmPe || '',
    frequenciaCardiaca: record?.objetivo?.sinaisVitais?.frequenciaCardiaca?.toString() || '',
    frequenciaRespiratoria: record?.objetivo?.sinaisVitais?.frequenciaRespiratoria?.toString() || '',
    temperatura: record?.objetivo?.sinaisVitais?.temperatura?.toString() || '',
    saturacaoO2: record?.objetivo?.sinaisVitais?.saturacaoO2?.toString() || '',
    peso: record?.objetivo?.sinaisVitais?.peso?.toString() || '',
    altura: record?.objetivo?.sinaisVitais?.altura?.toString() || '',
    circunferenciaAbdominal: record?.objetivo?.sinaisVitais?.circunferenciaAbdominal?.toString() || '',
    circunferenciaPescoco: record?.objetivo?.sinaisVitais?.circunferenciaPescoco?.toString() || '',
    glicemiaCapilar: record?.objetivo?.sinaisVitais?.glicemiaCapilar?.toString() || '',
    escalaDor: record?.objetivo?.sinaisVitais?.escalaDor?.toString() || '',
    exameFisico: record?.objetivo?.exameFisico || '',
    exameCabecaPescoco: record?.objetivo?.exameFisicoDetalhado?.cabecaPescoco || '',
    exameOlhos: record?.objetivo?.exameFisicoDetalhado?.olhos || '',
    exameOuvidos: record?.objetivo?.exameFisicoDetalhado?.ouvidos || '',
    exameBoca: record?.objetivo?.exameFisicoDetalhado?.boca || '',
    exameCardiovascular: record?.objetivo?.exameFisicoDetalhado?.cardiovascular || '',
    examePulmonar: record?.objetivo?.exameFisicoDetalhado?.pulmonar || '',
    exameAbdome: record?.objetivo?.exameFisicoDetalhado?.abdome || '',
    exameNeurologico: record?.objetivo?.exameFisicoDetalhado?.neurologico || '',
    examePele: record?.objetivo?.exameFisicoDetalhado?.pele || '',
    exameExtremidades: record?.objetivo?.exameFisicoDetalhado?.extremidades || '',
    exameMusculoesqueletico: record?.objetivo?.exameFisicoDetalhado?.musculoesqueletico || '',
    examePsiquiatrico: record?.objetivo?.exameFisicoDetalhado?.psiquiatrico || '',
    examesComplementares: record?.objetivo?.examesComplementares || '',
    hipotesesDiagnosticas: record?.avaliacao?.hipotesesDiagnosticas?.join(', ') || '',
    diagnosticoPrincipal: record?.avaliacao?.diagnosticoPrincipal || '',
    diagnosticosSecundarios: record?.avaliacao?.diagnosticosSecundarios?.join(', ') || '',
    cid10: record?.avaliacao?.cid10?.join(', ') || '',
    diagnosticoDiferencial: record?.avaliacao?.diagnosticoDiferencial?.join(', ') || '',
    gravidade: record?.avaliacao?.gravidade || '',
    prognostico: record?.avaliacao?.prognostico || '',
    classificacaoRisco: record?.avaliacao?.classificacaoRisco || '',
    conduta: record?.plano?.conduta || '',
    prescricoes: record?.plano?.prescricoes?.map(p => ({
      ...p,
      concentracao: p.concentracao || '',
      duracao: p.duracao || '',
      viaAdministracao: p.viaAdministracao || '',
      usoControlado: p.usoControlado || false
    })) || [],
    prescricoesNaoMedicamentosas: record?.plano?.prescricoesNaoMedicamentosas?.join(', ') || '',
    solicitacaoExames: record?.plano?.solicitacaoExames?.join(', ') || '',
    procedimentosRealizados: record?.plano?.procedimentosRealizados?.map(p => p.nome).join(', ') || '',
    encaminhamentos: record?.plano?.encaminhamentos?.map(e => `${e.especialidade}: ${e.motivo}`).join('; ') || '',
    atestadoEmitido: record?.plano?.atestadoEmitido || false,
    tipoAtestado: record?.plano?.tipoAtestado || '',
    diasAfastamento: record?.plano?.diasAfastamento?.toString() || '',
    retorno: record?.plano?.retorno || '',
    dataRetorno: record?.plano?.dataRetorno || '',
    metasTerapeuticas: record?.plano?.metasTerapeuticas?.join(', ') || '',
    alertasCuidados: record?.plano?.alertasCuidados?.join(', ') || '',
    orientacoes: record?.plano?.orientacoes || '',
    orientacoesAlimentares: record?.plano?.orientacoesAlimentares || '',
    restricoesAtividades: record?.plano?.restricoesAtividades || '',
    objetivosTratamento: record?.plano?.objetivosTratamento || '',
    intercorrencias: record?.intercorrencias || '',
    consentimentoInformado: record?.consentimentoInformado || false
  };
}

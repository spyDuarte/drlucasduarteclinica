import { useState, useCallback } from 'react';
import type { MedicalRecord } from '../../types';
import type { MedicalRecordFormData, PrescriptionData, ExpandedSections } from './types';
import { createInitialFormData } from './types';

const INITIAL_PRESCRIPTION: PrescriptionData = {
  medicamento: '',
  concentracao: '',
  formaFarmaceutica: 'Comprimido',
  posologia: '',
  quantidade: '',
  duracao: '',
  viaAdministracao: 'Oral',
  usoControlado: false
};

const INITIAL_SECTIONS: ExpandedSections = {
  habitosVida: false,
  historicoPregrasso: false,
  exameFisicoDetalhado: false,
  documentos: false,
  planoTerapeutico: false,
  historico: false,
  problemas: true
};

export interface FormErrors {
  queixaPrincipal?: string;
  cid10?: string;
  conduta?: string;
}

export function useMedicalRecordForm(record: MedicalRecord | null) {
  const [formData, setFormData] = useState<MedicalRecordFormData>(() =>
    createInitialFormData(record)
  );

  const [newPrescription, setNewPrescription] = useState<PrescriptionData>(INITIAL_PRESCRIPTION);
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>(INITIAL_SECTIONS);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const updateField = useCallback(<K extends keyof MedicalRecordFormData>(
    field: K,
    value: MedicalRecordFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpa o erro do campo quando o usuário editar
    if (field in formErrors) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [formErrors]);

  const clearError = useCallback((field: keyof FormErrors) => {
    setFormErrors(prev => ({ ...prev, [field]: undefined }));
  }, []);

  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};

    if (!formData.queixaPrincipal.trim()) {
      errors.queixaPrincipal = 'Queixa principal é obrigatória';
    }

    if (!formData.cid10.trim()) {
      errors.cid10 = 'CID-10 é obrigatório para o registro do atendimento';
    } else {
      // Validação básica do formato CID-10 (letra seguida de números)
      const cids = formData.cid10.split(',').map(c => c.trim()).filter(Boolean);
      const invalidCids = cids.filter(cid => !/^[A-Z]\d{2,3}(\.\d{1,2})?$/i.test(cid));
      if (invalidCids.length > 0) {
        errors.cid10 = `Formato de CID-10 inválido: ${invalidCids.join(', ')}. Use formato: A00, B12.3, etc.`;
      }
    }

    if (!formData.conduta.trim()) {
      errors.conduta = 'Conduta é obrigatória';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const toggleSection = useCallback((section: keyof ExpandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const addPrescription = useCallback(() => {
    if (newPrescription.medicamento && newPrescription.posologia) {
      setFormData(prev => ({
        ...prev,
        prescricoes: [...prev.prescricoes, { ...newPrescription, id: Date.now().toString() }]
      }));
      setNewPrescription(INITIAL_PRESCRIPTION);
    }
  }, [newPrescription]);

  const removePrescription = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      prescricoes: prev.prescricoes.filter((_, i) => i !== index)
    }));
  }, []);

  const buildRecordData = useCallback((patientId: string): Partial<MedicalRecord> => {
    const peso = formData.peso ? parseFloat(formData.peso) : undefined;
    const altura = formData.altura ? parseFloat(formData.altura) : undefined;
    const imc = peso && altura ? parseFloat((peso / ((altura/100) ** 2)).toFixed(1)) : undefined;

    const encaminhamentosProcessados = formData.encaminhamentos
      ? formData.encaminhamentos.split(';').map(e => {
          const parts = e.split(':').map(p => p.trim());
          return { especialidade: parts[0] || '', motivo: parts[1] || '' };
        }).filter(e => e.especialidade)
      : undefined;

    const procedimentosProcessados = formData.procedimentosRealizados
      ? formData.procedimentosRealizados.split(',').map(p => ({ nome: p.trim() })).filter(p => p.nome)
      : undefined;

    return {
      patientId,
      data: formData.data,
      tipoAtendimento: formData.tipoAtendimento as MedicalRecord['tipoAtendimento'] || undefined,
      localAtendimento: formData.localAtendimento || undefined,

      subjetivo: {
        queixaPrincipal: formData.queixaPrincipal,
        duracaoSintomas: formData.duracaoSintomas || undefined,
        historicoDoencaAtual: formData.historicoDoencaAtual,
        fatoresMelhora: formData.fatoresMelhora || undefined,
        fatoresPiora: formData.fatoresPiora || undefined,
        sintomasAssociados: formData.sintomasAssociados || undefined,
        tratamentosPrevios: formData.tratamentosPrevios || undefined,
        impactoQualidadeVida: formData.impactoQualidadeVida || undefined,
        revisaoSistemas: formData.revisaoSistemas || undefined,
        dataInicioSintomas: formData.dataInicioSintomas || undefined,
        historicoFamiliar: formData.historicoFamiliar || undefined,
        habitosVida: (formData.tabagismo || formData.etilismo || formData.atividadeFisica || formData.alimentacao || formData.sono || formData.estresse) ? {
          tabagismo: formData.tabagismo || undefined,
          etilismo: formData.etilismo || undefined,
          atividadeFisica: formData.atividadeFisica || undefined,
          alimentacao: formData.alimentacao || undefined,
          sono: formData.sono || undefined,
          estresse: formData.estresse || undefined
        } : undefined,
        historicoPatologicoPregrasso: formData.historicoPatologicoPregrasso || undefined,
        cirurgiasAnteriores: formData.cirurgiasAnteriores ? formData.cirurgiasAnteriores.split(',').map(c => c.trim()).filter(Boolean) : undefined,
        internacoesPrevias: formData.internacoesPrevias || undefined,
        vacinacao: formData.vacinacao || undefined
      },

      objetivo: {
        estadoGeral: formData.estadoGeral as MedicalRecord['objetivo']['estadoGeral'] || undefined,
        nivelConsciencia: formData.nivelConsciencia as MedicalRecord['objetivo']['nivelConsciencia'] || undefined,
        escalaGlasgow: formData.escalaGlasgow ? parseInt(formData.escalaGlasgow) : undefined,
        sinaisVitais: {
          pressaoArterial: formData.pressaoArterial || undefined,
          pressaoArterialDeitado: formData.pressaoArterialDeitado || undefined,
          pressaoArterialEmPe: formData.pressaoArterialEmPe || undefined,
          frequenciaCardiaca: formData.frequenciaCardiaca ? parseInt(formData.frequenciaCardiaca) : undefined,
          frequenciaRespiratoria: formData.frequenciaRespiratoria ? parseInt(formData.frequenciaRespiratoria) : undefined,
          temperatura: formData.temperatura ? parseFloat(formData.temperatura) : undefined,
          saturacaoO2: formData.saturacaoO2 ? parseInt(formData.saturacaoO2) : undefined,
          peso,
          altura,
          imc,
          circunferenciaAbdominal: formData.circunferenciaAbdominal ? parseFloat(formData.circunferenciaAbdominal) : undefined,
          circunferenciaPescoco: formData.circunferenciaPescoco ? parseFloat(formData.circunferenciaPescoco) : undefined,
          glicemiaCapilar: formData.glicemiaCapilar ? parseInt(formData.glicemiaCapilar) : undefined,
          escalaDor: formData.escalaDor ? parseInt(formData.escalaDor) : undefined
        },
        exameFisico: formData.exameFisico,
        exameFisicoDetalhado: (formData.exameCabecaPescoco || formData.exameOlhos || formData.exameOuvidos || formData.exameBoca || formData.exameCardiovascular || formData.examePulmonar || formData.exameAbdome || formData.exameNeurologico || formData.examePele || formData.exameExtremidades || formData.exameMusculoesqueletico || formData.examePsiquiatrico) ? {
          cabecaPescoco: formData.exameCabecaPescoco || undefined,
          olhos: formData.exameOlhos || undefined,
          ouvidos: formData.exameOuvidos || undefined,
          boca: formData.exameBoca || undefined,
          cardiovascular: formData.exameCardiovascular || undefined,
          pulmonar: formData.examePulmonar || undefined,
          abdome: formData.exameAbdome || undefined,
          neurologico: formData.exameNeurologico || undefined,
          pele: formData.examePele || undefined,
          extremidades: formData.exameExtremidades || undefined,
          musculoesqueletico: formData.exameMusculoesqueletico || undefined,
          psiquiatrico: formData.examePsiquiatrico || undefined
        } : undefined,
        examesComplementares: formData.examesComplementares || undefined
      },

      avaliacao: {
        hipotesesDiagnosticas: formData.hipotesesDiagnosticas.split(',').map(d => d.trim()).filter(Boolean),
        diagnosticoPrincipal: formData.diagnosticoPrincipal || undefined,
        diagnosticosSecundarios: formData.diagnosticosSecundarios ? formData.diagnosticosSecundarios.split(',').map(d => d.trim()).filter(Boolean) : undefined,
        cid10: formData.cid10 ? formData.cid10.split(',').map(c => c.trim()).filter(Boolean) : undefined,
        diagnosticoDiferencial: formData.diagnosticoDiferencial ? formData.diagnosticoDiferencial.split(',').map(d => d.trim()).filter(Boolean) : undefined,
        gravidade: formData.gravidade as MedicalRecord['avaliacao']['gravidade'] || undefined,
        prognostico: formData.prognostico || undefined,
        classificacaoRisco: formData.classificacaoRisco || undefined
      },

      plano: {
        conduta: formData.conduta,
        prescricoes: formData.prescricoes.length > 0 ? formData.prescricoes.map(p => ({
          ...p,
          id: p.id || Date.now().toString()
        })) : undefined,
        prescricoesNaoMedicamentosas: formData.prescricoesNaoMedicamentosas ? formData.prescricoesNaoMedicamentosas.split(',').map(p => p.trim()).filter(Boolean) : undefined,
        solicitacaoExames: formData.solicitacaoExames ? formData.solicitacaoExames.split(',').map(e => e.trim()).filter(Boolean) : undefined,
        procedimentosRealizados: procedimentosProcessados,
        encaminhamentos: encaminhamentosProcessados,
        atestadoEmitido: formData.atestadoEmitido || undefined,
        tipoAtestado: formData.tipoAtestado as MedicalRecord['plano']['tipoAtestado'] || undefined,
        diasAfastamento: formData.diasAfastamento ? parseInt(formData.diasAfastamento) : undefined,
        retorno: formData.retorno || undefined,
        dataRetorno: formData.dataRetorno || undefined,
        metasTerapeuticas: formData.metasTerapeuticas ? formData.metasTerapeuticas.split(',').map(m => m.trim()).filter(Boolean) : undefined,
        alertasCuidados: formData.alertasCuidados ? formData.alertasCuidados.split(',').map(a => a.trim()).filter(Boolean) : undefined,
        orientacoes: formData.orientacoes || undefined,
        orientacoesAlimentares: formData.orientacoesAlimentares || undefined,
        restricoesAtividades: formData.restricoesAtividades || undefined,
        objetivosTratamento: formData.objetivosTratamento || undefined
      },

      intercorrencias: formData.intercorrencias || undefined,
      consentimentoInformado: formData.consentimentoInformado || undefined
    };
  }, [formData]);

  return {
    formData,
    updateField,
    newPrescription,
    setNewPrescription,
    addPrescription,
    removePrescription,
    expandedSections,
    toggleSection,
    buildRecordData,
    formErrors,
    validateForm,
    clearError
  };
}

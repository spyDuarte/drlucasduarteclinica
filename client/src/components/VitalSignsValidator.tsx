import { AlertTriangle, AlertCircle, Info, Activity, Heart, Wind, Thermometer, Droplets } from 'lucide-react';
import { validateVitalSign, validateAllVitalSigns, calculateIMC, interpretBloodPressure } from '../utils/clinicalValidations';
import { useMemo, useEffect } from 'react';

interface VitalSignsValidatorProps {
  vitalSigns: {
    pressaoArterial?: string;
    frequenciaCardiaca?: number;
    frequenciaRespiratoria?: number;
    temperatura?: number;
    saturacaoO2?: number;
    peso?: number;
    altura?: number;
    glicemiaCapilar?: number;
    escalaDor?: number;
  };
  onAlertGenerated?: (alerts: Array<{ field: string; message: string; severity: string }>) => void;
}

export function VitalSignsValidator({ vitalSigns, onAlertGenerated }: VitalSignsValidatorProps) {
  const imcInfo = useMemo(() => {
    if (vitalSigns.peso && vitalSigns.altura) {
      return calculateIMC(vitalSigns.peso, vitalSigns.altura);
    }
    return null;
  }, [vitalSigns.peso, vitalSigns.altura]);

  const bpInfo = useMemo(() => {
    if (vitalSigns.pressaoArterial) {
      const paMatch = vitalSigns.pressaoArterial.match(/(\d+)\s*[x/]\s*(\d+)/);
      if (paMatch) {
        const systolic = parseInt(paMatch[1]);
        const diastolic = parseInt(paMatch[2]);
        return interpretBloodPressure(systolic, diastolic);
      }
    }
    return null;
  }, [vitalSigns.pressaoArterial]);

  const alerts = useMemo(() => {
    const validation = validateAllVitalSigns(vitalSigns);

    const newAlerts: Array<{ field: string; message: string; severity: string }> = [
      ...validation.criticalAlerts.map(a => ({ ...a, severity: 'critical' })),
      ...validation.warnings.map(w => ({ ...w, severity: 'warning' }))
    ];

    if (imcInfo && (imcInfo.risk === 'aumentado' || imcInfo.risk === 'alto' || imcInfo.risk === 'muito_alto')) {
      newAlerts.push({
        field: 'imc',
        message: `IMC ${imcInfo.imc} - ${imcInfo.classification} (Risco ${imcInfo.risk.replace('_', ' ')})`,
        severity: imcInfo.risk === 'muito_alto' ? 'warning' : 'info'
      });
    }

    if (bpInfo && bpInfo.severity !== 'normal') {
      newAlerts.push({
        field: 'pressaoArterial',
        message: `PA: ${bpInfo.classification}`,
        severity: bpInfo.severity
      });
    }

    return newAlerts;
  }, [vitalSigns, imcInfo, bpInfo]);

  useEffect(() => {
    if (onAlertGenerated && alerts.length > 0) {
      onAlertGenerated(alerts);
    }
  }, [alerts, onAlertGenerated]);

  if (alerts.length === 0 && !imcInfo && !bpInfo) {
    return null;
  }

  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const warnings = alerts.filter(a => a.severity === 'warning');
  const infos = alerts.filter(a => a.severity === 'info');

  return (
    <div className="space-y-3">
      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-red-900 mb-2">⚠️ VALORES CRÍTICOS DETECTADOS</h4>
              <ul className="space-y-1">
                {criticalAlerts.map((alert, index) => (
                  <li key={index} className="text-sm text-red-800 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                    {alert.message}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-red-700 mt-2 font-semibold">
                ⚕️ Atenção: Valores críticos requerem avaliação imediata e possível intervenção
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-amber-900 mb-2">Valores Alterados</h4>
              <ul className="space-y-1">
                {warnings.map((alert, index) => (
                  <li key={index} className="text-sm text-amber-800 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full"></span>
                    {alert.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Info/Recommendations */}
      {infos.length > 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-2">Informações Clínicas</h4>
              <ul className="space-y-1">
                {infos.map((alert, index) => (
                  <li key={index} className="text-sm text-blue-800 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                    {alert.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* BP Interpretation */}
      {bpInfo && bpInfo.severity !== 'normal' && (
        <div className={`rounded-lg p-4 border-l-4 ${
          bpInfo.severity === 'critical'
            ? 'bg-red-50 border-red-500'
            : 'bg-amber-50 border-amber-500'
        }`}>
          <div className="flex items-start gap-3">
            <Heart className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              bpInfo.severity === 'critical' ? 'text-red-600' : 'text-amber-600'
            }`} />
            <div className="flex-1">
              <h4 className={`font-semibold mb-2 ${
                bpInfo.severity === 'critical' ? 'text-red-900' : 'text-amber-900'
              }`}>
                Interpretação da Pressão Arterial: {bpInfo.classification}
              </h4>
              <div className="space-y-1">
                <p className={`text-sm font-medium ${
                  bpInfo.severity === 'critical' ? 'text-red-800' : 'text-amber-800'
                }`}>
                  Recomendações:
                </p>
                <ul className="space-y-1">
                  {bpInfo.recommendations.map((rec, index) => (
                    <li key={index} className={`text-sm flex items-start gap-2 ${
                      bpInfo.severity === 'critical' ? 'text-red-700' : 'text-amber-700'
                    }`}>
                      <span className="mt-1.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IMC Info */}
      {imcInfo && (imcInfo.risk === 'aumentado' || imcInfo.risk === 'alto' || imcInfo.risk === 'muito_alto') && (
        <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-indigo-900 mb-1">
                IMC: {imcInfo.imc} kg/m²
              </h4>
              <p className="text-sm text-indigo-800 mb-2">
                Classificação: {imcInfo.classification}
              </p>
              <div className="space-y-1">
                <p className="text-xs font-medium text-indigo-700">Orientações:</p>
                <ul className="text-xs text-indigo-700 space-y-0.5">
                  <li>• Avaliação nutricional recomendada</li>
                  <li>• Orientação sobre hábitos alimentares saudáveis</li>
                  <li>• Estímulo à atividade física regular (150 min/semana)</li>
                  <li>• Manter diário alimentar para identificar padrões</li>
                  {imcInfo.imc < 18.5 && (
                    <>
                      <li className="font-semibold">• Avaliar causas de baixo peso</li>
                      <li>• Aumentar ingestão calórica com alimentos nutritivos</li>
                      <li>• Considerar suplementação se necessário</li>
                    </>
                  )}
                  {imcInfo.risk === 'alto' && (
                    <>
                      <li className="font-semibold">• Avaliar comorbidades (diabetes, hipertensão)</li>
                      <li>• Meta: perda de 5-10% do peso em 6 meses</li>
                      <li>• Considerar acompanhamento multidisciplinar</li>
                    </>
                  )}
                  {imcInfo.risk === 'muito_alto' && (
                    <>
                      <li className="font-semibold">• Encaminhamento obrigatório para especialista</li>
                      <li>• Avaliar síndrome metabólica</li>
                      <li>• Considerar tratamento medicamentoso</li>
                      <li>• Avaliar indicação de cirurgia bariátrica</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orientações para Temperatura Alterada */}
      {vitalSigns.temperatura && (vitalSigns.temperatura < 36 || vitalSigns.temperatura > 37.5) && (
        <div className={`rounded-lg p-4 border-l-4 ${
          vitalSigns.temperatura > 38.5 || vitalSigns.temperatura < 35
            ? 'bg-red-50 border-red-500'
            : 'bg-amber-50 border-amber-500'
        }`}>
          <div className="flex items-start gap-3">
            <Thermometer className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              vitalSigns.temperatura > 38.5 || vitalSigns.temperatura < 35 ? 'text-red-600' : 'text-amber-600'
            }`} />
            <div className="flex-1">
              <h4 className={`font-semibold mb-2 ${
                vitalSigns.temperatura > 38.5 || vitalSigns.temperatura < 35 ? 'text-red-900' : 'text-amber-900'
              }`}>
                Orientações para Temperatura {vitalSigns.temperatura > 37.5 ? 'Elevada' : 'Baixa'}
              </h4>
              <ul className={`text-xs space-y-0.5 ${
                vitalSigns.temperatura > 38.5 || vitalSigns.temperatura < 35 ? 'text-red-700' : 'text-amber-700'
              }`}>
                {vitalSigns.temperatura > 37.5 ? (
                  <>
                    <li>• Aumentar ingesta hídrica (2-3L/dia)</li>
                    <li>• Repouso em ambiente ventilado</li>
                    <li>• Usar roupas leves</li>
                    <li>• Compressas mornas em axilas e virilha</li>
                    <li>• Antitérmico conforme prescrição (Dipirona/Paracetamol)</li>
                    {vitalSigns.temperatura > 38.5 && (
                      <>
                        <li className="font-semibold">• Investigar foco infeccioso</li>
                        <li className="font-semibold">• Considerar hemograma e PCR</li>
                      </>
                    )}
                    {vitalSigns.temperatura > 39 && (
                      <li className="font-bold">• ATENÇÃO: Febre alta - avaliar necessidade de internação</li>
                    )}
                  </>
                ) : (
                  <>
                    <li>• Aquecer paciente gradualmente</li>
                    <li>• Verificar glicemia capilar</li>
                    <li>• Avaliar hipotireoidismo</li>
                    <li>• Investigar sepse se outros sinais presentes</li>
                    {vitalSigns.temperatura < 35 && (
                      <li className="font-bold">• ATENÇÃO: Hipotermia - monitorização intensiva</li>
                    )}
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Orientações para Saturação Alterada */}
      {vitalSigns.saturacaoO2 && vitalSigns.saturacaoO2 < 95 && (
        <div className={`rounded-lg p-4 border-l-4 ${
          vitalSigns.saturacaoO2 < 90 ? 'bg-red-50 border-red-500' : 'bg-amber-50 border-amber-500'
        }`}>
          <div className="flex items-start gap-3">
            <Droplets className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              vitalSigns.saturacaoO2 < 90 ? 'text-red-600' : 'text-amber-600'
            }`} />
            <div className="flex-1">
              <h4 className={`font-semibold mb-2 ${
                vitalSigns.saturacaoO2 < 90 ? 'text-red-900' : 'text-amber-900'
              }`}>
                Orientações para Saturação de O2 Reduzida ({vitalSigns.saturacaoO2}%)
              </h4>
              <ul className={`text-xs space-y-0.5 ${
                vitalSigns.saturacaoO2 < 90 ? 'text-red-700' : 'text-amber-700'
              }`}>
                <li>• Manter paciente em posição sentada ou semi-sentada</li>
                <li>• Avaliar padrão respiratório e uso de musculatura acessória</li>
                <li>• Ausculta pulmonar detalhada</li>
                <li>• Verificar se paciente é portador de DPOC (alvo pode ser 88-92%)</li>
                {vitalSigns.saturacaoO2 < 92 && (
                  <>
                    <li className="font-semibold">• Considerar suplementação de O2</li>
                    <li>• Solicitar gasometria arterial</li>
                    <li>• Radiografia de tórax indicada</li>
                  </>
                )}
                {vitalSigns.saturacaoO2 < 90 && (
                  <>
                    <li className="font-bold">• URGÊNCIA: Iniciar oxigenoterapia imediata</li>
                    <li className="font-bold">• Considerar suporte ventilatório</li>
                    <li className="font-bold">• Avaliar necessidade de UTI</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Orientações para Glicemia Alterada */}
      {vitalSigns.glicemiaCapilar && (vitalSigns.glicemiaCapilar < 70 || vitalSigns.glicemiaCapilar > 180) && (
        <div className={`rounded-lg p-4 border-l-4 ${
          vitalSigns.glicemiaCapilar < 50 || vitalSigns.glicemiaCapilar > 300
            ? 'bg-red-50 border-red-500'
            : 'bg-amber-50 border-amber-500'
        }`}>
          <div className="flex items-start gap-3">
            <Activity className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              vitalSigns.glicemiaCapilar < 50 || vitalSigns.glicemiaCapilar > 300 ? 'text-red-600' : 'text-amber-600'
            }`} />
            <div className="flex-1">
              <h4 className={`font-semibold mb-2 ${
                vitalSigns.glicemiaCapilar < 50 || vitalSigns.glicemiaCapilar > 300 ? 'text-red-900' : 'text-amber-900'
              }`}>
                Orientações para Glicemia {vitalSigns.glicemiaCapilar < 70 ? 'Baixa' : 'Elevada'} ({vitalSigns.glicemiaCapilar} mg/dL)
              </h4>
              <ul className={`text-xs space-y-0.5 ${
                vitalSigns.glicemiaCapilar < 50 || vitalSigns.glicemiaCapilar > 300 ? 'text-red-700' : 'text-amber-700'
              }`}>
                {vitalSigns.glicemiaCapilar < 70 ? (
                  <>
                    <li>• Administrar 15g de carboidrato de rápida absorção</li>
                    <li>• Exemplos: 1 colher de sopa de açúcar, 150ml de suco, 3 balas</li>
                    <li>• Repetir glicemia em 15 minutos</li>
                    <li>• Se não melhorar, repetir carboidrato</li>
                    {vitalSigns.glicemiaCapilar < 50 && (
                      <>
                        <li className="font-bold">• HIPOGLICEMIA GRAVE - Risco de convulsão</li>
                        <li className="font-bold">• Se inconsciente: Glucagon IM ou Glicose IV</li>
                        <li className="font-bold">• NÃO administrar nada por via oral se inconsciente</li>
                      </>
                    )}
                    <li>• Investigar causa: jejum, excesso de medicação, exercício</li>
                    <li>• Revisar doses de insulina/antidiabéticos</li>
                  </>
                ) : (
                  <>
                    <li>• Verificar adesão ao tratamento</li>
                    <li>• Avaliar dieta e atividade física recente</li>
                    <li>• Aumentar hidratação oral</li>
                    {vitalSigns.glicemiaCapilar > 250 && (
                      <>
                        <li className="font-semibold">• Pesquisar cetonúria</li>
                        <li className="font-semibold">• Avaliar necessidade de insulina de correção</li>
                      </>
                    )}
                    {vitalSigns.glicemiaCapilar > 300 && (
                      <>
                        <li className="font-bold">• HIPERGLICEMIA GRAVE</li>
                        <li className="font-bold">• Risco de cetoacidose diabética</li>
                        <li className="font-bold">• Considerar internação hospitalar</li>
                        <li className="font-bold">• Solicitar gasometria, eletrólitos</li>
                      </>
                    )}
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Orientações para Dor Intensa */}
      {vitalSigns.escalaDor !== undefined && vitalSigns.escalaDor >= 4 && (
        <div className={`rounded-lg p-4 border-l-4 ${
          vitalSigns.escalaDor >= 7 ? 'bg-red-50 border-red-500' : 'bg-amber-50 border-amber-500'
        }`}>
          <div className="flex items-start gap-3">
            <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              vitalSigns.escalaDor >= 7 ? 'text-red-600' : 'text-amber-600'
            }`} />
            <div className="flex-1">
              <h4 className={`font-semibold mb-2 ${
                vitalSigns.escalaDor >= 7 ? 'text-red-900' : 'text-amber-900'
              }`}>
                Manejo da Dor - Intensidade {vitalSigns.escalaDor}/10
              </h4>
              <ul className={`text-xs space-y-0.5 ${
                vitalSigns.escalaDor >= 7 ? 'text-red-700' : 'text-amber-700'
              }`}>
                <li>• Caracterizar dor: localização, tipo, irradiação, fatores de alívio/piora</li>
                <li>• Avaliar sinais vitais e sinais de alarme</li>
                {vitalSigns.escalaDor >= 4 && vitalSigns.escalaDor < 7 && (
                  <>
                    <li>• Dor MODERADA - Analgésicos simples + AINE se indicado</li>
                    <li>• Considerar associação de analgésicos</li>
                    <li>• Medidas não farmacológicas: calor local, repouso</li>
                  </>
                )}
                {vitalSigns.escalaDor >= 7 && (
                  <>
                    <li className="font-semibold">• Dor INTENSA - Escala analgésica OMS</li>
                    <li className="font-semibold">• Considerar opioides fracos ou fortes</li>
                    <li className="font-semibold">• Investigar causa urgente (IAM, abdome agudo, etc.)</li>
                    <li>• Reavaliar em 30-60 minutos após medicação</li>
                  </>
                )}
                {vitalSigns.escalaDor >= 9 && (
                  <li className="font-bold">• DOR INSUPORTÁVEL - Prioridade máxima de analgesia</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Orientações para FC Alterada */}
      {vitalSigns.frequenciaCardiaca && (vitalSigns.frequenciaCardiaca < 50 || vitalSigns.frequenciaCardiaca > 100) && (
        <div className={`rounded-lg p-4 border-l-4 ${
          vitalSigns.frequenciaCardiaca < 40 || vitalSigns.frequenciaCardiaca > 120
            ? 'bg-red-50 border-red-500'
            : 'bg-amber-50 border-amber-500'
        }`}>
          <div className="flex items-start gap-3">
            <Heart className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              vitalSigns.frequenciaCardiaca < 40 || vitalSigns.frequenciaCardiaca > 120 ? 'text-red-600' : 'text-amber-600'
            }`} />
            <div className="flex-1">
              <h4 className={`font-semibold mb-2 ${
                vitalSigns.frequenciaCardiaca < 40 || vitalSigns.frequenciaCardiaca > 120 ? 'text-red-900' : 'text-amber-900'
              }`}>
                Orientações para {vitalSigns.frequenciaCardiaca < 60 ? 'Bradicardia' : 'Taquicardia'} ({vitalSigns.frequenciaCardiaca} bpm)
              </h4>
              <ul className={`text-xs space-y-0.5 ${
                vitalSigns.frequenciaCardiaca < 40 || vitalSigns.frequenciaCardiaca > 120 ? 'text-red-700' : 'text-amber-700'
              }`}>
                {vitalSigns.frequenciaCardiaca < 60 ? (
                  <>
                    <li>• Verificar uso de betabloqueadores ou outros bradicardizantes</li>
                    <li>• Avaliar sintomas: tontura, síncope, dispneia</li>
                    <li>• Considerar ECG para avaliar ritmo</li>
                    {vitalSigns.frequenciaCardiaca < 50 && (
                      <>
                        <li className="font-semibold">• Verificar função tireoidiana (TSH)</li>
                        <li className="font-semibold">• Avaliar necessidade de Holter 24h</li>
                      </>
                    )}
                    {vitalSigns.frequenciaCardiaca < 40 && (
                      <li className="font-bold">• BRADICARDIA GRAVE - Avaliar marca-passo temporário</li>
                    )}
                  </>
                ) : (
                  <>
                    <li>• Avaliar causas: febre, dor, ansiedade, anemia, hipertireoidismo</li>
                    <li>• Verificar hidratação do paciente</li>
                    <li>• Considerar ECG para avaliar ritmo</li>
                    <li>• Avaliar uso de estimulantes (cafeína, medicamentos)</li>
                    {vitalSigns.frequenciaCardiaca > 110 && (
                      <>
                        <li className="font-semibold">• Descartar fibrilação atrial</li>
                        <li className="font-semibold">• Avaliar função tireoidiana</li>
                      </>
                    )}
                    {vitalSigns.frequenciaCardiaca > 130 && (
                      <>
                        <li className="font-bold">• TAQUICARDIA IMPORTANTE</li>
                        <li className="font-bold">• ECG 12 derivações obrigatório</li>
                        <li className="font-bold">• Avaliar estabilidade hemodinâmica</li>
                      </>
                    )}
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Orientações para FR Alterada */}
      {vitalSigns.frequenciaRespiratoria && (vitalSigns.frequenciaRespiratoria < 12 || vitalSigns.frequenciaRespiratoria > 20) && (
        <div className={`rounded-lg p-4 border-l-4 ${
          vitalSigns.frequenciaRespiratoria < 8 || vitalSigns.frequenciaRespiratoria > 28
            ? 'bg-red-50 border-red-500'
            : 'bg-amber-50 border-amber-500'
        }`}>
          <div className="flex items-start gap-3">
            <Wind className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              vitalSigns.frequenciaRespiratoria < 8 || vitalSigns.frequenciaRespiratoria > 28 ? 'text-red-600' : 'text-amber-600'
            }`} />
            <div className="flex-1">
              <h4 className={`font-semibold mb-2 ${
                vitalSigns.frequenciaRespiratoria < 8 || vitalSigns.frequenciaRespiratoria > 28 ? 'text-red-900' : 'text-amber-900'
              }`}>
                Orientações para Frequência Respiratória Alterada ({vitalSigns.frequenciaRespiratoria} irpm)
              </h4>
              <ul className={`text-xs space-y-0.5 ${
                vitalSigns.frequenciaRespiratoria < 8 || vitalSigns.frequenciaRespiratoria > 28 ? 'text-red-700' : 'text-amber-700'
              }`}>
                {vitalSigns.frequenciaRespiratoria < 12 ? (
                  <>
                    <li>• Avaliar nível de consciência</li>
                    <li>• Verificar uso de opioides ou sedativos</li>
                    <li>• Considerar intoxicação ou overdose</li>
                    {vitalSigns.frequenciaRespiratoria < 8 && (
                      <>
                        <li className="font-bold">• BRADIPNEIA GRAVE - Risco de parada respiratória</li>
                        <li className="font-bold">• Preparar material de via aérea</li>
                        <li className="font-bold">• Considerar Naloxona se uso de opioides</li>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <li>• Avaliar padrão respiratório e esforço</li>
                    <li>• Verificar saturação de O2</li>
                    <li>• Ausculta pulmonar</li>
                    <li>• Investigar causas: dor, febre, ansiedade, acidose</li>
                    {vitalSigns.frequenciaRespiratoria > 24 && (
                      <>
                        <li className="font-semibold">• Considerar gasometria arterial</li>
                        <li className="font-semibold">• Avaliar sinais de desconforto respiratório</li>
                      </>
                    )}
                    {vitalSigns.frequenciaRespiratoria > 28 && (
                      <>
                        <li className="font-bold">• TAQUIPNEIA IMPORTANTE</li>
                        <li className="font-bold">• Suplementação de O2 se hipoxemia</li>
                        <li className="font-bold">• Considerar VNI ou IOT se refratário</li>
                      </>
                    )}
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Visual Indicators for Key Vitals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {vitalSigns.frequenciaCardiaca && (
          <VitalIndicator
            icon={Heart}
            label="FC"
            value={`${vitalSigns.frequenciaCardiaca} bpm`}
            status={getVitalStatus(validateVitalSign('frequenciaCardiaca', vitalSigns.frequenciaCardiaca))}
          />
        )}
        {vitalSigns.frequenciaRespiratoria && (
          <VitalIndicator
            icon={Wind}
            label="FR"
            value={`${vitalSigns.frequenciaRespiratoria} irpm`}
            status={getVitalStatus(validateVitalSign('frequenciaRespiratoria', vitalSigns.frequenciaRespiratoria))}
          />
        )}
        {vitalSigns.temperatura && (
          <VitalIndicator
            icon={Thermometer}
            label="Temp"
            value={`${vitalSigns.temperatura}°C`}
            status={getVitalStatus(validateVitalSign('temperatura', vitalSigns.temperatura))}
          />
        )}
        {vitalSigns.saturacaoO2 && (
          <VitalIndicator
            icon={Droplets}
            label="SpO₂"
            value={`${vitalSigns.saturacaoO2}%`}
            status={getVitalStatus(validateVitalSign('saturacaoO2', vitalSigns.saturacaoO2))}
          />
        )}
      </div>
    </div>
  );
}

function VitalIndicator({
  icon: Icon,
  label,
  value,
  status
}: {
  icon: typeof Heart;
  label: string;
  value: string;
  status: 'normal' | 'warning' | 'critical';
}) {
  const statusColors = {
    normal: 'bg-green-100 border-green-300 text-green-800',
    warning: 'bg-amber-100 border-amber-300 text-amber-800',
    critical: 'bg-red-100 border-red-300 text-red-800'
  };

  const iconColors = {
    normal: 'text-green-600',
    warning: 'text-amber-600',
    critical: 'text-red-600'
  };

  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg border ${statusColors[status]}`}>
      <Icon className={`w-4 h-4 ${iconColors[status]}`} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium opacity-75">{label}</p>
        <p className="text-sm font-bold truncate">{value}</p>
      </div>
    </div>
  );
}

function getVitalStatus(validation: ReturnType<typeof validateVitalSign>): 'normal' | 'warning' | 'critical' {
  if (validation.isCritical) return 'critical';
  if (validation.isAbnormal) return 'warning';
  return 'normal';
}

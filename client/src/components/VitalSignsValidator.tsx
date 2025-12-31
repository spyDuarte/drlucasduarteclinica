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
                  <li>• Estímulo à atividade física regular</li>
                  {imcInfo.risk === 'muito_alto' && (
                    <li className="font-semibold">• Considerar encaminhamento para especialista</li>
                  )}
                </ul>
              </div>
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

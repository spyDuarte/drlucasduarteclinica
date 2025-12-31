/**
 * Validações Clínicas de Valores Críticos
 * Baseado em diretrizes médicas e consensos internacionais
 * Referências:
 * - American Heart Association (AHA)
 * - Sociedade Brasileira de Cardiologia (SBC)
 * - Consenso Brasileiro de Hipertensão
 */

import type { VitalSignValidation } from '../types';

export const VITAL_SIGNS_VALIDATIONS: VitalSignValidation[] = [
  {
    field: 'pressaoArterial',
    displayName: 'Pressão Arterial',
    unit: 'mmHg',
    minNormal: 90, // Sistólica
    maxNormal: 140,
    minCritical: 60,
    maxCritical: 180,
    minValue: 40,
    maxValue: 300
  },
  {
    field: 'frequenciaCardiaca',
    displayName: 'Frequência Cardíaca',
    unit: 'bpm',
    minNormal: 60,
    maxNormal: 100,
    minCritical: 40,
    maxCritical: 130,
    minValue: 20,
    maxValue: 250
  },
  {
    field: 'frequenciaRespiratoria',
    displayName: 'Frequência Respiratória',
    unit: 'irpm',
    minNormal: 12,
    maxNormal: 20,
    minCritical: 8,
    maxCritical: 30,
    minValue: 4,
    maxValue: 60
  },
  {
    field: 'temperatura',
    displayName: 'Temperatura',
    unit: '°C',
    minNormal: 36.1,
    maxNormal: 37.2,
    minCritical: 35.0,
    maxCritical: 39.0,
    minValue: 32.0,
    maxValue: 43.0
  },
  {
    field: 'saturacaoO2',
    displayName: 'Saturação de O2',
    unit: '%',
    minNormal: 95,
    maxNormal: 100,
    minCritical: 90,
    maxCritical: 100,
    minValue: 50,
    maxValue: 100
  },
  {
    field: 'glicemiaCapilar',
    displayName: 'Glicemia Capilar',
    unit: 'mg/dL',
    minNormal: 70,
    maxNormal: 100,
    minCritical: 50,
    maxCritical: 250,
    minValue: 20,
    maxValue: 600
  },
  {
    field: 'peso',
    displayName: 'Peso',
    unit: 'kg',
    minValue: 0.5,
    maxValue: 300
  },
  {
    field: 'altura',
    displayName: 'Altura',
    unit: 'cm',
    minValue: 30,
    maxValue: 250
  },
  {
    field: 'imc',
    displayName: 'IMC',
    unit: 'kg/m²',
    minNormal: 18.5,
    maxNormal: 24.9,
    minValue: 10,
    maxValue: 60
  },
  {
    field: 'escalaGlasgow',
    displayName: 'Escala de Glasgow',
    unit: 'pontos',
    minCritical: 8,
    minValue: 3,
    maxValue: 15
  },
  {
    field: 'escalaDor',
    displayName: 'Escala de Dor (EVA)',
    unit: '0-10',
    minValue: 0,
    maxValue: 10
  }
];

/**
 * Valida um sinal vital e retorna mensagens de alerta
 */
export function validateVitalSign(
  field: string,
  value: number | string
): {
  isValid: boolean;
  isCritical: boolean;
  isAbnormal: boolean;
  message?: string;
  severity?: 'info' | 'warning' | 'critical';
} {
  const validation = VITAL_SIGNS_VALIDATIONS.find(v => v.field === field);
  if (!validation) {
    return { isValid: true, isCritical: false, isAbnormal: false };
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) {
    return {
      isValid: false,
      isCritical: false,
      isAbnormal: false,
      message: 'Valor inválido'
    };
  }

  // Verifica limites absolutos
  if (validation.minValue && numValue < validation.minValue) {
    return {
      isValid: false,
      isCritical: true,
      isAbnormal: true,
      message: `Valor muito baixo (mínimo: ${validation.minValue} ${validation.unit})`,
      severity: 'critical'
    };
  }

  if (validation.maxValue && numValue > validation.maxValue) {
    return {
      isValid: false,
      isCritical: true,
      isAbnormal: true,
      message: `Valor muito alto (máximo: ${validation.maxValue} ${validation.unit})`,
      severity: 'critical'
    };
  }

  // Verifica valores críticos
  if (validation.minCritical && numValue < validation.minCritical) {
    return {
      isValid: true,
      isCritical: true,
      isAbnormal: true,
      message: `⚠️ VALOR CRÍTICO - ${validation.displayName} muito baixa: ${numValue} ${validation.unit}`,
      severity: 'critical'
    };
  }

  if (validation.maxCritical && numValue > validation.maxCritical) {
    return {
      isValid: true,
      isCritical: true,
      isAbnormal: true,
      message: `⚠️ VALOR CRÍTICO - ${validation.displayName} muito alta: ${numValue} ${validation.unit}`,
      severity: 'critical'
    };
  }

  // Verifica valores normais
  if (validation.minNormal && validation.maxNormal) {
    if (numValue < validation.minNormal) {
      return {
        isValid: true,
        isCritical: false,
        isAbnormal: true,
        message: `${validation.displayName} abaixo do normal (${validation.minNormal}-${validation.maxNormal} ${validation.unit})`,
        severity: 'warning'
      };
    }

    if (numValue > validation.maxNormal) {
      return {
        isValid: true,
        isCritical: false,
        isAbnormal: true,
        message: `${validation.displayName} acima do normal (${validation.minNormal}-${validation.maxNormal} ${validation.unit})`,
        severity: 'warning'
      };
    }
  }

  return {
    isValid: true,
    isCritical: false,
    isAbnormal: false,
    message: `${validation.displayName} dentro dos limites normais`,
    severity: 'info'
  };
}

/**
 * Valida múltiplos sinais vitais de uma vez
 */
export function validateAllVitalSigns(vitalSigns: Record<string, number | string | undefined>): {
  criticalAlerts: Array<{ field: string; message: string }>;
  warnings: Array<{ field: string; message: string }>;
  hasCriticalValues: boolean;
} {
  const criticalAlerts: Array<{ field: string; message: string }> = [];
  const warnings: Array<{ field: string; message: string }> = [];

  Object.entries(vitalSigns).forEach(([field, value]) => {
    if (value === undefined || value === null || value === '') return;

    const result = validateVitalSign(field, value);

    if (result.isCritical && result.message) {
      criticalAlerts.push({ field, message: result.message });
    } else if (result.isAbnormal && result.message && result.severity === 'warning') {
      warnings.push({ field, message: result.message });
    }
  });

  return {
    criticalAlerts,
    warnings,
    hasCriticalValues: criticalAlerts.length > 0
  };
}

/**
 * Calcula IMC e retorna classificação
 */
export function calculateIMC(peso: number, altura: number): {
  imc: number;
  classification: string;
  risk: 'baixo' | 'normal' | 'aumentado' | 'alto' | 'muito_alto';
} {
  const imc = peso / Math.pow(altura / 100, 2);

  let classification: string;
  let risk: 'baixo' | 'normal' | 'aumentado' | 'alto' | 'muito_alto';

  if (imc < 18.5) {
    classification = 'Abaixo do peso';
    risk = 'aumentado';
  } else if (imc < 25) {
    classification = 'Peso normal';
    risk = 'normal';
  } else if (imc < 30) {
    classification = 'Sobrepeso';
    risk = 'aumentado';
  } else if (imc < 35) {
    classification = 'Obesidade grau I';
    risk = 'alto';
  } else if (imc < 40) {
    classification = 'Obesidade grau II';
    risk = 'muito_alto';
  } else {
    classification = 'Obesidade grau III (mórbida)';
    risk = 'muito_alto';
  }

  return { imc: parseFloat(imc.toFixed(1)), classification, risk };
}

/**
 * Interpreta pressão arterial segundo diretrizes brasileiras
 */
export function interpretBloodPressure(systolic: number, diastolic: number): {
  classification: string;
  severity: 'normal' | 'warning' | 'critical';
  recommendations: string[];
} {
  if (systolic < 90 || diastolic < 60) {
    return {
      classification: 'Hipotensão',
      severity: 'critical',
      recommendations: [
        'Avaliar hidratação',
        'Investigar causas secundárias',
        'Monitorar sintomas (tontura, fraqueza)'
      ]
    };
  }

  if (systolic < 120 && diastolic < 80) {
    return {
      classification: 'Pressão normal',
      severity: 'normal',
      recommendations: ['Manter hábitos saudáveis']
    };
  }

  if (systolic < 130 && diastolic < 85) {
    return {
      classification: 'Pré-hipertensão',
      severity: 'warning',
      recommendations: [
        'Mudanças no estilo de vida',
        'Reduzir sal na alimentação',
        'Exercícios regulares'
      ]
    };
  }

  if (systolic < 140 || diastolic < 90) {
    return {
      classification: 'Hipertensão estágio 1',
      severity: 'warning',
      recommendations: [
        'Mudanças no estilo de vida',
        'Considerar terapia medicamentosa',
        'Acompanhamento regular'
      ]
    };
  }

  if (systolic < 160 || diastolic < 100) {
    return {
      classification: 'Hipertensão estágio 2',
      severity: 'critical',
      recommendations: [
        'Iniciar terapia medicamentosa',
        'Mudanças no estilo de vida',
        'Acompanhamento médico frequente'
      ]
    };
  }

  return {
    classification: 'Hipertensão estágio 3 (grave)',
    severity: 'critical',
    recommendations: [
      '⚠️ URGÊNCIA HIPERTENSIVA - Avaliar necessidade de atendimento imediato',
      'Terapia medicamentosa intensiva',
      'Investigar lesão de órgãos-alvo'
    ]
  };
}

/**
 * Base de Dados Simplificada de Medicamentos
 * Referências:
 * - ANVISA - Lista de medicamentos controlados
 * - Bulário Eletrônico
 * - UpToDate - Drug Interactions
 */

import type { MedicationInfo } from '../types';

// Base de medicamentos comuns (simplificada)
export const MEDICATIONS_DATABASE: MedicationInfo[] = [
  // Analgésicos e Anti-inflamatórios
  {
    name: 'Paracetamol',
    concentrations: ['500mg', '750mg', '1g'],
    maxDailyDose: '4g/dia',
    contraindications: ['Insuficiência hepática grave'],
    interactions: ['Varfarina (aumenta risco de sangramento)'],
    sideEffects: ['Hepatotoxicidade (dose elevada)', 'Reações alérgicas'],
    isControlled: false,
    isPsychotropic: false,
    category: 'Analgésico'
  },
  {
    name: 'Dipirona',
    concentrations: ['500mg', '1g'],
    maxDailyDose: '4g/dia',
    contraindications: ['Porfiria aguda', 'Deficiência de G6PD'],
    interactions: ['Ciclosporina', 'Metotrexato'],
    sideEffects: ['Agranulocitose (raro)', 'Hipotensão'],
    isControlled: false,
    isPsychotropic: false,
    category: 'Analgésico'
  },
  {
    name: 'Ibuprofeno',
    concentrations: ['200mg', '400mg', '600mg'],
    maxDailyDose: '2400mg/dia',
    contraindications: ['Úlcera péptica ativa', 'Insuficiência cardíaca grave'],
    interactions: ['AAS', 'Varfarina', 'Anti-hipertensivos'],
    sideEffects: ['Dispepsia', 'Úlcera gástrica', 'Sangramento GI'],
    isControlled: false,
    isPsychotropic: false,
    category: 'AINE'
  },
  {
    name: 'Diclofenaco',
    concentrations: ['50mg', '75mg'],
    maxDailyDose: '150mg/dia',
    contraindications: ['Úlcera péptica', 'Asma induzida por AINE'],
    interactions: ['Anticoagulantes', 'Lítio', 'Metotrexato'],
    sideEffects: ['Úlcera péptica', 'Hepatotoxicidade'],
    isControlled: false,
    isPsychotropic: false,
    category: 'AINE'
  },

  // Antibióticos
  {
    name: 'Amoxicilina',
    concentrations: ['500mg', '875mg'],
    maxDailyDose: '3g/dia',
    contraindications: ['Alergia a penicilinas'],
    interactions: ['Contraceptivos orais (reduz eficácia)'],
    sideEffects: ['Diarreia', 'Reações alérgicas', 'Candidíase'],
    isControlled: false,
    isPsychotropic: false,
    category: 'Antibiótico'
  },
  {
    name: 'Azitromicina',
    concentrations: ['500mg'],
    maxDailyDose: '500mg/dia',
    contraindications: ['Hipersensibilidade a macrolídeos'],
    interactions: ['Varfarina', 'Digoxina'],
    sideEffects: ['Diarreia', 'Náusea', 'Prolongamento QT'],
    isControlled: false,
    isPsychotropic: false,
    category: 'Antibiótico'
  },

  // Anti-hipertensivos
  {
    name: 'Losartana',
    concentrations: ['50mg', '100mg'],
    maxDailyDose: '100mg/dia',
    contraindications: ['Gravidez', 'Hipercalemia'],
    interactions: ['Diuréticos poupadores de K+', 'AINEs'],
    sideEffects: ['Tontura', 'Hipercalemia', 'Tosse'],
    isControlled: false,
    isPsychotropic: false,
    category: 'Anti-hipertensivo'
  },
  {
    name: 'Enalapril',
    concentrations: ['5mg', '10mg', '20mg'],
    maxDailyDose: '40mg/dia',
    contraindications: ['Gravidez', 'Estenose bilateral de artéria renal'],
    interactions: ['Diuréticos', 'AINEs', 'Suplementos de potássio'],
    sideEffects: ['Tosse seca', 'Hipotensão', 'Angioedema'],
    isControlled: false,
    isPsychotropic: false,
    category: 'Anti-hipertensivo'
  },
  {
    name: 'Anlodipino',
    concentrations: ['5mg', '10mg'],
    maxDailyDose: '10mg/dia',
    contraindications: ['Hipersensibilidade', 'Hipotensão grave'],
    interactions: ['Sinvastatina (risco de miopatia)'],
    sideEffects: ['Edema periférico', 'Cefaleia', 'Rubor'],
    isControlled: false,
    isPsychotropic: false,
    category: 'Anti-hipertensivo'
  },

  // Diuréticos
  {
    name: 'Hidroclorotiazida',
    concentrations: ['25mg', '50mg'],
    maxDailyDose: '50mg/dia',
    contraindications: ['Anúria', 'Hipersensibilidade a sulfonamidas'],
    interactions: ['Lítio', 'Digoxina', 'Anti-hipertensivos'],
    sideEffects: ['Hipocalemia', 'Hiponatremia', 'Hiperuricemia'],
    isControlled: false,
    isPsychotropic: false,
    category: 'Diurético'
  },
  {
    name: 'Furosemida',
    concentrations: ['40mg'],
    maxDailyDose: '600mg/dia',
    contraindications: ['Anúria', 'Depleção severa de eletrólitos'],
    interactions: ['Digoxina', 'Aminoglicosídeos', 'Lítio'],
    sideEffects: ['Hipocalemia', 'Desidratação', 'Ototoxicidade'],
    isControlled: false,
    isPsychotropic: false,
    category: 'Diurético'
  },

  // Antidiabéticos
  {
    name: 'Metformina',
    concentrations: ['500mg', '850mg', '1g'],
    maxDailyDose: '2550mg/dia',
    contraindications: ['Insuficiência renal', 'Acidose metabólica'],
    interactions: ['Contraste iodado', 'Álcool'],
    sideEffects: ['Diarreia', 'Náusea', 'Acidose lática (raro)'],
    isControlled: false,
    isPsychotropic: false,
    category: 'Antidiabético'
  },
  {
    name: 'Glibenclamida',
    concentrations: ['5mg'],
    maxDailyDose: '20mg/dia',
    contraindications: ['Diabetes tipo 1', 'Gravidez'],
    interactions: ['Álcool', 'Betabloqueadores'],
    sideEffects: ['Hipoglicemia', 'Ganho de peso'],
    isControlled: false,
    isPsychotropic: false,
    category: 'Antidiabético'
  },

  // Anticoagulantes/Antiagregantes
  {
    name: 'AAS',
    concentrations: ['100mg', '500mg'],
    maxDailyDose: '100mg/dia (antiagregante)',
    contraindications: ['Úlcera péptica ativa', 'Hemofilia'],
    interactions: ['Varfarina', 'AINEs', 'Metotrexato'],
    sideEffects: ['Sangramento GI', 'Úlcera gástrica'],
    isControlled: false,
    isPsychotropic: false,
    category: 'Antiagregante'
  },
  {
    name: 'Varfarina',
    concentrations: ['5mg'],
    maxDailyDose: 'Variável (conforme INR)',
    contraindications: ['Gravidez', 'Sangramento ativo'],
    interactions: ['AAS', 'AINEs', 'Antibióticos', 'Paracetamol'],
    sideEffects: ['Sangramento', 'Necrose cutânea'],
    isControlled: false,
    isPsychotropic: false,
    category: 'Anticoagulante'
  },

  // Psicotrópicos - CONTROLADOS
  {
    name: 'Clonazepam',
    concentrations: ['0.5mg', '2mg'],
    maxDailyDose: '4mg/dia',
    contraindications: ['Glaucoma de ângulo fechado', 'Miastenia gravis'],
    interactions: ['Álcool', 'Opioides', 'Antidepressivos'],
    sideEffects: ['Sonolência', 'Dependência', 'Ataxia'],
    isControlled: true,
    isPsychotropic: true,
    category: 'Benzodiazepínico'
  },
  {
    name: 'Alprazolam',
    concentrations: ['0.25mg', '0.5mg', '1mg'],
    maxDailyDose: '4mg/dia',
    contraindications: ['Glaucoma', 'Gravidez'],
    interactions: ['Álcool', 'Opioides', 'Antifúngicos azólicos'],
    sideEffects: ['Sedação', 'Dependência', 'Amnésia anterógrada'],
    isControlled: true,
    isPsychotropic: true,
    category: 'Benzodiazepínico'
  },
  {
    name: 'Sertralina',
    concentrations: ['50mg', '100mg'],
    maxDailyDose: '200mg/dia',
    contraindications: ['Uso de IMAOs'],
    interactions: ['IMAOs', 'Varfarina', 'Tramadol'],
    sideEffects: ['Náusea', 'Disfunção sexual', 'Insônia'],
    isControlled: true,
    isPsychotropic: true,
    category: 'Antidepressivo ISRS'
  },
  {
    name: 'Fluoxetina',
    concentrations: ['20mg'],
    maxDailyDose: '80mg/dia',
    contraindications: ['Uso de IMAOs'],
    interactions: ['IMAOs', 'Tamoxifeno', 'Varfarina'],
    sideEffects: ['Náusea', 'Insônia', 'Cefaleia'],
    isControlled: true,
    isPsychotropic: true,
    category: 'Antidepressivo ISRS'
  },

  // Estatinas
  {
    name: 'Sinvastatina',
    concentrations: ['20mg', '40mg'],
    maxDailyDose: '80mg/dia',
    contraindications: ['Doença hepática ativa', 'Gravidez'],
    interactions: ['Anlodipino', 'Fibratos', 'Amiodarona'],
    sideEffects: ['Mialgia', 'Hepatotoxicidade', 'Rabdomiólise'],
    isControlled: false,
    isPsychotropic: false,
    category: 'Hipolipemiante'
  },
  {
    name: 'Atorvastatina',
    concentrations: ['10mg', '20mg', '40mg', '80mg'],
    maxDailyDose: '80mg/dia',
    contraindications: ['Doença hepática ativa', 'Gravidez'],
    interactions: ['Fibratos', 'Antifúngicos azólicos'],
    sideEffects: ['Mialgia', 'Elevação de transaminases'],
    isControlled: false,
    isPsychotropic: false,
    category: 'Hipolipemiante'
  },

  // Gastroprotetores
  {
    name: 'Omeprazol',
    concentrations: ['20mg', '40mg'],
    maxDailyDose: '40mg/dia',
    contraindications: ['Hipersensibilidade'],
    interactions: ['Clopidogrel', 'Varfarina', 'Methotrexate'],
    sideEffects: ['Cefaleia', 'Diarreia', 'Deficiência de B12'],
    isControlled: false,
    isPsychotropic: false,
    category: 'IBP'
  },
  {
    name: 'Pantoprazol',
    concentrations: ['20mg', '40mg'],
    maxDailyDose: '40mg/dia',
    contraindications: ['Hipersensibilidade'],
    interactions: ['Varfarina', 'Cetoconazol'],
    sideEffects: ['Cefaleia', 'Náusea'],
    isControlled: false,
    isPsychotropic: false,
    category: 'IBP'
  }
];

/**
 * Busca informações de um medicamento
 */
export function getMedicationInfo(medicationName: string): MedicationInfo | undefined {
  const normalized = medicationName.toLowerCase().trim();
  return MEDICATIONS_DATABASE.find(
    med => med.name.toLowerCase() === normalized
  );
}

/**
 * Verifica se medicamento é controlado
 */
export function isControlledMedication(medicationName: string): boolean {
  const info = getMedicationInfo(medicationName);
  return info?.isControlled || false;
}

/**
 * Detecta interações medicamentosas
 */
export function checkDrugInteractions(medications: string[]): Array<{
  medication1: string;
  medication2: string;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  recommendation: string;
}> {
  const interactions: Array<{
    medication1: string;
    medication2: string;
    severity: 'mild' | 'moderate' | 'severe';
    description: string;
    recommendation: string;
  }> = [];

  // Normaliza nomes de medicamentos
  const normalizedMeds = medications.map(m => m.toLowerCase().trim());

  for (let i = 0; i < normalizedMeds.length; i++) {
    const med1Info = getMedicationInfo(normalizedMeds[i]);
    if (!med1Info) continue;

    for (let j = i + 1; j < normalizedMeds.length; j++) {
      const med2Name = normalizedMeds[j];

      // Verifica se med2 está na lista de interações de med1
      const hasInteraction = med1Info.interactions?.some(
        interaction => interaction.toLowerCase().includes(med2Name) ||
                      med2Name.includes(interaction.toLowerCase().split('(')[0].trim().toLowerCase())
      );

      if (hasInteraction) {
        // Determina severidade baseada no tipo de interação
        let severity: 'mild' | 'moderate' | 'severe' = 'moderate';
        let recommendation = 'Monitorar paciente';

        // Interações graves
        if (
          (med1Info.name.toLowerCase().includes('varfarina') || med2Name.includes('varfarina')) ||
          (med1Info.name.toLowerCase().includes('imao') || med2Name.includes('imao')) ||
          (med1Info.category === 'Benzodiazepínico' && med2Name.includes('opioide'))
        ) {
          severity = 'severe';
          recommendation = 'Evitar associação. Considerar alternativas.';
        }

        // Interações leves
        if (
          med1Info.category === 'Antibiótico' && med2Name.includes('contraceptivo')
        ) {
          severity = 'mild';
          recommendation = 'Orientar uso de método contraceptivo adicional.';
        }

        interactions.push({
          medication1: med1Info.name,
          medication2: med2Name,
          severity,
          description: `Possível interação entre ${med1Info.name} e ${med2Name}`,
          recommendation
        });
      }
    }
  }

  // Interações específicas conhecidas
  const specificInteractions: Array<[string, string, 'mild' | 'moderate' | 'severe', string, string]> = [
    ['varfarina', 'aas', 'severe', 'Aumento significativo do risco de sangramento', 'Evitar. Se necessário, monitorar INR rigorosamente'],
    ['varfarina', 'paracetamol', 'moderate', 'Paracetamol em doses altas pode potencializar anticoagulação', 'Limitar paracetamol a 2g/dia'],
    ['enalapril', 'ibuprofeno', 'moderate', 'AINEs reduzem efeito anti-hipertensivo de IECAs', 'Monitorar PA. Considerar alternativa ao AINE'],
    ['metformina', 'furosemida', 'moderate', 'Furosemida pode aumentar níveis de metformina', 'Monitorar função renal'],
    ['sinvastatina', 'anlodipino', 'moderate', 'Anlodipino aumenta concentração de sinvastatina', 'Limitar sinvastatina a 20mg/dia'],
    ['digoxina', 'hidroclorotiazida', 'moderate', 'Hipocalemia aumenta risco de toxicidade por digoxina', 'Monitorar potássio e digoxinemia'],
    ['clonazepam', 'sertralina', 'moderate', 'Potencialização de efeitos sedativos', 'Iniciar com doses baixas'],
  ];

  specificInteractions.forEach(([med1, med2, severity, description, recommendation]) => {
    const hasMed1 = normalizedMeds.some(m => m.includes(med1));
    const hasMed2 = normalizedMeds.some(m => m.includes(med2));

    if (hasMed1 && hasMed2) {
      // Evita duplicatas
      const alreadyAdded = interactions.some(
        i => (i.medication1.toLowerCase().includes(med1) && i.medication2.toLowerCase().includes(med2)) ||
             (i.medication1.toLowerCase().includes(med2) && i.medication2.toLowerCase().includes(med1))
      );

      if (!alreadyAdded) {
        interactions.push({
          medication1: med1.charAt(0).toUpperCase() + med1.slice(1),
          medication2: med2.charAt(0).toUpperCase() + med2.slice(1),
          severity,
          description,
          recommendation
        });
      }
    }
  });

  return interactions;
}

/**
 * Valida se medicamento está em uso pelo paciente
 */
export function checkAgainstPatientMedications(
  newMedications: string[],
  patientMedications: string[]
): Array<{
  medication1: string;
  medication2: string;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  recommendation: string;
}> {
  const allMedications = [...newMedications, ...patientMedications];
  return checkDrugInteractions(allMedications);
}

/**
 * Sugestões de medicamentos por categoria
 */
export function getMedicationsByCategory(category: string): MedicationInfo[] {
  return MEDICATIONS_DATABASE.filter(med => med.category === category);
}

/**
 * Lista todas as categorias disponíveis
 */
export function getAllCategories(): string[] {
  return Array.from(new Set(MEDICATIONS_DATABASE.map(med => med.category || 'Outros')));
}

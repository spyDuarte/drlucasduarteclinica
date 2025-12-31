import { useEffect, useState } from 'react';
import { AlertTriangle, Shield, Info, Pill } from 'lucide-react';
import { checkDrugInteractions, checkAgainstPatientMedications, isControlledMedication } from '../utils/medicationDatabase';
import type { Prescription } from '../types';

interface DrugInteractionCheckerProps {
  prescriptions: Prescription[];
  patientMedications?: string[];
  onInteractionFound?: (hasInteractions: boolean) => void;
}

export function DrugInteractionChecker({
  prescriptions,
  patientMedications = [],
  onInteractionFound
}: DrugInteractionCheckerProps) {
  const [interactions, setInteractions] = useState<Array<{
    medication1: string;
    medication2: string;
    severity: 'mild' | 'moderate' | 'severe';
    description: string;
    recommendation: string;
  }>>([]);

  useEffect(() => {
    const prescribedMeds = prescriptions.map(p => p.medicamento);
    const allInteractions = checkAgainstPatientMedications(prescribedMeds, patientMedications);

    setInteractions(allInteractions);

    if (onInteractionFound) {
      onInteractionFound(allInteractions.length > 0);
    }
  }, [prescriptions, patientMedications, onInteractionFound]);

  // Conta medicamentos controlados
  const controlledCount = prescriptions.filter(p =>
    p.usoControlado || isControlledMedication(p.medicamento)
  ).length;

  if (interactions.length === 0 && controlledCount === 0) {
    return (
      <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-600" />
          <p className="text-sm font-medium text-green-800">
            Nenhuma interação medicamentosa detectada
          </p>
        </div>
      </div>
    );
  }

  const severeInteractions = interactions.filter(i => i.severity === 'severe');
  const moderateInteractions = interactions.filter(i => i.severity === 'moderate');
  const mildInteractions = interactions.filter(i => i.severity === 'mild');

  return (
    <div className="space-y-3">
      {/* Controlled Medications Warning */}
      {controlledCount > 0 && (
        <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Pill className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-purple-900">
                {controlledCount} medicamento{controlledCount !== 1 ? 's' : ''} controlado{controlledCount !== 1 ? 's' : ''} prescrito{controlledCount !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-purple-700 mt-1">
                Atenção: Prescrição de medicamentos controlados requer receituário especial conforme Portaria 344/98
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Severe Interactions */}
      {severeInteractions.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-red-900 mb-2">
                ⚠️ INTERAÇÕES GRAVES DETECTADAS
              </h4>
              <div className="space-y-2">
                {severeInteractions.map((interaction, index) => (
                  <div key={index} className="bg-white rounded-lg p-2 border border-red-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-red-900 bg-red-100 px-2 py-0.5 rounded">
                        {interaction.medication1}
                      </span>
                      <span className="text-red-500">×</span>
                      <span className="text-xs font-semibold text-red-900 bg-red-100 px-2 py-0.5 rounded">
                        {interaction.medication2}
                      </span>
                    </div>
                    <p className="text-xs text-red-800 mb-1">{interaction.description}</p>
                    <p className="text-xs font-medium text-red-900">
                      <span className="font-bold">Recomendação:</span> {interaction.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Moderate Interactions */}
      {moderateInteractions.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-amber-900 mb-2">
                Interações Moderadas
              </h4>
              <div className="space-y-2">
                {moderateInteractions.map((interaction, index) => (
                  <div key={index} className="bg-white rounded-lg p-2 border border-amber-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                        {interaction.medication1}
                      </span>
                      <span className="text-amber-500">×</span>
                      <span className="text-xs font-medium text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                        {interaction.medication2}
                      </span>
                    </div>
                    <p className="text-xs text-amber-800 mb-1">{interaction.description}</p>
                    <p className="text-xs text-amber-900">
                      <span className="font-semibold">Recomendação:</span> {interaction.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mild Interactions */}
      {mildInteractions.length > 0 && (
        <details className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-3">
          <summary className="cursor-pointer flex items-center gap-2 text-sm font-medium text-blue-900">
            <Info className="w-4 h-4 text-blue-600" />
            <span>Interações Leves ({mildInteractions.length})</span>
          </summary>
          <div className="mt-2 space-y-2">
            {mildInteractions.map((interaction, index) => (
              <div key={index} className="bg-white rounded-lg p-2 border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
                    {interaction.medication1}
                  </span>
                  <span className="text-blue-500">×</span>
                  <span className="text-xs font-medium text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
                    {interaction.medication2}
                  </span>
                </div>
                <p className="text-xs text-blue-800 mb-1">{interaction.description}</p>
                <p className="text-xs text-blue-900">
                  <span className="font-semibold">Recomendação:</span> {interaction.recommendation}
                </p>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
        <p className="font-medium mb-1">Resumo da Análise:</p>
        <ul className="space-y-0.5">
          <li>• {prescriptions.length} medicamento{prescriptions.length !== 1 ? 's' : ''} prescrito{prescriptions.length !== 1 ? 's' : ''}</li>
          <li>• {patientMedications.length} medicamento{patientMedications.length !== 1 ? 's' : ''} em uso pelo paciente</li>
          {severeInteractions.length > 0 && (
            <li className="text-red-700 font-semibold">• {severeInteractions.length} interação{severeInteractions.length !== 1 ? 'ões' : ''} grave{severeInteractions.length !== 1 ? 's' : ''}</li>
          )}
          {moderateInteractions.length > 0 && (
            <li className="text-amber-700">• {moderateInteractions.length} interação{moderateInteractions.length !== 1 ? 'ões' : ''} moderada{moderateInteractions.length !== 1 ? 's' : ''}</li>
          )}
          {mildInteractions.length > 0 && (
            <li className="text-blue-700">• {mildInteractions.length} interação{mildInteractions.length !== 1 ? 'ões' : ''} leve{mildInteractions.length !== 1 ? 's' : ''}</li>
          )}
        </ul>
        <p className="mt-2 italic text-gray-500">
          * Esta ferramenta é um auxílio. Sempre consulte literatura médica atualizada.
        </p>
      </div>
    </div>
  );
}

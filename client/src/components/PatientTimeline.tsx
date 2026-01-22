import { memo } from 'react';
import { Calendar, FileText, Activity, Pill, AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { MedicalRecord } from '../types';

interface PatientTimelineProps {
  medicalRecords: MedicalRecord[];
  patientName: string;
  showLimit?: number;
}

export const PatientTimeline = memo(function PatientTimeline({ medicalRecords, patientName, showLimit }: PatientTimelineProps) {
  // Ordena por data decrescente
  const sortedRecords = [...medicalRecords].sort((a, b) =>
    new Date(b.data).getTime() - new Date(a.data).getTime()
  );

  const displayedRecords = showLimit ? sortedRecords.slice(0, showLimit) : sortedRecords;

  if (displayedRecords.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Nenhum atendimento registrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-indigo-600" />
        <h3 className="font-semibold text-gray-900">
          Histórico de Evolução - {patientName}
        </h3>
        <span className="text-sm text-gray-500">
          ({displayedRecords.length} {displayedRecords.length === 1 ? 'registro' : 'registros'})
        </span>
      </div>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500" />

        {/* Timeline Items */}
        <div className="space-y-6">
          {displayedRecords.map((record, index) => (
            <TimelineItem
              key={record.id}
              record={record}
              isFirst={index === 0}
            />
          ))}
        </div>

        {showLimit && sortedRecords.length > showLimit && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              + {sortedRecords.length - showLimit} atendimento{sortedRecords.length - showLimit !== 1 ? 's' : ''} anterior{sortedRecords.length - showLimit !== 1 ? 'es' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

function TimelineItem({ record, isFirst }: { record: MedicalRecord; isFirst: boolean }) {
  const recordDate = new Date(record.data);
  const now = new Date();
  const daysAgo = Math.floor((now.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));

  const getTimeLabel = () => {
    if (daysAgo === 0) return 'Hoje';
    if (daysAgo === 1) return 'Ontem';
    if (daysAgo < 7) return `${daysAgo} dias atrás`;
    if (daysAgo < 30) return `${Math.floor(daysAgo / 7)} semana${Math.floor(daysAgo / 7) !== 1 ? 's' : ''} atrás`;
    if (daysAgo < 365) return `${Math.floor(daysAgo / 30)} mes${Math.floor(daysAgo / 30) !== 1 ? 'es' : ''} atrás`;
    return `${Math.floor(daysAgo / 365)} ano${Math.floor(daysAgo / 365) !== 1 ? 's' : ''} atrás`;
  };

  // Determina tendência de gravidade comparando com atendimentos anteriores
  const getTrend = (): 'improving' | 'stable' | 'worsening' | null => {
    if (!record.avaliacao.gravidade) return null;

    const severityMap = { leve: 1, moderada: 2, grave: 3, critica: 4 };
    const currentSeverity = severityMap[record.avaliacao.gravidade];

    // Comparação simplificada - em produção, compararia com atendimentos anteriores
    if (currentSeverity <= 1) return 'improving';
    if (currentSeverity >= 3) return 'worsening';
    return 'stable';
  };

  const trend = getTrend();
  const TrendIcon = trend === 'improving' ? TrendingDown : trend === 'worsening' ? TrendingUp : Minus;
  const trendColor = trend === 'improving' ? 'text-green-600' : trend === 'worsening' ? 'text-red-600' : 'text-gray-600';

  return (
    <div className="relative pl-12">
      {/* Timeline Node */}
      <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isFirst
          ? 'bg-gradient-to-br from-indigo-500 to-purple-600 ring-4 ring-indigo-100'
          : 'bg-white border-2 border-indigo-400'
      }`}>
        {isFirst ? (
          <FileText className="w-4 h-4 text-white" />
        ) : (
          <div className="w-2 h-2 bg-indigo-400 rounded-full" />
        )}
      </div>

      {/* Content Card */}
      <div className={`bg-white rounded-xl border-2 p-4 shadow-sm hover:shadow-md transition-all ${
        isFirst ? 'border-indigo-300 bg-gradient-to-br from-white to-indigo-50' : 'border-gray-200'
      }`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900">
                {record.tipoAtendimento ?
                  record.tipoAtendimento.charAt(0).toUpperCase() + record.tipoAtendimento.slice(1).replace('_', ' ')
                  : 'Atendimento'
                }
              </h4>
              {isFirst && (
                <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs font-medium rounded">
                  Mais recente
                </span>
              )}
              {trend && (
                <span className={`flex items-center gap-1 text-xs ${trendColor}`}>
                  <TrendIcon className="w-3 h-3" />
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {recordDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
              <span>{getTimeLabel()}</span>
            </div>
          </div>
        </div>

        {/* Queixa Principal */}
        {record.subjetivo.queixaPrincipal && (
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700 mb-1">Queixa Principal:</p>
            <p className="text-sm text-gray-900 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
              "{record.subjetivo.queixaPrincipal}"
            </p>
          </div>
        )}

        {/* Diagnósticos */}
        {(record.avaliacao.diagnosticoPrincipal || record.avaliacao.cid10) && (
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700 mb-1">Diagnóstico:</p>
            <div className="flex items-center gap-2 flex-wrap">
              {record.avaliacao.diagnosticoPrincipal && (
                <span className="text-sm text-gray-900 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                  {record.avaliacao.diagnosticoPrincipal}
                </span>
              )}
              {record.avaliacao.cid10?.map((cid, i) => (
                <span key={i} className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {cid}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Gravidade */}
        {record.avaliacao.gravidade && (
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className={`w-4 h-4 ${
                record.avaliacao.gravidade === 'leve' ? 'text-green-600' :
                record.avaliacao.gravidade === 'moderada' ? 'text-yellow-600' :
                record.avaliacao.gravidade === 'grave' ? 'text-orange-600' :
                'text-red-600'
              }`} />
              <span className={`text-sm font-medium px-2 py-0.5 rounded ${
                record.avaliacao.gravidade === 'leve' ? 'bg-green-100 text-green-800' :
                record.avaliacao.gravidade === 'moderada' ? 'bg-yellow-100 text-yellow-800' :
                record.avaliacao.gravidade === 'grave' ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>
                Gravidade: {record.avaliacao.gravidade.charAt(0).toUpperCase() + record.avaliacao.gravidade.slice(1)}
              </span>
            </div>
          </div>
        )}

        {/* Conduta (resumida) */}
        {record.plano.conduta && (
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700 mb-1">Conduta:</p>
            <p className="text-sm text-gray-600 line-clamp-2">
              {record.plano.conduta}
            </p>
          </div>
        )}

        {/* Prescrições */}
        {record.plano.prescricoes && record.plano.prescricoes.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <Pill className="w-4 h-4 text-purple-600" />
              <p className="text-sm font-medium text-gray-700">
                Prescrições ({record.plano.prescricoes.length}):
              </p>
            </div>
            <div className="space-y-1">
              {record.plano.prescricoes.slice(0, 3).map((presc, i) => (
                <div key={i} className="text-xs text-gray-600 flex items-center gap-2">
                  <span className="w-1 h-1 bg-purple-500 rounded-full" />
                  <span className="font-medium">{presc.medicamento}</span>
                  {presc.posologia && <span className="text-gray-500">- {presc.posologia}</span>}
                </div>
              ))}
              {record.plano.prescricoes.length > 3 && (
                <p className="text-xs text-gray-500 ml-3">
                  +{record.plano.prescricoes.length - 3} mais
                </p>
              )}
            </div>
          </div>
        )}

        {/* Retorno */}
        {record.plano.retorno && (
          <div className="pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              <span className="font-medium">Retorno:</span> {record.plano.retorno}
            </p>
          </div>
        )}

        {/* Footer with metadata */}
        <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            {record.medicoResponsavel && (
              <span>Dr(a). {record.medicoResponsavel}</span>
            )}
            {record.localAtendimento && (
              <span>{record.localAtendimento}</span>
            )}
          </div>
          {record.duracaoConsulta && (
            <span>{record.duracaoConsulta} min</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientTimeline;

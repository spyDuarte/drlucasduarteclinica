import { memo } from 'react';
import {
  CalendarCheck,
  MapPin,
  Edit2,
  Printer,
  Heart,
  Activity,
  Wind,
  Thermometer,
  Droplets,
  Weight,
  Ruler,
  AlertCircle,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Syringe,
  FileCheck
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import type { MedicalRecord } from '../../types';
import { getAppointmentTypeLabel } from './types';

interface MedicalRecordCardProps {
  record: MedicalRecord;
  index: number;
  onEdit: (record: MedicalRecord) => void;
}

export const MedicalRecordCard = memo(function MedicalRecordCard({ record, index, onEdit }: MedicalRecordCardProps) {
  const typeInfo = getAppointmentTypeLabel(record.tipoAtendimento || 'consulta');

  return (
    <div
      className="soap-card record-card-enter"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Card Header */}
      <div className="soap-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
            <CalendarCheck className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {formatDate(record.data, "dd 'de' MMMM 'de' yyyy")}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`appointment-type-badge ${typeInfo.class}`}>
                {typeInfo.label}
              </span>
              {record.localAtendimento && (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {record.localAtendimento}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(record)}
            className="card-action-btn"
            title="Editar"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => window.print()}
            className="card-action-btn"
            title="Imprimir"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SOAP Content */}
      <div className="soap-content space-y-5">
        <SOAPSubjectiveSection record={record} />
        <SOAPObjectiveSection record={record} />
        <SOAPAssessmentSection record={record} />
        <SOAPPlanSection record={record} />
      </div>

      <div className="px-5 pb-4 pt-2 border-t border-slate-100 bg-slate-50/60 text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
        <span>
          Criado em: <strong>{formatDate(record.audit?.createdAt || record.createdAt, 'dd/MM/yyyy HH:mm')}</strong>
          {record.audit?.createdBy && <> por <strong>{record.audit.createdBy}</strong></>}
        </span>
        {record.audit?.lastEditedAt && (
          <span>
            Última edição: <strong>{formatDate(record.audit.lastEditedAt, 'dd/MM/yyyy HH:mm')}</strong>
            {record.audit.lastEditedBy && <> por <strong>{record.audit.lastEditedBy}</strong></>}
          </span>
        )}
        <span>
          Versões: <strong>{record.audit?.versions?.length || 0}</strong>
        </span>
        <span>
          Acessos auditados: <strong>{record.audit?.accessHistory?.length || 0}</strong>
        </span>
      </div>
    </div>
  );
});

function SOAPSubjectiveSection({ record }: { record: MedicalRecord }) {
  return (
    <div className="soap-section-s rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-7 h-7 bg-sky-500 text-white rounded-lg flex items-center justify-center text-xs font-bold">S</span>
        <h4 className="font-semibold text-sky-700">Subjetivo</h4>
      </div>
      <div className="space-y-2 pl-9">
        <div className="flex items-start gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide min-w-[100px]">Queixa:</span>
          <span className="text-sm text-gray-700 font-medium">{record.subjetivo.queixaPrincipal}</span>
          {record.subjetivo.duracaoSintomas && (
            <span className="text-xs px-2 py-0.5 bg-sky-100 text-sky-700 rounded-full ml-2">
              {record.subjetivo.duracaoSintomas}
            </span>
          )}
        </div>
        {record.subjetivo.historicoDoencaAtual && (
          <p className="text-sm text-gray-600 leading-relaxed">{record.subjetivo.historicoDoencaAtual}</p>
        )}
        {(record.subjetivo.fatoresMelhora || record.subjetivo.fatoresPiora) && (
          <div className="flex flex-wrap gap-3 text-xs">
            {record.subjetivo.fatoresMelhora && (
              <span className="flex items-center gap-1 text-emerald-600">
                <ChevronUp className="w-3 h-3" /> Melhora: {record.subjetivo.fatoresMelhora}
              </span>
            )}
            {record.subjetivo.fatoresPiora && (
              <span className="flex items-center gap-1 text-red-600">
                <ChevronDown className="w-3 h-3" /> Piora: {record.subjetivo.fatoresPiora}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SOAPObjectiveSection({ record }: { record: MedicalRecord }) {
  return (
    <div className="soap-section-o rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-7 h-7 bg-emerald-500 text-white rounded-lg flex items-center justify-center text-xs font-bold">O</span>
        <h4 className="font-semibold text-emerald-700">Objetivo</h4>
      </div>
      <div className="space-y-3 pl-9">
        {/* Estado Geral Badges */}
        {(record.objetivo.estadoGeral || record.objetivo.nivelConsciencia || record.objetivo.escalaGlasgow) && (
          <div className="flex flex-wrap gap-2">
            {record.objetivo.estadoGeral && (
              <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium">
                EG: {record.objetivo.estadoGeral}
              </span>
            )}
            {record.objetivo.nivelConsciencia && (
              <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium">
                {record.objetivo.nivelConsciencia.replace('_', ' ')}
              </span>
            )}
            {record.objetivo.escalaGlasgow && (
              <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium">
                Glasgow: {record.objetivo.escalaGlasgow}
              </span>
            )}
          </div>
        )}

        {/* Vitals Grid */}
        {record.objetivo.sinaisVitais && <VitalsGrid vitals={record.objetivo.sinaisVitais} />}

        {record.objetivo.exameFisico && (
          <p className="text-sm text-gray-600 leading-relaxed">{record.objetivo.exameFisico}</p>
        )}
      </div>
    </div>
  );
}

function VitalsGrid({ vitals }: { vitals: MedicalRecord['objetivo']['sinaisVitais'] }) {
  if (!vitals) return null;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {vitals.pressaoArterial && (
        <VitalBadge icon={Heart} label="PA" value={vitals.pressaoArterial} color="rose" />
      )}
      {vitals.frequenciaCardiaca && (
        <VitalBadge icon={Activity} label="FC" value={`${vitals.frequenciaCardiaca}`} unit="bpm" color="red" />
      )}
      {vitals.frequenciaRespiratoria && (
        <VitalBadge icon={Wind} label="FR" value={`${vitals.frequenciaRespiratoria}`} unit="irpm" color="blue" />
      )}
      {vitals.temperatura && (
        <VitalBadge icon={Thermometer} label="Temp" value={`${vitals.temperatura}°C`} color="orange" />
      )}
      {vitals.saturacaoO2 && (
        <VitalBadge icon={Droplets} label="SpO2" value={`${vitals.saturacaoO2}%`} color="cyan" />
      )}
      {vitals.peso && (
        <VitalBadge icon={Weight} label="Peso" value={`${vitals.peso}`} unit="kg" color="violet" />
      )}
      {vitals.imc && (
        <VitalBadge icon={Ruler} label="IMC" value={`${vitals.imc}`} color="indigo" />
      )}
      {vitals.glicemiaCapilar && (
        <VitalBadge icon={Droplets} label="Glicemia" value={`${vitals.glicemiaCapilar}`} unit="mg/dL" color="amber" />
      )}
      {vitals.escalaDor !== undefined && vitals.escalaDor !== null && (
        <div
          className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold ${
            vitals.escalaDor >= 7
              ? 'border-red-200 bg-red-50 text-red-700'
              : vitals.escalaDor >= 4
                ? 'border-amber-200 bg-amber-50 text-amber-700'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <div>
            <p className="text-[10px] uppercase font-semibold opacity-70">Dor</p>
            <p className="text-sm font-bold">{vitals.escalaDor}/10</p>
          </div>
        </div>
      )}
    </div>
  );
}

interface VitalBadgeProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  unit?: string;
  color: string;
}

function VitalBadge({ icon: Icon, label, value, unit, color }: VitalBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
      <Icon className={`w-4 h-4 text-${color}-500`} />
      <div>
        <p className="text-[10px] text-slate-400 uppercase font-semibold">{label}</p>
        <p className="text-sm font-bold text-slate-700">
          {value} {unit && <span className="text-xs font-normal">{unit}</span>}
        </p>
      </div>
    </div>
  );
}

function SOAPAssessmentSection({ record }: { record: MedicalRecord }) {
  return (
    <div className="soap-section-a rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-7 h-7 bg-amber-500 text-white rounded-lg flex items-center justify-center text-xs font-bold">A</span>
        <h4 className="font-semibold text-amber-700">Avaliação</h4>
        {record.avaliacao.gravidade && (
          <span className={`severity-indicator severity-${record.avaliacao.gravidade}`}>
            {record.avaliacao.gravidade}
          </span>
        )}
      </div>
      <div className="space-y-3 pl-9">
        {record.avaliacao.diagnosticoPrincipal && (
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Diagnóstico Principal</p>
            <p className="text-sm font-medium text-gray-800">{record.avaliacao.diagnosticoPrincipal}</p>
          </div>
        )}
        {record.avaliacao.hipotesesDiagnosticas.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {record.avaliacao.hipotesesDiagnosticas.map((diag, idx) => (
              <span key={idx} className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg text-xs font-medium">
                {diag}
              </span>
            ))}
          </div>
        )}
        {record.avaliacao.cid10 && record.avaliacao.cid10.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">CID-10:</span>
            <div className="flex flex-wrap gap-1">
              {record.avaliacao.cid10.map((cid, idx) => (
                <span key={idx} className="cid-chip">{cid}</span>
              ))}
            </div>
          </div>
        )}
        {record.avaliacao.prognostico && (
          <p className="text-xs text-slate-600">
            <span className="font-semibold">Prognóstico:</span> {record.avaliacao.prognostico}
          </p>
        )}
      </div>
    </div>
  );
}

function SOAPPlanSection({ record }: { record: MedicalRecord }) {
  return (
    <div className="soap-section-p rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-7 h-7 bg-violet-500 text-white rounded-lg flex items-center justify-center text-xs font-bold">P</span>
        <h4 className="font-semibold text-violet-700">Plano</h4>
      </div>
      <div className="space-y-3 pl-9">
        {record.plano.conduta && (
          <p className="text-sm text-gray-600 leading-relaxed">{record.plano.conduta}</p>
        )}

        {/* Prescrições */}
        {record.plano.prescricoes && record.plano.prescricoes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Syringe className="w-4 h-4 text-violet-500" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Prescrições</span>
            </div>
            <div className="space-y-2">
              {record.plano.prescricoes.map((rx, idx) => (
                <div key={idx} className="prescription-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {rx.medicamento} {rx.concentracao && <span className="text-slate-500">{rx.concentracao}</span>}
                      </p>
                      <p className="text-xs text-slate-600">{rx.formaFarmaceutica}</p>
                    </div>
                    {rx.usoControlado && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-semibold uppercase">
                        Controlado
                      </span>
                    )}
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                    <span>{rx.posologia}</span>
                    <span>Qtd: {rx.quantidade}</span>
                    {rx.viaAdministracao && <span>Via: {rx.viaAdministracao}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {record.plano.prescricoesNaoMedicamentosas && record.plano.prescricoesNaoMedicamentosas.length > 0 && (
            <InfoBox label="Medidas não medicamentosas" value={record.plano.prescricoesNaoMedicamentosas.join(', ')} />
          )}
          {record.plano.solicitacaoExames && record.plano.solicitacaoExames.length > 0 && (
            <InfoBox label="Exames solicitados" value={record.plano.solicitacaoExames.join(', ')} />
          )}
          {record.plano.encaminhamentos && record.plano.encaminhamentos.length > 0 && (
            <InfoBox
              label="Encaminhamentos"
              value={record.plano.encaminhamentos.map(e => `${e.especialidade} (${e.motivo})`).join(', ')}
            />
          )}
          {record.plano.orientacoes && (
            <InfoBox label="Orientações" value={record.plano.orientacoes} />
          )}
        </div>

        {/* Atestado */}
        {record.plano.atestadoEmitido && (
          <div className="flex items-center gap-2 p-3 bg-violet-50 border border-violet-100 rounded-lg">
            <FileCheck className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-medium text-violet-700">
              Atestado emitido: {record.plano.tipoAtestado?.replace('_', ' ')}
              {record.plano.diasAfastamento && ` - ${record.plano.diasAfastamento} dia(s)`}
            </span>
          </div>
        )}

        {/* Alertas */}
        {record.plano.alertasCuidados && record.plano.alertasCuidados.length > 0 && (
          <div className="alert-card-warning p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-semibold text-amber-700">Alertas:</span>
            </div>
            <p className="text-sm text-amber-800 mt-1">{record.plano.alertasCuidados.join(', ')}</p>
          </div>
        )}

        {/* Retorno */}
        {(record.plano.retorno || record.plano.dataRetorno) && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <CalendarCheck className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">
              Retorno: {record.plano.retorno}
              {record.plano.dataRetorno && ` (${formatDate(record.plano.dataRetorno)})`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-slate-50 rounded-lg">
      <p className="text-xs font-semibold text-slate-500 mb-1">{label}</p>
      <p className="text-sm text-gray-700">{value}</p>
    </div>
  );
}

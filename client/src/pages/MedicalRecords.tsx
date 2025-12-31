import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import {
  ArrowLeft,
  Plus,
  FileText,
  Calendar,
  User,
  AlertTriangle,
  Pill,
  Phone,
  Mail,
  Activity,
  Clipboard,
  Edit2,
  Printer
} from 'lucide-react';
import { formatDate, calculateAge, formatCPF, formatPhone } from '../utils/helpers';
import type { MedicalRecord } from '../types';

export default function MedicalRecords() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { getPatient, getMedicalRecordsByPatient, addMedicalRecord, updateMedicalRecord } = useData();

  const patient = patientId ? getPatient(patientId) : null;
  const records = patientId ? getMedicalRecordsByPatient(patientId) : [];

  const [showNewRecord, setShowNewRecord] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);

  if (!patient) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Paciente não encontrado</h2>
        <Link to="/pacientes" className="text-sky-600 hover:text-sky-700">
          Voltar para lista de pacientes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/pacientes')}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Prontuário do Paciente</h1>
          <p className="text-gray-600">{patient.nome}</p>
        </div>
        <button
          onClick={() => setShowNewRecord(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Atendimento
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Basic Info Card */}
          <div className="card">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-sky-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{patient.nome}</h2>
                <p className="text-gray-500">{formatCPF(patient.cpf)}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  {formatDate(patient.dataNascimento)} ({calculateAge(patient.dataNascimento)} anos)
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{formatPhone(patient.telefone)}</span>
              </div>
              {patient.email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{patient.email}</span>
                </div>
              )}
            </div>

            {patient.convenio && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-800">
                  Convênio: {patient.convenio.nome}
                </p>
                <p className="text-xs text-green-600">
                  Carteira: {patient.convenio.numero}
                </p>
              </div>
            )}
          </div>

          {/* Allergies */}
          {patient.alergias && patient.alergias.length > 0 && (
            <div className="card bg-red-50 border-red-200">
              <div className="flex items-center gap-2 text-red-700 mb-2">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-semibold">Alergias</h3>
              </div>
              <ul className="space-y-1">
                {patient.alergias.map((alergia, idx) => (
                  <li key={idx} className="text-sm text-red-600">• {alergia}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Current Medications */}
          {patient.medicamentosEmUso && patient.medicamentosEmUso.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 text-gray-700 mb-2">
                <Pill className="w-5 h-5" />
                <h3 className="font-semibold">Medicamentos em uso</h3>
              </div>
              <ul className="space-y-1">
                {patient.medicamentosEmUso.map((med, idx) => (
                  <li key={idx} className="text-sm text-gray-600">• {med}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Family History */}
          {patient.historicoFamiliar && (
            <div className="card">
              <div className="flex items-center gap-2 text-gray-700 mb-2">
                <Activity className="w-5 h-5" />
                <h3 className="font-semibold">Histórico familiar</h3>
              </div>
              <p className="text-sm text-gray-600">{patient.historicoFamiliar}</p>
            </div>
          )}
        </div>

        {/* Medical Records */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Clipboard className="w-5 h-5" />
            Histórico de Atendimentos ({records.length})
          </h2>

          {records.length === 0 ? (
            <div className="card text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">Nenhum atendimento registrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {records.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).map(record => (
                <div key={record.id} className="card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {formatDate(record.data, "dd 'de' MMMM 'de' yyyy")}
                        </span>
                      </div>
                      {record.tipoAtendimento && (
                        <span className="px-2 py-0.5 bg-sky-100 text-sky-700 rounded text-xs font-medium">
                          {record.tipoAtendimento === 'consulta' && 'Consulta'}
                          {record.tipoAtendimento === 'retorno' && 'Retorno'}
                          {record.tipoAtendimento === 'urgencia' && 'Urgência'}
                          {record.tipoAtendimento === 'emergencia' && 'Emergência'}
                          {record.tipoAtendimento === 'teleconsulta' && 'Teleconsulta'}
                          {record.tipoAtendimento === 'procedimento' && 'Procedimento'}
                          {record.tipoAtendimento === 'avaliacao_pre_operatoria' && 'Pré-operatório'}
                          {record.tipoAtendimento === 'pos_operatorio' && 'Pós-operatório'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingRecord(record)}
                        className="p-2 text-gray-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="p-2 text-gray-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg"
                        title="Imprimir"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* SOAP Notes */}
                  <div className="space-y-4">
                    {/* Subjective */}
                    <div>
                      <h4 className="text-sm font-semibold text-sky-600 mb-1">S - Subjetivo</h4>
                      <p className="text-sm text-gray-700">
                        <strong>Queixa principal:</strong> {record.subjetivo.queixaPrincipal}
                        {record.subjetivo.duracaoSintomas && (
                          <span className="text-gray-500"> | Duração: {record.subjetivo.duracaoSintomas}</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {record.subjetivo.historicoDoencaAtual}
                      </p>
                      {(record.subjetivo.fatoresMelhora || record.subjetivo.fatoresPiora) && (
                        <div className="mt-1 text-xs text-gray-500">
                          {record.subjetivo.fatoresMelhora && <span>Melhora: {record.subjetivo.fatoresMelhora} | </span>}
                          {record.subjetivo.fatoresPiora && <span>Piora: {record.subjetivo.fatoresPiora}</span>}
                        </div>
                      )}
                      {record.subjetivo.sintomasAssociados && (
                        <p className="text-xs text-gray-500 mt-1">
                          <strong>Sintomas associados:</strong> {record.subjetivo.sintomasAssociados}
                        </p>
                      )}
                    </div>

                    {/* Objective */}
                    <div>
                      <h4 className="text-sm font-semibold text-green-600 mb-1">O - Objetivo</h4>
                      {/* Estado Geral */}
                      {(record.objetivo.estadoGeral || record.objetivo.nivelConsciencia) && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {record.objetivo.estadoGeral && (
                            <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                              EG: {record.objetivo.estadoGeral}
                            </span>
                          )}
                          {record.objetivo.nivelConsciencia && (
                            <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                              {record.objetivo.nivelConsciencia.replace('_', ' ')}
                            </span>
                          )}
                          {record.objetivo.escalaGlasgow && (
                            <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                              Glasgow: {record.objetivo.escalaGlasgow}
                            </span>
                          )}
                        </div>
                      )}
                      {record.objetivo.sinaisVitais && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {record.objetivo.sinaisVitais.pressaoArterial && (
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                              PA: {record.objetivo.sinaisVitais.pressaoArterial} mmHg
                            </span>
                          )}
                          {record.objetivo.sinaisVitais.frequenciaCardiaca && (
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                              FC: {record.objetivo.sinaisVitais.frequenciaCardiaca} bpm
                            </span>
                          )}
                          {record.objetivo.sinaisVitais.frequenciaRespiratoria && (
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                              FR: {record.objetivo.sinaisVitais.frequenciaRespiratoria} irpm
                            </span>
                          )}
                          {record.objetivo.sinaisVitais.temperatura && (
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                              Temp: {record.objetivo.sinaisVitais.temperatura}°C
                            </span>
                          )}
                          {record.objetivo.sinaisVitais.saturacaoO2 && (
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                              SpO2: {record.objetivo.sinaisVitais.saturacaoO2}%
                            </span>
                          )}
                          {record.objetivo.sinaisVitais.glicemiaCapilar && (
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                              Glicemia: {record.objetivo.sinaisVitais.glicemiaCapilar} mg/dL
                            </span>
                          )}
                          {record.objetivo.sinaisVitais.peso && (
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                              Peso: {record.objetivo.sinaisVitais.peso} kg
                            </span>
                          )}
                          {record.objetivo.sinaisVitais.imc && (
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                              IMC: {record.objetivo.sinaisVitais.imc}
                            </span>
                          )}
                          {record.objetivo.sinaisVitais.escalaDor !== undefined && record.objetivo.sinaisVitais.escalaDor !== null && (
                            <span className={`px-2 py-1 rounded text-xs ${record.objetivo.sinaisVitais.escalaDor >= 7 ? 'bg-red-100 text-red-700' : record.objetivo.sinaisVitais.escalaDor >= 4 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100'}`}>
                              Dor: {record.objetivo.sinaisVitais.escalaDor}/10
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-sm text-gray-600">{record.objetivo.exameFisico}</p>
                    </div>

                    {/* Assessment */}
                    <div>
                      <h4 className="text-sm font-semibold text-orange-600 mb-1">A - Avaliação</h4>
                      {record.avaliacao.diagnosticoPrincipal && (
                        <p className="text-sm text-gray-700 mb-1">
                          <strong>Diagnóstico principal:</strong> {record.avaliacao.diagnosticoPrincipal}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {record.avaliacao.hipotesesDiagnosticas.map((diag, idx) => (
                          <span key={idx} className="px-2 py-1 bg-orange-50 text-orange-700 rounded text-xs">
                            {diag}
                          </span>
                        ))}
                      </div>
                      {record.avaliacao.cid10 && record.avaliacao.cid10.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          <strong>CID-10:</strong> {record.avaliacao.cid10.join(', ')}
                        </p>
                      )}
                      {record.avaliacao.gravidade && (
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
                          record.avaliacao.gravidade === 'leve' ? 'bg-green-100 text-green-700' :
                          record.avaliacao.gravidade === 'moderada' ? 'bg-yellow-100 text-yellow-700' :
                          record.avaliacao.gravidade === 'grave' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          Gravidade: {record.avaliacao.gravidade}
                        </span>
                      )}
                      {record.avaliacao.prognostico && (
                        <p className="text-xs text-gray-500 mt-1">
                          <strong>Prognóstico:</strong> {record.avaliacao.prognostico}
                        </p>
                      )}
                    </div>

                    {/* Plan */}
                    <div>
                      <h4 className="text-sm font-semibold text-purple-600 mb-1">P - Plano</h4>
                      <p className="text-sm text-gray-600">{record.plano.conduta}</p>

                      {record.plano.prescricoes && record.plano.prescricoes.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-gray-500 mb-1">Prescrições:</p>
                          <ul className="space-y-1">
                            {record.plano.prescricoes.map((rx, idx) => (
                              <li key={idx} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                <strong>{rx.medicamento}</strong> {rx.concentracao} - {rx.formaFarmaceutica}
                                <br />
                                {rx.posologia} | Qtd: {rx.quantidade}
                                {rx.viaAdministracao && <span className="text-gray-400"> | Via: {rx.viaAdministracao}</span>}
                                {rx.usoControlado && <span className="text-red-500 ml-1">[Controlado]</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {record.plano.prescricoesNaoMedicamentosas && record.plano.prescricoesNaoMedicamentosas.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          <strong>Medidas não medicamentosas:</strong> {record.plano.prescricoesNaoMedicamentosas.join(', ')}
                        </p>
                      )}

                      {record.plano.solicitacaoExames && record.plano.solicitacaoExames.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          <strong>Exames solicitados:</strong> {record.plano.solicitacaoExames.join(', ')}
                        </p>
                      )}

                      {record.plano.encaminhamentos && record.plano.encaminhamentos.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          <strong>Encaminhamentos:</strong> {record.plano.encaminhamentos.map(e => `${e.especialidade} (${e.motivo})`).join(', ')}
                        </p>
                      )}

                      {record.plano.atestadoEmitido && (
                        <p className="text-xs text-purple-600 mt-2">
                          <strong>Atestado emitido:</strong> {record.plano.tipoAtestado?.replace('_', ' ')}
                          {record.plano.diasAfastamento && ` - ${record.plano.diasAfastamento} dia(s)`}
                        </p>
                      )}

                      {record.plano.orientacoes && (
                        <p className="text-xs text-gray-500 mt-2">
                          <strong>Orientações:</strong> {record.plano.orientacoes}
                        </p>
                      )}

                      {record.plano.alertasCuidados && record.plano.alertasCuidados.length > 0 && (
                        <div className="mt-2 p-2 bg-yellow-50 rounded">
                          <p className="text-xs text-yellow-700">
                            <strong>Alertas:</strong> {record.plano.alertasCuidados.join(', ')}
                          </p>
                        </div>
                      )}

                      {(record.plano.retorno || record.plano.dataRetorno) && (
                        <p className="text-xs text-gray-500 mt-2">
                          <strong>Retorno:</strong> {record.plano.retorno}
                          {record.plano.dataRetorno && ` (${formatDate(record.plano.dataRetorno)})`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New/Edit Record Modal */}
      {(showNewRecord || editingRecord) && (
        <MedicalRecordModal
          patientId={patient.id}
          record={editingRecord}
          onClose={() => {
            setShowNewRecord(false);
            setEditingRecord(null);
          }}
          onSave={(data) => {
            if (editingRecord) {
              updateMedicalRecord(editingRecord.id, data);
            } else {
              addMedicalRecord(data as Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>);
            }
            setShowNewRecord(false);
            setEditingRecord(null);
          }}
        />
      )}
    </div>
  );
}

// Medical Record Modal (SOAP Format)
interface MedicalRecordModalProps {
  patientId: string;
  record: MedicalRecord | null;
  onClose: () => void;
  onSave: (data: Partial<MedicalRecord>) => void;
}

interface MedicalRecordFormData {
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
  prescricoes: Array<{ id: string; medicamento: string; concentracao?: string; formaFarmaceutica: string; posologia: string; quantidade: string; duracao?: string; viaAdministracao?: string; usoControlado?: boolean }>;
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

interface PrescriptionFormData {
  medicamento: string;
  concentracao: string;
  formaFarmaceutica: string;
  posologia: string;
  quantidade: string;
  duracao: string;
  viaAdministracao: string;
  usoControlado: boolean;
}

function MedicalRecordModal({ patientId, record, onClose, onSave }: MedicalRecordModalProps) {
  const [formData, setFormData] = useState<MedicalRecordFormData>({
    // Informações gerais
    data: record?.data || new Date().toISOString().split('T')[0],
    tipoAtendimento: record?.tipoAtendimento || 'consulta',
    localAtendimento: record?.localAtendimento || '',

    // Subjetivo
    queixaPrincipal: record?.subjetivo?.queixaPrincipal || '',
    duracaoSintomas: record?.subjetivo?.duracaoSintomas || '',
    historicoDoencaAtual: record?.subjetivo?.historicoDoencaAtual || '',
    fatoresMelhora: record?.subjetivo?.fatoresMelhora || '',
    fatoresPiora: record?.subjetivo?.fatoresPiora || '',
    sintomasAssociados: record?.subjetivo?.sintomasAssociados || '',
    tratamentosPrevios: record?.subjetivo?.tratamentosPrevios || '',
    impactoQualidadeVida: record?.subjetivo?.impactoQualidadeVida || '',
    revisaoSistemas: record?.subjetivo?.revisaoSistemas || '',
    // Hábitos de vida
    tabagismo: record?.subjetivo?.habitosVida?.tabagismo || '',
    etilismo: record?.subjetivo?.habitosVida?.etilismo || '',
    atividadeFisica: record?.subjetivo?.habitosVida?.atividadeFisica || '',
    alimentacao: record?.subjetivo?.habitosVida?.alimentacao || '',
    sono: record?.subjetivo?.habitosVida?.sono || '',
    estresse: record?.subjetivo?.habitosVida?.estresse || '',
    // Histórico
    historicoPatologicoPregrasso: record?.subjetivo?.historicoPatologicoPregrasso || '',
    cirurgiasAnteriores: record?.subjetivo?.cirurgiasAnteriores?.join(', ') || '',
    internacoesPrevias: record?.subjetivo?.internacoesPrevias || '',
    vacinacao: record?.subjetivo?.vacinacao || '',

    // Objetivo
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
    // Exame físico detalhado
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

    // Avaliação
    hipotesesDiagnosticas: record?.avaliacao?.hipotesesDiagnosticas?.join(', ') || '',
    diagnosticoPrincipal: record?.avaliacao?.diagnosticoPrincipal || '',
    diagnosticosSecundarios: record?.avaliacao?.diagnosticosSecundarios?.join(', ') || '',
    cid10: record?.avaliacao?.cid10?.join(', ') || '',
    diagnosticoDiferencial: record?.avaliacao?.diagnosticoDiferencial?.join(', ') || '',
    gravidade: record?.avaliacao?.gravidade || '',
    prognostico: record?.avaliacao?.prognostico || '',
    classificacaoRisco: record?.avaliacao?.classificacaoRisco || '',

    // Plano
    conduta: record?.plano?.conduta || '',
    prescricoes: record?.plano?.prescricoes || [],
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

    // Informações adicionais
    intercorrencias: record?.intercorrencias || '',
    consentimentoInformado: record?.consentimentoInformado || false
  });

  const [newPrescription, setNewPrescription] = useState<PrescriptionFormData>({
    medicamento: '',
    concentracao: '',
    formaFarmaceutica: 'Comprimido',
    posologia: '',
    quantidade: '',
    duracao: '',
    viaAdministracao: 'Oral',
    usoControlado: false
  });

  // Estado para controlar seções colapsáveis
  const [expandedSections, setExpandedSections] = useState({
    habitosVida: false,
    historicoPregrasso: false,
    exameFisicoDetalhado: false,
    documentos: false,
    planoTerapeutico: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleAddPrescription = () => {
    if (newPrescription.medicamento && newPrescription.posologia) {
      setFormData(prev => ({
        ...prev,
        prescricoes: [...prev.prescricoes, { ...newPrescription, id: Date.now().toString() }]
      }));
      setNewPrescription({
        medicamento: '',
        concentracao: '',
        formaFarmaceutica: 'Comprimido',
        posologia: '',
        quantidade: '',
        duracao: '',
        viaAdministracao: 'Oral',
        usoControlado: false
      });
    }
  };

  const handleRemovePrescription = (index: number) => {
    setFormData(prev => ({
      ...prev,
      prescricoes: prev.prescricoes.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const peso = formData.peso ? parseFloat(formData.peso) : undefined;
    const altura = formData.altura ? parseFloat(formData.altura) : undefined;
    const imc = peso && altura ? parseFloat((peso / ((altura/100) ** 2)).toFixed(1)) : undefined;

    // Processar encaminhamentos
    const encaminhamentosProcessados = formData.encaminhamentos
      ? formData.encaminhamentos.split(';').map(e => {
          const parts = e.split(':').map(p => p.trim());
          return {
            especialidade: parts[0] || '',
            motivo: parts[1] || ''
          };
        }).filter(e => e.especialidade)
      : undefined;

    // Processar procedimentos realizados
    const procedimentosProcessados = formData.procedimentosRealizados
      ? formData.procedimentosRealizados.split(',').map(p => ({
          nome: p.trim()
        })).filter(p => p.nome)
      : undefined;

    const data: Partial<MedicalRecord> = {
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
        prescricoes: formData.prescricoes.length > 0 ? formData.prescricoes : undefined,
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

    onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold text-gray-900">
            {record ? 'Editar Atendimento' : 'Novo Atendimento'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informações Gerais do Atendimento */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Informações do Atendimento</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Data do atendimento</label>
                <input
                  type="date"
                  value={formData.data}
                  onChange={e => setFormData({ ...formData, data: e.target.value })}
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tipo de atendimento</label>
                <select
                  value={formData.tipoAtendimento}
                  onChange={e => setFormData({ ...formData, tipoAtendimento: e.target.value })}
                  className="input-field text-sm"
                >
                  <option value="consulta">Consulta</option>
                  <option value="retorno">Retorno</option>
                  <option value="urgencia">Urgência</option>
                  <option value="emergencia">Emergência</option>
                  <option value="teleconsulta">Teleconsulta</option>
                  <option value="procedimento">Procedimento</option>
                  <option value="avaliacao_pre_operatoria">Avaliação Pré-operatória</option>
                  <option value="pos_operatorio">Pós-operatório</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Local do atendimento</label>
                <input
                  type="text"
                  value={formData.localAtendimento}
                  onChange={e => setFormData({ ...formData, localAtendimento: e.target.value })}
                  className="input-field text-sm"
                  placeholder="Consultório, Hospital, etc."
                />
              </div>
            </div>
          </div>

          {/* SOAP - Subjective */}
          <div className="border-l-4 border-sky-500 pl-4">
            <h3 className="text-lg font-semibold text-sky-600 mb-3">S - Subjetivo</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Queixa principal</label>
                  <input
                    type="text"
                    value={formData.queixaPrincipal}
                    onChange={e => setFormData({ ...formData, queixaPrincipal: e.target.value })}
                    className="input-field"
                    placeholder="Motivo principal da consulta"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duração dos sintomas</label>
                  <input
                    type="text"
                    value={formData.duracaoSintomas}
                    onChange={e => setFormData({ ...formData, duracaoSintomas: e.target.value })}
                    className="input-field"
                    placeholder="Ex: 3 dias, 2 semanas, 1 mês"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">História da doença atual</label>
                <textarea
                  value={formData.historicoDoencaAtual}
                  onChange={e => setFormData({ ...formData, historicoDoencaAtual: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Descreva a evolução dos sintomas..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fatores de melhora</label>
                  <input
                    type="text"
                    value={formData.fatoresMelhora}
                    onChange={e => setFormData({ ...formData, fatoresMelhora: e.target.value })}
                    className="input-field"
                    placeholder="O que alivia os sintomas?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fatores de piora</label>
                  <input
                    type="text"
                    value={formData.fatoresPiora}
                    onChange={e => setFormData({ ...formData, fatoresPiora: e.target.value })}
                    className="input-field"
                    placeholder="O que agrava os sintomas?"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sintomas associados</label>
                  <input
                    type="text"
                    value={formData.sintomasAssociados}
                    onChange={e => setFormData({ ...formData, sintomasAssociados: e.target.value })}
                    className="input-field"
                    placeholder="Outros sintomas relacionados"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tratamentos prévios</label>
                  <input
                    type="text"
                    value={formData.tratamentosPrevios}
                    onChange={e => setFormData({ ...formData, tratamentosPrevios: e.target.value })}
                    className="input-field"
                    placeholder="Medicamentos ou tratamentos já tentados"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Impacto na qualidade de vida</label>
                <input
                  type="text"
                  value={formData.impactoQualidadeVida}
                  onChange={e => setFormData({ ...formData, impactoQualidadeVida: e.target.value })}
                  className="input-field"
                  placeholder="Como afeta as atividades diárias?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Revisão de sistemas</label>
                <textarea
                  value={formData.revisaoSistemas}
                  onChange={e => setFormData({ ...formData, revisaoSistemas: e.target.value })}
                  className="input-field"
                  rows={2}
                  placeholder="Cardiovascular, respiratório, gastrointestinal, etc."
                />
              </div>

              {/* Seção colapsável: Hábitos de Vida */}
              <div className="border rounded-lg">
                <button
                  type="button"
                  onClick={() => toggleSection('habitosVida')}
                  className="w-full px-4 py-2 text-left text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-t-lg flex items-center justify-between"
                >
                  <span>Hábitos de Vida</span>
                  <span>{expandedSections.habitosVida ? '−' : '+'}</span>
                </button>
                {expandedSections.habitosVida && (
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Tabagismo</label>
                        <input
                          type="text"
                          value={formData.tabagismo}
                          onChange={e => setFormData({ ...formData, tabagismo: e.target.value })}
                          className="input-field text-sm"
                          placeholder="Nunca, ex-fumante, ativo..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Etilismo</label>
                        <input
                          type="text"
                          value={formData.etilismo}
                          onChange={e => setFormData({ ...formData, etilismo: e.target.value })}
                          className="input-field text-sm"
                          placeholder="Social, frequente, abstêmio..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Atividade física</label>
                        <input
                          type="text"
                          value={formData.atividadeFisica}
                          onChange={e => setFormData({ ...formData, atividadeFisica: e.target.value })}
                          className="input-field text-sm"
                          placeholder="Sedentário, moderado, intenso..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Alimentação</label>
                        <input
                          type="text"
                          value={formData.alimentacao}
                          onChange={e => setFormData({ ...formData, alimentacao: e.target.value })}
                          className="input-field text-sm"
                          placeholder="Equilibrada, restritiva..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Sono</label>
                        <input
                          type="text"
                          value={formData.sono}
                          onChange={e => setFormData({ ...formData, sono: e.target.value })}
                          className="input-field text-sm"
                          placeholder="Horas/noite, qualidade..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Estresse</label>
                        <input
                          type="text"
                          value={formData.estresse}
                          onChange={e => setFormData({ ...formData, estresse: e.target.value })}
                          className="input-field text-sm"
                          placeholder="Baixo, moderado, alto..."
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Seção colapsável: Histórico Patológico */}
              <div className="border rounded-lg">
                <button
                  type="button"
                  onClick={() => toggleSection('historicoPregrasso')}
                  className="w-full px-4 py-2 text-left text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-t-lg flex items-center justify-between"
                >
                  <span>Histórico Patológico Pregresso</span>
                  <span>{expandedSections.historicoPregrasso ? '−' : '+'}</span>
                </button>
                {expandedSections.historicoPregrasso && (
                  <div className="p-4 space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Doenças prévias</label>
                      <textarea
                        value={formData.historicoPatologicoPregrasso}
                        onChange={e => setFormData({ ...formData, historicoPatologicoPregrasso: e.target.value })}
                        className="input-field text-sm"
                        rows={2}
                        placeholder="HAS, DM, dislipidemia, etc."
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Cirurgias anteriores (separadas por vírgula)</label>
                        <input
                          type="text"
                          value={formData.cirurgiasAnteriores}
                          onChange={e => setFormData({ ...formData, cirurgiasAnteriores: e.target.value })}
                          className="input-field text-sm"
                          placeholder="Apendicectomia (2015), Colecistectomia (2018)..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Internações prévias</label>
                        <input
                          type="text"
                          value={formData.internacoesPrevias}
                          onChange={e => setFormData({ ...formData, internacoesPrevias: e.target.value })}
                          className="input-field text-sm"
                          placeholder="Motivo e data"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Vacinação</label>
                      <input
                        type="text"
                        value={formData.vacinacao}
                        onChange={e => setFormData({ ...formData, vacinacao: e.target.value })}
                        className="input-field text-sm"
                        placeholder="Status vacinal, vacinas recentes..."
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SOAP - Objective */}
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="text-lg font-semibold text-green-600 mb-3">O - Objetivo</h3>
            <div className="space-y-4">
              {/* Estado Geral */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Estado geral</label>
                  <select
                    value={formData.estadoGeral}
                    onChange={e => setFormData({ ...formData, estadoGeral: e.target.value })}
                    className="input-field text-sm"
                  >
                    <option value="">Selecione</option>
                    <option value="bom">Bom</option>
                    <option value="regular">Regular</option>
                    <option value="ruim">Ruim</option>
                    <option value="grave">Grave</option>
                    <option value="gravissimo">Gravíssimo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Nível de consciência</label>
                  <select
                    value={formData.nivelConsciencia}
                    onChange={e => setFormData({ ...formData, nivelConsciencia: e.target.value })}
                    className="input-field text-sm"
                  >
                    <option value="">Selecione</option>
                    <option value="consciente_orientado">Consciente e Orientado</option>
                    <option value="consciente_desorientado">Consciente e Desorientado</option>
                    <option value="sonolento">Sonolento</option>
                    <option value="torporoso">Torporoso</option>
                    <option value="comatoso">Comatoso</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Glasgow (3-15)</label>
                  <input
                    type="number"
                    min="3"
                    max="15"
                    value={formData.escalaGlasgow}
                    onChange={e => setFormData({ ...formData, escalaGlasgow: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Escala de dor (0-10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.escalaDor}
                    onChange={e => setFormData({ ...formData, escalaDor: e.target.value })}
                    className="input-field text-sm"
                    placeholder="EVA"
                  />
                </div>
              </div>

              {/* Sinais Vitais Completos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sinais Vitais</label>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">PA (mmHg)</label>
                    <input
                      type="text"
                      value={formData.pressaoArterial}
                      onChange={e => setFormData({ ...formData, pressaoArterial: e.target.value })}
                      className="input-field text-sm"
                      placeholder="120/80"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">PA deitado</label>
                    <input
                      type="text"
                      value={formData.pressaoArterialDeitado}
                      onChange={e => setFormData({ ...formData, pressaoArterialDeitado: e.target.value })}
                      className="input-field text-sm"
                      placeholder="120/80"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">PA em pé</label>
                    <input
                      type="text"
                      value={formData.pressaoArterialEmPe}
                      onChange={e => setFormData({ ...formData, pressaoArterialEmPe: e.target.value })}
                      className="input-field text-sm"
                      placeholder="120/80"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">FC (bpm)</label>
                    <input
                      type="number"
                      value={formData.frequenciaCardiaca}
                      onChange={e => setFormData({ ...formData, frequenciaCardiaca: e.target.value })}
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">FR (irpm)</label>
                    <input
                      type="number"
                      value={formData.frequenciaRespiratoria}
                      onChange={e => setFormData({ ...formData, frequenciaRespiratoria: e.target.value })}
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Temp (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.temperatura}
                      onChange={e => setFormData({ ...formData, temperatura: e.target.value })}
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">SpO2 (%)</label>
                    <input
                      type="number"
                      value={formData.saturacaoO2}
                      onChange={e => setFormData({ ...formData, saturacaoO2: e.target.value })}
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Glicemia (mg/dL)</label>
                    <input
                      type="number"
                      value={formData.glicemiaCapilar}
                      onChange={e => setFormData({ ...formData, glicemiaCapilar: e.target.value })}
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Peso (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.peso}
                      onChange={e => setFormData({ ...formData, peso: e.target.value })}
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Altura (cm)</label>
                    <input
                      type="number"
                      value={formData.altura}
                      onChange={e => setFormData({ ...formData, altura: e.target.value })}
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Circ. Abdominal (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.circunferenciaAbdominal}
                      onChange={e => setFormData({ ...formData, circunferenciaAbdominal: e.target.value })}
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Circ. Pescoço (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.circunferenciaPescoco}
                      onChange={e => setFormData({ ...formData, circunferenciaPescoco: e.target.value })}
                      className="input-field text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exame físico geral</label>
                <textarea
                  value={formData.exameFisico}
                  onChange={e => setFormData({ ...formData, exameFisico: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Descreva os achados do exame físico..."
                />
              </div>

              {/* Seção colapsável: Exame Físico Detalhado */}
              <div className="border rounded-lg">
                <button
                  type="button"
                  onClick={() => toggleSection('exameFisicoDetalhado')}
                  className="w-full px-4 py-2 text-left text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-t-lg flex items-center justify-between"
                >
                  <span>Exame Físico Detalhado por Sistemas</span>
                  <span>{expandedSections.exameFisicoDetalhado ? '−' : '+'}</span>
                </button>
                {expandedSections.exameFisicoDetalhado && (
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Cabeça e Pescoço</label>
                        <input
                          type="text"
                          value={formData.exameCabecaPescoco}
                          onChange={e => setFormData({ ...formData, exameCabecaPescoco: e.target.value })}
                          className="input-field text-sm"
                          placeholder="Achados..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Olhos</label>
                        <input
                          type="text"
                          value={formData.exameOlhos}
                          onChange={e => setFormData({ ...formData, exameOlhos: e.target.value })}
                          className="input-field text-sm"
                          placeholder="Pupilas, conjuntivas, esclerótica..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Ouvidos</label>
                        <input
                          type="text"
                          value={formData.exameOuvidos}
                          onChange={e => setFormData({ ...formData, exameOuvidos: e.target.value })}
                          className="input-field text-sm"
                          placeholder="Otoscopia, audição..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Boca e Orofaringe</label>
                        <input
                          type="text"
                          value={formData.exameBoca}
                          onChange={e => setFormData({ ...formData, exameBoca: e.target.value })}
                          className="input-field text-sm"
                          placeholder="Mucosas, dentição, amígdalas..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Cardiovascular</label>
                        <input
                          type="text"
                          value={formData.exameCardiovascular}
                          onChange={e => setFormData({ ...formData, exameCardiovascular: e.target.value })}
                          className="input-field text-sm"
                          placeholder="RCR, sopros, pulsos..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Pulmonar</label>
                        <input
                          type="text"
                          value={formData.examePulmonar}
                          onChange={e => setFormData({ ...formData, examePulmonar: e.target.value })}
                          className="input-field text-sm"
                          placeholder="MV, ruídos adventícios..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Abdome</label>
                        <input
                          type="text"
                          value={formData.exameAbdome}
                          onChange={e => setFormData({ ...formData, exameAbdome: e.target.value })}
                          className="input-field text-sm"
                          placeholder="RHA, dor, massas, visceromegalias..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Neurológico</label>
                        <input
                          type="text"
                          value={formData.exameNeurologico}
                          onChange={e => setFormData({ ...formData, exameNeurologico: e.target.value })}
                          className="input-field text-sm"
                          placeholder="Força, sensibilidade, reflexos..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Pele</label>
                        <input
                          type="text"
                          value={formData.examePele}
                          onChange={e => setFormData({ ...formData, examePele: e.target.value })}
                          className="input-field text-sm"
                          placeholder="Coloração, lesões, hidratação..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Extremidades</label>
                        <input
                          type="text"
                          value={formData.exameExtremidades}
                          onChange={e => setFormData({ ...formData, exameExtremidades: e.target.value })}
                          className="input-field text-sm"
                          placeholder="Edema, perfusão, pulsos..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Musculoesquelético</label>
                        <input
                          type="text"
                          value={formData.exameMusculoesqueletico}
                          onChange={e => setFormData({ ...formData, exameMusculoesqueletico: e.target.value })}
                          className="input-field text-sm"
                          placeholder="Articulações, coluna, marcha..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Psiquiátrico</label>
                        <input
                          type="text"
                          value={formData.examePsiquiatrico}
                          onChange={e => setFormData({ ...formData, examePsiquiatrico: e.target.value })}
                          className="input-field text-sm"
                          placeholder="Humor, afeto, pensamento..."
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exames complementares</label>
                <textarea
                  value={formData.examesComplementares}
                  onChange={e => setFormData({ ...formData, examesComplementares: e.target.value })}
                  className="input-field"
                  rows={2}
                  placeholder="Resultados de exames trazidos pelo paciente..."
                />
              </div>
            </div>
          </div>

          {/* SOAP - Assessment */}
          <div className="border-l-4 border-orange-500 pl-4">
            <h3 className="text-lg font-semibold text-orange-600 mb-3">A - Avaliação</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Diagnóstico principal</label>
                  <input
                    type="text"
                    value={formData.diagnosticoPrincipal}
                    onChange={e => setFormData({ ...formData, diagnosticoPrincipal: e.target.value })}
                    className="input-field"
                    placeholder="Diagnóstico mais provável"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CID-10 *</label>
                  <input
                    type="text"
                    value={formData.cid10}
                    onChange={e => setFormData({ ...formData, cid10: e.target.value })}
                    className="input-field"
                    placeholder="Ex: J11, R50.9 (separados por vírgula)"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hipóteses diagnósticas (separadas por vírgula)</label>
                <input
                  type="text"
                  value={formData.hipotesesDiagnosticas}
                  onChange={e => setFormData({ ...formData, hipotesesDiagnosticas: e.target.value })}
                  className="input-field"
                  placeholder="Lista de possíveis diagnósticos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnósticos secundários (separados por vírgula)</label>
                <input
                  type="text"
                  value={formData.diagnosticosSecundarios}
                  onChange={e => setFormData({ ...formData, diagnosticosSecundarios: e.target.value })}
                  className="input-field"
                  placeholder="Comorbidades, diagnósticos associados"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnóstico diferencial (separados por vírgula)</label>
                <input
                  type="text"
                  value={formData.diagnosticoDiferencial}
                  onChange={e => setFormData({ ...formData, diagnosticoDiferencial: e.target.value })}
                  className="input-field"
                  placeholder="Diagnósticos a serem descartados"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gravidade</label>
                  <select
                    value={formData.gravidade}
                    onChange={e => setFormData({ ...formData, gravidade: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Selecione</option>
                    <option value="leve">Leve</option>
                    <option value="moderada">Moderada</option>
                    <option value="grave">Grave</option>
                    <option value="critica">Crítica</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prognóstico</label>
                  <input
                    type="text"
                    value={formData.prognostico}
                    onChange={e => setFormData({ ...formData, prognostico: e.target.value })}
                    className="input-field"
                    placeholder="Bom, reservado, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Classificação de risco</label>
                  <input
                    type="text"
                    value={formData.classificacaoRisco}
                    onChange={e => setFormData({ ...formData, classificacaoRisco: e.target.value })}
                    className="input-field"
                    placeholder="Manchester, ESI, etc."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SOAP - Plan */}
          <div className="border-l-4 border-purple-500 pl-4">
            <h3 className="text-lg font-semibold text-purple-600 mb-3">P - Plano</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conduta</label>
                <textarea
                  value={formData.conduta}
                  onChange={e => setFormData({ ...formData, conduta: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Descreva o plano terapêutico..."
                />
              </div>

              {/* Prescriptions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prescrições Medicamentosas</label>
                {formData.prescricoes.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {formData.prescricoes.map((rx, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <span className="flex-1 text-sm">
                          <strong>{rx.medicamento}</strong> {rx.concentracao} - {rx.formaFarmaceutica} - {rx.posologia}
                          {rx.viaAdministracao && <span className="text-gray-500"> | Via: {rx.viaAdministracao}</span>}
                          {rx.usoControlado && <span className="text-red-500 ml-2">[Controlado]</span>}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemovePrescription(idx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                  <input
                    type="text"
                    value={newPrescription.medicamento}
                    onChange={e => setNewPrescription({ ...newPrescription, medicamento: e.target.value })}
                    className="input-field text-sm"
                    placeholder="Medicamento"
                  />
                  <input
                    type="text"
                    value={newPrescription.concentracao}
                    onChange={e => setNewPrescription({ ...newPrescription, concentracao: e.target.value })}
                    className="input-field text-sm"
                    placeholder="Concentração"
                  />
                  <select
                    value={newPrescription.formaFarmaceutica}
                    onChange={e => setNewPrescription({ ...newPrescription, formaFarmaceutica: e.target.value })}
                    className="input-field text-sm"
                  >
                    <option>Comprimido</option>
                    <option>Cápsula</option>
                    <option>Solução oral</option>
                    <option>Suspensão</option>
                    <option>Xarope</option>
                    <option>Gotas</option>
                    <option>Pomada</option>
                    <option>Creme</option>
                    <option>Gel</option>
                    <option>Colírio</option>
                    <option>Spray nasal</option>
                    <option>Inalatório</option>
                    <option>Injetável IM</option>
                    <option>Injetável IV</option>
                    <option>Injetável SC</option>
                    <option>Supositório</option>
                    <option>Adesivo</option>
                  </select>
                  <input
                    type="text"
                    value={newPrescription.posologia}
                    onChange={e => setNewPrescription({ ...newPrescription, posologia: e.target.value })}
                    className="input-field text-sm"
                    placeholder="Posologia"
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  <input
                    type="text"
                    value={newPrescription.quantidade}
                    onChange={e => setNewPrescription({ ...newPrescription, quantidade: e.target.value })}
                    className="input-field text-sm"
                    placeholder="Quantidade"
                  />
                  <input
                    type="text"
                    value={newPrescription.duracao}
                    onChange={e => setNewPrescription({ ...newPrescription, duracao: e.target.value })}
                    className="input-field text-sm"
                    placeholder="Duração"
                  />
                  <select
                    value={newPrescription.viaAdministracao}
                    onChange={e => setNewPrescription({ ...newPrescription, viaAdministracao: e.target.value })}
                    className="input-field text-sm"
                  >
                    <option value="Oral">Oral</option>
                    <option value="Sublingual">Sublingual</option>
                    <option value="Tópica">Tópica</option>
                    <option value="Intramuscular">Intramuscular</option>
                    <option value="Intravenosa">Intravenosa</option>
                    <option value="Subcutânea">Subcutânea</option>
                    <option value="Retal">Retal</option>
                    <option value="Inalatória">Inalatória</option>
                    <option value="Nasal">Nasal</option>
                    <option value="Oftálmica">Oftálmica</option>
                    <option value="Otológica">Otológica</option>
                  </select>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={newPrescription.usoControlado}
                      onChange={e => setNewPrescription({ ...newPrescription, usoControlado: e.target.checked })}
                      className="rounded"
                    />
                    Uso controlado
                  </label>
                  <button
                    type="button"
                    onClick={handleAddPrescription}
                    className="btn-secondary text-sm"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prescrições não medicamentosas (separadas por vírgula)</label>
                <input
                  type="text"
                  value={formData.prescricoesNaoMedicamentosas}
                  onChange={e => setFormData({ ...formData, prescricoesNaoMedicamentosas: e.target.value })}
                  className="input-field"
                  placeholder="Repouso, dieta, fisioterapia, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Solicitação de exames (separados por vírgula)</label>
                  <input
                    type="text"
                    value={formData.solicitacaoExames}
                    onChange={e => setFormData({ ...formData, solicitacaoExames: e.target.value })}
                    className="input-field"
                    placeholder="Hemograma, glicemia, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Procedimentos realizados (separados por vírgula)</label>
                  <input
                    type="text"
                    value={formData.procedimentosRealizados}
                    onChange={e => setFormData({ ...formData, procedimentosRealizados: e.target.value })}
                    className="input-field"
                    placeholder="Sutura, drenagem, etc."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Encaminhamentos (formato: Especialidade: Motivo; separados por ponto e vírgula)</label>
                <input
                  type="text"
                  value={formData.encaminhamentos}
                  onChange={e => setFormData({ ...formData, encaminhamentos: e.target.value })}
                  className="input-field"
                  placeholder="Cardiologia: avaliação de sopro; Ortopedia: dor lombar crônica"
                />
              </div>

              {/* Seção colapsável: Documentos */}
              <div className="border rounded-lg">
                <button
                  type="button"
                  onClick={() => toggleSection('documentos')}
                  className="w-full px-4 py-2 text-left text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-t-lg flex items-center justify-between"
                >
                  <span>Atestados e Documentos</span>
                  <span>{expandedSections.documentos ? '−' : '+'}</span>
                </button>
                {expandedSections.documentos && (
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.atestadoEmitido}
                          onChange={e => setFormData({ ...formData, atestadoEmitido: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm">Atestado emitido</span>
                      </label>
                    </div>
                    {formData.atestadoEmitido && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Tipo de atestado</label>
                          <select
                            value={formData.tipoAtestado}
                            onChange={e => setFormData({ ...formData, tipoAtestado: e.target.value })}
                            className="input-field text-sm"
                          >
                            <option value="">Selecione</option>
                            <option value="atestado_medico">Atestado médico</option>
                            <option value="declaracao_comparecimento">Declaração de comparecimento</option>
                            <option value="laudo">Laudo médico</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Dias de afastamento</label>
                          <input
                            type="number"
                            value={formData.diasAfastamento}
                            onChange={e => setFormData({ ...formData, diasAfastamento: e.target.value })}
                            className="input-field text-sm"
                            placeholder="Número de dias"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Retorno e orientações */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Retorno</label>
                  <input
                    type="text"
                    value={formData.retorno}
                    onChange={e => setFormData({ ...formData, retorno: e.target.value })}
                    className="input-field"
                    placeholder="Ex: 30 dias, 1 semana, se necessário"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data do retorno</label>
                  <input
                    type="date"
                    value={formData.dataRetorno}
                    onChange={e => setFormData({ ...formData, dataRetorno: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Orientações ao paciente</label>
                <textarea
                  value={formData.orientacoes}
                  onChange={e => setFormData({ ...formData, orientacoes: e.target.value })}
                  className="input-field"
                  rows={2}
                  placeholder="Instruções gerais para o paciente..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Orientações alimentares</label>
                  <textarea
                    value={formData.orientacoesAlimentares}
                    onChange={e => setFormData({ ...formData, orientacoesAlimentares: e.target.value })}
                    className="input-field"
                    rows={2}
                    placeholder="Restrições ou recomendações alimentares..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Restrições de atividades</label>
                  <textarea
                    value={formData.restricoesAtividades}
                    onChange={e => setFormData({ ...formData, restricoesAtividades: e.target.value })}
                    className="input-field"
                    rows={2}
                    placeholder="Atividades a evitar..."
                  />
                </div>
              </div>

              {/* Seção colapsável: Plano Terapêutico */}
              <div className="border rounded-lg">
                <button
                  type="button"
                  onClick={() => toggleSection('planoTerapeutico')}
                  className="w-full px-4 py-2 text-left text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-t-lg flex items-center justify-between"
                >
                  <span>Plano Terapêutico Detalhado</span>
                  <span>{expandedSections.planoTerapeutico ? '−' : '+'}</span>
                </button>
                {expandedSections.planoTerapeutico && (
                  <div className="p-4 space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Objetivos do tratamento</label>
                      <textarea
                        value={formData.objetivosTratamento}
                        onChange={e => setFormData({ ...formData, objetivosTratamento: e.target.value })}
                        className="input-field text-sm"
                        rows={2}
                        placeholder="Metas a serem alcançadas..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Metas terapêuticas (separadas por vírgula)</label>
                      <input
                        type="text"
                        value={formData.metasTerapeuticas}
                        onChange={e => setFormData({ ...formData, metasTerapeuticas: e.target.value })}
                        className="input-field text-sm"
                        placeholder="PA < 140/90, HbA1c < 7%, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Alertas e cuidados especiais (separados por vírgula)</label>
                      <input
                        type="text"
                        value={formData.alertasCuidados}
                        onChange={e => setFormData({ ...formData, alertasCuidados: e.target.value })}
                        className="input-field text-sm"
                        placeholder="Sinais de alerta, quando procurar emergência..."
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Intercorrências */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Intercorrências durante o atendimento</label>
                <textarea
                  value={formData.intercorrencias}
                  onChange={e => setFormData({ ...formData, intercorrencias: e.target.value })}
                  className="input-field"
                  rows={2}
                  placeholder="Eventos ou complicações durante a consulta..."
                />
              </div>

              {/* Consentimento */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.consentimentoInformado}
                  onChange={e => setFormData({ ...formData, consentimentoInformado: e.target.checked })}
                  className="rounded"
                />
                <label className="text-sm text-gray-700">
                  Paciente recebeu e compreendeu as orientações e consentiu com o plano terapêutico
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {record ? 'Salvar alterações' : 'Registrar atendimento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

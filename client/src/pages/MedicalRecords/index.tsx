import { useState, useMemo, memo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import {
  ArrowLeft,
  Plus,
  FileText,
  Clipboard,
  Stethoscope,
  FileSignature,
  CalendarPlus,
  FlaskConical,
  Pill,
  Search,
  Calendar,
  ChevronDown,
  Activity,
  TrendingUp,
  Clock,
  AlertCircle,
  X,
  FileCheck
} from 'lucide-react';
import type { MedicalRecord, MedicalDocument, Patient } from '../../types';

import { PatientSidebar } from './PatientSidebar';
import { MedicalRecordCard } from './MedicalRecordCard';
import { MedicalRecordModal } from './MedicalRecordModal';
import { formatDate } from '../../utils/helpers';

// Tabs disponíveis
type TabType = 'atendimentos' | 'documentos' | 'resumo';

export default function MedicalRecords() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const {
    getPatient,
    getMedicalRecordsByPatient,
    addMedicalRecord,
    updateMedicalRecord,
    getDocumentsByPatient,
    getAppointmentsByPatient
  } = useData();

  const patient = useMemo(() => (patientId ? getPatient(patientId) : null), [patientId, getPatient]);
  // records já vem ordenado por data decrescente do getMedicalRecordsByPatient
  const records = useMemo(() => (patientId ? getMedicalRecordsByPatient(patientId) : []), [patientId, getMedicalRecordsByPatient]);
  const documents = useMemo(() => (patientId ? getDocumentsByPatient(patientId) : []), [patientId, getDocumentsByPatient]);
  const appointments = useMemo(() => (patientId ? getAppointmentsByPatient(patientId) : []), [patientId, getAppointmentsByPatient]);

  const [showNewRecord, setShowNewRecord] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('atendimentos');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('todos');
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Próxima consulta agendada
  const nextAppointment = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return appointments
      .filter(a => a.data >= today && a.status !== 'cancelada' && a.status !== 'finalizada')
      .sort((a, b) => a.data.localeCompare(b.data))[0];
  }, [appointments]);

  // Último atendimento com sinais vitais
  const lastVitals = useMemo(() => {
    const recordWithVitals = records.find(r => r.objetivo?.sinaisVitais);
    return recordWithVitals?.objetivo?.sinaisVitais;
  }, [records]);

  // Filtrar registros
  const filteredRecords = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return records.filter(record => {
      const matchesSearch = searchTerm === '' ||
        record.subjetivo?.queixaPrincipal?.toLowerCase().includes(searchLower) ||
        record.avaliacao?.diagnosticoPrincipal?.toLowerCase().includes(searchLower) ||
        record.avaliacao?.hipotesesDiagnosticas?.some(h => h.toLowerCase().includes(searchLower)) ||
        record.avaliacao?.cid10?.some(c => c.toLowerCase().includes(searchLower));

      const matchesType = filterType === 'todos' || record.tipoAtendimento === filterType;

      return matchesSearch && matchesType;
    });
  }, [records, searchTerm, filterType]);

  if (!patient) {
    return (
      <div className="empty-state max-w-md mx-auto mt-12">
        <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
          <FileText className="w-10 h-10 text-slate-300" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Paciente não encontrado</h2>
        <p className="text-gray-500 mb-6">O prontuário solicitado não existe ou foi removido.</p>
        <Link
          to="/pacientes"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg font-medium hover:bg-primary-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para pacientes
        </Link>
      </div>
    );
  }

  const handleSaveRecord = (data: Partial<MedicalRecord>) => {
    if (editingRecord) {
      updateMedicalRecord(editingRecord.id, data);
    } else {
      addMedicalRecord(data as Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>);
    }
    setShowNewRecord(false);
    setEditingRecord(null);
  };

  const handleCloseModal = () => {
    setShowNewRecord(false);
    setEditingRecord(null);
  };

  const handleQuickAction = (action: string) => {
    setShowQuickActions(false);
    switch (action) {
      case 'atendimento':
        setShowNewRecord(true);
        break;
      case 'receita':
        navigate(`/documentos?paciente=${patientId}&tipo=receita&novo=true`);
        break;
      case 'atestado':
        navigate(`/documentos?paciente=${patientId}&tipo=atestado&novo=true`);
        break;
      case 'exame':
        navigate(`/documentos?paciente=${patientId}&tipo=solicitacao_exames&novo=true`);
        break;
      case 'retorno':
        navigate(`/agenda?paciente=${patientId}&novo=true`);
        break;
    }
  };

  return (
    <>
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/pacientes')}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-slate-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
              <Stethoscope className="w-4 h-4" />
              <span>Prontuário Médico</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{patient.nome}</h1>
          </div>

          {/* Quick Actions Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Ações Rápidas
              <ChevronDown className={`w-4 h-4 transition-transform ${showQuickActions ? 'rotate-180' : ''}`} />
            </button>

            {showQuickActions && (
              <>
                <div className="fixed inset-0 z-[55]" onClick={() => setShowQuickActions(false)} />
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-[56] animate-fade-in origin-top-right">
                  <button
                    onClick={() => handleQuickAction('atendimento')}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-primary-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Stethoscope className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Novo Atendimento</p>
                      <p className="text-xs text-gray-500">Registrar consulta SOAP</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleQuickAction('receita')}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-green-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Pill className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Nova Receita</p>
                      <p className="text-xs text-gray-500">Prescrição de medicamentos</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleQuickAction('atestado')}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileSignature className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Atestado Médico</p>
                      <p className="text-xs text-gray-500">Emitir atestado</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleQuickAction('exame')}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-purple-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FlaskConical className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Solicitar Exame</p>
                      <p className="text-xs text-gray-500">Requisição de exames</p>
                    </div>
                  </button>
                  <div className="border-t border-gray-100 my-2" />
                  <button
                    onClick={() => handleQuickAction('retorno')}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-amber-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <CalendarPlus className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Agendar Retorno</p>
                      <p className="text-xs text-gray-500">Marcar próxima consulta</p>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Clipboard className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{records.length}</p>
              <p className="text-xs text-gray-500">Atendimentos</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
              <p className="text-xs text-gray-500">Documentos</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                {records.length > 0 ? formatDate(records[0]?.data, 'dd/MM/yy') : '-'}
              </p>
              <p className="text-xs text-gray-500">Última consulta</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${nextAppointment ? 'bg-amber-100' : 'bg-gray-100'}`}>
              <Calendar className={`w-5 h-5 ${nextAppointment ? 'text-amber-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                {nextAppointment ? formatDate(nextAppointment.data, 'dd/MM') : 'Nenhum'}
              </p>
              <p className="text-xs text-gray-500">Próximo agend.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('atendimentos')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            activeTab === 'atendimentos'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <span className="flex items-center gap-2">
            <Clipboard className="w-4 h-4" />
            Atendimentos
            <span className="px-1.5 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs">
              {records.length}
            </span>
          </span>
        </button>
        <button
          onClick={() => setActiveTab('documentos')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            activeTab === 'documentos'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <span className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Documentos
            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
              {documents.length}
            </span>
          </span>
        </button>
        <button
          onClick={() => setActiveTab('resumo')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            activeTab === 'resumo'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <span className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Resumo Clínico
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 lg:gap-6">
        {/* Patient Info - Sidebar */}
        <PatientSidebar patient={patient} records={records} />

        {/* Main Content Area */}
        <div className="space-y-5 min-w-0">
          {activeTab === 'atendimentos' && (
            <>
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por queixa, diagnóstico ou CID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="todos">Todos os tipos</option>
                  <option value="consulta">Consulta</option>
                  <option value="retorno">Retorno</option>
                  <option value="urgencia">Urgência</option>
                  <option value="emergencia">Emergência</option>
                  <option value="teleconsulta">Teleconsulta</option>
                </select>
              </div>

              {/* Section Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Clipboard className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Histórico de Atendimentos</h2>
                    <p className="text-sm text-slate-500">
                      {filteredRecords.length} registro{filteredRecords.length !== 1 ? 's' : ''}
                      {searchTerm || filterType !== 'todos' ? ' encontrado(s)' : ''}
                    </p>
                  </div>
                </div>
              </div>

              {filteredRecords.length === 0 ? (
                searchTerm || filterType !== 'todos' ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Nenhum registro encontrado com os filtros aplicados</p>
                    <button
                      onClick={() => { setSearchTerm(''); setFilterType('todos'); }}
                      className="mt-3 text-primary-600 text-sm font-medium hover:underline"
                    >
                      Limpar filtros
                    </button>
                  </div>
                ) : (
                  <EmptyRecordsState onCreateNew={() => setShowNewRecord(true)} />
                )
              ) : (
                <div className="space-y-4">
                  {filteredRecords.map((record, index) => (
                    <MedicalRecordCard
                      key={record.id}
                      record={record}
                      index={index}
                      onEdit={setEditingRecord}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'documentos' && (
            <DocumentsTab documents={documents} patientId={patientId!} />
          )}

          {activeTab === 'resumo' && (
            <ClinicalSummaryTab
              patient={patient}
              records={records}
              lastVitals={lastVitals}
            />
          )}
        </div>
      </div>

    </div>

      {/* New/Edit Record Modal */}
      {(showNewRecord || editingRecord) && (
        <MedicalRecordModal
          patientId={patient.id}
          record={editingRecord}
          onClose={handleCloseModal}
          onSave={handleSaveRecord}
        />
      )}
    </>
  );
}

function EmptyRecordsState({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <div className="empty-state">
      <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
        <FileText className="w-8 h-8 text-slate-300" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum atendimento registrado</h3>
      <p className="text-sm text-gray-500 mb-4">Clique em "Novo Atendimento" para criar o primeiro registro.</p>
      <button
        onClick={onCreateNew}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Criar atendimento
      </button>
    </div>
  );
}

// Tab de Documentos
const DocumentsTab = memo(function DocumentsTab({ documents, patientId }: { documents: MedicalDocument[], patientId: string }) {
  const navigate = useNavigate();

  const getDocumentTypeInfo = (type: string) => {
    const types: Record<string, { label: string; color: string; bgColor: string }> = {
      atestado: { label: 'Atestado', color: 'text-blue-700', bgColor: 'bg-blue-100' },
      receita: { label: 'Receita', color: 'text-green-700', bgColor: 'bg-green-100' },
      solicitacao_exames: { label: 'Solicitação de Exames', color: 'text-purple-700', bgColor: 'bg-purple-100' },
      laudo: { label: 'Laudo', color: 'text-amber-700', bgColor: 'bg-amber-100' },
      encaminhamento: { label: 'Encaminhamento', color: 'text-orange-700', bgColor: 'bg-orange-100' },
      declaracao: { label: 'Declaração', color: 'text-cyan-700', bgColor: 'bg-cyan-100' },
    };
    return types[type] || { label: type, color: 'text-gray-700', bgColor: 'bg-gray-100' };
  };

  const getStatusInfo = (status: string) => {
    const statuses: Record<string, { label: string; color: string; icon: typeof FileCheck }> = {
      rascunho: { label: 'Rascunho', color: 'text-gray-500', icon: FileText },
      emitido: { label: 'Emitido', color: 'text-green-600', icon: FileCheck },
      cancelado: { label: 'Cancelado', color: 'text-red-500', icon: X },
    };
    return statuses[status] || statuses.rascunho;
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 mb-4">Nenhum documento emitido para este paciente</p>
        <button
          onClick={() => navigate(`/documentos?paciente=${patientId}&novo=true`)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Criar documento
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Documentos do Paciente</h2>
            <p className="text-sm text-slate-500">{documents.length} documento(s)</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/documentos?paciente=${patientId}&novo=true`)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Novo
        </button>
      </div>

      <div className="grid gap-3">
        {documents.map(doc => {
          const typeInfo = getDocumentTypeInfo(doc.type);
          const statusInfo = getStatusInfo(doc.status);
          const StatusIcon = statusInfo.icon;

          return (
            <div
              key={doc.id}
              className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all cursor-pointer"
              onClick={() => navigate(`/documentos?id=${doc.id}`)}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${typeInfo.bgColor} rounded-xl flex items-center justify-center`}>
                  <FileText className={`w-6 h-6 ${typeInfo.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 ${typeInfo.bgColor} ${typeInfo.color} rounded-full text-xs font-medium`}>
                      {typeInfo.label}
                    </span>
                    <span className={`flex items-center gap-1 text-xs ${statusInfo.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusInfo.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 font-medium truncate">
                    {doc.title || `${typeInfo.label} - ${formatDate(doc.createdAt, 'dd/MM/yyyy')}`}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(doc.createdAt, "dd 'de' MMMM 'de' yyyy")}
                  </p>
                </div>
                <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// Tab de Resumo Clínico
const ClinicalSummaryTab = memo(function ClinicalSummaryTab({
  patient,
  records,
  lastVitals
}: {
  patient: Patient;
  records: MedicalRecord[];
  lastVitals?: MedicalRecord['objetivo']['sinaisVitais'];
}) {
  // Últimos diagnósticos
  const recentDiagnoses = records
    .filter(r => r.avaliacao?.diagnosticoPrincipal || r.avaliacao?.hipotesesDiagnosticas?.length)
    .slice(0, 5)
    .map(r => ({
      diagnosis: r.avaliacao?.diagnosticoPrincipal || r.avaliacao?.hipotesesDiagnosticas?.[0],
      cid: r.avaliacao?.cid10?.[0],
      date: r.data
    }));

  // Medicamentos prescritos recentemente
  const recentMedications = records
    .filter(r => r.plano?.prescricoes && r.plano.prescricoes.length > 0)
    .slice(0, 3)
    .flatMap(r => r.plano?.prescricoes || []);

  return (
    <div className="space-y-6">
      {/* Sinais Vitais */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <Activity className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Últimos Sinais Vitais</h3>
            <p className="text-xs text-gray-500">Dados do último atendimento</p>
          </div>
        </div>

        {lastVitals ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {lastVitals.pressaoArterial && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Pressão Arterial</p>
                <p className="text-lg font-bold text-gray-900">{lastVitals.pressaoArterial}</p>
                <p className="text-xs text-gray-400">mmHg</p>
              </div>
            )}
            {lastVitals.frequenciaCardiaca && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Freq. Cardíaca</p>
                <p className="text-lg font-bold text-gray-900">{lastVitals.frequenciaCardiaca}</p>
                <p className="text-xs text-gray-400">bpm</p>
              </div>
            )}
            {lastVitals.temperatura && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Temperatura</p>
                <p className="text-lg font-bold text-gray-900">{lastVitals.temperatura}</p>
                <p className="text-xs text-gray-400">°C</p>
              </div>
            )}
            {lastVitals.peso && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Peso</p>
                <p className="text-lg font-bold text-gray-900">{lastVitals.peso}</p>
                <p className="text-xs text-gray-400">kg</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Nenhum sinal vital registrado</p>
        )}
      </div>

      {/* Alertas do Paciente */}
      {((patient.alergias && patient.alergias.length > 0) || (patient.medicamentosEmUso && patient.medicamentosEmUso.length > 0)) && (
        <div className="grid sm:grid-cols-2 gap-4">
          {patient.alergias && patient.alergias.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-800">Alergias</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {patient.alergias.map((a, i) => (
                  <span key={i} className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
          {patient.medicamentosEmUso && patient.medicamentosEmUso.length > 0 && (
            <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Pill className="w-5 h-5 text-violet-600" />
                <h3 className="font-semibold text-violet-800">Medicamentos em Uso</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {patient.medicamentosEmUso.map((m, i) => (
                  <span key={i} className="px-2 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-medium">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Diagnósticos Recentes */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Histórico de Diagnósticos</h3>
            <p className="text-xs text-gray-500">Últimos 5 diagnósticos</p>
          </div>
        </div>

        {recentDiagnoses.length > 0 ? (
          <div className="space-y-3">
            {recentDiagnoses.map((d, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-700 font-bold text-sm">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{d.diagnosis}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {d.cid && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-mono">
                        {d.cid}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">{formatDate(d.date, 'dd/MM/yyyy')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Nenhum diagnóstico registrado</p>
        )}
      </div>

      {/* Prescrições Recentes */}
      {recentMedications.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Pill className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Medicamentos Prescritos Recentemente</h3>
              <p className="text-xs text-gray-500">Últimas prescrições</p>
            </div>
          </div>

          <div className="space-y-2">
            {recentMedications.slice(0, 6).map((med, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{med.medicamento}</p>
                  <p className="text-xs text-gray-500">{med.posologia}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

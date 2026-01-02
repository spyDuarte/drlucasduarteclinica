import { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Printer,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  FileSignature,
  ClipboardList,
  FileCheck,
  Pill,
  Stethoscope,
  ArrowRightCircle,
  Clock,
  AlertCircle,
  ScrollText,
  FileBarChart,
  Users,
  BookOpen,
  Activity,
  Building2
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import type { MedicalDocument, DocumentType, Patient, Prescription, TipoAptidao, TipoProcedimento } from '../types';
import { DOCUMENT_TYPES, DOCUMENT_STATUS, TIPOS_APTIDAO, TIPOS_PROCEDIMENTO, PARECERES_APTIDAO, TIPOS_ORIENTACAO, TIPOS_LEITO } from '../constants/clinic';
import { formatDate } from '../utils/helpers';
import { DocumentPreview } from '../components/DocumentPreview';
import ConfirmDialog from '../components/ConfirmDialog';

// Ícones por tipo de documento
const documentIcons: Record<DocumentType, typeof FileText> = {
  atestado_medico: FileSignature,
  declaracao_comparecimento: ClipboardList,
  laudo_medico: FileCheck,
  receita: Pill,
  solicitacao_exames: Stethoscope,
  encaminhamento: ArrowRightCircle,
  termo_consentimento: ScrollText,
  relatorio_medico: FileBarChart,
  declaracao_acompanhante: Users,
  orientacoes_medicas: BookOpen,
  atestado_aptidao: Activity,
  guia_internacao: Building2,
};

// Cores por status
const statusColors = {
  rascunho: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  emitido: 'bg-green-100 text-green-800 border-green-200',
  cancelado: 'bg-red-100 text-red-800 border-red-200',
};

export default function Documents() {
  const { user } = useAuth();
  const {
    documents,
    patients,
    getPatient,
    addDocument,
    updateDocument,
    deleteDocument,
    emitDocument,
    cancelDocument,
  } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<DocumentType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'rascunho' | 'emitido' | 'cancelado'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState<MedicalDocument | null>(null);
  const [previewDocument, setPreviewDocument] = useState<MedicalDocument | null>(null);
  const [previewPatient, setPreviewPatient] = useState<Patient | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Filtrar documentos
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      // Filtrar por tipo
      if (filterType !== 'all' && doc.type !== filterType) return false;

      // Filtrar por status
      if (filterStatus !== 'all' && doc.status !== filterStatus) return false;

      // Filtrar por busca (nome do paciente ou título)
      if (searchQuery) {
        const patient = getPatient(doc.patientId);
        const searchLower = searchQuery.toLowerCase();
        const matchPatient = patient?.nome.toLowerCase().includes(searchLower);
        const matchTitle = doc.title.toLowerCase().includes(searchLower);
        if (!matchPatient && !matchTitle) return false;
      }

      return true;
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [documents, filterType, filterStatus, searchQuery, getPatient]);

  const handleNewDocument = () => {
    setEditingDocument(null);
    setShowModal(true);
  };

  const handleEditDocument = (doc: MedicalDocument) => {
    setEditingDocument(doc);
    setShowModal(true);
  };

  const handlePreviewDocument = (doc: MedicalDocument) => {
    const patient = getPatient(doc.patientId);
    if (patient) {
      setPreviewDocument(doc);
      setPreviewPatient(patient);
    }
  };

  const handleSaveDocument = (data: Partial<MedicalDocument>) => {
    if (editingDocument) {
      updateDocument(editingDocument.id, data);
    } else {
      addDocument(data as Omit<MedicalDocument, 'id' | 'createdAt' | 'updatedAt'>);
    }
    setShowModal(false);
    setEditingDocument(null);
  };

  const handleEmitDocument = (id: string) => {
    emitDocument(id);
  };

  const handleCancelDocument = (id: string) => {
    cancelDocument(id);
  };

  const handleDeleteDocument = (id: string) => {
    deleteDocument(id);
    setConfirmDelete(null);
  };

  const getDocumentIcon = (type: DocumentType) => {
    const Icon = documentIcons[type];
    return <Icon className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Emita atestados, laudos, declarações e receitas
          </p>
        </div>
        {user?.role === 'medico' && (
          <button
            onClick={handleNewDocument}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Novo Documento
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Busca */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por paciente ou título..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Filtro por tipo */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as DocumentType | 'all')}
              className="input-field pl-10 pr-8 min-w-[200px]"
            >
              <option value="all">Todos os tipos</option>
              {Object.entries(DOCUMENT_TYPES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Filtro por status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="input-field min-w-[150px]"
          >
            <option value="all">Todos os status</option>
            <option value="rascunho">Rascunho</option>
            <option value="emitido">Emitido</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Lista de documentos */}
      {filteredDocuments.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Nenhum documento encontrado
          </h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || filterType !== 'all' || filterStatus !== 'all'
              ? 'Tente ajustar os filtros de busca.'
              : 'Comece emitindo seu primeiro documento.'}
          </p>
          {user?.role === 'medico' && !searchQuery && filterType === 'all' && filterStatus === 'all' && (
            <button
              onClick={handleNewDocument}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Criar Documento
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredDocuments.map((doc) => {
            const patient = getPatient(doc.patientId);
            return (
              <div
                key={doc.id}
                className="card p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Ícone */}
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 flex-shrink-0">
                    {getDocumentIcon(doc.type)}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 truncate">
                          {doc.title || DOCUMENT_TYPES[doc.type]}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Paciente: {patient?.nome || 'Não encontrado'}
                        </p>
                      </div>

                      {/* Status */}
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${statusColors[doc.status]}`}>
                        {DOCUMENT_STATUS[doc.status]}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDate(doc.createdAt)}
                      </span>
                      {doc.emitidoAt && (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          Emitido em {formatDate(doc.emitidoAt)}
                        </span>
                      )}
                      {doc.type === 'atestado_medico' && doc.diasAfastamento && (
                        <span className="flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {doc.diasAfastamento} dia(s) de afastamento
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handlePreviewDocument(doc)}
                      className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Visualizar"
                    >
                      <Eye className="w-5 h-5" />
                    </button>

                    {doc.status === 'rascunho' && user?.role === 'medico' && (
                      <>
                        <button
                          onClick={() => handleEditDocument(doc)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEmitDocument(doc.id)}
                          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Emitir"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(doc.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </>
                    )}

                    {doc.status === 'emitido' && (
                      <>
                        <button
                          onClick={() => handlePreviewDocument(doc)}
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Imprimir"
                        >
                          <Printer className="w-5 h-5" />
                        </button>
                        {user?.role === 'medico' && (
                          <button
                            onClick={() => handleCancelDocument(doc.id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Cancelar"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de criação/edição */}
      {showModal && (
        <DocumentModal
          document={editingDocument}
          patients={patients}
          user={user}
          onClose={() => {
            setShowModal(false);
            setEditingDocument(null);
          }}
          onSave={handleSaveDocument}
        />
      )}

      {/* Preview do documento */}
      {previewDocument && previewPatient && (
        <DocumentPreview
          document={previewDocument}
          patient={previewPatient}
          onClose={() => {
            setPreviewDocument(null);
            setPreviewPatient(null);
          }}
        />
      )}

      {/* Confirmação de exclusão */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Excluir documento"
        message="Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={() => confirmDelete && handleDeleteDocument(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        variant="danger"
      />
    </div>
  );
}

// Modal de criação/edição de documento
interface DocumentModalProps {
  document: MedicalDocument | null;
  patients: Patient[];
  user: { nome: string; crm?: string } | null;
  onClose: () => void;
  onSave: (data: Partial<MedicalDocument>) => void;
}

function DocumentModal({ document, patients, user, onClose, onSave }: DocumentModalProps) {
  const [formData, setFormData] = useState({
    patientId: document?.patientId || '',
    type: document?.type || 'atestado_medico' as DocumentType,
    title: document?.title || '',
    content: document?.content || '',
    // Atestado médico
    diasAfastamento: document?.diasAfastamento || 1,
    dataInicio: document?.dataInicio || new Date().toISOString().split('T')[0],
    dataFim: document?.dataFim || '',
    cid10: document?.cid10?.join(', ') || '',
    exibirCid: document?.exibirCid ?? false,
    // Laudo médico
    finalidade: document?.finalidade || '',
    conclusao: document?.conclusao || '',
    historiaClinica: document?.historiaClinica || '',
    exameFisico: document?.exameFisico || '',
    examesComplementares: document?.examesComplementares || '',
    // Declaração comparecimento
    horaChegada: document?.horaChegada || '',
    horaSaida: document?.horaSaida || '',
    // Declaração acompanhante
    nomeAcompanhante: document?.nomeAcompanhante || '',
    cpfAcompanhante: document?.cpfAcompanhante || '',
    grauParentesco: document?.grauParentesco || '',
    horaChegadaAcompanhante: document?.horaChegadaAcompanhante || '',
    horaSaidaAcompanhante: document?.horaSaidaAcompanhante || '',
    // Solicitação exames
    examesSolicitados: document?.examesSolicitados?.join('\n') || '',
    indicacaoClinica: document?.indicacaoClinica || '',
    hipoteseDiagnostica: document?.hipoteseDiagnostica || '',
    prioridadeExame: document?.prioridadeExame || 'rotina' as 'rotina' | 'urgente' | 'emergencia',
    // Encaminhamento
    especialidade: document?.especialidade || '',
    motivoEncaminhamento: document?.motivoEncaminhamento || '',
    urgencia: document?.urgencia || 'eletivo' as 'eletivo' | 'urgente' | 'emergencia',
    resumoClinico: document?.resumoClinico || '',
    examesRealizados: document?.examesRealizados || '',
    tratamentosAnteriores: document?.tratamentosAnteriores || '',
    // Prescrição
    prescricoes: document?.prescricoes || [] as Prescription[],
    // Termo de consentimento
    tipoProcedimento: document?.tipoProcedimento || 'cirurgico' as TipoProcedimento,
    nomeProcedimento: document?.nomeProcedimento || '',
    descricaoProcedimento: document?.descricaoProcedimento || '',
    riscosProcedimento: document?.riscosProcedimento?.join('\n') || '',
    beneficiosProcedimento: document?.beneficiosProcedimento?.join('\n') || '',
    alternativasTratamento: document?.alternativasTratamento || '',
    cuidadosPosProcedimento: document?.cuidadosPosProcedimento || '',
    responsavelAssinatura: document?.responsavelAssinatura || '',
    testemunha: document?.testemunha || '',
    // Relatório médico
    destinatario: document?.destinatario || '',
    periodoAcompanhamento: document?.periodoAcompanhamento || '',
    evolucaoClinica: document?.evolucaoClinica || '',
    tratamentoAtual: document?.tratamentoAtual || '',
    prognostico: document?.prognostico || '',
    recomendacoes: document?.recomendacoes || '',
    // Orientações médicas
    tipoOrientacao: document?.tipoOrientacao || 'geral' as 'pre_operatorio' | 'pos_operatorio' | 'tratamento' | 'dieta' | 'medicacao' | 'geral',
    orientacoesEspecificas: document?.orientacoesEspecificas?.join('\n') || '',
    restricoes: document?.restricoes?.join('\n') || '',
    sinaisAlerta: document?.sinaisAlerta?.join('\n') || '',
    contatoEmergencia: document?.contatoEmergencia || '',
    // Atestado aptidão
    tipoAptidao: document?.tipoAptidao || 'atividade_fisica' as TipoAptidao,
    modalidadeEsportiva: document?.modalidadeEsportiva || '',
    restricoesAtividade: document?.restricoesAtividade?.join('\n') || '',
    validadeAtestado: document?.validadeAtestado || '',
    examesRealizadosAptidao: document?.examesRealizadosAptidao?.join('\n') || '',
    parecer: document?.parecer || 'apto' as 'apto' | 'apto_com_restricoes' | 'inapto_temporario' | 'inapto',
    // Guia internação
    hospitalDestino: document?.hospitalDestino || '',
    tipoInternacao: document?.tipoInternacao || 'eletiva' as 'eletiva' | 'urgencia' | 'emergencia',
    leitoSolicitado: document?.leitoSolicitado || 'enfermaria' as 'enfermaria' | 'apartamento' | 'uti' | 'semi_intensiva',
    previsaoPermanencia: document?.previsaoPermanencia || '',
    procedimentoProposto: document?.procedimentoProposto || '',
    justificativaInternacao: document?.justificativaInternacao || '',
    cuidadosEspeciais: document?.cuidadosEspeciais?.join('\n') || '',
  });

  const [newPrescription, setNewPrescription] = useState({
    medicamento: '',
    concentracao: '',
    formaFarmaceutica: 'Comprimido',
    posologia: '',
    quantidade: '',
    duracao: '',
  });

  const updateField = <K extends keyof typeof formData>(key: K, value: typeof formData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const addPrescription = () => {
    if (!newPrescription.medicamento || !newPrescription.posologia) return;

    const prescription: Prescription = {
      id: Date.now().toString(),
      ...newPrescription,
    };

    updateField('prescricoes', [...formData.prescricoes, prescription]);
    setNewPrescription({
      medicamento: '',
      concentracao: '',
      formaFarmaceutica: 'Comprimido',
      posologia: '',
      quantidade: '',
      duracao: '',
    });
  };

  const removePrescription = (index: number) => {
    updateField('prescricoes', formData.prescricoes.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patientId) {
      alert('Selecione um paciente');
      return;
    }

    const data: Partial<MedicalDocument> = {
      patientId: formData.patientId,
      type: formData.type,
      status: document?.status || 'rascunho',
      title: formData.title || DOCUMENT_TYPES[formData.type],
      content: formData.content,
      medicoNome: user?.nome,
      medicoCRM: user?.crm,
    };

    // Campos específicos por tipo
    switch (formData.type) {
      case 'atestado_medico':
        data.diasAfastamento = formData.diasAfastamento;
        data.dataInicio = formData.dataInicio;
        data.dataFim = formData.dataFim;
        data.cid10 = formData.cid10.split(',').map(c => c.trim()).filter(Boolean);
        data.exibirCid = formData.exibirCid;
        break;

      case 'declaracao_comparecimento':
        data.horaChegada = formData.horaChegada;
        data.horaSaida = formData.horaSaida;
        break;

      case 'declaracao_acompanhante':
        data.nomeAcompanhante = formData.nomeAcompanhante;
        data.cpfAcompanhante = formData.cpfAcompanhante;
        data.grauParentesco = formData.grauParentesco;
        data.horaChegadaAcompanhante = formData.horaChegadaAcompanhante;
        data.horaSaidaAcompanhante = formData.horaSaidaAcompanhante;
        break;

      case 'laudo_medico':
        data.finalidade = formData.finalidade;
        data.conclusao = formData.conclusao;
        data.historiaClinica = formData.historiaClinica;
        data.exameFisico = formData.exameFisico;
        data.examesComplementares = formData.examesComplementares;
        data.cid10 = formData.cid10.split(',').map(c => c.trim()).filter(Boolean);
        break;

      case 'receita':
        data.prescricoes = formData.prescricoes;
        break;

      case 'solicitacao_exames':
        data.examesSolicitados = formData.examesSolicitados.split('\n').map(e => e.trim()).filter(Boolean);
        data.indicacaoClinica = formData.indicacaoClinica;
        data.hipoteseDiagnostica = formData.hipoteseDiagnostica;
        data.prioridadeExame = formData.prioridadeExame;
        break;

      case 'encaminhamento':
        data.especialidade = formData.especialidade;
        data.motivoEncaminhamento = formData.motivoEncaminhamento;
        data.urgencia = formData.urgencia;
        data.resumoClinico = formData.resumoClinico;
        data.examesRealizados = formData.examesRealizados;
        data.tratamentosAnteriores = formData.tratamentosAnteriores;
        data.cid10 = formData.cid10.split(',').map(c => c.trim()).filter(Boolean);
        break;

      case 'termo_consentimento':
        data.tipoProcedimento = formData.tipoProcedimento;
        data.nomeProcedimento = formData.nomeProcedimento;
        data.descricaoProcedimento = formData.descricaoProcedimento;
        data.riscosProcedimento = formData.riscosProcedimento.split('\n').map(r => r.trim()).filter(Boolean);
        data.beneficiosProcedimento = formData.beneficiosProcedimento.split('\n').map(b => b.trim()).filter(Boolean);
        data.alternativasTratamento = formData.alternativasTratamento;
        data.cuidadosPosProcedimento = formData.cuidadosPosProcedimento;
        data.responsavelAssinatura = formData.responsavelAssinatura;
        data.testemunha = formData.testemunha;
        break;

      case 'relatorio_medico':
        data.destinatario = formData.destinatario;
        data.periodoAcompanhamento = formData.periodoAcompanhamento;
        data.evolucaoClinica = formData.evolucaoClinica;
        data.tratamentoAtual = formData.tratamentoAtual;
        data.prognostico = formData.prognostico;
        data.recomendacoes = formData.recomendacoes;
        data.cid10 = formData.cid10.split(',').map(c => c.trim()).filter(Boolean);
        break;

      case 'orientacoes_medicas':
        data.tipoOrientacao = formData.tipoOrientacao;
        data.orientacoesEspecificas = formData.orientacoesEspecificas.split('\n').map(o => o.trim()).filter(Boolean);
        data.restricoes = formData.restricoes.split('\n').map(r => r.trim()).filter(Boolean);
        data.sinaisAlerta = formData.sinaisAlerta.split('\n').map(s => s.trim()).filter(Boolean);
        data.contatoEmergencia = formData.contatoEmergencia;
        break;

      case 'atestado_aptidao':
        data.tipoAptidao = formData.tipoAptidao;
        data.modalidadeEsportiva = formData.modalidadeEsportiva;
        data.restricoesAtividade = formData.restricoesAtividade.split('\n').map(r => r.trim()).filter(Boolean);
        data.validadeAtestado = formData.validadeAtestado;
        data.examesRealizadosAptidao = formData.examesRealizadosAptidao.split('\n').map(e => e.trim()).filter(Boolean);
        data.parecer = formData.parecer;
        break;

      case 'guia_internacao':
        data.hospitalDestino = formData.hospitalDestino;
        data.tipoInternacao = formData.tipoInternacao;
        data.leitoSolicitado = formData.leitoSolicitado;
        data.previsaoPermanencia = formData.previsaoPermanencia;
        data.procedimentoProposto = formData.procedimentoProposto;
        data.justificativaInternacao = formData.justificativaInternacao;
        data.cuidadosEspeciais = formData.cuidadosEspeciais.split('\n').map(c => c.trim()).filter(Boolean);
        data.cid10 = formData.cid10.split(',').map(c => c.trim()).filter(Boolean);
        break;
    }

    onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-2 sm:p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl my-4 sm:my-8 max-h-[95vh] flex flex-col shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-primary-700 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {document ? 'Editar Documento' : 'Novo Documento'}
              </h2>
              <p className="text-sm text-white/70">Preencha os dados do documento</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Tipo e Paciente */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de documento <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => updateField('type', e.target.value as DocumentType)}
                className="input-field"
              >
                {Object.entries(DOCUMENT_TYPES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paciente <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.patientId}
                onChange={(e) => updateField('patientId', e.target.value)}
                className="input-field"
                required
              >
                <option value="">Selecione um paciente</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título (opcional)
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="input-field"
              placeholder={DOCUMENT_TYPES[formData.type]}
            />
          </div>

          {/* Campos específicos por tipo */}
          {formData.type === 'atestado_medico' && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-xl">
              <h3 className="font-medium text-blue-800">Dados do Atestado</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Dias de afastamento</label>
                  <input
                    type="number"
                    value={formData.diasAfastamento}
                    onChange={(e) => updateField('diasAfastamento', parseInt(e.target.value) || 1)}
                    className="input-field"
                    min={1}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Data início</label>
                  <input
                    type="date"
                    value={formData.dataInicio}
                    onChange={(e) => updateField('dataInicio', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Data fim (opcional)</label>
                  <input
                    type="date"
                    value={formData.dataFim}
                    onChange={(e) => updateField('dataFim', e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">CID-10 (separados por vírgula)</label>
                <input
                  type="text"
                  value={formData.cid10}
                  onChange={(e) => updateField('cid10', e.target.value)}
                  className="input-field"
                  placeholder="J11, R50.9"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.exibirCid}
                  onChange={(e) => updateField('exibirCid', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Exibir CID no documento</span>
              </label>
            </div>
          )}

          {formData.type === 'declaracao_comparecimento' && (
            <div className="space-y-4 p-4 bg-green-50 rounded-xl">
              <h3 className="font-medium text-green-800">Dados da Declaração</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Hora de chegada</label>
                  <input
                    type="time"
                    value={formData.horaChegada}
                    onChange={(e) => updateField('horaChegada', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Hora de saída</label>
                  <input
                    type="time"
                    value={formData.horaSaida}
                    onChange={(e) => updateField('horaSaida', e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.type === 'laudo_medico' && (
            <div className="space-y-4 p-4 bg-purple-50 rounded-xl">
              <h3 className="font-medium text-purple-800">Dados do Laudo</h3>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Finalidade</label>
                <input
                  type="text"
                  value={formData.finalidade}
                  onChange={(e) => updateField('finalidade', e.target.value)}
                  className="input-field"
                  placeholder="Ex: Afastamento laboral, Benefício INSS, etc."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">CID-10 (separados por vírgula)</label>
                <input
                  type="text"
                  value={formData.cid10}
                  onChange={(e) => updateField('cid10', e.target.value)}
                  className="input-field"
                  placeholder="J11, R50.9"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Conclusão</label>
                <textarea
                  value={formData.conclusao}
                  onChange={(e) => updateField('conclusao', e.target.value)}
                  className="input-field"
                  rows={3}
                  placeholder="Parecer técnico final..."
                />
              </div>
            </div>
          )}

          {formData.type === 'receita' && (
            <div className="space-y-4 p-4 bg-orange-50 rounded-xl">
              <h3 className="font-medium text-orange-800">Prescrições</h3>

              {/* Lista de prescrições */}
              {formData.prescricoes.length > 0 && (
                <div className="space-y-2">
                  {formData.prescricoes.map((rx, index) => (
                    <div key={rx.id} className="flex items-center gap-2 p-2 bg-white rounded-lg">
                      <span className="flex-1 text-sm">
                        <strong>{rx.medicamento}</strong> {rx.concentracao} - {rx.formaFarmaceutica} - {rx.posologia}
                      </span>
                      <button
                        type="button"
                        onClick={() => removePrescription(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Adicionar prescrição */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <input
                  type="text"
                  value={newPrescription.medicamento}
                  onChange={(e) => setNewPrescription({ ...newPrescription, medicamento: e.target.value })}
                  className="input-field text-sm"
                  placeholder="Medicamento"
                />
                <input
                  type="text"
                  value={newPrescription.concentracao}
                  onChange={(e) => setNewPrescription({ ...newPrescription, concentracao: e.target.value })}
                  className="input-field text-sm"
                  placeholder="Concentração"
                />
                <select
                  value={newPrescription.formaFarmaceutica}
                  onChange={(e) => setNewPrescription({ ...newPrescription, formaFarmaceutica: e.target.value })}
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
                  <option>Injetável</option>
                </select>
                <input
                  type="text"
                  value={newPrescription.posologia}
                  onChange={(e) => setNewPrescription({ ...newPrescription, posologia: e.target.value })}
                  className="input-field text-sm"
                  placeholder="Posologia"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={newPrescription.quantidade}
                  onChange={(e) => setNewPrescription({ ...newPrescription, quantidade: e.target.value })}
                  className="input-field text-sm"
                  placeholder="Quantidade"
                />
                <input
                  type="text"
                  value={newPrescription.duracao}
                  onChange={(e) => setNewPrescription({ ...newPrescription, duracao: e.target.value })}
                  className="input-field text-sm"
                  placeholder="Duração"
                />
                <button
                  type="button"
                  onClick={addPrescription}
                  className="btn-secondary text-sm"
                >
                  Adicionar
                </button>
              </div>
            </div>
          )}

          {formData.type === 'solicitacao_exames' && (
            <div className="space-y-4 p-4 bg-teal-50 rounded-xl">
              <h3 className="font-medium text-teal-800">Solicitação de Exames</h3>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Indicação clínica</label>
                <input
                  type="text"
                  value={formData.indicacaoClinica}
                  onChange={(e) => updateField('indicacaoClinica', e.target.value)}
                  className="input-field"
                  placeholder="Motivo da solicitação"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Exames (um por linha)</label>
                <textarea
                  value={formData.examesSolicitados}
                  onChange={(e) => updateField('examesSolicitados', e.target.value)}
                  className="input-field"
                  rows={4}
                  placeholder="Hemograma completo&#10;Glicemia de jejum&#10;Colesterol total e frações"
                />
              </div>
            </div>
          )}

          {formData.type === 'encaminhamento' && (
            <div className="space-y-4 p-4 bg-indigo-50 rounded-xl">
              <h3 className="font-medium text-indigo-800">Encaminhamento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Especialidade</label>
                  <input
                    type="text"
                    value={formData.especialidade}
                    onChange={(e) => updateField('especialidade', e.target.value)}
                    className="input-field"
                    placeholder="Ex: Cardiologia, Ortopedia"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Urgência</label>
                  <select
                    value={formData.urgencia}
                    onChange={(e) => updateField('urgencia', e.target.value as typeof formData.urgencia)}
                    className="input-field"
                  >
                    <option value="eletivo">Eletivo</option>
                    <option value="urgente">Urgente</option>
                    <option value="emergencia">Emergência</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">CID-10 (separados por vírgula)</label>
                <input
                  type="text"
                  value={formData.cid10}
                  onChange={(e) => updateField('cid10', e.target.value)}
                  className="input-field"
                  placeholder="J11, R50.9"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Resumo clínico</label>
                <textarea
                  value={formData.resumoClinico}
                  onChange={(e) => updateField('resumoClinico', e.target.value)}
                  className="input-field"
                  rows={2}
                  placeholder="Breve resumo do quadro clínico..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Exames já realizados</label>
                <textarea
                  value={formData.examesRealizados}
                  onChange={(e) => updateField('examesRealizados', e.target.value)}
                  className="input-field"
                  rows={2}
                  placeholder="Exames e resultados relevantes..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Tratamentos anteriores</label>
                <textarea
                  value={formData.tratamentosAnteriores}
                  onChange={(e) => updateField('tratamentosAnteriores', e.target.value)}
                  className="input-field"
                  rows={2}
                  placeholder="Tratamentos já tentados..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Motivo do encaminhamento</label>
                <textarea
                  value={formData.motivoEncaminhamento}
                  onChange={(e) => updateField('motivoEncaminhamento', e.target.value)}
                  className="input-field"
                  rows={3}
                  placeholder="Descreva o motivo do encaminhamento..."
                />
              </div>
            </div>
          )}

          {formData.type === 'declaracao_acompanhante' && (
            <div className="space-y-4 p-4 bg-cyan-50 rounded-xl">
              <h3 className="font-medium text-cyan-800">Declaração para Acompanhante</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Nome do acompanhante</label>
                  <input
                    type="text"
                    value={formData.nomeAcompanhante}
                    onChange={(e) => updateField('nomeAcompanhante', e.target.value)}
                    className="input-field"
                    placeholder="Nome completo do acompanhante"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">CPF do acompanhante</label>
                  <input
                    type="text"
                    value={formData.cpfAcompanhante}
                    onChange={(e) => updateField('cpfAcompanhante', e.target.value)}
                    className="input-field"
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Grau de parentesco/relação</label>
                <input
                  type="text"
                  value={formData.grauParentesco}
                  onChange={(e) => updateField('grauParentesco', e.target.value)}
                  className="input-field"
                  placeholder="Ex: Mãe, Pai, Cônjuge, Responsável legal"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Hora de chegada</label>
                  <input
                    type="time"
                    value={formData.horaChegadaAcompanhante}
                    onChange={(e) => updateField('horaChegadaAcompanhante', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Hora de saída</label>
                  <input
                    type="time"
                    value={formData.horaSaidaAcompanhante}
                    onChange={(e) => updateField('horaSaidaAcompanhante', e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.type === 'termo_consentimento' && (
            <div className="space-y-4 p-4 bg-rose-50 rounded-xl">
              <h3 className="font-medium text-rose-800">Termo de Consentimento Livre e Esclarecido</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Tipo de procedimento</label>
                  <select
                    value={formData.tipoProcedimento}
                    onChange={(e) => updateField('tipoProcedimento', e.target.value as TipoProcedimento)}
                    className="input-field"
                  >
                    {Object.entries(TIPOS_PROCEDIMENTO).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Nome do procedimento</label>
                  <input
                    type="text"
                    value={formData.nomeProcedimento}
                    onChange={(e) => updateField('nomeProcedimento', e.target.value)}
                    className="input-field"
                    placeholder="Ex: Biópsia de pele, Endoscopia"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Descrição do procedimento</label>
                <textarea
                  value={formData.descricaoProcedimento}
                  onChange={(e) => updateField('descricaoProcedimento', e.target.value)}
                  className="input-field"
                  rows={3}
                  placeholder="Descreva detalhadamente o procedimento a ser realizado..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Riscos do procedimento (um por linha)</label>
                <textarea
                  value={formData.riscosProcedimento}
                  onChange={(e) => updateField('riscosProcedimento', e.target.value)}
                  className="input-field"
                  rows={3}
                  placeholder="Sangramento&#10;Infecção&#10;Reação alérgica"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Benefícios esperados (um por linha)</label>
                <textarea
                  value={formData.beneficiosProcedimento}
                  onChange={(e) => updateField('beneficiosProcedimento', e.target.value)}
                  className="input-field"
                  rows={3}
                  placeholder="Diagnóstico preciso&#10;Tratamento definitivo"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Alternativas de tratamento</label>
                <textarea
                  value={formData.alternativasTratamento}
                  onChange={(e) => updateField('alternativasTratamento', e.target.value)}
                  className="input-field"
                  rows={2}
                  placeholder="Outras opções de tratamento disponíveis..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Cuidados pós-procedimento</label>
                <textarea
                  value={formData.cuidadosPosProcedimento}
                  onChange={(e) => updateField('cuidadosPosProcedimento', e.target.value)}
                  className="input-field"
                  rows={2}
                  placeholder="Orientações para após o procedimento..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Responsável pela assinatura (se menor/incapaz)</label>
                  <input
                    type="text"
                    value={formData.responsavelAssinatura}
                    onChange={(e) => updateField('responsavelAssinatura', e.target.value)}
                    className="input-field"
                    placeholder="Nome do responsável legal"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Testemunha</label>
                  <input
                    type="text"
                    value={formData.testemunha}
                    onChange={(e) => updateField('testemunha', e.target.value)}
                    className="input-field"
                    placeholder="Nome da testemunha"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.type === 'relatorio_medico' && (
            <div className="space-y-4 p-4 bg-amber-50 rounded-xl">
              <h3 className="font-medium text-amber-800">Relatório Médico Detalhado</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Destinatário</label>
                  <input
                    type="text"
                    value={formData.destinatario}
                    onChange={(e) => updateField('destinatario', e.target.value)}
                    className="input-field"
                    placeholder="Ex: INSS, Seguradora XYZ, Perícia Médica"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Período de acompanhamento</label>
                  <input
                    type="text"
                    value={formData.periodoAcompanhamento}
                    onChange={(e) => updateField('periodoAcompanhamento', e.target.value)}
                    className="input-field"
                    placeholder="Ex: Janeiro/2024 a Dezembro/2024"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">CID-10 (separados por vírgula)</label>
                <input
                  type="text"
                  value={formData.cid10}
                  onChange={(e) => updateField('cid10', e.target.value)}
                  className="input-field"
                  placeholder="M54.5, G43.9"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Evolução clínica</label>
                <textarea
                  value={formData.evolucaoClinica}
                  onChange={(e) => updateField('evolucaoClinica', e.target.value)}
                  className="input-field"
                  rows={4}
                  placeholder="Descreva a evolução do quadro clínico do paciente..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Tratamento atual</label>
                <textarea
                  value={formData.tratamentoAtual}
                  onChange={(e) => updateField('tratamentoAtual', e.target.value)}
                  className="input-field"
                  rows={3}
                  placeholder="Medicações e terapias em uso..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Prognóstico</label>
                <textarea
                  value={formData.prognostico}
                  onChange={(e) => updateField('prognostico', e.target.value)}
                  className="input-field"
                  rows={2}
                  placeholder="Expectativa de evolução do quadro..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Recomendações</label>
                <textarea
                  value={formData.recomendacoes}
                  onChange={(e) => updateField('recomendacoes', e.target.value)}
                  className="input-field"
                  rows={3}
                  placeholder="Recomendações médicas para o paciente..."
                />
              </div>
            </div>
          )}

          {formData.type === 'orientacoes_medicas' && (
            <div className="space-y-4 p-4 bg-lime-50 rounded-xl">
              <h3 className="font-medium text-lime-800">Orientações Médicas</h3>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Tipo de orientação</label>
                <select
                  value={formData.tipoOrientacao}
                  onChange={(e) => updateField('tipoOrientacao', e.target.value as typeof formData.tipoOrientacao)}
                  className="input-field"
                >
                  {Object.entries(TIPOS_ORIENTACAO).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Orientações específicas (uma por linha)</label>
                <textarea
                  value={formData.orientacoesEspecificas}
                  onChange={(e) => updateField('orientacoesEspecificas', e.target.value)}
                  className="input-field"
                  rows={5}
                  placeholder="Manter repouso relativo por 48 horas&#10;Aplicar gelo local por 20 minutos, 3x ao dia&#10;Elevar o membro afetado"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Restrições (uma por linha)</label>
                <textarea
                  value={formData.restricoes}
                  onChange={(e) => updateField('restricoes', e.target.value)}
                  className="input-field"
                  rows={3}
                  placeholder="Evitar esforços físicos&#10;Não dirigir enquanto em uso da medicação&#10;Evitar exposição solar"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Sinais de alerta - Procurar emergência se (um por linha)</label>
                <textarea
                  value={formData.sinaisAlerta}
                  onChange={(e) => updateField('sinaisAlerta', e.target.value)}
                  className="input-field"
                  rows={3}
                  placeholder="Febre acima de 38.5°C&#10;Dor intensa que não melhora com a medicação&#10;Sangramento persistente"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Contato de emergência</label>
                <input
                  type="text"
                  value={formData.contatoEmergencia}
                  onChange={(e) => updateField('contatoEmergencia', e.target.value)}
                  className="input-field"
                  placeholder="Telefone ou local para emergências"
                />
              </div>
            </div>
          )}

          {formData.type === 'atestado_aptidao' && (
            <div className="space-y-4 p-4 bg-emerald-50 rounded-xl">
              <h3 className="font-medium text-emerald-800">Atestado de Aptidão</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Tipo de aptidão</label>
                  <select
                    value={formData.tipoAptidao}
                    onChange={(e) => updateField('tipoAptidao', e.target.value as TipoAptidao)}
                    className="input-field"
                  >
                    {Object.entries(TIPOS_APTIDAO).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Parecer</label>
                  <select
                    value={formData.parecer}
                    onChange={(e) => updateField('parecer', e.target.value as typeof formData.parecer)}
                    className="input-field"
                  >
                    {Object.entries(PARECERES_APTIDAO).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Modalidade esportiva/Atividade</label>
                  <input
                    type="text"
                    value={formData.modalidadeEsportiva}
                    onChange={(e) => updateField('modalidadeEsportiva', e.target.value)}
                    className="input-field"
                    placeholder="Ex: Natação, Corrida, Trabalho em altura"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Validade do atestado</label>
                  <input
                    type="text"
                    value={formData.validadeAtestado}
                    onChange={(e) => updateField('validadeAtestado', e.target.value)}
                    className="input-field"
                    placeholder="Ex: 12 meses, 6 meses"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Exames realizados (um por linha)</label>
                <textarea
                  value={formData.examesRealizadosAptidao}
                  onChange={(e) => updateField('examesRealizadosAptidao', e.target.value)}
                  className="input-field"
                  rows={3}
                  placeholder="Eletrocardiograma - Normal&#10;Teste ergométrico - Adequado&#10;Exame clínico - Sem alterações"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Restrições de atividade (uma por linha)</label>
                <textarea
                  value={formData.restricoesAtividade}
                  onChange={(e) => updateField('restricoesAtividade', e.target.value)}
                  className="input-field"
                  rows={2}
                  placeholder="Evitar atividades de impacto&#10;Manter frequência cardíaca abaixo de 150bpm"
                />
              </div>
            </div>
          )}

          {formData.type === 'guia_internacao' && (
            <div className="space-y-4 p-4 bg-sky-50 rounded-xl">
              <h3 className="font-medium text-sky-800">Guia de Internação Hospitalar</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Hospital de destino</label>
                  <input
                    type="text"
                    value={formData.hospitalDestino}
                    onChange={(e) => updateField('hospitalDestino', e.target.value)}
                    className="input-field"
                    placeholder="Nome do hospital"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Tipo de internação</label>
                  <select
                    value={formData.tipoInternacao}
                    onChange={(e) => updateField('tipoInternacao', e.target.value as typeof formData.tipoInternacao)}
                    className="input-field"
                  >
                    <option value="eletiva">Eletiva</option>
                    <option value="urgencia">Urgência</option>
                    <option value="emergencia">Emergência</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Leito solicitado</label>
                  <select
                    value={formData.leitoSolicitado}
                    onChange={(e) => updateField('leitoSolicitado', e.target.value as typeof formData.leitoSolicitado)}
                    className="input-field"
                  >
                    {Object.entries(TIPOS_LEITO).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Previsão de permanência</label>
                  <input
                    type="text"
                    value={formData.previsaoPermanencia}
                    onChange={(e) => updateField('previsaoPermanencia', e.target.value)}
                    className="input-field"
                    placeholder="Ex: 3-5 dias, 1 semana"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">CID-10 (separados por vírgula)</label>
                <input
                  type="text"
                  value={formData.cid10}
                  onChange={(e) => updateField('cid10', e.target.value)}
                  className="input-field"
                  placeholder="K80.1, K81.0"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Procedimento proposto</label>
                <input
                  type="text"
                  value={formData.procedimentoProposto}
                  onChange={(e) => updateField('procedimentoProposto', e.target.value)}
                  className="input-field"
                  placeholder="Ex: Colecistectomia videolaparoscópica"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Justificativa da internação</label>
                <textarea
                  value={formData.justificativaInternacao}
                  onChange={(e) => updateField('justificativaInternacao', e.target.value)}
                  className="input-field"
                  rows={3}
                  placeholder="Descreva a necessidade clínica da internação..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Cuidados especiais necessários (um por linha)</label>
                <textarea
                  value={formData.cuidadosEspeciais}
                  onChange={(e) => updateField('cuidadosEspeciais', e.target.value)}
                  className="input-field"
                  rows={3}
                  placeholder="Jejum pré-operatório de 8 horas&#10;Reserva de sangue tipo A+&#10;Avaliação cardiológica pré-operatória"
                />
              </div>
            </div>
          )}

          {/* Conteúdo adicional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.type === 'laudo_medico' ? 'Descrição / História clínica' : 'Observações adicionais'}
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => updateField('content', e.target.value)}
              className="input-field"
              rows={4}
              placeholder={
                formData.type === 'laudo_medico'
                  ? 'Descreva a história clínica, achados de exame físico, exames realizados...'
                  : 'Informações adicionais...'
              }
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-medium shadow-lg shadow-primary-500/25 transition-all flex items-center gap-2"
          >
            <FileCheck className="w-4 h-4" />
            {document ? 'Salvar alterações' : 'Criar documento'}
          </button>
        </div>
      </div>
    </div>
  );
}

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
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {formatDate(record.data, "dd 'de' MMMM 'de' yyyy")}
                      </span>
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
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {record.subjetivo.historicoDoencaAtual}
                      </p>
                    </div>

                    {/* Objective */}
                    <div>
                      <h4 className="text-sm font-semibold text-green-600 mb-1">O - Objetivo</h4>
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
                          {record.objetivo.sinaisVitais.temperatura && (
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                              Temp: {record.objetivo.sinaisVitais.temperatura}°C
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
                        </div>
                      )}
                      <p className="text-sm text-gray-600">{record.objetivo.exameFisico}</p>
                    </div>

                    {/* Assessment */}
                    <div>
                      <h4 className="text-sm font-semibold text-orange-600 mb-1">A - Avaliação</h4>
                      <div className="flex flex-wrap gap-2">
                        {record.avaliacao.hipotesesDiagnosticas.map((diag, idx) => (
                          <span key={idx} className="px-2 py-1 bg-orange-50 text-orange-700 rounded text-xs">
                            {diag}
                          </span>
                        ))}
                      </div>
                      {record.avaliacao.cid10 && record.avaliacao.cid10.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          CID-10: {record.avaliacao.cid10.join(', ')}
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
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {record.plano.retorno && (
                        <p className="text-xs text-gray-500 mt-2">
                          <strong>Retorno:</strong> {record.plano.retorno}
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
              addMedicalRecord(data as any);
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

function MedicalRecordModal({ patientId, record, onClose, onSave }: MedicalRecordModalProps) {
  const [formData, setFormData] = useState({
    data: record?.data || new Date().toISOString().split('T')[0],
    // Subjective
    queixaPrincipal: record?.subjetivo?.queixaPrincipal || '',
    historicoDoencaAtual: record?.subjetivo?.historicoDoencaAtual || '',
    revisaoSistemas: record?.subjetivo?.revisaoSistemas || '',
    // Objective
    pressaoArterial: record?.objetivo?.sinaisVitais?.pressaoArterial || '',
    frequenciaCardiaca: record?.objetivo?.sinaisVitais?.frequenciaCardiaca?.toString() || '',
    temperatura: record?.objetivo?.sinaisVitais?.temperatura?.toString() || '',
    peso: record?.objetivo?.sinaisVitais?.peso?.toString() || '',
    altura: record?.objetivo?.sinaisVitais?.altura?.toString() || '',
    exameFisico: record?.objetivo?.exameFisico || '',
    examesComplementares: record?.objetivo?.examesComplementares || '',
    // Assessment
    hipotesesDiagnosticas: record?.avaliacao?.hipotesesDiagnosticas?.join(', ') || '',
    cid10: record?.avaliacao?.cid10?.join(', ') || '',
    // Plan
    conduta: record?.plano?.conduta || '',
    prescricoes: record?.plano?.prescricoes || [],
    solicitacaoExames: record?.plano?.solicitacaoExames?.join(', ') || '',
    retorno: record?.plano?.retorno || '',
    orientacoes: record?.plano?.orientacoes || ''
  });

  const [newPrescription, setNewPrescription] = useState({
    medicamento: '',
    concentracao: '',
    formaFarmaceutica: 'Comprimido',
    posologia: '',
    quantidade: '',
    duracao: ''
  });

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
        duracao: ''
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

    const data: Partial<MedicalRecord> = {
      patientId,
      data: formData.data,
      subjetivo: {
        queixaPrincipal: formData.queixaPrincipal,
        historicoDoencaAtual: formData.historicoDoencaAtual,
        revisaoSistemas: formData.revisaoSistemas || undefined
      },
      objetivo: {
        sinaisVitais: {
          pressaoArterial: formData.pressaoArterial || undefined,
          frequenciaCardiaca: formData.frequenciaCardiaca ? parseInt(formData.frequenciaCardiaca) : undefined,
          temperatura: formData.temperatura ? parseFloat(formData.temperatura) : undefined,
          peso,
          altura,
          imc
        },
        exameFisico: formData.exameFisico,
        examesComplementares: formData.examesComplementares || undefined
      },
      avaliacao: {
        hipotesesDiagnosticas: formData.hipotesesDiagnosticas.split(',').map(d => d.trim()).filter(Boolean),
        cid10: formData.cid10 ? formData.cid10.split(',').map(c => c.trim()).filter(Boolean) : undefined
      },
      plano: {
        conduta: formData.conduta,
        prescricoes: formData.prescricoes.length > 0 ? formData.prescricoes : undefined,
        solicitacaoExames: formData.solicitacaoExames ? formData.solicitacaoExames.split(',').map(e => e.trim()).filter(Boolean) : undefined,
        retorno: formData.retorno || undefined,
        orientacoes: formData.orientacoes || undefined
      }
    };

    onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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
          {/* Date */}
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-1">Data do atendimento</label>
            <input
              type="date"
              value={formData.data}
              onChange={e => setFormData({ ...formData, data: e.target.value })}
              className="input-field"
              required
            />
          </div>

          {/* SOAP - Subjective */}
          <div className="border-l-4 border-sky-500 pl-4">
            <h3 className="text-lg font-semibold text-sky-600 mb-3">S - Subjetivo</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Queixa principal *</label>
                <input
                  type="text"
                  value={formData.queixaPrincipal}
                  onChange={e => setFormData({ ...formData, queixaPrincipal: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">História da doença atual *</label>
                <textarea
                  value={formData.historicoDoencaAtual}
                  onChange={e => setFormData({ ...formData, historicoDoencaAtual: e.target.value })}
                  className="input-field"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Revisão de sistemas</label>
                <textarea
                  value={formData.revisaoSistemas}
                  onChange={e => setFormData({ ...formData, revisaoSistemas: e.target.value })}
                  className="input-field"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* SOAP - Objective */}
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="text-lg font-semibold text-green-600 mb-3">O - Objetivo</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sinais vitais</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
                    <label className="block text-xs text-gray-500 mb-1">FC (bpm)</label>
                    <input
                      type="number"
                      value={formData.frequenciaCardiaca}
                      onChange={e => setFormData({ ...formData, frequenciaCardiaca: e.target.value })}
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
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exame físico *</label>
                <textarea
                  value={formData.exameFisico}
                  onChange={e => setFormData({ ...formData, exameFisico: e.target.value })}
                  className="input-field"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exames complementares</label>
                <textarea
                  value={formData.examesComplementares}
                  onChange={e => setFormData({ ...formData, examesComplementares: e.target.value })}
                  className="input-field"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* SOAP - Assessment */}
          <div className="border-l-4 border-orange-500 pl-4">
            <h3 className="text-lg font-semibold text-orange-600 mb-3">A - Avaliação</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hipóteses diagnósticas * (separadas por vírgula)</label>
                <input
                  type="text"
                  value={formData.hipotesesDiagnosticas}
                  onChange={e => setFormData({ ...formData, hipotesesDiagnosticas: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CID-10 (opcional, separados por vírgula)</label>
                <input
                  type="text"
                  value={formData.cid10}
                  onChange={e => setFormData({ ...formData, cid10: e.target.value })}
                  className="input-field"
                  placeholder="Ex: J11, R50.9"
                />
              </div>
            </div>
          </div>

          {/* SOAP - Plan */}
          <div className="border-l-4 border-purple-500 pl-4">
            <h3 className="text-lg font-semibold text-purple-600 mb-3">P - Plano</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conduta *</label>
                <textarea
                  value={formData.conduta}
                  onChange={e => setFormData({ ...formData, conduta: e.target.value })}
                  className="input-field"
                  rows={3}
                  required
                />
              </div>

              {/* Prescriptions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prescrições</label>
                {formData.prescricoes.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {formData.prescricoes.map((rx, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <span className="flex-1 text-sm">
                          <strong>{rx.medicamento}</strong> {rx.concentracao} - {rx.posologia}
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
                <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
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
                    <option>Solução</option>
                    <option>Pomada</option>
                    <option>Injetável</option>
                  </select>
                  <input
                    type="text"
                    value={newPrescription.posologia}
                    onChange={e => setNewPrescription({ ...newPrescription, posologia: e.target.value })}
                    className="input-field text-sm"
                    placeholder="Posologia"
                  />
                  <input
                    type="text"
                    value={newPrescription.quantidade}
                    onChange={e => setNewPrescription({ ...newPrescription, quantidade: e.target.value })}
                    className="input-field text-sm"
                    placeholder="Quantidade"
                  />
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Solicitação de exames (separados por vírgula)</label>
                <input
                  type="text"
                  value={formData.solicitacaoExames}
                  onChange={e => setFormData({ ...formData, solicitacaoExames: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Retorno</label>
                  <input
                    type="text"
                    value={formData.retorno}
                    onChange={e => setFormData({ ...formData, retorno: e.target.value })}
                    className="input-field"
                    placeholder="Ex: 30 dias, 1 semana"
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
                />
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

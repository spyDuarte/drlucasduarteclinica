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
  Printer,
  Heart,
  Thermometer,
  Wind,
  Droplets,
  Weight,
  Ruler,
  MapPin,
  Stethoscope,
  X,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Syringe,
  ClipboardList,
  AlertCircle,
  Shield,
  Users,
  CalendarCheck
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

  // Helper para tipo de atendimento
  const getAppointmentTypeLabel = (type: string) => {
    const types: Record<string, { label: string; class: string }> = {
      consulta: { label: 'Consulta', class: 'type-consulta' },
      retorno: { label: 'Retorno', class: 'type-retorno' },
      urgencia: { label: 'Urgência', class: 'type-urgencia' },
      emergencia: { label: 'Emergência', class: 'type-emergencia' },
      teleconsulta: { label: 'Teleconsulta', class: 'type-teleconsulta' },
      procedimento: { label: 'Procedimento', class: 'type-procedimento' },
      avaliacao_pre_operatoria: { label: 'Pré-operatório', class: 'type-pre-op' },
      pos_operatorio: { label: 'Pós-operatório', class: 'type-pos-op' }
    };
    return types[type] || { label: type, class: 'type-consulta' };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Premium */}
      <div className="medical-record-header">
        <div className="flex items-center gap-4 relative z-10">
          <button
            onClick={() => navigate('/pacientes')}
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
              <Stethoscope className="w-4 h-4" />
              <span>Prontuário Médico</span>
            </div>
            <h1 className="text-2xl font-bold text-white">{patient.nome}</h1>
          </div>
          <button
            onClick={() => setShowNewRecord(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-primary-600 rounded-xl font-semibold hover:bg-white/90 transition-all duration-200 shadow-lg shadow-black/10"
          >
            <Plus className="w-5 h-5" />
            Novo Atendimento
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Info - Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Profile Card Premium */}
          <div className="patient-profile-card p-5">
            <div className="flex items-start gap-4 mb-5">
              <div className="patient-avatar">
                <User className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-gray-900 truncate">{patient.nome}</h2>
                <p className="text-sm text-slate-500 font-medium">{formatCPF(patient.cpf)}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full text-xs font-semibold">
                    <Calendar className="w-3 h-3" />
                    {calculateAge(patient.dataNascimento)} anos
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <Calendar className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Nascimento</p>
                  <p className="text-sm text-slate-700 font-medium">{formatDate(patient.dataNascimento)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <Phone className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Telefone</p>
                  <p className="text-sm text-slate-700 font-medium">{formatPhone(patient.telefone)}</p>
                </div>
              </div>

              {patient.email && (
                <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <Mail className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 font-medium">E-mail</p>
                    <p className="text-sm text-slate-700 font-medium truncate">{patient.email}</p>
                  </div>
                </div>
              )}
            </div>

            {patient.convenio && (
              <div className="mt-4 p-3 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-800">{patient.convenio.nome}</span>
                </div>
                <p className="text-xs text-emerald-600 ml-6">
                  Carteira: {patient.convenio.numero}
                </p>
              </div>
            )}
          </div>

          {/* Allergies - Alert Card */}
          {patient.alergias && patient.alergias.length > 0 && (
            <div className="alert-card-danger p-4">
              <div className="flex items-center gap-2 text-red-700 mb-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <h3 className="font-semibold text-sm">Alergias</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {patient.alergias.map((alergia, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium"
                  >
                    {alergia}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Current Medications */}
          {patient.medicamentosEmUso && patient.medicamentosEmUso.length > 0 && (
            <div className="patient-profile-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                  <Pill className="w-4 h-4 text-violet-600" />
                </div>
                <h3 className="font-semibold text-sm text-gray-800">Medicamentos em uso</h3>
              </div>
              <div className="space-y-2">
                {patient.medicamentosEmUso.map((med, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full" />
                    <span className="text-sm text-gray-700">{med}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Family History */}
          {patient.historicoFamiliar && (
            <div className="patient-profile-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-amber-600" />
                </div>
                <h3 className="font-semibold text-sm text-gray-800">Histórico familiar</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{patient.historicoFamiliar}</p>
            </div>
          )}

          {/* Quick Stats */}
          <div className="patient-profile-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-semibold text-sm text-gray-800">Resumo</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-slate-50 rounded-xl">
                <p className="text-2xl font-bold text-primary-600">{records.length}</p>
                <p className="text-xs text-slate-500 font-medium">Atendimentos</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-xl">
                <p className="text-2xl font-bold text-emerald-600">
                  {records.length > 0 ? formatDate(records[0]?.data, 'dd/MM') : '-'}
                </p>
                <p className="text-xs text-slate-500 font-medium">Último</p>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Records - Main Area */}
        <div className="lg:col-span-2 space-y-5">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <Clipboard className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Histórico de Atendimentos</h2>
                <p className="text-sm text-slate-500">{records.length} registro{records.length !== 1 ? 's' : ''} encontrado{records.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>

          {records.length === 0 ? (
            <div className="empty-state">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                <FileText className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum atendimento registrado</h3>
              <p className="text-sm text-gray-500 mb-4">Clique em "Novo Atendimento" para criar o primeiro registro.</p>
              <button
                onClick={() => setShowNewRecord(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Criar atendimento
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {records.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).map((record, index) => {
                const typeInfo = getAppointmentTypeLabel(record.tipoAtendimento || 'consulta');
                return (
                  <div
                    key={record.id}
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
                          onClick={() => setEditingRecord(record)}
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
                      {/* S - Subjetivo */}
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

                      {/* O - Objetivo */}
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

                          {/* Vitals Grid Premium */}
                          {record.objetivo.sinaisVitais && (
                            <div className="vitals-grid">
                              {record.objetivo.sinaisVitais.pressaoArterial && (
                                <div className="vital-sign-badge">
                                  <Heart className="w-4 h-4 text-rose-500" />
                                  <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-semibold">PA</p>
                                    <p className="text-sm font-bold text-slate-700">{record.objetivo.sinaisVitais.pressaoArterial}</p>
                                  </div>
                                </div>
                              )}
                              {record.objetivo.sinaisVitais.frequenciaCardiaca && (
                                <div className="vital-sign-badge">
                                  <Activity className="w-4 h-4 text-red-500" />
                                  <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-semibold">FC</p>
                                    <p className="text-sm font-bold text-slate-700">{record.objetivo.sinaisVitais.frequenciaCardiaca} <span className="text-xs font-normal">bpm</span></p>
                                  </div>
                                </div>
                              )}
                              {record.objetivo.sinaisVitais.frequenciaRespiratoria && (
                                <div className="vital-sign-badge">
                                  <Wind className="w-4 h-4 text-blue-500" />
                                  <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-semibold">FR</p>
                                    <p className="text-sm font-bold text-slate-700">{record.objetivo.sinaisVitais.frequenciaRespiratoria} <span className="text-xs font-normal">irpm</span></p>
                                  </div>
                                </div>
                              )}
                              {record.objetivo.sinaisVitais.temperatura && (
                                <div className="vital-sign-badge">
                                  <Thermometer className="w-4 h-4 text-orange-500" />
                                  <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Temp</p>
                                    <p className="text-sm font-bold text-slate-700">{record.objetivo.sinaisVitais.temperatura}°C</p>
                                  </div>
                                </div>
                              )}
                              {record.objetivo.sinaisVitais.saturacaoO2 && (
                                <div className="vital-sign-badge">
                                  <Droplets className="w-4 h-4 text-cyan-500" />
                                  <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-semibold">SpO2</p>
                                    <p className="text-sm font-bold text-slate-700">{record.objetivo.sinaisVitais.saturacaoO2}%</p>
                                  </div>
                                </div>
                              )}
                              {record.objetivo.sinaisVitais.peso && (
                                <div className="vital-sign-badge">
                                  <Weight className="w-4 h-4 text-violet-500" />
                                  <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Peso</p>
                                    <p className="text-sm font-bold text-slate-700">{record.objetivo.sinaisVitais.peso} <span className="text-xs font-normal">kg</span></p>
                                  </div>
                                </div>
                              )}
                              {record.objetivo.sinaisVitais.imc && (
                                <div className="vital-sign-badge">
                                  <Ruler className="w-4 h-4 text-indigo-500" />
                                  <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-semibold">IMC</p>
                                    <p className="text-sm font-bold text-slate-700">{record.objetivo.sinaisVitais.imc}</p>
                                  </div>
                                </div>
                              )}
                              {record.objetivo.sinaisVitais.glicemiaCapilar && (
                                <div className="vital-sign-badge">
                                  <Droplets className="w-4 h-4 text-amber-500" />
                                  <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Glicemia</p>
                                    <p className="text-sm font-bold text-slate-700">{record.objetivo.sinaisVitais.glicemiaCapilar} <span className="text-xs font-normal">mg/dL</span></p>
                                  </div>
                                </div>
                              )}
                              {record.objetivo.sinaisVitais.escalaDor !== undefined && record.objetivo.sinaisVitais.escalaDor !== null && (
                                <div className={`vital-sign-badge ${
                                  record.objetivo.sinaisVitais.escalaDor >= 7 ? 'vital-danger' :
                                  record.objetivo.sinaisVitais.escalaDor >= 4 ? 'vital-warning' : 'vital-normal'
                                }`}>
                                  <AlertCircle className="w-4 h-4" />
                                  <div>
                                    <p className="text-[10px] uppercase font-semibold opacity-70">Dor</p>
                                    <p className="text-sm font-bold">{record.objetivo.sinaisVitais.escalaDor}/10</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {record.objetivo.exameFisico && (
                            <p className="text-sm text-gray-600 leading-relaxed">{record.objetivo.exameFisico}</p>
                          )}
                        </div>
                      </div>

                      {/* A - Avaliação */}
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

                      {/* P - Plano */}
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
                              <div className="p-3 bg-slate-50 rounded-lg">
                                <p className="text-xs font-semibold text-slate-500 mb-1">Medidas não medicamentosas</p>
                                <p className="text-sm text-gray-700">{record.plano.prescricoesNaoMedicamentosas.join(', ')}</p>
                              </div>
                            )}
                            {record.plano.solicitacaoExames && record.plano.solicitacaoExames.length > 0 && (
                              <div className="p-3 bg-slate-50 rounded-lg">
                                <p className="text-xs font-semibold text-slate-500 mb-1">Exames solicitados</p>
                                <p className="text-sm text-gray-700">{record.plano.solicitacaoExames.join(', ')}</p>
                              </div>
                            )}
                            {record.plano.encaminhamentos && record.plano.encaminhamentos.length > 0 && (
                              <div className="p-3 bg-slate-50 rounded-lg">
                                <p className="text-xs font-semibold text-slate-500 mb-1">Encaminhamentos</p>
                                <p className="text-sm text-gray-700">{record.plano.encaminhamentos.map(e => `${e.especialidade} (${e.motivo})`).join(', ')}</p>
                              </div>
                            )}
                            {record.plano.orientacoes && (
                              <div className="p-3 bg-slate-50 rounded-lg">
                                <p className="text-xs font-semibold text-slate-500 mb-1">Orientações</p>
                                <p className="text-sm text-gray-700">{record.plano.orientacoes}</p>
                              </div>
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
                    </div>
                  </div>
                );
              })}
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="medical-modal w-full max-w-5xl max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header Premium */}
        <div className="medical-modal-header sticky top-0 z-10">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {record ? 'Editar Atendimento' : 'Novo Atendimento'}
                </h2>
                <p className="text-sm text-white/70">Registro SOAP completo</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informações Gerais do Atendimento */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200">
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
          <div className="soap-section-s rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 bg-sky-500 text-white rounded-xl flex items-center justify-center text-lg font-bold shadow-lg shadow-sky-500/20">S</span>
              <div>
                <h3 className="text-lg font-bold text-sky-700">Subjetivo</h3>
                <p className="text-xs text-sky-600/70">Relato do paciente</p>
              </div>
            </div>
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
              <div className="collapsible-section">
                <button
                  type="button"
                  onClick={() => toggleSection('habitosVida')}
                  className="collapsible-header"
                >
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-sky-500" />
                    <span className="text-sm font-semibold text-slate-700">Hábitos de Vida</span>
                  </div>
                  {expandedSections.habitosVida ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
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
              <div className="collapsible-section">
                <button
                  type="button"
                  onClick={() => toggleSection('historicoPregrasso')}
                  className="collapsible-header"
                >
                  <div className="flex items-center gap-2">
                    <Clipboard className="w-4 h-4 text-sky-500" />
                    <span className="text-sm font-semibold text-slate-700">Histórico Patológico Pregresso</span>
                  </div>
                  {expandedSections.historicoPregrasso ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
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
          <div className="soap-section-o rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center text-lg font-bold shadow-lg shadow-emerald-500/20">O</span>
              <div>
                <h3 className="text-lg font-bold text-emerald-700">Objetivo</h3>
                <p className="text-xs text-emerald-600/70">Exame físico e sinais vitais</p>
              </div>
            </div>
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
              <div className="collapsible-section">
                <button
                  type="button"
                  onClick={() => toggleSection('exameFisicoDetalhado')}
                  className="collapsible-header"
                >
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-semibold text-slate-700">Exame Físico Detalhado por Sistemas</span>
                  </div>
                  {expandedSections.exameFisicoDetalhado ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
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
          <div className="soap-section-a rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center text-lg font-bold shadow-lg shadow-amber-500/20">A</span>
              <div>
                <h3 className="text-lg font-bold text-amber-700">Avaliação</h3>
                <p className="text-xs text-amber-600/70">Diagnóstico e hipóteses</p>
              </div>
            </div>
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
          <div className="soap-section-p rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 bg-violet-500 text-white rounded-xl flex items-center justify-center text-lg font-bold shadow-lg shadow-violet-500/20">P</span>
              <div>
                <h3 className="text-lg font-bold text-violet-700">Plano</h3>
                <p className="text-xs text-violet-600/70">Conduta e tratamento</p>
              </div>
            </div>
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
              <div className="collapsible-section">
                <button
                  type="button"
                  onClick={() => toggleSection('planoTerapeutico')}
                  className="collapsible-header"
                >
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-violet-500" />
                    <span className="text-sm font-semibold text-slate-700">Plano Terapêutico Detalhado</span>
                  </div>
                  {expandedSections.planoTerapeutico ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
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
          <div className="flex gap-3 justify-end pt-6 border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/25 transition-all flex items-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              {record ? 'Salvar alterações' : 'Registrar atendimento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

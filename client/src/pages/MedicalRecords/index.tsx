import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import {
  ArrowLeft,
  Plus,
  FileText,
  Clipboard,
  Stethoscope
} from 'lucide-react';
import type { MedicalRecord } from '../../types';

import { PatientSidebar } from './PatientSidebar';
import { MedicalRecordCard } from './MedicalRecordCard';
import { MedicalRecordModal } from './MedicalRecordModal';

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

  const sortedRecords = [...records].sort((a, b) =>
    new Date(b.data).getTime() - new Date(a.data).getTime()
  );

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Patient Info - Sidebar */}
        <PatientSidebar patient={patient} records={sortedRecords} />

        {/* Medical Records - Main Area */}
        <div className="md:col-span-1 lg:col-span-2 space-y-5">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <Clipboard className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Histórico de Atendimentos</h2>
                <p className="text-sm text-slate-500">
                  {records.length} registro{records.length !== 1 ? 's' : ''} encontrado{records.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {records.length === 0 ? (
            <EmptyRecordsState onCreateNew={() => setShowNewRecord(true)} />
          ) : (
            <div className="space-y-4">
              {sortedRecords.map((record, index) => (
                <MedicalRecordCard
                  key={record.id}
                  record={record}
                  index={index}
                  onEdit={setEditingRecord}
                />
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
          onClose={handleCloseModal}
          onSave={handleSaveRecord}
        />
      )}
    </div>
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

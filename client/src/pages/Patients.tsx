import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Phone,
  Mail,
  Calendar,
  Edit2,
  Trash2,
  User,
  FileText
} from 'lucide-react';
import { formatDate, calculateAge, formatCPF, formatPhone } from '../utils/helpers';
import { PatientModal } from '../components';
import { useToast } from '../components/Toast';
import type { Patient } from '../types';

export default function Patients() {
  const { patients, addPatient, updatePatient, deletePatient } = useData();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const filteredPatients = patients.filter(patient =>
    patient.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.cpf.includes(searchTerm) ||
    patient.telefone.includes(searchTerm)
  );

  const handleOpenModal = (patient?: Patient) => {
    setEditingPatient(patient || null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPatient(null);
  };

  const handleSave = (data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    try {
      if (editingPatient) {
        updatePatient(editingPatient.id, data);
        showToast('Paciente atualizado com sucesso!', 'success');
      } else {
        addPatient(data);
        showToast('Paciente cadastrado com sucesso!', 'success');
      }
      handleCloseModal();
    } catch {
      showToast('Erro ao salvar paciente', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    deletePatient(id);
    setShowDeleteConfirm(null);
    showToast('Paciente excluído com sucesso!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-600">{patients.length} pacientes cadastrados</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Paciente
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Buscar por nome, CPF ou telefone..."
          className="input-field pl-10"
        />
      </div>

      {/* Patients List */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="table-header">Paciente</th>
              <th className="table-header">Contato</th>
              <th className="table-header">Nascimento</th>
              <th className="table-header">Convênio</th>
              <th className="table-header text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
                </td>
              </tr>
            ) : (
              filteredPatients.map(patient => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-sky-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{patient.nome}</p>
                        <p className="text-sm text-gray-500">{formatCPF(patient.cpf)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="space-y-1">
                      <p className="flex items-center gap-1 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {formatPhone(patient.telefone)}
                      </p>
                      {patient.email && (
                        <p className="flex items-center gap-1 text-sm text-gray-500">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {patient.email}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{formatDate(patient.dataNascimento)}</span>
                      <span className="text-gray-500">
                        ({calculateAge(patient.dataNascimento)} anos)
                      </span>
                    </div>
                  </td>
                  <td className="table-cell">
                    {patient.convenio ? (
                      <span className="text-green-600 font-medium">
                        {patient.convenio.nome}
                      </span>
                    ) : (
                      <span className="text-gray-400">Particular</span>
                    )}
                  </td>
                  <td className="table-cell text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/pacientes/${patient.id}`}
                        className="p-2 text-gray-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                        title="Ver prontuário"
                        aria-label={`Ver prontuário de ${patient.nome}`}
                      >
                        <FileText className="w-5 h-5" aria-hidden="true" />
                      </Link>
                      <button
                        onClick={() => handleOpenModal(patient)}
                        className="p-2 text-gray-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                        title="Editar"
                        aria-label={`Editar paciente ${patient.nome}`}
                      >
                        <Edit2 className="w-5 h-5" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(patient.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir"
                        aria-label={`Excluir paciente ${patient.nome}`}
                      >
                        <Trash2 className="w-5 h-5" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Patient Modal */}
      {showModal && (
        <PatientModal
          patient={editingPatient}
          onClose={handleCloseModal}
          onSave={handleSave}
          isLoading={isLoading}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirmar exclusão
            </h3>
            <p className="text-gray-600 mb-4">
              Tem certeza que deseja excluir este paciente? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="btn-danger"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

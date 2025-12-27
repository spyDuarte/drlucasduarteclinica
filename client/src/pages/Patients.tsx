import { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Link } from 'react-router-dom';
import {
  Search,
  Phone,
  Mail,
  Calendar,
  Edit2,
  Trash2,
  User,
  FileText,
  Users,
  UserPlus
} from 'lucide-react';
import { formatDate, calculateAge, formatCPF, formatPhone } from '../utils/helpers';
import { PatientModal, ConfirmDialog, Pagination } from '../components';
import { useToast } from '../components/Toast';
import { useDebounce, usePagination } from '../hooks';
import type { Patient } from '../types';

export default function Patients() {
  const { patients, addPatient, updatePatient, deletePatient } = useData();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce na busca para evitar filtragem excessiva durante digitação
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Filtrar pacientes com termo de busca "debounced"
  const filteredPatients = useMemo(() => {
    const term = debouncedSearchTerm.toLowerCase();
    return patients.filter(patient =>
      patient.nome.toLowerCase().includes(term) ||
      patient.cpf.includes(debouncedSearchTerm) ||
      patient.telefone.includes(debouncedSearchTerm)
    );
  }, [patients, debouncedSearchTerm]);

  // Paginação
  const pagination = usePagination(filteredPatients, {
    initialPage: 1,
    initialItemsPerPage: 10
  });

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

  const handleDelete = () => {
    if (patientToDelete) {
      deletePatient(patientToDelete.id);
      setPatientToDelete(null);
      showToast('Paciente excluído com sucesso!', 'success');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
            <p className="text-gray-500 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              {patients.length} pacientes cadastrados
            </p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2 shadow-lg shadow-sky-500/20 hover:shadow-xl hover:shadow-sky-500/30 transition-all group"
        >
          <UserPlus className="w-5 h-5 transition-transform group-hover:scale-110" />
          Novo Paciente
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-lg input-icon-wrapper group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors duration-200 group-focus-within:text-sky-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Buscar por nome, CPF ou telefone..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all duration-200 text-sm shadow-sm"
        />
      </div>

      {/* Patients List */}
      <div className="card p-0 overflow-hidden shadow-lg">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-50/50 border-b border-gray-200">
            <tr>
              <th className="table-header">Paciente</th>
              <th className="table-header">Contato</th>
              <th className="table-header">Nascimento</th>
              <th className="table-header">Convênio</th>
              <th className="table-header text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pagination.paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <User className="w-8 h-8 empty-state-icon" />
                  </div>
                  <p className="text-gray-600 font-medium">
                    {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {searchTerm ? 'Tente uma busca diferente' : 'Cadastre seu primeiro paciente'}
                  </p>
                </td>
              </tr>
            ) : (
              pagination.paginatedItems.map(patient => (
                <tr key={patient.id} className="hover:bg-sky-50/50 transition-colors group">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-gradient-to-br from-sky-100 to-sky-50 rounded-xl flex items-center justify-center group-hover:from-sky-200 group-hover:to-sky-100 transition-all shadow-sm">
                        <User className="w-5 h-5 text-sky-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 group-hover:text-sky-700 transition-colors">{patient.nome}</p>
                        <p className="text-sm text-gray-500">{formatCPF(patient.cpf)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="space-y-1.5">
                      <p className="flex items-center gap-2 text-sm">
                        <span className="w-6 h-6 bg-emerald-50 rounded-lg flex items-center justify-center">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        </span>
                        <span className="font-medium">{formatPhone(patient.telefone)}</span>
                      </p>
                      {patient.email && (
                        <p className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Mail className="w-3.5 h-3.5 text-blue-600" />
                          </span>
                          {patient.email}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-purple-600" />
                      </span>
                      <div>
                        <span className="font-medium">{formatDate(patient.dataNascimento)}</span>
                        <span className="text-gray-400 ml-1">
                          ({calculateAge(patient.dataNascimento)} anos)
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    {patient.convenio ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                        {patient.convenio.nome}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                        Particular
                      </span>
                    )}
                  </td>
                  <td className="table-cell text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/pacientes/${patient.id}`}
                        className="table-action-icon"
                        title="Ver prontuário"
                        aria-label={`Ver prontuário de ${patient.nome}`}
                      >
                        <FileText className="w-5 h-5" aria-hidden="true" />
                      </Link>
                      <button
                        onClick={() => handleOpenModal(patient)}
                        className="table-action-icon"
                        title="Editar"
                        aria-label={`Editar paciente ${patient.nome}`}
                      >
                        <Edit2 className="w-5 h-5" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => setPatientToDelete(patient)}
                        className="table-action-icon danger"
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

        {/* Paginação */}
        {pagination.totalItems > 0 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            startIndex={pagination.startIndex}
            endIndex={pagination.endIndex}
            onPageChange={pagination.setPage}
            onFirstPage={pagination.firstPage}
            onLastPage={pagination.lastPage}
            onNextPage={pagination.nextPage}
            onPreviousPage={pagination.previousPage}
            canGoNext={pagination.canGoNext}
            canGoPrevious={pagination.canGoPrevious}
            itemsPerPage={pagination.itemsPerPage}
            onItemsPerPageChange={pagination.setItemsPerPage}
          />
        )}
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

      {/* Diálogo de Confirmação de Exclusão */}
      <ConfirmDialog
        isOpen={!!patientToDelete}
        onClose={() => setPatientToDelete(null)}
        onConfirm={handleDelete}
        title="Confirmar exclusão"
        message={
          patientToDelete ? (
            <>
              Tem certeza que deseja excluir o paciente{' '}
              <strong>{patientToDelete.nome}</strong>? Esta ação não pode ser desfeita.
            </>
          ) : ''
        }
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
      />
    </div>
  );
}

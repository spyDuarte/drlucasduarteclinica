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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pacientes</h1>
          <p className="text-slate-500">
            Gerencie o cadastro de pacientes da clínica.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary"
        >
          <UserPlus className="w-5 h-5" />
          Novo Paciente
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Buscar por nome, CPF ou telefone..."
          className="input-field pl-10"
        />
      </div>

      {/* Patients List */}
      <div className="card p-0 overflow-hidden flex flex-col max-h-[calc(100vh-280px)]">
        <div className="overflow-x-auto overflow-y-auto flex-1 scroll-smooth">
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-header">Paciente</th>
              <th className="table-header">Contato</th>
              <th className="table-header">Nascimento</th>
              <th className="table-header">Convênio</th>
              <th className="table-header text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pagination.paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12">
                   <p className="text-slate-500 font-medium">
                    {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
                  </p>
                </td>
              </tr>
            ) : (
              pagination.paginatedItems.map(patient => (
                <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{patient.nome}</p>
                        <p className="text-xs text-slate-500">{formatCPF(patient.cpf)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="space-y-1">
                      <p className="flex items-center gap-2 text-sm text-slate-700">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatPhone(patient.telefone)}</span>
                      </p>
                      {patient.email && (
                        <p className="flex items-center gap-2 text-sm text-slate-500">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {patient.email}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="table-cell">
                     <span className="text-slate-700">{formatDate(patient.dataNascimento)}</span>
                     <span className="text-slate-400 text-xs ml-1">
                          ({calculateAge(patient.dataNascimento)} anos)
                     </span>
                  </td>
                  <td className="table-cell">
                    {patient.convenio ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {patient.convenio.nome}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        Particular
                      </span>
                    )}
                  </td>
                  <td className="table-cell text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/pacientes/${patient.id}`}
                        className="btn-ghost p-1.5"
                        title="Ver prontuário"
                      >
                        <FileText className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleOpenModal(patient)}
                        className="btn-ghost p-1.5"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setPatientToDelete(patient)}
                        className="btn-ghost p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
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
          <div className="p-4 border-t border-slate-100">
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
          </div>
        )}
        </div>
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

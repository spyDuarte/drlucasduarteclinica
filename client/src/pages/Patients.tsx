import { useState, useMemo, useEffect, useCallback } from 'react';
import { useData } from '../contexts/DataContext';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  User,
  UserPlus
} from 'lucide-react';
import { PatientModal, ConfirmDialog, Pagination } from '../components';
import { PatientRow } from '../components/PatientRow';
import { useToast } from '../components/Toast';
import { useDebounce, usePagination } from '../hooks';
import type { Patient } from '../types';

export default function Patients() {
  const [searchParams] = useSearchParams();
  const { patients, addPatient, updatePatient, deletePatient } = useData();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-open modal from query params
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      const timer = setTimeout(() => {
        setShowModal(true);
        setEditingPatient(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

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

  const handleOpenModal = useCallback((patient?: Patient) => {
    setEditingPatient(patient || null);
    setShowModal(true);
  }, []);

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

  const confirmDelete = useCallback((patient: Patient) => {
    setPatientToDelete(patient);
  }, []);

  const handleDelete = () => {
    if (patientToDelete) {
      deletePatient(patientToDelete.id);
      setPatientToDelete(null);
      showToast('Paciente excluído com sucesso!', 'success');
    }
  };

  const handleDeleteClick = useCallback((patient: Patient) => {
    setPatientToDelete(patient);
  }, []);

  const handleEditClick = useCallback((patient: Patient) => {
    setEditingPatient(patient);
    setShowModal(true);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pacientes</h1>
          <p className="text-slate-500">
            Gerencie o cadastro de pacientes da clínica.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all"
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
          className="input-field pl-10 shadow-sm focus:shadow-md transition-shadow"
        />
      </div>

      {/* Patients List */}
      <div className="card p-0 overflow-hidden flex flex-col max-h-[calc(100vh-280px)] border border-slate-200 shadow-sm">
        <div className="overflow-x-auto overflow-y-auto flex-1 scroll-smooth">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/50">
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
                <td colSpan={5} className="text-center py-16">
                   <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <User className="w-8 h-8 text-slate-300" />
                   </div>
                   <p className="text-slate-500 font-medium">
                    {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
                  </p>
                </td>
              </tr>
            ) : (
              pagination.paginatedItems.map(patient => (
                <PatientRow
                  key={patient.id}
                  patient={patient}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              ))
            )}
          </tbody>
        </table>

        {/* Paginação */}
        {pagination.totalItems > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/30">
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

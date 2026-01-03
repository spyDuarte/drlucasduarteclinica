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
  UserPlus,
  Filter,
  LayoutGrid,
  List,
  Heart,
  Activity,
  Clock,
  ChevronRight,
  Shield,
  AlertTriangle,
  Stethoscope
} from 'lucide-react';
import { formatDate, calculateAge, formatCPF, formatPhone } from '../utils/helpers';
import { PatientModal, ConfirmDialog, Pagination } from '../components';
import { useToast } from '../components/Toast';
import { useDebounce, usePagination } from '../hooks';
import type { Patient } from '../types';

type ViewMode = 'cards' | 'table';

export default function Patients() {
  const { patients, addPatient, updatePatient, deletePatient, getMedicalRecordsByPatient, getAppointmentsByPatient } = useData();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [filterConvenio, setFilterConvenio] = useState<string>('todos');

  // Debounce na busca para evitar filtragem excessiva durante digitação
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Lista de convênios únicos
  const convenios = useMemo(() => {
    const uniqueConvenios = new Set<string>();
    patients.forEach(p => {
      if (p.convenio?.nome) uniqueConvenios.add(p.convenio.nome);
    });
    return Array.from(uniqueConvenios).sort();
  }, [patients]);

  // Estatísticas
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    let totalAtendimentos = 0;
    let pacientesComAlergia = 0;
    let pacientesAtivosHoje = 0;

    patients.forEach(patient => {
      const records = getMedicalRecordsByPatient(patient.id);
      totalAtendimentos += records.length;

      if (patient.alergias && patient.alergias.length > 0) {
        pacientesComAlergia++;
      }

      const appointments = getAppointmentsByPatient(patient.id);
      if (appointments.some(a => a.data === today && a.status !== 'cancelada')) {
        pacientesAtivosHoje++;
      }
    });

    return {
      total: patients.length,
      totalAtendimentos,
      pacientesComAlergia,
      pacientesAtivosHoje
    };
  }, [patients, getMedicalRecordsByPatient, getAppointmentsByPatient]);

  // Filtrar pacientes com termo de busca "debounced"
  const filteredPatients = useMemo(() => {
    const term = debouncedSearchTerm.toLowerCase();
    return patients.filter(patient => {
      const matchesSearch = patient.nome.toLowerCase().includes(term) ||
        patient.cpf.includes(debouncedSearchTerm) ||
        patient.telefone.includes(debouncedSearchTerm) ||
        (patient.email && patient.email.toLowerCase().includes(term));

      const matchesConvenio = filterConvenio === 'todos' ||
        (filterConvenio === 'particular' && !patient.convenio) ||
        (patient.convenio?.nome === filterConvenio);

      return matchesSearch && matchesConvenio;
    });
  }, [patients, debouncedSearchTerm, filterConvenio]);

  // Paginação
  const pagination = usePagination(filteredPatients, {
    initialPage: 1,
    initialItemsPerPage: viewMode === 'cards' ? 12 : 10
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

  const getPatientStats = (patientId: string) => {
    const records = getMedicalRecordsByPatient(patientId);
    const appointments = getAppointmentsByPatient(patientId);
    const lastRecord = records.length > 0 ? records.sort((a, b) =>
      new Date(b.data).getTime() - new Date(a.data).getTime()
    )[0] : null;

    return {
      totalRecords: records.length,
      totalAppointments: appointments.length,
      lastVisit: lastRecord?.data
    };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Premium */}
      <div className="relative bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 rounded-2xl p-6 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyek0zNiAyNnYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Pacientes</h1>
                <p className="text-white/80 text-sm">Gerencie sua base de pacientes</p>
              </div>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-sky-600 rounded-xl font-semibold hover:bg-white/90 transition-all shadow-lg shadow-black/10 group"
            >
              <UserPlus className="w-5 h-5 transition-transform group-hover:scale-110" />
              Novo Paciente
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-white/70">Total de Pacientes</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalAtendimentos}</p>
                  <p className="text-xs text-white/70">Atendimentos</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pacientesAtivosHoje}</p>
                  <p className="text-xs text-white/70">Consultas Hoje</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pacientesComAlergia}</p>
                  <p className="text-xs text-white/70">Com Alergias</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, CPF, telefone ou email..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-sm shadow-sm"
          />
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterConvenio}
              onChange={e => setFilterConvenio(e.target.value)}
              className="pl-9 pr-8 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-sm shadow-sm appearance-none cursor-pointer"
            >
              <option value="todos">Todos os convênios</option>
              <option value="particular">Particular</option>
              {convenios.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'cards'
                  ? 'bg-sky-100 text-sky-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Visualização em cards"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-sky-100 text-sky-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Visualização em tabela"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          {filteredPatients.length === patients.length
            ? `${patients.length} pacientes cadastrados`
            : `${filteredPatients.length} de ${patients.length} pacientes`
          }
        </span>
      </div>

      {/* Patients List */}
      {viewMode === 'cards' ? (
        // Cards View
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {pagination.paginatedItems.length === 0 ? (
            <div className="col-span-full">
              <EmptyState searchTerm={searchTerm} onAddNew={() => handleOpenModal()} />
            </div>
          ) : (
            pagination.paginatedItems.map(patient => {
              const patientStats = getPatientStats(patient.id);
              return (
                <PatientCard
                  key={patient.id}
                  patient={patient}
                  stats={patientStats}
                  onEdit={() => handleOpenModal(patient)}
                  onDelete={() => setPatientToDelete(patient)}
                />
              );
            })
          )}
        </div>
      ) : (
        // Table View
        <div className="card p-0 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-50/50 border-b border-gray-200">
                <tr>
                  <th className="table-header">Paciente</th>
                  <th className="table-header">Contato</th>
                  <th className="table-header">Nascimento</th>
                  <th className="table-header">Convênio</th>
                  <th className="table-header">Atendimentos</th>
                  <th className="table-header text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagination.paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <EmptyState searchTerm={searchTerm} onAddNew={() => handleOpenModal()} />
                    </td>
                  </tr>
                ) : (
                  pagination.paginatedItems.map(patient => {
                    const patientStats = getPatientStats(patient.id);
                    return (
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
                          <div className="space-y-1">
                            <p className="flex items-center gap-2 text-sm">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              {formatPhone(patient.telefone)}
                            </p>
                            {patient.email && (
                              <p className="flex items-center gap-2 text-sm text-gray-500">
                                <Mail className="w-3.5 h-3.5 text-gray-400" />
                                {patient.email}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{formatDate(patient.dataNascimento)}</span>
                            <span className="text-gray-400">({calculateAge(patient.dataNascimento)} anos)</span>
                          </div>
                        </td>
                        <td className="table-cell">
                          {patient.convenio ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">
                              <Shield className="w-3.5 h-3.5" />
                              {patient.convenio.nome}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium">
                              Particular
                            </span>
                          )}
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{patientStats.totalRecords}</span>
                            {patientStats.lastVisit && (
                              <span className="text-xs text-gray-400">
                                (última: {formatDate(patientStats.lastVisit)})
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="table-cell text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              to={`/pacientes/${patient.id}`}
                              className="table-action-icon"
                              title="Ver prontuário"
                            >
                              <FileText className="w-5 h-5" />
                            </Link>
                            <button
                              onClick={() => handleOpenModal(patient)}
                              className="table-action-icon"
                              title="Editar"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => setPatientToDelete(patient)}
                              className="table-action-icon danger"
                              title="Excluir"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

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

// Patient Card Component
interface PatientCardProps {
  patient: Patient;
  stats: {
    totalRecords: number;
    totalAppointments: number;
    lastVisit?: string;
  };
  onEdit: () => void;
  onDelete: () => void;
}

function PatientCard({ patient, stats, onEdit, onDelete }: PatientCardProps) {
  const hasAlergias = patient.alergias && patient.alergias.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Header com gradient */}
      <div className="h-2 bg-gradient-to-r from-sky-500 to-cyan-500"></div>

      <div className="p-5">
        {/* Patient Info */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 bg-gradient-to-br from-sky-100 to-sky-50 rounded-2xl flex items-center justify-center group-hover:from-sky-200 group-hover:to-sky-100 transition-all shadow-sm">
            <User className="w-7 h-7 text-sky-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-lg truncate group-hover:text-sky-700 transition-colors">
              {patient.nome}
            </h3>
            <p className="text-sm text-gray-500">{formatCPF(patient.cpf)}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-400">
                {calculateAge(patient.dataNascimento)} anos
              </span>
              {hasAlergias && (
                <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                  <AlertTriangle className="w-3 h-3" />
                  Alergias
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Phone className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-gray-700">{formatPhone(patient.telefone)}</span>
          </div>
          {patient.email && (
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-gray-500 truncate">{patient.email}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-500" />
              <span className="text-lg font-bold text-gray-900">{stats.totalRecords}</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Atendimentos</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-gray-900">
                {stats.lastVisit ? formatDate(stats.lastVisit) : 'Nunca'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Última visita</p>
          </div>
        </div>

        {/* Convênio Badge */}
        <div className="mb-4">
          {patient.convenio ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">
              <Shield className="w-4 h-4" />
              {patient.convenio.nome}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
              <Heart className="w-4 h-4" />
              Particular
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
          <Link
            to={`/pacientes/${patient.id}`}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-50 text-sky-600 rounded-xl font-medium hover:bg-sky-100 transition-colors group/btn"
          >
            <FileText className="w-4 h-4" />
            Ver Prontuário
            <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
          </Link>
          <button
            onClick={onEdit}
            className="p-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
            title="Editar paciente"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button
            onClick={onDelete}
            className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
            title="Excluir paciente"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ searchTerm, onAddNew }: { searchTerm: string; onAddNew: () => void }) {
  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
        <User className="w-10 h-10 text-gray-300" />
      </div>
      <p className="text-gray-600 font-medium text-lg">
        {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
      </p>
      <p className="text-sm text-gray-400 mt-1 mb-4">
        {searchTerm ? 'Tente uma busca diferente' : 'Cadastre seu primeiro paciente para começar'}
      </p>
      {!searchTerm && (
        <button
          onClick={onAddNew}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-xl font-medium hover:bg-sky-700 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          Novo Paciente
        </button>
      )}
    </div>
  );
}

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
  X,
  User,
  FileText
} from 'lucide-react';
import { formatDate, calculateAge, formatCPF, formatPhone } from '../utils/helpers';
import type { Patient } from '../types';

export default function Patients() {
  const { patients, addPatient, updatePatient, deletePatient } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

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

  const handleDelete = (id: string) => {
    deletePatient(id);
    setShowDeleteConfirm(null);
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
                      >
                        <FileText className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleOpenModal(patient)}
                        className="p-2 text-gray-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(patient.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-5 h-5" />
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
          onSave={(data) => {
            if (editingPatient) {
              updatePatient(editingPatient.id, data);
            } else {
              addPatient(data as any);
            }
            handleCloseModal();
          }}
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

// Patient Modal Component
interface PatientModalProps {
  patient: Patient | null;
  onClose: () => void;
  onSave: (data: Partial<Patient>) => void;
}

function PatientModal({ patient, onClose, onSave }: PatientModalProps) {
  const [formData, setFormData] = useState({
    nome: patient?.nome || '',
    cpf: patient?.cpf || '',
    dataNascimento: patient?.dataNascimento || '',
    sexo: patient?.sexo || 'M',
    telefone: patient?.telefone || '',
    email: patient?.email || '',
    logradouro: patient?.endereco?.logradouro || '',
    numero: patient?.endereco?.numero || '',
    complemento: patient?.endereco?.complemento || '',
    bairro: patient?.endereco?.bairro || '',
    cidade: patient?.endereco?.cidade || '',
    estado: patient?.endereco?.estado || '',
    cep: patient?.endereco?.cep || '',
    convenioNome: patient?.convenio?.nome || '',
    convenioNumero: patient?.convenio?.numero || '',
    convenioValidade: patient?.convenio?.validade || '',
    alergias: patient?.alergias?.join(', ') || '',
    medicamentosEmUso: patient?.medicamentosEmUso?.join(', ') || '',
    historicoFamiliar: patient?.historicoFamiliar || '',
    observacoes: patient?.observacoes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: Partial<Patient> = {
      nome: formData.nome,
      cpf: formData.cpf,
      dataNascimento: formData.dataNascimento,
      sexo: formData.sexo as 'M' | 'F' | 'O',
      telefone: formData.telefone,
      email: formData.email || undefined,
      endereco: {
        logradouro: formData.logradouro,
        numero: formData.numero,
        complemento: formData.complemento || undefined,
        bairro: formData.bairro,
        cidade: formData.cidade,
        estado: formData.estado,
        cep: formData.cep
      },
      alergias: formData.alergias ? formData.alergias.split(',').map(a => a.trim()) : undefined,
      medicamentosEmUso: formData.medicamentosEmUso ? formData.medicamentosEmUso.split(',').map(m => m.trim()) : undefined,
      historicoFamiliar: formData.historicoFamiliar || undefined,
      observacoes: formData.observacoes || undefined
    };

    if (formData.convenioNome) {
      data.convenio = {
        nome: formData.convenioNome,
        numero: formData.convenioNumero,
        validade: formData.convenioValidade
      };
    }

    onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {patient ? 'Editar Paciente' : 'Novo Paciente'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Dados Pessoais */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Dados Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Nome completo *</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={e => setFormData({ ...formData, nome: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">CPF *</label>
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={e => setFormData({ ...formData, cpf: e.target.value })}
                  className="input-field"
                  placeholder="000.000.000-00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Data de nascimento *</label>
                <input
                  type="date"
                  value={formData.dataNascimento}
                  onChange={e => setFormData({ ...formData, dataNascimento: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Sexo *</label>
                <select
                  value={formData.sexo}
                  onChange={e => setFormData({ ...formData, sexo: e.target.value as 'M' | 'F' | 'O' })}
                  className="input-field"
                >
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                  <option value="O">Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Telefone *</label>
                <input
                  type="tel"
                  value={formData.telefone}
                  onChange={e => setFormData({ ...formData, telefone: e.target.value })}
                  className="input-field"
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Logradouro</label>
                <input
                  type="text"
                  value={formData.logradouro}
                  onChange={e => setFormData({ ...formData, logradouro: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Número</label>
                <input
                  type="text"
                  value={formData.numero}
                  onChange={e => setFormData({ ...formData, numero: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Complemento</label>
                <input
                  type="text"
                  value={formData.complemento}
                  onChange={e => setFormData({ ...formData, complemento: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Bairro</label>
                <input
                  type="text"
                  value={formData.bairro}
                  onChange={e => setFormData({ ...formData, bairro: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Cidade</label>
                <input
                  type="text"
                  value={formData.cidade}
                  onChange={e => setFormData({ ...formData, cidade: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Estado</label>
                <input
                  type="text"
                  value={formData.estado}
                  onChange={e => setFormData({ ...formData, estado: e.target.value })}
                  className="input-field"
                  maxLength={2}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">CEP</label>
                <input
                  type="text"
                  value={formData.cep}
                  onChange={e => setFormData({ ...formData, cep: e.target.value })}
                  className="input-field"
                  placeholder="00000-000"
                />
              </div>
            </div>
          </div>

          {/* Convênio */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Convênio (opcional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nome do convênio</label>
                <input
                  type="text"
                  value={formData.convenioNome}
                  onChange={e => setFormData({ ...formData, convenioNome: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Número da carteira</label>
                <input
                  type="text"
                  value={formData.convenioNumero}
                  onChange={e => setFormData({ ...formData, convenioNumero: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Validade</label>
                <input
                  type="date"
                  value={formData.convenioValidade}
                  onChange={e => setFormData({ ...formData, convenioValidade: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Histórico Médico */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Histórico Médico</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Alergias (separadas por vírgula)</label>
                <input
                  type="text"
                  value={formData.alergias}
                  onChange={e => setFormData({ ...formData, alergias: e.target.value })}
                  className="input-field"
                  placeholder="Ex: Dipirona, Penicilina"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Medicamentos em uso</label>
                <input
                  type="text"
                  value={formData.medicamentosEmUso}
                  onChange={e => setFormData({ ...formData, medicamentosEmUso: e.target.value })}
                  className="input-field"
                  placeholder="Ex: Losartana 50mg, Metformina 850mg"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Histórico familiar</label>
                <textarea
                  value={formData.historicoFamiliar}
                  onChange={e => setFormData({ ...formData, historicoFamiliar: e.target.value })}
                  className="input-field"
                  rows={2}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Observações</label>
                <textarea
                  value={formData.observacoes}
                  onChange={e => setFormData({ ...formData, observacoes: e.target.value })}
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
              {patient ? 'Salvar alterações' : 'Cadastrar paciente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

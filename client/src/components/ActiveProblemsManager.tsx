import { useState } from 'react';
import { Plus, X, AlertCircle, CheckCircle, Clock, XCircle, Edit2, Save } from 'lucide-react';
import type { ActiveProblem, ProblemStatus, ProblemSeverity } from '../types';

interface ActiveProblemsManagerProps {
  problems: ActiveProblem[];
  onAdd: (problem: Omit<ActiveProblem, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<ActiveProblem>) => void;
  onRemove: (id: string) => void;
  currentMedicalRecordId?: string;
}

const STATUS_LABELS: Record<ProblemStatus, string> = {
  ativo: 'Ativo',
  controlado: 'Controlado',
  resolvido: 'Resolvido',
  inativo: 'Inativo'
};

const STATUS_COLORS: Record<ProblemStatus, string> = {
  ativo: 'bg-red-100 text-red-800 border-red-300',
  controlado: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  resolvido: 'bg-green-100 text-green-800 border-green-300',
  inativo: 'bg-gray-100 text-gray-800 border-gray-300'
};

const STATUS_ICONS: Record<ProblemStatus, typeof AlertCircle> = {
  ativo: AlertCircle,
  controlado: Clock,
  resolvido: CheckCircle,
  inativo: XCircle
};

const SEVERITY_LABELS: Record<ProblemSeverity, string> = {
  leve: 'Leve',
  moderada: 'Moderada',
  grave: 'Grave',
  critica: 'Crítica'
};

const SEVERITY_COLORS: Record<ProblemSeverity, string> = {
  leve: 'bg-blue-100 text-blue-800',
  moderada: 'bg-yellow-100 text-yellow-800',
  grave: 'bg-orange-100 text-orange-800',
  critica: 'bg-red-100 text-red-800'
};

export function ActiveProblemsManager({
  problems,
  onAdd,
  onUpdate,
  onRemove,
  currentMedicalRecordId
}: ActiveProblemsManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    cid10: '',
    description: '',
    severity: 'moderada' as ProblemSeverity,
    status: 'ativo' as ProblemStatus,
    isPrimary: false,
    currentTreatment: '',
    notes: '',
    goals: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.cid10.trim() || !formData.description.trim()) {
      return;
    }

    const newProblem: Omit<ActiveProblem, 'id'> = {
      patientId: '', // Will be set by parent
      cid10: formData.cid10.toUpperCase().trim(),
      description: formData.description.trim(),
      severity: formData.severity,
      status: formData.status,
      isPrimary: formData.isPrimary,
      dateOnset: new Date().toISOString(),
      currentTreatment: formData.currentTreatment.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      goals: formData.goals.trim() ? formData.goals.split('\n').filter(g => g.trim()) : undefined,
      relatedMedicalRecords: currentMedicalRecordId ? [currentMedicalRecordId] : []
    };

    if (editingId) {
      onUpdate(editingId, newProblem);
      setEditingId(null);
    } else {
      onAdd(newProblem);
    }

    // Reset form
    setFormData({
      cid10: '',
      description: '',
      severity: 'moderada',
      status: 'ativo',
      isPrimary: false,
      currentTreatment: '',
      notes: '',
      goals: ''
    });
    setShowForm(false);
  };

  const handleEdit = (problem: ActiveProblem) => {
    setFormData({
      cid10: problem.cid10,
      description: problem.description,
      severity: problem.severity,
      status: problem.status,
      isPrimary: problem.isPrimary,
      currentTreatment: problem.currentTreatment || '',
      notes: problem.notes || '',
      goals: problem.goals?.join('\n') || ''
    });
    setEditingId(problem.id);
    setShowForm(true);
  };

  const handleStatusChange = (problemId: string, newStatus: ProblemStatus) => {
    const updates: Partial<ActiveProblem> = { status: newStatus };

    if (newStatus === 'resolvido') {
      updates.dateResolved = new Date().toISOString();
    }

    onUpdate(problemId, updates);
  };

  const activeProblems = problems.filter(p => p.status === 'ativo' || p.status === 'controlado');
  const resolvedProblems = problems.filter(p => p.status === 'resolvido' || p.status === 'inativo');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-gray-900">Lista de Problemas</h3>
          {activeProblems.length > 0 && (
            <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded-full">
              {activeProblems.length} ativo{activeProblems.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Adicionar Problema
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CID-10 *
                </label>
                <input
                  type="text"
                  value={formData.cid10}
                  onChange={(e) => setFormData({ ...formData, cid10: e.target.value })}
                  placeholder="Ex: I10, E11, J45"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição *
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: Hipertensão Arterial Sistêmica"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gravidade
                </label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value as ProblemSeverity })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {Object.entries(SEVERITY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ProblemStatus })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tratamento Atual
              </label>
              <input
                type="text"
                value={formData.currentTreatment}
                onChange={(e) => setFormData({ ...formData, currentTreatment: e.target.value })}
                placeholder="Ex: Losartana 50mg 1x/dia"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Metas Terapêuticas (uma por linha)
              </label>
              <textarea
                value={formData.goals}
                onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                placeholder="Ex:&#10;PA < 130/80 mmHg&#10;Redução de peso 5kg&#10;Atividade física 3x/semana"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Observações adicionais sobre o problema"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPrimary"
                checked={formData.isPrimary}
                onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="isPrimary" className="text-sm text-gray-700">
                Marcar como problema principal
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                {editingId ? 'Atualizar' : 'Adicionar'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({
                    cid10: '',
                    description: '',
                    severity: 'moderada',
                    status: 'ativo',
                    isPrimary: false,
                    currentTreatment: '',
                    notes: '',
                    goals: ''
                  });
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Problems */}
      {activeProblems.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">Problemas Ativos</h4>
          <div className="space-y-2">
            {activeProblems.map((problem) => (
              <ProblemCard
                key={problem.id}
                problem={problem}
                onEdit={handleEdit}
                onStatusChange={handleStatusChange}
                onRemove={onRemove}
              />
            ))}
          </div>
        </div>
      )}

      {/* Resolved Problems */}
      {resolvedProblems.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-sm font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-2">
            <span>Problemas Resolvidos/Inativos ({resolvedProblems.length})</span>
          </summary>
          <div className="mt-2 space-y-2">
            {resolvedProblems.map((problem) => (
              <ProblemCard
                key={problem.id}
                problem={problem}
                onEdit={handleEdit}
                onStatusChange={handleStatusChange}
                onRemove={onRemove}
              />
            ))}
          </div>
        </details>
      )}

      {problems.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Nenhum problema cadastrado</p>
          <p className="text-sm">Clique em "Adicionar Problema" para começar</p>
        </div>
      )}
    </div>
  );
}

function ProblemCard({
  problem,
  onEdit,
  onStatusChange,
  onRemove
}: {
  problem: ActiveProblem;
  onEdit: (problem: ActiveProblem) => void;
  onStatusChange: (id: string, status: ProblemStatus) => void;
  onRemove: (id: string) => void;
}) {
  const StatusIcon = STATUS_ICONS[problem.status];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-mono rounded">
              {problem.cid10}
            </span>
            <span className={`px-2 py-0.5 text-xs font-medium rounded border ${STATUS_COLORS[problem.status]}`}>
              <StatusIcon className="w-3 h-3 inline mr-1" />
              {STATUS_LABELS[problem.status]}
            </span>
            <span className={`px-2 py-0.5 text-xs font-medium rounded ${SEVERITY_COLORS[problem.severity]}`}>
              {SEVERITY_LABELS[problem.severity]}
            </span>
            {problem.isPrimary && (
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                Principal
              </span>
            )}
          </div>

          <h4 className="font-semibold text-gray-900 mb-1">{problem.description}</h4>

          {problem.currentTreatment && (
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Tratamento:</span> {problem.currentTreatment}
            </p>
          )}

          {problem.goals && problem.goals.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-medium text-gray-700 mb-1">Metas:</p>
              <ul className="text-xs text-gray-600 space-y-0.5">
                {problem.goals.map((goal, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span className="text-indigo-500">→</span>
                    <span>{goal}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {problem.notes && (
            <p className="text-xs text-gray-500 mt-2 italic">{problem.notes}</p>
          )}

          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span>Início: {new Date(problem.dateOnset).toLocaleDateString('pt-BR')}</span>
            {problem.dateResolved && (
              <span>Resolução: {new Date(problem.dateResolved).toLocaleDateString('pt-BR')}</span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <button
            onClick={() => onEdit(problem)}
            className="p-1.5 hover:bg-indigo-50 rounded transition-colors"
            title="Editar"
          >
            <Edit2 className="w-4 h-4 text-indigo-600" />
          </button>
          <button
            onClick={() => onRemove(problem.id)}
            className="p-1.5 hover:bg-red-50 rounded transition-colors"
            title="Remover"
          >
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>

      {/* Quick Status Change */}
      {problem.status !== 'resolvido' && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-600">Alterar status:</span>
            {(['ativo', 'controlado', 'resolvido'] as ProblemStatus[])
              .filter(s => s !== problem.status)
              .map(status => (
                <button
                  key={status}
                  onClick={() => onStatusChange(problem.id, status)}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  {STATUS_LABELS[status]}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { FileText, Search, Plus, Eye, Tag } from 'lucide-react';
import {
  ORIENTATION_TEMPLATES,
  getTemplatesByType,
  getTemplatesByCID,
  searchTemplates
} from '../utils/orientationTemplates';
import type { OrientationType } from '../types';

interface OrientationTemplateSelectorProps {
  currentCIDs?: string[];
  currentOrientation?: string;
  onSelect: (content: string) => void;
  onAppend?: (content: string) => void;
}

const TYPE_LABELS: Record<OrientationType, string> = {
  geral: 'Geral',
  alimentar: 'Alimentar',
  medicacao: 'Medicação',
  atividade_fisica: 'Atividade Física',
  retorno: 'Retorno',
  cuidados_especiais: 'Cuidados Especiais'
};

export function OrientationTemplateSelector({
  currentCIDs = [],
  currentOrientation = '',
  onSelect,
  onAppend
}: OrientationTemplateSelectorProps) {
  const [showTemplates, setShowTemplates] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<OrientationType | 'all'>('all');
  const [previewTemplate, setPreviewTemplate] = useState<typeof ORIENTATION_TEMPLATES[0] | null>(null);

  // Filtra templates
  const getFilteredTemplates = () => {
    let templates = ORIENTATION_TEMPLATES;

    // Filtra por tipo
    if (selectedType !== 'all') {
      templates = getTemplatesByType(selectedType);
    }

    // Busca por texto
    if (searchQuery.trim()) {
      templates = searchTemplates(searchQuery);
    }

    return templates;
  };

  // Templates sugeridos baseados nos CIDs
  const suggestedTemplates = currentCIDs.flatMap(cid => getTemplatesByCID(cid));
  const uniqueSuggested = Array.from(new Set(suggestedTemplates.map(t => t.id)))
    .map(id => suggestedTemplates.find(t => t.id === id)!);

  const filteredTemplates = getFilteredTemplates();

  const handleSelectTemplate = (template: typeof ORIENTATION_TEMPLATES[0], append: boolean = false) => {
    const content = `${template.title}\n\n${template.content}`;

    if (append && onAppend) {
      // Adiciona ao texto existente
      const separator = currentOrientation.trim() ? '\n\n---\n\n' : '';
      onAppend(separator + content);
    } else {
      // Substitui o texto
      onSelect(content);
    }

    setShowTemplates(false);
    setSearchQuery('');
  };

  return (
    <div className="space-y-2">
      {/* Button to show templates */}
      <button
        type="button"
        onClick={() => setShowTemplates(!showTemplates)}
        className="flex items-center gap-2 px-3 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-sm transition-colors"
      >
        <FileText className="w-4 h-4" />
        <span>Usar Template de Orientações</span>
        {uniqueSuggested.length > 0 && (
          <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">
            {uniqueSuggested.length}
          </span>
        )}
      </button>

      {/* Templates Panel */}
      {showTemplates && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200 max-h-[600px] overflow-y-auto">
          {/* Search and Filters */}
          <div className="space-y-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar template..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-700">Tipo:</span>
              <button
                onClick={() => setSelectedType('all')}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  selectedType === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Todos
              </button>
              {Object.entries(TYPE_LABELS).map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type as OrientationType)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    selectedType === type
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Suggested Templates */}
          {uniqueSuggested.length > 0 && selectedType === 'all' && !searchQuery && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Sugeridos para os diagnósticos
              </h4>
              <div className="space-y-2">
                {uniqueSuggested.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onSelect={handleSelectTemplate}
                    onPreview={setPreviewTemplate}
                    isSuggested
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Templates */}
          {filteredTemplates.length > 0 ? (
            <div className="space-y-2">
              {uniqueSuggested.length > 0 && selectedType === 'all' && !searchQuery && (
                <h4 className="text-sm font-semibold text-gray-700 mt-4 mb-2">
                  Todos os Templates
                </h4>
              )}
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={handleSelectTemplate}
                  onPreview={setPreviewTemplate}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum template encontrado</p>
            </div>
          )}
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4"
          onClick={() => setPreviewTemplate(null)}
        >
          <div
            className="bg-white rounded-xl max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="font-semibold text-gray-900">{previewTemplate.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded">
                    {TYPE_LABELS[previewTemplate.type]}
                  </span>
                  {previewTemplate.tags?.map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                {previewTemplate.content}
              </pre>
            </div>
            <div className="flex items-center justify-end gap-2 p-4 border-t bg-gray-50">
              {currentOrientation && onAppend && (
                <button
                  onClick={() => {
                    handleSelectTemplate(previewTemplate, true);
                    setPreviewTemplate(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar ao Texto
                </button>
              )}
              <button
                onClick={() => {
                  handleSelectTemplate(previewTemplate);
                  setPreviewTemplate(null);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                Usar Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TemplateCard({
  template,
  onSelect,
  onPreview,
  isSuggested = false
}: {
  template: typeof ORIENTATION_TEMPLATES[0];
  onSelect: (template: typeof ORIENTATION_TEMPLATES[0], append: boolean) => void;
  onPreview: (template: typeof ORIENTATION_TEMPLATES[0]) => void;
  isSuggested?: boolean;
}) {
  return (
    <div className={`bg-white border rounded-lg p-3 hover:border-indigo-300 transition-colors ${
      isSuggested ? 'border-indigo-200 bg-indigo-50/50' : 'border-gray-200'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h5 className="font-medium text-gray-900 text-sm">{template.title}</h5>
            {isSuggested && (
              <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs rounded">
                Sugerido
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
              {TYPE_LABELS[template.type]}
            </span>
            {template.tags?.slice(0, 3).map(tag => (
              <span key={tag} className="text-xs text-gray-500">
                #{tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPreview(template)}
            className="p-1.5 hover:bg-indigo-100 rounded transition-colors"
            title="Visualizar"
          >
            <Eye className="w-4 h-4 text-indigo-600" />
          </button>
          <button
            onClick={() => onSelect(template, false)}
            className="p-1.5 hover:bg-green-100 rounded transition-colors"
            title="Usar template"
          >
            <Plus className="w-4 h-4 text-green-600" />
          </button>
        </div>
      </div>
    </div>
  );
}

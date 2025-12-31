import { useState } from 'react';
import { Upload, File, X, FileText, Image, FileCheck, AlertCircle, Download, Eye } from 'lucide-react';
import type { MedicalRecordAttachment, AttachmentType } from '../types';

interface MedicalAttachmentsProps {
  attachments: MedicalRecordAttachment[];
  onAdd: (attachment: Omit<MedicalRecordAttachment, 'id' | 'medicalRecordId' | 'uploadedAt'>) => void;
  onRemove: (id: string) => void;
  maxFileSize?: number; // em bytes, padrão 5MB
  acceptedTypes?: string[]; // MIME types aceitos
}

const ATTACHMENT_TYPE_LABELS: Record<AttachmentType, string> = {
  exame_laboratorial: 'Exame Laboratorial',
  exame_imagem: 'Exame de Imagem',
  laudo: 'Laudo Médico',
  receita: 'Receita',
  atestado: 'Atestado',
  termo_consentimento: 'Termo de Consentimento',
  relatorio_medico: 'Relatório Médico',
  outros: 'Outros'
};

const ATTACHMENT_TYPE_ICONS: Record<AttachmentType, typeof FileText> = {
  exame_laboratorial: FileCheck,
  exame_imagem: Image,
  laudo: FileText,
  receita: FileText,
  atestado: FileText,
  termo_consentimento: File,
  relatorio_medico: FileText,
  outros: File
};

export function MedicalAttachments({
  attachments,
  onAdd,
  onRemove,
  maxFileSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
}: MedicalAttachmentsProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<AttachmentType>('exame_laboratorial');
  const [description, setDescription] = useState('');
  const [previewFile, setPreviewFile] = useState<MedicalRecordAttachment | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validação de tamanho
    if (file.size > maxFileSize) {
      setError(`Arquivo muito grande. Tamanho máximo: ${(maxFileSize / 1024 / 1024).toFixed(1)}MB`);
      return;
    }

    // Validação de tipo
    if (!acceptedTypes.includes(file.type)) {
      setError('Tipo de arquivo não suportado. Use PDF, JPG ou PNG.');
      return;
    }

    setIsUploading(true);

    try {
      // Converte para Base64
      const base64 = await fileToBase64(file);

      const newAttachment: Omit<MedicalRecordAttachment, 'id' | 'medicalRecordId' | 'uploadedAt'> = {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileData: base64,
        attachmentType: selectedType,
        description: description.trim() || undefined,
        uploadedBy: 'Usuário Atual' // TODO: pegar do contexto de autenticação
      };

      onAdd(newAttachment);

      // Limpa formulário
      setDescription('');
      e.target.value = '';
    } catch (err) {
      setError('Erro ao processar arquivo. Tente novamente.');
      console.error('Error processing file:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove o prefixo "data:mime/type;base64,"
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const downloadFile = (attachment: MedicalRecordAttachment) => {
    const link = document.createElement('a');
    link.href = `data:${attachment.fileType};base64,${attachment.fileData}`;
    link.download = attachment.fileName;
    link.click();
  };

  const previewAttachment = (attachment: MedicalRecordAttachment) => {
    setPreviewFile(attachment);
  };

  return (
    <div className="space-y-4">
      {/* Upload Form */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <Upload className="w-5 h-5 text-blue-600" />
          <h4 className="font-semibold text-gray-800">Anexar Documentos</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Documento
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as AttachmentType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.entries(ATTACHMENT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição (opcional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Hemograma completo"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors">
            <Upload className="w-4 h-4" />
            <span>{isUploading ? 'Processando...' : 'Selecionar Arquivo'}</span>
            <input
              type="file"
              onChange={handleFileSelect}
              accept={acceptedTypes.join(',')}
              disabled={isUploading}
              className="hidden"
            />
          </label>
          <p className="text-xs text-gray-600 mt-2 text-center">
            PDF, JPG ou PNG • Máximo {(maxFileSize / 1024 / 1024).toFixed(0)}MB
          </p>
        </div>

        {error && (
          <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
            <File className="w-4 h-4" />
            Documentos Anexados ({attachments.length})
          </h4>
          <div className="space-y-2">
            {attachments.map((attachment) => {
              const Icon = ATTACHMENT_TYPE_ICONS[attachment.attachmentType];
              const isImage = attachment.fileType.startsWith('image/');

              return (
                <div
                  key={attachment.id}
                  className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors group"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isImage ? 'bg-purple-100' : 'bg-blue-100'
                  }`}>
                    <Icon className={`w-5 h-5 ${isImage ? 'text-purple-600' : 'text-blue-600'}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {attachment.fileName}
                      </p>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                        {ATTACHMENT_TYPE_LABELS[attachment.attachmentType]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-gray-500">
                        {formatFileSize(attachment.fileSize)}
                      </p>
                      {attachment.description && (
                        <p className="text-xs text-gray-600 truncate">
                          {attachment.description}
                        </p>
                      )}
                      {attachment.uploadedAt && (
                        <p className="text-xs text-gray-400">
                          {new Date(attachment.uploadedAt).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isImage && (
                      <button
                        onClick={() => previewAttachment(attachment)}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                      </button>
                    )}
                    <button
                      onClick={() => downloadFile(attachment)}
                      className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                      title="Baixar"
                    >
                      <Download className="w-4 h-4 text-green-600" />
                    </button>
                    <button
                      onClick={() => onRemove(attachment.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remover"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[70] p-4"
          onClick={() => setPreviewFile(null)}
        >
          <div className="max-w-4xl max-h-[90vh] bg-white rounded-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-900">{previewFile.fileName}</h3>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <img
                src={`data:${previewFile.fileType};base64,${previewFile.fileData}`}
                alt={previewFile.fileName}
                className="max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

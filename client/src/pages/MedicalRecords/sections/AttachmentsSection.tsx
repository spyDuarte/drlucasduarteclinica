import { Paperclip } from 'lucide-react';
import { SectionHeader } from './components';
import { MedicalAttachments } from '../../../components/MedicalAttachments';
import type { MedicalRecordAttachment } from '../../../types';

interface AttachmentsSectionProps {
  attachments: MedicalRecordAttachment[];
  onAdd: (attachment: Omit<MedicalRecordAttachment, 'id' | 'medicalRecordId' | 'uploadedAt'>) => void;
  onRemove: (id: string) => void;
}

export function AttachmentsSection({ attachments, onAdd, onRemove }: AttachmentsSectionProps) {
  return (
    <div className="space-y-6">
       <SectionHeader title="Anexos" subtitle="Documentos complementares" icon={Paperclip} />
       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="bg-slate-50 p-8 rounded-xl border border-dashed border-slate-300 text-center hover:bg-slate-50/80 transition-colors">
             <p className="text-slate-500 mb-4 text-sm">Arraste arquivos ou clique para adicionar resultados de exames.</p>
             <MedicalAttachments attachments={attachments} onAdd={onAdd} onRemove={onRemove} />
          </div>
       </div>
    </div>
  );
}

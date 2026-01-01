import { useEffect, useRef } from 'react';
import { X, Printer, Download, FileText } from 'lucide-react';
import type { MedicalDocument, Patient } from '../types';
import { generateDocumentHTML, printDocument, downloadDocument } from '../utils/documentGenerator';
import { DOCUMENT_TYPES } from '../constants/clinic';

interface DocumentPreviewProps {
  document: MedicalDocument;
  patient: Patient;
  onClose: () => void;
}

export function DocumentPreview({ document, patient, onClose }: DocumentPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const html = generateDocumentHTML(document, patient);
      const iframeDoc = iframeRef.current.contentDocument;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();
      }
    }
  }, [document, patient]);

  const handlePrint = () => {
    printDocument(document, patient);
  };

  const handleDownload = () => {
    downloadDocument(document, patient);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-2 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-primary-700 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {DOCUMENT_TYPES[document.type]}
              </h2>
              <p className="text-sm text-white/70">{patient.nome}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white flex items-center gap-2"
              title="Baixar documento"
            >
              <Download className="w-5 h-5" />
              <span className="hidden sm:inline text-sm">Baixar</span>
            </button>
            <button
              onClick={handlePrint}
              className="p-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-all text-white flex items-center gap-2"
              title="Imprimir documento"
            >
              <Printer className="w-5 h-5" />
              <span className="hidden sm:inline text-sm">Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white ml-2"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-hidden p-4 bg-gray-100">
          <div className="h-full bg-white rounded-lg shadow-inner overflow-hidden">
            <iframe
              ref={iframeRef}
              title="Visualização do documento"
              className="w-full h-full border-0"
              style={{ minHeight: '600px' }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <p className="text-sm text-gray-500">
            Documento gerado em {new Date().toLocaleDateString('pt-BR')}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all"
            >
              Fechar
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-medium shadow-lg shadow-primary-500/25 transition-all flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

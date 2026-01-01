// Gerador de documentos médicos para impressão
import type { MedicalDocument, Patient, Prescription } from '../types';
import { CLINIC_INFO, DOCUMENT_TYPES } from '../constants/clinic';
import { formatDate, formatCPF, calculateAge } from './helpers';

interface DocumentData {
  document: MedicalDocument;
  patient: Patient;
}

// Gera o cabeçalho padrão da clínica
function generateHeader(): string {
  return `
    <div class="header">
      <div class="clinic-info">
        <h1>${CLINIC_INFO.nome}</h1>
        <p>${CLINIC_INFO.endereco}</p>
        <p>${CLINIC_INFO.cidade} - CEP: ${CLINIC_INFO.cep}</p>
        <p>Tel: ${CLINIC_INFO.telefone} | Email: ${CLINIC_INFO.email}</p>
      </div>
    </div>
    <hr class="header-divider" />
  `;
}

// Gera o rodapé com assinatura
function generateFooter(document: MedicalDocument): string {
  const date = document.emitidoAt ? new Date(document.emitidoAt) : new Date();
  const formattedDate = formatDate(date.toISOString());

  return `
    <div class="footer">
      <p class="date">${CLINIC_INFO.cidade}, ${formattedDate}</p>
      <div class="signature">
        <div class="signature-line"></div>
        <p class="doctor-name">${document.medicoNome || 'Dr. Lucas Duarte'}</p>
        <p class="doctor-crm">CRM: ${document.medicoCRM || '000000/SP'}</p>
        ${document.medicoEspecialidade ? `<p class="doctor-specialty">${document.medicoEspecialidade}</p>` : ''}
      </div>
    </div>
  `;
}

// Gera informações do paciente
function generatePatientInfo(patient: Patient): string {
  const age = calculateAge(patient.dataNascimento);
  return `
    <div class="patient-info">
      <p><strong>Paciente:</strong> ${patient.nome}</p>
      <p><strong>CPF:</strong> ${formatCPF(patient.cpf)} | <strong>Idade:</strong> ${age} anos</p>
      ${patient.endereco ? `<p><strong>Endereço:</strong> ${patient.endereco.logradouro}, ${patient.endereco.numero} - ${patient.endereco.bairro}, ${patient.endereco.cidade}/${patient.endereco.estado}</p>` : ''}
    </div>
  `;
}

// Gera atestado médico
function generateAtestadoMedico({ document, patient }: DocumentData): string {
  const dataInicio = document.dataInicio ? formatDate(document.dataInicio) : formatDate(new Date().toISOString());
  const dataFim = document.dataFim ? formatDate(document.dataFim) : '';

  return `
    <div class="document-title">
      <h2>ATESTADO MÉDICO</h2>
    </div>
    ${generatePatientInfo(patient)}
    <div class="document-body">
      <p class="content-text">
        ${document.content || `Atesto para os devidos fins que o(a) paciente acima identificado(a) esteve sob meus cuidados profissionais e necessita de afastamento de suas atividades laborais por um período de <strong>${document.diasAfastamento || '___'} dia(s)</strong>, a partir de ${dataInicio}${dataFim ? ` até ${dataFim}` : ''}.`}
      </p>
      ${document.exibirCid && document.cid10 && document.cid10.length > 0 ? `
        <p class="cid-info"><strong>CID-10:</strong> ${document.cid10.join(', ')}</p>
      ` : ''}
    </div>
  `;
}

// Gera declaração de comparecimento
function generateDeclaracaoComparecimento({ document, patient }: DocumentData): string {
  const dataAtendimento = document.emitidoAt ? formatDate(document.emitidoAt) : formatDate(new Date().toISOString());

  return `
    <div class="document-title">
      <h2>DECLARAÇÃO DE COMPARECIMENTO</h2>
    </div>
    ${generatePatientInfo(patient)}
    <div class="document-body">
      <p class="content-text">
        ${document.content || `Declaro para os devidos fins que o(a) paciente acima identificado(a) compareceu a esta clínica no dia ${dataAtendimento}${document.horaChegada ? `, com chegada às ${document.horaChegada}` : ''}${document.horaSaida ? ` e saída às ${document.horaSaida}` : ''}, para consulta médica.`}
      </p>
    </div>
  `;
}

// Gera laudo médico
function generateLaudoMedico({ document, patient }: DocumentData): string {
  return `
    <div class="document-title">
      <h2>LAUDO MÉDICO</h2>
      ${document.finalidade ? `<p class="document-subtitle">Finalidade: ${document.finalidade}</p>` : ''}
    </div>
    ${generatePatientInfo(patient)}
    <div class="document-body">
      <div class="laudo-content">
        <p class="content-text">${document.content || ''}</p>
      </div>
      ${document.cid10 && document.cid10.length > 0 ? `
        <p class="cid-info"><strong>Diagnóstico (CID-10):</strong> ${document.cid10.join(', ')}</p>
      ` : ''}
      ${document.conclusao ? `
        <div class="conclusao">
          <h3>CONCLUSÃO</h3>
          <p>${document.conclusao}</p>
        </div>
      ` : ''}
    </div>
  `;
}

// Gera receita médica
function generateReceita({ document, patient }: DocumentData): string {
  const prescricoes = document.prescricoes || [];

  return `
    <div class="document-title">
      <h2>RECEITA MÉDICA</h2>
    </div>
    ${generatePatientInfo(patient)}
    <div class="document-body">
      <div class="prescricoes">
        ${prescricoes.length > 0 ? prescricoes.map((rx: Prescription, index: number) => `
          <div class="prescricao-item">
            <p class="prescricao-numero">${index + 1}.</p>
            <div class="prescricao-content">
              <p class="medicamento"><strong>${rx.medicamento}</strong> ${rx.concentracao || ''}</p>
              <p class="forma">${rx.formaFarmaceutica} - ${rx.quantidade}</p>
              <p class="posologia">${rx.posologia}</p>
              ${rx.duracao ? `<p class="duracao">Duração: ${rx.duracao}</p>` : ''}
              ${rx.observacoes ? `<p class="observacoes"><em>${rx.observacoes}</em></p>` : ''}
            </div>
          </div>
        `).join('') : '<p class="no-prescricoes">Nenhuma prescrição adicionada.</p>'}
      </div>
      ${document.content ? `<div class="observacoes-gerais"><p>${document.content}</p></div>` : ''}
    </div>
  `;
}

// Gera solicitação de exames
function generateSolicitacaoExames({ document, patient }: DocumentData): string {
  const exames = document.examesSolicitados || [];

  return `
    <div class="document-title">
      <h2>SOLICITAÇÃO DE EXAMES</h2>
    </div>
    ${generatePatientInfo(patient)}
    <div class="document-body">
      ${document.indicacaoClinica ? `
        <div class="indicacao-clinica">
          <p><strong>Indicação Clínica:</strong> ${document.indicacaoClinica}</p>
        </div>
      ` : ''}
      <div class="exames-lista">
        <h3>Exames Solicitados:</h3>
        ${exames.length > 0 ? `
          <ul>
            ${exames.map(exame => `<li>${exame}</li>`).join('')}
          </ul>
        ` : '<p>Nenhum exame especificado.</p>'}
      </div>
      ${document.content ? `<div class="observacoes-gerais"><p><strong>Observações:</strong> ${document.content}</p></div>` : ''}
    </div>
  `;
}

// Gera encaminhamento
function generateEncaminhamento({ document, patient }: DocumentData): string {
  return `
    <div class="document-title">
      <h2>ENCAMINHAMENTO MÉDICO</h2>
    </div>
    ${generatePatientInfo(patient)}
    <div class="document-body">
      <div class="encaminhamento-info">
        <p><strong>Especialidade:</strong> ${document.especialidade || '____________________'}</p>
        ${document.urgencia ? `<p><strong>Urgência:</strong> ${document.urgencia === 'emergencia' ? 'Emergência' : document.urgencia === 'urgente' ? 'Urgente' : 'Eletivo'}</p>` : ''}
      </div>
      <div class="motivo-encaminhamento">
        <h3>Motivo do Encaminhamento:</h3>
        <p>${document.motivoEncaminhamento || document.content || ''}</p>
      </div>
      ${document.cid10 && document.cid10.length > 0 ? `
        <p class="cid-info"><strong>Hipótese Diagnóstica (CID-10):</strong> ${document.cid10.join(', ')}</p>
      ` : ''}
    </div>
  `;
}

// Estilos CSS para impressão
function getDocumentStyles(): string {
  return `
    <style>
      @page {
        size: A4;
        margin: 20mm;
      }

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: 'Times New Roman', Times, serif;
        font-size: 12pt;
        line-height: 1.5;
        color: #000;
        background: #fff;
      }

      .document-container {
        max-width: 210mm;
        margin: 0 auto;
        padding: 20mm;
        min-height: 297mm;
        position: relative;
      }

      .header {
        text-align: center;
        margin-bottom: 20px;
      }

      .header h1 {
        font-size: 18pt;
        font-weight: bold;
        margin-bottom: 5px;
        color: #1a365d;
      }

      .header p {
        font-size: 10pt;
        color: #4a5568;
        margin: 2px 0;
      }

      .header-divider {
        border: none;
        border-top: 2px solid #1a365d;
        margin: 15px 0 25px 0;
      }

      .document-title {
        text-align: center;
        margin: 30px 0;
      }

      .document-title h2 {
        font-size: 16pt;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 2px;
      }

      .document-subtitle {
        font-size: 11pt;
        color: #4a5568;
        margin-top: 5px;
      }

      .patient-info {
        background: #f7fafc;
        padding: 15px;
        border-radius: 5px;
        margin: 20px 0;
        border-left: 4px solid #1a365d;
      }

      .patient-info p {
        margin: 5px 0;
        font-size: 11pt;
      }

      .document-body {
        margin: 30px 0;
        text-align: justify;
      }

      .content-text {
        font-size: 12pt;
        line-height: 1.8;
        text-indent: 40px;
        margin-bottom: 15px;
      }

      .cid-info {
        margin-top: 20px;
        font-size: 11pt;
        color: #4a5568;
      }

      .conclusao {
        margin-top: 25px;
        padding: 15px;
        background: #edf2f7;
        border-radius: 5px;
      }

      .conclusao h3 {
        font-size: 12pt;
        margin-bottom: 10px;
        color: #1a365d;
      }

      .prescricoes {
        margin: 20px 0;
      }

      .prescricao-item {
        display: flex;
        gap: 15px;
        margin: 15px 0;
        padding: 15px;
        background: #f7fafc;
        border-radius: 5px;
        border-left: 3px solid #3182ce;
      }

      .prescricao-numero {
        font-weight: bold;
        font-size: 14pt;
        color: #3182ce;
      }

      .prescricao-content .medicamento {
        font-size: 12pt;
        margin-bottom: 5px;
      }

      .prescricao-content .forma,
      .prescricao-content .posologia,
      .prescricao-content .duracao {
        font-size: 11pt;
        color: #4a5568;
      }

      .prescricao-content .observacoes {
        font-size: 10pt;
        color: #718096;
        margin-top: 5px;
      }

      .exames-lista h3 {
        font-size: 12pt;
        margin-bottom: 10px;
        color: #1a365d;
      }

      .exames-lista ul {
        margin-left: 30px;
      }

      .exames-lista li {
        margin: 8px 0;
        font-size: 11pt;
      }

      .encaminhamento-info {
        margin: 20px 0;
        padding: 15px;
        background: #f7fafc;
        border-radius: 5px;
      }

      .encaminhamento-info p {
        margin: 5px 0;
        font-size: 11pt;
      }

      .motivo-encaminhamento {
        margin: 20px 0;
      }

      .motivo-encaminhamento h3 {
        font-size: 12pt;
        margin-bottom: 10px;
        color: #1a365d;
      }

      .indicacao-clinica {
        margin: 15px 0;
        padding: 10px 15px;
        background: #fffbeb;
        border-left: 3px solid #d69e2e;
        border-radius: 3px;
      }

      .observacoes-gerais {
        margin-top: 20px;
        padding: 15px;
        background: #f0fff4;
        border-radius: 5px;
        border-left: 3px solid #38a169;
      }

      .footer {
        margin-top: 60px;
        text-align: center;
      }

      .footer .date {
        margin-bottom: 50px;
        font-size: 11pt;
      }

      .signature {
        display: inline-block;
        text-align: center;
      }

      .signature-line {
        width: 250px;
        border-bottom: 1px solid #000;
        margin: 0 auto 10px auto;
      }

      .doctor-name {
        font-weight: bold;
        font-size: 12pt;
      }

      .doctor-crm {
        font-size: 10pt;
        color: #4a5568;
      }

      .doctor-specialty {
        font-size: 10pt;
        color: #718096;
      }

      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .document-container {
          padding: 0;
        }

        .no-print {
          display: none !important;
        }
      }
    </style>
  `;
}

// Função principal para gerar documento HTML completo
export function generateDocumentHTML(document: MedicalDocument, patient: Patient): string {
  const documentData: DocumentData = { document, patient };

  let documentContent = '';

  switch (document.type) {
    case 'atestado_medico':
      documentContent = generateAtestadoMedico(documentData);
      break;
    case 'declaracao_comparecimento':
      documentContent = generateDeclaracaoComparecimento(documentData);
      break;
    case 'laudo_medico':
      documentContent = generateLaudoMedico(documentData);
      break;
    case 'receita':
      documentContent = generateReceita(documentData);
      break;
    case 'solicitacao_exames':
      documentContent = generateSolicitacaoExames(documentData);
      break;
    case 'encaminhamento':
      documentContent = generateEncaminhamento(documentData);
      break;
    default:
      documentContent = `<div class="document-body"><p>${document.content}</p></div>`;
  }

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${DOCUMENT_TYPES[document.type]} - ${patient.nome}</title>
      ${getDocumentStyles()}
    </head>
    <body>
      <div class="document-container">
        ${generateHeader()}
        ${documentContent}
        ${generateFooter(document)}
      </div>
    </body>
    </html>
  `;
}

// Função para abrir janela de impressão
export function printDocument(document: MedicalDocument, patient: Patient): void {
  const html = generateDocumentHTML(document, patient);
  const printWindow = window.open('', '_blank');

  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();

    // Aguarda o carregamento completo antes de imprimir
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  }
}

// Função para fazer download do documento como HTML
export function downloadDocument(document: MedicalDocument, patient: Patient): void {
  const html = generateDocumentHTML(document, patient);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = window.document.createElement('a');
  link.href = url;
  link.download = `${DOCUMENT_TYPES[document.type]}_${patient.nome.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
  window.document.body.appendChild(link);
  link.click();
  window.document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

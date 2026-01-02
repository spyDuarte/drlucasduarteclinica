// Gerador de documentos médicos profissionais para impressão
// Seguindo padrões CFM e boas práticas de documentação médica
import type { MedicalDocument, Patient, Prescription } from '../types';
import { CLINIC_INFO, DOCUMENT_TYPES } from '../constants/clinic';
import { formatDate, formatCPF, calculateAge } from './helpers';

interface DocumentData {
  document: MedicalDocument;
  patient: Patient;
}

// Gera número de protocolo único baseado no ID e data
function generateProtocol(documentId: string, createdAt: string): string {
  const date = new Date(createdAt);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const shortId = documentId.slice(-6).toUpperCase();
  return `${year}${month}-${shortId}`;
}

// Gera código de validação para verificação
function generateValidationCode(documentId: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  const seed = documentId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  for (let i = 0; i < 8; i++) {
    code += chars[(seed * (i + 1) * 7) % chars.length];
  }
  return code.match(/.{4}/g)?.join('-') || code;
}

// Formata data por extenso
function formatDateExtended(dateString: string): string {
  const date = new Date(dateString);
  const months = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} de ${month} de ${year}`;
}

// Gera o cabeçalho profissional da clínica
function generateHeader(protocol: string): string {
  return `
    <div class="header">
      <div class="header-content">
        <div class="clinic-logo">
          <div class="logo-placeholder">
            <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="30" cy="30" r="28" stroke="#1a365d" stroke-width="2" fill="#f0f4f8"/>
              <path d="M30 15 L30 45 M15 30 L45 30" stroke="#1a365d" stroke-width="4" stroke-linecap="round"/>
              <circle cx="30" cy="30" r="8" fill="#1a365d"/>
            </svg>
          </div>
        </div>
        <div class="clinic-info">
          <h1>${CLINIC_INFO.nome}</h1>
          <p class="clinic-address">${CLINIC_INFO.endereco}</p>
          <p class="clinic-city">${CLINIC_INFO.cidade} - CEP: ${CLINIC_INFO.cep}</p>
          <p class="clinic-contact">Tel: ${CLINIC_INFO.telefone} | ${CLINIC_INFO.email}</p>
          <p class="clinic-cnpj">CNPJ: ${CLINIC_INFO.cnpj}</p>
        </div>
        <div class="protocol-box">
          <p class="protocol-label">PROTOCOLO</p>
          <p class="protocol-number">${protocol}</p>
        </div>
      </div>
    </div>
    <div class="header-divider"></div>
  `;
}

// Gera o rodapé profissional com assinatura e validação
function generateFooter(document: MedicalDocument, validationCode: string): string {
  const date = document.emitidoAt ? new Date(document.emitidoAt) : new Date();
  const formattedDate = formatDateExtended(date.toISOString());
  const isEmitted = document.status === 'emitido';

  return `
    <div class="footer">
      <div class="footer-location-date">
        <p>${CLINIC_INFO.cidade.split(' - ')[0]}, ${formattedDate}.</p>
      </div>

      <div class="signature-section">
        <div class="signature-block">
          <div class="signature-line"></div>
          <p class="doctor-name">${document.medicoNome || 'Dr. Lucas Duarte'}</p>
          <p class="doctor-crm">CRM: ${document.medicoCRM || '000000/SP'}</p>
          ${document.medicoEspecialidade ? `<p class="doctor-specialty">${document.medicoEspecialidade}</p>` : ''}
        </div>
      </div>

      <div class="footer-validation">
        <div class="validation-info">
          <p class="validation-label">Código de Validação</p>
          <p class="validation-code">${validationCode}</p>
          ${isEmitted ? '<p class="validation-status">Documento emitido eletronicamente</p>' : '<p class="validation-draft">RASCUNHO - Documento não emitido</p>'}
        </div>
        <div class="footer-legal">
          <p>Este documento foi gerado eletronicamente e possui validade legal conforme legislação vigente.</p>
          <p>Em caso de dúvidas, entre em contato: ${CLINIC_INFO.telefone}</p>
        </div>
      </div>
    </div>
  `;
}

// Gera informações detalhadas do paciente
function generatePatientInfo(patient: Patient, showFullAddress: boolean = true): string {
  const age = calculateAge(patient.dataNascimento);
  const birthDate = formatDate(patient.dataNascimento);
  const sexLabel = patient.sexo === 'M' ? 'Masculino' : patient.sexo === 'F' ? 'Feminino' : 'Outro';

  return `
    <div class="patient-info">
      <div class="patient-header">
        <h3>IDENTIFICAÇÃO DO PACIENTE</h3>
      </div>
      <div class="patient-details">
        <div class="patient-row">
          <div class="patient-field full">
            <span class="field-label">Nome Completo:</span>
            <span class="field-value">${patient.nome}</span>
          </div>
        </div>
        <div class="patient-row">
          <div class="patient-field">
            <span class="field-label">CPF:</span>
            <span class="field-value">${formatCPF(patient.cpf)}</span>
          </div>
          <div class="patient-field">
            <span class="field-label">Data de Nascimento:</span>
            <span class="field-value">${birthDate}</span>
          </div>
          <div class="patient-field">
            <span class="field-label">Idade:</span>
            <span class="field-value">${age} anos</span>
          </div>
          <div class="patient-field">
            <span class="field-label">Sexo:</span>
            <span class="field-value">${sexLabel}</span>
          </div>
        </div>
        ${showFullAddress && patient.endereco ? `
        <div class="patient-row">
          <div class="patient-field full">
            <span class="field-label">Endereço:</span>
            <span class="field-value">${patient.endereco.logradouro}, ${patient.endereco.numero}${patient.endereco.complemento ? ` - ${patient.endereco.complemento}` : ''} - ${patient.endereco.bairro}, ${patient.endereco.cidade}/${patient.endereco.estado} - CEP: ${patient.endereco.cep}</span>
          </div>
        </div>
        ` : ''}
        ${patient.convenio ? `
        <div class="patient-row">
          <div class="patient-field">
            <span class="field-label">Convênio:</span>
            <span class="field-value">${patient.convenio.nome}</span>
          </div>
          <div class="patient-field">
            <span class="field-label">Nº Carteira:</span>
            <span class="field-value">${patient.convenio.numero}</span>
          </div>
        </div>
        ` : ''}
      </div>
    </div>
  `;
}

// Gera atestado médico profissional
function generateAtestadoMedico({ document, patient }: DocumentData): string {
  const dataInicio = document.dataInicio ? formatDateExtended(document.dataInicio) : formatDateExtended(new Date().toISOString());
  const dataFim = document.dataFim ? formatDateExtended(document.dataFim) : '';
  const dias = document.diasAfastamento || 1;
  const diasTexto = dias === 1 ? '01 (um) dia' : `${String(dias).padStart(2, '0')} (${numberToWords(dias)}) dias`;

  return `
    <div class="document-title">
      <h2>ATESTADO MÉDICO</h2>
    </div>
    ${generatePatientInfo(patient, false)}
    <div class="document-body">
      <div class="atestado-content">
        <p class="content-text">
          ${document.content || `Atesto, para os devidos fins, que o(a) paciente acima qualificado(a) esteve sob meus cuidados profissionais, necessitando de afastamento de suas atividades laborais e/ou escolares pelo período de <strong>${diasTexto}</strong>, a contar de ${dataInicio}${dataFim ? ` até ${dataFim}` : ''}.`}
        </p>
      </div>
      ${document.exibirCid && document.cid10 && document.cid10.length > 0 ? `
        <div class="cid-section">
          <p><strong>CID-10:</strong> ${document.cid10.join(', ')}</p>
          <p class="cid-note"><em>A identificação do CID foi autorizada pelo paciente.</em></p>
        </div>
      ` : ''}
      <div class="legal-notice">
        <p>Este atestado é válido para fins de justificativa de ausência conforme Art. 6º, alínea "f" da CLT e demais disposições legais aplicáveis.</p>
      </div>
    </div>
  `;
}

// Converte número para texto por extenso (simplificado)
function numberToWords(num: number): string {
  const units = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const tens = ['', 'dez', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const teens = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];

  if (num < 10) return units[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const unit = num % 10;
    return unit === 0 ? tens[ten] : `${tens[ten]} e ${units[unit]}`;
  }
  return String(num);
}

// Gera declaração de comparecimento profissional
function generateDeclaracaoComparecimento({ document, patient }: DocumentData): string {
  const dataAtendimento = document.emitidoAt ? formatDateExtended(document.emitidoAt) : formatDateExtended(new Date().toISOString());

  return `
    <div class="document-title">
      <h2>DECLARAÇÃO DE COMPARECIMENTO</h2>
    </div>
    ${generatePatientInfo(patient, false)}
    <div class="document-body">
      <div class="declaracao-content">
        <p class="content-text">
          ${document.content || `Declaro, para os devidos fins, que o(a) paciente acima qualificado(a) compareceu a esta unidade de saúde no dia ${dataAtendimento}${document.horaChegada ? `, com entrada registrada às <strong>${document.horaChegada}</strong>` : ''}${document.horaSaida ? ` e saída às <strong>${document.horaSaida}</strong>` : ''}, para atendimento médico.`}
        </p>
      </div>
      <div class="legal-notice">
        <p>Esta declaração é emitida a pedido do interessado para fins de comprovação de comparecimento.</p>
      </div>
    </div>
  `;
}

// Gera laudo médico profissional
function generateLaudoMedico({ document, patient }: DocumentData): string {
  return `
    <div class="document-title">
      <h2>LAUDO MÉDICO</h2>
      ${document.finalidade ? `<p class="document-subtitle">Finalidade: ${document.finalidade}</p>` : ''}
    </div>
    ${generatePatientInfo(patient, true)}
    <div class="document-body">
      <div class="laudo-section">
        <h3>HISTÓRICO CLÍNICO E EXAME</h3>
        <div class="laudo-content">
          <p>${document.content || 'Não informado.'}</p>
        </div>
      </div>

      ${document.cid10 && document.cid10.length > 0 ? `
        <div class="laudo-section">
          <h3>DIAGNÓSTICO</h3>
          <div class="cid-list">
            ${document.cid10.map(cid => `<span class="cid-tag">${cid}</span>`).join('')}
          </div>
        </div>
      ` : ''}

      ${document.conclusao ? `
        <div class="laudo-section conclusao">
          <h3>CONCLUSÃO E PARECER</h3>
          <div class="conclusao-content">
            <p>${document.conclusao}</p>
          </div>
        </div>
      ` : ''}

      <div class="legal-notice">
        <p>Este laudo reflete a avaliação médica realizada na data de sua emissão, podendo ser necessária reavaliação em caso de mudança do quadro clínico.</p>
      </div>
    </div>
  `;
}

// Gera receita médica profissional (padrão CFM)
function generateReceita({ document, patient }: DocumentData): string {
  const prescricoes = document.prescricoes || [];
  const controladas = prescricoes.filter((rx: Prescription) => rx.usoControlado);
  const comuns = prescricoes.filter((rx: Prescription) => !rx.usoControlado);
  const hasControlled = controladas.length > 0;

  const renderPrescription = (rx: Prescription, index: number, isControlled: boolean = false) => `
    <div class="prescricao-item ${isControlled ? 'controlled' : ''}">
      <div class="prescricao-numero">${index + 1}</div>
      <div class="prescricao-content">
        <p class="medicamento">
          <strong>${rx.medicamento}</strong>
          ${rx.concentracao ? `<span class="concentracao">${rx.concentracao}</span>` : ''}
          ${isControlled ? '<span class="controlled-badge">CONTROLADO</span>' : ''}
        </p>
        <p class="forma-quantidade">${rx.formaFarmaceutica} - Quantidade: ${rx.quantidade}</p>
        <div class="posologia-box">
          <span class="posologia-label">Posologia:</span>
          <span class="posologia-text">${rx.posologia}</span>
        </div>
        ${rx.viaAdministracao ? `<p class="via">Via de administração: ${rx.viaAdministracao}</p>` : ''}
        ${rx.duracao ? `<p class="duracao">Duração do tratamento: ${rx.duracao}</p>` : ''}
        ${rx.observacoes ? `<p class="observacoes"><em>Obs: ${rx.observacoes}</em></p>` : ''}
      </div>
    </div>
  `;

  return `
    <div class="document-title receita-title">
      <h2>RECEITA ${hasControlled ? 'ESPECIAL' : 'MÉDICA'}</h2>
      ${hasControlled ? '<p class="receita-warning">Contém medicamento(s) sujeito(s) a controle especial</p>' : ''}
    </div>
    ${generatePatientInfo(patient, false)}
    <div class="document-body receita-body">
      ${comuns.length > 0 ? `
        <div class="prescricoes-section">
          <h3>PRESCRIÇÕES</h3>
          <div class="prescricoes-list">
            ${comuns.map((rx: Prescription, idx: number) => renderPrescription(rx, idx)).join('')}
          </div>
        </div>
      ` : ''}

      ${controladas.length > 0 ? `
        <div class="prescricoes-section controlled-section">
          <h3>MEDICAMENTOS CONTROLADOS</h3>
          <p class="controlled-notice">Dispensação sujeita a retenção de receita conforme legislação vigente (Portaria SVS/MS 344/98)</p>
          <div class="prescricoes-list">
            ${controladas.map((rx: Prescription, idx: number) => renderPrescription(rx, idx + comuns.length, true)).join('')}
          </div>
        </div>
      ` : ''}

      ${document.content ? `
        <div class="orientacoes-section">
          <h3>ORIENTAÇÕES GERAIS</h3>
          <p>${document.content}</p>
        </div>
      ` : ''}

      <div class="receita-validity">
        <p><strong>Validade desta receita:</strong> ${hasControlled ? '30 dias' : '60 dias'} a partir da data de emissão.</p>
      </div>
    </div>
  `;
}

// Gera solicitação de exames profissional
function generateSolicitacaoExames({ document, patient }: DocumentData): string {
  const exames = document.examesSolicitados || [];

  return `
    <div class="document-title">
      <h2>SOLICITAÇÃO DE EXAMES</h2>
    </div>
    ${generatePatientInfo(patient, false)}
    <div class="document-body">
      ${document.indicacaoClinica ? `
        <div class="indicacao-section">
          <h3>INDICAÇÃO CLÍNICA / HIPÓTESE DIAGNÓSTICA</h3>
          <p>${document.indicacaoClinica}</p>
        </div>
      ` : ''}

      <div class="exames-section">
        <h3>EXAMES SOLICITADOS</h3>
        ${exames.length > 0 ? `
          <div class="exames-grid">
            ${exames.map((exame, idx) => `
              <div class="exame-item">
                <span class="exame-numero">${idx + 1}</span>
                <span class="exame-nome">${exame}</span>
              </div>
            `).join('')}
          </div>
        ` : '<p class="no-exames">Nenhum exame especificado.</p>'}
      </div>

      ${document.content ? `
        <div class="observacoes-section">
          <h3>OBSERVAÇÕES</h3>
          <p>${document.content}</p>
        </div>
      ` : ''}

      <div class="exames-instructions">
        <h4>Instruções ao Paciente:</h4>
        <ul>
          <li>Apresentar esta solicitação no laboratório ou clínica de imagem de sua preferência</li>
          <li>Verificar preparo necessário para cada exame</li>
          <li>Retornar com os resultados para avaliação médica</li>
        </ul>
      </div>
    </div>
  `;
}

// Gera encaminhamento profissional
function generateEncaminhamento({ document, patient }: DocumentData): string {
  const urgenciaLabels = {
    eletivo: { label: 'Eletivo', class: 'eletivo' },
    urgente: { label: 'Urgente', class: 'urgente' },
    emergencia: { label: 'Emergência', class: 'emergencia' }
  };
  const urgencia = document.urgencia ? urgenciaLabels[document.urgencia] : urgenciaLabels.eletivo;

  return `
    <div class="document-title">
      <h2>GUIA DE ENCAMINHAMENTO</h2>
    </div>
    ${generatePatientInfo(patient, true)}
    <div class="document-body">
      <div class="encaminhamento-header">
        <div class="especialidade-box">
          <span class="label">ENCAMINHAMENTO PARA:</span>
          <span class="value">${document.especialidade || 'Especialidade não especificada'}</span>
        </div>
        <div class="urgencia-box ${urgencia.class}">
          <span class="label">CARÁTER:</span>
          <span class="value">${urgencia.label}</span>
        </div>
      </div>

      ${document.cid10 && document.cid10.length > 0 ? `
        <div class="diagnostico-section">
          <h3>HIPÓTESE DIAGNÓSTICA (CID-10)</h3>
          <div class="cid-list">
            ${document.cid10.map(cid => `<span class="cid-tag">${cid}</span>`).join('')}
          </div>
        </div>
      ` : ''}

      <div class="motivo-section">
        <h3>MOTIVO DO ENCAMINHAMENTO</h3>
        <div class="motivo-content">
          <p>${document.motivoEncaminhamento || document.content || 'Não especificado.'}</p>
        </div>
      </div>

      <div class="encaminhamento-footer">
        <p>Solicito avaliação e conduta por especialista. Agradeço o retorno de informações sobre o caso.</p>
      </div>
    </div>
  `;
}

// Estilos CSS profissionais para impressão
function getDocumentStyles(isEmitted: boolean): string {
  return `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

      @page {
        size: A4;
        margin: 15mm;
      }

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 11pt;
        line-height: 1.6;
        color: #1a202c;
        background: #fff;
        position: relative;
      }

      ${isEmitted ? '' : `
        body::before {
          content: 'RASCUNHO';
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 100px;
          font-weight: bold;
          color: rgba(220, 38, 38, 0.08);
          pointer-events: none;
          z-index: 1000;
        }
      `}

      .document-container {
        max-width: 210mm;
        margin: 0 auto;
        padding: 10mm;
        min-height: 297mm;
        position: relative;
      }

      /* Header Styles */
      .header {
        margin-bottom: 20px;
      }

      .header-content {
        display: flex;
        align-items: flex-start;
        gap: 20px;
      }

      .clinic-logo {
        flex-shrink: 0;
      }

      .logo-placeholder {
        width: 60px;
        height: 60px;
      }

      .logo-placeholder svg {
        width: 100%;
        height: 100%;
      }

      .clinic-info {
        flex: 1;
      }

      .clinic-info h1 {
        font-size: 18pt;
        font-weight: 700;
        color: #1a365d;
        margin-bottom: 4px;
        letter-spacing: -0.5px;
      }

      .clinic-info p {
        font-size: 9pt;
        color: #4a5568;
        margin: 1px 0;
      }

      .clinic-cnpj {
        font-size: 8pt !important;
        color: #718096 !important;
      }

      .protocol-box {
        flex-shrink: 0;
        text-align: right;
        padding: 10px 15px;
        background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
        border-radius: 8px;
        border: 1px solid #e2e8f0;
      }

      .protocol-label {
        font-size: 8pt;
        color: #718096;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .protocol-number {
        font-size: 12pt;
        font-weight: 700;
        color: #1a365d;
        font-family: 'Courier New', monospace;
      }

      .header-divider {
        height: 3px;
        background: linear-gradient(90deg, #1a365d 0%, #2b6cb0 50%, #1a365d 100%);
        margin: 15px 0 20px 0;
        border-radius: 2px;
      }

      /* Document Title */
      .document-title {
        text-align: center;
        margin: 25px 0;
        padding: 15px;
        background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
        border-radius: 8px;
      }

      .document-title h2 {
        font-size: 16pt;
        font-weight: 700;
        color: #fff;
        text-transform: uppercase;
        letter-spacing: 3px;
        margin: 0;
      }

      .document-title.receita-title {
        background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
      }

      .document-subtitle {
        font-size: 10pt;
        color: rgba(255,255,255,0.85);
        margin-top: 5px;
      }

      .receita-warning {
        font-size: 9pt;
        color: #fbd38d;
        margin-top: 5px;
        font-weight: 500;
      }

      /* Patient Info */
      .patient-info {
        margin: 20px 0;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        overflow: hidden;
      }

      .patient-header {
        background: #f7fafc;
        padding: 8px 15px;
        border-bottom: 1px solid #e2e8f0;
      }

      .patient-header h3 {
        font-size: 9pt;
        font-weight: 600;
        color: #4a5568;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin: 0;
      }

      .patient-details {
        padding: 12px 15px;
      }

      .patient-row {
        display: flex;
        gap: 20px;
        margin-bottom: 8px;
        flex-wrap: wrap;
      }

      .patient-row:last-child {
        margin-bottom: 0;
      }

      .patient-field {
        display: flex;
        gap: 5px;
        align-items: baseline;
      }

      .patient-field.full {
        flex: 1;
        min-width: 100%;
      }

      .field-label {
        font-size: 9pt;
        color: #718096;
        font-weight: 500;
        white-space: nowrap;
      }

      .field-value {
        font-size: 10pt;
        color: #1a202c;
        font-weight: 500;
      }

      /* Document Body */
      .document-body {
        margin: 25px 0;
      }

      .content-text {
        font-size: 11pt;
        line-height: 1.9;
        text-align: justify;
        text-indent: 40px;
        margin-bottom: 15px;
      }

      /* Sections */
      .laudo-section,
      .indicacao-section,
      .exames-section,
      .motivo-section,
      .orientacoes-section,
      .observacoes-section,
      .diagnostico-section {
        margin: 20px 0;
        padding: 15px;
        background: #f7fafc;
        border-radius: 8px;
        border-left: 4px solid #2b6cb0;
      }

      .laudo-section h3,
      .indicacao-section h3,
      .exames-section h3,
      .motivo-section h3,
      .orientacoes-section h3,
      .observacoes-section h3,
      .diagnostico-section h3 {
        font-size: 10pt;
        font-weight: 600;
        color: #2c5282;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 10px;
      }

      .conclusao {
        background: linear-gradient(135deg, #ebf8ff 0%, #e6fffa 100%);
        border-left-color: #319795;
      }

      .conclusao h3 {
        color: #285e61;
      }

      /* CID Tags */
      .cid-section {
        margin: 20px 0;
        padding: 15px;
        background: #fffbeb;
        border-radius: 8px;
        border-left: 4px solid #d69e2e;
      }

      .cid-note {
        font-size: 9pt;
        color: #744210;
        margin-top: 8px;
      }

      .cid-list {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .cid-tag {
        display: inline-block;
        padding: 4px 12px;
        background: #2b6cb0;
        color: #fff;
        font-size: 10pt;
        font-weight: 600;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
      }

      /* Legal Notice */
      .legal-notice {
        margin: 25px 0;
        padding: 12px 15px;
        background: #f0fff4;
        border-radius: 6px;
        border: 1px solid #9ae6b4;
      }

      .legal-notice p {
        font-size: 9pt;
        color: #276749;
        font-style: italic;
        margin: 0;
      }

      /* Prescriptions */
      .prescricoes-section {
        margin: 20px 0;
      }

      .prescricoes-section h3 {
        font-size: 11pt;
        font-weight: 600;
        color: #2c5282;
        margin-bottom: 15px;
        padding-bottom: 8px;
        border-bottom: 2px solid #e2e8f0;
      }

      .controlled-section {
        background: #fff5f5;
        padding: 15px;
        border-radius: 8px;
        border: 2px solid #fc8181;
      }

      .controlled-section h3 {
        color: #c53030;
      }

      .controlled-notice {
        font-size: 9pt;
        color: #c53030;
        margin-bottom: 15px;
        font-weight: 500;
      }

      .prescricao-item {
        display: flex;
        gap: 15px;
        margin: 12px 0;
        padding: 15px;
        background: #fff;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      }

      .prescricao-item.controlled {
        border-color: #fc8181;
        border-width: 2px;
      }

      .prescricao-numero {
        width: 28px;
        height: 28px;
        background: #2b6cb0;
        color: #fff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 12pt;
        flex-shrink: 0;
      }

      .prescricao-item.controlled .prescricao-numero {
        background: #c53030;
      }

      .prescricao-content {
        flex: 1;
      }

      .medicamento {
        font-size: 11pt;
        margin-bottom: 5px;
      }

      .concentracao {
        color: #4a5568;
        font-weight: 500;
        margin-left: 5px;
      }

      .controlled-badge {
        display: inline-block;
        padding: 2px 8px;
        background: #c53030;
        color: #fff;
        font-size: 8pt;
        font-weight: 600;
        border-radius: 3px;
        margin-left: 10px;
        text-transform: uppercase;
      }

      .forma-quantidade {
        font-size: 10pt;
        color: #4a5568;
        margin-bottom: 8px;
      }

      .posologia-box {
        padding: 8px 12px;
        background: #edf2f7;
        border-radius: 4px;
        margin: 8px 0;
      }

      .posologia-label {
        font-size: 9pt;
        color: #718096;
        font-weight: 600;
      }

      .posologia-text {
        font-size: 10pt;
        color: #2d3748;
        font-weight: 500;
      }

      .via, .duracao {
        font-size: 9pt;
        color: #4a5568;
        margin: 3px 0;
      }

      .observacoes {
        font-size: 9pt;
        color: #718096;
        margin-top: 5px;
      }

      .receita-validity {
        margin-top: 20px;
        padding: 10px 15px;
        background: #fef3c7;
        border-radius: 6px;
        text-align: center;
      }

      .receita-validity p {
        font-size: 10pt;
        color: #92400e;
        margin: 0;
      }

      /* Exams Grid */
      .exames-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }

      .exame-item {
        display: flex;
        gap: 10px;
        align-items: center;
        padding: 10px;
        background: #fff;
        border-radius: 6px;
        border: 1px solid #e2e8f0;
      }

      .exame-numero {
        width: 24px;
        height: 24px;
        background: #2b6cb0;
        color: #fff;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10pt;
        font-weight: 600;
        flex-shrink: 0;
      }

      .exame-nome {
        font-size: 10pt;
        color: #2d3748;
      }

      .exames-instructions {
        margin-top: 20px;
        padding: 15px;
        background: #ebf8ff;
        border-radius: 8px;
      }

      .exames-instructions h4 {
        font-size: 10pt;
        color: #2c5282;
        margin-bottom: 10px;
      }

      .exames-instructions ul {
        margin-left: 20px;
      }

      .exames-instructions li {
        font-size: 9pt;
        color: #4a5568;
        margin: 5px 0;
      }

      /* Encaminhamento */
      .encaminhamento-header {
        display: flex;
        gap: 20px;
        margin: 20px 0;
      }

      .especialidade-box {
        flex: 1;
        padding: 15px;
        background: #ebf8ff;
        border-radius: 8px;
        border: 2px solid #3182ce;
      }

      .especialidade-box .label {
        display: block;
        font-size: 9pt;
        color: #2c5282;
        font-weight: 600;
        margin-bottom: 5px;
      }

      .especialidade-box .value {
        font-size: 14pt;
        font-weight: 700;
        color: #1a365d;
      }

      .urgencia-box {
        width: 120px;
        padding: 15px;
        border-radius: 8px;
        text-align: center;
      }

      .urgencia-box.eletivo {
        background: #f0fff4;
        border: 2px solid #48bb78;
      }

      .urgencia-box.urgente {
        background: #fffbeb;
        border: 2px solid #ed8936;
      }

      .urgencia-box.emergencia {
        background: #fff5f5;
        border: 2px solid #e53e3e;
      }

      .urgencia-box .label {
        display: block;
        font-size: 8pt;
        font-weight: 600;
        text-transform: uppercase;
      }

      .urgencia-box .value {
        font-size: 12pt;
        font-weight: 700;
      }

      .urgencia-box.eletivo .label,
      .urgencia-box.eletivo .value { color: #276749; }

      .urgencia-box.urgente .label,
      .urgencia-box.urgente .value { color: #c05621; }

      .urgencia-box.emergencia .label,
      .urgencia-box.emergencia .value { color: #c53030; }

      .encaminhamento-footer {
        margin-top: 20px;
        padding: 12px 15px;
        background: #f7fafc;
        border-radius: 6px;
        text-align: center;
      }

      .encaminhamento-footer p {
        font-size: 10pt;
        color: #4a5568;
        font-style: italic;
        margin: 0;
      }

      /* Footer */
      .footer {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid #e2e8f0;
      }

      .footer-location-date {
        text-align: right;
        margin-bottom: 40px;
      }

      .footer-location-date p {
        font-size: 11pt;
        color: #2d3748;
      }

      .signature-section {
        display: flex;
        justify-content: center;
        margin: 30px 0;
      }

      .signature-block {
        text-align: center;
        min-width: 280px;
      }

      .signature-line {
        width: 100%;
        height: 1px;
        background: #1a202c;
        margin-bottom: 10px;
      }

      .doctor-name {
        font-size: 12pt;
        font-weight: 700;
        color: #1a202c;
        margin-bottom: 2px;
      }

      .doctor-crm {
        font-size: 10pt;
        color: #4a5568;
        font-weight: 500;
      }

      .doctor-specialty {
        font-size: 9pt;
        color: #718096;
        margin-top: 2px;
      }

      .footer-validation {
        margin-top: 30px;
        padding: 15px;
        background: #f7fafc;
        border-radius: 8px;
        display: flex;
        gap: 20px;
        align-items: flex-start;
      }

      .validation-info {
        flex-shrink: 0;
        text-align: center;
        padding: 10px 15px;
        background: #fff;
        border-radius: 6px;
        border: 1px solid #e2e8f0;
      }

      .validation-label {
        font-size: 8pt;
        color: #718096;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 4px;
      }

      .validation-code {
        font-size: 14pt;
        font-weight: 700;
        color: #1a365d;
        font-family: 'Courier New', monospace;
        letter-spacing: 2px;
      }

      .validation-status {
        font-size: 8pt;
        color: #276749;
        margin-top: 4px;
      }

      .validation-draft {
        font-size: 8pt;
        color: #c53030;
        font-weight: 600;
        margin-top: 4px;
      }

      .footer-legal {
        flex: 1;
      }

      .footer-legal p {
        font-size: 8pt;
        color: #718096;
        margin: 3px 0;
      }

      /* Print Styles */
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

        .patient-info,
        .prescricao-item,
        .exame-item,
        .footer-validation {
          break-inside: avoid;
        }
      }
    </style>
  `;
}

// Função principal para gerar documento HTML completo
export function generateDocumentHTML(document: MedicalDocument, patient: Patient): string {
  const documentData: DocumentData = { document, patient };
  const protocol = generateProtocol(document.id, document.createdAt);
  const validationCode = generateValidationCode(document.id);
  const isEmitted = document.status === 'emitido';

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
      documentContent = `<div class="document-body"><p class="content-text">${document.content}</p></div>`;
  }

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${DOCUMENT_TYPES[document.type]} - ${patient.nome} - Protocolo ${protocol}</title>
      ${getDocumentStyles(isEmitted)}
    </head>
    <body>
      <div class="document-container">
        ${generateHeader(protocol)}
        ${documentContent}
        ${generateFooter(document, validationCode)}
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
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  }
}

// Função para fazer download do documento como HTML
export function downloadDocument(document: MedicalDocument, patient: Patient): void {
  const html = generateDocumentHTML(document, patient);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const protocol = generateProtocol(document.id, document.createdAt);

  const link = window.document.createElement('a');
  link.href = url;
  link.download = `${DOCUMENT_TYPES[document.type]}_${protocol}_${patient.nome.replace(/\s+/g, '_')}.html`;
  window.document.body.appendChild(link);
  link.click();
  window.document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Exporta funções utilitárias para uso externo
export { generateProtocol, generateValidationCode };

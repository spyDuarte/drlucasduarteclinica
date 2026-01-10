// Gerador de documentos médicos profissionais para impressão
// Seguindo padrões CFM e boas práticas de documentação médica
import type { MedicalDocument, Patient, Prescription } from '../types';
import { CLINIC_INFO, DOCUMENT_TYPES } from '../constants/clinic';
import { formatDate, formatCPF, calculateAge, escapeHtml } from './helpers';

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

// Gera o cabeçalho profissional da clínica (Layout Centralizado Premium)
function generateHeader(protocol: string): string {
  return `
    <header class="doc-header">
      <div class="logo-container">
        <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="clinic-logo-svg">
          <circle cx="30" cy="30" r="28" stroke="#0f172a" stroke-width="1.5" fill="none"/>
          <path d="M30 15 L30 45 M15 30 L45 30" stroke="#0f172a" stroke-width="3" stroke-linecap="square"/>
        </svg>
      </div>
      <div class="clinic-details">
        <h1>${escapeHtml(CLINIC_INFO.nome)}</h1>
        <div class="divider-small"></div>
        <p class="address">${escapeHtml(CLINIC_INFO.endereco)} • ${escapeHtml(CLINIC_INFO.cidade)} • CEP ${escapeHtml(CLINIC_INFO.cep)}</p>
        <p class="contact">Tel: ${escapeHtml(CLINIC_INFO.telefone)} • ${escapeHtml(CLINIC_INFO.email)}</p>
        <p class="meta">CNPJ: ${escapeHtml(CLINIC_INFO.cnpj)} • <span class="protocol-tag">Protocolo: ${escapeHtml(protocol)}</span></p>
      </div>
    </header>
  `;
}

// Gera o rodapé profissional com assinatura e validação
function generateFooter(document: MedicalDocument, validationCode: string): string {
  const date = document.emitidoAt ? new Date(document.emitidoAt) : new Date();
  const formattedDate = formatDateExtended(date.toISOString());
  const isEmitted = document.status === 'emitido';

  return `
    <footer class="doc-footer">
      <div class="date-location">
        <p>${escapeHtml(CLINIC_INFO.cidade.split(' - ')[0])}, ${escapeHtml(formattedDate)}.</p>
      </div>

      <div class="signature-block">
        <div class="signature-line"></div>
        <p class="doctor-name">${escapeHtml(document.medicoNome || 'Dr. Lucas Duarte')}</p>
        <p class="doctor-crm">CRM/SP ${escapeHtml(document.medicoCRM || '123.456')}</p>
        ${document.medicoEspecialidade ? `<p class="doctor-specialty">${escapeHtml(document.medicoEspecialidade)}</p>` : ''}
      </div>

      <div class="validation-strip">
        <div class="validation-content">
          <div class="qr-placeholder"></div>
          <div class="validation-text">
            <p><strong>Autenticidade:</strong> Este documento possui assinatura digital.</p>
            <p>Verifique em: <strong>drlucasduarte.com.br/validar</strong> com o código:</p>
            <p class="validation-code">${escapeHtml(validationCode)}</p>
          </div>
        </div>
        ${!isEmitted ? '<div class="draft-watermark-footer">DOCUMENTO NÃO EMITIDO (RASCUNHO)</div>' : ''}
      </div>
    </footer>
  `;
}

// Gera informações detalhadas do paciente (Layout Limpo)
function generatePatientInfo(patient: Patient, showFullAddress: boolean = true): string {
  const age = calculateAge(patient.dataNascimento);

  return `
    <div class="patient-section">
      <div class="section-label">PACIENTE</div>
      <div class="patient-grid">
        <div class="field-group full-width">
          <span class="label">Nome Completo</span>
          <span class="value strong">${escapeHtml(patient.nome)}</span>
        </div>
        <div class="field-group">
          <span class="label">CPF</span>
          <span class="value">${escapeHtml(formatCPF(patient.cpf))}</span>
        </div>
        <div class="field-group">
          <span class="label">Idade</span>
          <span class="value">${age} anos (${escapeHtml(formatDate(patient.dataNascimento))})</span>
        </div>
        ${showFullAddress && patient.endereco ? `
        <div class="field-group full-width">
          <span class="label">Endereço</span>
          <span class="value">${escapeHtml(patient.endereco.logradouro)}, ${escapeHtml(patient.endereco.numero)} - ${escapeHtml(patient.endereco.bairro)}</span>
        </div>
        ` : ''}
      </div>
    </div>
  `;
}

// --- Geradores Específicos ---

function generateAtestadoMedico({ document, patient }: DocumentData): string {
  const dataInicio = document.dataInicio ? formatDateExtended(document.dataInicio) : formatDateExtended(new Date().toISOString());
  const dataFim = document.dataFim ? formatDateExtended(document.dataFim) : '';
  const dias = document.diasAfastamento || 1;
  const diasTexto = `${dias} (${dias === 1 ? 'um' : 'dias'}) dia${dias > 1 ? 's' : ''}`;

  return `
    <main class="doc-body">
      <h2 class="doc-title">ATESTADO MÉDICO</h2>
      ${generatePatientInfo(patient, false)}
      <div class="content-block">
        <p class="text-justify">
          Atesto para os devidos fins que o(a) paciente acima identificado(a) esteve sob meus cuidados profissionais nesta data,
          necessitando de afastamento de suas atividades laborais e/ou escolares por um período de
          <strong>${escapeHtml(diasTexto)}</strong>${dataInicio ? `, a partir de ${escapeHtml(dataInicio)}` : ''}${dataFim ? ` até ${escapeHtml(dataFim)}` : ''}.
        </p>
        ${document.content ? `<p class="text-justify additional-note">${escapeHtml(document.content)}</p>` : ''}
      </div>
      ${document.exibirCid && document.cid10 && document.cid10.length > 0 ? `
        <div class="cid-box">
          <span class="cid-label">CID-10:</span>
          <span class="cid-value">${document.cid10.map(escapeHtml).join(', ')}</span>
          <p class="cid-consent">(Autorizado pelo paciente)</p>
        </div>
      ` : ''}
    </main>
  `;
}

function generateReceita({ document, patient }: DocumentData): string {
  const prescricoes = document.prescricoes || [];
  const controladas = prescricoes.filter((rx: Prescription) => rx.usoControlado);
  const comuns = prescricoes.filter((rx: Prescription) => !rx.usoControlado);

  const renderItem = (rx: Prescription, idx: number) => `
    <div class="rx-item">
      <div class="rx-index">${idx + 1}</div>
      <div class="rx-details">
        <div class="rx-name-row">
          <span class="rx-name">${escapeHtml(rx.medicamento)}</span>
          <span class="rx-concentration">${escapeHtml(rx.concentracao || '')}</span>
          <span class="rx-form">${escapeHtml(rx.formaFarmaceutica)}</span>
        </div>
        <div class="rx-instruction">
          <span class="rx-label">Uso:</span> ${escapeHtml(rx.posologia)}
        </div>
        <div class="rx-meta">
          ${rx.quantidade ? `<span>Qtd: <strong>${escapeHtml(rx.quantidade)}</strong></span>` : ''}
          ${rx.viaAdministracao ? `<span>Via: ${escapeHtml(rx.viaAdministracao)}</span>` : ''}
          ${rx.duracao ? `<span>Duração: ${escapeHtml(rx.duracao)}</span>` : ''}
        </div>
        ${rx.observacoes ? `<div class="rx-obs">Obs: ${escapeHtml(rx.observacoes)}</div>` : ''}
      </div>
    </div>
  `;

  return `
    <main class="doc-body">
      <h2 class="doc-title">RECEITA MÉDICA</h2>
      ${generatePatientInfo(patient, false)}
      <div class="prescriptions-container">
        ${controladas.length > 0 ? `
          <div class="rx-group controlled">
            <h3>MEDICAMENTOS DE CONTROLE ESPECIAL</h3>
            ${controladas.map((rx, i) => renderItem(rx, i)).join('')}
          </div>
        ` : ''}
        ${comuns.length > 0 ? `
          <div class="rx-group">
            <h3>USO GERAL</h3>
            ${comuns.map((rx, i) => renderItem(rx, i + controladas.length)).join('')}
          </div>
        ` : ''}
      </div>
      <div class="validity-box">
        Válido por 30 dias a partir da emissão.
      </div>
    </main>
  `;
}

function generateSolicitacaoExames({ document, patient }: DocumentData): string {
  const exames = document.examesSolicitados || [];
  return `
    <main class="doc-body">
      <h2 class="doc-title">SOLICITAÇÃO DE EXAMES</h2>
      ${generatePatientInfo(patient, false)}
      ${document.indicacaoClinica ? `
        <div class="clinical-indication">
          <h4>Indicação Clínica:</h4>
          <p>${escapeHtml(document.indicacaoClinica)}</p>
        </div>
      ` : ''}
      <div class="exams-list-container">
        <ul class="exams-list">
          ${exames.map(ex => `<li>${escapeHtml(ex)}</li>`).join('')}
        </ul>
      </div>
    </main>
  `;
}

function generateEncaminhamento({ document, patient }: DocumentData): string {
  return `
    <main class="doc-body">
      <h2 class="doc-title">ENCAMINHAMENTO MÉDICO</h2>
      ${generatePatientInfo(patient, true)}
      <div class="referral-box">
        <div class="referral-to">
          <span class="label">Para Especialidade:</span>
          <span class="value">${escapeHtml(document.especialidade || 'A quem interessar')}</span>
        </div>
        <div class="referral-urgency ${document.urgencia === 'urgente' ? 'urgente' : ''}">
          Caráter: ${document.urgencia ? document.urgencia.toUpperCase() : 'ELETIVO'}
        </div>
      </div>
      <div class="content-block">
        <h4>Motivo do Encaminhamento:</h4>
        <p class="text-justify">${escapeHtml(document.motivoEncaminhamento || document.content || '')}</p>
      </div>
      ${document.cid10 && document.cid10.length > 0 ? `
         <div class="content-block">
            <h4>Hipótese Diagnóstica (CID-10):</h4>
            <p>${document.cid10.map(escapeHtml).join(', ')}</p>
         </div>
      ` : ''}
    </main>
  `;
}

function generateDeclaracaoComparecimento({ document, patient }: DocumentData): string {
  const dataAtendimento = document.emitidoAt ? formatDateExtended(document.emitidoAt) : formatDateExtended(new Date().toISOString());
  return `
    <main class="doc-body">
      <h2 class="doc-title">DECLARAÇÃO DE COMPARECIMENTO</h2>
      ${generatePatientInfo(patient, false)}
      <div class="content-block">
        <p class="text-justify">
          Declaro para os devidos fins que o(a) paciente acima identificado(a) compareceu a esta unidade de saúde
          no dia <strong>${escapeHtml(dataAtendimento)}</strong>${document.horaChegada ? `, das ${escapeHtml(document.horaChegada)}` : ''}${document.horaSaida ? ` às ${escapeHtml(document.horaSaida)}` : ''},
          para atendimento médico.
        </p>
      </div>
    </main>
  `;
}

function generateDeclaracaoAcompanhante({ document, patient }: DocumentData): string {
  return `
    <main class="doc-body">
      <h2 class="doc-title">DECLARAÇÃO DE ACOMPANHANTE</h2>
      ${generatePatientInfo(patient, false)}
      <div class="content-block">
        <p class="text-justify">
          Declaro para os devidos fins que o(a) Sr(a). <strong>${escapeHtml(document.nomeAcompanhante || '_______________________')}</strong>,
          ${document.cpfAcompanhante ? `portador(a) do CPF nº ${escapeHtml(document.cpfAcompanhante)},` : ''}
          esteve presente nesta unidade acompanhando o(a) paciente durante seu atendimento médico
          ${document.horaChegadaAcompanhante ? `no dia de hoje, das ${escapeHtml(document.horaChegadaAcompanhante)}` : 'nesta data'}
          ${document.horaSaidaAcompanhante ? ` às ${escapeHtml(document.horaSaidaAcompanhante)}` : ''}.
        </p>
      </div>
    </main>
  `;
}

function generateLaudoMedico({ document, patient }: DocumentData): string {
  return `
    <main class="doc-body">
      <h2 class="doc-title">LAUDO MÉDICO</h2>
      ${document.finalidade ? `<p class="subtitle" style="text-align:center;color:#666;margin-bottom:20px">Finalidade: ${escapeHtml(document.finalidade)}</p>` : ''}
      ${generatePatientInfo(patient, true)}
      <div class="content-block">
        <h4>Histórico e Exame Clínico</h4>
        <p class="text-justify">${escapeHtml(document.content || 'Não informado.')}</p>
      </div>
      ${document.cid10 && document.cid10.length > 0 ? `
        <div class="content-block">
          <h4>Diagnóstico (CID-10)</h4>
          <p><strong>${document.cid10.map(escapeHtml).join(', ')}</strong></p>
        </div>
      ` : ''}
      ${document.conclusao ? `
        <div class="content-block">
          <h4>Conclusão e Parecer</h4>
          <p class="text-justify">${escapeHtml(document.conclusao)}</p>
        </div>
      ` : ''}
    </main>
  `;
}

function generateGuiaInternacao({ document, patient }: DocumentData): string {
  return `
    <main class="doc-body">
      <h2 class="doc-title">GUIA DE INTERNAÇÃO</h2>
      ${generatePatientInfo(patient, true)}
      <div class="grid-2">
        <div class="box-item">
          <span class="box-label">Hospital de Destino</span>
          <span class="box-value">${escapeHtml(document.hospitalDestino || 'A definir')}</span>
        </div>
        <div class="box-item">
          <span class="box-label">Caráter da Internação</span>
          <span class="box-value">${document.tipoInternacao === 'urgencia' ? 'URGÊNCIA' : document.tipoInternacao === 'emergencia' ? 'EMERGÊNCIA' : 'ELETIVA'}</span>
        </div>
      </div>
      <div class="grid-2">
        <div class="box-item">
          <span class="box-label">Leito Solicitado</span>
          <span class="box-value">${document.leitoSolicitado ? document.leitoSolicitado.toUpperCase() : 'ENFERMARIA'}</span>
        </div>
        <div class="box-item">
          <span class="box-label">Previsão de Permanência</span>
          <span class="box-value">${escapeHtml(document.previsaoPermanencia || 'A critério médico')}</span>
        </div>
      </div>
      ${document.cid10 && document.cid10.length > 0 ? `
        <div class="content-block">
          <h4>Hipótese Diagnóstica (CID-10)</h4>
          <p>${document.cid10.map(escapeHtml).join(', ')}</p>
        </div>
      ` : ''}
      <div class="content-block">
        <h4>Justificativa Clínica</h4>
        <p class="text-justify">${escapeHtml(document.justificativaInternacao || document.content || '')}</p>
      </div>
      ${document.procedimentoProposto ? `
        <div class="content-block">
          <h4>Procedimento Proposto</h4>
          <p>${escapeHtml(document.procedimentoProposto)}</p>
        </div>
      ` : ''}
    </main>
  `;
}

function generateAtestadoAptidao({ document, patient }: DocumentData): string {
  const parecerMap: Record<string, string> = {
    apto: 'APTO',
    apto_com_restricoes: 'APTO COM RESTRIÇÕES',
    inapto_temporario: 'INAPTO TEMPORARIAMENTE',
    inapto: 'INAPTO'
  };
  const parecer = document.parecer ? parecerMap[document.parecer] || 'APTO' : 'APTO';

  return `
    <main class="doc-body">
      <h2 class="doc-title">ATESTADO DE APTIDÃO</h2>
      ${generatePatientInfo(patient, true)}
      <div class="content-block" style="text-align:center;margin:30px 0;">
        <div style="background:${parecer.includes('INAPTO') ? '#fee2e2' : '#dcfce7'};padding:20px;border-radius:8px;display:inline-block;border:2px solid ${parecer.includes('INAPTO') ? '#ef4444' : '#22c55e'}">
          <span style="display:block;font-size:10pt;color:#555;margin-bottom:5px">PARECER MÉDICO</span>
          <span style="font-size:24pt;font-weight:800;color:#0f172a">${parecer}</span>
        </div>
      </div>
      <div class="content-block">
        <h4>Finalidade / Atividade</h4>
        <p class="text-justify">
          ${document.tipoAptidao ? document.tipoAptidao.replace(/_/g, ' ').toUpperCase() : 'ATIVIDADE FÍSICA'}
          ${document.modalidadeEsportiva ? ` - ${escapeHtml(document.modalidadeEsportiva)}` : ''}
        </p>
      </div>
      ${document.restricoesAtividade && document.restricoesAtividade.length > 0 ? `
        <div class="content-block">
          <h4>Restrições</h4>
          <ul>${document.restricoesAtividade.map(r => `<li>${escapeHtml(r)}</li>`).join('')}</ul>
        </div>
      ` : ''}
    </main>
  `;
}

function generateRelatorioMedico({ document, patient }: DocumentData): string {
  return `
    <main class="doc-body">
      <h2 class="doc-title">RELATÓRIO MÉDICO</h2>
      ${document.destinatario ? `<p class="subtitle" style="margin-bottom:20px">Ao Sr(a).: ${escapeHtml(document.destinatario)}</p>` : ''}
      ${generatePatientInfo(patient, true)}
      ${document.evolucaoClinica ? `
        <div class="content-block">
          <h4>Evolução Clínica</h4>
          <p class="text-justify">${escapeHtml(document.evolucaoClinica)}</p>
        </div>
      ` : ''}
      ${document.tratamentoAtual ? `
        <div class="content-block">
          <h4>Tratamento Atual</h4>
          <p class="text-justify">${escapeHtml(document.tratamentoAtual)}</p>
        </div>
      ` : ''}
      ${document.prognostico ? `
        <div class="content-block">
          <h4>Prognóstico</h4>
          <p class="text-justify">${escapeHtml(document.prognostico)}</p>
        </div>
      ` : ''}
      ${document.content ? `
        <div class="content-block">
          <h4>Observações</h4>
          <p class="text-justify">${escapeHtml(document.content)}</p>
        </div>
      ` : ''}
    </main>
  `;
}

function generateOrientacoesMedicas({ document, patient }: DocumentData): string {
  return `
    <main class="doc-body">
      <h2 class="doc-title">ORIENTAÇÕES MÉDICAS</h2>
      ${generatePatientInfo(patient, false)}
      ${document.orientacoesEspecificas && document.orientacoesEspecificas.length > 0 ? `
        <div class="content-block">
          <h4>Orientações Gerais</h4>
          <ol>${document.orientacoesEspecificas.map(o => `<li>${escapeHtml(o)}</li>`).join('')}</ol>
        </div>
      ` : ''}
      ${document.content ? `
        <div class="content-block">
          <p class="text-justify">${escapeHtml(document.content)}</p>
        </div>
      ` : ''}
      ${document.sinaisAlerta && document.sinaisAlerta.length > 0 ? `
        <div class="content-block highlight-box" style="background:#fff1f2;border:1px solid #fda4af;">
          <h4 style="color:#be123c;border-color:#fda4af">Sinais de Alerta</h4>
          <ul style="color:#be123c">${document.sinaisAlerta.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ul>
        </div>
      ` : ''}
    </main>
  `;
}

function generateTermoConsentimento({ document, patient }: DocumentData): string {
  return `
    <main class="doc-body">
      <h2 class="doc-title">TERMO DE CONSENTIMENTO</h2>
      ${generatePatientInfo(patient, true)}
      <div class="content-block">
        <h4>Procedimento Proposto</h4>
        <p><strong>${escapeHtml(document.nomeProcedimento || 'Não especificado')}</strong></p>
        <p class="text-justify">${escapeHtml(document.descricaoProcedimento || '')}</p>
      </div>
      ${document.riscosProcedimento && document.riscosProcedimento.length > 0 ? `
        <div class="content-block">
          <h4>Riscos</h4>
          <ul>${document.riscosProcedimento.map(r => `<li>${escapeHtml(r)}</li>`).join('')}</ul>
        </div>
      ` : ''}
      <div class="content-block highlight-box" style="margin-top:30px;background:#f8fafc;border:1px solid #cbd5e1">
        <p class="text-justify">
          Declaro que fui devidamente informado(a) sobre o procedimento, seus riscos, benefícios e alternativas,
          tendo a oportunidade de esclarecer todas as minhas dúvidas. Autorizo a realização do procedimento.
        </p>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:50px;gap:30px">
        <div style="flex:1;text-align:center;border-top:1px solid #000;padding-top:10px">
          <p style="font-size:10pt">Assinatura do Paciente/Responsável</p>
        </div>
        <div style="flex:1;text-align:center;border-top:1px solid #000;padding-top:10px">
          <p style="font-size:10pt">Assinatura do Médico</p>
        </div>
      </div>
    </main>
  `;
}

function generateGenericDocument({ document, patient, title }: DocumentData & { title: string }): string {
  return `
    <main class="doc-body">
      <h2 class="doc-title">${escapeHtml(title)}</h2>
      ${generatePatientInfo(patient, true)}
      <div class="content-block">
        <p class="text-justify">${escapeHtml(document.content || '')}</p>
      </div>
    </main>
  `;
}

// Stylesheet Professional
function getDocumentStyles(isEmitted: boolean): string {
  return `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');

      @page { margin: 20mm; size: A4; }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        font-family: 'Lato', sans-serif;
        color: #1e293b;
        line-height: 1.5;
        font-size: 11pt;
        background: white;
      }

      .document-container {
        max-width: 210mm;
        margin: 0 auto;
        min-height: 296mm;
        position: relative;
        display: flex;
        flex-direction: column;
      }

      /* Header */
      .doc-header {
        text-align: center;
        margin-bottom: 40px;
        padding-bottom: 20px;
        border-bottom: 1px solid #e2e8f0;
      }

      .clinic-logo-svg {
        width: 60px;
        height: 60px;
        margin-bottom: 10px;
      }

      .clinic-details h1 {
        font-family: 'Crimson Pro', serif;
        font-size: 22pt;
        color: #0f172a;
        margin: 0;
        letter-spacing: -0.02em;
        text-transform: uppercase;
      }

      .divider-small {
        width: 40px;
        height: 2px;
        background: #0f172a;
        margin: 10px auto;
      }

      .clinic-details p {
        font-size: 9pt;
        color: #64748b;
        margin: 2px 0;
      }

      .protocol-tag {
        font-family: monospace;
        color: #0f172a;
        font-weight: bold;
      }

      /* Body */
      .doc-body {
        flex: 1;
      }

      .doc-title {
        font-family: 'Crimson Pro', serif;
        font-size: 18pt;
        text-align: center;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-bottom: 30px;
        color: #0f172a;
        border-bottom: 1px solid #0f172a;
        display: inline-block;
        padding-bottom: 5px;
        position: relative;
        left: 50%;
        transform: translateX(-50%);
      }

      /* Patient Info */
      .patient-section {
        background: #f8fafc;
        padding: 15px;
        border-radius: 4px;
        margin-bottom: 30px;
        border-left: 3px solid #0f172a;
      }

      .section-label {
        font-size: 8pt;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #64748b;
        margin-bottom: 8px;
        font-weight: 700;
      }

      .patient-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }

      .full-width { grid-column: 1 / -1; }

      .field-group { display: flex; flex-direction: column; }
      .field-group .label { font-size: 8pt; color: #64748b; }
      .field-group .value { font-size: 11pt; color: #0f172a; }
      .field-group .value.strong { font-weight: 700; font-size: 12pt; }

      /* Content */
      .content-block { margin-bottom: 20px; }
      .text-justify { text-align: justify; }
      .additional-note { margin-top: 15px; font-style: italic; color: #475569; }

      h4 {
        font-family: 'Crimson Pro', serif;
        font-size: 13pt;
        color: #0f172a;
        margin-bottom: 8px;
        font-weight: 700;
        text-transform: uppercase;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 4px;
      }

      ul, ol { margin-left: 20px; margin-bottom: 20px; }
      li { margin-bottom: 5px; }

      .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px; }
      .box-item { background: #f8fafc; padding: 10px; border-radius: 4px; }
      .box-label { display: block; font-size: 8pt; color: #64748b; font-weight: 700; text-transform: uppercase; }
      .box-value { font-size: 11pt; color: #0f172a; font-weight: 600; }

      .highlight-box { background: #fff7ed; border: 1px solid #ffedd5; padding: 15px; border-radius: 4px; margin-bottom: 20px; }

      /* Prescriptions */
      .rx-group { margin-bottom: 25px; }
      .rx-group h3 { font-size: 10pt; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0; margin-bottom: 10px; }

      .rx-item {
        display: flex;
        gap: 15px;
        margin-bottom: 15px;
        padding-bottom: 15px;
        border-bottom: 1px dashed #e2e8f0;
      }

      .rx-index {
        font-family: 'Crimson Pro', serif;
        font-size: 16pt;
        font-weight: bold;
        color: #94a3b8;
        line-height: 1;
      }

      .rx-name { font-weight: 700; font-size: 12pt; color: #0f172a; }
      .rx-concentration { margin-left: 5px; color: #475569; }
      .rx-form { float: right; font-size: 9pt; text-transform: uppercase; background: #f1f5f9; padding: 2px 6px; border-radius: 3px; }
      .rx-instruction { margin-top: 4px; font-size: 11pt; }
      .rx-label { font-weight: 600; font-size: 9pt; text-transform: uppercase; color: #64748b; }
      .rx-meta { margin-top: 4px; font-size: 9pt; color: #64748b; display: flex; gap: 15px; }

      /* Footer */
      .doc-footer {
        margin-top: 50px;
        page-break-inside: avoid;
      }

      .date-location { text-align: right; margin-bottom: 40px; font-style: italic; color: #475569; }

      .signature-block {
        text-align: center;
        margin-bottom: 40px;
      }

      .signature-line {
        width: 300px;
        height: 1px;
        background: #0f172a;
        margin: 0 auto 10px;
      }

      .doctor-name { font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
      .doctor-crm { font-size: 10pt; color: #475569; }

      .validation-strip {
        border-top: 1px solid #e2e8f0;
        padding-top: 15px;
        font-size: 8pt;
        color: #94a3b8;
        text-align: center;
        background: #f8fafc;
        padding: 10px;
        border-radius: 4px;
      }

      .validation-code { font-family: monospace; font-size: 10pt; color: #0f172a; margin-top: 2px; }

      /* Watermark */
      ${!isEmitted ? `
        body::after {
          content: 'RASCUNHO';
          position: fixed;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 80pt;
          font-weight: 900;
          color: #ef4444;
          opacity: 0.1;
          z-index: -1;
        }
      ` : ''}

      /* Print Overrides */
      @media print {
        body { background: white; }
        .document-container { min-height: auto; }
      }
    </style>
  `;
}

// Função principal wrapper
export function generateDocumentHTML(document: MedicalDocument, patient: Patient): string {
  const documentData: DocumentData = { document, patient };
  const protocol = generateProtocol(document.id, document.createdAt);
  const validationCode = generateValidationCode(document.id);
  const isEmitted = document.status === 'emitido';

  let content = '';

  // Selector
  switch (document.type) {
    case 'atestado_medico': content = generateAtestadoMedico(documentData); break;
    case 'receita': content = generateReceita(documentData); break;
    case 'solicitacao_exames': content = generateSolicitacaoExames(documentData); break;
    case 'encaminhamento': content = generateEncaminhamento(documentData); break;
    case 'declaracao_comparecimento': content = generateDeclaracaoComparecimento(documentData); break;
    case 'declaracao_acompanhante': content = generateDeclaracaoAcompanhante(documentData); break;
    case 'laudo_medico': content = generateLaudoMedico(documentData); break;
    case 'guia_internacao': content = generateGuiaInternacao(documentData); break;
    case 'atestado_aptidao': content = generateAtestadoAptidao(documentData); break;
    case 'termo_consentimento': content = generateTermoConsentimento(documentData); break;
    case 'relatorio_medico': content = generateRelatorioMedico(documentData); break;
    case 'orientacoes_medicas': content = generateOrientacoesMedicas(documentData); break;
    default: content = generateGenericDocument({ ...documentData, title: DOCUMENT_TYPES[document.type] || 'Documento Médico' });
  }

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>${escapeHtml(DOCUMENT_TYPES[document.type])} - ${escapeHtml(patient.nome)}</title>
      ${getDocumentStyles(isEmitted)}
    </head>
    <body>
      <div class="document-container">
        ${generateHeader(protocol)}
        ${content}
        ${generateFooter(document, validationCode)}
      </div>
    </body>
    </html>
  `;
}

// Exports mantidos
export { generateProtocol, generateValidationCode };

export function printDocument(document: MedicalDocument, patient: Patient): void {
  const html = generateDocumentHTML(document, patient);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      setTimeout(() => printWindow.print(), 250);
    };
  }
}

export function downloadDocument(document: MedicalDocument, patient: Patient): void {
  const html = generateDocumentHTML(document, patient);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const protocol = generateProtocol(document.id, document.createdAt);
  const link = window.document.createElement('a');
  link.href = url;
  link.download = `${DOCUMENT_TYPES[document.type]}_${protocol}.html`;
  window.document.body.appendChild(link);
  link.click();
  window.document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

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

// Gera declaração para acompanhante
function generateDeclaracaoAcompanhante({ document, patient }: DocumentData): string {
  return `
    <div class="document-title">
      <h2>DECLARAÇÃO PARA ACOMPANHANTE</h2>
    </div>
    ${generatePatientInfo(patient, false)}
    <div class="document-body">
      <div class="declaracao-content">
        <p class="declaration-text">
          Declaramos para os devidos fins que o(a) Sr(a). <strong>${document.nomeAcompanhante || 'Nome não informado'}</strong>,
          ${document.cpfAcompanhante ? `portador(a) do CPF nº <strong>${document.cpfAcompanhante}</strong>,` : ''}
          ${document.grauParentesco ? `${document.grauParentesco.toLowerCase()} do(a) paciente acima identificado(a),` : ''}
          esteve presente nesta unidade de saúde acompanhando o(a) paciente durante atendimento médico
          ${document.horaChegadaAcompanhante && document.horaSaidaAcompanhante
            ? `no período das <strong>${document.horaChegadaAcompanhante}</strong> às <strong>${document.horaSaidaAcompanhante}</strong>`
            : 'nesta data'}.
        </p>
      </div>
      <div class="legal-notice">
        <p><strong>AVISO LEGAL:</strong> Esta declaração é emitida para fins de comprovação de acompanhamento a paciente em atendimento médico, podendo ser utilizada para justificar ausência laboral conforme legislação trabalhista vigente.</p>
      </div>
    </div>
  `;
}

// Gera termo de consentimento livre e esclarecido
function generateTermoConsentimento({ document, patient }: DocumentData): string {
  const tipoProcedimentoLabels: Record<string, string> = {
    cirurgico: 'Procedimento Cirúrgico',
    diagnostico: 'Procedimento Diagnóstico',
    terapeutico: 'Procedimento Terapêutico',
    estetico: 'Procedimento Estético',
    anestesico: 'Procedimento Anestésico',
    outro: 'Procedimento Médico'
  };

  const tipoProcedimento = document.tipoProcedimento
    ? tipoProcedimentoLabels[document.tipoProcedimento]
    : 'Procedimento Médico';

  return `
    <div class="document-title termo-title">
      <h2>TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO</h2>
      <p class="subtitle">${tipoProcedimento}</p>
    </div>
    ${generatePatientInfo(patient, true)}
    <div class="document-body termo-body">
      <div class="procedimento-section">
        <h3>PROCEDIMENTO PROPOSTO</h3>
        <p class="procedimento-nome"><strong>${document.nomeProcedimento || 'Procedimento não especificado'}</strong></p>
        ${document.descricaoProcedimento ? `
          <div class="procedimento-descricao">
            <p>${document.descricaoProcedimento}</p>
          </div>
        ` : ''}
      </div>

      ${document.riscosProcedimento && document.riscosProcedimento.length > 0 ? `
        <div class="riscos-section">
          <h3>RISCOS DO PROCEDIMENTO</h3>
          <ul class="riscos-list">
            ${document.riscosProcedimento.map(risco => `<li>${risco}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${document.beneficiosProcedimento && document.beneficiosProcedimento.length > 0 ? `
        <div class="beneficios-section">
          <h3>BENEFÍCIOS ESPERADOS</h3>
          <ul class="beneficios-list">
            ${document.beneficiosProcedimento.map(beneficio => `<li>${beneficio}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${document.alternativasTratamento ? `
        <div class="alternativas-section">
          <h3>ALTERNATIVAS DE TRATAMENTO</h3>
          <p>${document.alternativasTratamento}</p>
        </div>
      ` : ''}

      ${document.cuidadosPosProcedimento ? `
        <div class="cuidados-section">
          <h3>CUIDADOS PÓS-PROCEDIMENTO</h3>
          <p>${document.cuidadosPosProcedimento}</p>
        </div>
      ` : ''}

      <div class="declaracao-consentimento">
        <p>
          Declaro que li e compreendi as informações acima prestadas, bem como tive oportunidade de
          fazer perguntas e esclarecer minhas dúvidas. Autorizo, de livre e espontânea vontade,
          a realização do procedimento descrito acima, ciente dos riscos e benefícios envolvidos.
        </p>
      </div>

      <div class="assinaturas-section">
        <div class="assinatura-linha">
          <div class="assinatura-box">
            <div class="assinatura-line"></div>
            <p>Paciente ou Responsável Legal</p>
            ${document.responsavelAssinatura ? `<p class="nome-assinatura">${document.responsavelAssinatura}</p>` : ''}
          </div>
          <div class="assinatura-box">
            <div class="assinatura-line"></div>
            <p>Testemunha</p>
            ${document.testemunha ? `<p class="nome-assinatura">${document.testemunha}</p>` : ''}
          </div>
        </div>
      </div>

      <div class="legal-notice">
        <p><strong>NOTA:</strong> Este termo está em conformidade com a Resolução CFM nº 2.217/2018 (Código de Ética Médica) e demais normativas vigentes sobre consentimento informado.</p>
      </div>
    </div>
  `;
}

// Gera relatório médico detalhado
function generateRelatorioMedico({ document, patient }: DocumentData): string {
  return `
    <div class="document-title relatorio-title">
      <h2>RELATÓRIO MÉDICO</h2>
      ${document.destinatario ? `<p class="destinatario">Para: ${document.destinatario}</p>` : ''}
    </div>
    ${generatePatientInfo(patient, true)}
    <div class="document-body relatorio-body">
      ${document.periodoAcompanhamento ? `
        <div class="periodo-section">
          <h3>PERÍODO DE ACOMPANHAMENTO</h3>
          <p>${document.periodoAcompanhamento}</p>
        </div>
      ` : ''}

      ${document.cid10 && document.cid10.length > 0 ? `
        <div class="diagnostico-section">
          <h3>DIAGNÓSTICO (CID-10)</h3>
          <div class="cid-list">
            ${document.cid10.map(cid => `<span class="cid-tag">${cid}</span>`).join('')}
          </div>
        </div>
      ` : ''}

      ${document.evolucaoClinica ? `
        <div class="evolucao-section">
          <h3>EVOLUÇÃO CLÍNICA</h3>
          <div class="evolucao-content">
            <p>${document.evolucaoClinica}</p>
          </div>
        </div>
      ` : ''}

      ${document.tratamentoAtual ? `
        <div class="tratamento-section">
          <h3>TRATAMENTO ATUAL</h3>
          <div class="tratamento-content">
            <p>${document.tratamentoAtual}</p>
          </div>
        </div>
      ` : ''}

      ${document.prognostico ? `
        <div class="prognostico-section">
          <h3>PROGNÓSTICO</h3>
          <div class="prognostico-content">
            <p>${document.prognostico}</p>
          </div>
        </div>
      ` : ''}

      ${document.recomendacoes ? `
        <div class="recomendacoes-section">
          <h3>RECOMENDAÇÕES</h3>
          <div class="recomendacoes-content">
            <p>${document.recomendacoes}</p>
          </div>
        </div>
      ` : ''}

      ${document.content ? `
        <div class="observacoes-section">
          <h3>OBSERVAÇÕES ADICIONAIS</h3>
          <p>${document.content}</p>
        </div>
      ` : ''}

      <div class="legal-notice">
        <p><strong>AVISO:</strong> Este relatório contém informações médicas confidenciais e foi elaborado exclusivamente para a finalidade indicada, não devendo ser utilizado para outros fins sem autorização expressa do paciente.</p>
      </div>
    </div>
  `;
}

// Gera orientações médicas
function generateOrientacoesMedicas({ document, patient }: DocumentData): string {
  const tipoOrientacaoLabels: Record<string, string> = {
    pre_operatorio: 'Orientações Pré-Operatórias',
    pos_operatorio: 'Orientações Pós-Operatórias',
    tratamento: 'Orientações de Tratamento',
    dieta: 'Orientações Alimentares',
    medicacao: 'Orientações sobre Medicação',
    geral: 'Orientações Gerais'
  };

  const tipoOrientacao = document.tipoOrientacao
    ? tipoOrientacaoLabels[document.tipoOrientacao]
    : 'Orientações Gerais';

  return `
    <div class="document-title orientacoes-title">
      <h2>${tipoOrientacao.toUpperCase()}</h2>
    </div>
    ${generatePatientInfo(patient, false)}
    <div class="document-body orientacoes-body">
      ${document.orientacoesEspecificas && document.orientacoesEspecificas.length > 0 ? `
        <div class="orientacoes-section">
          <h3>ORIENTAÇÕES</h3>
          <ol class="orientacoes-list">
            ${document.orientacoesEspecificas.map(orientacao => `<li>${orientacao}</li>`).join('')}
          </ol>
        </div>
      ` : ''}

      ${document.restricoes && document.restricoes.length > 0 ? `
        <div class="restricoes-section">
          <h3>RESTRIÇÕES</h3>
          <ul class="restricoes-list">
            ${document.restricoes.map(restricao => `<li class="restricao-item">${restricao}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${document.sinaisAlerta && document.sinaisAlerta.length > 0 ? `
        <div class="alerta-section">
          <h3>SINAIS DE ALERTA - PROCURE ATENDIMENTO DE URGÊNCIA SE:</h3>
          <ul class="alerta-list">
            ${document.sinaisAlerta.map(sinal => `<li class="alerta-item">${sinal}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${document.contatoEmergencia ? `
        <div class="contato-section">
          <h3>CONTATO PARA EMERGÊNCIAS</h3>
          <p class="contato-info">${document.contatoEmergencia}</p>
        </div>
      ` : ''}

      ${document.content ? `
        <div class="observacoes-section">
          <h3>OBSERVAÇÕES ADICIONAIS</h3>
          <p>${document.content}</p>
        </div>
      ` : ''}

      <div class="legal-notice orientacoes-notice">
        <p><strong>IMPORTANTE:</strong> Siga rigorosamente as orientações acima. Em caso de dúvidas, entre em contato com a clínica antes de tomar qualquer decisão.</p>
      </div>
    </div>
  `;
}

// Gera atestado de aptidão
function generateAtestadoAptidao({ document, patient }: DocumentData): string {
  const tipoAptidaoLabels: Record<string, string> = {
    esporte_recreativo: 'Prática de Esporte Recreativo',
    esporte_competitivo: 'Prática de Esporte Competitivo',
    atividade_fisica: 'Prática de Atividade Física',
    trabalho: 'Atividade Laboral',
    viagem: 'Viagem',
    mergulho: 'Prática de Mergulho',
    paraquedismo: 'Prática de Paraquedismo',
    outro: 'Atividade Específica'
  };

  const parecerLabels: Record<string, { label: string; class: string }> = {
    apto: { label: 'APTO', class: 'apto' },
    apto_com_restricoes: { label: 'APTO COM RESTRIÇÕES', class: 'apto-restricoes' },
    inapto_temporario: { label: 'INAPTO TEMPORARIAMENTE', class: 'inapto-temp' },
    inapto: { label: 'INAPTO', class: 'inapto' }
  };

  const tipoAptidao = document.tipoAptidao
    ? tipoAptidaoLabels[document.tipoAptidao]
    : 'Atividade Específica';

  const parecer = document.parecer
    ? parecerLabels[document.parecer]
    : parecerLabels.apto;

  return `
    <div class="document-title aptidao-title">
      <h2>ATESTADO DE APTIDÃO</h2>
      <p class="subtitle">${tipoAptidao}</p>
    </div>
    ${generatePatientInfo(patient, true)}
    <div class="document-body aptidao-body">
      <div class="parecer-section ${parecer.class}">
        <h3>PARECER MÉDICO</h3>
        <div class="parecer-box">
          <span class="parecer-label">${parecer.label}</span>
        </div>
      </div>

      ${document.modalidadeEsportiva ? `
        <div class="modalidade-section">
          <h3>MODALIDADE / ATIVIDADE</h3>
          <p>${document.modalidadeEsportiva}</p>
        </div>
      ` : ''}

      ${document.examesRealizadosAptidao && document.examesRealizadosAptidao.length > 0 ? `
        <div class="exames-section">
          <h3>EXAMES REALIZADOS</h3>
          <ul class="exames-list">
            ${document.examesRealizadosAptidao.map(exame => `<li>${exame}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${document.restricoesAtividade && document.restricoesAtividade.length > 0 ? `
        <div class="restricoes-aptidao-section">
          <h3>RESTRIÇÕES</h3>
          <ul class="restricoes-list">
            ${document.restricoesAtividade.map(restricao => `<li>${restricao}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${document.validadeAtestado ? `
        <div class="validade-section">
          <h3>VALIDADE DO ATESTADO</h3>
          <p class="validade-info">${document.validadeAtestado}</p>
        </div>
      ` : ''}

      ${document.content ? `
        <div class="observacoes-section">
          <h3>OBSERVAÇÕES</h3>
          <p>${document.content}</p>
        </div>
      ` : ''}

      <div class="legal-notice">
        <p><strong>NOTA:</strong> Este atestado foi emitido com base em avaliação clínica realizada nesta data. Alterações no estado de saúde do(a) paciente podem invalidar este documento.</p>
      </div>
    </div>
  `;
}

// Gera guia de internação hospitalar
function generateGuiaInternacao({ document, patient }: DocumentData): string {
  const tipoInternacaoLabels: Record<string, { label: string; class: string }> = {
    eletiva: { label: 'Eletiva', class: 'eletiva' },
    urgencia: { label: 'Urgência', class: 'urgencia' },
    emergencia: { label: 'Emergência', class: 'emergencia' }
  };

  const leitoLabels: Record<string, string> = {
    enfermaria: 'Enfermaria',
    apartamento: 'Apartamento',
    uti: 'UTI',
    semi_intensiva: 'Semi-Intensiva'
  };

  const tipoInternacao = document.tipoInternacao
    ? tipoInternacaoLabels[document.tipoInternacao]
    : tipoInternacaoLabels.eletiva;

  const leito = document.leitoSolicitado
    ? leitoLabels[document.leitoSolicitado]
    : 'Enfermaria';

  return `
    <div class="document-title internacao-title">
      <h2>GUIA DE INTERNAÇÃO HOSPITALAR</h2>
      <div class="internacao-tipo ${tipoInternacao.class}">
        <span>CARÁTER: ${tipoInternacao.label.toUpperCase()}</span>
      </div>
    </div>
    ${generatePatientInfo(patient, true)}
    <div class="document-body internacao-body">
      <div class="internacao-dados">
        <div class="dado-row">
          <div class="dado-item">
            <span class="dado-label">Hospital de Destino:</span>
            <span class="dado-value">${document.hospitalDestino || 'A definir'}</span>
          </div>
          <div class="dado-item">
            <span class="dado-label">Leito Solicitado:</span>
            <span class="dado-value">${leito}</span>
          </div>
        </div>
        <div class="dado-row">
          <div class="dado-item">
            <span class="dado-label">Previsão de Permanência:</span>
            <span class="dado-value">${document.previsaoPermanencia || 'A definir'}</span>
          </div>
        </div>
      </div>

      ${document.cid10 && document.cid10.length > 0 ? `
        <div class="diagnostico-section">
          <h3>DIAGNÓSTICO (CID-10)</h3>
          <div class="cid-list">
            ${document.cid10.map(cid => `<span class="cid-tag">${cid}</span>`).join('')}
          </div>
        </div>
      ` : ''}

      ${document.procedimentoProposto ? `
        <div class="procedimento-section">
          <h3>PROCEDIMENTO PROPOSTO</h3>
          <p>${document.procedimentoProposto}</p>
        </div>
      ` : ''}

      <div class="justificativa-section">
        <h3>JUSTIFICATIVA DA INTERNAÇÃO</h3>
        <div class="justificativa-content">
          <p>${document.justificativaInternacao || document.content || 'Justificativa não informada.'}</p>
        </div>
      </div>

      ${document.cuidadosEspeciais && document.cuidadosEspeciais.length > 0 ? `
        <div class="cuidados-section">
          <h3>CUIDADOS ESPECIAIS NECESSÁRIOS</h3>
          <ul class="cuidados-list">
            ${document.cuidadosEspeciais.map(cuidado => `<li>${cuidado}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <div class="legal-notice">
        <p><strong>NOTA:</strong> Esta guia de internação está sujeita à disponibilidade de leitos e aprovação do hospital/convênio. A internação deverá ser autorizada conforme procedimentos administrativos vigentes.</p>
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

      /* Estilos para Termo de Consentimento */
      .termo-title .subtitle {
        font-size: 11pt;
        color: #4a5568;
        margin-top: 5px;
      }

      .termo-body .procedimento-section,
      .termo-body .riscos-section,
      .termo-body .beneficios-section,
      .termo-body .alternativas-section,
      .termo-body .cuidados-section {
        margin-bottom: 20px;
      }

      .termo-body .riscos-list li,
      .termo-body .beneficios-list li {
        margin-bottom: 5px;
        padding-left: 5px;
      }

      .termo-body .declaracao-consentimento {
        background: #f7fafc;
        border: 2px solid #1a365d;
        border-radius: 8px;
        padding: 20px;
        margin: 25px 0;
      }

      .termo-body .declaracao-consentimento p {
        font-size: 11pt;
        line-height: 1.8;
        text-align: justify;
      }

      .assinaturas-section {
        margin-top: 40px;
      }

      .assinatura-linha {
        display: flex;
        justify-content: space-between;
        gap: 40px;
      }

      .assinatura-box {
        flex: 1;
        text-align: center;
      }

      .assinatura-box .assinatura-line {
        border-top: 1px solid #2d3748;
        margin-bottom: 10px;
      }

      .assinatura-box p {
        font-size: 10pt;
        color: #4a5568;
      }

      .assinatura-box .nome-assinatura {
        font-weight: 600;
        color: #1a202c;
      }

      /* Estilos para Relatório Médico */
      .relatorio-title .destinatario {
        font-size: 11pt;
        color: #4a5568;
        margin-top: 5px;
      }

      .relatorio-body .periodo-section,
      .relatorio-body .evolucao-section,
      .relatorio-body .tratamento-section,
      .relatorio-body .prognostico-section,
      .relatorio-body .recomendacoes-section {
        margin-bottom: 20px;
      }

      .relatorio-body .evolucao-content,
      .relatorio-body .tratamento-content,
      .relatorio-body .prognostico-content,
      .relatorio-body .recomendacoes-content {
        background: #f7fafc;
        border-left: 3px solid #1a365d;
        padding: 12px 15px;
        border-radius: 0 6px 6px 0;
      }

      /* Estilos para Orientações Médicas */
      .orientacoes-body .orientacoes-list {
        counter-reset: item;
        list-style: none;
        padding-left: 0;
      }

      .orientacoes-body .orientacoes-list li {
        counter-increment: item;
        margin-bottom: 12px;
        padding: 12px 15px 12px 45px;
        background: #f0fff4;
        border-radius: 6px;
        position: relative;
      }

      .orientacoes-body .orientacoes-list li::before {
        content: counter(item);
        position: absolute;
        left: 12px;
        top: 12px;
        width: 24px;
        height: 24px;
        background: #276749;
        color: white;
        border-radius: 50%;
        text-align: center;
        line-height: 24px;
        font-size: 11pt;
        font-weight: 600;
      }

      .orientacoes-body .restricoes-section {
        margin-top: 20px;
      }

      .orientacoes-body .restricoes-list li {
        margin-bottom: 8px;
        padding: 10px 15px;
        background: #fffaf0;
        border-left: 3px solid #dd6b20;
        border-radius: 0 6px 6px 0;
      }

      .orientacoes-body .alerta-section {
        margin-top: 20px;
        background: #fff5f5;
        border: 2px solid #c53030;
        border-radius: 8px;
        padding: 15px;
      }

      .orientacoes-body .alerta-section h3 {
        color: #c53030;
        margin-bottom: 10px;
      }

      .orientacoes-body .alerta-list li {
        margin-bottom: 8px;
        padding-left: 20px;
        position: relative;
      }

      .orientacoes-body .alerta-list li::before {
        content: '⚠';
        position: absolute;
        left: 0;
      }

      .orientacoes-body .contato-section {
        margin-top: 20px;
        background: #ebf8ff;
        padding: 15px;
        border-radius: 8px;
      }

      .orientacoes-body .contato-info {
        font-size: 14pt;
        font-weight: 600;
        color: #2b6cb0;
      }

      /* Estilos para Atestado de Aptidão */
      .aptidao-title .subtitle {
        font-size: 11pt;
        color: #4a5568;
        margin-top: 5px;
      }

      .aptidao-body .parecer-section {
        text-align: center;
        margin: 25px 0;
      }

      .aptidao-body .parecer-box {
        display: inline-block;
        padding: 15px 40px;
        border-radius: 8px;
        font-size: 18pt;
        font-weight: 700;
      }

      .aptidao-body .parecer-section.apto .parecer-box {
        background: #c6f6d5;
        color: #276749;
        border: 2px solid #276749;
      }

      .aptidao-body .parecer-section.apto-restricoes .parecer-box {
        background: #fefcbf;
        color: #744210;
        border: 2px solid #d69e2e;
      }

      .aptidao-body .parecer-section.inapto-temp .parecer-box {
        background: #fed7d7;
        color: #9b2c2c;
        border: 2px solid #e53e3e;
      }

      .aptidao-body .parecer-section.inapto .parecer-box {
        background: #c53030;
        color: white;
        border: 2px solid #9b2c2c;
      }

      .aptidao-body .validade-section {
        background: #ebf8ff;
        padding: 12px 15px;
        border-radius: 8px;
        margin-top: 15px;
      }

      .aptidao-body .validade-info {
        font-weight: 600;
        color: #2b6cb0;
      }

      /* Estilos para Guia de Internação */
      .internacao-title .internacao-tipo {
        display: inline-block;
        padding: 8px 20px;
        border-radius: 6px;
        font-weight: 700;
        margin-top: 10px;
      }

      .internacao-title .internacao-tipo.eletiva {
        background: #c6f6d5;
        color: #276749;
      }

      .internacao-title .internacao-tipo.urgencia {
        background: #fefcbf;
        color: #744210;
      }

      .internacao-title .internacao-tipo.emergencia {
        background: #fed7d7;
        color: #9b2c2c;
      }

      .internacao-body .internacao-dados {
        background: #f7fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 20px;
      }

      .internacao-body .dado-row {
        display: flex;
        gap: 30px;
        margin-bottom: 10px;
      }

      .internacao-body .dado-row:last-child {
        margin-bottom: 0;
      }

      .internacao-body .dado-item {
        flex: 1;
      }

      .internacao-body .dado-label {
        font-weight: 600;
        color: #4a5568;
        margin-right: 8px;
      }

      .internacao-body .dado-value {
        color: #1a202c;
      }

      .internacao-body .justificativa-section {
        margin-top: 20px;
      }

      .internacao-body .justificativa-content {
        background: #f7fafc;
        border-left: 3px solid #1a365d;
        padding: 12px 15px;
        border-radius: 0 6px 6px 0;
      }

      .internacao-body .cuidados-section {
        margin-top: 20px;
      }

      .internacao-body .cuidados-list li {
        margin-bottom: 8px;
        padding: 8px 12px;
        background: #fff5f5;
        border-radius: 6px;
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
    case 'declaracao_acompanhante':
      documentContent = generateDeclaracaoAcompanhante(documentData);
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
    case 'termo_consentimento':
      documentContent = generateTermoConsentimento(documentData);
      break;
    case 'relatorio_medico':
      documentContent = generateRelatorioMedico(documentData);
      break;
    case 'orientacoes_medicas':
      documentContent = generateOrientacoesMedicas(documentData);
      break;
    case 'atestado_aptidao':
      documentContent = generateAtestadoAptidao(documentData);
      break;
    case 'guia_internacao':
      documentContent = generateGuiaInternacao(documentData);
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

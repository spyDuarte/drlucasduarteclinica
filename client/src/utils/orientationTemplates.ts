/**
 * Templates de Orientações Médicas
 * Organizados por tipo e condição clínica
 */

import type { OrientationTemplate } from '../types';

export const ORIENTATION_TEMPLATES: OrientationTemplate[] = [
  // Orientações Gerais
  {
    id: 'orient-geral-01',
    type: 'geral',
    title: 'Orientações Gerais Pós-Consulta',
    content: `- Mantenha uma alimentação equilibrada e saudável
- Pratique atividade física regular (pelo menos 30 minutos, 5x/semana)
- Durma de 7-8 horas por noite
- Evite automedicação
- Retorne em caso de piora dos sintomas ou novos sintomas
- Mantenha suas consultas de acompanhamento em dia`,
    tags: ['geral', 'prevenção']
  },
  {
    id: 'orient-geral-02',
    type: 'geral',
    title: 'Sinais de Alerta - Retornar Imediatamente',
    content: `Retorne imediatamente ou procure atendimento de emergência se apresentar:
- Febre acima de 39°C que não melhora com antitérmico
- Dor intensa que não alivia
- Falta de ar ou dificuldade para respirar
- Dor no peito
- Vômitos persistentes ou com sangue
- Confusão mental ou alteração do nível de consciência
- Qualquer sintoma que cause preocupação importante`,
    tags: ['urgência', 'alerta']
  },

  // Hipertensão
  {
    id: 'orient-has-01',
    type: 'alimentar',
    title: 'Orientações Alimentares - Hipertensão',
    content: `DIETA PARA HIPERTENSÃO (DASH):

REDUZIR/EVITAR:
- Sal de cozinha (máximo 5g/dia = 1 colher de chá)
- Alimentos industrializados (embutidos, enlatados, temperos prontos)
- Fast food e comida processada
- Bebidas alcoólicas (máximo 1-2 doses/dia)
- Cafeína em excesso

AUMENTAR/PREFERIR:
- Frutas e vegetais frescos (4-5 porções/dia)
- Grãos integrais
- Laticínios desnatados
- Peixes (ômega-3)
- Nozes e castanhas
- Temperos naturais (alho, ervas, limão)

DICA: Leia rótulos e evite produtos com mais de 400mg de sódio por porção`,
    applicableConditions: ['I10', 'I11', 'I12', 'I13', 'I15'], // CIDs de hipertensão
    tags: ['hipertensão', 'dieta', 'cardiovascular']
  },
  {
    id: 'orient-has-02',
    type: 'medicacao',
    title: 'Uso Correto de Anti-hipertensivos',
    content: `COMO TOMAR OS MEDICAMENTOS PARA PRESSÃO:

- Tome todos os dias, no mesmo horário
- Não interrompa o tratamento sem orientação médica
- Se esquecer uma dose, tome assim que lembrar (não dobre a dose)
- Monitore sua pressão em casa (2x/semana)
- Anote os valores para mostrar nas consultas
- Não aumente ou diminua doses por conta própria

IMPORTANTE:
- Mesmo com a pressão controlada, continue o tratamento
- Mudanças no estilo de vida são essenciais
- Relate qualquer efeito colateral ao médico`,
    applicableConditions: ['I10', 'I11', 'I12', 'I13', 'I15'],
    tags: ['hipertensão', 'medicação', 'adesão']
  },

  // Diabetes
  {
    id: 'orient-dm-01',
    type: 'alimentar',
    title: 'Alimentação para Diabetes',
    content: `ORIENTAÇÕES NUTRICIONAIS PARA DIABETES:

EVITAR:
- Açúcar refinado e doces
- Refrigerantes e sucos industrializados
- Carboidratos simples (pão branco, massas refinadas)
- Frituras e alimentos gordurosos

PREFERIR:
- Carboidratos complexos e integrais
- Verduras e legumes à vontade
- Frutas com moderação (2-3 porções/dia)
- Proteínas magras (peixe, frango, ovos)
- Gorduras boas (azeite, abacate, castanhas)

REGRAS DE OURO:
- Faça 5-6 refeições pequenas por dia
- Não pule refeições
- Controle as porções
- Leia rótulos (atenção aos carboidratos)
- Mantenha horários regulares`,
    applicableConditions: ['E10', 'E11', 'E12', 'E13', 'E14'],
    tags: ['diabetes', 'dieta', 'glicemia']
  },
  {
    id: 'orient-dm-02',
    type: 'geral',
    title: 'Monitorização da Glicemia',
    content: `COMO MONITORAR SUA GLICEMIA:

FREQUÊNCIA:
- Jejum: diariamente
- Pós-prandial (2h após refeições): 2-3x/semana
- Sempre que sentir sintomas (tontura, tremor, suor)

VALORES ALVO:
- Jejum: 70-130 mg/dL
- 2h após refeições: < 180 mg/dL
- Ao deitar: 90-150 mg/dL

ANOTE:
- Data e hora
- Valor da glicemia
- Refeição (o que comeu)
- Medicação tomada
- Atividade física

HIPOGLICEMIA (< 70 mg/dL):
- Sintomas: tremor, suor, tontura, confusão
- Ação imediata: 15g de carboidrato rápido (suco, balas, mel)
- Aguarde 15 min e meça novamente`,
    applicableConditions: ['E10', 'E11', 'E12', 'E13', 'E14'],
    tags: ['diabetes', 'monitorização', 'glicemia']
  },

  // Infecções Respiratórias
  {
    id: 'orient-iva-01',
    type: 'geral',
    title: 'Cuidados com Gripe e Resfriado',
    content: `ORIENTAÇÕES PARA INFECÇÕES RESPIRATÓRIAS:

REPOUSO:
- Descanse e durma adequadamente
- Evite esforços físicos

HIDRATAÇÃO:
- Beba bastante líquido (água, chás, sopas)
- Mínimo 2 litros/dia

AMBIENTE:
- Mantenha ambientes ventilados
- Use umidificador ou bacia com água no quarto
- Evite ar condicionado muito frio

HIGIENE:
- Lave as mãos frequentemente
- Use lenços descartáveis
- Ao tossir/espirrar, cubra boca e nariz
- Evite compartilhar objetos pessoais

SINAIS DE ALERTA (procure atendimento):
- Febre > 39°C por mais de 3 dias
- Falta de ar ou dificuldade respiratória
- Dor no peito
- Expectoração com sangue
- Piora dos sintomas após 5-7 dias`,
    applicableConditions: ['J00', 'J06', 'J11', 'J18', 'J20', 'J40'],
    tags: ['respiratório', 'infecção', 'gripe']
  },

  // Gastrite e Refluxo
  {
    id: 'orient-gastro-01',
    type: 'alimentar',
    title: 'Dieta para Gastrite e Refluxo',
    content: `ORIENTAÇÕES ALIMENTARES PARA GASTRITE/REFLUXO:

EVITAR:
- Alimentos ácidos (tomate, frutas cítricas)
- Café, chá preto, refrigerantes
- Alimentos gordurosos e frituras
- Chocolate
- Pimenta e condimentos fortes
- Bebidas alcoólicas
- Menta e hortelã

PREFERIR:
- Alimentos cozidos e grelhados
- Carnes magras
- Arroz, batata, mandioca
- Verduras cozidas
- Frutas não ácidas (banana, mamão, melão)
- Leite desnatado e derivados

HÁBITOS:
- Coma devagar e mastigue bem
- Faça 5-6 refeições pequenas
- Não deite logo após comer (aguarde 2-3h)
- Evite líquidos durante as refeições
- Eleve a cabeceira da cama (15-20cm)
- Não use roupas apertadas`,
    applicableConditions: ['K21', 'K29', 'K30'],
    tags: ['gastrite', 'refluxo', 'digestivo']
  },

  // Atividade Física
  {
    id: 'orient-ativ-01',
    type: 'atividade_fisica',
    title: 'Recomendações de Atividade Física',
    content: `PROGRAMA DE ATIVIDADE FÍSICA:

FREQUÊNCIA E DURAÇÃO:
- Aeróbico: 150 min/semana (30 min, 5x/semana)
- Ou intenso: 75 min/semana
- Fortalecimento muscular: 2x/semana

OPÇÕES DE EXERCÍCIOS:
- Caminhada rápida
- Natação
- Ciclismo
- Dança
- Hidroginástica

COMO COMEÇAR:
- Inicie gradualmente
- Aqueça antes (5-10 min)
- Alongue após exercício
- Use roupas e calçados adequados
- Hidrate-se antes, durante e após

ATENÇÃO:
- Pare se sentir dor no peito, tontura, falta de ar intensa
- Evite exercícios se estiver com febre ou infecção
- Respeite seus limites
- Progrida gradualmente

BENEFÍCIOS:
- Controle de peso
- Redução da pressão arterial
- Melhora do diabetes
- Fortalecimento ósseo
- Bem-estar mental`,
    tags: ['atividade', 'exercício', 'prevenção']
  },

  // Insônia
  {
    id: 'orient-sono-01',
    type: 'geral',
    title: 'Higiene do Sono',
    content: `ORIENTAÇÕES PARA MELHORAR O SONO:

ROTINA:
- Mantenha horários regulares (deitar e acordar)
- Crie ritual relaxante antes de dormir
- Vá para cama apenas quando estiver com sono

AMBIENTE:
- Quarto escuro, silencioso e fresco (18-22°C)
- Cama confortável
- Use o quarto apenas para dormir

EVITAR:
- Cafeína após 14h (café, chá preto, refrigerantes)
- Álcool próximo ao horário de dormir
- Refeições pesadas à noite
- Exercícios intensos 3h antes de dormir
- Telas (TV, celular, computador) 1h antes de dormir
- Cochilos durante o dia

PROMOVER:
- Leitura relaxante
- Banho morno
- Técnicas de relaxamento
- Temperatura ambiente adequada
- Exposição à luz solar durante o dia`,
    applicableConditions: ['G47.0', 'F51'],
    tags: ['sono', 'insônia', 'higiene']
  },

  // Uso de Antibióticos
  {
    id: 'orient-atb-01',
    type: 'medicacao',
    title: 'Uso Correto de Antibióticos',
    content: `COMO USAR ANTIBIÓTICOS CORRETAMENTE:

REGRAS IMPORTANTES:
- Complete TODO o tratamento (mesmo se melhorar antes)
- Tome nos horários corretos (intervalos regulares)
- Não interrompa por conta própria
- Não use sobras de antibióticos antigos
- Não tome antibiótico de outra pessoa

DURANTE O TRATAMENTO:
- Hidrate-se bem
- Evite bebidas alcoólicas
- Tome com água (exceto se orientado diferente)
- Alguns devem ser tomados com alimento, outros em jejum

EFEITOS ESPERADOS:
- Melhora em 48-72h
- Pode causar diarreia leve
- Mulheres: pode causar candidíase vaginal

ATENÇÃO:
- Reações alérgicas (urticária, coceira, falta de ar): PARE e procure atendimento
- Diarreia intensa ou com sangue: comunique ao médico
- Antibióticos podem reduzir eficácia de anticoncepcionais orais`,
    tags: ['antibiótico', 'medicação', 'infecção']
  },

  // Prevenção Cardiovascular
  {
    id: 'orient-cardio-01',
    type: 'geral',
    title: 'Prevenção de Doenças Cardiovasculares',
    content: `CUIDADOS PARA SAÚDE DO CORAÇÃO:

CONTROLE DE FATORES DE RISCO:
- Pressão arterial (< 140/90 mmHg)
- Colesterol (LDL < 100 mg/dL)
- Glicemia de jejum (< 100 mg/dL)
- Peso (IMC 18.5-24.9)
- Circunferência abdominal (H < 102cm, M < 88cm)

HÁBITOS SAUDÁVEIS:
- NÃO FUME (pare imediatamente se fumar)
- Atividade física regular
- Alimentação saudável (DASH ou Mediterrânea)
- Controle do estresse
- Sono adequado (7-8h/noite)
- Limite de álcool (H: 2 doses/dia, M: 1 dose/dia)

EXAMES PERIÓDICOS:
- Pressão arterial: a cada consulta
- Glicemia: anual
- Perfil lipídico: a cada 5 anos (ou conforme risco)
- ECG: conforme indicação médica

SINAIS DE ALERTA - PROCURE EMERGÊNCIA:
- Dor no peito
- Falta de ar súbita
- Dor no braço, mandíbula, costas
- Suor frio, náusea, tontura`,
    tags: ['cardiovascular', 'prevenção', 'coração']
  }
];

/**
 * Busca templates por tipo
 */
export function getTemplatesByType(type: string): OrientationTemplate[] {
  return ORIENTATION_TEMPLATES.filter(t => t.type === type);
}

/**
 * Busca templates aplicáveis a um CID-10
 */
export function getTemplatesByCID(cid10: string): OrientationTemplate[] {
  return ORIENTATION_TEMPLATES.filter(t =>
    t.applicableConditions?.some(c => cid10.startsWith(c))
  );
}

/**
 * Busca templates por tags
 */
export function getTemplatesByTag(tag: string): OrientationTemplate[] {
  return ORIENTATION_TEMPLATES.filter(t =>
    t.tags?.some(tg => tg.toLowerCase().includes(tag.toLowerCase()))
  );
}

/**
 * Busca template por ID
 */
export function getTemplateById(id: string): OrientationTemplate | undefined {
  return ORIENTATION_TEMPLATES.find(t => t.id === id);
}

/**
 * Busca templates por texto (título ou conteúdo)
 */
export function searchTemplates(query: string): OrientationTemplate[] {
  const lowerQuery = query.toLowerCase();
  return ORIENTATION_TEMPLATES.filter(t =>
    t.title.toLowerCase().includes(lowerQuery) ||
    t.content.toLowerCase().includes(lowerQuery) ||
    t.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

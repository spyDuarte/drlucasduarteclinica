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
  },

  // Ansiedade e Estresse
  {
    id: 'orient-ansiedade-01',
    type: 'geral',
    title: 'Manejo da Ansiedade',
    content: `ORIENTAÇÕES PARA CONTROLE DA ANSIEDADE:

TÉCNICAS DE RELAXAMENTO:
- Respiração diafragmática: inspire 4s, segure 4s, expire 6s
- Pratique mindfulness ou meditação (10-15 min/dia)
- Yoga ou alongamento
- Músicas relaxantes

ESTILO DE VIDA:
- Exercícios físicos regulares (30 min, 5x/semana)
- Sono regular (7-8h/noite)
- Reduza cafeína e álcool
- Evite tabaco e drogas
- Mantenha contato social

QUANDO BUSCAR AJUDA:
- Sintomas persistentes por mais de 2 semanas
- Dificuldade para trabalhar ou estudar
- Pensamentos de se machucar
- Isolamento social
- Uso de álcool ou drogas para aliviar

EMERGÊNCIA - LIGUE 188 (CVV):
- Pensamentos suicidas
- Crise de ansiedade severa`,
    applicableConditions: ['F41', 'F32', 'F33', 'F40'],
    tags: ['ansiedade', 'estresse', 'saúde mental']
  },

  // Cefaleia e Enxaqueca
  {
    id: 'orient-cefaleia-01',
    type: 'geral',
    title: 'Cuidados com Cefaleia e Enxaqueca',
    content: `ORIENTAÇÕES PARA DOR DE CABEÇA:

DURANTE A CRISE:
- Repouse em ambiente escuro e silencioso
- Aplique compressas frias na testa
- Hidrate-se bem
- Tome medicação conforme prescrito

PREVENÇÃO:
- Mantenha horários regulares de sono
- Não pule refeições
- Hidrate-se (2L de água/dia)
- Controle o estresse
- Limite cafeína e álcool

GATILHOS COMUNS A EVITAR:
- Jejum prolongado
- Privação de sono ou sono excessivo
- Estresse intenso
- Luz forte ou barulho
- Alguns alimentos (queijos, chocolate, vinho)
- Mudanças hormonais (menstruação)

DIÁRIO DA DOR:
Anote para mostrar ao médico:
- Data e hora da dor
- Intensidade (0-10)
- Localização
- O que comeu/fez antes
- Medicação tomada e efeito

SINAIS DE ALERTA - EMERGÊNCIA:
- Pior dor de cabeça da vida
- Dor súbita e intensa ("trovão")
- Rigidez de nuca
- Febre alta
- Confusão mental
- Fraqueza em um lado do corpo`,
    applicableConditions: ['G43', 'G44', 'R51'],
    tags: ['cefaleia', 'enxaqueca', 'dor']
  },

  // Dor Lombar
  {
    id: 'orient-lombar-01',
    type: 'geral',
    title: 'Cuidados com Dor Lombar',
    content: `ORIENTAÇÕES PARA DOR NAS COSTAS:

FASE AGUDA (PRIMEIROS DIAS):
- Repouso relativo (evite ficar muito tempo na cama)
- Aplique gelo nas primeiras 48h (15-20 min, 3x/dia)
- Depois, alterne com calor local
- Medicação conforme prescrito

POSTURA:
- Ao sentar: mantenha a coluna ereta, pés no chão
- Ao levantar peso: flexione os joelhos, não a coluna
- Ao dormir: de lado com travesseiro entre as pernas
- Evite ficar muito tempo na mesma posição

EXERCÍCIOS RECOMENDADOS:
- Caminhada leve (conforme tolerância)
- Alongamentos suaves
- Fortalecimento do core (abdominais)
- Natação ou hidroginástica
- Pilates (com orientação)

EVITAR:
- Sedentarismo prolongado
- Carregar peso excessivo
- Movimentos bruscos
- Colchão muito mole ou muito duro
- Salto alto (uso prolongado)

SINAIS DE ALERTA - PROCURE ATENDIMENTO:
- Dor que irradia para pernas
- Formigamento ou fraqueza nas pernas
- Perda de controle da urina ou fezes
- Febre associada
- Dor que não melhora com repouso e medicação`,
    applicableConditions: ['M54', 'M51', 'M47'],
    tags: ['lombalgia', 'coluna', 'dor']
  },

  // Infecção Urinária
  {
    id: 'orient-itu-01',
    type: 'geral',
    title: 'Cuidados com Infecção Urinária',
    content: `ORIENTAÇÕES PARA INFECÇÃO URINÁRIA:

DURANTE O TRATAMENTO:
- Complete TODO o antibiótico prescrito
- Beba bastante água (2-3 litros/dia)
- Urine sempre que sentir vontade
- Evite segurar a urina
- Observe melhora dos sintomas em 48-72h

HIGIENE:
- Limpe-se de frente para trás após evacuar
- Lave a região genital antes de relação sexual
- Urine logo após relação sexual
- Use roupas íntimas de algodão
- Evite roupas muito apertadas

PREVENÇÃO DE NOVAS INFECÇÕES:
- Mantenha boa hidratação
- Não segure a urina
- Evite duchas vaginais
- Suco de cranberry pode ajudar (opcional)
- Não use desodorantes íntimos

SINAIS DE ALERTA - RETORNE IMEDIATAMENTE:
- Febre acima de 38.5°C
- Dor lombar intensa
- Náuseas e vômitos
- Sangue na urina
- Sintomas que não melhoram após 48h de tratamento

ATENÇÃO GESTANTES:
- Infecção urinária na gravidez é grave
- Faça todos os exames solicitados
- Complete o tratamento rigorosamente`,
    applicableConditions: ['N30', 'N39'],
    tags: ['urinária', 'infecção', 'cistite']
  },

  // Dislipidemia (Colesterol Alto)
  {
    id: 'orient-colesterol-01',
    type: 'alimentar',
    title: 'Dieta para Colesterol Alto',
    content: `ORIENTAÇÕES ALIMENTARES PARA DISLIPIDEMIA:

EVITAR (GORDURAS RUINS):
- Frituras e fast food
- Carnes gordurosas (picanha, costela, pele de frango)
- Embutidos (salsicha, linguiça, presunto)
- Manteiga e banha
- Leite integral e derivados
- Biscoitos recheados e industrializados
- Sorvetes e doces

PREFERIR (GORDURAS BOAS):
- Peixes (salmão, sardinha, atum) - 2x/semana
- Azeite de oliva extra virgem
- Abacate
- Castanhas, nozes, amêndoas
- Chia, linhaça

AUMENTAR (FIBRAS):
- Aveia (3 colheres/dia)
- Frutas com casca
- Verduras e legumes
- Arroz e pão integral
- Feijão, lentilha, grão-de-bico

REGRAS GERAIS:
- Evite refrigerantes e sucos industrializados
- Limite álcool
- Prefira grelhados, assados e cozidos
- Leia rótulos dos alimentos

METAS:
- LDL < 100 mg/dL (ou < 70 se alto risco)
- HDL > 40 (homens) ou > 50 (mulheres)
- Triglicerídeos < 150 mg/dL`,
    applicableConditions: ['E78'],
    tags: ['colesterol', 'dislipidemia', 'dieta']
  },

  // Asma
  {
    id: 'orient-asma-01',
    type: 'geral',
    title: 'Controle da Asma',
    content: `ORIENTAÇÕES PARA CONTROLE DA ASMA:

USO CORRETO DA BOMBINHA:
1. Retire a tampa e agite bem
2. Expire todo o ar dos pulmões
3. Coloque a bombinha na boca e feche os lábios
4. Inspire lentamente e acione a bombinha
5. Prenda a respiração por 10 segundos
6. Aguarde 1 minuto entre os jatos

MEDICAÇÃO DE CONTROLE (USO DIÁRIO):
- Use todos os dias, mesmo sem sintomas
- Não interrompa sem orientação médica
- Enxague a boca após uso de corticoide inalatório

MEDICAÇÃO DE RESGATE (CRISES):
- Use quando sentir falta de ar, chiado ou tosse
- Se precisar mais de 2x/semana, asma mal controlada
- Procure atendimento se usar mais de 4 jatos/dia

EVITAR GATILHOS:
- Poeira e ácaros
- Mofo e umidade
- Pelo de animais
- Fumaça (cigarro, queimadas)
- Perfumes fortes
- Ar frio e mudanças de temperatura
- Infecções respiratórias

AMBIENTE EM CASA:
- Mantenha casa arejada e limpa
- Evite tapetes, cortinas pesadas e bichos de pelúcia
- Use capa antiácaro em colchões e travesseiros
- Lave roupas de cama semanalmente (água quente)

SINAIS DE ALERTA - EMERGÊNCIA:
- Falta de ar intensa, mesmo em repouso
- Lábios ou unhas azuladas
- Bombinha de resgate não alivia
- Dificuldade para falar frases completas`,
    applicableConditions: ['J45', 'J46'],
    tags: ['asma', 'respiratório', 'alergia']
  },

  // Orientações para Idosos
  {
    id: 'orient-idoso-01',
    type: 'cuidados_especiais',
    title: 'Cuidados para Pessoas Idosas',
    content: `ORIENTAÇÕES PARA SAÚDE DO IDOSO:

MEDICAMENTOS:
- Use porta-comprimidos organizador
- Tome sempre nos mesmos horários
- Nunca dobre doses se esquecer
- Leve lista de medicamentos nas consultas
- Cuidado com interações medicamentosas

PREVENÇÃO DE QUEDAS:
- Use calçados fechados e antiderrapantes
- Mantenha boa iluminação em casa
- Remova tapetes soltos e fios pelo chão
- Instale barras de apoio no banheiro
- Evite subir em banquinhos ou escadas
- Use óculos e aparelho auditivo se necessário

ALIMENTAÇÃO:
- Faça 5-6 refeições pequenas
- Mantenha boa hidratação (1.5-2L/dia)
- Aumente proteínas (carne, ovos, leite)
- Consuma cálcio e vitamina D
- Evite sal e açúcar em excesso

ATIVIDADE FÍSICA:
- Caminhadas leves diariamente
- Exercícios de equilíbrio
- Fortalecimento muscular
- Alongamentos

SAÚDE MENTAL:
- Mantenha atividades sociais
- Exercite a mente (leitura, jogos)
- Mantenha hobbies e interesses
- Procure ajuda se sentir tristeza persistente

EXAMES E VACINAS:
- Mantenha check-ups em dia
- Vacinas: gripe anual, pneumonia, COVID-19
- Rastreios: mamografia, próstata, colonoscopia`,
    tags: ['idoso', 'geriátrico', 'quedas', 'polifarmácia']
  },

  // Orientações para Gestantes
  {
    id: 'orient-gestante-01',
    type: 'cuidados_especiais',
    title: 'Cuidados na Gestação',
    content: `ORIENTAÇÕES PARA GESTANTES:

PRÉ-NATAL:
- Compareça a TODAS as consultas
- Faça todos os exames solicitados
- Tome ácido fólico conforme prescrito
- Vacinas: dTpa, hepatite B, influenza

ALIMENTAÇÃO:
- Faça 5-6 refeições leves/dia
- Evite: álcool, fumo, cafeína em excesso
- Evite: peixe cru, carne mal passada, leite não pasteurizado
- Aumente: frutas, verduras, proteínas
- Tome vitaminas prescritas

ATIVIDADE FÍSICA:
- Caminhadas leves são recomendadas
- Natação e hidroginástica
- Evite esportes de impacto
- Respeite seus limites

SINTOMAS NORMAIS:
- Enjoos matinais (1º trimestre)
- Azia e refluxo
- Câimbras
- Inchaço leve nos pés
- Dor lombar

SINAIS DE ALERTA - PROCURE IMEDIATAMENTE:
- Sangramento vaginal
- Perda de líquido pela vagina
- Dor abdominal intensa
- Febre alta
- Contrações antes de 37 semanas
- Diminuição dos movimentos do bebê
- Dor de cabeça intensa
- Visão turva
- Inchaço súbito de rosto e mãos

TRABALHO DE PARTO:
- Contrações regulares (a cada 5 min por 1 hora)
- Perda do tampão mucoso
- Bolsa rompida`,
    tags: ['gestante', 'gravidez', 'pré-natal']
  },

  // Dermatite e Cuidados com a Pele
  {
    id: 'orient-dermatite-01',
    type: 'cuidados_especiais',
    title: 'Cuidados com Dermatite e Pele Sensível',
    content: `ORIENTAÇÕES PARA PELE SENSÍVEL/DERMATITE:

BANHO:
- Água morna (não quente)
- Banhos rápidos (5-10 minutos)
- Use sabonete neutro e suave
- Evite buchas e esponjas ásperas
- Seque a pele suavemente, sem esfregar

HIDRATAÇÃO:
- Aplique hidratante logo após o banho
- Use cremes sem perfume
- Prefira produtos hipoalergênicos
- Reaplique durante o dia se necessário

ROUPAS:
- Prefira algodão
- Evite lã e tecidos sintéticos
- Use roupas folgadas
- Lave roupas novas antes de usar
- Use sabão neutro para lavar roupas

EVITAR:
- Cosméticos com perfume
- Produtos com álcool
- Coçar (corte as unhas curtas)
- Estresse excessivo
- Mudanças bruscas de temperatura

AMBIENTE:
- Mantenha ambiente umidificado
- Evite carpetes e cortinas pesadas
- Troque roupas de cama frequentemente
- Mantenha ambiente limpo

DURANTE CRISES:
- Compressas frias aliviam coceira
- Use medicação tópica prescrita
- Evite coçar (pode piorar)
- Procure atendimento se não melhorar`,
    applicableConditions: ['L20', 'L23', 'L30'],
    tags: ['dermatite', 'pele', 'alergia', 'eczema']
  },

  // Obesidade e Controle de Peso
  {
    id: 'orient-obesidade-01',
    type: 'alimentar',
    title: 'Controle de Peso e Obesidade',
    content: `ORIENTAÇÕES PARA PERDA DE PESO SAUDÁVEL:

ALIMENTAÇÃO:
- Faça 5-6 refeições pequenas/dia
- Não pule refeições (especialmente café da manhã)
- Mastigue bem, coma devagar
- Use pratos menores
- Beba água antes das refeições
- Evite comer vendo TV ou usando celular

ESCOLHAS ALIMENTARES:
EVITAR:
- Refrigerantes e sucos industrializados
- Fast food e frituras
- Doces e sobremesas
- Pão branco e massas refinadas
- Alimentos ultraprocessados

PREFERIR:
- Água, chás sem açúcar
- Frutas e verduras
- Proteínas magras
- Grãos integrais
- Preparações grelhadas/assadas

ATIVIDADE FÍSICA:
- 150-300 min/semana de aeróbico
- Musculação 2-3x/semana
- Aumente atividades do dia-a-dia
- Use escadas, caminhe mais

METAS REALISTAS:
- Perda de 0,5-1 kg por semana é saudável
- Não faça dietas muito restritivas
- Mudanças graduais são mais duradouras
- Foque em hábitos, não apenas no peso

APOIO:
- Busque suporte familiar
- Considere nutricionista
- Grupos de apoio podem ajudar
- Trate questões emocionais relacionadas`,
    applicableConditions: ['E66'],
    tags: ['obesidade', 'peso', 'dieta', 'emagrecimento']
  },

  // Constipação Intestinal
  {
    id: 'orient-constipacao-01',
    type: 'alimentar',
    title: 'Tratamento da Constipação Intestinal',
    content: `ORIENTAÇÕES PARA INTESTINO PRESO:

ALIMENTAÇÃO RICA EM FIBRAS:
- Frutas: mamão, ameixa, laranja com bagaço, kiwi
- Verduras: folhas verdes, brócolis, couve
- Grãos integrais: aveia, arroz integral, pão integral
- Leguminosas: feijão, lentilha, grão-de-bico
- Sementes: chia, linhaça (2 colheres/dia)

HIDRATAÇÃO:
- Beba 2-3 litros de água/dia
- Água morna em jejum pode ajudar
- Sucos naturais com fibras

HÁBITOS:
- Não ignore a vontade de evacuar
- Estabeleça horário regular (após café da manhã)
- Atividade física regular (caminhada)
- Evite segurar as fezes

EVITAR:
- Alimentos refinados (pão branco, arroz branco)
- Excesso de queijos e derivados
- Fast food e ultraprocessados
- Sedentarismo

RECEITA CASEIRA (OPCIONAL):
- 1 copo de mamão picado
- 1 colher de linhaça
- 1 colher de aveia
- Bata no liquidificador com água

QUANDO PROCURAR MÉDICO:
- Constipação que não melhora
- Sangue nas fezes
- Dor abdominal intensa
- Emagrecimento inexplicado
- Alternância constipação/diarreia`,
    applicableConditions: ['K59.0'],
    tags: ['constipação', 'intestino', 'fibras']
  },

  // Uso de Medicamentos de Uso Contínuo
  {
    id: 'orient-medcontinuo-01',
    type: 'medicacao',
    title: 'Orientações sobre Medicamentos de Uso Contínuo',
    content: `CUIDADOS COM MEDICAMENTOS DE USO DIÁRIO:

ORGANIZAÇÃO:
- Use porta-comprimidos semanal
- Mantenha lista atualizada de medicamentos
- Tome sempre nos mesmos horários
- Marque alarmes no celular

RENOVAÇÃO DE RECEITAS:
- Agende consulta ANTES do medicamento acabar
- Não fique sem medicação
- Tenha sempre reserva (1-2 semanas)
- Guarde cópia da receita

CUIDADOS IMPORTANTES:
- NUNCA pare medicamento por conta própria
- Não mude doses sem orientação médica
- Relate efeitos colaterais ao médico
- Informe todos os medicamentos que usa
- Cuidado com interações (incluindo chás e suplementos)

ARMAZENAMENTO:
- Local seco e fresco
- Protegido da luz
- Longe do alcance de crianças
- Verifique validade regularmente
- Não guarde no banheiro

EM VIAGENS:
- Leve medicamentos na bagagem de mão
- Leve quantidade extra
- Mantenha na embalagem original
- Leve prescrição médica

PARA MOSTRAR AO MÉDICO:
- Lista de todos os medicamentos
- Doses e horários
- Alergias conhecidas
- Últimos exames`,
    tags: ['medicação', 'adesão', 'contínuo', 'crônico']
  },

  // Retorno e Acompanhamento
  {
    id: 'orient-retorno-01',
    type: 'retorno',
    title: 'Orientações de Retorno',
    content: `ORIENTAÇÕES PARA PRÓXIMA CONSULTA:

RETORNO AGENDADO:
- Compareça na data e horário marcados
- Chegue com 15 min de antecedência
- Leve documento com foto e cartão do convênio/SUS

TRAZER NA CONSULTA:
- Lista de medicamentos em uso
- Resultados de exames recentes
- Anotações sobre sintomas (diário)
- Cartão de vacinas
- Laudos de outros especialistas

PREPARAR ANTES:
- Anote dúvidas para perguntar
- Liste sintomas novos ou alterações
- Registre efeitos de medicamentos
- Anote pressão arterial/glicemia (se medir em casa)

EM CASO DE PIORA:
- Não aguarde a data do retorno
- Procure atendimento se necessário
- Ligue para reagendar se tiver dúvidas

MANTENHA ACOMPANHAMENTO:
- Exames periódicos conforme orientação
- Vacinas em dia
- Especialistas se indicado
- Preventivos (mamografia, PSA, etc.)`,
    tags: ['retorno', 'acompanhamento', 'consulta']
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

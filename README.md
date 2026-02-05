# Sistema de Gestão de Consultório Médico

[![Deploy to GitHub Pages](https://github.com/spyDuarte/drlucasduarteclinica/actions/workflows/deploy.yml/badge.svg)](https://github.com/spyDuarte/drlucasduarteclinica/actions/workflows/deploy.yml)

**Demo Online:** [https://spyDuarte.github.io/drlucasduarteclinica](https://spyDuarte.github.io/drlucasduarteclinica)

Sistema web completo para gerenciamento de consultório médico com 1 profissional médico e 1 secretária.

## Funcionalidades

### Módulos Implementados

1. **Autenticação e Controle de Acesso**
   - Login com dois perfis: Médico e Secretária
   - Controle de permissões por funcionalidade
   - Sessão persistente

2. **Cadastro de Pacientes**
   - Dados pessoais completos (nome, CPF, data de nascimento, contato)
   - Endereço completo
   - Dados de convênio (opcional)
   - Histórico médico (alergias, medicamentos em uso, histórico familiar)

3. **Agendamento de Consultas**
   - Visualização diária da agenda
   - Agendamento com horários configuráveis
   - Tipos de consulta: primeira consulta, retorno, urgência, exame, procedimento
   - Status de consulta: agendada, confirmada, aguardando, em atendimento, finalizada, cancelada, faltou

4. **Prontuário Eletrônico (EHR)**
   - Documentação no formato SOAP (Subjetivo, Objetivo, Avaliação, Plano)
   - Registro de sinais vitais (PA, FC, temperatura, peso, altura, IMC)
   - Prescrições médicas
   - Solicitação de exames
   - Códigos CID-10
   - Orientações ao paciente

5. **Módulo Financeiro**
   - Registro de pagamentos
   - Múltiplas formas de pagamento (PIX, cartão, dinheiro, convênio)
   - Controle de pagamentos pendentes
   - Status de pagamento

6. **Dashboard**
   - Consultas do dia
   - Estatísticas gerais
   - Visão rápida de pendências

7. **Relatórios** (apenas médico)
   - Gráficos de consultas por período
   - Receita por forma de pagamento
   - Taxa de comparecimento
   - Evolução mensal

## Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Estilização**: Tailwind CSS
- **Roteamento**: React Router DOM
- **Gráficos**: Recharts
- **Ícones**: Lucide React
- **Datas**: date-fns

## Metodologias e Padrões

### Prontuário SOAP
O sistema utiliza o método SOAP (Subjetivo, Objetivo, Avaliação, Plano), amplamente aceito na literatura médica para documentação clínica estruturada:

- **S (Subjetivo)**: Queixa principal, história da doença atual, revisão de sistemas
- **O (Objetivo)**: Sinais vitais, exame físico, exames complementares
- **A (Avaliação)**: Hipóteses diagnósticas, códigos CID-10
- **P (Plano)**: Conduta, prescrições, solicitação de exames, retorno

### Padrões de Dados
- Tipos baseados em padrões HL7 FHIR (Fast Healthcare Interoperability Resources)
- Classificação Internacional de Doenças (CID-10)

## Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Clonar o repositório
git clone <url-do-repositorio>
cd drlucasduarteclinica

# Instalar dependências
cd client
npm install

# Executar em desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

### Build para Produção

```bash
cd client
npm run build
```

Os arquivos serão gerados em `client/dist/`

## Deploy no GitHub Pages

### Deploy Automático (Recomendado)

O projeto está configurado com GitHub Actions para deploy automático. A cada push na branch `main` ou `master`, o site é automaticamente atualizado.

1. No repositório do GitHub, vá em **Settings** > **Pages**
2. Em **Source**, selecione **GitHub Actions**
3. Faça um push para a branch principal e o deploy será executado automaticamente

### Deploy Manual

```bash
cd client
npm run deploy
```

Este comando irá:
1. Executar o build do projeto
2. Publicar a pasta `dist` na branch `gh-pages`

### Configuração do GitHub Pages

Para que o GitHub Pages funcione corretamente:

1. Vá em **Settings** > **Pages** no seu repositório
2. Em **Source**, selecione:
   - Para deploy automático: **GitHub Actions**
   - Para deploy manual: **Deploy from a branch** e selecione `gh-pages`
3. Aguarde alguns minutos e acesse: `https://seu-usuario.github.io/drlucasduarteclinica`

## Autenticação: modos Demo e Produção

O frontend agora suporta dois modos de autenticação via variável de ambiente:

- `VITE_AUTH_MODE=demo` (padrão): habilita login local de demonstração.
- `VITE_AUTH_MODE=production`: desativa autenticação demo e exige integração com backend.
- `VITE_DATA_STORAGE_MODE=local|memory`: controla persistência de dados clínicos no frontend (padrão automático: `local` em demo e `memory` em produção).
- Proteção contra força bruta no login demo com bloqueio temporário progressivo após múltiplas tentativas inválidas.
- Auditoria de prontuário com trilha de criação/edição, histórico de acesso e versionamento de alterações.

### Credenciais de Demonstração (somente `VITE_AUTH_MODE=demo`)

| Perfil | Email (padrão) | Senha (padrão) |
|--------|----------------|----------------|
| Médico | `medico@clinica.com` | `123456` |
| Secretária | `secretaria@clinica.com` | `123456` |

> Você pode sobrescrever credenciais demo com variáveis `VITE_DEMO_*` no ambiente local.
> Em `VITE_DATA_STORAGE_MODE=memory`, dados de pacientes/consultas/prontuários não são gravados no `localStorage` e existem apenas durante a sessão ativa do navegador.

## Estrutura do Projeto

```
drlucasduarteclinica/
├── client/
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── contexts/       # Context API (Auth, Data)
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── types/          # Tipos TypeScript
│   │   ├── utils/          # Funções utilitárias
│   │   ├── App.tsx         # Componente principal
│   │   └── main.tsx        # Entry point
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── package.json
└── README.md
```

## Permissões por Perfil

| Funcionalidade | Médico | Secretária |
|----------------|--------|------------|
| Dashboard | ✅ | ✅ |
| Pacientes | ✅ | ✅ |
| Agenda | ✅ | ✅ |
| Prontuários | ✅ | ❌ |
| Financeiro | ✅ | ✅ |
| Relatórios | ✅ | ❌ |

## Armazenamento de Dados

Os dados são armazenados localmente no navegador usando `localStorage`. Em um ambiente de produção, recomenda-se implementar um backend com banco de dados seguro.

## Considerações de Segurança

- Este é um sistema de demonstração
- Para uso em produção, implemente:
  - Autenticação JWT/OAuth2
  - Banco de dados seguro (PostgreSQL, MySQL)
  - Criptografia de dados sensíveis
  - Backup automático
  - Conformidade com LGPD

## Licença

MIT

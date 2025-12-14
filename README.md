# Sistema de Gestão de Consultório Médico

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

## Credenciais de Demonstração

| Perfil | Email | Senha |
|--------|-------|-------|
| Médico | medico@clinica.com | medico123 |
| Secretária | secretaria@clinica.com | secretaria123 |

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

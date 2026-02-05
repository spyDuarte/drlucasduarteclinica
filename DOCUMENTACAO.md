# Documentação Técnica do Projeto

## Sistema de Gestão de Consultório Médico - Dr. Lucas Duarte

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Objetivos do Sistema](#2-objetivos-do-sistema)
3. [Arquitetura do Sistema](#3-arquitetura-do-sistema)
4. [Stack Tecnológico](#4-stack-tecnológico)
5. [Funcionalidades Detalhadas](#5-funcionalidades-detalhadas)
6. [Estrutura do Projeto](#6-estrutura-do-projeto)
7. [Modelos de Dados](#7-modelos-de-dados)
8. [Fluxos de Trabalho](#8-fluxos-de-trabalho)
9. [Interface do Usuário](#9-interface-do-usuário)
10. [Segurança e Conformidade](#10-segurança-e-conformidade)
11. [Implantação e DevOps](#11-implantação-e-devops)
12. [Guia de Instalação](#12-guia-de-instalação)
13. [Roadmap Futuro](#13-roadmap-futuro)

---

## 1. Visão Geral

### 1.1 Descrição Executiva

O **Sistema de Gestão de Consultório Médico Dr. Lucas Duarte** é uma aplicação web moderna e completa, desenvolvida para otimizar a gestão de um consultório médico de pequeno porte. O sistema foi projetado para atender às necessidades operacionais de um médico e uma secretária, oferecendo uma solução integrada que abrange desde o agendamento de consultas até o prontuário eletrônico e gestão financeira.

### 1.2 Propósito

A aplicação foi desenvolvida com os seguintes propósitos principais:

- **Digitalização do Atendimento**: Eliminar processos manuais e papéis, centralizando todas as informações do consultório em uma plataforma digital.
- **Eficiência Operacional**: Reduzir o tempo gasto em tarefas administrativas, permitindo maior foco no atendimento ao paciente.
- **Organização de Dados**: Manter registros médicos organizados, acessíveis e seguros.
- **Gestão Financeira**: Controlar receitas e pagamentos de forma transparente e eficiente.

### 1.3 Público-Alvo

| Perfil | Descrição | Nível de Acesso |
|--------|-----------|-----------------|
| **Médico** | Profissional responsável pelo atendimento clínico | Acesso completo a todas as funcionalidades |
| **Secretária** | Profissional responsável pela gestão administrativa | Acesso limitado (sem prontuários e relatórios) |

### 1.4 Demonstração Online

**URL de Acesso:** [https://spyDuarte.github.io/drlucasduarteclinica](https://spyDuarte.github.io/drlucasduarteclinica)

| Perfil | Email (padrão) | Senha (padrão) |
|--------|----------------|----------------|
| Médico | `medico@clinica.com` | `123456` |
| Secretária | `secretaria@clinica.com` | `123456` |

> Essas credenciais são válidas apenas no modo demo (`VITE_AUTH_MODE=demo`). Em `VITE_AUTH_MODE=production`, o login demo fica desativado e deve-se usar backend de autenticação.

---

## 2. Objetivos do Sistema

### 2.1 Objetivos Primários

1. **Gestão Completa de Pacientes**
   - Cadastro detalhado com informações pessoais, médicas e de contato
   - Histórico completo de atendimentos e prontuários
   - Busca e filtros avançados

2. **Agendamento Inteligente**
   - Visualização clara da agenda diária
   - Controle de status de consultas em tempo real
   - Prevenção de conflitos de horários

3. **Prontuário Eletrônico Padronizado**
   - Documentação clínica no formato SOAP
   - Registro completo de sinais vitais
   - Prescrições e solicitações de exames

4. **Controle Financeiro**
   - Registro de pagamentos com múltiplas formas
   - Acompanhamento de valores pendentes
   - Relatórios de receita

### 2.2 Objetivos Secundários

- Geração de relatórios e estatísticas
- Dashboard com visão geral do consultório
- Interface responsiva para diferentes dispositivos
- Experiência de usuário intuitiva e eficiente

---

## 3. Arquitetura do Sistema

### 3.1 Visão Arquitetural

O sistema segue uma arquitetura **Single Page Application (SPA)** com separação clara de responsabilidades:

```
┌─────────────────────────────────────────────────────────────────┐
│                        CAMADA DE APRESENTAÇÃO                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │    Pages     │  │  Components  │  │    Layout/Header     │   │
│  │  (7 páginas) │  │(16 componentes)│ │     /Sidebar        │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                     CAMADA DE ESTADO (Context API)               │
│  ┌─────────────────────────────┐  ┌────────────────────────┐    │
│  │       AuthContext           │  │      DataContext       │    │
│  │  (Autenticação/Sessões)     │  │  (Dados da Aplicação)  │    │
│  └─────────────────────────────┘  └────────────────────────┘    │
├─────────────────────────────────────────────────────────────────┤
│                     CAMADA DE SERVIÇOS                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   Helpers    │  │  Constants   │  │     Validations      │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                    CAMADA DE PERSISTÊNCIA                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    localStorage (Browser)                │    │
│  │   [patients] [appointments] [records] [payments] [user] │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Padrões de Design Utilizados

| Padrão | Aplicação |
|--------|-----------|
| **Context API** | Gerenciamento de estado global (Auth e Data) |
| **Component Composition** | Componentes reutilizáveis e modulares |
| **Protected Routes** | Controle de acesso baseado em roles |
| **Custom Hooks** | Lógica reutilizável (validação de formulários) |
| **Debouncing** | Otimização de persistência (300ms) |

### 3.3 Fluxo de Dados

```
┌──────────┐    ┌───────────────┐    ┌──────────────┐
│  Usuário │───▶│  Componente   │───▶│   Context    │
│  (Ação)  │    │   (Dispatch)  │    │   (State)    │
└──────────┘    └───────────────┘    └──────────────┘
                                            │
                                            ▼
                                    ┌──────────────┐
                                    │ localStorage │
                                    │  (Persist)   │
                                    └──────────────┘
```

---

## 4. Stack Tecnológico

### 4.1 Tecnologias Principais

| Categoria | Tecnologia | Versão | Propósito |
|-----------|------------|--------|-----------|
| **Framework** | React | 19.2.0 | Biblioteca de UI principal |
| **Linguagem** | TypeScript | 5.9.3 | Tipagem estática e segurança |
| **Build Tool** | Vite | 7.2.4 | Bundler e servidor de desenvolvimento |
| **Estilização** | Tailwind CSS | 4.1.18 | Framework de CSS utilitário |
| **Roteamento** | React Router DOM | 7.10.1 | Navegação SPA |
| **Gráficos** | Recharts | 3.5.1 | Visualização de dados |
| **Ícones** | Lucide React | 0.561.0 | Biblioteca de ícones |
| **Datas** | date-fns | 4.1.0 | Manipulação de datas |

### 4.2 Ferramentas de Desenvolvimento

| Ferramenta | Versão | Propósito |
|------------|--------|-----------|
| **ESLint** | 9.39.1 | Linting e padronização de código |
| **Vitest** | 4.0.16 | Framework de testes |
| **React Testing Library** | - | Testes de componentes |
| **GitHub Actions** | - | CI/CD automatizado |

### 4.3 Padrões de Dados

O sistema utiliza estruturas de dados inspiradas em padrões internacionais:

- **HL7 FHIR**: Padrão para interoperabilidade de dados de saúde
- **CID-10**: Classificação Internacional de Doenças
- **SOAP**: Formato padrão para documentação clínica

---

## 5. Funcionalidades Detalhadas

### 5.1 Sistema de Autenticação

#### Descrição
Sistema de login com dois perfis de usuário (Médico e Secretária), com controle de permissões granular por funcionalidade.

#### Características
- Login com email e senha
- Sessão persistente via localStorage
- Logout com limpeza de sessão
- Redirecionamento automático baseado em autenticação
- Proteção de rotas por nível de acesso

#### Matriz de Permissões

| Módulo | Médico | Secretária |
|--------|:------:|:----------:|
| Dashboard | ✅ | ✅ |
| Pacientes (visualizar) | ✅ | ✅ |
| Pacientes (editar) | ✅ | ✅ |
| Agenda | ✅ | ✅ |
| Prontuários | ✅ | ❌ |
| Financeiro | ✅ | ✅ |
| Relatórios | ✅ | ❌ |

---

### 5.2 Cadastro de Pacientes

#### Descrição
Módulo completo para gestão de pacientes com informações pessoais, médicas e de convênio.

#### Campos do Cadastro

**Dados Pessoais:**
- Nome completo
- CPF (com validação)
- Data de nascimento
- Telefone (formato brasileiro)
- Email

**Endereço:**
- CEP (com validação)
- Logradouro
- Número
- Complemento
- Bairro
- Cidade
- Estado (UF)

**Dados de Convênio (opcional):**
- Nome do convênio
- Número da carteirinha
- Validade

**Histórico Médico:**
- Alergias conhecidas
- Medicamentos em uso
- Histórico familiar
- Observações gerais

#### Funcionalidades
- Listagem com busca por nome ou CPF
- Cadastro de novo paciente
- Edição de dados existentes
- Exclusão com confirmação
- Validação de CPF em tempo real
- Formatação automática de telefone e CPF

---

### 5.3 Agendamento de Consultas

#### Descrição
Sistema de agenda diária com slots de 30 minutos, controle de status e tipos de consulta.

#### Configurações da Agenda
- **Horário de funcionamento:** 08:00 às 18:00
- **Duração do slot:** 30 minutos
- **Total de slots diários:** 20

#### Tipos de Consulta

| Tipo | Descrição | Cor |
|------|-----------|-----|
| Primeira Consulta | Primeiro atendimento do paciente | Azul |
| Retorno | Consulta de acompanhamento | Verde |
| Urgência | Atendimento de emergência | Vermelho |
| Exame | Realização de exames | Roxo |
| Procedimento | Procedimentos médicos | Laranja |

#### Status de Consulta

| Status | Descrição | Cor |
|--------|-----------|-----|
| Agendada | Consulta marcada | Cinza |
| Confirmada | Paciente confirmou presença | Azul |
| Aguardando | Paciente na sala de espera | Amarelo |
| Em Atendimento | Consulta em andamento | Verde |
| Finalizada | Consulta concluída | Verde escuro |
| Cancelada | Consulta cancelada | Vermelho |
| Faltou | Paciente não compareceu | Vermelho escuro |

#### Funcionalidades
- Navegação por datas
- Botão de acesso rápido "Hoje"
- Visualização em grid de horários
- Criação de agendamento com seleção de paciente
- Atualização de status em tempo real
- Observações por consulta

---

### 5.4 Prontuário Eletrônico (EHR)

#### Descrição
Sistema de documentação clínica baseado no método SOAP, padrão internacional para registros médicos estruturados.

#### Formato SOAP

**S - Subjetivo**
Informações relatadas pelo paciente:
- Queixa principal (motivo da consulta)
- História da doença atual (HDA)
- Revisão de sistemas

**O - Objetivo**
Dados mensuráveis e observáveis:
- Sinais vitais:
  - Pressão arterial (sistólica/diastólica)
  - Frequência cardíaca (bpm)
  - Temperatura (°C)
  - Peso (kg)
  - Altura (cm)
  - IMC (calculado automaticamente)
- Exame físico
- Exames complementares

**A - Avaliação**
Análise clínica:
- Hipóteses diagnósticas
- Códigos CID-10
- Diagnóstico diferencial

**P - Plano**
Conduta terapêutica:
- Tratamento proposto
- Prescrições médicas
- Solicitação de exames
- Encaminhamentos
- Data de retorno
- Orientações ao paciente

#### Funcionalidades
- Seleção de paciente para novo registro
- Histórico de prontuários por paciente
- Cálculo automático de IMC com classificação
- Campos estruturados e texto livre
- Ordenação cronológica de registros

#### Classificação de IMC

| Faixa | Classificação | Cor |
|-------|---------------|-----|
| < 18.5 | Abaixo do peso | Amarelo |
| 18.5 - 24.9 | Peso normal | Verde |
| 25 - 29.9 | Sobrepeso | Laranja |
| 30 - 34.9 | Obesidade grau I | Vermelho |
| 35 - 39.9 | Obesidade grau II | Vermelho escuro |
| ≥ 40 | Obesidade grau III | Roxo |

---

### 5.5 Módulo Financeiro

#### Descrição
Sistema de controle financeiro para registro e acompanhamento de pagamentos.

#### Status de Pagamento

| Status | Descrição |
|--------|-----------|
| Pendente | Aguardando pagamento |
| Pago | Pagamento confirmado |
| Cancelado | Pagamento cancelado |
| Estornado | Valor devolvido ao paciente |

#### Formas de Pagamento

- PIX
- Cartão de crédito
- Cartão de débito
- Dinheiro
- Convênio
- Transferência bancária

#### Funcionalidades
- Registro de novo pagamento
- Vinculação com paciente e consulta
- Filtro por status
- Estatísticas em tempo real:
  - Total recebido
  - Valor pendente
  - Receita do mês
- Histórico completo de transações

---

### 5.6 Dashboard

#### Descrição
Painel central com visão geral do consultório e acesso rápido às principais funcionalidades.

#### Estatísticas Exibidas

| Métrica | Descrição |
|---------|-----------|
| Consultas hoje | Total de consultas agendadas para o dia |
| Consultas da semana | Total de consultas na semana atual |
| Consultas do mês | Total de consultas no mês atual |
| Total de pacientes | Número total de pacientes cadastrados |
| Novos pacientes (mês) | Pacientes cadastrados no mês |
| Receita do mês | Total recebido no mês |
| Valores pendentes | Total a receber |
| Taxa de comparecimento | Percentual de pacientes que compareceram |

#### Recursos
- Saudação personalizada por perfil
- Indicadores visuais de tendência
- Cards clicáveis para navegação rápida
- Atualização em tempo real

---

### 5.7 Relatórios

#### Descrição
Módulo de análise e visualização de dados (exclusivo para médico).

#### Tipos de Relatórios

1. **Consultas por Status**
   - Gráfico de pizza
   - Distribuição de status de consultas

2. **Consultas por Tipo**
   - Gráfico de barras
   - Quantidade por tipo de consulta

3. **Receita por Forma de Pagamento**
   - Gráfico de barras horizontal
   - Distribuição por método de pagamento

4. **Evolução Mensal**
   - Gráfico de linhas
   - Tendência de consultas ao longo do tempo

#### Funcionalidades
- Filtro por período (data inicial e final)
- Gráficos interativos com tooltips
- Cores consistentes com o sistema
- Exportação visual

---

## 6. Estrutura do Projeto

### 6.1 Organização de Diretórios

```
drlucasduarteclinica/
│
├── .github/
│   └── workflows/
│       └── deploy.yml              # Pipeline CI/CD
│
├── client/                          # Aplicação Frontend
│   ├── public/                      # Arquivos estáticos
│   │
│   ├── src/
│   │   ├── components/              # Componentes Reutilizáveis
│   │   │   ├── Alert.tsx           # Mensagens de alerta
│   │   │   ├── Badge.tsx           # Badges de status
│   │   │   ├── Button.tsx          # Botões personalizados
│   │   │   ├── Card.tsx            # Cards de conteúdo
│   │   │   ├── ConfirmDialog.tsx   # Diálogos de confirmação
│   │   │   ├── EmptyState.tsx      # Estados vazios
│   │   │   ├── ErrorBoundary.tsx   # Tratamento de erros
│   │   │   ├── Header.tsx          # Cabeçalho da aplicação
│   │   │   ├── Input.tsx           # Campos de entrada
│   │   │   ├── Layout.tsx          # Layout principal
│   │   │   ├── LoadingSpinner.tsx  # Indicador de carregamento
│   │   │   ├── Modal.tsx           # Modal genérico
│   │   │   ├── PatientModal.tsx    # Modal de paciente
│   │   │   ├── Select.tsx          # Campo de seleção
│   │   │   ├── Sidebar.tsx         # Menu lateral
│   │   │   ├── Table.tsx           # Tabela de dados
│   │   │   └── Toast.tsx           # Notificações toast
│   │   │
│   │   ├── contexts/                # Gerenciamento de Estado
│   │   │   ├── AuthContext.tsx     # Autenticação e sessões
│   │   │   └── DataContext.tsx     # Dados da aplicação
│   │   │
│   │   ├── pages/                   # Páginas da Aplicação
│   │   │   ├── Agenda.tsx          # Agendamento
│   │   │   ├── Dashboard.tsx       # Painel principal
│   │   │   ├── Financial.tsx       # Financeiro
│   │   │   ├── Login.tsx           # Autenticação
│   │   │   ├── MedicalRecords.tsx  # Prontuários
│   │   │   ├── Patients.tsx        # Pacientes
│   │   │   └── Reports.tsx         # Relatórios
│   │   │
│   │   ├── types/                   # Definições de Tipos
│   │   │   └── index.ts            # Interfaces TypeScript
│   │   │
│   │   ├── hooks/                   # Custom Hooks
│   │   │   └── useFormValidation.ts
│   │   │
│   │   ├── utils/                   # Funções Utilitárias
│   │   │   └── helpers.ts          # Helpers e formatadores
│   │   │
│   │   ├── constants/               # Constantes
│   │   │   └── clinic.ts           # Configurações da clínica
│   │   │
│   │   ├── data/                    # Dados de Demonstração
│   │   │   └── demoData.ts         # Dados iniciais
│   │   │
│   │   ├── test/                    # Configuração de Testes
│   │   │
│   │   ├── App.tsx                 # Componente Raiz
│   │   ├── main.tsx                # Entry Point
│   │   └── index.css               # Estilos Globais
│   │
│   ├── index.html                  # HTML principal
│   ├── package.json                # Dependências
│   ├── vite.config.ts              # Configuração Vite
│   ├── tailwind.config.js          # Configuração Tailwind
│   ├── tsconfig.json               # Configuração TypeScript
│   └── eslint.config.js            # Configuração ESLint
│
├── package.json                    # Package raiz
├── README.md                       # Documentação básica
└── DOCUMENTACAO.md                 # Esta documentação
```

### 6.2 Descrição dos Módulos

| Módulo | Responsabilidade |
|--------|------------------|
| **components/** | Componentes de UI reutilizáveis e independentes |
| **contexts/** | Estado global da aplicação (autenticação e dados) |
| **pages/** | Componentes de página com lógica específica |
| **types/** | Interfaces e tipos TypeScript |
| **hooks/** | Hooks personalizados para lógica reutilizável |
| **utils/** | Funções auxiliares (formatação, validação, etc.) |
| **constants/** | Valores constantes e configurações |
| **data/** | Dados de demonstração para testes |

---

## 7. Modelos de Dados

### 7.1 Entidades Principais

#### User (Usuário)
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'doctor' | 'secretary';
  avatar?: string;
}
```

#### Patient (Paciente)
```typescript
interface Patient {
  id: string;
  name: string;
  cpf: string;
  birthDate: string;
  phone: string;
  email?: string;
  address: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  insurance?: {
    name: string;
    cardNumber: string;
    expirationDate: string;
  };
  medicalHistory: {
    allergies: string;
    medications: string;
    familyHistory: string;
    observations: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

#### Appointment (Consulta)
```typescript
interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  type: 'first' | 'return' | 'emergency' | 'exam' | 'procedure';
  status: 'scheduled' | 'confirmed' | 'waiting' | 'in_progress' |
          'completed' | 'canceled' | 'no_show';
  observations?: string;
  createdAt: string;
}
```

#### MedicalRecord (Prontuário)
```typescript
interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  appointmentId?: string;
  date: string;
  subjective: {
    chiefComplaint: string;
    historyOfPresentIllness: string;
    reviewOfSystems: string;
  };
  objective: {
    vitalSigns: {
      bloodPressureSystolic: number;
      bloodPressureDiastolic: number;
      heartRate: number;
      temperature: number;
      weight: number;
      height: number;
    };
    physicalExam: string;
    complementaryExams: string;
  };
  assessment: {
    diagnosticHypotheses: string;
    icd10Codes: string;
  };
  plan: {
    treatment: string;
    prescriptions: string;
    examRequests: string;
    referrals: string;
    followUpDate: string;
    patientGuidance: string;
  };
  createdAt: string;
  doctorId: string;
}
```

#### Payment (Pagamento)
```typescript
interface Payment {
  id: string;
  patientId: string;
  patientName: string;
  appointmentId?: string;
  amount: number;
  method: 'pix' | 'credit' | 'debit' | 'cash' | 'insurance' | 'transfer';
  status: 'pending' | 'paid' | 'canceled' | 'refunded';
  date: string;
  description?: string;
  createdAt: string;
}
```

### 7.2 Chaves de Armazenamento

| Chave | Descrição |
|-------|-----------|
| `clinica_user` | Dados do usuário logado |
| `clinica_patients` | Lista de pacientes cadastrados |
| `clinica_appointments` | Agendamentos de consultas |
| `clinica_records` | Prontuários médicos |
| `clinica_payments` | Registros de pagamentos |

---

## 8. Fluxos de Trabalho

### 8.1 Fluxo de Atendimento

```
┌─────────────────┐
│  Agendamento    │
│    (Agenda)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Confirmação   │
│   pelo paciente │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Chegada na    │
│    clínica      │
│  (Aguardando)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Atendimento    │
│  (Em progresso) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Prontuário    │
│   (Registro)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Pagamento     │
│  (Financeiro)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Finalizado    │
└─────────────────┘
```

### 8.2 Fluxo de Cadastro de Paciente

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Abertura   │────▶│  Preenchimento│────▶│   Validação  │
│   do Modal   │     │   dos dados  │     │   de campos  │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                           ┌─────────────────────┘
                           ▼
                    ┌──────────────┐     ┌──────────────┐
                    │   Salvamento │────▶│   Feedback   │
                    │  localStorage│     │   (Toast)    │
                    └──────────────┘     └──────────────┘
```

---

## 9. Interface do Usuário

### 9.1 Design System

#### Paleta de Cores

| Cor | Hex | Uso |
|-----|-----|-----|
| Primary Blue | `#5a6cf0` | Ações principais, links |
| Medical Teal | `#14b8a6` | Elementos médicos |
| Success Green | `#22c55e` | Confirmações, sucesso |
| Warning Yellow | `#eab308` | Alertas, atenção |
| Error Red | `#ef4444` | Erros, cancelamentos |
| Neutral Slate | `#64748b` | Textos secundários |

#### Tipografia
- **Font Family:** Sistema padrão (sans-serif)
- **Tamanhos:** Escala do Tailwind (text-xs a text-4xl)

### 9.2 Componentes de Interface

| Componente | Descrição |
|------------|-----------|
| **Button** | Botões com variantes (primary, secondary, danger) |
| **Badge** | Indicadores de status coloridos |
| **Card** | Containers de conteúdo com sombra |
| **Modal** | Janelas modais para formulários |
| **Table** | Tabelas de dados com ordenação |
| **Toast** | Notificações temporárias |
| **Alert** | Mensagens de alerta persistentes |
| **Input/Select** | Campos de formulário estilizados |

### 9.3 Responsividade

O sistema é totalmente responsivo, adaptando-se a diferentes tamanhos de tela:

- **Desktop:** Layout completo com sidebar fixa
- **Tablet:** Sidebar colapsável
- **Mobile:** Menu hamburguer e layouts empilhados

---

## 10. Segurança e Conformidade

### 10.1 Estado Atual (Demonstração)

> ⚠️ **IMPORTANTE:** Esta versão é uma aplicação de demonstração e utiliza armazenamento local no navegador.

**Limitações atuais:**
- Dados armazenados em localStorage (não criptografado)
- Sem autenticação real (credenciais fixas)
- Sem comunicação com servidor backend
- Dados não sincronizados entre dispositivos

### 10.2 Recomendações para Produção

Para uso em ambiente real de produção, recomenda-se implementar:

#### Autenticação e Autorização
- [ ] Autenticação JWT ou OAuth 2.0
- [ ] Tokens de acesso com expiração
- [ ] Refresh tokens seguros
- [ ] Controle de sessão no servidor

#### Banco de Dados
- [ ] PostgreSQL ou MySQL com criptografia
- [ ] Backup automático diário
- [ ] Replicação para alta disponibilidade
- [ ] Logs de auditoria

#### Segurança de Dados
- [ ] Criptografia de dados sensíveis (AES-256)
- [ ] HTTPS obrigatório
- [ ] Headers de segurança (CSP, HSTS)
- [ ] Proteção contra XSS e CSRF

#### Conformidade Legal
- [ ] LGPD (Lei Geral de Proteção de Dados)
- [ ] Consentimento explícito do paciente
- [ ] Direito de acesso e exclusão de dados
- [ ] CFM (Conselho Federal de Medicina)

---

## 11. Implantação e DevOps

### 11.1 Pipeline CI/CD

O projeto utiliza GitHub Actions para integração e deploy contínuos:

```yaml
Trigger: Push para main/master ou branches claude/*
         ou dispatch manual

Pipeline:
  1. Checkout do código
  2. Setup Node.js 20
  3. Instalação de dependências
  4. Execução de linting (ESLint)
  5. Execução de testes (Vitest)
  6. Build de produção (Vite)
  7. Deploy para GitHub Pages
```

### 11.2 Comandos de Deploy

```bash
# Build de produção
npm run build

# Deploy manual para GitHub Pages
npm run deploy

# Preview local do build
npm run preview
```

### 11.3 Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `BASE_URL` | URL base para assets (`/drlucasduarteclinica/`) |

---

## 12. Guia de Instalação

### 12.1 Pré-requisitos

- Node.js 18+ (recomendado 20+)
- npm 9+ ou yarn
- Git

### 12.2 Instalação Local

```bash
# 1. Clonar o repositório
git clone https://github.com/spyDuarte/drlucasduarteclinica.git

# 2. Entrar no diretório
cd drlucasduarteclinica

# 3. Instalar dependências
cd client
npm install

# 4. Iniciar servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

### 12.3 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Gera build de produção |
| `npm run preview` | Preview do build de produção |
| `npm run lint` | Executa verificação de linting |
| `npm run test` | Executa testes em modo watch |
| `npm run test:run` | Executa testes uma vez |
| `npm run test:coverage` | Gera relatório de cobertura |
| `npm run deploy` | Deploy para GitHub Pages |

---

## 13. Roadmap Futuro

### 13.1 Melhorias Planejadas

#### Curto Prazo
- [ ] Impressão de prescrições médicas
- [ ] Impressão de atestados médicos
- [ ] Exportação de relatórios em PDF
- [ ] Busca avançada de pacientes

#### Médio Prazo
- [ ] Backend API com Node.js/Express
- [ ] Banco de dados PostgreSQL
- [ ] Autenticação JWT real
- [ ] Notificações por email (lembretes de consulta)

#### Longo Prazo
- [ ] Aplicativo mobile (React Native)
- [ ] Integração com sistemas de convênios
- [ ] Telemedicina (videochamadas)
- [ ] Assinatura digital de documentos
- [ ] Integração com laboratórios

### 13.2 Integrações Futuras

- [ ] WhatsApp Business API (agendamentos)
- [ ] Google Calendar (sincronização)
- [ ] Sistemas de convênios (validação online)
- [ ] Laboratórios (resultados de exames)

---

## Informações do Documento

| Atributo | Valor |
|----------|-------|
| **Versão** | 1.0.0 |
| **Data de Criação** | Dezembro 2025 |
| **Última Atualização** | Dezembro 2025 |
| **Autor** | Equipe de Desenvolvimento |
| **Projeto** | Sistema de Gestão - Dr. Lucas Duarte |

---

*Este documento é propriedade do projeto drlucasduarteclinica e deve ser mantido atualizado conforme o sistema evolui.*

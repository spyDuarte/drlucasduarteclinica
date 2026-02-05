# Plano de Melhorias do Projeto (Visão Geral)

## 1) Objetivo deste documento

Este documento consolida sugestões **estratégicas, técnicas e operacionais** para elevar o projeto em seis dimensões principais:

1. Segurança e conformidade (LGPD + boas práticas clínicas)
2. Arquitetura e manutenibilidade
3. Qualidade de código e testes
4. Performance e experiência do usuário
5. Dados, integrações e observabilidade
6. Operação, deploy e governança do produto

A proposta abaixo foi estruturada para ser aplicada em fases, com foco em ganho incremental sem quebrar funcionalidades existentes.

---

## 2) Diagnóstico resumido do cenário atual

Com base na estrutura do repositório e documentação existente, o projeto já apresenta pontos fortes importantes:

- Base frontend moderna (React + TypeScript + Vite)
- Organização por módulos (pages/components/contexts/utils)
- Cobertura funcional ampla para um consultório (agenda, pacientes, prontuário, financeiro, relatórios)
- Testes já iniciados com Vitest + Testing Library
- Documentação relevante de domínio e code review já produzidos

Ao mesmo tempo, há oportunidades claras de evolução em:

- Segurança de autenticação e persistência de dados de saúde
- Escalabilidade da camada de estado (DataContext centralizado e grande)
- Maior cobertura de testes automatizados (principalmente integrações e fluxos críticos)
- Observabilidade (telemetria, logging estruturado, métricas de uso/erro)
- Processo de release e validações automáticas de qualidade

---

## 3) Melhorias por área

## 3.1 Segurança, privacidade e conformidade

### Prioridade alta

1. **Remover credenciais de demonstração do fluxo “real”**
   - Separar claramente modo demo vs. produção.
   - Em produção, autenticação deve ser delegada a backend (JWT com expiração curta + refresh token rotativo).

2. **Evoluir armazenamento local de dados clínicos**
   - Hoje o uso de `localStorage` é útil para demo, mas inadequado para produção com dados sensíveis.
   - Migrar para backend com criptografia em repouso, trilha de auditoria e controle de acesso por perfil.

3. **Fortalecer sessão e segurança de acesso**
   - Bloqueio progressivo por tentativas de login.
   - 2FA para perfil médico.
   - Timeout com aviso de expiração iminente (ex.: modal aos 2 min finais).

4. **Auditoria clínica completa**
   - Registrar criação/edição/visualização/exportação de prontuário com usuário, timestamp e ação.
   - Exibir histórico por paciente e por prontuário.

### Prioridade média

5. **Política de retenção e descarte de dados**
   - Definir ciclo de vida de dados (ativos, arquivados, removidos).
   - Criar políticas por tipo de dado (financeiro, clínico, anexos).

6. **Gestão de consentimento (LGPD)**
   - Registrar consentimento para uso e compartilhamento de dados.
   - Adicionar telas para consulta/revogação de consentimentos.

---

## 3.2 Arquitetura e organização de código

### Prioridade alta

1. **Modularizar o `DataContext` por domínio**
   - Criar contexts/hooks separados: `Patients`, `Appointments`, `MedicalRecords`, `Payments`.
   - Reduz acoplamento e melhora performance de renderização.

2. **Introduzir camada de serviços/repositórios**
   - Separar regra de negócio do componente/context.
   - Ex.: `services/patientsService.ts`, `repositories/appointmentsRepository.ts`.

3. **Padronizar contratos de dados (DTO + mapper)**
   - Definir tipos de entrada/saída para cada operação.
   - Evitar “tipagem flexível” e facilitar futura integração com backend.

### Prioridade média

4. **Estratégia de estado escalável**
   - Avaliar React Query/TanStack Query para cache, invalidação e sincronização de dados remotos.
   - Manter Context apenas para estado global leve (auth, UI preferences).

5. **Feature folders por domínio**
   - Estrutura sugerida: `src/features/<dominio>/{components, hooks, services, types, tests}`.
   - Facilita ownership e evolução por módulo.

---

## 3.3 Qualidade de código, testes e confiabilidade

### Prioridade alta

1. **Cobertura de testes orientada a risco**
   - Priorizar fluxos críticos:
     - login e permissões por perfil
     - criação/edição de paciente
     - conflito de agenda
     - criação de prontuário SOAP
     - cálculo financeiro e dashboards

2. **Testes de integração de jornada completa**
   - Adicionar Playwright/Cypress para cenários E2E principais.
   - Inclui validação de UX (mensagens de erro, bloqueios, permissões).

3. **Quality gates em CI**
   - Pipeline mínimo: `lint`, `type-check`, `test`, `build`.
   - Bloquear merge quando cobertura mínima não for atingida.

### Prioridade média

4. **TypeScript mais estrito**
   - Elevar rigor no `tsconfig` (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, etc.).
   - Reduzir casting e garantir contratos mais robustos.

5. **Padrões de erro e feedback ao usuário**
   - Centralizar tratamento de erros (domínio, infraestrutura, validação).
   - Padronizar toasts/alerts com códigos de erro amigáveis.

---

## 3.4 Performance e experiência do usuário

### Prioridade alta

1. **Evitar re-renderizações amplas**
   - Quebrar providers grandes e memoizar seletores de dados derivados.
   - Introduzir hooks de consulta por recorte (ex.: `useTodayAppointments`).

2. **Virtualização em listas grandes**
   - Pacientes, histórico e timeline podem crescer rapidamente.
   - Usar virtualização para preservar fluidez.

3. **Lazy loading de módulos pesados**
   - Carregamento sob demanda de relatórios, prontuário avançado e componentes gráficos.

### Prioridade média

4. **Acessibilidade (a11y) e usabilidade clínica**
   - Navegação por teclado completa.
   - Foco visível e ARIA labels consistentes.
   - Revisão de contraste e legibilidade para uso prolongado.

5. **Estados de carregamento/skeleton consistentes**
   - Padronizar loading, empty state e erro por módulo.

---

## 3.5 Dados, domínio clínico e interoperabilidade

### Prioridade alta

1. **Validações clínicas avançadas**
   - Consolidar alertas para sinais vitais críticos.
   - Regras de segurança para prescrições (dose máxima, contraindicações).

2. **Evoluir suporte a CID-10 e nomenclaturas**
   - Melhorar busca semântica e por sinônimos.
   - Preparar base para futuras classificações (ex.: CIAP, TUSS, LOINC dependendo da estratégia).

3. **Padronização para interoperabilidade (FHIR-ready)**
   - Mapear entidades locais para recursos FHIR relevantes (Patient, Encounter, Observation, Condition, MedicationRequest).

### Prioridade média

4. **Versionamento de prontuário**
   - Snapshot por edição e diff entre versões.
   - Recuperação de versão anterior com trilha de auditoria.

5. **Exportação profissional de documentos**
   - PDF com layout médico padronizado, assinatura digital e QR de validação.

---

## 3.6 DevOps, operação e governança

### Prioridade alta

1. **CI/CD robusto e previsível**
   - Ambientes separados (dev/staging/prod).
   - Deploy com validação prévia e rollback simples.

2. **Observabilidade mínima viável**
   - Error tracking (Sentry equivalente), logs estruturados e métricas de frontend.
   - Dashboard de saúde da aplicação (erros JS, tempo de carregamento, taxa de falha por fluxo).

3. **Dependabot e gestão de vulnerabilidades**
   - Auditoria automática de dependências e política de atualização recorrente.

### Prioridade média

4. **Padronização de contribuição**
   - Criar/atualizar `CONTRIBUTING.md`, convenção de commits, checklist de PR.

5. **Roadmap orientado por KPIs**
   - KPIs sugeridos:
     - taxa de erro por sessão
     - tempo médio para cadastro de paciente
     - tempo médio para concluir prontuário
     - cobertura de testes por módulo

---

## 4) Plano de execução sugerido (90 dias)

## Fase 1 (Semanas 1–3) — Fundação de qualidade

- Pipeline CI com lint/type-check/test/build obrigatório
- Cobertura de testes para fluxos críticos (login, pacientes, agenda)
- Refatoração inicial do DataContext (quebra por domínios)

## Fase 2 (Semanas 4–7) — Segurança e domínio clínico

- Estratégia de autenticação produção-ready (backend + tokens)
- Auditoria de ações em prontuário
- Reforço de validações clínicas e alertas de segurança

## Fase 3 (Semanas 8–10) — Performance e UX

- Lazy loading, virtualização e otimizações de render
- Padrão visual para loading/erro/vazio
- Revisão de acessibilidade e atalhos de produtividade

## Fase 4 (Semanas 11–13) — Observabilidade e escala

- Telemetria e monitoramento de erros
- Ajustes guiados por métricas reais de uso
- Plano de evolução para interoperabilidade (FHIR)

---

## 5) Backlog priorizado (resumo prático)

## Top 10 iniciativas (ordem recomendada)

1. CI com quality gate obrigatório
2. Modularização do DataContext por domínio
3. Cobertura de testes de fluxos críticos
4. Estratégia de autenticação e sessão produção
5. Auditoria clínica completa
6. Tratamento de erros padronizado
7. Otimizações de renderização e lazy loading
8. Melhorias de acessibilidade
9. Observabilidade com métricas e error tracking
10. Preparação de contratos interoperáveis (FHIR-ready)

---

## 6) Resultado esperado com a implementação

Com a execução desse plano, o projeto tende a ganhar:

- **Maior segurança e conformidade** para dados de saúde
- **Mais previsibilidade de entrega** (CI e testes robustos)
- **Escalabilidade técnica** para evolução de funcionalidades
- **Melhor experiência de uso** para médico e secretária
- **Base sólida para produção real** e integrações futuras

---

## 7) Observação final

O sistema já possui uma base funcional forte e madura para cenário de demonstração. As melhorias propostas focam em transformá-lo em uma plataforma mais confiável para operação real, reduzindo risco técnico e clínico sem perder agilidade de evolução.

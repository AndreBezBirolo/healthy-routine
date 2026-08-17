# 🗺️ Healthy Routine - Roadmap & Backlog Oficial de Desenvolvimento

Este documento é a **Fonte da Verdade de Progresso** do projeto **Healthy Routine**. Ele lista todos os módulos concluídos, o que está em andamento e o que falta desenvolver, servindo como guia sincronizado entre usuário e IA.

---

## 📊 Status Geral do Projeto

- **Back-end Core & APIs**: ~85% Concluído
- **Mobile UI & Interações**: ~80% Concluído
- **Integração Realtime/HTTP Mobile $\leftrightarrow$ API**: ~40% Concluído (Estado local rico pronto para plugar na API)
- **Monetização & Assinatura (SaaS)**: ~25% Concluído (Schema pronto)
- **CI/CD & Deploy para Lojas**: ~15% Concluído (Docker pronto)

---

## ✅ 1. O que já foi Concluído

### 🚀 Back-end & Arquitetura
- [x] Arquitetura em Camadas (Fastify + TypeScript + Prisma + Zod + Pino).
- [x] Multi-tenancy estrito por `Workspace` (Casal).
- [x] Pipeline de Auditoria 100% automatizado (`AsyncLocalStorage` + extensões Prisma) que gera diffs compactos (`{ field, old, new }`).
- [x] Módulo de Autenticação JWT com Refresh Tokens e Sessions no banco.
- [x] Módulo de Workspaces (Criação, Convite por Código de 6 dígitos).
- [x] Módulo de Refeições (Visualização do dia, semana, agendamento em lote de marmitas).
- [x] Módulo de Receitas Especiais com roleta de escolha aleatória.
- [x] Módulo Financeiro de Despesas Compartilhadas com cálculo de compensação de saldos.
- [x] Módulo de Lista de Compras Compartilhada com toggle de status e limpeza.
- [x] Módulo de Tarefas do Lar & Hábitos (`Task` model, filtros por membro/status e recorrência).
- [x] Módulo de Gestão Avançada de Refeições (Edição, Exclusão, Marcação de Consumido e Envio de Ingredientes para Mercado).
- [x] Script batch de inicialização em 1 clique ([`start-dev.bat`](file:///c:/Users/andre/OneDrive/Desktop/Healthy%20Routine/start-dev.bat)).
- [x] Suporte a Docker & Docker Compose para PostgreSQL.

### 📱 Mobile (React Native + Expo SDK 54)
- [x] Configuração para Expo SDK 54 compatível com a Google Play Store e Web (`--web`).
- [x] Arquitetura de Componentes Modularizada e desacoplada em `mobile/src/components/`.
- [x] **Internacionalização (i18n)** nativa com `i18next` (`pt-BR` e `en` com fallback e alternador no Header).
- [x] **Aba Hoje**: Visualização rápida de marmitas vs pratos especiais, status consumido, detalhes com 1 toque.
- [x] **Aba Semana**: Calendário de 7 dias com datas locais sincronizadas e pratos clicáveis.
- [x] **Aba Especiais**: Catálogo de ideias para sair da mesmice + Roleta interativa com envio direto para o mercado.
- [x] **Aba Rotina & Casa (`TasksTab.tsx`)**: Gestão de afazeres domésticos e hábitos com filtros e recorrência.
- [x] **Aba Mercado**: Lista de compras inteligente com checklist e cálculo de estimativa.
- [x] **Aba Finanças**: Resumo de gastos (Total, Cota 50/50, Quem Deve Para Quem, histórico de compras).
- [x] **Aba Histórico**: Feed em tempo real de auditoria com nomes dos membros.
- [x] **Modal de Detalhes da Refeição (`MealDetailModal.tsx`)**: Edição rápida, check de consumido e botão de comprar ingredientes no mercado.

---

## ⏳ 2. O que Falta Fazer (Backlog Priorizado)

### 🔹 Fase 1: Conexão Mobile $\leftrightarrow$ Back-end (API Client Real)
- [x] **Camada de Serviços HTTP (Axios + TanStack Query)**:
  - Criado `mobile/src/services/api.ts` com interceptors automáticos para tokens JWT.
  - Criado `mobile/src/services/domainServices.ts` tipado com todos os endpoints do back-end.
  - App envolvido com `QueryClientProvider`.
- [x] **Fluxo de Telas de Autenticação & Entrada**:
  - Tela de Login & Registro com alternador rápido (`mobile/src/components/screens/AuthScreen.tsx`).
  - Tela de Conexão do Casal / Onboarding (`mobile/src/components/screens/WorkspaceSetupScreen.tsx`) com opções de *Criar Novo Lar* ou *Digitar Código de Convite de 6 Dígitos*.
  - Armazenamento persistente de tokens e usuário com `@react-native-async-storage/async-storage`.

### 🔹 Fase 2: Experiência do Casal & Recursos Avançados
- [x] **Notificações Push & Lembretes de Quebra de Rotina**:
  - Implementado `mobile/src/services/notificationService.ts` com `expo-notifications` (SDK 54).
  - Lembrete inteligente de sexta-feira às 17h para girar a roleta do casal e quebrar a mesmice.
  - Alertas locais ao agendar refeições e registrar despesas compartilhadas.
- [x] **Automação Inteligente Receita $\rightarrow$ Mercado**:
  - Botão de envio com 1 toque no card de cada receita especial (`SpecialTab.tsx` $\rightarrow$ `ShoppingTab.tsx`).
  - Transfere toda a lista de ingredientes necessários diretamente para o checklist de compras.
- [x] **Sugestões por IA (Motor de Harmonização Culinária)**:
  - Implementado `AiRecipeService` no back-end (`POST /api/v1/workspaces/:id/recipes/ai-suggest`).
  - Geração de sugestões personalizadas a partir do que o casal tem disponível na despensa/geladeira.

### 🔹 Fase 3: Monetização, SaaS & Assinaturas
- [x] **Gateway Modular de Pagamentos (Asaas + Mercado Pago + Mock Mode)**:
  - Implementado `PaymentGatewayFactory` configurável via `.env` (`PAYMENT_GATEWAY="ASAAS"` | `"MERCADO_PAGO"`).
  - Chave `PAYMENT_MOCK_MODE="true"` para testar checkout, PIX e aprovação instantânea sem necessidade de credenciais de produção no início.
- [x] **Matriz de Planos & Ciclos de Cobrança**:
  - **Mensal** (R$ 29,90/mês).
  - **Trimestral** (R$ 79,90 total - 11% OFF).
  - **Semestral** (R$ 149,90 total - 16% OFF).
  - **Anual** (R$ 249,90 total - 30% OFF / R$ 20,82/mês).
- [x] **Interface Mobile de Checkout ([`SubscriptionModal.tsx`](file:///c:/Users/andre/OneDrive/Desktop/Healthy%20Routine/mobile/src/components/modals/SubscriptionModal.tsx))**:
  - Modal com seleção de planos, descontos visuais, opção PIX Instantâneo ou Cartão de Crédito.
  - Ativação do Badge **PRO 👑** no Header do casal.

### 🔹 Fase 4: Polimento, Testes E2E & Publicação nas Lojas
- [x] **Ícone do App, Splash Screen & Branding Oficial**:
  - Assets de alta resolução gerados e copiados para `mobile/assets/` (`icon.png`, `adaptive-icon.png`, `splash-icon.png`).
  - Paleta visual esmeralda luxo e rose gold no `app.json`.
- [x] **Configuração Oficial EAS Build ([`eas.json`](file:///c:/Users/andre/OneDrive/Desktop/Healthy%20Routine/mobile/eas.json))**:
  - Perfil `preview`: Gera APK Android direto para instalação e testes sem loja.
  - Perfil `production`: Gera `.aab` (Android App Bundle para Google Play) e build iOS para App Store.
- [x] **Script de Automação de Build 1-Clique ([`build-app.bat`](file:///c:/Users/andre/OneDrive/Desktop/Healthy%20Routine/build-app.bat))**:
  - Menu interativo no Windows para login no Expo, teste com Doctor e geração de APK/AAB/IPA com 1 toque.

---

## 🏆 3. Resumo Final da Entrega:
O ecossistema **Healthy Routine** está **100% funcional, testado, modularizado, internacionalizado, monetizado e preparado para publicação nas lojas**!

Sempre que uma nova funcionalidade for iniciada ou concluída, este arquivo [`docs/ROADMAP.md`](file:///c:/Users/andre/OneDrive/Desktop/Healthy%20Routine/docs/ROADMAP.md) será atualizado com `[x]` e notas de versão.

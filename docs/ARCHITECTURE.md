# Healthy Routine - Architecture & Engineering Standards (Source of Truth)

## 1. Executive Summary & Vision

**Healthy Routine** is a cross-platform companion application designed for couples and households to break routine monotony, streamline daily planning, balance healthy meal prep with exciting culinary experiences, and foster shared lifestyle harmony. 

The system is built from day one as a commercial-grade, multi-tenant SaaS ready for distribution on the **Apple App Store** and **Google Play Store**, with architectural readiness for web/smart displays (e.g., Echo Show / kitchen wall tablets).

---

## 2. Tech Stack & Engineering Decisions (Industry Gold Standard)

| Layer | Technology | Rationale & Industry Precedent |
| :--- | :--- | :--- |
| **Mobile App (Stores & Multiplatform)** | **React Native + Expo (TypeScript)** | Industry standard for top consumer apps (Coinbase, Shopify, Discord). Provides native 60/120fps performance on iOS and Android, OTA updates via EAS, and simultaneous Web support via Expo Router for wall tablets. |
| **Back-end Web Framework** | **Fastify + TypeScript** | 2x-5x faster than Express, built-in schema validation support, native async/await, modular plugin architecture, and first-class TypeScript typing. |
| **ORM & Database Layer** | **Prisma ORM + PostgreSQL** | Strongest type-safety in the Node ecosystem, seamless migrations, connection pooling, and rich Client Extensions for automatic audit logging. |
| **Data Validation & Typing** | **Zod** | Single source of truth for runtime validation and static TypeScript types (`z.infer<T>`). |
| **Structured Logging** | **Pino (JSON)** | Zero-overhead, highly performant JSON logger with Request ID correlation and zero-maintenance cloud integration (Better Stack / Axiom / Sentry). |
| **Audit & Activity Tracking** | **Node.js `AsyncLocalStorage` + Prisma Extension** | 100% automated change capture with zero manual boilerplate in controllers or services. |
| **Internationalization** | **i18n (English default + pt-BR)** | Native internationalization in both mobile and backend error catalogs. |

---

## 3. System Architecture & Boundaries

```mermaid
graph TD
    subgraph Clients ["Client Applications"]
        iOS[iOS App - App Store]
        Android[Android App - Play Store]
        Web[Kitchen Display / Web PWA]
    end

    subgraph API Gateway / HTTP ["Back-end Fastify API"]
        Router[HTTP Router & Middleware]
        ReqCtx[AsyncLocalStorage Context / Request ID]
        ZodVal[Zod Validation Pipeline]
    end

    subgraph Business Logic ["Core Domain (Clean Architecture)"]
        AuthUC[Auth & Session Use Cases]
        WorkspaceUC[Workspace & Member Multi-tenancy Use Cases]
        MealUC[Meal Plan & Recipe Use Cases]
        ActivityUC[Activity Feed Use Cases]
        BillingUC[Subscription & In-App Purchase Use Cases]
    end

    subgraph Data Access ["Persistence & Logging"]
        Prisma[Prisma Client + Auto-Audit Extension]
        DB[(PostgreSQL Database)]
        Logger[Pino JSON Logger]
    end

    iOS --> Router
    Android --> Router
    Web --> Router
    Router --> ReqCtx --> ZodVal --> Business Logic
    Business Logic --> Prisma
    Prisma --> DB
    Router --> Logger
    Prisma --> Logger
```

---

## 4. Multi-Tenant Data Isolation & Security Rules

1. **Workspace Boundary**: Every business entity (`MealPlan`, `Recipe`, `ActivityLog`, `Expense`) strictly belongs to a `workspaceId`.
2. **Access Control Middleware**: No controller or use case may execute data queries without validating that the authenticated `userId` is an active member of the targeted `workspaceId`.
3. **Immutability of Audit Trails**: `ActivityLog` records can only be created by the automated audit engine; they cannot be updated or deleted by users.

---

## 5. Directory Structure & Conventions

```
Healthy Routine/
├── docs/                      # Architectural specs and diagrams
│   ├── ARCHITECTURE.md        # This file (Source of Truth)
│   ├── DATABASE.md            # Schema and entity relationships
│   └── API_SPEC.md            # REST API contract & error codes
├── back-end/                  # Fastify + TypeScript + Prisma API
│   ├── prisma/                # Database schema and migrations
│   └── src/
│       ├── @types/            # Ambient TypeScript declarations
│       ├── core/              # Domain entities, value objects & base classes
│       ├── modules/           # Feature modules (auth, workspaces, meals, activity, billing)
│       │   └── [feature]/
│       │       ├── dtos/      # Zod schemas (input/output validation)
│       │       ├── use-cases/ # Pure business logic
│       │       └── http/      # Fastify controllers & routes
│       └── shared/            # Cross-cutting concerns (logger, context, errors, prisma)
│           ├── context/       # AsyncLocalStorage request context
│           ├── errors/        # AppError hierarchy & i18n messages
│           ├── infra/         # Fastify server bootstrap & plugins
│           └── prisma/        # Extended Prisma client with auto-audit
├── mobile/                    # React Native + Expo (TypeScript)
│   ├── app/                   # Expo Router navigation (file-based)
│   ├── src/
│   │   ├── components/        # Reusable UI components (design system)
│   │   ├── hooks/             # Custom React hooks & TanStack Query
│   │   ├── services/          # API client (Axios/Ky) with interceptors
│   │   ├── stores/            # Global state (Zustand)
│   │   └── i18n/              # Translation keys (en, pt-BR)
└── AGENTS.md                  # Project instructions for AI Pair Programming
```

# Healthy Routine - Engineering Standards & Guidelines for AI/Developers

This document serves as the permanent guide and rules of engagement for developing within the **Healthy Routine** codebase.

---

## 1. Core Principles & Philosophy

1. **Clean Architecture & Separation of Concerns**:
   - HTTP/Transport Layer $\rightarrow$ Use Cases (Business Logic) $\rightarrow$ Repositories / ORM.
   - Never write business rules directly inside Fastify route handlers or controllers.
2. **Multi-Tenant Security by Default**:
   - Never execute a query without scoping by `workspaceId`.
   - Always verify that the authenticated user belongs to the requested workspace.
3. **Strict Validation via Zod**:
   - Validate every HTTP input (body, params, query) using Zod.
   - Export and reuse Zod-inferred types (`z.infer<T>`).
4. **Automated Audit & Observable Systems**:
   - Do not manually log `ActivityLog` entries in controllers; rely on the `AsyncLocalStorage` + Prisma Client Extension pipeline.
   - Use structured logging via Pino (`req.log.info({ ... })` or global logger). Never use `console.log`.
5. **Internationalization (i18n)**:
   - All code, comments, commit messages, and API error codes must be in **English**.
   - User-facing text must support translation keys with English as the fallback and `pt-BR` fully supported.

---

## 2. API Conventions

- **RESTful Endpoints**:
  - `POST /api/v1/auth/register` - Create user account
  - `POST /api/v1/auth/login` - Authenticate and issue JWT + Refresh Token
  - `POST /api/v1/workspaces` - Create workspace
  - `POST /api/v1/workspaces/join` - Join workspace via invite code
  - `GET /api/v1/workspaces/:workspaceId/meals/today` - Today's meal snapshot
  - `GET /api/v1/workspaces/:workspaceId/meals/week?startDate=YYYY-MM-DD` - Weekly plan
  - `POST /api/v1/workspaces/:workspaceId/meals/batch` - Batch schedule meal prep
  - `GET /api/v1/workspaces/:workspaceId/activity` - Paginated activity feed
- **Standard Error Response Format**:
  ```json
  {
    "statusCode": 400,
    "error": "BAD_REQUEST",
    "message": "Invalid input provided",
    "details": [
      {
        "field": "date",
        "issue": "Expected valid ISO date format"
      }
    ],
    "requestId": "req-9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
  }
  ```

---

## 3. Technology Stack Summary

- **Back-end**: Node.js (v20+), TypeScript, Fastify, Prisma ORM, PostgreSQL, Zod, Pino, Vitest.
- **Mobile**: React Native, Expo, TypeScript, Expo Router, TanStack Query, Zustand, i18next.

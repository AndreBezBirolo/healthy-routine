# Healthy Routine - Database Schema & Data Dictionary (Source of Truth)

This document defines the PostgreSQL schema, relational integrity, indexing strategies, and automated audit rules using Prisma ORM.

---

## 1. Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ WorkspaceMember : "belongs to"
    User ||--o{ ActivityLog : "performs"
    User ||--o{ Session : "authenticates"
    
    Workspace ||--o{ WorkspaceMember : "has"
    Workspace ||--o{ MealPlan : "schedules"
    Workspace ||--o{ Recipe : "owns"
    Workspace ||--o{ ActivityLog : "tracks"
    Workspace ||--o{ Subscription : "subscribes"

    User {
        uuid id PK
        string email UK
        string name
        string passwordHash
        string avatarUrl
        string languagePreference "en | pt-BR"
        timestamp createdAt
        timestamp updatedAt
    }

    Session {
        uuid id PK
        uuid userId FK
        string refreshTokenHash
        string userAgent
        string ipAddress
        timestamp expiresAt
        timestamp createdAt
    }

    Workspace {
        uuid id PK
        string name
        string inviteCode UK
        uuid ownerId FK
        timestamp createdAt
        timestamp updatedAt
    }

    WorkspaceMember {
        uuid id PK
        uuid workspaceId FK
        uuid userId FK
        enum role "OWNER | ADMIN | MEMBER"
        timestamp joinedAt
    }

    MealPlan {
        uuid id PK
        uuid workspaceId FK
        date date
        enum mealType "BREAKFAST | LUNCH | DINNER | SNACK"
        boolean isMealPrep "True = Batch/Marmita"
        boolean isSpecial "True = Break Monotony / Gourmet"
        string recipeTitle
        text notes
        uuid assignedToUserId FK "Optional: who is cooking"
        timestamp createdAt
        timestamp updatedAt
    }

    Recipe {
        uuid id PK
        uuid workspaceId FK
        string title
        enum category "GOURMET | QUICK | WEEKEND | DESSERT | DRINK"
        jsonb ingredients "Array of {name, quantity, unit}"
        text instructions
        integer prepTimeMinutes
        boolean isFavorite
        timestamp createdAt
        timestamp updatedAt
    }

    ActivityLog {
        uuid id PK
        uuid workspaceId FK
        uuid userId FK "Nullable for system events"
        enum action "CREATE | UPDATE | DELETE"
        enum entity "MEAL_PLAN | RECIPE | WORKSPACE | SUBSCRIPTION"
        string entityId
        jsonb changes "{old: ..., new: ...}"
        timestamp createdAt
    }

    Subscription {
        uuid id PK
        uuid workspaceId FK UK
        enum status "TRIAL | ACTIVE | PAST_DUE | CANCELED"
        enum planType "FREE | PRO_MONTHLY | PRO_ANNUAL"
        enum storeProvider "REVENUECAT | APPLE_STORE | GOOGLE_PLAY | STRIPE"
        string externalCustomerId
        string externalSubscriptionId
        timestamp currentPeriodEnd
        timestamp createdAt
        timestamp updatedAt
    }
```

---

## 2. Key Indexes & Performance Optimization

1. **`MealPlan`**:
   - Index: `[workspaceId, date]` - Crucial for rapid "Today's View" and "Week Range" queries.
2. **`WorkspaceMember`**:
   - Unique Index: `[workspaceId, userId]` - Prevents duplicate memberships.
3. **`ActivityLog`**:
   - Index: `[workspaceId, createdAt DESC]` - Powers the real-time activity feed pagination.
4. **`Workspace`**:
   - Unique Index: `[inviteCode]` - Instant lookup when a partner joins.

---

## 3. Automated Audit Engine Rules & Performance Strategy

To ensure lightning-fast retrieval on mobile devices (sub-50ms) with zero query overhead as data grows:

1. **Compact Delta Diffing (Not Full Dumps)**:
   - The audit extension computes a minimal field-level diff rather than storing whole entity dumps.
   - Example payload stored in `changes`:
     ```json
     {
       "field": "recipeTitle",
       "old": "Chicken with Sweet Potato",
       "new": "Mushroom & Leek Risotto"
     }
     ```
2. **Strict Separation of Concerns**:
   - **`ActivityLog` (Database Table)**: ONLY stores user-facing domain events for the couple's activity feed (~5-15 rows/day per household, negligible storage footprint).
   - **System & Technical Logs (Pino / HTTP / Errors)**: Streamed to stdout and external log collectors (Better Stack / Sentry). NEVER written to relational database tables.
3. **Cursor-Based Pagination**:
   - All feed queries MUST use cursor-based pagination (`where: { workspaceId, createdAt: { lt: cursor } }`) utilizing the `[workspaceId, createdAt DESC]` B-Tree index, avoiding expensive `OFFSET` scans.
4. **Data Retention & Monetization Hook**:
   - Free tier workspaces retain up to 30 days of activity history.
   - Pro tier workspaces unlock full unlimited history.

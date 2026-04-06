# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── buttler/            # Buttler: Bidet & Restroom Finder React PWA (at /)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── db/                 # Drizzle ORM schema + DB connection
│   └── replit-auth-web/    # useAuth() hook for browser OIDC auth state
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## Apps

### Buttler: Bidet & Restroom Finder (`artifacts/buttler`)

React + Vite PWA served at `/`. Maps all 1168 restroom locations in Dumaguete City, Philippines (118 with bidets, 91 public).

- **Map**: Dual-color Leaflet markers — gold (#d97706) for bidet locations, blue-gray (#64748b) for others
- **Green checkmark overlay** on markers that have been audited by a Guardian
- **Search bar** — filter by name or address
- **Filter toggles** — "Bidets Only" and "Public Only"
- **Popups** — show name, address, access type, fee, bidet badge, verified/unverified badge, Get Directions link; auth-gated "Audit this Restroom" button
- **Guardian Audit modal** — 5 checkboxes (PWD Accessible, Soap, Toilet Seat, Tissue, Functional Bidet) + remarks textarea + tier classification
- **Verified/Unverified badges** — green "Verified by Guardian" vs. "Unverified / Community Data"
- **Sidebar list** — RestroomCard component shows access badge, fee, bidet badge, distance, directions
- Uses `useGetRestrooms`, `useGetAudits` hooks from `@workspace/api-client-react`
- PWA with offline support via vite-plugin-pwa and Workbox
- Replit Auth (OIDC) login/logout via `useAuth()` from `@workspace/replit-auth-web`

**Key frontend files:**
- `src/pages/Home.tsx` — main page with search, filter state, audit modal management
- `src/components/Map.tsx` — Leaflet map with dual markers, popups, audit button
- `src/components/AuditModal.tsx` — Guardian Audit form modal
- `src/components/RestroomCard.tsx` — sidebar list card

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`).
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS (credentials: true), cookie-parser, authMiddleware, routes at `/api`
- `src/routes/restrooms.ts` — `GET /restrooms` — returns all 1168 restroom locations from `src/data/restrooms.ts`
- `src/routes/audits.ts` — `GET /audits` (grouped by restroomId), `POST /audits` (auth-required Guardian Audit)
- `src/routes/auth.ts` — OIDC login/callback/logout + `GET /auth/user`
- `src/data/restrooms.ts` — generated TypeScript array of 1168 restrooms from CSV (name, lat, lng, address, access, fee, bidet)
- Auth: `src/lib/auth.ts` — session CRUD, OIDC config, user upsert (openid-client v6)
- Middleware: `src/middlewares/authMiddleware.ts` — loads session user on every request

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL.

- `src/schema/audits.ts` — `restroom_audits` table (userId, restroomId, restroomName, lat, lng, 5 boolean checks, remarks, tierStatus, createdAt)
- `src/schema/auth.ts` — sessions and users tables
- Run `pnpm --filter @workspace/db run push` to push schema changes

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and Orval config. Schemas: `RestroomLocation`, `CreateAuditBody`, `AuditRecord`, `AuditSummaryMap`, auth schemas.

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks: `useGetRestrooms`, `useGetAudits`, `useCreateAudit`, auth hooks.

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec.

### `scripts` (`@workspace/scripts`)

Utility scripts package. Run via `pnpm --filter @workspace/scripts run <script>`.

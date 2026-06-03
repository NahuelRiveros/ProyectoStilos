# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev   # nodemon hot-reload
npm start     # production
```

No test runner, no lint script.

## Stack

Node.js ES Modules (`"type": "module"`), Express 5, Sequelize 6, PostgreSQL. Deployed to **Render** (backend) + **Vercel** (frontend).

## Architecture

```
routes/ → middleware/ → controllers/ → services/ → models/
```

**Entry:** `src/server.js` → connects DB → bootstrap (sync + seed) → cron → `createApp()` → listen.

**App factory:** `src/app.js` — helmet, compression, morgan, CORS (callback, never `origin:true`), `/api` mount, React SPA fallback (`../../frontend/dist`).

## Request flow with middleware stack

```
POST /api/catalogos/roles
  → requireAuth         (validates JWT, sets req.user)
  → requireAccess(...)  (checks req.user.nivel or req.user.roles_abr)
  → verificarSuscripcion (blocks writes if VENCIDO/SIN_SUSCRIPCION)
  → protegerRolSistema  (blocks edits on ADM/USR)
  → generic controller  → generic service → Sequelize
```

## Auth endpoints (`/api/auth`)

Always exempt from `verificarSuscripcion`. Key routes:
- `POST /login` — rate limited (10/15min per IP+email)
- `POST /register` — always assigns USR, ignores `rol_abreviatura`
- `GET  /me` — JWT data
- `PUT  /cambiar-password` [auth] — requires `password_actual` + `password_nuevo`
- `POST /forgot-password` — rate limited, sends email (gracefully skips if SMTP unconfigured)
- `GET  /verify-reset-token/:token` — validate before showing form
- `POST /reset-password`

## Users endpoints (`/api/usuarios`)

- `GET  /perfil` [auth] — own full profile from DB (fresher than /me)
- `GET  /` [ADM] — list all
- `POST /` [ADM] — create (respects `rol_abreviatura`, wraps in transaction)
- `PUT  /:id` [ADM] — update data
- `PUT  /:id/password` [ADM] — admin resets password (no current password needed)
- `PUT  /:id/roles` [ADM] — replace all active roles `{ roles: ["ADM"] }`
- `POST /:id/roles/:abreviatura` [ADM] — add one role
- `DELETE /:id/roles/:abreviatura` [ADM] — revoke one role (protected: min 1 role)
- `PUT  /:id/reactivar` [ADM]
- `DELETE /:id` [ADM]

Super admin (`SUPER_ADMIN_EMAIL`) is protected from all destructive operations.

## Role system (N:N)

```
AUTH_02_USUARIO ──< AUTH_05_USUARIO_ROL >── AUTH_01_ROL
```

Each role has `AUTH01_NIVEL` (0-100). The JWT carries:
```json
{ "roles_abr": ["ADM"], "nivel": 100, "roles": ["Administrador"], ... }
```

**Access control** — two middleware options, pick per route:
- `requireAccess({ nivel: 50 })` → any role with nivel ≥ 50 (scalable for STF1, STF2…)
- `requireAccess({ roles: ["ADM","CAJ"] })` → exact abbreviation match

All config in `src/routes/access_roles.js`:
- `NIVELES.ADMIN = 100`, `NIVELES.STAFF = 50`, `NIVELES.USR = 10`
- `ROLES.ADMIN = "ADM"`, `ROLES.USR = "USR"` (project adds its own)
- `ACCESS` matrix maps each action to `{ nivel }` or `{ roles }`

**Seeded roles:** ADM (100) + USR (10). Project-specific roles go in `seed_auth_roles.js`.

**System roles** (ADM, USR) are protected from edit/delete in `catalogos_routes.js`.

## Subscription system

`AUTH_06_SUSCRIPCION` — single record updated on each renewal.

**States** (calculated dynamically, no cron needed):
- `ACTIVO` — `fecha_fin >= today`
- `GRACIA` — expired + `day_of_month <= AUTH06_DIAS_GRACIA` (default 10)
- `VENCIDO` — expired + past grace days

**Middleware `verificarSuscripcion`:** GET always passes; POST/PUT/DELETE return 402 when VENCIDO. Has 5-min in-memory cache invalidated on renewal.

**Admin routes** (`/api/admin`) — always exempt from subscription check:
- `GET  /admin/suscripcion`
- `POST /admin/suscripcion/activar` — `{ dias: 30, notas?: "..." }`
- `PUT  /admin/suscripcion/gracia` — `{ dias_gracia: 10 }`

## Generic CRUD pattern

All simple catalogs use factory functions instead of per-model controllers:

```js
const MI_CONFIG = {
  model:          MiModelo,
  nombre:         "items",
  where:          { FECHA_BAJA: null },        // filter actives
  attributes:     ["ID", "NOMBRE"],
  campoBusqueda:  "NOMBRE",                    // ?q= search
  campoFechaBaja: "FECHA_BAJA",
  createFields:   ["NOMBRE"],
  updateFields:   ["NOMBRE"],
};
router.get("/",    requireAuth, requireAccess(ACCESS.GET),    crearListController(MI_CONFIG));
router.post("/",   requireAuth, requireAccess(ACCESS.CREATE), crearCreateController(MI_CONFIG));
// etc.
```

To add a new catalog: create model → export in `models/index.js` → add to `bootstrap.js` → define CONFIG and register routes in `catalogos_routes.js`.

## Adding a module to a new project

1. `POST /api/catalogos/roles` — create project roles with correct `AUTH01_NIVEL`
2. Add abbreviations to `ROLES` in `access_roles.js`
3. Add `ACCESS.MI_MODULO_GET = { nivel: NIVELES.STAFF }` etc.
4. Create model, service, controller, router
5. Mount router in `routes/index.js` after `router.use(verificarSuscripcion)`

## Key conventions

- **Soft delete:** `*_FECHABAJA` column (null = active, date = deleted)
- **Columns:** `ID_*` (PK), `RELA_*` (FK), `*_FECHAALTA`/`*_FECHABAJA`
- **Tables:** `AUTH_*` (auth domain), `PERS_*` (people domain)
- **API responses:** `{ ok: true/false, mensaje, data }` — use `src/utils/api_response.js`
- **Transactions:** use `sequelize.transaction()` when creating across multiple tables
- **Cron jobs:** add to `src/cron/`, register in `server.js`

## Deployment (Render)

Render injects `DATABASE_URL` automatically. Required env vars:
`JWT_SECRET`, `CORS_ORIGIN`, `NODE_ENV=production`, `DB_SSL=true`, `SUPER_ADMIN_EMAIL`, `SEED_SECRET`.

`APP_NAME` and `APP_FULL_NAME` appear in email subjects and health endpoint — set per project.

Graceful shutdown: `process.on('SIGTERM')` in `server.js` closes the HTTP server before exit.

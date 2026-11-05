# Sparka Solutions - Website & Discovery (Phase 1)

React frontend on **Zoho Catalyst Slate** + Express API on **Zoho Catalyst AppSail**.

```
sparka/
├── catalyst.json            Catalyst project config (Slate app + AppSail service)
├── frontend/                React + Vite + React Router + Zustand + Axios  →  Slate
│   ├── public/images/       Brand logo and fleet photography (from the V7 prototype)
│   └── src/
│       ├── app/             Router
│       ├── shared/          api/ (axios client) · layout/ · components/ · store/ · styles/ · data/
│       └── features/
│           ├── home/        Landing page sections
│           ├── solutions/   Solutions & approach
│           ├── discovery/   Three-path Discovery: api/ · store/ · lib/ · components/ · pages/
│           ├── contact/     Contact & consultation
│           ├── legal/       Privacy / Terms placeholders
│           └── not-found/
└── backend/                 Express  →  AppSail
    ├── app-config.json      AppSail runtime config
    └── src/
        ├── config/          Environment config
        ├── core/            Errors, validation, middleware (rate limit, admin auth, error handler)
        ├── repositories/    memory (local JSON file) | catalyst (Data Store)
        ├── integrations/    zoho-crm/  Lead + Note + rep Task on every submission
        └── modules/
            ├── discovery/   Approved question library, drafts (save/resume), organize, submit
            ├── consultation/ "Let's Talk" requests
            ├── submissions/ Shared reference numbers, "Here's what we heard", CRM sync & retry
            ├── admin/       List submissions / retry failed CRM syncs (x-admin-key)
            └── health/
```

## Run locally

```bash
# API  (http://localhost:9000)
cd backend && cp .env.example .env && npm install && npm run dev

# Web  (http://localhost:5173, proxies /api to :9000)
cd frontend && npm install && npm run dev
```

Without Zoho credentials, submissions are stored in `backend/.data/store.json` and CRM sync is marked `skipped`.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Status |
| GET | `/api/discovery/questions` | Management-approved question library |
| POST | `/api/discovery/organize` | Organize free text into suggested fields (customer confirms) |
| POST / GET / PUT | `/api/discovery/drafts[/:token]` | Save & resume |
| POST | `/api/discovery/submissions` | Submit Guide Me / Describe |
| POST | `/api/consultations` | Let's Talk request |
| GET | `/api/admin/submissions?crmStatus=failed` | Failed-sync visibility (header `x-admin-key`) |
| POST | `/api/admin/submissions/:reference/retry-crm` | Retry CRM sync |

## Deploy to Catalyst

1. `npm i -g zcatalyst-cli`, then `catalyst login` and `catalyst init` in this folder (select the project).
2. **AppSail**: `catalyst appsail:add` pointing to `backend/` (Node.js, Catalyst-managed runtime). In the console, set env vars from `backend/.env.example` (`STORE_DRIVER=catalyst`, `CORS_ORIGINS=<your Slate URL>`, Zoho credentials, `ADMIN_API_KEY`).
3. **Data Store**: create tables `DiscoveryDrafts` (token, payload, expires_at) and `Submissions` (reference, route, payload, crm_status, crm_lead_id, crm_error). See `backend/src/repositories/catalyst.repository.js`.
4. **Slate**: `catalyst slate:link` pointing to `frontend/` (React + Vite, build command `npm run build`, output `dist`). Set `VITE_API_BASE_URL=<AppSail URL>/api`. Configure SPA fallback to `index.html`.
5. `catalyst deploy`.

The Catalyst CLI may rewrite `catalyst.json` and generate Slate's `cli-config.json` when you link. Keep what it generates.

## Zoho CRM

Create a self-client in the Zoho API console with scope `ZohoCRM.modules.ALL`. Generate a refresh token and set `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN` and `ZOHO_DC`. `ZOHO_LEAD_ASSIGNMENT_RULE_ID` routes leads to a representative, and `ZOHO_LEAD_SOURCE` must match a Lead Source picklist value.

## Notes

- The website never sends estimates or proposals. Each submission creates a CRM task for a representative to recap with the customer first.
- To change the question library (`backend/src/modules/discovery/data/question-library.json`), management must approve it. Guide Me asks at most 7 questions plus optional extended ones.
- The fleet photos came from the prototype and are low resolution. Replace them with final photography before launch.

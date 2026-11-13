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
        ├── integrations/    zoho-crm/  Lead via the Zoho Web-to-Lead form on every submission
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
| GET | `/api/chat/status` | Whether the product assistant is configured (`{ enabled }`) |
| POST | `/api/chat` | Product assistant: send `{ messages }`, receive a Server-Sent Events stream (`text`, `products`, `lead`, `error`, `done`) |
| GET | `/api/admin/products` | Full product catalog (header `x-admin-key`) |
| POST | `/api/admin/products/import` | Import or update up to 500 products by SKU (header `x-admin-key`) |

## Product assistant

The chat widget's **Ask a question** mode is an AI assistant that searches the product catalog and hands interested visitors to a representative (it creates a normal submission with route `chat`, so the CRM Lead is created as for the other paths). The **Guided questions** mode is the scripted Discovery chat and is also the fallback whenever the assistant is unavailable.

- **Powered by** OpenAI's Responses API with `store: false` (chats are not kept on OpenAI's side). Set `OPENAI_API_KEY` and `CHAT_MODEL` (an OpenAI model ID from your account's model list). Chat stays off until both are set; `CHAT_ENABLED=false` switches it off. To change model, change `CHAT_MODEL` and restart; if a non-reasoning model rejects requests, set `CHAT_ENCRYPTED_REASONING=false`.
- **No prices, by design.** Products have no price field and the assistant is instructed never to quote prices or estimates, matching the rule below.
- **Limits:** 1,000 characters per message, the last 20 messages of history, 6 model calls per turn, 20 messages per 10 minutes per IP.
- **Live check:** with the API running and your key set, `node backend/scripts/chat-smoke.mjs` asks five fixed questions (it calls the real model and costs a little) so you can check the answers by eye.

### Product catalog

Locally, the catalog starts from placeholder products in `backend/src/modules/products/data/products.seed.json`. In production, create a Data Store table **`Products`** with columns `sku` (varchar 64, unique), `category` (varchar 60), `active` (boolean) and `payload` (text), then import real products:

```bash
curl -X POST "$API/api/admin/products/import" \
  -H "x-admin-key: $ADMIN_API_KEY" -H "Content-Type: application/json" \
  -d '{"products":[
    {"sku":"CAM-100","name":"Dual dash cam","brand":"Acme","category":"Cameras & Safety",
     "summary":"Road + cab camera","description":"...","specs":{"Channels":"2"},
     "vehicleTypes":["Light-duty vans / pickups"],"tags":["dash cam"]},
    {"sku":"GPS-200","name":"Plug-in GPS tracker","category":"GPS & Telematics","summary":"Live location and trips"}
  ]}'
```

`category` must be one of the approved categories in the question library; `vehicleTypes` must use the question library's vehicle types. Rows that fail validation are reported back in `rejected` and the rest are imported. Set `"active": false` to hide a product. The API caches the catalog for 5 minutes (an import clears the cache).

## Deploy to Catalyst

1. `npm i -g zcatalyst-cli`, then `catalyst login` and `catalyst init` in this folder (select the project).
2. **AppSail**: `catalyst appsail:add` pointing to `backend/` (Node.js, Catalyst-managed runtime). Copy `backend/app-config.example.json` to `backend/app-config.json` and fill in the secrets; `app-config.json` is gitignored and must never be committed. In the console, set env vars from `backend/.env.example` (`STORE_DRIVER=catalyst`, Zoho credentials, `ADMIN_API_KEY`, and for the assistant `OPENAI_API_KEY` + `CHAT_MODEL`). After the first deploy, check that chat replies stream word by word through AppSail (the API sends `X-Accel-Buffering: no`).
3. **Data Store**: create tables `DiscoveryDrafts` (token, payload, expires_at), `Submissions` (reference, route, payload, crm_status, crm_lead_id, crm_error) and `Products` (sku, category, active, payload). See `backend/src/repositories/catalyst.repository.js`.
4. **Slate**: `catalyst slate:link` pointing to `frontend/` (React + Vite, build command `npm run build`, output `dist`). Set `VITE_API_BASE_URL=<AppSail URL>/api`. Configure SPA fallback to `index.html`.
5. `catalyst deploy`.

The Catalyst CLI may rewrite `catalyst.json` and generate Slate's `cli-config.json` when you link. Keep what it generates.

## Zoho CRM

Leads are created through the Zoho CRM **Web-to-Lead form** (no API credentials). Set `ZOHO_WEBFORM_XNQSJSDP` and `ZOHO_WEBFORM_XMIWTLD` from the hidden inputs of the generated form code; leave them blank to skip CRM. Zoho only saves fields that are on the webform: when you add fields in the webform builder, regenerate the code and add each input name to `WEBFORM_FIELDS` in `backend/src/integrations/zoho-crm/webform.js` (the Lead values are built in `crm.service.js` and `lead-fields.js`). The webform cannot create Notes or Tasks, and does not return the Lead ID; use a CRM workflow rule on new website Leads to create the representative task.

## Notes

- The website never sends estimates or proposals. A representative recaps with the customer first (set up a CRM workflow rule on new website Leads to create that task).
- To change the question library (`backend/src/modules/discovery/data/question-library.json`), management must approve it. Guide Me asks at most 7 questions plus optional extended ones.
- The fleet photos came from the prototype and are low resolution. Replace them with final photography before launch.

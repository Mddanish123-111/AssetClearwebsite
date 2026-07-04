# AssetClear

Operations platform for office dismantling / clearance businesses: track clearance jobs,
log removed inventory, route each asset to its disposition (resell, donate, recycle,
e-waste, landfill, or data destruction), and issue compliance certificates.

This is **Milestone 1** of a multi-milestone build. See [Roadmap](#roadmap) below.

## Stack

- **Frontend:** Next.js 15 (App Router, pinned to `15.5.9` — patches both
  the critical RSC RCE CVE-2025-66478/CVE-2025-55182 and the follow-up
  CVE-2025-67779/CVE-2025-55184 DoS), React 19.2.2, TypeScript, Tailwind CSS
- **Backend:** Express.js, TypeScript, Zod validation, JWT auth
- **Database:** PostgreSQL + Prisma ORM
- **Monorepo:** npm workspaces (`apps/web`, `apps/api`, `packages/db`)

> **Security note:** Next.js/React Server Components had two rounds of
> critical vulnerabilities disclosed in Dec 2025 (RCE, then a DoS/source
> exposure follow-up). This project pins fully patched versions. Before you
> deploy, run `npm outdated` and check
> https://nextjs.org/blog/security-update-2025-12-11 for anything newer.

## Project structure

```
assetclear/
├── apps/
│   ├── web/                # Next.js frontend
│   │   └── src/
│   │       ├── app/        # App Router pages (login, dashboard, jobs, clients)
│   │       ├── components/ # AppShell (nav), StatusChip
│   │       └── lib/        # api.ts — typed fetch client
│   └── api/                # Express backend
│       └── src/
│           ├── routes/     # auth, clients, jobs, assets
│           ├── middleware/ # requireAuth, requireRole, error handling
│           └── lib/env.ts  # validated environment config
├── packages/
│   └── db/                 # Prisma schema, client singleton, seed script
├── docker-compose.yml       # local Postgres
└── DESIGN.md                # visual design token rationale
```

## Deploying: Netlify (frontend) + Render (API + Postgres)

Netlify runs the Next.js frontend natively but can't run a persistent Express
server (its Functions are stateless, 60-second-limited serverless functions —
fine for small tasks, not for a running API with a pooled DB connection). So
the API and database go to Render, and Netlify calls it over HTTPS.

### 1. Deploy the API + database to Render

1. Push this repo to GitHub.
2. In Render: **New → Blueprint**, point it at your repo. It reads
   `render.yaml` at the repo root and provisions the `assetclear-db` Postgres
   instance and the `assetclear-api` web service together.
3. The build step runs `prisma db push`, which syncs the schema straight to
   the database — no local terminal or pre-generated migration files
   needed. (Once the app is live with real data, switch to
   `prisma migrate dev` / `migrate deploy` for safer, versioned schema
   changes — `db push` is fine to get started but doesn't keep a history.)
4. Render auto-generates `JWT_SECRET` and wires `DATABASE_URL` from the new
   database. Edit the `CLIENT_ORIGIN` env var once you know your Netlify URL
   (step 2 below) — it must match exactly, including `https://`, for CORS
   to work.
5. On first deploy, run the seed once via Render's shell (Dashboard → your
   service → **Shell**):
   ```bash
   npm run db:seed
   ```
6. Note your API's URL, something like `https://assetclear-api.onrender.com`.

### 2. Deploy the frontend to Netlify

1. In Netlify: **Add new site → Import an existing project**, point it at
   the same repo.
2. In **Site configuration → Build & deploy → Build settings**, set:
   - **Base directory:** leave blank (must run from repo root, so npm
     workspace hoisting resolves `next` and other shared packages correctly)
   - **Package directory:** `apps/web`
3. `netlify.toml` at the repo root already sets the build command
   (`npm run build --workspace=apps/web`) and publish path. Don't add a
   `[[plugins]]` block for `@netlify/plugin-nextjs` — Netlify's Next.js
   Runtime auto-detects and installs itself, and pinning it manually has
   known path-resolution bugs in monorepos (this caused a
   `Cannot find module 'next/dist/server/lib/start-server.js'` crash during
   testing — the function bundler couldn't see `next` hoisted one level up
   when `base` was scoped to `apps/web`).
4. Set one environment variable in Netlify (Site settings → Environment
   variables):
   ```
   NEXT_PUBLIC_API_URL = https://assetclear-api.onrender.com/api
   ```
5. Deploy. Note your Netlify URL, e.g. `https://assetclear.netlify.app`.

### 3. Close the loop

Go back to Render and set `CLIENT_ORIGIN` to your real Netlify URL from step
3, then redeploy the API (env var changes require a redeploy on Render).
Without this, the browser will get CORS errors calling the API.

### Notes

- **This project is configured for Render's free tier** (no credit card
  needed). Two important limits to know:
  - The free web service **sleeps after 15 minutes of inactivity** — the
    first request after that takes 30-60 seconds to wake up. Normal after
    that.
  - The free Postgres database **expires 30 days after creation**, with a
    14-day grace period to upgrade before your data is deleted. Put a
    reminder on your calendar. When you're ready for something permanent,
    either upgrade the database's instance type in the Render dashboard
    (~$7/mo, no expiration) or switch `plan: free` to `plan: starter` in
    `render.yaml` for both the database and the web service (~$14/mo total,
    no sleep either).
- Any future schema change: run `prisma db push` again (or switch to
  `prisma migrate dev` / `migrate deploy` for versioned migrations once
  you're past prototyping).
- Rotate `JWT_SECRET` and any seeded demo passwords before real users touch
  this.

## Local development

### 1. Start Postgres

```bash
docker compose up -d
```

### 2. Configure environment

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# edit apps/api/.env — set a real JWT_SECRET
```

### 3. Install dependencies

```bash
npm install
```

### 4. Set up the database

```bash
npm run db:migrate   # creates tables from prisma/schema.prisma
npm run db:seed       # loads demo client, job, assets, and users
```

### 5. Run the app

```bash
npm run dev:api   # http://localhost:4000
npm run dev:web   # http://localhost:3000
```

Log in with the seeded admin account:

- **Email:** `admin@assetclear.io`
- **Password:** `ChangeMe123!`

(Ops manager and crew demo accounts use the same password —
see `packages/db/prisma/seed.ts`.)

## What's built in Milestone 1

- Full Prisma schema: Users/roles, Clients, Jobs, Assets, Certificates, Quotes,
  Invoices, audit log, status history
- JWT auth with role-based access control (Admin / Ops Manager / Crew / Client)
- REST API: auth, client CRUD, job CRUD + status transitions, asset CRUD +
  disposition updates
- Frontend: login, dashboard (dispatch board), job list/detail with live status
  pipeline and an inline asset-logging manifest, client list/detail
- Design system: industrial ops-console token set (see `DESIGN.md`)

## Roadmap

1. ✅ **Foundation** — auth, data model, dashboard shell, core CRUD
2. **Job workflow** — crew scheduling/assignment UI, before/after photo upload,
   site walkthrough checklist
3. **Disposition & compliance** — certificate PDF generation, disposal audit
   trail/export, regulatory reporting
4. **Commercial** — quote builder, e-signature acceptance, invoicing, payment status
5. **Client portal** — read-only job tracking + certificate downloads for the
   `CLIENT` role
6. **Admin analytics & deploy** — reporting dashboards, production deploy config
   (Docker images, CI, migrations in pipeline)

## Notes on production-readiness

Before shipping this to real users, still needed: automated tests (unit + API
integration), file/photo upload storage (S3-compatible), password reset flow,
audit logging wired into every mutation, rate-limit tuning, structured logging,
and a CI pipeline running `prisma migrate deploy` on release.

AGENTS.md — TanStack Start + Prisma CMS (Vercel)

A playbook for autonomous/collaborative AI agents (and humans) to build, ship,
and maintain a type‑safe CMS using TanStack Start (React), Prisma, and Vercel.

---

1. Goal & Non‑Goals

Goal: Ship a production‑ready CMS (blog-like, extensible pages, media, tags,
roles) with SSR/streaming, server functions, auth, and admin CRUD, deployable as
a single app on Vercel.

Non‑Goals: Build a multi‑repo microservices system; migrate legacy content;
implement WYSIWYG collaboration; build a marketing site beyond basic pages.

---

2. Architecture Snapshot

Framework: TanStack Start (file-based routing, SSR, streaming, server functions)

UI: React + Tailwind + shadcn/ui (optional)

Data: Prisma ORM → Postgres (Neon/Supabase/PlanetScale MySQL OK)

Auth: Lucia or Auth.js (session cookies)

Storage: S3-compatible (R2/S3/Wasabi) with signed uploads

Deployment: Vercel (target: 'vercel' in Vite plugin)

Testing: Vitest, Playwright

Observability: Vercel Analytics, Log Drains (optional)

Repo Layout

/app /routes # file-based routes (public + admin) /components # UI primitives
/styles # tailwind.css, globals /server # server-only modules (db, auth, rbac,
uploads) /lib # shared utils (schema, seo, formatting) /prisma schema.prisma #
models: User, Post, Tag, Media, Session, etc. /scripts # db seed, codegen
helpers /tests # unit + e2e /vite.config.ts /tailwind.config.ts
/postcss.config.js /README.md /AGENTS.md # this file

---

3. Environment & Secrets

Create .env (local) and Vercel project env vars:

DATABASE_URL= AUTH_SECRET= # session/cookie secret (32+ bytes) S3_ENDPOINT=
S3_ACCESS_KEY_ID= S3_SECRET_ACCESS_KEY= S3_BUCKET= APP_URL= # e.g.
https://mycms.vercel.app PRISMA_ACCELERATE_URL= # optional for serverless

---

4. Conventions

Type safety: Zod for input validation at boundaries (actions, loaders, API)

Naming: kebab-case routes; camelCase variables; PascalCase components

RBAC: Roles: ADMIN, EDITOR, AUTHOR, VIEWER

Content: Markdown or TipTap JSON stored in Post.content

Commits: Conventional Commits (feat:, fix:, chore:)

Branching: main (prod) ← dev (staging) ← short‑lived feature branches

---

5. Core Backlog (MVP)

1) Scaffold TanStack Start app; configure target: 'vercel'

2) Prisma models: User, Post, Tag, Media, Session

3) Auth (Lucia or Auth.js) with email/password (minimal) and sessions

4) RBAC middleware in beforeLoad

5) Admin CRUD routes for posts/tags/media

6) Public routes: /, /blog, /blog/$slug, /tags/$tag

7) Uploads: signed upload → S3 compatible

8) SEO: per-post metadata, sitemap.xml, robots.txt

9) Testing: unit for server functions, e2e happy path admin CRUD

10) Deploy on Vercel; set env; DB migrations; seed

Stretch: Content revisions, drafts preview links, search, pagination, image
proxy, webhooks for revalidation.

---

6. Agent Roster & Responsibilities

6.1 Product Agent (PA)

Define scope, accept criteria, UX flows, roadmap.

Maintain issue labels and priorities.

Prompts

Create initial PRD for CMS with admin CRUD for posts/tags/media, RBAC
(ADMIN/EDITOR/AUTHOR/VIEWER), and public blog with SEO. Include success metrics
and acceptance criteria.

Generate user flows for creating, editing, publishing a post (with cover image
and tags).

---

6.2 Frontend Agent (FE)

Build routes, components, forms, and SSR pages using TanStack Start.

Integrate TanStack Query for optimistic mutations in admin.

Tasks

Implement /admin/posts (list/create), /admin/posts/$id (edit/delete)

Build Form, Table, Editor, Uploader components

Public pages /blog, /blog/$slug with loader‑based SSR

Prompts

Implement a typed form component with Zod schema inference, returning field
errors as { path, message }.

Create a useServerAction wrapper to call route action handlers with proper types
and toast feedback.

---

6.3 Backend Agent (BE)

Server functions (actions), loaders, validation, and Prisma access.

Input validation via Zod, error mapping.

Tasks

app/server/db.ts singleton Prisma client

Post CRUD actions; tag connect/disconnect; media attach

Signed S3 upload (server pre-sign endpoint)

Prompts

Create createPostAction validating {title, slug, content, status, tagIds,
coverId} and returning created Post.

Add deletePostAction with RBAC guard (EDITOR+).

---

6.4 Auth Agent (AA)

Setup Lucia (or Auth.js) with session cookies; password hashing; CSRF.

requireUser() and requireRole() utilities.

Prompts

Scaffold Lucia with cookie sessions and User model mapped to Prisma, including
adapters and session expiry.

Add beforeLoad guard for all /admin/\* routes that redirects to /login when
unauthorized.

---

6.5 Database Agent (DA)

Model design, migrations, seed scripts, indexes.

Tasks

Create schema.prisma with enums, relations, constraints.

Seed admin user and a few demo posts.

Prompts

Design indexes for Post (slug unique, status filter, updatedAt desc), Tag (name
unique).

Create seed script that adds roles and an admin account with random password
printed to console.

---

6.6 DevOps Agent (DO)

Vercel integration, env setup, build scripts, preview environments.

Tasks

Configure Vite plugin: tanstackStart({ target: 'vercel' })

Vercel project, env vars, build command, Prisma generate

Choose a hosted Postgres; enable Prisma Accelerate (optional)

Prompts

Create a Vercel build step that runs prisma generate && prisma migrate deploy &&
vite build with Start.

Document env var setup and secrets rotation policy.

---

6.7 QA Agent (QA)

Test plan, unit + e2e, CI status gates.

Tasks

Vitest unit tests for actions and loaders

Playwright e2e: login → create/edit/publish post → view public page

Prompts

Write Playwright tests for admin post creation with file upload and Markdown
editor.

Add a Vitest test asserting Zod schema rejects invalid slugs.

---

6.8 Docs Agent (DX)

Developer docs, ADRs, changelog, runbooks.

Prompts

Write README.md with quickstart, scripts, and deployment.

Create RUNBOOK.md with common incidents (DB outage, S3 failures) and steps.

---

7. Implementation Blueprints

7.1 Prisma Models (draft)

model User { id String @id @default(cuid()) email String @unique name String?
password String? // or external provider role Role @default(EDITOR) posts Post[]
sessions Session[] createdAt DateTime @default(now()) updatedAt DateTime
@updatedAt }

model Post { id String @id @default(cuid()) slug String @unique title String
excerpt String? content Json // or String for markdown status Status
@default(DRAFT) author User @relation(fields: [authorId], references: [id])
authorId String publishedAt DateTime? tags Tag[] @relation("PostTags",
references: [id]) coverId String? cover Media? @relation(fields: [coverId],
references: [id]) createdAt DateTime @default(now()) updatedAt DateTime
@updatedAt }

model Tag { id String @id @default(cuid()) name String @unique posts Post[]
@relation("PostTags") }

model Media { id String @id @default(cuid()) url String key String mime String
width Int? height Int? createdAt DateTime @default(now()) }

model Session { id String @id @default(cuid()) user User @relation(fields:
[userId], references: [id]) userId String expiresAt DateTime createdAt DateTime
@default(now()) }

enum Role { ADMIN EDITOR AUTHOR VIEWER } enum Status { DRAFT REVIEW PUBLISHED
ARCHIVED }

7.2 Routes (MVP)

/app/routes index.tsx blog.tsx blog.$slug.tsx
  tags.$name.tsx
admin.\_layout.tsx # shell + nav admin/index.tsx # dashboard admin/posts.tsx
admin/posts.$id.tsx admin/tags.tsx admin/media.tsx login.tsx

7.3 Server Modules

app/server/db.ts: Prisma singleton

app/server/auth.ts: Lucia/Auth.js config, requireUser, requireRole

app/server/rbac.ts: helpers and constants

app/server/uploads.ts: S3 presign + verification

7.4 Example Server Action (sketch)

// routes/admin/posts.tsx export const Route = createFileRoute('/admin/posts')({
beforeLoad: async (ctx) => { const user = await ctx.context.auth.getUser()
requireRole(user, ['EDITOR','ADMIN']) }, loader: async () =>
prisma.post.findMany({ orderBy: { updatedAt: 'desc' }, take: 50 }), action: {
create: async ({ body }) => { const data = CreatePostSchema.parse(body) return
prisma.post.create({ data }) }, delete: async ({ body }) => { const { id } =
z.object({ id: z.string() }).parse(body) await prisma.post.delete({ where: { id
} }) return { ok: true } }, }, })

---

8. Local Dev

# 1) Create app

npm create tanstack@latest # choose Start (React)

# 2) Install deps

npm i prisma @prisma/client zod @tanstack/react-query @tanstack/router lucia
@tailwindcss/forms

# 3) Prisma

npx prisma init npx prisma migrate dev

# 4) Dev server

npm run dev

---

9. Deploy (Vercel)

1) In vite.config.ts:

plugins: [tanstackStart({ target: 'vercel' })]

2. Push to Git repo → Import on Vercel

3. Set env vars; add Postgres (Neon/Supabase) URL

4. Build command (Vercel UI): npm run build

5. Post‑build hook (optional): prisma migrate deploy

Operational Notes

Prefer serverless‑friendly DB (connection pooling). Consider Prisma Accelerate.

Ensure a single Prisma client per runtime (singleton pattern).

Configure Cache-Control for public routes; revalidate on publish.

---

10. CI/CD & Quality Gates

CI: typecheck, lint, test (unit + e2e headless)

Preview URLs: every PR → Vercel preview

Gates: require tests + review + accessibility checks before merge

---

11. Runbooks

DB Migration Failure: rollback to previous migration, fix schema, redeploy

S3 Upload Errors: verify IAM, CORS, and clock skew; retry with backoff

Auth Issues: rotate AUTH_SECRET, invalidate sessions

---

12. Future Enhancements

Content revisions and diffing

Draft preview tokens

Role‑based field visibility (e.g., Authors can edit own posts only)

Full‑text search (PG Trigram) and tag filters

Image optimization/proxy route

---

13. Acceptance Criteria (MVP)

Admin can create/edit/publish posts with cover image and tags

Public /blog lists published posts; /blog/$slug renders SSR with SEO

RBAC enforced for /admin/\*

File uploads succeed and persist in S3 bucket

All actions validated by Zod; happy-path e2e test passes

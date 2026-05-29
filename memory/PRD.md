# Green-Haus Landing Page — PRD

## Original Problem Statement
Build a minimalist, elegant landing page for "Green-Haus", a social-impact coffee company connecting women coffee farmers in Rwanda and Burundi directly with the German coffee market. Sections: Hero, About, Products (5 SKUs), Founder, Impact, Contact, Footer. Static-feeling, low animations, premium typography (serif + sans), forest green / cream / soft brown / charcoal palette. Lightweight, no login/dashboard/payment.

## Architecture
- **Backend**: FastAPI + MongoDB. Endpoints `/api/contact` and `/api/quote` persist inquiries to MongoDB and dispatch a transactional email via Resend (`onboarding@resend.dev` → nsabemungu@gmail.com). Email failures are non-fatal — inquiry is still persisted.
- **Frontend**: React (single-page) with Tailwind + custom CSS variables, Playfair Display (headings) + Manrope (body). Components: Navbar, Hero, About, Products, Founder, Impact, Contact, Footer, QuoteDialog.

## User Personas
- Specialty coffee buyer / roastery in Germany evaluating direct-trade supply.
- Café owner requesting wholesale quotes.
- Press / partners / general visitors learning about the brand.

## Core Requirements (Static)
- Brand colours: forest green `#2D4A32`, cream `#E8E0D5`, soft brown `#A67C52`, charcoal `#1A1A1A`, off-white `#F9F8F6`.
- Typography: Playfair Display + Manrope.
- 5 products with image, name, origin, roast, tasting notes, EUR price, description, Request Quote CTA.
- Contact form (Name, Email, Message) → emails nsabemungu@gmail.com.
- Founder portrait is a clearly labelled placeholder pending upload.
- Responsive (mobile + desktop), light hover transitions only.

## Implemented (2026-05)
- Hero with editorial layout, dual CTA, trust stats, hero image.
- About section with story copy and farmer imagery.
- Products grid (3-col desktop / 2 / 1) — 5 SKUs from /app/frontend/src/data/products.js, modal-based "Request Quote" dialog.
- Founder section with portrait placeholder + replaceable.
- Impact section — 3 cards (fair compensation, direct access, communities).
- Contact section with details + form.
- Footer with brand + tagline + copyright.
- Backend `/api/contact` + `/api/quote` storing in MongoDB `inquiries` collection and sending Resend emails.

## Editor CMS — Feature added (2026-05-29)
Added a lightweight **Website Editor role + dashboard** so non-developers can edit site content.
- **Auth**: custom JWT email/password (bcrypt + PyJWT HS256). Single editor seeded on startup from `ADMIN_EMAIL`/`ADMIN_PASSWORD` in `/app/backend/.env`. Token stored in frontend localStorage `gh_token`, sent via `Authorization: Bearer`.
- **Content is now DB-driven**: a `site_content` singleton (`key: "main"`) holds all editable copy/images for settings, navbar labels, categories, hero, about, products-section heading, founder, impact, contact. Public site reads `GET /api/content` (with JS defaults fallback). Products live in a `products` collection.
- **Dashboard** at `/dashboard` (protected) with two tabs:
  - *Site Content* — edit every section; "Publish changes" saves live immediately (`PUT /api/admin/content`).
  - *Products* — full CRUD + Publish/Hide visibility toggle. Public `/api/products` returns published only.
- **Login** at `/login` (heading: "Dashboard Login"). ProtectedRoute redirects unauthenticated users.
- Images are edited via URL inputs (no file upload — matches user choice).
- New backend modules: `database.py`, `auth.py`, `cms.py`. New frontend: `context/AuthContext.jsx`, `context/ContentContext.jsx`, `lib/api.js`, `components/ProtectedRoute.jsx`, `pages/Login.jsx`, `pages/Dashboard.jsx`, `components/dashboard/*`.
- **Tested**: 30/30 backend pytest + full Playwright dashboard e2e — 100% pass (`/app/test_reports/iteration_2.json`).
- **Credentials**: see `/app/memory/test_credentials.md`.

### CMS limitations / future
- Any authenticated user is treated as editor (single-editor MVP, no granular roles).
- JWT TTL hardcoded 12h; secrets in `.env` should be rotated before production.
- No server-side image upload (URLs only). Could add object storage later.

## Known limitations / Next actions
- Resend account is in testing/sandbox mode — emails currently can only be delivered to the account-owner address. To deliver to nsabemungu@gmail.com, verify a domain at resend.com/domains and update `SENDER_EMAIL` in `/app/backend/.env`. Inquiries are persisted in MongoDB regardless.
- Founder portrait and product photos are placeholders pending uploads by the client.

## Backlog (P1)
- Admin endpoint or simple page to view stored inquiries.
- Replace placeholder portrait + product imagery once supplied.
- Optional: light page transitions, scroll-spy on navbar.

## Backlog (P2)
- i18n (DE/EN toggle).
- Newsletter signup.
- Origin story sub-pages per cooperative.

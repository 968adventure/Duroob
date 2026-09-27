# Duroob Expeditions — initial build

Port the supplied Duroob source into this Lovable project as a public, bilingual (Arabic-first) marketing site. No database, auth, payments, or integrations.

## What gets built

**Routes**
- `/` — home: hero, four experience modes, field crew, terrain hubs, sustainability, gallery, safety, contact (existing section order preserved)
- `/itineraries/bar-al-hikman`, `/itineraries/salalah`, `/itineraries/diving` — three distinct pages, each with its own hero media, accent, bilingual title, terrain metadata, three focus points, scope note, and CTAs
- `/enquire` and `/enquire?trip=<id>` — bilingual enquiry form; `trip` preselects the matching experience
- 404 fallback

**Language behaviour**
Arabic default and RTL on first load; English toggle switches to LTR and updates copy, `document.lang`, `document.dir`, and the page title. Copy stays in the existing `{ ar, en }` data model. Phone numbers, coordinates, and route codes stay LTR-isolated.

**Enquiry flow**
The form builds a structured WhatsApp message and opens `https://wa.me/96896969143?text=...`. Nothing is stored, sent, or logged anywhere. Fixed WhatsApp button stays on every page.

**Contact facts (verbatim)**
+968 96969143 · duroob@gmail.com · @duroob.om

**Media**
All 18 supplied files (images, both logos, hero video `duroob-terrain-motion.mp4`) go into `public/media/`, so every existing `/media/...` reference keeps working unchanged. No stock substitutions.

**Content safety**
Copy is carried over as written — no invented certifications, guarantees, capacities, or government partnerships.

## Technical notes

- The source is a wouter SPA; this project uses TanStack Router file routes. `App.tsx` routing is replaced by files under `src/routes/` (`index.tsx`, `itineraries.bar-al-hikman.tsx`, `itineraries.salalah.tsx`, `itineraries.diving.tsx`, `enquire.tsx`), each rendering the existing page component unchanged apart from the router import and query-param read (`useSearch` instead of `window.location.search`).
- `Home.tsx`, `Itinerary.tsx`, `Enquiry.tsx`, `NotFound.tsx`, `WhatsAppFloat.tsx`, `ErrorBoundary.tsx`, hooks and the shadcn `ui/` components come over as-is; only unused shadcn components are dropped.
- The Earthbound Glass tokens (forest `#1e392e`, mineral green `#2d5a27`, dune gold `#d4a373`, sand `#b97a57` and the rest of `index.css`) are merged into `src/styles.css` as semantic Tailwind v4 tokens — no hardcoded colour utilities in components.
- Providers (theme, tooltip, sonner Toaster, error boundary, floating WhatsApp) move into `src/routes/__root.tsx`.
- Per-route `head()` metadata with Duroob-specific titles and descriptions; hero video lazy/`preload="none"`, images lazy-loaded below the fold.
- The server-side pieces of the bundle (`portable/server/`) are not needed and are skipped.

## Out of scope for this build

Database, auth, payments, CMS, lead storage, email, MCP setup, GitHub sync. The MCP config file configures an external client and is not a site feature.

## After the build

I will run through the QA checklist (language toggle, RTL/LTR, each itinerary route, `?trip=` preselection, media loading, WhatsApp URL construction inspected without opening it, mobile layout) and report findings before you publish.

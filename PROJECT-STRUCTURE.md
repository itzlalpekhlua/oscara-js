# Project Structure — Frontend vs Backend Reference

This is a Next.js app, which is a **full-stack framework**: pages, the
database, and server logic are not separated into different folders the way
a traditional website might be. Most page files do both jobs at once — they
render the UI *and* fetch data from the database in the same file. Because
of that, there's no literal "frontend folder" and "backend folder" to move
things into without rewriting the app. This document is a map instead: it
tells you, for the structure that already exists, what's frontend (what
visitors/you see) and what's backend (data, database, server logic).

## Frontend — what renders on screen

| Folder | What's in it |
|---|---|
| `app/(site)/` | Every public page: homepage, Projects, Construction Projects, Design Portfolio, Team, Testimonials, Contact, Social |
| `app/admin/(protected)/` | The admin panel screens (Team, Testimonials, Projects, etc. management UI) |
| `components/` | Reusable UI pieces — Navigation, Footer, Hero, testimonial cards, photo galleries/slideshows, buttons, section headings |
| `components/home/` | Homepage-only sections (Hero, About, Why Choose Us, Media Coverage, Testimonials Teaser, Final CTA) |
| `components/ui/` | Small shared visual building blocks (labels, dividers, glow effects, reveal animations) |
| `components/admin/` | Admin-panel-only UI (reorder buttons, publish toggle, media uploader, sidebar) |
| `public/` | **Every image, video, and uploaded photo on the site.** Cannot be moved or renamed — Next.js requires this exact folder at the project root to serve files. Moving it would break every photo currently showing on the live site. |
| `app/globals.css`, `tailwind.config.*` | Site-wide styling and design tokens (colors, fonts) |

## Backend — data, database, and server logic

| Folder | What's in it |
|---|---|
| `prisma/schema.prisma` | The database schema — every table and field (Testimonial, Project, TeamMember, SiteSettings, etc.) |
| `prisma/seed.ts` | One-time script that seeds starter data into the database |
| `prisma/dev.db` | The actual SQLite database file — all real content lives here |
| `lib/prisma.ts` | The database connection used everywhere in the app |
| `lib/auth.ts`, `lib/session.ts` | Admin login/session handling |
| `lib/uploads.ts` | Handles saving and deleting uploaded files |
| `lib/slugify.ts`, `lib/socialEmbed.ts` | Small server-side helper functions |
| `app/admin/(protected)/*/actions.ts` | **Server Actions** — the actual create/update/delete/reorder/publish logic for every admin section, one file per section |
| `app/api/` | API routes: admin login, admin logout, file upload, contact form submission |
| `middleware.ts` | Runs before every request — protects the admin panel from being accessed without logging in |

## The part that can't be split: page files

Every file named `page.tsx` under `app/(site)/` or `app/admin/(protected)/`
is technically **both** frontend and backend in one file. For example,
[app/(site)/team/page.tsx](app/(site)/team/page.tsx) renders the Team page
you see, but the same file also directly queries the database for the
Chairman and Managing Director records. This is normal, idiomatic Next.js —
splitting it apart would mean rebuilding the site as a separate API server
plus a separate frontend app that talks to it over the network, which is a
large rewrite, not a file move.

# Deploying to Nest Nepal (cPanel Node.js Selector)

This app is now built and verified for this exact hosting type — `next.config.js`
has `output: "standalone"` set, which produces a self-contained server
(`.next/standalone/server.js`) that plain Node hosting (like cPanel's Node.js
Selector, which runs apps under Phusion Passenger) can run directly, instead
of needing the `next start` CLI. This has been tested locally end-to-end:
build succeeds, the standalone server serves pages, styling, and real
database content correctly.

## Before you start: two things that must NOT be overwritten

1. **The real database** (`backend/prisma/dev.db`) has all your actual
   content — testimonials, projects, team, media coverage. Never run
   `npm run db:seed` on the server; it wipes everything back to placeholders.
   You'll upload your real `dev.db` file directly instead (step 5 below).
2. **Uploaded photos/videos** (`public/uploads/`) are real business content.
   On future redeploys, never let a fresh copy from your local machine
   overwrite the server's `public/uploads` — only replace the app code.

## Step 1 — Get the code onto the server

Two options, pick whichever Nest Nepal's cPanel supports:

- **Git** (preferred if their cPanel has "Git Version Control"): push this
  project to a private GitHub repo, then clone it via cPanel's Git feature
  into the app's directory.
- **Zip upload**: zip the whole project folder (it's fine to include
  `node_modules` will be excluded automatically by the size limit — better to
  zip *without* `node_modules` and `.next` to keep the file small), upload
  via cPanel File Manager, extract it.

Either way, exclude `node_modules` and `.next` from what you transfer — those
get generated on the server in the next steps.

## Step 2 — Create the Node.js app in cPanel

In cPanel, find **"Setup Node.js App"** (this is CloudLinux's Node.js
Selector — confirmed available on your plan). Create a new application:

- **Node.js version**: pick the newest available (Next.js 16 needs a recent
  LTS — Node 20.9 or newer). If only older versions are offered, message
  Nest Nepal support and ask them to enable a newer one.
- **Application root**: the folder where you uploaded the code.
- **Application URL**: your domain (or subdomain, if testing first).
- **Application startup file**: leave this for now — you'll set it to
  `.next/standalone/server.js` in Step 4, after building.

## Step 3 — Install dependencies

cPanel's Node.js Selector gives you a "Run NPM Install" button, or a
terminal/SSH session scoped to that app's environment. Either way, run:

```bash
npm install
```

This also runs `postinstall` automatically, which regenerates the Prisma
Client correctly for *this* server's file paths — important, since a
Prisma Client generated on your local machine won't have the right paths
baked in for the SQLite database on a different machine.

## Step 4 — Build

Still in that same terminal/app environment:

```bash
npm run build
```

This runs `next build`, then automatically runs `postbuild`, which copies
`.next/static` and `public/` into `.next/standalone/` — the two things
`output: "standalone"` doesn't include by default. (This is already wired
up — nothing manual to remember here.)

Now go back to the Node.js app settings in cPanel and set **Application
startup file** to:

```
.next/standalone/server.js
```

## Step 5 — Bring over your real content

The build creates a fresh, empty database structure. Bring over your real
data:

1. Run once, to create the database file/schema on the server (skip if you're
   about to just overwrite it in the next step anyway):
   ```bash
   npm run db:push
   ```
2. **Upload your actual `backend/prisma/dev.db`** from your local machine
   (via FTP or File Manager) to `backend/prisma/dev.db` on the server,
   overwriting the empty one. This brings over every real testimonial,
   project, team member, and setting.
3. **Upload your `public/uploads/` folder** (all your real photos and
   videos) to the same path on the server, if it wasn't already included in
   your Step 1 transfer.

## Step 6 — Start it

Back in cPanel's Node.js Selector, click **Restart** on the app. Visit your
domain (or subdomain) and confirm the homepage loads with real content,
styling, and photos.

## Step 7 — Domain & SSL

- Point your domain's DNS to Nest Nepal's nameservers/IP if you haven't
  already (they'll have given you this when you signed up).
- Once the domain resolves, issue a free SSL certificate — cPanel's AutoSSL
  usually does this automatically within a few hours of the domain pointing
  correctly; check under "SSL/TLS Status" in cPanel if it doesn't.

## Redeploying later (when you ask me for more changes)

1. Upload the updated source code (excluding `node_modules`, `.next`,
   and — critically — `backend/prisma/dev.db` and `public/uploads/`).
2. Run `npm install && npm run build` again on the server.
3. Restart the Node.js app in cPanel.

The live database and uploaded media stay untouched throughout, since you
never re-transfer those two paths after the first deployment.

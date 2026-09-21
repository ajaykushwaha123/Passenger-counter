# Business Dashboard

A modern, responsive business operations dashboard built with **Java + Spring Boot**, served as a static **HTML / CSS / JavaScript** front end with **Chart.js**.

The layout, sidebar, header, card system, color palette, typography and table styling are modeled after a professional ops-dashboard reference design, adapted for general business use.

There are two separate pages:

- **`/` — the Dashboard.** Read-only, public, meant for clients to view. No login. It only shows the sections that are turned on in the admin panel.
- **`/admin` — the Admin Panel.** Lets you turn each dashboard card on/off and edit its content (events, notices, personnel, tasks, deadlines, quick links, quote, workforce numbers). Changes are saved with one **Save Changes** click. **Protected by a username/password** (HTTP Basic — the browser shows its own built-in login popup, no custom login page needed).

It ships in two forms, from the same source:

1. **`dist/business-dashboard.html`** — a single offline file you double-click to open. No server, no Java, no internet. See *Offline single-file build* below.
2. **The Spring Boot app** — a real server you can run locally or deploy, with the admin panel behind a login.

## Stack

- **Backend:** Java 17, Spring Boot 3 (Spring MVC + Spring Security)
- **Frontend:** Vanilla HTML/CSS/JS served from `src/main/resources/static`, no build step required
- **Charts:** Chart.js (bundled locally, no external CDN dependency)
- **Storage:** dashboard content is saved to `data/dashboard-data.json` next to wherever the app is run from — no database needed, and edits survive a restart (as long as that folder isn't wiped — see the Render note below)

## Admin login

Set via environment variables (falls back to `admin` / `changeme123` if unset — **do not leave the defaults in place for anything other than local testing**):

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=set-a-real-password-here
```

## Project layout

```
src/main/java/com/dashboard/
  DashboardApplication.java                Spring Boot entry point
  config/SecurityConfig.java               protects /admin and /api/admin/** only
  controller/DashboardApiController.java   GET /api/dashboard            (read, used by both pages, public)
  controller/AdminApiController.java       POST /api/admin/dashboard     (save, requires login)
  controller/AdminPageController.java      serves /admin
  service/DashboardConfigService.java      loads/saves data/dashboard-data.json
  model/                                    DTO records (WorkforceStatus, EventItem, ...)

src/main/resources/
  application.properties
  static/
    index.html          the dashboard
    css/style.css
    js/app.js
    js/chart.umd.js
    admin/
      index.html         the admin panel
      admin.css
      admin.js

Dockerfile                for cloud deployment (Render, Railway, Fly.io, Cloud Run, ...)
scripts/
  start.sh               double-click launcher (macOS / Linux)
  start.bat               double-click launcher (Windows)
```

## Running locally (for development)

```
mvn spring-boot:run
```

or build and run the jar:

```
mvn clean package
java -jar target/business-dashboard-1.0.0.jar
```

Then open:
- Dashboard: [http://localhost:8080](http://localhost:8080)
- Admin panel: [http://localhost:8080/admin](http://localhost:8080/admin) (default login `admin` / `changeme123` unless you set `ADMIN_USERNAME`/`ADMIN_PASSWORD`)

## Dashboard sections

- **Workforce Status** — headcount summary with a Chart.js donut chart and legend
- **Upcoming Events** / **Today's Schedule** — data tables
- **Key Personnel** — role/name list
- **Announcements** — priority-tagged notices
- **Project Status** — progress bars
- **Deadlines** — live day-countdown tiles
- **Quick Links** — icon shortcut grid
- **Quote of the Day**

Each section can be shown/hidden independently from the admin panel; the dashboard grid simply leaves that card's space empty when hidden.

## Offline single-file build (easiest way to share it)

`dist/business-dashboard.html` is the **whole dashboard + admin panel in one file** — no server, no Java, no internet, no install. Double-click it and it opens in the browser; bookmark it and it behaves like any other saved link.

- The dashboard opens first (that's what clients see).
- The **Settings** icon in the sidebar opens the admin panel; **View Dashboard** goes back.
- Saving writes to the browser's `localStorage`, so edits survive closing the browser and restarting the PC. They're stored per-browser on that machine — a different browser (or a cleared browsing history) starts again from the defaults.
- The admin panel has a **Reset to defaults** button to wipe local edits.

Rebuild it after changing any markup, CSS or JS:

```
python3 offline/build.py
```

The build inlines `static/css/style.css`, `static/admin/admin.css`, `chart.umd.js`, `app.js` and `admin.js` into a single HTML file, plus `offline/offline-boot.js`, which answers the app's own `/api/dashboard` and `/api/admin/dashboard` calls from `localStorage` instead of from the backend. That means the offline build and the Spring Boot build share exactly the same markup and render logic — only the storage layer differs. `offline/default-data.json` holds the starting content and mirrors the defaults in `DashboardConfigService`.

## Deploying for free (so you can just share a link)

The app is a single Docker image (`Dockerfile` in the repo root), so it deploys on any host that builds from a `Dockerfile` — **Render.com** is the easiest free option (no credit card, connects straight to this GitHub repo):

1. Push this repo to GitHub (already done if you're reading this from the repo).
2. Go to [render.com](https://render.com) → sign up/log in → **New +** → **Web Service**.
3. Connect this GitHub repo. Render will detect the `Dockerfile` automatically — leave build/start commands blank.
4. Choose the **Free** instance type.
5. Under **Environment**, add:
   - `ADMIN_USERNAME` = whatever you want
   - `ADMIN_PASSWORD` = a real password (don't skip this)
6. Click **Create Web Service**. First build takes a few minutes.
7. You'll get a public URL like `https://your-app.onrender.com` — that's the link to give your friend/client. `/admin` on that same URL is the protected admin panel.

**Two honest limitations of the free tier**, so there are no surprises:
- The free instance sleeps after ~15 minutes of no traffic. The first visit after that takes 30–60 seconds to wake up.
- The free plan has no persistent disk — the container's filesystem can reset on redeploys/restarts, which would reset anything saved to `data/dashboard-data.json` (i.e. admin edits) back to the built-in defaults. Fine for an occasionally-updated demo dashboard; if you need edits to always stick, that needs a paid disk (~$1/mo on Render) or a real database later.

## Giving this to someone else without hosting it (alternative)

If you'd rather not deploy anywhere, the whole app also runs as **one `.jar` file** on someone's own machine:

1. Build it: `mvn clean package` → produces `target/business-dashboard-1.0.0.jar`.
2. Copy that jar, plus `scripts/start.sh` (Mac/Linux) or `scripts/start.bat` (Windows), into one folder and send that folder.
3. They need **Java 17+** installed ([adoptium.net](https://adoptium.net) has free installers).
4. They run the script for their OS, then open `http://localhost:8080` (dashboard) and `http://localhost:8080/admin` (admin, same login as above).
5. Data is saved in a `data` folder created next to the jar — persists across restarts since it's their own machine's disk.

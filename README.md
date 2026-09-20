# Business Dashboard

A modern, responsive business operations dashboard built with **Java + Spring Boot**, served as a static **HTML / CSS / JavaScript** front end with **Chart.js**.

The layout, sidebar, header, card system, color palette, typography and table styling are modeled after a professional ops-dashboard reference design, adapted for general business use.

There are two separate pages:

- **`/` — the Dashboard.** Read-only, meant for the client to view. It only shows the sections that are turned on in the admin panel.
- **`/admin` — the Admin Panel.** Lets you turn each dashboard card on/off and edit its content (events, notices, personnel, tasks, deadlines, quick links, quote, workforce numbers). Changes are saved with one **Save Changes** click.

There is **no login** on either page — anyone who can reach the app (e.g. anyone on `http://localhost:8080/admin`) can edit it. This is fine for running the app locally on your own machine / a private network, but do **not** expose it on the public internet as-is.

## Stack

- **Backend:** Java 17, Spring Boot 3 (Spring MVC / `spring-boot-starter-web`)
- **Frontend:** Vanilla HTML/CSS/JS served from `src/main/resources/static`, no build step required
- **Charts:** Chart.js (bundled locally, no external CDN dependency)
- **Storage:** dashboard content is saved to `data/dashboard-data.json` next to wherever the app is run from — no database needed, and edits survive a restart

## Project layout

```
src/main/java/com/dashboard/
  DashboardApplication.java                Spring Boot entry point
  controller/DashboardApiController.java   GET /api/dashboard            (read, used by both pages)
  controller/AdminApiController.java       POST /api/admin/dashboard     (save, used by the admin page)
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
- Admin panel: [http://localhost:8080/admin](http://localhost:8080/admin)

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

## Giving this to someone else (no hosting required)

You don't need to deploy this anywhere for someone else to use it — Spring Boot's embedded server means the whole app ships as **one runnable `.jar` file**. To hand it to a friend so they can run their own private copy:

1. Build it: `mvn clean package` → this produces `target/business-dashboard-1.0.0.jar`.
2. Copy that single jar file, plus `scripts/start.sh` (Mac/Linux) or `scripts/start.bat` (Windows), into one folder and send that folder (zip it, share via Drive/WhatsApp/USB — whatever's convenient).
3. Your friend needs **Java 17 or newer** installed ([adoptium.net](https://adoptium.net) has free installers for Windows/Mac/Linux).
4. They run the script for their OS (`start.bat` on Windows, `start.sh` on Mac/Linux — on Mac/Linux they may need to right-click → "Open" the first time, or run `./start.sh` in a terminal).
5. Once it says the server started, they open a browser to:
   - `http://localhost:8080` — the dashboard (for showing clients)
   - `http://localhost:8080/admin` — the admin panel (for them to edit)
6. Closing the terminal/command window stops the server. Running the script again picks up right where they left off — edits are saved in a `data` folder created next to the jar.

Since there's no login, this is meant to run on their own laptop (or a machine only they/their team can reach) — not on a public server.

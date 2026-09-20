# Business Dashboard

A modern, responsive business operations dashboard built with **Java + Spring Boot**, served as a static **HTML / CSS / JavaScript** front end with **Chart.js**.

The layout, sidebar, header, card system, color palette, typography and table styling are modeled after a professional ops-dashboard reference design, adapted for general business use.

## Stack

- **Backend:** Java 17, Spring Boot 3 (Spring MVC / `spring-boot-starter-web`), exposing a single JSON API
- **Frontend:** Vanilla HTML/CSS/JS served from `src/main/resources/static`, no build step required
- **Charts:** Chart.js (bundled locally, no external CDN dependency)

## Project layout

```
src/main/java/com/dashboard/
  DashboardApplication.java        Spring Boot entry point
  controller/DashboardApiController.java   GET /api/dashboard
  service/DashboardDataService.java        sample dashboard data
  model/                            DTO records (WorkforceStatus, EventItem, ...)

src/main/resources/
  application.properties
  static/
    index.html
    css/style.css
    js/app.js
    js/chart.umd.js
```

## Running locally

```
mvn spring-boot:run
```

or build and run the jar:

```
mvn clean package
java -jar target/business-dashboard-1.0.0.jar
```

The dashboard is served at [http://localhost:8080](http://localhost:8080).

## Dashboard sections

- **Workforce Status** — headcount summary with a Chart.js donut chart and legend
- **Upcoming Events** / **Today's Schedule** — data tables
- **Key Personnel** — role/name list
- **Announcements** — priority-tagged notices
- **Project Status** — progress bars
- **Deadlines** — live day-countdown tiles
- **Quick Links** — icon shortcut grid
- **Quote of the Day**

All dashboard content is served from `GET /api/dashboard` and rendered client-side, so swapping in real data only requires changing `DashboardDataService` (or wiring it to a real data source/repository).

The page is fully responsive, collapsing from a 3-column desktop grid down to a single-column mobile layout.

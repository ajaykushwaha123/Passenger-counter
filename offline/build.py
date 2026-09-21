#!/usr/bin/env python3
"""
Builds dist/business-dashboard.html: one self-contained file that runs the whole
dashboard + admin panel straight from disk (double-click, no server, no Java,
no internet).

It reuses the real markup, CSS and render logic from src/main/resources/static
so the offline build and the Spring Boot build never drift apart. The only
difference is offline-boot.js, which answers the app's API calls from
localStorage instead of from the backend.
"""

import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
STATIC = ROOT / "src" / "main" / "resources" / "static"
OFFLINE = ROOT / "offline"
OUT = ROOT / "dist" / "business-dashboard.html"


def read(path):
    return path.read_text(encoding="utf-8")


def body_of(html):
    """Return the <body> contents with <script> tags stripped."""
    match = re.search(r"<body[^>]*>(.*)</body>", html, re.S)
    if not match:
        raise SystemExit(f"could not find <body> in source html")
    body = re.sub(r"<script\b.*?</script>", "", match.group(1), flags=re.S)
    return body.strip()


def js_safe(text):
    """Keep an inlined script from ending the <script> block early."""
    return text.replace("</script>", "<\\/script>")


def main():
    dashboard_body = body_of(read(STATIC / "index.html"))
    admin_body = body_of(read(STATIC / "admin" / "index.html"))

    style_css = read(STATIC / "css" / "style.css")
    admin_css = read(STATIC / "admin" / "admin.css")

    default_data = json.loads(read(OFFLINE / "default-data.json"))
    boot_js = read(OFFLINE / "offline-boot.js").replace(
        "__DEFAULT_DATA__", json.dumps(default_data, indent=2)
    )
    chart_js = read(STATIC / "js" / "chart.umd.js")
    app_js = read(STATIC / "js" / "app.js")
    admin_js = read(STATIC / "admin" / "admin.js")

    html = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Business Dashboard</title>
  <link rel="icon" href="data:," />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
{style_css}
  </style>
  <style>
{admin_css}
  </style>
  <style>
    #view-dashboard[hidden], #view-admin[hidden] {{ display: none !important; }}
  </style>
</head>
<body>

<div id="view-dashboard">
{dashboard_body}
</div>

<div id="view-admin" class="admin-body" hidden>
{admin_body}
</div>

<script>
{js_safe(boot_js)}
</script>
<script>
{js_safe(chart_js)}
</script>
<script>
{js_safe(app_js)}
</script>
<script>
{js_safe(admin_js)}
</script>
</body>
</html>
"""

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(html, encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size / 1024:.0f} KB)")


if __name__ == "__main__":
    main()

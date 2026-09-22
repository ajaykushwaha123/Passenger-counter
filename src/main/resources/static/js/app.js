// Dark-surface palette, validated for lightness band, chroma, colour-blind
// separation and contrast. green/teal/amber are kept as aliases so dashboards
// saved before this palette landed still render.
const COLORS = {
  blue: '#3987e5',
  aqua: '#199e70',
  teal: '#199e70',
  green: '#199e70',
  yellow: '#c98500',
  amber: '#c98500',
  magenta: '#d55181',
  violet: '#9085e9',
  red: '#e66767',
  gray: '#6b7488',
};

const CARD_SURFACE = '#141d31';
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let workforceChart = null;

function animateNumber(el, to, suffix) {
  const tail = suffix || '';
  if (REDUCED_MOTION) {
    el.textContent = to + tail;
    return;
  }
  const duration = 900;
  const start = performance.now();
  requestAnimationFrame(function step(now) {
    const t = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(to * (1 - Math.pow(1 - t, 3))) + tail;
    if (t < 1) requestAnimationFrame(step);
  });
}

function startClock() {
  const dateEl = document.getElementById('clock-date');
  const timeEl = document.getElementById('clock-time');

  function tick() {
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase();
    timeEl.textContent = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  tick();
  setInterval(tick, 1000);

  document.getElementById('clock-loc').textContent = 'Unit Lines';
  document.getElementById('clock-temp').textContent = '28°C';
}

function renderWorkforce(wf) {
  const percent = wf.totalSanctioned ? Math.round((wf.present * 100) / wf.totalSanctioned) : 0;
  animateNumber(document.getElementById('wf-total'), wf.totalSanctioned);
  animateNumber(document.getElementById('wf-percent'), percent, '%');

  const segments = [
    { label: 'Present', value: wf.present, color: COLORS.aqua },
    { label: 'On Leave', value: wf.onLeave, color: COLORS.yellow },
    { label: 'On TD', value: wf.onFieldDuty, color: COLORS.magenta },
    { label: 'Attached', value: wf.remote, color: COLORS.blue },
    { label: 'Vacant', value: wf.vacant, color: COLORS.gray },
  ];

  const legend = document.getElementById('wf-legend');
  legend.innerHTML = segments.map(s => `
    <li><span class="dot" style="background:${s.color}"></span>${s.label}<span class="num">${s.value}</span></li>
  `).join('');

  const ctx = document.getElementById('workforceChart');
  if (workforceChart) workforceChart.destroy();
  workforceChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: segments.map(s => s.label),
      datasets: [{
        data: segments.map(s => s.value || 0.0001),
        backgroundColor: segments.map(s => s.color),
        // 2px of surface between segments keeps neighbouring fills readable.
        borderWidth: 2,
        borderColor: CARD_SURFACE,
        hoverOffset: 5,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      animation: { duration: REDUCED_MOTION ? 0 : 900 },
    },
  });
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Dates are stored as yyyy-mm-dd (what the admin date picker produces), but
 * older dashboards saved free text like "18 Sep 2026", so both are accepted.
 * ISO strings are built as a local date - new Date("2026-09-18") would be UTC
 * midnight, which lands on the previous day west of Greenwich.
 */
function parseDate(value) {
  const iso = ISO_DATE.exec(value);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  return new Date(value);
}

/** Spelled out here so every month is three letters and the viewer's locale can't change it. */
function formatDate(value) {
  const iso = ISO_DATE.exec(value);
  if (!iso) return value;
  return `${iso[3]} ${MONTHS[Number(iso[2]) - 1]} ${iso[1]}`;
}

function daysUntil(dateStr) {
  const target = parseDate(dateStr);
  if (isNaN(target)) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  return Math.max(diff, 0);
}

function renderEvents(events) {
  const tbody = document.querySelector('#events-table tbody');
  tbody.innerHTML = events.map(e => `
    <tr style="--row-color:${COLORS[e.tag] || COLORS.blue}">
      <td>${formatDate(e.date)}</td>
      <td class="event-name">${e.name}</td>
      <td>${e.location}</td>
    </tr>
  `).join('');
}

function renderSchedule(items) {
  const tbody = document.querySelector('#schedule-table tbody');
  tbody.innerHTML = items.map((s, i) => `
    <tr style="--row-color:${[COLORS.blue, COLORS.aqua, COLORS.yellow, COLORS.violet, COLORS.red][i % 5]}">
      <td>${s.time}</td>
      <td class="activity-name">${s.activity}</td>
      <td>${s.venue}</td>
    </tr>
  `).join('');
}

function renderPersonnel(list) {
  const el = document.getElementById('personnel-list');
  el.innerHTML = list.map(p => `
    <li><span class="role">${p.role}</span><span class="name">${p.name}</span></li>
  `).join('');
}

function renderProgress(list) {
  const el = document.getElementById('progress-list');
  el.innerHTML = list.map(t => `
    <div class="progress-row">
      <div class="progress-top"><span>${t.label}</span><span class="pct">${t.percent}%</span></div>
      <div class="progress-track"><div class="progress-fill" data-percent="${t.percent}"></div></div>
    </div>
  `).join('');

  // Widths are applied on the next frame so the CSS transition has a 0 to grow from.
  requestAnimationFrame(() => {
    el.querySelectorAll('.progress-fill').forEach(fill => {
      fill.style.width = fill.dataset.percent + '%';
    });
  });
}

function renderCountdown(list) {
  const el = document.getElementById('countdown-list');
  el.innerHTML = list.map(c => `
    <div class="countdown-tile" style="--tile-color:${COLORS[c.tag] || COLORS.blue}">
      <span class="days" data-days="${daysUntil(c.date)}">0</span>
      <span class="unit">DAYS</span>
      <span class="label">${c.label}</span>
      <span class="date">${formatDate(c.date)}</span>
    </div>
  `).join('');

  el.querySelectorAll('.days').forEach(node => {
    animateNumber(node, Number(node.dataset.days));
  });
}

function isVisible(visibility, key) {
  return !visibility || visibility[key] !== false;
}

function applyVisibility(visibility) {
  document.querySelectorAll('[data-section]').forEach(el => {
    el.hidden = !isVisible(visibility, el.getAttribute('data-section'));
  });
}

function setActiveNav(item) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  item.classList.add('active');
}

function setupSidebarNav() {
  document.querySelectorAll('[data-scroll-top]').forEach(item => {
    item.addEventListener('click', event => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveNav(item);
    });
  });
}

async function loadDashboard() {
  try {
    const res = await fetch('/api/dashboard');
    const data = await res.json();
    renderWorkforce(data.workforce);
    renderEvents(data.upcomingEvents);
    renderSchedule(data.todaySchedule);
    renderPersonnel(data.keyPersonnel);
    renderProgress(data.projectStatus);
    renderCountdown(data.deadlines);
    applyVisibility(data.visibility);
  } catch (err) {
    console.error('Failed to load dashboard data', err);
  }
}

startClock();
setupSidebarNav();
loadDashboard();

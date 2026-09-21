const COLORS = {
  green: '#34d399',
  amber: '#f5a524',
  red: '#f16063',
  blue: '#4f8ef7',
  teal: '#2dd4bf',
  gray: '#5b6577',
};

const ICONS = {
  file: '<path d="M6 2h9l5 5v15H6z"/><path d="M15 2v5h5"/>',
  plane: '<path d="M10.5 20.5 12 15l7-7c1-1 1-3 0-4-1-1-3-1-4 0l-7 7-5.5-1.5-2 2L6 17l1.5 5.5z"/>',
  book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 4.5v17"/>',
  clipboard: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/>',
  phone: '<path d="M4 5c0-1 1-2 2-2h2l2 5-2 2c1 3 3 5 6 6l2-2 5 2v2c0 1-1 2-2 2C10 20 4 14 4 5Z"/>',
};

let workforceChart = null;

function svgIcon(name) {
  return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8">${ICONS[name] || ICONS.file}</svg>`;
}

function startClock() {
  const dateEl = document.getElementById('clock-date');
  const timeEl = document.getElementById('clock-time');

  function tick() {
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase();
    timeEl.textContent = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }
  tick();
  setInterval(tick, 1000 * 15);

  document.getElementById('clock-loc').textContent = 'HQ Campus';
  document.getElementById('clock-temp').textContent = '27°C';
}

function renderWorkforce(wf) {
  const percent = wf.totalSanctioned ? Math.round((wf.present * 100) / wf.totalSanctioned) : 0;
  document.getElementById('wf-total').textContent = wf.totalSanctioned;
  document.getElementById('wf-percent').textContent = percent + '%';

  const segments = [
    { label: 'Present', value: wf.present, color: COLORS.green },
    { label: 'On Leave', value: wf.onLeave, color: COLORS.amber },
    { label: 'Field Duty', value: wf.onFieldDuty, color: COLORS.red },
    { label: 'Remote', value: wf.remote, color: COLORS.blue },
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
        borderWidth: 0,
        hoverOffset: 4,
      }],
    },
    options: {
      cutout: '72%',
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      animation: { duration: 700 },
    },
  });
}

function renderEvents(events) {
  const tbody = document.querySelector('#events-table tbody');
  tbody.innerHTML = events.map(e => `
    <tr style="--row-color:${COLORS[e.tag] || COLORS.blue}">
      <td>${e.date}</td>
      <td class="event-name">${e.name}</td>
      <td>${e.location}</td>
    </tr>
  `).join('');
}

function renderSchedule(items) {
  const tbody = document.querySelector('#schedule-table tbody');
  tbody.innerHTML = items.map((s, i) => `
    <tr style="--row-color:${[COLORS.blue, COLORS.teal, COLORS.amber, COLORS.green, COLORS.red][i % 5]}">
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

function renderNotices(list) {
  const el = document.getElementById('notice-list');
  el.innerHTML = list.map(n => `
    <li><span class="dot" style="background:${COLORS[n.priority] || COLORS.amber}"></span>${n.text}</li>
  `).join('');
}

function renderProgress(list) {
  const el = document.getElementById('progress-list');
  el.innerHTML = list.map(t => `
    <div class="progress-row">
      <div class="progress-top"><span>${t.label}</span><span class="pct">${t.percent}%</span></div>
      <div class="progress-track"><div class="progress-fill" style="width:${t.percent}%"></div></div>
    </div>
  `).join('');
}

function daysUntil(dateStr) {
  const target = new Date(dateStr);
  const now = new Date();
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return Math.max(diff, 0);
}

function renderCountdown(list) {
  const el = document.getElementById('countdown-list');
  el.innerHTML = list.map(c => `
    <div class="countdown-tile" style="--tile-color:${COLORS[c.tag] || COLORS.blue}">
      <span class="days">${daysUntil(c.date)}</span>
      <span class="unit">DAYS</span>
      <span class="label">${c.label}</span>
      <span class="date">${c.date}</span>
    </div>
  `).join('');
}

function renderQuickLinks(list) {
  const el = document.getElementById('quicklinks-grid');
  el.innerHTML = list.map(q => `
    <a class="quicklink" href="${q.href}">
      <span class="icon-circle">${svgIcon(q.icon)}</span>
      ${q.label}
    </a>
  `).join('');
}

function renderQuote(q) {
  document.getElementById('quote-text').textContent = `“${q.text}”`;
  document.getElementById('quote-author').textContent = `— ${q.author}`;
}

function isVisible(visibility, key) {
  return !visibility || visibility[key] !== false;
}

function applyVisibility(visibility) {
  document.querySelectorAll('[data-section]').forEach(el => {
    el.hidden = !isVisible(visibility, el.getAttribute('data-section'));
  });
  // A sidebar link to a card that is switched off would lead nowhere, so hide it too.
  document.querySelectorAll('[data-scroll-to]').forEach(el => {
    el.hidden = !isVisible(visibility, el.getAttribute('data-scroll-to'));
  });
}

function setActiveNav(item) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  item.classList.add('active');
}

function setupSidebarNav() {
  document.querySelectorAll('[data-scroll-to]').forEach(item => {
    item.addEventListener('click', event => {
      event.preventDefault();
      const target = document.querySelector(`[data-section="${item.getAttribute('data-scroll-to')}"]`);
      if (!target || target.hidden) return;
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setActiveNav(item);
    });
  });

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
    renderNotices(data.announcements);
    renderProgress(data.projectStatus);
    renderCountdown(data.deadlines);
    renderQuickLinks(data.quickLinks);
    renderQuote(data.quoteOfTheDay);
    applyVisibility(data.visibility);
  } catch (err) {
    console.error('Failed to load dashboard data', err);
  }
}

startClock();
setupSidebarNav();
loadDashboard();

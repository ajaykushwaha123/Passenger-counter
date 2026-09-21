/*
 * Offline mode shim. Loaded before app.js / admin.js in the single-file build.
 *
 * There is no server in this build, so the same /api/dashboard and
 * /api/admin/dashboard calls that app.js and admin.js already make are answered
 * from the browser's localStorage instead. That way both files stay unchanged
 * and the server build and the offline build share all their render logic.
 */
const OFFLINE_STORAGE_KEY = 'business-dashboard-data';
const OFFLINE_DEFAULT_DATA = __DEFAULT_DATA__;

function offlineLoadData() {
  try {
    const raw = localStorage.getItem(OFFLINE_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Browser storage unavailable, showing default content.', err);
  }
  return JSON.parse(JSON.stringify(OFFLINE_DEFAULT_DATA));
}

function offlineSaveData(data) {
  try {
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error('Could not save to browser storage', err);
    return false;
  }
}

function offlineJsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

window.fetch = function (url, options) {
  const opts = options || {};
  const target = String(url);
  const method = (opts.method || 'GET').toUpperCase();

  if (target.indexOf('/api/dashboard') !== -1 && method === 'GET') {
    return Promise.resolve(offlineJsonResponse(offlineLoadData()));
  }

  if (target.indexOf('/api/admin/dashboard') !== -1 && method === 'POST') {
    const data = JSON.parse(opts.body);
    if (!offlineSaveData(data)) {
      return Promise.resolve(offlineJsonResponse({ error: 'storage-unavailable' }, 500));
    }
    setTimeout(() => {
      if (typeof window.loadDashboard === 'function') window.loadDashboard();
    }, 0);
    return Promise.resolve(offlineJsonResponse(data));
  }

  return Promise.reject(new Error('Offline build: unsupported request ' + target));
};

function showView(name) {
  document.getElementById('view-dashboard').hidden = name !== 'dashboard';
  document.getElementById('view-admin').hidden = name !== 'admin';
  window.scrollTo(0, 0);
}

function resetToDefaults() {
  if (!window.confirm('Reset all dashboard content back to the original defaults?')) return;
  try {
    localStorage.removeItem(OFFLINE_STORAGE_KEY);
  } catch (err) {
    console.warn('Could not clear browser storage', err);
  }
  window.location.reload();
}

window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-open-admin]').forEach(el => {
    el.addEventListener('click', event => {
      event.preventDefault();
      showView('admin');
    });
  });

  document.querySelectorAll('[data-open-dashboard]').forEach(el => {
    el.addEventListener('click', event => {
      event.preventDefault();
      showView('dashboard');
    });
  });

  const actions = document.querySelector('#view-admin .admin-actions');
  if (actions) {
    const resetBtn = document.createElement('button');
    resetBtn.className = 'btn btn-ghost';
    resetBtn.textContent = 'Reset to defaults';
    resetBtn.addEventListener('click', resetToDefaults);
    actions.insertBefore(resetBtn, actions.firstChild);
  }
});

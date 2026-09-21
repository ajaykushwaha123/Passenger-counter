/*
 * Offline mode shim. Loaded before app.js / admin.js in the single-file build.
 *
 * There is no server in this build, so the same /api/dashboard and
 * /api/admin/dashboard calls that app.js and admin.js already make are answered
 * from the browser's localStorage instead. That way both files stay unchanged
 * and the server build and the offline build share all their render logic.
 *
 * Some browsers refuse localStorage on file:// pages (Safari always, Chrome when
 * cookies/site data are blocked). There, edits are kept in memory for the
 * session and the Download/Load buttons are the way to keep them for real.
 */
const OFFLINE_STORAGE_KEY = 'business-dashboard-data';
const OFFLINE_DEFAULT_DATA = __DEFAULT_DATA__;

let offlineMemoryData = null;

function offlineStorageWorks() {
  try {
    localStorage.setItem('__probe__', '1');
    localStorage.removeItem('__probe__');
    return true;
  } catch (err) {
    return false;
  }
}

function offlineLoadData() {
  if (offlineMemoryData) return offlineMemoryData;
  try {
    const raw = localStorage.getItem(OFFLINE_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Browser storage unavailable, showing default content.', err);
  }
  return JSON.parse(JSON.stringify(OFFLINE_DEFAULT_DATA));
}

/** Always keeps the data for this session; returns false if it could not be stored permanently. */
function offlineSaveData(data) {
  offlineMemoryData = data;
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
    const persisted = offlineSaveData(data);
    if (!persisted) showStorageWarning();
    setTimeout(() => {
      if (typeof window.loadDashboard === 'function') window.loadDashboard();
    }, 0);
    return Promise.resolve(offlineJsonResponse(data));
  }

  return Promise.reject(new Error('Offline build: unsupported request ' + target));
};

function showStorageWarning() {
  if (typeof window.showBanner !== 'function') return;
  window.showBanner(
    '<strong>This browser is blocking permanent saving.</strong> Your changes are showing now, ' +
    'but they will be lost when you close this tab. Click <em>Backup to file</em> to keep a copy, ' +
    'and <em>Restore from file</em> to bring it back next time. ' +
    '(In Chrome this is usually Settings &rarr; Privacy and security &rarr; Cookies: switch off "Block all cookies".)'
  );
}

function showView(name) {
  document.getElementById('view-dashboard').hidden = name !== 'dashboard';
  document.getElementById('view-admin').hidden = name !== 'admin';
  window.scrollTo(0, 0);
}

function applyImportedData(data) {
  offlineSaveData(data);
  if (typeof window.renderSections === 'function') window.renderSections(data);
  if (typeof window.loadDashboard === 'function') window.loadDashboard();
}

function downloadData() {
  const blob = new Blob([JSON.stringify(offlineLoadData(), null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'dashboard-data.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

function loadDataFromFile() {
  const picker = document.createElement('input');
  picker.type = 'file';
  picker.accept = 'application/json,.json';
  picker.style.display = 'none';
  // Some browsers ignore .click() on an input that is not in the document.
  document.body.appendChild(picker);
  picker.addEventListener('change', () => {
    const file = picker.files && picker.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          applyImportedData(JSON.parse(reader.result));
        } catch (err) {
          window.alert('That file could not be read as dashboard data.');
        }
      };
      reader.readAsText(file);
    }
    picker.remove();
  });
  picker.click();
}

function resetToDefaults() {
  if (!window.confirm('Reset all dashboard content back to the original defaults?')) return;
  offlineMemoryData = null;
  try {
    localStorage.removeItem(OFFLINE_STORAGE_KEY);
  } catch (err) {
    console.warn('Could not clear browser storage', err);
  }
  window.location.reload();
}

function addAdminButton(container, label, handler) {
  const button = document.createElement('button');
  button.className = 'btn btn-ghost';
  button.textContent = label;
  button.addEventListener('click', handler);
  container.insertBefore(button, container.firstChild);
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
    addAdminButton(actions, 'Reset to defaults', resetToDefaults);
    addAdminButton(actions, 'Restore from file', loadDataFromFile);
    addAdminButton(actions, 'Backup to file', downloadData);
  }

  if (!offlineStorageWorks()) showStorageWarning();
});

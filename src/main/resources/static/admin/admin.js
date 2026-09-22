// Fixed order - validated for colour-blind separation against the dashboard surface.
const TAG_COLORS = ['blue', 'aqua', 'yellow', 'magenta', 'violet', 'red', 'gray'];

const SECTIONS = [
  {
    key: 'workforce', title: 'Manpower Status', type: 'object', dataKey: 'workforce',
    fields: [
      { name: 'totalSanctioned', label: 'Total Sanctioned Strength', type: 'number' },
      { name: 'present', label: 'Present', type: 'number' },
      { name: 'onLeave', label: 'On Leave', type: 'number' },
      { name: 'onFieldDuty', label: 'On TD', type: 'number' },
      { name: 'remote', label: 'Attached', type: 'number' },
    ],
  },
  {
    key: 'events', title: 'Upcoming Events', type: 'list', dataKey: 'upcomingEvents', itemLabel: 'Event',
    fields: [
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'name', label: 'Event Name', type: 'text' },
      { name: 'tag', label: 'Colour Tag', type: 'select', options: TAG_COLORS },
    ],
  },
  {
    key: 'schedule', title: "Today's Programme", type: 'list', dataKey: 'todaySchedule', itemLabel: 'Item',
    fields: [
      { name: 'time', label: 'Time', type: 'text', placeholder: '09:00 - 09:30' },
      { name: 'activity', label: 'Activity', type: 'text' },
      { name: 'venue', label: 'Location', type: 'text' },
    ],
  },
  {
    key: 'personnel', title: 'Key Appointments', type: 'list', dataKey: 'keyPersonnel', itemLabel: 'Appointment',
    fields: [
      { name: 'role', label: 'Appointment', type: 'text' },
      { name: 'name', label: 'Name', type: 'text' },
    ],
  },
  {
    key: 'tasks', title: 'Task Status', type: 'list', dataKey: 'projectStatus', itemLabel: 'Task',
    fields: [
      { name: 'label', label: 'Task Name', type: 'text' },
      { name: 'percent', label: 'Percent Complete', type: 'number', min: 0, max: 100 },
    ],
  },
  {
    key: 'countdown', title: 'Countdown', type: 'list', dataKey: 'deadlines', itemLabel: 'Countdown',
    fields: [
      { name: 'label', label: 'Label', type: 'text' },
      { name: 'date', label: 'Target Date', type: 'date' },
      { name: 'tag', label: 'Colour', type: 'select', options: TAG_COLORS },
    ],
  },
  {
    key: 'quote', title: 'Quote of the Day', type: 'object', dataKey: 'quoteOfTheDay',
    fields: [
      { name: 'text', label: 'Quote', type: 'textarea' },
      { name: 'author', label: 'Author', type: 'text' },
    ],
  },
];

const PICKER_ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Returns yyyy-mm-dd for the date picker, or '' if the stored text isn't a date. */
function toPickerDate(value) {
  if (!value) return '';
  if (PICKER_ISO_DATE.test(value)) return value;
  const parsed = new Date(value);
  if (isNaN(parsed)) return '';
  const pad = n => String(n).padStart(2, '0');
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`;
}

function buildField(f, value) {
  const wrap = document.createElement('div');
  const label = document.createElement('label');
  label.textContent = f.label;
  wrap.appendChild(label);

  let input;
  if (f.type === 'textarea') {
    input = document.createElement('textarea');
    input.value = value ?? '';
  } else if (f.type === 'select') {
    input = document.createElement('select');
    // A value saved before this option list changed must stay selectable,
    // otherwise saving would silently rewrite it to the first option.
    const options = value && f.options.indexOf(value) === -1
      ? [value].concat(f.options)
      : f.options;
    options.forEach(opt => {
      const o = document.createElement('option');
      o.value = opt;
      o.textContent = opt;
      if (opt === value) o.selected = true;
      input.appendChild(o);
    });
  } else if (f.type === 'date') {
    const picker = toPickerDate(value);
    input = document.createElement('input');
    // Text the picker can't represent stays an editable text box rather than
    // being blanked out and lost on the next save.
    input.type = picker || !value ? 'date' : 'text';
    input.value = picker || value || '';
  } else {
    input = document.createElement('input');
    input.type = f.type === 'number' ? 'number' : 'text';
    if (f.placeholder) input.placeholder = f.placeholder;
    if (f.min !== undefined) input.min = f.min;
    if (f.max !== undefined) input.max = f.max;
    input.value = value ?? (f.type === 'number' ? 0 : '');
  }
  input.dataset.field = f.name;
  input.dataset.type = f.type;
  wrap.appendChild(input);
  return wrap;
}

function readValue(input) {
  if (input.dataset.type === 'number') {
    const n = parseFloat(input.value);
    return isNaN(n) ? 0 : n;
  }
  return input.value;
}

/**
 * Asks for a new entry in a dialog rather than appending a blank row, so adding
 * to a long list doesn't mean scrolling to the bottom of the page to fill it in.
 */
function openAddDialog(section, onAdd) {
  const dialog = document.getElementById('add-dialog');
  const fields = document.getElementById('add-dialog-fields');
  document.getElementById('add-dialog-title').textContent = 'Add ' + section.itemLabel;

  fields.innerHTML = '';
  section.fields.forEach(f => fields.appendChild(buildField(f, undefined)));

  function handleClose() {
    dialog.removeEventListener('close', handleClose);
    if (dialog.returnValue !== 'add') return;
    const item = {};
    fields.querySelectorAll('[data-field]').forEach(input => {
      item[input.dataset.field] = readValue(input);
    });
    onAdd(item);
  }

  dialog.addEventListener('close', handleClose);
  dialog.returnValue = '';
  dialog.showModal();
  const first = fields.querySelector('[data-field]');
  if (first) first.focus();
}

function buildObjectForm(section, data) {
  const wrap = document.createElement('div');
  wrap.className = 'field-row';
  section.fields.forEach(f => wrap.appendChild(buildField(f, data[f.name])));
  return wrap;
}

function buildListEditor(section, items) {
  const listWrap = document.createElement('div');
  listWrap.className = 'list-editor';

  function addRow(item, scrollIntoView) {
    const row = document.createElement('div');
    row.className = 'item-row';

    const top = document.createElement('div');
    top.className = 'item-row-top';
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => row.remove());
    top.appendChild(removeBtn);
    row.appendChild(top);

    const fieldsWrap = document.createElement('div');
    fieldsWrap.className = 'field-row';
    section.fields.forEach(f => fieldsWrap.appendChild(buildField(f, item ? item[f.name] : undefined)));
    row.appendChild(fieldsWrap);

    listWrap.appendChild(row);
    if (scrollIntoView) row.scrollIntoView({ block: 'nearest' });
  }

  items.forEach(item => addRow(item, false));

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'add-btn';
  addBtn.textContent = `+ Add ${section.itemLabel}`;
  addBtn.addEventListener('click', () => openAddDialog(section, item => addRow(item, true)));

  // The button is handed back separately so the card can pin it above the
  // scrolling list - at the bottom it sat below the fold on a long list.
  return { list: listWrap, addBtn };
}

function renderSections(config) {
  const container = document.getElementById('admin-sections');
  container.innerHTML = '';

  SECTIONS.forEach(section => {
    const card = document.createElement('div');
    card.className = 'admin-card';
    card.dataset.sectionKey = section.key;

    const visible = !config.visibility || config.visibility[section.key] !== false;

    const head = document.createElement('div');
    head.className = 'admin-card-head';
    head.innerHTML = `
      <h3>${section.title}</h3>
      <label class="toggle" title="Show on dashboard">
        <input type="checkbox" class="visibility-toggle" ${visible ? 'checked' : ''}>
        <span class="toggle-track"></span>
      </label>
    `;
    card.appendChild(head);

    if (section.type !== 'toggle') {
      const body = document.createElement('div');
      body.className = 'admin-card-body';
      const data = config[section.dataKey];
      if (section.type === 'object') {
        body.appendChild(buildObjectForm(section, data || {}));
      } else {
        const editor = buildListEditor(section, data || []);
        card.appendChild(editor.addBtn);
        body.appendChild(editor.list);
      }
      card.appendChild(body);
    } else if (section.note) {
      const note = document.createElement('p');
      note.className = 'admin-note';
      note.textContent = section.note;
      card.appendChild(note);
    }

    container.appendChild(card);
  });
}

function collectConfig() {
  const result = { visibility: {} };

  document.querySelectorAll('.admin-card').forEach(card => {
    const key = card.dataset.sectionKey;
    const section = SECTIONS.find(s => s.key === key);
    result.visibility[key] = card.querySelector('.visibility-toggle').checked;

    if (section.type === 'toggle') return;

    if (section.type === 'object') {
      const obj = {};
      card.querySelectorAll('.admin-card-body [data-field]').forEach(input => {
        obj[input.dataset.field] = readValue(input);
      });
      result[section.dataKey] = obj;
    } else {
      const list = [];
      card.querySelectorAll('.item-row').forEach(row => {
        const obj = {};
        row.querySelectorAll('[data-field]').forEach(input => {
          obj[input.dataset.field] = readValue(input);
        });
        list.push(obj);
      });
      result[section.dataKey] = list;
    }
  });

  return result;
}

function showBanner(message) {
  const banner = document.getElementById('admin-banner');
  if (!banner) return;
  banner.innerHTML = message;
  banner.hidden = false;
}

function hideBanner() {
  const banner = document.getElementById('admin-banner');
  if (banner) banner.hidden = true;
}

async function failureReason(res) {
  if (res.status === 401 || res.status === 403) {
    return 'your login expired - reload the page and sign in again';
  }
  try {
    const body = await res.json();
    if (body && body.message) return body.message;
  } catch (ignored) {
    // no JSON body to explain the failure
  }
  return 'the server answered with HTTP ' + res.status;
}

async function save() {
  const btn = document.getElementById('save-btn');
  const status = document.getElementById('save-status');
  btn.disabled = true;
  status.classList.remove('error');
  status.textContent = 'Saving...';
  hideBanner();

  try {
    const config = collectConfig();
    const res = await fetch('/api/admin/dashboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error(await failureReason(res));
    status.textContent = 'Saved ✓';
    setTimeout(() => { status.textContent = ''; }, 2500);
  } catch (err) {
    console.error('Failed to save dashboard config', err);
    status.textContent = 'Save failed';
    status.classList.add('error');
    showBanner('<strong>Could not save:</strong> ' + err.message);
  } finally {
    btn.disabled = false;
  }
}

async function init() {
  try {
    const res = await fetch('/api/dashboard');
    const config = await res.json();
    renderSections(config);
  } catch (err) {
    console.error('Failed to load dashboard config', err);
    document.getElementById('admin-sections').innerHTML = '<p class="loading">Failed to load dashboard data.</p>';
  }
}

document.getElementById('save-btn').addEventListener('click', save);
init();

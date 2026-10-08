/*
 * Form Block
 * Renders a form from either:
 *  1. a link to a spreadsheet JSON form definition (Block Collection convention:
 *     columns Name, Type, Label, Placeholder, Value, Options, Mandatory, Fieldset), plus an
 *     optional second link used as the submit endpoint; or
 *  2. inline rows, one field per row: Label | Type | Placeholder or Options | Required.
 * Optional leading heading/text content is kept above the form.
 */

const FIELD_TYPES = ['text', 'email', 'tel', 'number', 'password', 'date', 'url', 'textarea',
  'select', 'checkbox', 'radio', 'fieldset', 'heading', 'plaintext', 'submit', 'hidden'];

let fieldCounter = 0;

const toName = (str) => String(str || '').toLowerCase().trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const isTruthy = (v) => ['true', 'yes', 'x', 'required', '1', '*'].includes(String(v || '').toLowerCase().trim());

const splitOptions = (v) => String(v || '').split(/[,\n]/).map((o) => o.trim()).filter(Boolean);

function normalizeField(raw) {
  const get = (...keys) => {
    const key = Object.keys(raw).find((k) => keys.includes(k.toLowerCase()));
    return key ? raw[key] : '';
  };
  let type = String(get('type') || 'text').toLowerCase().trim();
  if (!FIELD_TYPES.includes(type)) type = 'text';
  const label = get('label');
  return {
    type,
    label,
    name: toName(get('name') || label) || `field-${fieldCounter + 1}`,
    placeholder: get('placeholder'),
    value: get('value', 'default'),
    options: splitOptions(get('options')),
    required: isTruthy(get('mandatory', 'required')),
    fieldset: toName(get('fieldset')),
  };
}

function createLabel(fd, id) {
  const label = document.createElement('label');
  label.htmlFor = id;
  label.textContent = fd.label;
  if (fd.required) label.dataset.required = 'true';
  return label;
}

function createControl(fd, id) {
  let control;
  if (fd.type === 'textarea') {
    control = document.createElement('textarea');
  } else if (fd.type === 'select') {
    control = document.createElement('select');
    if (fd.placeholder) {
      const ph = document.createElement('option');
      ph.value = '';
      ph.textContent = fd.placeholder;
      ph.disabled = true;
      ph.selected = !fd.value;
      control.append(ph);
    }
    fd.options.forEach((o) => {
      const opt = document.createElement('option');
      opt.value = o;
      opt.textContent = o;
      if (o === fd.value) opt.selected = true;
      control.append(opt);
    });
  } else {
    control = document.createElement('input');
    control.type = fd.type;
  }
  control.id = id;
  control.name = fd.name;
  if (fd.placeholder && fd.type !== 'select') control.placeholder = fd.placeholder;
  if (fd.value && fd.type !== 'select' && fd.type !== 'checkbox') control.value = fd.value;
  if (fd.type === 'checkbox') control.value = fd.value || 'on';
  if (fd.required) control.required = true;
  return control;
}

function createChoiceGroup(fd) {
  const group = document.createElement('fieldset');
  group.className = 'form-choice-group';
  if (fd.label) {
    const legend = document.createElement('legend');
    legend.textContent = fd.label;
    group.append(legend);
  }
  fd.options.forEach((o) => {
    fieldCounter += 1;
    const id = `form-${fd.name}-${fieldCounter}`;
    const wrap = document.createElement('div');
    wrap.className = 'form-choice';
    const input = document.createElement('input');
    input.type = fd.type;
    input.id = id;
    input.name = fd.name;
    input.value = o;
    if (fd.required && fd.type === 'radio') input.required = true;
    const label = document.createElement('label');
    label.htmlFor = id;
    label.textContent = o;
    wrap.append(input, label);
    group.append(wrap);
  });
  return group;
}

function createField(fd) {
  fieldCounter += 1;
  const id = `form-${fd.name}-${fieldCounter}`;
  const wrapper = document.createElement('div');
  wrapper.className = `form-field form-${fd.type}-wrapper`;
  wrapper.dataset.fieldset = fd.fieldset;

  switch (fd.type) {
    case 'heading': {
      const h = document.createElement('h3');
      h.textContent = fd.label || fd.value;
      wrapper.append(h);
      break;
    }
    case 'plaintext': {
      const p = document.createElement('p');
      p.textContent = fd.label || fd.value;
      wrapper.append(p);
      break;
    }
    case 'submit': {
      const button = document.createElement('button');
      button.type = 'submit';
      button.className = 'button';
      button.textContent = fd.label || fd.value || 'Submit';
      wrapper.append(button);
      break;
    }
    case 'hidden':
      wrapper.hidden = true;
      wrapper.append(createControl(fd, id));
      break;
    case 'checkbox':
      if (fd.options.length > 1) {
        wrapper.append(createChoiceGroup(fd));
      } else {
        wrapper.append(createControl(fd, id), createLabel(fd, id));
      }
      break;
    case 'radio':
      wrapper.append(createChoiceGroup(fd));
      break;
    default:
      if (fd.label) wrapper.append(createLabel(fd, id));
      wrapper.append(createControl(fd, id));
  }
  return wrapper;
}

function buildForm(fields, action) {
  const form = document.createElement('form');
  form.noValidate = false;
  if (action) form.dataset.action = action;

  const fieldsets = {};
  fields.forEach((fd) => {
    if (fd.type === 'fieldset') {
      const fs = document.createElement('fieldset');
      fs.className = 'form-fieldset';
      fs.name = fd.name;
      if (fd.label) {
        const legend = document.createElement('legend');
        legend.textContent = fd.label;
        fs.append(legend);
      }
      fieldsets[fd.name] = fs;
      form.append(fs);
      return;
    }
    const el = createField(fd);
    const target = (fd.fieldset && fieldsets[fd.fieldset]) || form;
    target.append(el);
  });

  if (!fields.some((f) => f.type === 'submit')) {
    form.append(createField({ type: 'submit', label: 'Submit', name: 'submit' }));
  }
  return form;
}

async function handleSubmit(form, block) {
  const { action } = form.dataset;
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  const submit = form.querySelector('button[type="submit"]');
  if (submit) submit.disabled = true;
  const data = Object.fromEntries(new FormData(form).entries());
  let ok = true;
  if (action) {
    try {
      const resp = await fetch(action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });
      ok = resp.ok;
    } catch {
      ok = false;
    }
  }
  if (submit) submit.disabled = false;
  block.classList.toggle('form-submitted', ok);
  block.classList.toggle('form-error', !ok);
  let status = block.querySelector('.form-status');
  if (!status) {
    status = document.createElement('p');
    status.className = 'form-status';
    status.setAttribute('role', 'status');
    form.after(status);
  }
  status.textContent = ok ? 'Thank you for your submission.' : 'Something went wrong. Please try again.';
  if (ok) form.reset();
}

async function fetchDefinition(href) {
  try {
    const resp = await fetch(href);
    if (!resp.ok) return [];
    const json = await resp.json();
    return json.data || json[Object.keys(json).find((k) => json[k]?.data)]?.data || [];
  } catch {
    return [];
  }
}

function rowsToFields(rows) {
  return rows.map((row) => {
    const [label, type, third, required] = [...row.children].map((c) => c.textContent.trim());
    const t = String(type || 'text').toLowerCase();
    const isChoice = ['select', 'radio', 'checkbox'].includes(t);
    return normalizeField({
      label,
      type: t,
      placeholder: isChoice ? '' : third,
      options: isChoice ? third : '',
      mandatory: required,
    });
  });
}

export default async function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const isFieldRow = (row) => row.children.length >= 2
    && FIELD_TYPES.includes(row.children[1].textContent.trim().toLowerCase());
  const fieldRows = rows.filter(isFieldRow);
  const otherRows = rows.filter((r) => !isFieldRow(r));

  // link-only rows configure the form: a .json definition and/or a submit endpoint
  const isLinkRow = (row) => {
    const a = row.querySelector('a');
    return a && row.textContent.trim() === a.textContent.trim();
  };
  const links = otherRows.filter(isLinkRow).map((r) => r.querySelector('a').href);
  const isJson = (h) => /\.json$/.test(new URL(h, window.location.href).pathname);
  const definitionLink = links.find(isJson);
  const action = links.find((h) => h !== definitionLink);

  // remaining content (heading / intro text) is kept above the form
  const intro = document.createElement('div');
  intro.className = 'form-intro';
  otherRows.filter((r) => !isLinkRow(r) && r.textContent.trim()).forEach((row) => {
    [...row.children].forEach((c) => intro.append(...c.childNodes));
  });

  let fields = [];
  if (definitionLink) {
    fields = (await fetchDefinition(definitionLink)).map(normalizeField);
  } else {
    fields = rowsToFields(fieldRows);
  }

  block.textContent = '';
  if (intro.childNodes.length) block.append(intro);
  if (!fields.length) return;

  const form = buildForm(fields, action);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSubmit(form, block);
  });
  block.append(form);
}

// site languages that have their own footer fragment
const LOCALES = ['es', 'fr', 'jp'];

/**
 * Returns the page's language folder (e.g. 'es'), or '' for the default site.
 * Local preview serves pages under /content, so that prefix is ignored.
 * @returns {string}
 */
function getLocale() {
  const parts = window.location.pathname.split('/').filter(Boolean);
  if (parts[0] === 'content') parts.shift();
  return LOCALES.includes(parts[0]) ? parts[0] : '';
}

/**
 * Fetches the footer fragment. Local preview serves it under /content,
 * DA/EDS serves it from the site root.
 * @returns {Promise<{html: string, base: string}|null>}
 */
async function fetchFooter() {
  // localized footer first (e.g. /es/...), then the default footer
  const locale = getLocale();
  if (locale) {
    let localized = await fetch(`/content/${locale}/footer.plain.html`);
    if (!localized.ok) localized = await fetch(`/${locale}/footer.plain.html`);
    if (localized.ok) return { html: await localized.text(), base: localized.url };
  }
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  return { html: await resp.text(), base: resp.url };
}

/**
 * True when a section is made of heading + list pairs (link columns).
 * @param {Element} section
 * @returns {boolean}
 */
function isLinkColumns(section) {
  const children = [...section.children];
  return children.length > 1
    && children.some((el) => el.tagName === 'UL')
    && children.every((el) => /^(H[1-6]|UL)$/.test(el.tagName));
}

/**
 * Groups heading + list pairs into column cells.
 * @param {Element} section
 * @returns {Element} columns wrapper
 */
function buildColumns(section) {
  const wrapper = document.createElement('div');
  wrapper.className = 'columns-wrapper';
  const columns = document.createElement('div');
  columns.className = 'columns';
  const row = document.createElement('div');
  let cell;
  [...section.children].forEach((el) => {
    if (!cell || /^H[1-6]$/.test(el.tagName)) {
      cell = document.createElement('div');
      row.append(cell);
    }
    cell.append(el);
  });
  columns.append(row);
  wrapper.append(columns);
  return wrapper;
}

/**
 * Wraps loose content in a default content wrapper.
 * @param {Element} section
 * @returns {Element}
 */
function buildDefaultContent(section) {
  const wrapper = document.createElement('div');
  wrapper.className = 'default-content-wrapper';
  wrapper.append(...section.childNodes);
  return wrapper;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooter();
  block.textContent = '';
  if (!fragment) return;

  const doc = new DOMParser().parseFromString(fragment.html, 'text/html');
  doc.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), fragment.base).href;
    img.loading = 'lazy';
  });

  const footer = document.createElement('div');
  let previous = null;
  [...doc.body.children].filter((el) => el.tagName === 'DIV').forEach((source) => {
    if (isLinkColumns(source) && previous) {
      // link columns share a row with the preceding content
      previous.append(buildColumns(source));
      return;
    }
    const section = document.createElement('div');
    section.className = 'section';
    section.append(isLinkColumns(source) ? buildColumns(source) : buildDefaultContent(source));
    footer.append(section);
    previous = section;
  });

  footer.querySelectorAll('a').forEach((link) => {
    if (!link.textContent.trim() && !link.getAttribute('aria-label')) {
      link.setAttribute('aria-label', link.querySelector('img')?.alt || 'Home');
    }
  });

  block.append(footer);
}

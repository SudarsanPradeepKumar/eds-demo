// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

const SECTION_NAMES = ['announcements', 'brand', 'sections', 'tools'];

/**
 * Fetches the nav fragment. Local preview serves it under /content,
 * DA/EDS serves it from the site root.
 * @returns {Promise<{html: string, base: string}|null>}
 */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  return { html: await resp.text(), base: resp.url };
}

/**
 * Turns a label into a class-safe slug.
 * @param {string} text
 * @returns {string}
 */
function slugify(text) {
  return (text || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Closes all tool panels except the one passed in.
 * @param {Element} nav
 * @param {Element} [except]
 */
function closeToolPanels(nav, except) {
  nav.querySelectorAll('.nav-tools-wrapper').forEach((wrapper) => {
    if (wrapper === except) return;
    wrapper.querySelector('.nav-tools-panel')?.classList.remove('nav-tools-panel--show');
    wrapper.querySelector('button')?.setAttribute('aria-expanded', 'false');
  });
}

/**
 * Toggles all nav section dropdowns
 * @param {Element} sections The container element
 * @param {Boolean|string} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  sections.querySelectorAll('.nav-drop > button').forEach((button) => {
    button.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Closes the open dropdown, panel, or mobile menu on Escape
 * @param {KeyboardEvent} e keydown event
 */
function closeOnEscape(e) {
  if (e.code !== 'Escape') return;
  const nav = document.getElementById('nav');
  if (!nav) return;
  closeToolPanels(nav);
  const navSections = nav.querySelector('.nav-sections');
  if (isDesktop.matches) {
    toggleAllNavSections(navSections);
  } else if (nav.getAttribute('aria-expanded') === 'true') {
    // eslint-disable-next-line no-use-before-define
    toggleMenu(nav, navSections, false);
    nav.querySelector('.nav-hamburger button').focus();
  }
}

/**
 * Toggles the entire nav (mobile menu)
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, 'false');
  if (button) button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
}

/**
 * Builds a search form panel from a text-only list (the text is the placeholder).
 * @param {Element} list nested list from the fragment
 * @param {string} action form action
 * @returns {Element}
 */
function buildSearchPanel(list, action) {
  const panel = document.createElement('div');
  panel.className = 'nav-tools-panel nav-search-panel';
  const form = document.createElement('form');
  form.action = action;
  form.method = 'GET';
  form.setAttribute('role', 'search');
  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'q';
  input.placeholder = list.querySelector('li')?.textContent.trim() || '';
  input.setAttribute('aria-label', input.placeholder || 'Search');
  form.append(input);
  panel.append(form);
  return panel;
}

/**
 * Builds a menu panel from a list: text-only items become headings,
 * links become entries, and the last link becomes the primary action.
 * @param {Element} list nested list from the fragment
 * @returns {Element}
 */
function buildMenuPanel(list) {
  const panel = document.createElement('div');
  panel.className = 'nav-tools-panel nav-menu-panel';
  const items = [...list.querySelectorAll(':scope > li')];
  const links = items.filter((li) => li.querySelector('a'));
  items.forEach((li) => {
    const link = li.querySelector('a');
    if (!link) {
      const title = document.createElement('p');
      title.className = 'nav-panel-title';
      title.textContent = li.textContent.trim();
      panel.append(title);
      return;
    }
    const entry = link.cloneNode(true);
    entry.className = li === links[links.length - 1] ? 'nav-panel-action' : 'nav-panel-link';
    panel.append(entry);
  });
  return panel;
}

/**
 * Decorates the tools section: icon links, panel toggles and text links.
 * @param {Element} navTools
 */
function decorateTools(navTools) {
  const list = navTools.querySelector('ul');
  if (!list) return;
  const tools = document.createElement('div');
  tools.className = 'nav-tools-list';
  [...list.querySelectorAll(':scope > li')].forEach((li) => {
    const link = li.querySelector(':scope > a');
    if (!link) return;
    const img = link.querySelector('img');
    const label = img ? img.alt : link.textContent.trim();
    const slug = slugify(label);
    const subList = li.querySelector(':scope > ul');
    const wrapper = document.createElement('div');
    wrapper.className = `nav-tools-wrapper nav-${slug}-wrapper`;

    if (!img) {
      link.className = 'nav-tool-link';
      wrapper.append(link);
    } else if (!subList) {
      link.className = `nav-tool-icon nav-${slug}-button`;
      link.setAttribute('aria-label', label);
      img.alt = '';
      wrapper.append(link);
    } else {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `nav-tool-icon nav-${slug}-button`;
      button.setAttribute('aria-label', label);
      button.setAttribute('aria-expanded', 'false');
      img.alt = '';
      button.append(img);
      const hasLinks = !!subList.querySelector('a');
      const panel = hasLinks ? buildMenuPanel(subList) : buildSearchPanel(subList, link.href);
      panel.classList.add(`nav-${slug}-panel`);
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const show = !panel.classList.contains('nav-tools-panel--show');
        closeToolPanels(navTools.closest('nav'), wrapper);
        panel.classList.toggle('nav-tools-panel--show', show);
        button.setAttribute('aria-expanded', show);
        if (show) panel.querySelector('input')?.focus();
      });
      wrapper.append(button, panel);
    }
    tools.append(wrapper);
  });
  list.replaceWith(tools);
}

/**
 * Decorates nav sections: links stay links; items with nested lists become dropdowns.
 * @param {Element} navSections
 */
function decorateSections(navSections) {
  navSections.querySelectorAll(':scope ul > li').forEach((navSection) => {
    const subList = navSection.querySelector(':scope > ul');
    if (!subList || navSection.parentElement.closest('li')) return;
    navSection.classList.add('nav-drop');
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-expanded', false);
    [...navSection.childNodes].forEach((node) => {
      if (node !== subList) button.append(node);
    });
    navSection.prepend(button);
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      if (isDesktop.matches) toggleAllNavSections(navSections);
      button.setAttribute('aria-expanded', !expanded);
    });
  });
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNav();
  block.textContent = '';
  if (!fragment) return;

  const doc = new DOMParser().parseFromString(fragment.html, 'text/html');
  // resolve fragment-relative image paths against the fragment location
  doc.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), fragment.base).href;
    img.loading = 'eager';
  });

  const nav = document.createElement('nav');
  nav.id = 'nav';
  const sections = [...doc.body.children].filter((el) => el.tagName === 'DIV');
  sections.forEach((section, i) => {
    if (SECTION_NAMES[i]) section.className = `section nav-${SECTION_NAMES[i]}`;
  });

  const announcements = sections.find((s) => s.classList.contains('nav-announcements'));
  sections.filter((s) => s !== announcements).forEach((s) => nav.append(s));

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand?.querySelector('a');
  if (brandLink && !brandLink.textContent.trim()) {
    brandLink.setAttribute('aria-label', brandLink.querySelector('img')?.alt || 'Home');
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) decorateSections(navSections);

  const navTools = nav.querySelector('.nav-tools');
  if (navTools) decorateTools(navTools);

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  if (announcements) {
    const announcementWrapper = document.createElement('div');
    announcementWrapper.className = 'announcement-wrapper';
    announcementWrapper.append(announcements);
    navWrapper.append(announcementWrapper);
  }
  navWrapper.append(nav);
  block.append(navWrapper);

  // close panels on outside click and Escape
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-tools-wrapper')) closeToolPanels(nav);
  });
  window.addEventListener('keydown', closeOnEscape);

  // reset mobile/desktop state when crossing the breakpoint
  isDesktop.addEventListener('change', () => {
    closeToolPanels(nav);
    toggleMenu(nav, navSections, false);
  });
}

/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Frescopa section breaks and Section Metadata.
 *
 * Uses payload.template.sections from page-templates.json. Section selectors
 * (verified in migration-work/cleaned.html):
 *   div.section.teaser-container, div.section.offer-container,
 *   div.section.store-locator-container, div.section.card-tiles.cards-container,
 *   div.section.home.cards-container, div.section.reward-container
 *
 * Breaks are inserted in beforeTransform (while section elements still exist,
 * before parsers replace them); Section Metadata is added in afterTransform,
 * anchored to a marker <hr>. Sections are processed in reverse order.
 */
const SECTION_MARKER_ATTR = 'data-excat-section-id';
const FIRST_SECTION_ATTR = 'data-excat-first-section';

// section.selector is an array of candidate selectors - first match wins.
function querySection(root, selectors) {
  const list = Array.isArray(selectors) ? selectors : [selectors];
  for (const sel of list) {
    if (!sel) continue;
    const el = root.querySelector(sel);
    if (el) return el;
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = (payload && payload.template && payload.template.sections) || [];
  if (sections.length < 2) return;
  const doc = element.ownerDocument || document;

  if (hookName === 'beforeTransform') {
    // the first section on the page (by position, not template order) gets no leading break
    const firstOnPage = element.querySelector('main > div.section') || element.querySelector('div.section');
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const sectionEl = querySection(element, section.selector);
      if (!sectionEl) continue;
      const isFirst = sectionEl === firstOnPage;
      if (isFirst && !section.style) continue;

      const hr = doc.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      if (isFirst) hr.setAttribute(FIRST_SECTION_ATTR, 'true');
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || querySection(element, section.selector);
      if (!anchor) continue;

      const metadataBlock = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        // the first section never gets a real leading break
        if (marker.hasAttribute(FIRST_SECTION_ATTR)) marker.remove();
      }
    }
  }
}

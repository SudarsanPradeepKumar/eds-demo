/* eslint-disable */
/* global WebImporter */
/**
 * Parser for sticky-cta. Source: div.sticky-cta.block (icon + link pill).
 * Target model (blocks/sticky-cta): row 1 = icon, row 2 = link.
 */
export default function parse(element, { document }) {
  const link = element.querySelector('a[href]');
  if (!link) {
    element.remove();
    return;
  }
  const img = element.querySelector('img');
  const a = document.createElement('a');
  a.href = link.getAttribute('href');
  a.textContent = link.textContent.trim();
  const cells = [];
  if (img) {
    const icon = img.cloneNode(true);
    icon.removeAttribute('class');
    cells.push([icon]);
  }
  cells.push([a]);
  const block = WebImporter.Blocks.createBlock(document, { name: 'sticky-cta', cells });
  element.replaceWith(block);
}

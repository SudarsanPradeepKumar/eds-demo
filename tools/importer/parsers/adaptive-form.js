/* eslint-disable */
/* global WebImporter */
/**
 * Parser for adaptive-form. Sources: div.form.block (inline Adaptive Form JSON)
 * and div.embed-adaptive-form.block (link to an AEM form path).
 * Forms are migrated later, so the block only preserves the ORIGINAL authored
 * definition. The rendered DOM no longer contains it, so it is read from the
 * page's source document (<page>.plain.html, same origin).
 */
function readSourceForms(pageUrl, document) {
  try {
    const { origin, pathname } = new URL(pageUrl);
    const docPath = pathname.endsWith('/') ? `${pathname}index` : pathname.replace(/\.html?$/, '');
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `${origin}${docPath}.plain.html`, false); // sync: parsers are synchronous
    xhr.send();
    if (xhr.status !== 200) return [];
    const doc = new DOMParser().parseFromString(xhr.responseText, 'text/html');
    return [...doc.querySelectorAll('div.form, div.embed-adaptive-form')];
  } catch (e) {
    console.warn('adaptive-form: could not read source document', e);
    return [];
  }
}

export default function parse(element, { document, url, params }) {
  const pageUrl = (params && params.originalURL) || url;
  const sourceForms = readSourceForms(pageUrl, document);
  // earlier forms were already replaced, so the remaining count gives our index
  const remaining = document.querySelectorAll('.form.block, .embed-adaptive-form.block').length;
  const source = sourceForms[sourceForms.length - remaining];

  let cell = '';
  const link = source ? source.querySelector('a[href]') : element.querySelector('a[href]');
  const code = source ? source.querySelector('pre code, code, pre') : null;
  if (code) {
    const pre = document.createElement('pre');
    const c = document.createElement('code');
    c.textContent = code.textContent.trim();
    pre.append(c);
    cell = pre;
  } else if (link) {
    const a = document.createElement('a');
    a.href = link.getAttribute('href');
    a.textContent = link.getAttribute('href');
    cell = a;
  }
  if (!cell) {
    console.warn('adaptive-form: no form definition found');
    element.remove();
    return;
  }
  const block = WebImporter.Blocks.createBlock(document, { name: 'adaptive-form', cells: [[cell]] });
  element.replaceWith(block);
}

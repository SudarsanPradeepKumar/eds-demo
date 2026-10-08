import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * A card body is "label only" when it carries a single short heading/line
 * and no copy - e.g. product-category tiles (icon + label).
 * @param {Element} body
 * @returns {boolean}
 */
function isLabelOnly(body) {
  const els = [...body.children];
  if (els.length !== 1) return !els.length && body.textContent.trim().length > 0;
  return /^(H[1-6]|P)$/.test(els[0].tagName) && !els[0].querySelector('picture, img');
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    // Skip rows authors left completely empty.
    if (!row.textContent.trim() && !row.querySelector('picture, img')) return;
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (!div.textContent.trim() && !div.querySelector('picture, img')) {
        div.remove();
        return;
      }
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));

  // A paragraph holding only link(s) is the card's call to action: tag it as a styling hook
  // for the design pass (authored strong/em links are already buttons via scripts.js).
  ul.querySelectorAll('.cards-card-body > p').forEach((p) => {
    const links = [...p.querySelectorAll('a[href]')];
    if (!links.length || p.querySelector('picture, img')) return;
    const linkText = links.map((a) => a.textContent).join('').replace(/\s+/g, '');
    if (linkText && p.textContent.replace(/\s+/g, '') === linkText) p.classList.add('cards-card-cta');
  });

  // Image + label tiles (no copy) use a compact, single-row grid with
  // uncropped images; cards with copy keep the default layout.
  const items = [...ul.children];
  const compact = items.length > 0 && items.every((li) => {
    const body = li.querySelector('.cards-card-body');
    return li.querySelector('.cards-card-image') && (!body || isLabelOnly(body));
  });
  block.classList.toggle('cards-compact', compact);

  block.replaceChildren(ul);
}

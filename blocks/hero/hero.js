/**
 * Returns true when a paragraph holds only link(s) - i.e. a call to action.
 * @param {Element} el
 * @returns {boolean}
 */
function isCta(el) {
  if (!el || el.tagName !== 'P') return false;
  const links = [...el.querySelectorAll('a[href]')];
  if (!links.length || el.querySelector('picture, img')) return false;
  const linkText = links.map((a) => a.textContent).join('').replace(/\s+/g, '');
  return el.textContent.replace(/\s+/g, '') === linkText;
}

/**
 * Hero: full-bleed background image with a text panel (eyebrow, heading,
 * copy, CTA) overlaid on the left.
 *
 * Content model (one row, cells in any order, all optional):
 *   | picture | eyebrow paragraph, heading, paragraph(s), CTA link(s) |
 * The picture may also arrive as a Dynamic Media link that scripts.js
 * rebuilds into a <picture> before this block runs. Extra rows/cells are
 * folded into the text panel.
 * @param {Element} block
 */
export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const picture = block.querySelector('picture');

  const background = document.createElement('div');
  background.className = 'hero-background';
  const content = document.createElement('div');
  content.className = 'hero-content';

  if (picture) {
    const wrapper = picture.parentElement;
    background.append(picture);
    // Drop a <p> that only wrapped the picture.
    if (wrapper && wrapper.tagName === 'P' && !wrapper.textContent.trim()
      && !wrapper.children.length) wrapper.remove();
    // The hero is the LCP candidate: load its image eagerly.
    const img = picture.querySelector('img');
    if (img) img.loading = 'eager';
  }

  cells.forEach((cell) => {
    if (cell.childElementCount === 0) {
      // Bare text directly in a cell.
      if (cell.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = cell.textContent.trim();
        content.append(p);
      }
      return;
    }
    [...cell.children].forEach((child) => {
      if (!child.textContent.trim() && !child.querySelector('picture, img, a')) return;
      content.append(child);
    });
  });

  // Eyebrow: a plain text paragraph immediately before the first heading.
  const heading = content.querySelector('h1, h2, h3, h4, h5, h6');
  const prev = heading?.previousElementSibling;
  if (prev && prev.tagName === 'P' && !prev.querySelector('a, picture, img')) {
    prev.classList.add('hero-eyebrow');
  }

  // Group CTA paragraphs into an actions row.
  const ctas = [...content.children].filter(isCta);
  if (ctas.length) {
    const actions = document.createElement('div');
    actions.className = 'hero-actions';
    ctas.forEach((p) => {
      p.querySelectorAll('a[href]').forEach((a) => a.classList.add('button'));
      actions.append(p);
    });
    content.append(actions);
  }

  const children = [];
  if (background.children.length) children.push(background);
  else block.classList.add('no-image');
  if (content.children.length) children.push(content);
  block.replaceChildren(...children);
}

import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = ['dark'];

/**
 * Returns true when an element is a call-to-action wrapper: a paragraph (or
 * button-container) whose only meaningful content is one or more links.
 * @param {Element} el
 * @returns {boolean}
 */
function isCta(el) {
  if (!el || el.tagName !== 'P') return false;
  const links = el.querySelectorAll('a[href]');
  if (!links.length) return false;
  const linkText = [...links].map((a) => a.textContent.trim()).join('');
  return el.textContent.replace(/\s+/g, '') === linkText.replace(/\s+/g, '');
}

/**
 * Removes empty paragraphs/headings authors (or importers) leave behind.
 * @param {Element} root
 */
function pruneEmpty(root) {
  root.querySelectorAll('p, h1, h2, h3, h4, h5, h6').forEach((el) => {
    if (!el.textContent.trim() && !el.querySelector('picture, img, a')) el.remove();
  });
}

/**
 * Promotional banner: decorative background image, text (heading + copy)
 * on the left and a single CTA on the right.
 *
 * Content model (one row, cells in any order, all optional):
 *   | picture | heading, paragraph(s), CTA link |
 * A third cell holding the CTA is also accepted.
 * @param {Element} block
 */
export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  block.dataset.options = active.join(' ');

  // Flatten every cell of every row; authors may add or omit cells/rows.
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const picture = block.querySelector('picture');

  const bg = document.createElement('div');
  bg.className = 'hero-banner-background';
  const content = document.createElement('div');
  content.className = 'hero-banner-content';
  const text = document.createElement('div');
  text.className = 'hero-banner-text';
  const actions = document.createElement('div');
  actions.className = 'hero-banner-actions';

  if (picture) {
    const img = picture.querySelector('img');
    const optimized = img
      ? createOptimizedPicture(img.src, img.alt || '', false, [
        { media: '(min-width: 900px)', width: '2000' },
        { width: '900' },
      ])
      : picture;
    bg.append(optimized);
    // Drop the paragraph that wrapped the original picture, if now empty.
    const wrapper = picture.parentElement;
    picture.remove();
    if (wrapper && wrapper.tagName === 'P' && !wrapper.textContent.trim()) wrapper.remove();
  }

  cells.forEach((cell) => {
    [...cell.children].forEach((child) => {
      if (child.querySelector('picture') || child.tagName === 'PICTURE') return;
      if (isCta(child)) actions.append(child);
      else text.append(child);
    });
    // Bare text directly in a cell (no wrapping element).
    if (cell.childElementCount === 0 && cell.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = cell.textContent.trim();
      text.append(p);
    }
  });

  pruneEmpty(text);
  actions.querySelectorAll('a[href]').forEach((a) => a.classList.add('button'));

  if (text.children.length) content.append(text);
  if (actions.children.length) content.append(actions);

  const children = [];
  if (bg.children.length) children.push(bg);
  else block.classList.add('no-image');
  children.push(content);
  block.replaceChildren(...children);
}

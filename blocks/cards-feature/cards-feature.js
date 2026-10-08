import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Feature cards: large photo on top, then heading, copy and a CTA.
 *
 * Content model (collection, one row per card):
 *   | picture | heading, paragraph(s), CTA link |
 * Cells may be in either order; a card may omit the image or the body.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const isEmpty = !row.textContent.trim() && !row.querySelector('picture, img');
    if (!cells.length || isEmpty) return;

    const li = document.createElement('li');
    li.className = 'cards-feature-card';

    const image = document.createElement('div');
    image.className = 'cards-feature-card-image';
    const body = document.createElement('div');
    body.className = 'cards-feature-card-body';

    cells.forEach((cell) => {
      const picture = cell.querySelector('picture');
      if (picture && !image.children.length) {
        image.append(picture);
        // Leftover (non-image) content in the same cell belongs to the body.
        [...cell.children].forEach((child) => {
          if (child.textContent.trim()) body.append(child);
        });
      } else {
        while (cell.firstChild) body.append(cell.firstChild);
      }
    });

    // Group trailing CTA paragraphs so they can be pinned to the card bottom.
    const ctas = [...body.children].filter((el) => el.tagName === 'P'
      && el.querySelector('a[href]')
      && el.textContent.trim() === [...el.querySelectorAll('a')].map((a) => a.textContent.trim()).join(''));
    if (ctas.length) {
      const actions = document.createElement('div');
      actions.className = 'cards-feature-card-actions';
      ctas.forEach((p) => {
        p.querySelectorAll('a[href]').forEach((a) => a.classList.add('button'));
        actions.append(p);
      });
      body.append(actions);
    }

    if (image.children.length) li.append(image);
    if (body.childNodes.length) li.append(body);
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt || '', false, [
        { media: '(min-width: 900px)', width: '1200' },
        { width: '750' },
      ]),
    );
  });

  block.replaceChildren(ul);
}

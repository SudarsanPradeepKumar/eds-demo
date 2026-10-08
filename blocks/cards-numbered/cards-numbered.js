import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Numbered step cards: one wide row per step, photo on one side and text on the other.
 * The image side alternates per row and the step number (1..n) is drawn by CSS counters,
 * so authors never author numbers or swap cells.
 *
 * Content model (collection, one row per step):
 *   | picture | heading, paragraph(s), optional link |
 * Cells may be in either order; a step may omit the image or the body.
 * @param {Element} block
 */
export default function decorate(block) {
  const ol = document.createElement('ol');

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const isEmpty = !row.textContent.trim() && !row.querySelector('picture, img');
    if (!cells.length || isEmpty) return;

    const li = document.createElement('li');
    li.className = 'cards-numbered-step';

    const image = document.createElement('div');
    image.className = 'cards-numbered-step-image';
    const body = document.createElement('div');
    body.className = 'cards-numbered-step-body';

    cells.forEach((cell) => {
      const picture = cell.querySelector('picture');
      if (picture && !image.children.length) {
        image.append(picture);
        // Any non-image content left in the image cell belongs to the body.
        [...cell.children].forEach((child) => {
          if (child.textContent.trim()) body.append(child);
        });
      } else {
        while (cell.firstChild) body.append(cell.firstChild);
      }
    });

    if (image.children.length) li.append(image);
    else li.classList.add('no-image');
    if (body.childNodes.length) li.append(body);
    ol.append(li);
  });

  ol.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt || '', false, [
        { media: '(min-width: 900px)', width: '900' },
        { width: '750' },
      ]),
    );
  });

  block.replaceChildren(ol);
}

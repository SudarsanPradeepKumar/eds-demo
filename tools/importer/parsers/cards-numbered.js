/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-numbered. Base: cards. Source: https://frescopa.coffee/ (sustainability, subscription)
 * Instance: .numbered.cards-container .cards.block
 * Target model (blocks/cards-numbered/README.md): one row per step;
 *   cell 1 = image, cell 2 = heading + paragraph(s), optional subheadings, lists and link.
 *   Step numbers / alternating sides come from CSS - not authored.
 *
 * Selectors verified in migration-work/block-context/cards-numbered/source.html (5 items)
 * and instances/subscription.html (3 items):
 *   :scope > ul > li (repeating unit, iterationSafe) > .cards-card-image picture, .cards-card-body
 */
export default function parse(element, { document }) {
  // Iterate block-level <li> wrappers; fall back to authored EDS row divs.
  let items = Array.from(element.querySelectorAll(':scope > ul > li'));
  if (!items.length) items = Array.from(element.querySelectorAll(':scope > div'));

  const cells = [];
  items.forEach((item) => {
    const imageWrap = item.querySelector('.cards-card-image');
    const image = (imageWrap && imageWrap.querySelector('picture, img'))
      || item.querySelector('picture, img');

    const body = item.querySelector('.cards-card-body');
    let bodyContent = [];
    if (body) {
      // Keep every non-empty child: heading (h3/h4), bold sub-headings, paragraphs, lists, links.
      bodyContent = Array.from(body.children)
        .filter((el) => el.textContent.trim() || el.querySelector('img, picture'));
    } else {
      bodyContent = Array.from(item.querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol'))
        .filter((el) => el.textContent.trim() && !el.querySelector('picture, img')
          && !el.parentElement.closest('ul, ol, p'));
    }

    if (!image && !bodyContent.length) return;
    cells.push([image || '', bodyContent.length ? bodyContent : '']);
  });

  // Empty-block guard
  if (!cells.length) {
    element.remove();
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-numbered', cells });
  element.replaceWith(block);
}

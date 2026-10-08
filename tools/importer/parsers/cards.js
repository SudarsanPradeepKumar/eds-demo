/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards. Base: cards. Source: https://frescopa.coffee/
 * Instance: .card-tiles.cards-container .cards.block (5 icon + label category tiles)
 * Target model (blocks/cards/README.md): one row per card;
 *   cell 1 = image (optional), cell 2 = heading, text and/or links.
 *
 * Selectors verified in migration-work/block-context/cards/source.html:
 *   ul > li (repeating unit x5, iterationSafe) > .cards-card-image picture, .cards-card-body h5
 */
export default function parse(element, { document }) {
  // Iterate the block-level <li> wrappers (not anchors); fall back to EDS row divs.
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
      bodyContent = Array.from(body.children).filter((el) => el.textContent.trim() || el.querySelector('img, picture'));
    } else {
      bodyContent = Array.from(item.querySelectorAll('h1, h2, h3, h4, h5, h6, p'))
        .filter((el) => el.textContent.trim() && !el.querySelector('picture, img'));
    }

    if (!image && !bodyContent.length) return;
    cells.push([image || '', bodyContent.length ? bodyContent : '']);
  });

  // Empty-block guard
  if (!cells.length) {
    element.remove();
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}

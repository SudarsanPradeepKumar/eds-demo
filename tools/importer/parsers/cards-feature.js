/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-feature. Base: cards. Source: https://frescopa.coffee/
 * Instance: .home.cards-container .cards.block (2 photo feature cards)
 * Target model (blocks/cards-feature/README.md): one row per card;
 *   cell 1 = image (optional), cell 2 = heading, paragraph(s), CTA link.
 *
 * Selectors verified in migration-work/block-context/cards-feature/source.html:
 *   ul > li (repeating unit x2, iterationSafe) > .cards-card-image picture,
 *   .cards-card-body (h3/h4, p, p.button-container > a.button)
 */
export default function parse(element, { document }) {
  // Iterate the block-level <li> wrappers (not the CTA anchors); fall back to EDS row divs.
  let items = Array.from(element.querySelectorAll(':scope > ul > li'));
  if (!items.length) items = Array.from(element.querySelectorAll(':scope > div'));

  const cells = [];
  items.forEach((item) => {
    const imageWrap = item.querySelector('.cards-card-image');
    const image = (imageWrap && imageWrap.querySelector('picture, img'))
      || item.querySelector('picture, img');

    const body = item.querySelector('.cards-card-body');
    const bodyContent = [];
    const source = body ? Array.from(body.children) : Array.from(item.querySelectorAll('h1, h2, h3, h4, h5, h6, p'));
    source.forEach((el) => {
      if (!el.textContent.trim() || el.querySelector('picture, img')) return;
      // CTA: keep it in its own paragraph so the block pins it to the card bottom
      const links = el.querySelectorAll('a[href]');
      if (links.length && el.textContent.trim() === Array.from(links).map((a) => a.textContent.trim()).join('')) {
        links.forEach((a) => {
          const p = document.createElement('p');
          p.append(a);
          bodyContent.push(p);
        });
        return;
      }
      bodyContent.push(el);
    });

    if (!image && !bodyContent.length) return;
    cells.push([image || '', bodyContent.length ? bodyContent : '']);
  });

  // Empty-block guard
  if (!cells.length) {
    element.remove();
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-feature', cells });
  element.replaceWith(block);
}

/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-banner. Base: hero. Source: https://frescopa.coffee/
 * Instances: div.offer.block, div.reward.block
 * Target model (blocks/hero-banner/README.md): one row;
 *   cell 1 = decorative background image, cell 2 = heading, paragraph(s), CTA link.
 * Option: the reward banner carries the "dark" option class.
 *
 * Selectors verified in migration-work/block-context/hero-banner/source.html and instances/01.html:
 *   .offer-content > img | .reward-content > img (decorative bg)
 *   .offer-left / .reward-left (h4.headline, h6, p.detail, p)
 *   .offer-right / .reward-right a.button
 */
export default function parse(element, { document }) {
  const isEmpty = (el) => !el.textContent.trim() && !el.querySelector('img, picture');

  // Decorative background image (direct child of the *-content wrapper)
  const content = element.querySelector('[class$="-content"]') || element;
  let bg = content.querySelector(':scope > picture, :scope > img')
    || element.querySelector('picture, img');

  // Live DOM: the decorative image is a CSS background on the *-content wrapper
  // (scraped cleaned.html materialises it as an <img>). Rebuild an <img> from it.
  if (!bg) {
    const candidates = [content, element];
    for (const el of candidates) {
      let bgImage = el.style && el.style.backgroundImage;
      if (!bgImage || bgImage === 'none') {
        try {
          const view = document.defaultView;
          bgImage = view && view.getComputedStyle ? view.getComputedStyle(el).backgroundImage : '';
        } catch (e) { bgImage = ''; }
      }
      const m = bgImage && bgImage.match(/url\(["']?([^"')]+)["']?\)/);
      // Raster only: SVG backgrounds are CSS decoration and html2md would turn them
      // into :icon: references that do not exist in the project.
      if (m && !/\.svg(\?|#|$)/i.test(m[1])) {
        const img = document.createElement('img');
        img.src = m[1];
        img.alt = '';
        bg = img;
        break;
      }
    }
  }

  // Text column: headings and paragraphs, skipping empty placeholders
  const left = element.querySelector('.offer-left, .reward-left, [class$="-left"]');
  const textEls = [];
  if (left) {
    left.querySelectorAll('h1, h2, h3, h4, h5, h6, p').forEach((el) => {
      if (!isEmpty(el) && !el.querySelector('a[href]')) textEls.push(el);
    });
  } else {
    element.querySelectorAll('h1, h2, h3, h4, h5, h6, p').forEach((el) => {
      if (!isEmpty(el) && !el.querySelector('a[href]')) textEls.push(el);
    });
  }

  // CTA(s): each in its own paragraph so the block renders it on the right
  const right = element.querySelector('.offer-right, .reward-right, [class$="-right"]');
  const ctaLinks = Array.from((right || element).querySelectorAll('a[href]'));
  const ctas = ctaLinks.map((a) => {
    const p = document.createElement('p');
    p.append(a);
    return p;
  });

  const contentCell = [...textEls, ...ctas];

  // Empty-block guard
  if (!bg && !contentCell.length) {
    element.remove();
    return;
  }

  // Reward banner (or any source banner already flagged dark) gets the "dark" option
  const variants = (element.classList.contains('reward') || element.classList.contains('dark')) ? ['dark'] : [];

  const cells = [[bg || '', contentCell.length ? contentCell : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', variants, cells });
  element.replaceWith(block);
}

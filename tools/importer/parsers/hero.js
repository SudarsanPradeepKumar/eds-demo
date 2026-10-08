/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero. Base: hero. Source: https://frescopa.coffee/ (div.teaser.block).
 * Target model (blocks/hero/README.md): one row; image cell + content cell
 * (eyebrow, heading, text, CTA(s)).
 *
 * Selectors verified in migration-work/block-context/hero/source.html:
 *   .background picture/img, .foreground .eyebrow, .title h1-h6,
 *   .long-description, .cta a
 */
export default function parse(element, { document }) {
  // Image cell: background picture (fallback: any image in the block)
  const bg = element.querySelector('.background picture, .background img')
    || element.querySelector('picture, img');
  const img = bg && (bg.tagName === 'IMG' ? bg : bg.querySelector('img'));
  // Source alt attributes carry the asset URL, not a description
  if (img && /^https?:\/\//.test(img.getAttribute('alt') || '')) img.setAttribute('alt', '');

  const content = [];

  // Eyebrow text -> paragraph
  const eyebrowEl = element.querySelector('.eyebrow, [class*="eyebrow"], .pretitle');
  if (eyebrowEl && eyebrowEl.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = eyebrowEl.textContent.trim();
    content.push(p);
  }

  // Heading (keep the original heading level)
  const heading = element.querySelector('.title h1, .title h2, .title h3, .title h4, .title h5, .title h6')
    || element.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) content.push(heading);

  // Optional long description (empty on the sampled page)
  const desc = element.querySelector('.long-description, .description');
  if (desc && desc.textContent.trim()) {
    const paras = desc.querySelectorAll('p');
    if (paras.length) content.push(...paras);
    else {
      const p = document.createElement('p');
      p.textContent = desc.textContent.trim();
      content.push(p);
    }
  }

  // CTA(s), each in its own paragraph
  const ctas = Array.from(element.querySelectorAll('.cta a[href]'));
  if (!ctas.length) ctas.push(...element.querySelectorAll('.foreground a[href]'));
  // Keep the authored button style: primary = <strong>, secondary = <em>
  ctas.forEach((a) => {
    const p = document.createElement('p');
    let wrapper = null;
    if (a.classList.contains('primary')) wrapper = document.createElement('strong');
    else if (a.classList.contains('secondary')) wrapper = document.createElement('em');
    a.removeAttribute('class');
    if (wrapper) {
      wrapper.append(a);
      p.append(wrapper);
    } else {
      p.append(a);
    }
    content.push(p);
  });

  // Empty-block guard
  if (!bg && !content.length) {
    element.remove();
    return;
  }

  const cells = [[bg || '', content.length ? content : '']];
  // teaser variants that carry over as block options
  const options = ['light', 'half-height'].filter((option) => element.classList.contains(option));
  const name = options.length ? `hero (${options.join(', ')})` : 'hero';
  const block = WebImporter.Blocks.createBlock(document, { name, cells });
  element.replaceWith(block);
}

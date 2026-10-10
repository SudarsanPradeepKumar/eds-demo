/**
 * Sticky call-to-action: a fixed pill button with an optional icon.
 * Content model: row 1 = icon (picture), row 2 = link. Rows may be in either order.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const link = block.querySelector('a[href]');
  if (!link) {
    block.remove();
    return;
  }
  const img = [...block.querySelectorAll('img')].find((i) => !link.contains(i));
  const cta = link.cloneNode(true);
  cta.className = 'button sticky-cta-link';
  if (img) {
    img.alt = img.alt || '';
    cta.prepend(img);
  }
  block.replaceChildren(cta);
}

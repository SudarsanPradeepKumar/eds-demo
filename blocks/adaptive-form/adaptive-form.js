/**
 * Adaptive form placeholder.
 * Holds the original AEM Adaptive Form reference (a link to the form path) or
 * its JSON definition (code block) until the form is converted for Edge Delivery.
 * Nothing renders on the page meanwhile.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const link = block.querySelector('a[href]');
  if (link) block.dataset.formPath = link.getAttribute('href');
  block.dataset.formDefinition = block.querySelector('pre, code') ? 'inline' : 'reference';
  block.setAttribute('aria-hidden', 'true');
  block.closest('.section')?.classList.add('adaptive-form-pending');
}

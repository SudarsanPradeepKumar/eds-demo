/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Frescopa (frescopa.coffee) site-wide cleanup.
 *
 * Source is an AEM Edge Delivery site. Global header (nav fragment) and
 * footer (footer fragment) are injected at runtime and migrated separately,
 * so they are removed from the imported page content.
 *
 * All selectors verified in migration-work/cleaned.html:
 *   - header.header-wrapper > .overlay + .header.block > .nav-wrapper > nav#nav (lines 2-149)
 *   - footer.footer-wrapper > .footer.block (lines 485-582)
 *   - three empty trailing <div class="section"></div> inside <main> (lines 478-483)
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

function isEmptySection(el) {
  // Bare `div.section` (no extra classes) with no child elements and no text.
  return el.classList.length === 1
    && el.children.length === 0
    && el.textContent.trim() === '';
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Global header/nav chrome (contains sign-in dropin forms, search, minicart)
    // removed early so no block selector can accidentally match inside it.
    WebImporter.DOMUtils.remove(element, [
      'header.header-wrapper',
      '.header.block',
      '.nav-wrapper',
      'nav#nav',
      'footer.footer-wrapper',
      '.footer.block',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Safety net in case fragments were (re)injected after the first pass.
    WebImporter.DOMUtils.remove(element, [
      'header.header-wrapper',
      'footer.footer-wrapper',
      'nav#nav',
      'iframe',
      'noscript',
      'link',
    ]);

    // Remove empty trailing placeholder sections (div.section with no content).
    element.querySelectorAll('div.section').forEach((section) => {
      if (isEmptySection(section)) section.remove();
    });

    // Section-level backgrounds are decorative and come from section styles
    // (Section Metadata); keep the importer from turning them into images.
    element.querySelectorAll('div.section[style*="background-image"]').forEach((section) => {
      section.style.removeProperty('background-image');
    });
  }
}

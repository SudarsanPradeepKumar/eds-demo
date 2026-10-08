import { readBlockConfig } from '../../scripts/aem.js';

/**
 * Product list page (Commerce PLP) placeholder.
 * Reads the authored catalog configuration (urlPath, category) and exposes it
 * as data attributes. Products render once a Commerce product-discovery
 * implementation and backend configuration are added to the project.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const config = readBlockConfig(block);
  Object.entries(config).forEach(([key, value]) => {
    block.dataset[key] = value;
  });
  block.textContent = '';
  block.setAttribute('aria-hidden', 'true');
}

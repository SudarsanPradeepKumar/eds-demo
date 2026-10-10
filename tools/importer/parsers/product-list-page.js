/* eslint-disable */
/* global WebImporter */
/**
 * Parser for product-list-page (Commerce PLP shell). Source: div.product-list-page-custom.block
 * Products are not imported: the block carries only its catalog configuration
 * (urlPath, category), which the Commerce product-discovery block reads at runtime.
 * Config per page slug (same on every locale), in page order; mirrors
 * migration-work/commerce-templates.json.
 */
const PRODUCT_LISTS = {
  coffee: [
    { urlPath: 'bagged-coffee', category: '27' },
    { urlPath: 'coffee-pods', category: '23' },
  ],
  accessories: [{ urlPath: 'accessories', category: '28' }],
  tea: [{ urlPath: 'tea', category: '30' }],
  machines: [{ urlPath: 'coffee-machines', category: '29' }],
};

export default function parse(element, { document, url, params }) {
  const pageUrl = (params && params.originalURL) || url;
  const slug = new URL(pageUrl).pathname.replace(/\/+$/, '').split('/').pop();
  const configs = PRODUCT_LISTS[slug] || [];
  // earlier grids on the page have already been replaced, so the remaining count gives our index
  const remaining = document.querySelectorAll('.product-list-page-custom.block').length;
  const config = configs[configs.length - remaining];
  if (!config) {
    console.warn(`product-list-page: no catalog config for "${slug}"`);
    element.remove();
    return;
  }
  const block = WebImporter.Blocks.createBlock(document, {
    name: 'product-list-page',
    cells: [['urlPath', config.urlPath], ['category', config.category]],
  });
  element.replaceWith(block);
}

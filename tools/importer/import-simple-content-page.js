/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';
import embedParser from './parsers/embed.js';
import productListPageParser from './parsers/product-list-page.js';
import videoParser from './parsers/video.js';

// TRANSFORMER IMPORTS
import frescopaCleanupTransformer from './transformers/frescopa-cleanup.js';
import frescopaDmImagesTransformer from './transformers/frescopa-dm-images.js';
import frescopaSectionsTransformer from './transformers/frescopa-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero': heroParser,
  'embed': embedParser,
  'product-list-page': productListPageParser,
  'video': videoParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "simple-content-page",
  "description": "Simple pages: default content, optionally a teaser, store locator, product grid or inline video",
  "urls": [
    "https://frescopa.coffee/about-us",
    "https://frescopa.coffee/content/forms/af/frescopa/enquire",
    "https://frescopa.coffee/en/drafts/jalagari/signup",
    "https://frescopa.coffee/en/locations",
    "https://frescopa.coffee/en/products",
    "https://frescopa.coffee/es/locations",
    "https://frescopa.coffee/es/products",
    "https://frescopa.coffee/fr/locations",
    "https://frescopa.coffee/fr/products",
    "https://frescopa.coffee/jp/locations",
    "https://frescopa.coffee/jp/products",
    "https://frescopa.coffee/es/sustainability",
    "https://frescopa.coffee/fr/sustainability",
    "https://frescopa.coffee/jp/sustainability"
  ],
  "blocks": [
    {
      "name": "hero",
      "instances": [
        ".teaser-container .teaser.block"
      ]
    },
    {
      "name": "embed",
      "instances": [
        ".store-locator.block"
      ]
    },
    {
      "name": "product-list-page",
      "instances": [
        ".product-list-page.block"
      ]
    },
    {
      "name": "video",
      "instances": [
        ".video.block"
      ]
    }
  ],
  "sections": [
    {
      "id": "1",
      "name": "section-1",
      "selector": [
        "main > div.section:nth-of-type(1)"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "2",
      "name": "section-2",
      "selector": [
        "main > div.section:nth-of-type(2)"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "3",
      "name": "section-3",
      "selector": [
        "main > div.section:nth-of-type(3)"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "4",
      "name": "section-4",
      "selector": [
        "main > div.section:nth-of-type(4)"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": []
    }
  ]
};

// TRANSFORMER REGISTRY - cleanup first, DM images after parsing, sections last
const transformers = [
  frescopaCleanupTransformer,
  frescopaDmImagesTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [frescopaSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element, section: blockDef.section || null });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. Initial cleanup + section breaks
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements detached by an earlier parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Final cleanup, DM image carriers, section metadata
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path; root URL maps to /index
    // folder URLs (trailing slash, including the root) map to their index page
    const { pathname } = new URL(params.originalURL);
    const rawPath = pathname.endsWith('/')
      ? `${pathname}index`
      : pathname.replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};

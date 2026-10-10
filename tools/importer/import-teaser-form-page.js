/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';
import productListPageParser from './parsers/product-list-page.js';
import adaptiveFormParser from './parsers/adaptive-form.js';
import stickyCtaParser from './parsers/sticky-cta.js';

// TRANSFORMER IMPORTS
import frescopaCleanupTransformer from './transformers/frescopa-cleanup.js';
import frescopaDmImagesTransformer from './transformers/frescopa-dm-images.js';
import frescopaSectionsTransformer from './transformers/frescopa-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero': heroParser,
  'product-list-page': productListPageParser,
  'adaptive-form': adaptiveFormParser,
  'sticky-cta': stickyCtaParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "teaser-form-page",
  "description": "Teaser header followed by a content or product grid, embedded adaptive form section and sticky call-to-action bar",
  "urls": [
    "https://frescopa.coffee/contact-us",
    "https://frescopa.coffee/en/drafts/jalagari/machines",
    "https://frescopa.coffee/en/machines",
    "https://frescopa.coffee/es/contact-us",
    "https://frescopa.coffee/es/machines",
    "https://frescopa.coffee/es/sustainability",
    "https://frescopa.coffee/fr/contact-us",
    "https://frescopa.coffee/fr/machines",
    "https://frescopa.coffee/fr/sustainability",
    "https://frescopa.coffee/jp/contact-us",
    "https://frescopa.coffee/jp/machines",
    "https://frescopa.coffee/jp/sustainability",
    "https://frescopa.coffee/machines",
    "https://frescopa.coffee/variations/machines"
  ],
  "blocks": [
    {
      "name": "hero",
      "instances": [
        ".teaser-container .teaser.block"
      ]
    },
    {
      "name": "product-list-page",
      "instances": [
        ".product-list-page-custom.block"
      ]
    },
    {
      "name": "adaptive-form",
      "instances": [
        ".form-container .form.block",
        ".embed-adaptive-form.block"
      ]
    },
    {
      "name": "sticky-cta",
      "instances": [
        ".sticky-cta.block"
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
      "blocks": [
        "hero"
      ],
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
    },
    {
      "id": "5",
      "name": "section-5",
      "selector": [
        "main > div.section:nth-of-type(5)"
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

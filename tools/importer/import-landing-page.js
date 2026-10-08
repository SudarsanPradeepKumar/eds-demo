/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';
import heroBannerParser from './parsers/hero-banner.js';
import embedParser from './parsers/embed.js';
import cardsParser from './parsers/cards.js';
import cardsFeatureParser from './parsers/cards-feature.js';
import cardsNumberedParser from './parsers/cards-numbered.js';
import videoParser from './parsers/video.js';

// TRANSFORMER IMPORTS
import frescopaCleanupTransformer from './transformers/frescopa-cleanup.js';
import frescopaDmImagesTransformer from './transformers/frescopa-dm-images.js';
import frescopaSectionsTransformer from './transformers/frescopa-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero': heroParser,
  'hero-banner': heroBannerParser,
  'embed': embedParser,
  'cards': cardsParser,
  'cards-feature': cardsFeatureParser,
  'cards-numbered': cardsNumberedParser,
  'video': videoParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "landing-page",
  "description": "Marketing landing page: full-width teaser hero, promotional offer section, embedded store locator and card grid sections",
  "urls": [
    "https://frescopa.coffee/",
    "https://frescopa.coffee/business",
    "https://frescopa.coffee/coffee",
    "https://frescopa.coffee/content/frescopa/es/",
    "https://frescopa.coffee/en/",
    "https://frescopa.coffee/en/coffee",
    "https://frescopa.coffee/en/subscription",
    "https://frescopa.coffee/es/",
    "https://frescopa.coffee/es/business",
    "https://frescopa.coffee/es/coffee",
    "https://frescopa.coffee/es/subscription",
    "https://frescopa.coffee/experiments/value-prop-headline-test/challenger-1",
    "https://frescopa.coffee/fr/",
    "https://frescopa.coffee/fr/business",
    "https://frescopa.coffee/fr/coffee",
    "https://frescopa.coffee/fr/subscription",
    "https://frescopa.coffee/jp/",
    "https://frescopa.coffee/jp/business",
    "https://frescopa.coffee/jp/coffee",
    "https://frescopa.coffee/jp/subscription",
    "https://frescopa.coffee/subscription",
    "https://frescopa.coffee/sustainability"
  ],
  "blocks": [
    {
      "name": "hero",
      "instances": [
        ".teaser-container .teaser.block"
      ]
    },
    {
      "name": "hero-banner",
      "instances": [
        ".offer-container .offer.block",
        ".reward-container .reward.block"
      ]
    },
    {
      "name": "embed",
      "instances": [
        ".store-locator-container .store-locator.block"
      ]
    },
    {
      "name": "cards",
      "instances": [
        ".card-tiles.cards-container .cards.block",
        ".background.cards-container .cards.block"
      ]
    },
    {
      "name": "cards-feature",
      "instances": [
        ".home.cards-container .cards.block"
      ]
    },
    {
      "name": "cards-numbered",
      "instances": [
        ".numbered.cards-container .cards.block"
      ]
    },
    {
      "name": "video",
      "instances": [
        ".dm-video-container .dm-video.block"
      ]
    }
  ],
  "sections": [
    {
      "id": "1",
      "name": "quiz-teaser",
      "selector": [
        "div.section.teaser-container:not(.numbered):not(.blog)"
      ],
      "style": null,
      "blocks": [
        "hero"
      ],
      "defaultContent": []
    },
    {
      "id": "2",
      "name": "subscription-offer",
      "selector": [
        "div.section.offer-container"
      ],
      "style": null,
      "blocks": [
        "hero-banner"
      ],
      "defaultContent": []
    },
    {
      "id": "3",
      "name": "store-locator",
      "selector": [
        "div.section.store-locator-container"
      ],
      "style": null,
      "blocks": [
        "embed"
      ],
      "defaultContent": []
    },
    {
      "id": "4",
      "name": "top-sellers",
      "selector": [
        "div.section.background.cards-container"
      ],
      "style": "background",
      "blocks": [
        "cards"
      ],
      "defaultContent": [
        ".background.cards-container > .default-content-wrapper"
      ]
    },
    {
      "id": "5",
      "name": "product-tiles",
      "selector": [
        "div.section.card-tiles.cards-container"
      ],
      "style": null,
      "blocks": [
        "cards"
      ],
      "defaultContent": [
        ".card-tiles.cards-container > .default-content-wrapper"
      ]
    },
    {
      "id": "6",
      "name": "feature-cards",
      "selector": [
        "div.section.home.cards-container"
      ],
      "style": null,
      "blocks": [
        "cards-feature"
      ],
      "defaultContent": []
    },
    {
      "id": "7",
      "name": "rewards-banner",
      "selector": [
        "div.section.reward-container"
      ],
      "style": null,
      "blocks": [
        "hero-banner"
      ],
      "defaultContent": []
    },
    {
      "id": "8",
      "name": "numbered-teaser",
      "selector": [
        "div.section.numbered.teaser-container"
      ],
      "style": "numbered",
      "blocks": [
        "hero"
      ],
      "defaultContent": []
    },
    {
      "id": "9",
      "name": "blog-teaser",
      "selector": [
        "div.section.blog.teaser-container"
      ],
      "style": "blog",
      "blocks": [
        "hero"
      ],
      "defaultContent": []
    },
    {
      "id": "10",
      "name": "numbered-steps",
      "selector": [
        "div.section.numbered.cards-container"
      ],
      "style": "numbered",
      "blocks": [
        "cards-numbered"
      ],
      "defaultContent": [
        ".numbered.cards-container > .default-content-wrapper"
      ]
    },
    {
      "id": "11",
      "name": "numbered-video",
      "selector": [
        "div.section.numbered.dm-video-container"
      ],
      "style": "numbered",
      "blocks": [
        "video"
      ],
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

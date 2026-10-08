/* eslint-disable */
/* global WebImporter */

/**
 * Commerce PLP import (Frescopa Coffee pages).
 * Extract -> clear main -> rebuild sections. Product data is NOT imported:
 * product-list-page blocks carry only their catalog configuration and load
 * products at runtime from the Commerce catalog API.
 *
 * Template: migration-work/commerce-templates.json ("PLP Template").
 */
import heroParser from './parsers/hero.js';
import embedParser from './parsers/embed.js';
import frescopaCleanupTransformer from './transformers/frescopa-cleanup.js';
import frescopaDmImagesTransformer from './transformers/frescopa-dm-images.js';

const PLP_TEMPLATE = {
  name: 'PLP Template',
  urls: [
    'https://frescopa.coffee/coffee',
    'https://frescopa.coffee/en/coffee',
    'https://frescopa.coffee/es/coffee',
    'https://frescopa.coffee/fr/coffee',
    'https://frescopa.coffee/jp/coffee',
  ],
  // one entry per product grid, in page order (same on every locale)
  productLists: [
    { urlPath: 'bagged-coffee', category: '27' },
    { urlPath: 'coffee-pods', category: '23' },
  ],
};

const PLP_SECTION = 'main > div.section.product-list-page-custom-container';

/**
 * Runs an in-place parser (parse(element, ctx) -> element.replaceWith(block))
 * against a detached element and returns the produced block table.
 */
function runParser(parser, element, ctx) {
  if (!element) return null;
  const holder = ctx.document.createElement('div');
  holder.append(element);
  try {
    parser(element, ctx);
  } catch (e) {
    console.error('Parser failed:', e);
    return null;
  }
  return holder.firstElementChild;
}

function executeTransformers(hookName, element, payload) {
  [frescopaCleanupTransformer, frescopaDmImagesTransformer].forEach((fn) => {
    try {
      fn.call(null, hookName, element, payload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function productListBlock(document, config) {
  return WebImporter.DOMUtils.createTable([
    ['product-list-page'],
    ['urlPath', config.urlPath],
    ['category', config.category],
  ], document);
}

function sectionMetadata(document, style) {
  return WebImporter.DOMUtils.createTable([
    ['Section Metadata'],
    ['style', style],
  ], document);
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;
    const ctx = { document, url, params };

    executeTransformers('beforeTransform', main, payload);

    // STEP 1: extract everything while the DOM is intact
    const hero = runParser(heroParser, document.querySelector('.teaser-container .teaser.block'), ctx);

    const plpSection = document.querySelector(PLP_SECTION);
    const productArea = [];
    let listIndex = 0;
    let articleContent = [];
    let storeLocator = null;
    if (plpSection) {
      [...plpSection.children].forEach((wrapper) => {
        if (wrapper.matches('.default-content-wrapper')) {
          productArea.push(...[...wrapper.children].filter((el) => el.textContent.trim() || el.querySelector('img, picture')));
        } else if (wrapper.matches('.product-list-page-custom-wrapper')) {
          const config = PLP_TEMPLATE.productLists[listIndex];
          listIndex += 1;
          if (config) productArea.push(productListBlock(document, config));
          else console.warn('commerce-import: more product grids than configured');
        } else if (wrapper.matches('.dm-scene7-template-wrapper')) {
          const img = wrapper.querySelector('img');
          if (img) {
            const p = document.createElement('p');
            p.append(img);
            productArea.push(p);
          }
        } else if (wrapper.matches('.article-wrapper')) {
          const content = wrapper.querySelector('.article-content') || wrapper;
          articleContent = [...content.querySelectorAll('h1, h2, h3, h4, h5, h6, p')]
            .filter((el) => el.textContent.trim())
            .map((el) => { el.removeAttribute('class'); return el; });
        } else if (wrapper.matches('.store-locator-wrapper')) {
          storeLocator = runParser(embedParser, wrapper.querySelector('.store-locator'), ctx);
        }
      });
    } else {
      console.warn('commerce-import: product listing section not found');
    }

    // STEP 2: clear
    main.innerHTML = '';

    // STEP 3: rebuild sections in page order
    const sections = [];
    if (hero) sections.push([hero]);
    if (productArea.length) sections.push(productArea);
    if (articleContent.length) sections.push([...articleContent, sectionMetadata(document, 'article')]);
    if (storeLocator) sections.push([storeLocator]);

    sections.forEach((nodes, i) => {
      if (i > 0) main.append(document.createElement('hr'));
      nodes.forEach((n) => main.append(n));
    });

    executeTransformers('afterTransform', main, payload);

    // STEP 4: metadata + built-in rules
    main.append(document.createElement('hr'));
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const { pathname } = new URL(params.originalURL || url);
    const rawPath = pathname.endsWith('/')
      ? `${pathname}index`
      : pathname.replace(/\.html?$/i, '');
    return [{
      element: main,
      path: WebImporter.FileUtils.sanitizePath(rawPath),
      report: {
        title: document.title,
        template: PLP_TEMPLATE.name,
        productLists: listIndex,
      },
    }];
  },
};

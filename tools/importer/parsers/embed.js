/* eslint-disable */
/* global WebImporter */
/**
 * Parser for embed. Base: embed. Source: https://frescopa.coffee/ (div.store-locator.block)
 * Target model (blocks/embed/README.md): one row;
 *   cell 1 = content (heading, text, search link whose URL ends in an empty query param,
 *            link title = input placeholder, link text = button label)
 *   cell 2 = embed URL only (map).
 *
 * Selectors verified in migration-work/block-context/embed/source.html:
 *   .sidepanel .sidepanel__title (h3), .search .search__title (p),
 *   .search__input (input), .search__button (button), .map#locator-map (Google Map)
 * The Google Map is rendered client-side via the Maps JS API, so the source has no
 * map URL; a Google Maps embed URL for the brand is authored instead.
 */
const SEARCH_URL = '/locations?postcode=';
const MAP_URL = 'https://www.google.com/maps?q=Fr%C3%A9scopa+coffee&output=embed';

export default function parse(element, { document }) {
  const panel = element.querySelector('.sidepanel') || element;
  const content = [];

  // Heading (h3.sidepanel__title)
  const heading = panel.querySelector('.sidepanel__title, h1, h2, h3, h4, h5, h6');
  if (heading && heading.textContent.trim()) {
    if (/^H[1-6]$/.test(heading.tagName)) content.push(heading);
    else {
      const h = document.createElement('h3');
      h.textContent = heading.textContent.trim();
      content.push(h);
    }
  }

  // Label above the search ("Find Another Location NOW")
  const label = panel.querySelector('.search__title, .search p');
  if (label && label.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = label.textContent.trim();
    content.push(p);
  }

  // Postcode search -> link ending in an empty query param
  const input = panel.querySelector('.search__input, input');
  const button = panel.querySelector('.search__button, button');
  if (input || button) {
    const placeholder = (input && (input.getAttribute('placeholder') || input.getAttribute('aria-label'))) || 'Post Code';
    const a = document.createElement('a');
    a.href = SEARCH_URL;
    a.title = placeholder;
    a.textContent = (button && button.textContent.trim()) || 'Search';
    const p = document.createElement('p');
    p.append(a);
    content.push(p);
  }

  // Undecorated source (block JS failed): fall back to the authored rows' text
  if (!content.length) {
    const texts = Array.from(element.querySelectorAll(':scope > div > div'))
      .map((cell) => cell.textContent.trim())
      .filter((text) => text && !/^https?:/.test(text));
    if (texts.length) {
      const h = document.createElement('h3');
      h.textContent = texts[0];
      content.push(h);
      texts.slice(1).forEach((text) => {
        const p = document.createElement('p');
        p.textContent = text;
        content.push(p);
      });
    }
  }

  // Embed cell: link to the map (an iframe src wins if the source ever exposes one)
  const iframe = element.querySelector('.map iframe[src], iframe[src]');
  const mapHref = (iframe && /^https?:/.test(iframe.getAttribute('src')) && iframe.getAttribute('src')) || MAP_URL;
  const mapLink = document.createElement('a');
  mapLink.href = mapHref;
  mapLink.textContent = mapHref;

  const cells = [[content.length ? content : '', mapLink]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'embed', cells });
  element.replaceWith(block);
}

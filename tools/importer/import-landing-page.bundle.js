/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-landing-page.js
  var import_landing_page_exports = {};
  __export(import_landing_page_exports, {
    default: () => import_landing_page_default
  });

  // tools/importer/parsers/hero.js
  function parse(element, { document: document2 }) {
    const bg = element.querySelector(".background picture, .background img") || element.querySelector("picture, img");
    const img = bg && (bg.tagName === "IMG" ? bg : bg.querySelector("img"));
    if (img && /^https?:\/\//.test(img.getAttribute("alt") || "")) img.setAttribute("alt", "");
    const content = [];
    const eyebrowEl = element.querySelector('.eyebrow, [class*="eyebrow"], .pretitle');
    if (eyebrowEl && eyebrowEl.textContent.trim()) {
      const p = document2.createElement("p");
      p.textContent = eyebrowEl.textContent.trim();
      content.push(p);
    }
    const heading = element.querySelector(".title h1, .title h2, .title h3, .title h4, .title h5, .title h6") || element.querySelector("h1, h2, h3, h4, h5, h6");
    if (heading) content.push(heading);
    const desc = element.querySelector(".long-description, .description");
    if (desc && desc.textContent.trim()) {
      const paras = desc.querySelectorAll("p");
      if (paras.length) content.push(...paras);
      else {
        const p = document2.createElement("p");
        p.textContent = desc.textContent.trim();
        content.push(p);
      }
    }
    const ctas = Array.from(element.querySelectorAll(".cta a[href]"));
    if (!ctas.length) ctas.push(...element.querySelectorAll(".foreground a[href]"));
    ctas.forEach((a) => {
      const p = document2.createElement("p");
      let wrapper = null;
      if (a.classList.contains("primary")) wrapper = document2.createElement("strong");
      else if (a.classList.contains("secondary")) wrapper = document2.createElement("em");
      a.removeAttribute("class");
      if (wrapper) {
        wrapper.append(a);
        p.append(wrapper);
      } else {
        p.append(a);
      }
      content.push(p);
    });
    if (!bg && !content.length) {
      element.remove();
      return;
    }
    const cells = [[bg || "", content.length ? content : ""]];
    const options = ["light", "half-height"].filter((option) => element.classList.contains(option));
    const name = options.length ? `hero (${options.join(", ")})` : "hero";
    const block = WebImporter.Blocks.createBlock(document2, { name, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-banner.js
  function parse2(element, { document: document2 }) {
    const isEmpty = (el) => !el.textContent.trim() && !el.querySelector("img, picture");
    const content = element.querySelector('[class$="-content"]') || element;
    let bg = content.querySelector(":scope > picture, :scope > img") || element.querySelector("picture, img");
    if (!bg) {
      const candidates = [content, element];
      for (const el of candidates) {
        let bgImage = el.style && el.style.backgroundImage;
        if (!bgImage || bgImage === "none") {
          try {
            const view = document2.defaultView;
            bgImage = view && view.getComputedStyle ? view.getComputedStyle(el).backgroundImage : "";
          } catch (e) {
            bgImage = "";
          }
        }
        const m = bgImage && bgImage.match(/url\(["']?([^"')]+)["']?\)/);
        if (m && !/\.svg(\?|#|$)/i.test(m[1])) {
          const img = document2.createElement("img");
          img.src = m[1];
          img.alt = "";
          bg = img;
          break;
        }
      }
    }
    const left = element.querySelector('.offer-left, .reward-left, [class$="-left"]');
    const textEls = [];
    if (left) {
      left.querySelectorAll("h1, h2, h3, h4, h5, h6, p").forEach((el) => {
        if (!isEmpty(el) && !el.querySelector("a[href]")) textEls.push(el);
      });
    } else {
      element.querySelectorAll("h1, h2, h3, h4, h5, h6, p").forEach((el) => {
        if (!isEmpty(el) && !el.querySelector("a[href]")) textEls.push(el);
      });
    }
    const right = element.querySelector('.offer-right, .reward-right, [class$="-right"]');
    const ctaLinks = Array.from((right || element).querySelectorAll("a[href]"));
    const ctas = ctaLinks.map((a) => {
      const p = document2.createElement("p");
      p.append(a);
      return p;
    });
    const contentCell = [...textEls, ...ctas];
    if (!bg && !contentCell.length) {
      element.remove();
      return;
    }
    const variants = element.classList.contains("reward") || element.classList.contains("dark") ? ["dark"] : [];
    const cells = [[bg || "", contentCell.length ? contentCell : ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-banner", variants, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/embed.js
  var SEARCH_URL = "/locations?postcode=";
  var MAP_URL = "https://www.google.com/maps?q=Fr%C3%A9scopa+coffee&output=embed";
  function parse3(element, { document: document2 }) {
    const panel = element.querySelector(".sidepanel") || element;
    const content = [];
    const heading = panel.querySelector(".sidepanel__title, h1, h2, h3, h4, h5, h6");
    if (heading && heading.textContent.trim()) {
      if (/^H[1-6]$/.test(heading.tagName)) content.push(heading);
      else {
        const h = document2.createElement("h3");
        h.textContent = heading.textContent.trim();
        content.push(h);
      }
    }
    const label = panel.querySelector(".search__title, .search p");
    if (label && label.textContent.trim()) {
      const p = document2.createElement("p");
      p.textContent = label.textContent.trim();
      content.push(p);
    }
    const input = panel.querySelector(".search__input, input");
    const button = panel.querySelector(".search__button, button");
    if (input || button) {
      const placeholder = input && (input.getAttribute("placeholder") || input.getAttribute("aria-label")) || "Post Code";
      const a = document2.createElement("a");
      a.href = SEARCH_URL;
      a.title = placeholder;
      a.textContent = button && button.textContent.trim() || "Search";
      const p = document2.createElement("p");
      p.append(a);
      content.push(p);
    }
    if (!content.length) {
      const texts = Array.from(element.querySelectorAll(":scope > div > div")).map((cell) => cell.textContent.trim()).filter((text) => text && !/^https?:/.test(text));
      if (texts.length) {
        const h = document2.createElement("h3");
        h.textContent = texts[0];
        content.push(h);
        texts.slice(1).forEach((text) => {
          const p = document2.createElement("p");
          p.textContent = text;
          content.push(p);
        });
      }
    }
    const iframe = element.querySelector(".map iframe[src], iframe[src]");
    const mapHref = iframe && /^https?:/.test(iframe.getAttribute("src")) && iframe.getAttribute("src") || MAP_URL;
    const mapLink = document2.createElement("a");
    mapLink.href = mapHref;
    mapLink.textContent = mapHref;
    const cells = [[content.length ? content : "", mapLink]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "embed", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards.js
  function parse4(element, { document: document2 }) {
    let items = Array.from(element.querySelectorAll(":scope > ul > li"));
    if (!items.length) items = Array.from(element.querySelectorAll(":scope > div"));
    const cells = [];
    items.forEach((item) => {
      const imageWrap = item.querySelector(".cards-card-image");
      const image = imageWrap && imageWrap.querySelector("picture, img") || item.querySelector("picture, img");
      const body = item.querySelector(".cards-card-body");
      let bodyContent = [];
      if (body) {
        bodyContent = Array.from(body.children).filter((el) => el.textContent.trim() || el.querySelector("img, picture"));
      } else {
        bodyContent = Array.from(item.querySelectorAll("h1, h2, h3, h4, h5, h6, p")).filter((el) => el.textContent.trim() && !el.querySelector("picture, img"));
      }
      if (!image && !bodyContent.length) return;
      cells.push([image || "", bodyContent.length ? bodyContent : ""]);
    });
    if (!cells.length) {
      element.remove();
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-feature.js
  function parse5(element, { document: document2 }) {
    let items = Array.from(element.querySelectorAll(":scope > ul > li"));
    if (!items.length) items = Array.from(element.querySelectorAll(":scope > div"));
    const cells = [];
    items.forEach((item) => {
      const imageWrap = item.querySelector(".cards-card-image");
      const image = imageWrap && imageWrap.querySelector("picture, img") || item.querySelector("picture, img");
      const body = item.querySelector(".cards-card-body");
      const bodyContent = [];
      const source = body ? Array.from(body.children) : Array.from(item.querySelectorAll("h1, h2, h3, h4, h5, h6, p"));
      source.forEach((el) => {
        if (!el.textContent.trim() || el.querySelector("picture, img")) return;
        const links = el.querySelectorAll("a[href]");
        if (links.length && el.textContent.trim() === Array.from(links).map((a) => a.textContent.trim()).join("")) {
          links.forEach((a) => {
            const p = document2.createElement("p");
            p.append(a);
            bodyContent.push(p);
          });
          return;
        }
        bodyContent.push(el);
      });
      if (!image && !bodyContent.length) return;
      cells.push([image || "", bodyContent.length ? bodyContent : ""]);
    });
    if (!cells.length) {
      element.remove();
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-numbered.js
  function parse6(element, { document: document2 }) {
    let items = Array.from(element.querySelectorAll(":scope > ul > li"));
    if (!items.length) items = Array.from(element.querySelectorAll(":scope > div"));
    const cells = [];
    items.forEach((item) => {
      const imageWrap = item.querySelector(".cards-card-image");
      const image = imageWrap && imageWrap.querySelector("picture, img") || item.querySelector("picture, img");
      const body = item.querySelector(".cards-card-body");
      let bodyContent = [];
      if (body) {
        bodyContent = Array.from(body.children).filter((el) => el.textContent.trim() || el.querySelector("img, picture"));
      } else {
        bodyContent = Array.from(item.querySelectorAll("h1, h2, h3, h4, h5, h6, p, ul, ol")).filter((el) => el.textContent.trim() && !el.querySelector("picture, img") && !el.parentElement.closest("ul, ol, p"));
      }
      if (!image && !bodyContent.length) return;
      cells.push([image || "", bodyContent.length ? bodyContent : ""]);
    });
    if (!cells.length) {
      element.remove();
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-numbered", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/video.js
  function parse7(element, { document: document2 }) {
    const iframe = element.querySelector("iframe.dm-video-iframe[src], iframe[src]");
    const video = element.querySelector("video");
    const videoSource = video && (video.getAttribute("src") || video.querySelector("source[src]") && video.querySelector("source[src]").getAttribute("src"));
    const anchor = element.querySelector("a[href]");
    const url = iframe && iframe.getAttribute("src") || videoSource || anchor && anchor.getAttribute("href");
    if (!url) {
      element.remove();
      return;
    }
    const cell = [];
    const poster = element.querySelector("picture, img");
    if (poster) {
      cell.push(poster);
    } else if (video && video.getAttribute("poster")) {
      const img = document2.createElement("img");
      img.src = video.getAttribute("poster");
      cell.push(img);
    }
    const link = document2.createElement("a");
    link.href = url;
    link.textContent = url;
    cell.push(link);
    const cells = [[cell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "video", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/frescopa-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function isEmptySection(el) {
    return el.classList.length === 1 && el.children.length === 0 && el.textContent.trim() === "";
  }
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header.header-wrapper",
        ".header.block",
        ".nav-wrapper",
        "nav#nav",
        "footer.footer-wrapper",
        ".footer.block"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header.header-wrapper",
        "footer.footer-wrapper",
        "nav#nav",
        "iframe",
        "noscript",
        "link"
      ]);
      element.querySelectorAll("div.section").forEach((section) => {
        if (isEmptySection(section)) section.remove();
      });
      element.querySelectorAll('div.section[style*="background-image"]').forEach((section) => {
        section.style.removeProperty("background-image");
      });
    }
  }

  // tools/importer/transformers/frescopa-dm-images.js
  function detectDynamicMediaUrl(urlStr) {
    let u;
    try {
      u = new URL(urlStr, "https://x/");
    } catch (e) {
      return false;
    }
    if (u.pathname.startsWith("/is/image/")) {
      return "scene7";
    }
    if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname) && u.pathname.startsWith("/adobe/assets/urn:") && !/\/play\/?$/.test(u.pathname)) {
      return "dm-openapi";
    }
    return false;
  }
  var LINKED_DM_INLINE_WRAPPER_TAGS = /* @__PURE__ */ new Set(["PICTURE"]);
  var LINKED_DM_WRAPPER_SIBLING_TAGS = /* @__PURE__ */ new Set(["SOURCE"]);
  function findLinkedDmCarrier(img) {
    if (!img || !img.parentElement) return null;
    let node = img;
    let parent = img.parentElement;
    while (parent && LINKED_DM_INLINE_WRAPPER_TAGS.has(parent.tagName)) {
      let foundNode = false;
      for (const child of parent.children) {
        if (child === node) {
          foundNode = true;
        } else if (!LINKED_DM_WRAPPER_SIBLING_TAGS.has(child.tagName)) {
          return null;
        }
      }
      if (!foundNode) return null;
      node = parent;
      parent = parent.parentElement;
    }
    if (!parent || parent.tagName !== "A") return null;
    if (parent.children.length !== 1 || parent.children[0] !== node) return null;
    if (parent.textContent.trim() !== "") return null;
    return parent;
  }
  var EMPTY_ALT_SENTINEL = "Image without alt text";
  function altToLinkText(alt) {
    return alt || EMPTY_ALT_SENTINEL;
  }
  function transform2(hookName, element, payload) {
    if (hookName !== "afterTransform") return;
    const doc = element.ownerDocument;
    element.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") || "";
      if (!detectDynamicMediaUrl(src)) return;
      let alt = img.getAttribute("alt") || "";
      if (/^https?:\/\//i.test(alt.trim())) alt = "";
      const linkedAnchor = findLinkedDmCarrier(img);
      if (linkedAnchor) {
        linkedAnchor.setAttribute("title", src);
        linkedAnchor.textContent = altToLinkText(alt);
        return;
      }
      const parent = img.parentElement;
      if (parent && parent.tagName === "A") {
        console.warn("DM image inside mixed-content anchor, skipped:", src);
        return;
      }
      const a = doc.createElement("a");
      a.href = src;
      a.textContent = altToLinkText(alt);
      img.replaceWith(a);
    });
  }

  // tools/importer/transformers/frescopa-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  var FIRST_SECTION_ATTR = "data-excat-first-section";
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      if (!sel) continue;
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform3(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    const doc = element.ownerDocument || document;
    if (hookName === "beforeTransform") {
      const firstOnPage = element.querySelector("main > div.section") || element.querySelector("div.section");
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const isFirst = sectionEl === firstOnPage;
        if (isFirst && !section.style) continue;
        const hr = doc.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        if (isFirst) hr.setAttribute(FIRST_SECTION_ATTR, "true");
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (marker.hasAttribute(FIRST_SECTION_ATTR)) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-landing-page.js
  var parsers = {
    "hero": parse,
    "hero-banner": parse2,
    "embed": parse3,
    "cards": parse4,
    "cards-feature": parse5,
    "cards-numbered": parse6,
    "video": parse7
  };
  var PAGE_TEMPLATE = {
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
  var transformers = [
    transform,
    transform2,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform3] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
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
  var import_landing_page_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const { pathname } = new URL(params.originalURL);
      const rawPath = pathname.endsWith("/") ? `${pathname}index` : pathname.replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_landing_page_exports);
})();

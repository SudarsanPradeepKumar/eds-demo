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

  // tools/importer/import-teaser-form-page.js
  var import_teaser_form_page_exports = {};
  __export(import_teaser_form_page_exports, {
    default: () => import_teaser_form_page_default
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
    const bgClass = [...element.classList].find((c) => c.startsWith("frescopa-background-"));
    if (bgClass) options.push(bgClass.replace("frescopa-", ""));
    const name = options.length ? `hero (${options.join(", ")})` : "hero";
    const block = WebImporter.Blocks.createBlock(document2, { name, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/product-list-page.js
  var PRODUCT_LISTS = {
    coffee: [
      { urlPath: "bagged-coffee", category: "27" },
      { urlPath: "coffee-pods", category: "23" }
    ],
    accessories: [{ urlPath: "accessories", category: "28" }],
    tea: [{ urlPath: "tea", category: "30" }],
    machines: [{ urlPath: "coffee-machines", category: "29" }]
  };
  function parse2(element, { document: document2, url, params }) {
    const pageUrl = params && params.originalURL || url;
    const slug = new URL(pageUrl).pathname.replace(/\/+$/, "").split("/").pop();
    const configs = PRODUCT_LISTS[slug] || [];
    const remaining = document2.querySelectorAll(".product-list-page-custom.block").length;
    const config = configs[configs.length - remaining];
    if (!config) {
      console.warn(`product-list-page: no catalog config for "${slug}"`);
      element.remove();
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "product-list-page",
      cells: [["urlPath", config.urlPath], ["category", config.category]]
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/adaptive-form.js
  function readSourceForms(pageUrl, document2) {
    try {
      const { origin, pathname } = new URL(pageUrl);
      const docPath = pathname.endsWith("/") ? `${pathname}index` : pathname.replace(/\.html?$/, "");
      const xhr = new XMLHttpRequest();
      xhr.open("GET", `${origin}${docPath}.plain.html`, false);
      xhr.send();
      if (xhr.status !== 200) return [];
      const doc = new DOMParser().parseFromString(xhr.responseText, "text/html");
      return [...doc.querySelectorAll("div.form, div.embed-adaptive-form")];
    } catch (e) {
      console.warn("adaptive-form: could not read source document", e);
      return [];
    }
  }
  function parse3(element, { document: document2, url, params }) {
    const pageUrl = params && params.originalURL || url;
    const sourceForms = readSourceForms(pageUrl, document2);
    const remaining = document2.querySelectorAll(".form.block, .embed-adaptive-form.block").length;
    const source = sourceForms[sourceForms.length - remaining];
    let cell = "";
    const link = source ? source.querySelector("a[href]") : element.querySelector("a[href]");
    const code = source ? source.querySelector("pre code, code, pre") : null;
    if (code) {
      const pre = document2.createElement("pre");
      const c = document2.createElement("code");
      c.textContent = code.textContent.trim();
      pre.append(c);
      cell = pre;
    } else if (link) {
      const a = document2.createElement("a");
      a.href = link.getAttribute("href");
      a.textContent = link.getAttribute("href");
      cell = a;
    }
    if (!cell) {
      console.warn("adaptive-form: no form definition found");
      element.remove();
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "adaptive-form", cells: [[cell]] });
    element.replaceWith(block);
  }

  // tools/importer/parsers/sticky-cta.js
  function parse4(element, { document: document2 }) {
    const link = element.querySelector("a[href]");
    if (!link) {
      element.remove();
      return;
    }
    const img = element.querySelector("img");
    const a = document2.createElement("a");
    a.href = link.getAttribute("href");
    a.textContent = link.textContent.trim();
    const cells = [];
    if (img) {
      const icon = img.cloneNode(true);
      icon.removeAttribute("class");
      cells.push([icon]);
    }
    cells.push([a]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "sticky-cta", cells });
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

  // tools/importer/import-teaser-form-page.js
  var parsers = {
    "hero": parse,
    "product-list-page": parse2,
    "adaptive-form": parse3,
    "sticky-cta": parse4
  };
  var PAGE_TEMPLATE = {
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
  var import_teaser_form_page_default = {
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
  return __toCommonJS(import_teaser_form_page_exports);
})();

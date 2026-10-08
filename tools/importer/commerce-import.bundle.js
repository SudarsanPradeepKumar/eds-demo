/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
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

  // tools/importer/commerce-import.js
  var commerce_import_exports = {};
  __export(commerce_import_exports, {
    default: () => commerce_import_default
  });

  // tools/importer/parsers/hero.js
  function parse(element, { document }) {
    const bg = element.querySelector(".background picture, .background img") || element.querySelector("picture, img");
    const img = bg && (bg.tagName === "IMG" ? bg : bg.querySelector("img"));
    if (img && /^https?:\/\//.test(img.getAttribute("alt") || "")) img.setAttribute("alt", "");
    const content = [];
    const eyebrowEl = element.querySelector('.eyebrow, [class*="eyebrow"], .pretitle');
    if (eyebrowEl && eyebrowEl.textContent.trim()) {
      const p = document.createElement("p");
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
        const p = document.createElement("p");
        p.textContent = desc.textContent.trim();
        content.push(p);
      }
    }
    const ctas = Array.from(element.querySelectorAll(".cta a[href]"));
    if (!ctas.length) ctas.push(...element.querySelectorAll(".foreground a[href]"));
    ctas.forEach((a) => {
      const p = document.createElement("p");
      let wrapper = null;
      if (a.classList.contains("primary")) wrapper = document.createElement("strong");
      else if (a.classList.contains("secondary")) wrapper = document.createElement("em");
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
    const block = WebImporter.Blocks.createBlock(document, { name, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/embed.js
  var SEARCH_URL = "/locations?postcode=";
  var MAP_URL = "https://www.google.com/maps?q=Fr%C3%A9scopa+coffee&output=embed";
  function parse2(element, { document }) {
    const panel = element.querySelector(".sidepanel") || element;
    const content = [];
    const heading = panel.querySelector(".sidepanel__title, h1, h2, h3, h4, h5, h6");
    if (heading && heading.textContent.trim()) {
      if (/^H[1-6]$/.test(heading.tagName)) content.push(heading);
      else {
        const h = document.createElement("h3");
        h.textContent = heading.textContent.trim();
        content.push(h);
      }
    }
    const label = panel.querySelector(".search__title, .search p");
    if (label && label.textContent.trim()) {
      const p = document.createElement("p");
      p.textContent = label.textContent.trim();
      content.push(p);
    }
    const input = panel.querySelector(".search__input, input");
    const button = panel.querySelector(".search__button, button");
    if (input || button) {
      const placeholder = input && (input.getAttribute("placeholder") || input.getAttribute("aria-label")) || "Post Code";
      const a = document.createElement("a");
      a.href = SEARCH_URL;
      a.title = placeholder;
      a.textContent = button && button.textContent.trim() || "Search";
      const p = document.createElement("p");
      p.append(a);
      content.push(p);
    }
    if (!content.length) {
      const texts = Array.from(element.querySelectorAll(":scope > div > div")).map((cell) => cell.textContent.trim()).filter((text) => text && !/^https?:/.test(text));
      if (texts.length) {
        const h = document.createElement("h3");
        h.textContent = texts[0];
        content.push(h);
        texts.slice(1).forEach((text) => {
          const p = document.createElement("p");
          p.textContent = text;
          content.push(p);
        });
      }
    }
    const iframe = element.querySelector(".map iframe[src], iframe[src]");
    const mapHref = iframe && /^https?:/.test(iframe.getAttribute("src")) && iframe.getAttribute("src") || MAP_URL;
    const mapLink = document.createElement("a");
    mapLink.href = mapHref;
    mapLink.textContent = mapHref;
    const cells = [[content.length ? content : "", mapLink]];
    const block = WebImporter.Blocks.createBlock(document, { name: "embed", cells });
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

  // tools/importer/commerce-import.js
  var PLP_TEMPLATE = {
    name: "PLP Template",
    urls: [
      "https://frescopa.coffee/coffee",
      "https://frescopa.coffee/en/coffee",
      "https://frescopa.coffee/es/coffee",
      "https://frescopa.coffee/fr/coffee",
      "https://frescopa.coffee/jp/coffee"
    ],
    // one entry per product grid, in page order (same on every locale)
    productLists: [
      { urlPath: "bagged-coffee", category: "27" },
      { urlPath: "coffee-pods", category: "23" }
    ]
  };
  var PLP_SECTION = "main > div.section.product-list-page-custom-container";
  function runParser(parser, element, ctx) {
    if (!element) return null;
    const holder = ctx.document.createElement("div");
    holder.append(element);
    try {
      parser(element, ctx);
    } catch (e) {
      console.error("Parser failed:", e);
      return null;
    }
    return holder.firstElementChild;
  }
  function executeTransformers(hookName, element, payload) {
    [transform, transform2].forEach((fn) => {
      try {
        fn.call(null, hookName, element, payload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function productListBlock(document, config) {
    return WebImporter.DOMUtils.createTable([
      ["product-list-page"],
      ["urlPath", config.urlPath],
      ["category", config.category]
    ], document);
  }
  function sectionMetadata(document, style) {
    return WebImporter.DOMUtils.createTable([
      ["Section Metadata"],
      ["style", style]
    ], document);
  }
  var commerce_import_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      const ctx = { document, url, params };
      executeTransformers("beforeTransform", main, payload);
      const hero = runParser(parse, document.querySelector(".teaser-container .teaser.block"), ctx);
      const plpSection = document.querySelector(PLP_SECTION);
      const productArea = [];
      let listIndex = 0;
      let articleContent = [];
      let storeLocator = null;
      if (plpSection) {
        [...plpSection.children].forEach((wrapper) => {
          if (wrapper.matches(".default-content-wrapper")) {
            productArea.push(...[...wrapper.children].filter((el) => el.textContent.trim() || el.querySelector("img, picture")));
          } else if (wrapper.matches(".product-list-page-custom-wrapper")) {
            const config = PLP_TEMPLATE.productLists[listIndex];
            listIndex += 1;
            if (config) productArea.push(productListBlock(document, config));
            else console.warn("commerce-import: more product grids than configured");
          } else if (wrapper.matches(".dm-scene7-template-wrapper")) {
            const img = wrapper.querySelector("img");
            if (img) {
              const p = document.createElement("p");
              p.append(img);
              productArea.push(p);
            }
          } else if (wrapper.matches(".article-wrapper")) {
            const content = wrapper.querySelector(".article-content") || wrapper;
            articleContent = [...content.querySelectorAll("h1, h2, h3, h4, h5, h6, p")].filter((el) => el.textContent.trim()).map((el) => {
              el.removeAttribute("class");
              return el;
            });
          } else if (wrapper.matches(".store-locator-wrapper")) {
            storeLocator = runParser(parse2, wrapper.querySelector(".store-locator"), ctx);
          }
        });
      } else {
        console.warn("commerce-import: product listing section not found");
      }
      main.innerHTML = "";
      const sections = [];
      if (hero) sections.push([hero]);
      if (productArea.length) sections.push(productArea);
      if (articleContent.length) sections.push([...articleContent, sectionMetadata(document, "article")]);
      if (storeLocator) sections.push([storeLocator]);
      sections.forEach((nodes, i) => {
        if (i > 0) main.append(document.createElement("hr"));
        nodes.forEach((n) => main.append(n));
      });
      executeTransformers("afterTransform", main, payload);
      main.append(document.createElement("hr"));
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const { pathname } = new URL(params.originalURL || url);
      const rawPath = pathname.endsWith("/") ? `${pathname}index` : pathname.replace(/\.html?$/i, "");
      return [{
        element: main,
        path: WebImporter.FileUtils.sanitizePath(rawPath),
        report: {
          title: document.title,
          template: PLP_TEMPLATE.name,
          productLists: listIndex
        }
      }];
    }
  };
  return __toCommonJS(commerce_import_exports);
})();

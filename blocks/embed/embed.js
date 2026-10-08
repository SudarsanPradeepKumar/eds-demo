/*
 * Embed Block
 * Embeds third-party content (maps, videos, social posts, generic iframes).
 * Optional authored content (heading, text, CTA) renders as a side panel next to the embed.
 * Based on https://www.aem.live/developer/block-collection/embed
 */

const loadScript = (url) => {
  const script = document.createElement('script');
  script.src = url;
  document.head.append(script);
  return script;
};

const iframe = (src, title, allow = 'encrypted-media') => `<iframe src="${src}" allow="${allow}"
  allowfullscreen="" loading="lazy" title="${title}"></iframe>`;

const embedYoutube = (url, autoplay) => {
  const usp = new URLSearchParams(url.search);
  const suffix = autoplay ? '&muted=1&autoplay=1' : '';
  let vid = usp.get('v') ? encodeURIComponent(usp.get('v')) : '';
  if (url.origin.includes('youtu.be')) [, vid] = url.pathname.split('/');
  const src = vid ? `https://www.youtube.com/embed/${vid}?rel=0&v=${vid}${suffix}` : url.href;
  return iframe(src, 'Content from Youtube', 'autoplay; fullscreen; picture-in-picture; encrypted-media');
};

const embedVimeo = (url, autoplay) => {
  const [, video] = url.pathname.split('/');
  const suffix = autoplay ? '?muted=1&autoplay=1' : '';
  return iframe(`https://player.vimeo.com/video/${video}${suffix}`, 'Content from Vimeo', 'autoplay; fullscreen; picture-in-picture');
};

const embedTwitter = (url) => {
  const href = url.href.replace('https://x.com', 'https://twitter.com');
  loadScript('https://platform.twitter.com/widgets.js');
  return `<blockquote class="twitter-tweet"><a href="${href}"></a></blockquote>`;
};

const embedMap = (url) => iframe(url.href, 'Map', 'fullscreen');

const EMBEDS_CONFIG = [
  { type: 'youtube', match: ['youtube', 'youtu.be'], embed: embedYoutube },
  { type: 'vimeo', match: ['vimeo'], embed: embedVimeo },
  { type: 'twitter', match: ['twitter', 'x.com'], embed: embedTwitter },
  { type: 'map', match: ['google.com/maps', 'maps.google', 'goo.gl/maps'], embed: embedMap },
];

function loadEmbed(block, media, link, autoplay) {
  if (media.classList.contains('embed-is-loaded')) return;
  let url;
  try {
    url = new URL(link);
  } catch {
    return;
  }
  const config = EMBEDS_CONFIG.find((e) => e.match.some((m) => link.includes(m)));
  media.innerHTML = config
    ? config.embed(url, autoplay)
    : iframe(url.href, `Content from ${url.hostname}`);
  block.classList.add(`embed-${config ? config.type : 'generic'}`);
  media.classList.add('embed-is-loaded');
}

/**
 * Turns a "search" link (href ending in an empty query param, e.g. /locations?postcode=)
 * into a small GET form: input + submit button labelled with the link text.
 */
function buildSearchForm(a) {
  let url;
  try {
    url = new URL(a.href);
  } catch {
    return null;
  }
  const params = [...url.searchParams.entries()];
  const empty = params.find(([, v]) => v === '');
  if (!empty) return null;
  const form = document.createElement('form');
  form.className = 'embed-search';
  form.method = 'get';
  form.action = `${url.origin}${url.pathname}`;
  params.filter(([k]) => k !== empty[0]).forEach(([k, v]) => {
    const hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.name = k;
    hidden.value = v;
    form.append(hidden);
  });
  const input = document.createElement('input');
  input.type = 'search';
  const [paramName] = empty;
  input.name = paramName;
  input.placeholder = a.title || paramName;
  input.setAttribute('aria-label', a.title || paramName);
  const button = document.createElement('button');
  button.type = 'submit';
  button.textContent = a.textContent.trim() || 'Search';
  form.append(input, button);
  return form;
}

function isLinkOnly(cell) {
  const links = cell.querySelectorAll('a');
  return links.length === 1 && cell.textContent.trim() === links[0].textContent.trim()
    && !cell.querySelector('h1, h2, h3, h4, h5, h6');
}

export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  // the embed source: first cell that is only a link (or a picture + link placeholder)
  const isPlaceholder = (c) => c.querySelector('picture') && c.querySelector('a')
    && !c.querySelector('h1, h2, h3, h4, h5, h6');
  const sourceCell = cells.find((c) => isLinkOnly(c) || isPlaceholder(c))
    || (cells.length === 1 ? cells[0] : undefined);
  const link = sourceCell?.querySelector('a')?.href;
  const placeholder = sourceCell?.querySelector('picture');
  const contentCells = cells.filter((c) => c !== sourceCell && c.textContent.trim() !== '');

  block.textContent = '';

  if (contentCells.length) {
    const panel = document.createElement('div');
    panel.className = 'embed-content';
    contentCells.forEach((c) => panel.append(...c.childNodes));
    panel.querySelectorAll('a').forEach((a) => {
      const form = buildSearchForm(a);
      if (!form) return;
      const container = a.closest('.button-container, p') || a;
      container.replaceWith(form);
    });
    block.append(panel);
    block.classList.add('embed-has-content');
  }

  if (!link) return;

  const media = document.createElement('div');
  media.className = 'embed-media';
  block.append(media);

  if (placeholder) {
    const wrapper = document.createElement('div');
    wrapper.className = 'embed-placeholder';
    wrapper.innerHTML = '<div class="embed-placeholder-play"><button type="button" title="Play"></button></div>';
    wrapper.prepend(placeholder);
    wrapper.addEventListener('click', () => loadEmbed(block, media, link, true));
    media.append(wrapper);
  } else {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        loadEmbed(block, media, link);
      }
    });
    observer.observe(block);
  }
}

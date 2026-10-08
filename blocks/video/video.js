/*
 * Video Block
 * Shows a video (MP4 / YouTube / Vimeo / Scene7 or any direct video URL) referenced by a link,
 * with an optional poster image that becomes a click-to-play placeholder.
 * Player pages that are not video files (e.g. AEM Dynamic Media `/play` URLs) are embedded
 * in a responsive 16:9 iframe.
 * Based on https://www.aem.live/developer/block-collection/video
 */

const OPTION_CLASSES = ['autoplay'];

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// path segments / extensions that identify an HTML player page rather than a video file
const PLAYER_PATH = /\/(play|player|embed)(\/|$)/i;
const PAGE_EXTENSIONS = ['html', 'htm', 'php', 'asp', 'aspx', 'jsp'];

function isPlayerPage(link) {
  let url;
  try {
    url = new URL(link, window.location.href);
  } catch {
    return false;
  }
  if (PLAYER_PATH.test(url.pathname)) return true;
  const last = url.pathname.split('/').pop();
  const ext = last.includes('.') ? last.split('.').pop().toLowerCase() : '';
  return PAGE_EXTENSIONS.includes(ext);
}

function getVideoSource(link) {
  if (link.includes('youtube') || link.includes('youtu.be')) return 'youtube';
  if (link.includes('vimeo')) return 'vimeo';
  if (isPlayerPage(link)) return 'player';
  return 'video';
}

const TYPE_LABELS = {
  youtube: 'YouTube video', vimeo: 'Vimeo video', player: 'video', video: 'video',
};

function iframeWrapper(src, title, allow) {
  const wrapper = document.createElement('div');
  wrapper.className = 'video-frame';
  const iframe = document.createElement('iframe');
  iframe.src = src;
  iframe.title = title;
  iframe.allow = allow;
  iframe.allowFullscreen = true;
  iframe.loading = 'lazy';
  wrapper.append(iframe);
  return { wrapper, iframe };
}

function embedYoutube(url, autoplay, background) {
  const usp = new URLSearchParams(url.search);
  let vid = usp.get('v') ? encodeURIComponent(usp.get('v')) : '';
  if (url.origin.includes('youtu.be')) [, vid] = url.pathname.split('/');
  const params = new URLSearchParams({ rel: '0' });
  if (vid) params.set('v', vid);
  if (autoplay || background) {
    params.set('autoplay', autoplay ? '1' : '0');
    params.set('mute', background ? '1' : '0');
    params.set('controls', background ? '0' : '1');
    params.set('loop', background ? '1' : '0');
    params.set('playsinline', background ? '1' : '0');
  }
  const src = vid ? `https://www.youtube.com/embed/${vid}?${params}` : url.href;
  return iframeWrapper(src, 'Content from Youtube', 'autoplay; fullscreen; picture-in-picture; encrypted-media');
}

function embedVimeo(url, autoplay, background) {
  const [, video] = url.pathname.split('/');
  const params = new URLSearchParams();
  if (autoplay) params.set('autoplay', '1');
  if (background) params.set('background', '1');
  const qs = params.toString() ? `?${params}` : '';
  return iframeWrapper(`https://player.vimeo.com/video/${video}${qs}`, 'Content from Vimeo', 'autoplay; fullscreen; picture-in-picture');
}

function embedPlayer(url, autoplay, title) {
  const src = new URL(url.href);
  // AEM Dynamic Media players honour `autoplay`; only add it when playback was requested
  // (e.g. after a placeholder click) and the author did not set it explicitly
  if (autoplay && /\/play\/?$/.test(src.pathname) && !src.searchParams.has('autoplay')) {
    src.searchParams.set('autoplay', 'true');
  }
  return iframeWrapper(src.href, title || 'Video player', 'autoplay; fullscreen; picture-in-picture; encrypted-media');
}

function getVideoElement(src, autoplay, background, poster) {
  const video = document.createElement('video');
  video.controls = !background;
  video.preload = 'metadata';
  if (poster) video.poster = poster;
  if (autoplay) video.autoplay = true;
  if (background) {
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
  }
  const source = document.createElement('source');
  source.src = src;
  const ext = new URL(src, window.location.href).pathname.split('.').pop().toLowerCase();
  if (['mp4', 'webm', 'ogg'].includes(ext)) source.type = `video/${ext}`;
  video.append(source);
  return video;
}

function loadVideo(block, link, {
  autoplay = false, background = false, poster, title,
} = {}) {
  if (block.dataset.embedLoaded === 'true') return;
  let url;
  try {
    url = new URL(link, window.location.href);
  } catch {
    return;
  }
  const source = getVideoSource(link);
  const markLoaded = () => { block.dataset.embedLoaded = 'true'; };
  if (source === 'video') {
    const video = getVideoElement(url.href, autoplay, background, poster);
    video.addEventListener('loadedmetadata', markLoaded, { once: true });
    block.append(video);
    if (autoplay) video.play().catch(() => {});
  } else {
    let embed;
    if (source === 'youtube') embed = embedYoutube(url, autoplay, background);
    else if (source === 'vimeo') embed = embedVimeo(url, autoplay, background);
    else embed = embedPlayer(url, autoplay, title);
    embed.iframe.addEventListener('load', markLoaded, { once: true });
    block.append(embed.wrapper);
  }
}

export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  const autoplay = active.includes('autoplay');

  const placeholder = block.querySelector('picture');
  const anchor = block.querySelector('a');
  const link = anchor?.href;
  // accessible iframe title: the link's own text, unless it is just the raw URL
  const title = [anchor?.title, anchor?.textContent]
    .map((t) => (t || '').trim())
    .find((t) => t && !/^(https?:)?\/\//i.test(t)) || '';
  // any authored caption text (outside the link) is kept below the player
  const captionNodes = [...block.querySelectorAll('p, h1, h2, h3, h4, h5, h6')]
    .filter((el) => !el.querySelector('a, picture') && el.textContent.trim());

  block.textContent = '';
  block.dataset.embedLoaded = 'false';

  if (!link) {
    // no video source: degrade to the poster image alone
    if (placeholder) block.append(placeholder);
    return;
  }

  const poster = placeholder?.querySelector('img')?.currentSrc
    || placeholder?.querySelector('img')?.src;

  if (placeholder) {
    block.classList.add('video-has-placeholder');
    const wrapper = document.createElement('div');
    wrapper.className = 'video-placeholder';
    wrapper.append(placeholder);
    if (!autoplay) {
      const label = `Play ${TYPE_LABELS[getVideoSource(link)]}`;
      wrapper.insertAdjacentHTML('beforeend', `<div class="video-placeholder-play"><button type="button" title="${label}" aria-label="${label}"></button></div>`);
      wrapper.addEventListener('click', () => {
        wrapper.remove();
        loadVideo(block, link, { autoplay: true, poster, title });
      });
    }
    block.append(wrapper);
  }

  if (!placeholder || autoplay) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        const playOnLoad = autoplay && !prefersReducedMotion.matches;
        loadVideo(block, link, {
          autoplay: playOnLoad, background: autoplay, poster, title,
        });
        block.querySelector('.video-placeholder')?.remove();
      }
    });
    observer.observe(block);
  }

  if (captionNodes.length) {
    const caption = document.createElement('div');
    caption.className = 'video-caption';
    caption.append(...captionNodes);
    block.append(caption);
  }
}

/* eslint-disable */
/* global WebImporter */
/**
 * Parser for video. Base: video. Source: https://frescopa.coffee/sustainability
 * Instance: .dm-video-container .dm-video.block
 * Target model (blocks/video/README.md): one row, one cell;
 *   optional poster picture + link to the video URL. The README defines no
 *   variations/options, so the source 'autoplay' setting is not emitted as a
 *   block option (it remains in the Dynamic Media /play URL query string).
 *
 * Selectors verified in migration-work/block-context/video/source.html:
 *   .dm-video-iframe-wrap > iframe.dm-video-iframe[src] (Dynamic Media /play URL)
 * Fallbacks: any iframe[src], video[src] / video > source[src], a[href].
 */
/**
 * Authored video links from the page's source document (<page>.plain.html).
 * The source `video` block renders a video.js player whose DOM no longer holds
 * the authored player URL, so it is read from the document instead.
 */
function readSourceVideoLinks(pageUrl) {
  try {
    const { origin, pathname } = new URL(pageUrl);
    const docPath = pathname.endsWith('/') ? `${pathname}index` : pathname.replace(/\.html?$/, '');
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `${origin}${docPath}.plain.html`, false); // sync: parsers are synchronous
    xhr.send();
    if (xhr.status !== 200) return [];
    const doc = new DOMParser().parseFromString(xhr.responseText, 'text/html');
    return [...doc.querySelectorAll('div.video')].map((v) => v.querySelector('a[href]'))
      .map((a) => (a ? a.getAttribute('href') : null));
  } catch (e) {
    return [];
  }
}

export default function parse(element, { document, url: pageUrlArg, params }) {
  const iframe = element.querySelector('iframe.dm-video-iframe[src], iframe[src]');
  const video = element.querySelector('video');
  const videoSource = video && (video.getAttribute('src')
    || (video.querySelector('source[src]') && video.querySelector('source[src]').getAttribute('src')));
  const anchor = element.querySelector('a[href]');

  // source `video` blocks: the authored link (e.g. a Dynamic Media /play URL) wins
  let authored = null;
  if (element.classList.contains('video')) {
    const links = readSourceVideoLinks((params && params.originalURL) || pageUrlArg);
    // earlier video blocks were already replaced, so the remaining count gives our index
    const remaining = document.querySelectorAll('.video.block').length;
    authored = links[links.length - remaining] || null;
  }

  const url = authored
    || (iframe && iframe.getAttribute('src'))
    || videoSource
    || (anchor && anchor.getAttribute('href'));

  // Empty-block guard
  if (!url) {
    element.remove();
    return;
  }

  const cell = [];

  // Optional poster image (picture/img in the block, or the <video poster> attribute)
  const poster = element.querySelector('picture, img');
  if (poster) {
    cell.push(poster);
  } else if (video && video.getAttribute('poster')) {
    const img = document.createElement('img');
    img.src = video.getAttribute('poster');
    cell.push(img);
  }

  // Plain link whose href is exactly the source video URL
  const link = document.createElement('a');
  link.href = url;
  link.textContent = url;
  cell.push(link);

  const cells = [[cell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'video', cells });
  element.replaceWith(block);
}

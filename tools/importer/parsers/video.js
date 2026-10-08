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
export default function parse(element, { document }) {
  const iframe = element.querySelector('iframe.dm-video-iframe[src], iframe[src]');
  const video = element.querySelector('video');
  const videoSource = video && (video.getAttribute('src')
    || (video.querySelector('source[src]') && video.querySelector('source[src]').getAttribute('src')));
  const anchor = element.querySelector('a[href]');

  const url = (iframe && iframe.getAttribute('src'))
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

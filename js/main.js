import * as dom from './dom.js';
import { loadImages, saveImages, clearStoredImages } from './storage.js';
import { validateImage } from './validation.js';
import { createMoodboardItem } from './moodboard.js';
import { exportMoodboard, shareMoodboard } from './export.js';

const images = loadImages();

images.forEach(url => {
  createMoodboardItem({ url, images, masonry: dom.masonry });
});

async function addImage() {
  const url = dom.urlInput.value.trim();
  if (!url) return;

  const isValid = await validateImage(url);

  if (!isValid) {
    dom.urlInput.value = '';
    dom.urlInput.placeholder = 'Invalid image URL';
    return;
  }

  images.push(url);
  saveImages(images);

  createMoodboardItem({
    url,
    images,
    masonry: dom.masonry,
    fade: true
  });

  dom.urlInput.value = '';
  dom.urlInput.placeholder = 'Paste image URL here';
}

dom.addBtn.addEventListener('click', addImage);

dom.urlInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    addImage();
  }
});

dom.clearBtn.addEventListener('click', () => {
  if (!confirm('Clear the entire moodboard?')) return;

  clearStoredImages();
  images.length = 0;

  dom.masonry
    .querySelectorAll('.moodboard-item')
    .forEach(item => {
      item.classList.add('fade-out');
      item.addEventListener('transitionend', () => item.remove());
    });
});

dom.exportBtn.addEventListener('click', () =>
  exportMoodboard(dom.masonry)
);

dom.shareBtn.addEventListener('click', () =>
  shareMoodboard(dom.masonry)
);
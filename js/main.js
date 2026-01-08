import * as dom from './dom.js';
import { loadImages, saveImages, clearStoredImages } from './storage.js';
import { validateImage } from './validation.js';
import { createMoodboardItem, updateEmptyMessage } from './moodboard.js';
import { exportMoodboard, shareMoodboard } from './export.js';

const images = loadImages();

images.forEach(url => {
  createMoodboardItem({ url, images, masonry: dom.masonry });
  updateEmptyMessage(dom.masonry.querySelectorAll('.moodboard-item'));
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

  updateEmptyMessage(dom.masonry.querySelectorAll('.moodboard-item'));

  dom.urlInput.value = '';
  dom.urlInput.placeholder = 'Image URL';
}

dom.addBtn.addEventListener('click', addImage);

dom.urlInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    addImage();
  }
});

dom.clearBtn.addEventListener('click', () => {
  if (images.length === 0) {
    alert('No images to clear!');
    return;
  }

  if (!confirm('Unweave everything?')) return;

  clearStoredImages();
  images.length = 0;

  dom.masonry
    .querySelectorAll('.moodboard-item')
    .forEach(item => {
      item.classList.add('fade-out');
      item.addEventListener('transitionend', () => item.remove());
    });

  updateEmptyMessage(dom.masonry.querySelectorAll('.moodboard-item'));
});

dom.exportBtn.addEventListener('click', () =>
  exportMoodboard(dom.masonry)
);

dom.shareBtn.addEventListener('click', () =>
  shareMoodboard(dom.masonry)
);
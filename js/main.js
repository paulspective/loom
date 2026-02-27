import * as dom from './dom.js';
import { validateImage } from './validation.js';
import { createMoodboardItem, updateEmptyMessage } from './moodboard.js';
import { exportMoodboard, shareMoodboard } from './export.js';

const images = [];

async function addImageFromURL() {
  const url = dom.urlInput.value.trim();
  if (!url) return;

  const isValid = await validateImage(url);
  if (!isValid) {
    dom.urlInput.value = '';
    dom.urlInput.placeholder = 'Invalid image URL';
    return;
  }

  images.push(url);

  createMoodboardItem({
    url,
    images,
    masonry: dom.masonry,
    fade: true
  });

  dom.urlInput.value = '';
  dom.urlInput.placeholder = 'Image URL';

  updateEmptyMessage(images, dom.masonry);
}

function addImageFromFile(file) {
  if (!file || !file.type.startsWith('image/')) return;

  const blobUrl = URL.createObjectURL(file);
  images.push(blobUrl);

  createMoodboardItem({
    url: blobUrl,
    images,
    masonry: dom.masonry,
    fade: true,
    revokeOnRemove: true
  });

  updateEmptyMessage(images, dom.masonry);
}

dom.addBtn.addEventListener('click', addImageFromURL);

dom.urlInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    addImageFromURL();
  }
});

dom.uploadBtn.addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';

  input.onchange = () => {
    const file = input.files[0];
    addImageFromFile(file);
  };

  input.click();
});

dom.clearBtn.addEventListener('click', () => {
  if (images.length === 0) {
    alert('Nothing to unweave yet.');
    return;
  }

  if (!confirm('Unweave everything?')) return;

  dom.masonry
    .querySelectorAll('.moodboard-item')
    .forEach(item => item.remove());

  images.length = 0;
  updateEmptyMessage(images, dom.masonry);
});

dom.exportBtn.addEventListener('click', () =>
  exportMoodboard(dom.masonry)
);

dom.shareBtn.addEventListener('click', () =>
  shareMoodboard(dom.masonry)
);

window.addEventListener('beforeunload', e => {
  const hasItems = dom.masonry.querySelector('.moodboard-item') !== null;
  if (!hasItems) return;

  e.preventDefault();
  e.returnValue = '';
});

updateEmptyMessage(images, dom.masonry);
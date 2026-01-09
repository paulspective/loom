import { saveImages } from './storage.js';
import { emptyMessage } from './dom.js';

export function createMoodboardItem({ url, images, masonry, fade = false }) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('moodboard-item');

  const img = document.createElement('img');
  img.src = url;
  if (fade) img.classList.add('fade-in');

  const removeBtn = document.createElement('button');
  removeBtn.classList.add('remove-btn');
  removeBtn.innerHTML =
    '<span class="material-symbols-outlined">close</span>';

  removeBtn.addEventListener('click', () => {
    wrapper.classList.add('fade-out');
    wrapper.addEventListener('transitionend', () => {
      wrapper.remove();

      updateEmptyMessage(images, masonry);
    });

    const index = images.indexOf(url);
    if (index > -1) {
      images.splice(index, 1);
      saveImages(images);
    }

    updateEmptyMessage(images, masonry);
  });

  wrapper.append(img, removeBtn);

  masonry.appendChild(wrapper);

  updateEmptyMessage(images, masonry);
}

export function updateEmptyMessage(images, masonry) {
  const hasItems = images.length > 0;
  emptyMessage.textContent = 'Nothing here yet. Start weaving.';
  emptyMessage.classList.toggle('hidden', hasItems);
  masonry.classList.toggle('has-items', hasItems);
}
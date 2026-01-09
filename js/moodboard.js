import { emptyMessage } from './dom.js';

export function createMoodboardItem({
  url,
  images,
  masonry,
  fade = false,
  revokeOnRemove = false
}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'moodboard-item';

  const img = document.createElement('img');
  img.src = url;
  if (fade) img.classList.add('fade-in');

  const removeBtn = document.createElement('button');
  removeBtn.className = 'remove-btn';
  removeBtn.innerHTML =
    '<span class="material-symbols-outlined">close</span>';

  removeBtn.addEventListener('click', () => {
    wrapper.classList.add('fade-out');

    wrapper.addEventListener(
      'transitionend',
      () => {
        wrapper.remove();

        const index = images.indexOf(url);
        if (index > -1) images.splice(index, 1);

        if (revokeOnRemove) {
          URL.revokeObjectURL(url);
        }

        updateEmptyMessage(images, masonry);
      },
      { once: true }
    );
  });

  wrapper.append(img, removeBtn);
  masonry.appendChild(wrapper);
}

export function updateEmptyMessage(images, masonry) {
  const hasItems = images.length > 0;

  emptyMessage.textContent = 'Nothing here yet. Start weaving.';
  emptyMessage.classList.toggle('hidden', hasItems);
  masonry.classList.toggle('has-items', hasItems);
}
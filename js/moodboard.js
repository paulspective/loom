import { saveImages } from './storage.js';

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
    });

    const index = images.indexOf(url);
    if (index > -1) {
      images.splice(index, 1);
      saveImages(images);
    }
  });

  wrapper.append(img, removeBtn);
  masonry.appendChild(wrapper);
}
import { emptyMessage, masonry } from './dom.js';

export function createMoodboardItem({
  url,
  images,
  grid,
  revokeOnRemove = false
}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'moodboard-item';

  const content = document.createElement('div');
  content.className = 'item-content';

  const img = document.createElement('img');
  img.src = url;

  const removeBtn = document.createElement('button');
  removeBtn.className = 'remove-btn';
  removeBtn.innerHTML = '<span class="material-symbols-outlined">close</span>';

  content.append(img, removeBtn);
  wrapper.appendChild(content);

  masonry.appendChild(wrapper);

  grid.add(wrapper);

  let muuriItem = grid.getItem(wrapper);

  removeBtn.addEventListener('click', () => {
    if (!muuriItem) {
      console.warn("No muuriItem found for", wrapper);
      return;
    }

    grid.hide(muuriItem, {
      onFinish: () => {
        grid.remove(muuriItem, { removeElements: true });

        const index = images.indexOf(url);
        if (index > -1) images.splice(index, 1);

        if (revokeOnRemove) URL.revokeObjectURL(url);

        updateEmptyMessage(images);
      }
    });
  });

  img.onload = () => {
    grid.refreshItems().layout();
    wrapper.classList.add('fade-in');
    updateEmptyMessage(images);
  };

  img.onerror = () => {
    console.error("Image failed to load:", url);
    wrapper.classList.add('broken-image');
    updateEmptyMessage(images);
  };
}

export function updateEmptyMessage(images) {
  const hasItems = images.length > 0;

  emptyMessage.innerHTML = `
    <span class="material-symbols-outlined empty-icon">photo_library</span>
    <span class="empty-title">Your weave is empty</span>
    <span class="empty-sub">Paste a URL or upload an image to get started</span>
  `;
  emptyMessage.classList.toggle('hidden', hasItems);
}
import { emptyMessage } from './dom.js';

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

  removeBtn.addEventListener('click', () => {
    const muuriItem = grid.getItems(wrapper)[0];

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

  content.append(img, removeBtn);
  wrapper.appendChild(content);

  img.onload = () => {
    grid.add(wrapper);
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

  emptyMessage.innerHTML = `
    <span class="material-symbols-outlined empty-icon">photo_library</span>
    <span class="empty-title">Your weave is empty</span>
    <span class="empty-sub">Paste a URL or upload an image to get started</span>
  `;
  emptyMessage.classList.toggle('hidden', hasItems);
  masonry.classList.toggle('has-items', hasItems);
}

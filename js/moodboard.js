import { emptyMessage, masonry } from './dom.js';

export function createMoodboardItem({
  url,
  images,
  grid,
  showModal,
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

  let muuriItem = null;

  removeBtn.addEventListener('click', () => {
    if (!muuriItem) return;

    showModal({
      title: 'Remove this image?',
      message: 'This will remove the image from your weave.',
      actions: [
        {
          label: 'Remove',
          style: 'danger',
          onClick: () => {
            wrapper.classList.add('fade-out');

            wrapper.addEventListener('animationend', () => {
              grid.remove([muuriItem], { removeElements: true });
              grid.layout();

              const index = images.indexOf(url);
              if (index > -1) images.splice(index, 1);

              if (revokeOnRemove) URL.revokeObjectURL(url);
              updateEmptyMessage(images);
            });
          }
        },
        { label: 'Cancel', style: 'primary' }
      ]
    });
  });

  content.append(img, removeBtn);
  wrapper.appendChild(content);
  masonry.appendChild(wrapper);

  img.onload = () => {
    grid.add(wrapper);
    muuriItem = grid.getItem(wrapper);
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
    <span class="material-symbols-outlined empty-icon">gallery_thumbnail</span>
    <span class="empty-title">Your weave is empty</span>
    <span class="empty-sub">Paste a URL or upload an image to get started</span>
  `;
  emptyMessage.classList.toggle('hidden', hasItems);
}

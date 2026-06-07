import { emptyMessage, masonry } from './dom.js';
import * as storage from './storage.js';

export function createMoodboardItem({
  url,
  images,
  grid,
  showModal,
  revokeOnRemove = false,
  meta = null
}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'moodboard-item';

  const content = document.createElement('div');
  content.className = 'item-content';

  const img = document.createElement('img');
  if (!url.startsWith('blob:')) {
    img.crossOrigin = 'anonymous';
  }
  img.src = url;
  img.draggable = false;
  img.addEventListener('dragstart', event => event.preventDefault());

  const removeBtn = document.createElement('button');
  removeBtn.className = 'remove-btn';
  removeBtn.innerHTML = '<span class="material-symbols-outlined">close</span>';

  if (meta && meta.entryId) {
    wrapper.dataset.entryId = meta.entryId;
    if (meta.isThumb) wrapper.classList.add('needs-full');
  }

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

            wrapper.addEventListener('transitionend', function handler(event) {
              if (event.propertyName !== 'opacity') return;
              wrapper.removeEventListener('transitionend', handler);

              grid.remove([muuriItem], { removeElements: true });
              grid.layout();

              const index = images.indexOf(url);
              if (index > -1) images.splice(index, 1);

              if (revokeOnRemove) URL.revokeObjectURL(url);
              // remove persisted entry if applicable
              const entryId = wrapper.dataset.entryId;
              if (entryId) storage.removeEntry(entryId);

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

    const overlay = document.createElement('div');
    overlay.className = 'broken-overlay';
    overlay.innerHTML = `
      <div class="broken-text">Failed to load</div>
      <div class="broken-actions">
        <button class="broken-retry loom-modal-btn primary">Retry</button>
        <button class="broken-remove loom-modal-btn danger">Remove</button>
      </div>
    `;

    content.appendChild(overlay);
    updateEmptyMessage(images);

    const retryBtn = overlay.querySelector('.broken-retry');
    const removeBtn = overlay.querySelector('.broken-remove');

    retryBtn.addEventListener('click', () => {
      if (url.startsWith('blob:')) {
        showModal({
          title: 'Cannot retry',
          message: 'Local uploads cannot be retried. Please re-upload the image.',
          actions: [{ label: 'Ok', style: 'primary' }]
        });
        return;
      }

      overlay.classList.add('hidden');

      const onLoad = () => {
        overlay.remove();
        img.removeEventListener('load', onLoad);
        img.removeEventListener('error', onError);
        updateEmptyMessage(images);
      };

      const onError = () => {
        overlay.classList.remove('hidden');
        img.removeEventListener('load', onLoad);
        img.removeEventListener('error', onError);
      };

      img.addEventListener('load', onLoad);
      img.addEventListener('error', onError);
      img.src = url + (url.includes('?') ? '&' : '?') + '_=' + Date.now();
    });

    removeBtn.addEventListener('click', () => {
      showModal({
        title: 'Remove this image?',
        message: 'This will remove the image from your weave.',
        actions: [
          {
            label: 'Remove',
            style: 'danger',
            onClick: () => {
              if (muuriItem) {
                grid.remove([muuriItem], { removeElements: true });
                grid.layout();
              } else {
                wrapper.remove();
              }

              const index = images.indexOf(url);
              if (index > -1) images.splice(index, 1);

              if (revokeOnRemove) URL.revokeObjectURL(url);
              const entryId = wrapper.dataset.entryId;
              if (entryId) storage.removeEntry(entryId);
              updateEmptyMessage(images);
            }
          },
          { label: 'Cancel', style: 'primary' }
        ]
      });
    });
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
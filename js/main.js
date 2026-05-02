import * as dom from './dom.js';
import { validateImage } from './validation.js';
import { createMoodboardItem, updateEmptyMessage } from './moodboard.js';
import { exportMoodboard, shareMoodboard } from './export.js';

const images = [];

const grid = new Muuri(dom.masonry, {
  dragEnabled: true,
  layout: { fillGaps: true }
});

function showModal({ title, message, actions }) {
  const overlay = document.createElement('div');
  overlay.className = 'loom-modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'loom-modal';

  const titleEl = document.createElement('p');
  titleEl.className = 'loom-modal-title';
  titleEl.textContent = title;

  const messageEl = document.createElement('p');
  messageEl.className = 'loom-modal-message';
  messageEl.textContent = message;

  const actionsEl = document.createElement('div');
  actionsEl.className = 'loom-modal-actions';

  actions.forEach(({ label, style, onClick }) => {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.className = `loom-modal-btn ${style || ''}`;
    btn.addEventListener('click', () => {
      overlay.remove();
      onClick?.();
    });
    actionsEl.appendChild(btn);
  });

  modal.appendChild(titleEl);
  modal.appendChild(messageEl);
  modal.appendChild(actionsEl);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.remove();
  });
}

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

  createMoodboardItem({ url, images, grid, showModal });

  dom.urlInput.value = '';
  dom.urlInput.placeholder = 'Image URL';
}

function addImageFromFile(file) {
  if (!file || !file.type.startsWith('image/')) return;

  const blobUrl = URL.createObjectURL(file);
  images.push(blobUrl);

  createMoodboardItem({ url: blobUrl, images, grid, showModal, revokeOnRemove: true });
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
  input.multiple = true;

  input.onchange = () => {
    Array.from(input.files).forEach(file => addImageFromFile(file));
  };

  input.click();
});

dom.clearBtn.addEventListener('click', () => {
  if (images.length === 0) {
    showModal({
      title: 'Nothing here yet.',
      message: 'Add some images to your weave first.',
      actions: [{ label: 'Got it', style: 'primary' }]
    });
    return;
  }

  showModal({
    title: 'Unweave everything?',
    message: 'This will remove all images from your board. This can\'t be undone.',
    actions: [
      {
        label: 'Unweave',
        style: 'danger',
        onClick: () => {
          grid.remove(grid.getItems(), { removeElements: true });
          images.length = 0;
          updateEmptyMessage(images);
        }
      },
      { label: 'Cancel', style: 'primary' }
    ]
  });
});

dom.exportBtn.addEventListener('click', () =>
  exportMoodboard(dom.masonry, showModal)
);

dom.shareBtn.addEventListener('click', () =>
  shareMoodboard(dom.masonry, showModal)
);

let leaving = false;

window.addEventListener('beforeunload', e => {
  const hasItems = grid.getItems().length > 0;
  if (!hasItems || leaving) return;

  e.preventDefault();
  e.returnValue = '';

  showModal({
    title: 'Your board isn\'t saved.',
    message: 'Export your weave before leaving or you\'ll lose everything.',
    actions: [
      {
        label: 'Export & Leave',
        style: 'primary',
        onClick: async () => {
          await exportMoodboard(dom.masonry, showModal);
          leaving = true;
          window.location.reload();
        }
      },
      {
        label: 'Leave anyway',
        style: 'danger',
        onClick: () => {
          leaving = true;
          window.location.reload();
        }
      },
      { label: 'Stay', style: 'ghost' }
    ]
  });
});

updateEmptyMessage(images);
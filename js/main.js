import * as dom from './dom.js';
import * as storage from './storage.js';
import { validateImage } from './validation.js';
import { createMoodboardItem, updateEmptyMessage } from './moodboard.js';
import { exportMoodboard, shareMoodboard } from './export.js';

const images = [];

const grid = new Muuri(dom.masonry, {
  dragEnabled: true,
  layout: { fillGaps: true },
  dragStartPredicate: { distance: 10, delay: 0, handle: '.item-content' },
  dragCssProps: { touchAction: 'none' }
});

grid.on('dragStart', (item) => {
  item.getElement().style.opacity = '0.85';
});

grid.on('dragEnd', (item) => {
  item.getElement().style.opacity = '1';
  // save layout order whenever user finishes dragging
  saveGridOrder();
});

grid.on('layoutEnd', () => {
  // save grid order after layout completes (after items load or are repositioned)
  saveGridOrder();
});

function showToast(message, duration = 2500) {
  const toast = document.createElement('div');
  toast.className = 'loom-toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 50);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function saveGridOrder() {
  const order = grid.getItems().map(item => {
    const el = item.getElement();
    return el.dataset.entryId || null;
  }).filter(Boolean);
  if (order.length > 0) {
    storage.updateEntryOrder(order);
  }
}

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

  let entry;
  try { entry = storage.addEntry({ type: 'url', url }); } catch (e) { console.warn('persist failed', e); }

  images.push(url);
  createMoodboardItem({ url, images, grid, showModal, meta: { entryId: entry?.id } });

  dom.urlInput.value = '';
  dom.urlInput.placeholder = 'Image URL';
}

async function createThumbnail(file, maxDim = 400) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        try {
          const dataUrl = c.toDataURL('image/jpeg', 0.8);
          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = reject;
      img.src = fr.result;
    };
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

async function addImageFromFile(file) {
  if (!file || !file.type.startsWith('image/')) return;

  // create a small thumbnail for persistence (compact hybrid)
  let thumb;
  try {
    thumb = await createThumbnail(file, 400);
  } catch (err) {
    console.warn('thumbnail failed, falling back to blob URL', err);
  }

  if (thumb) {
    const entry = storage.addEntry({ type: 'thumb', dataUrl: thumb, name: file.name, size: file.size });
    images.push(thumb);
    createMoodboardItem({ url: thumb, images, grid, showModal, revokeOnRemove: false, meta: { entryId: entry.id, isThumb: true } });
  } else {
    const blobUrl = URL.createObjectURL(file);
    images.push(blobUrl);
    createMoodboardItem({ url: blobUrl, images, grid, showModal, revokeOnRemove: true });
  }
}

dom.addBtn.addEventListener('click', addImageFromURL);

dom.urlInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    addImageFromURL();
  }
});

function openFilePicker() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.multiple = true;

  input.onchange = () => {
    Array.from(input.files).forEach(file => addImageFromFile(file));
  };

  input.click();
}

dom.uploadBtn.addEventListener('click', openFilePicker);

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
          const items = grid.getItems();
          const wrappers = items.map(item => item.getElement());
          let removedCount = 0;

          const finishRemoval = () => {
            const blobUrls = wrappers.map(wrapper => wrapper.querySelector('img')?.src)
              .filter(src => src?.startsWith('blob:'));

            removedCount += 1;
            if (removedCount !== wrappers.length) return;

            grid.remove(items, { removeElements: true });
            blobUrls.forEach(url => URL.revokeObjectURL(url));
            images.length = 0;
            // clear persisted state since all items are removed
            try { storage.clearState(); } catch (err) { console.warn('clearState failed', err); }
            updateEmptyMessage(images, openFilePicker);
          };

          if (wrappers.length === 0) {
            images.length = 0;
            updateEmptyMessage(images, openFilePicker);
            return;
          }

          wrappers.forEach(wrapper => {
            wrapper.classList.add('fade-out');
            wrapper.addEventListener('transitionend', function handler(event) {
              if (event.propertyName !== 'opacity') return;
              wrapper.removeEventListener('transitionend', handler);
              finishRemoval();
            });
          });
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

// restore persisted state (URLs and thumbnails)
function restoreState() {
  const state = storage.loadState();
  const order = storage.getEntryOrder();
  let itemCount = 0;

  if (state && state.length) {
    // sort entries by saved order if available
    let sorted = state;
    if (order && order.length) {
      sorted = state.sort((a, b) => {
        const aIdx = order.indexOf(a.id);
        const bIdx = order.indexOf(b.id);
        return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
      });
    }

    sorted.forEach(entry => {
      if (entry.type === 'url' && entry.url) {
        images.push(entry.url);
        createMoodboardItem({ url: entry.url, images, grid, showModal, meta: { entryId: entry.id } });
        itemCount++;
      } else if (entry.type === 'thumb' && entry.dataUrl) {
        images.push(entry.dataUrl);
        createMoodboardItem({ url: entry.dataUrl, images, grid, showModal, revokeOnRemove: false, meta: { entryId: entry.id, isThumb: true } });
        itemCount++;
      }
    });

    if (itemCount > 0) {
      showToast(`Restored ${itemCount} image${itemCount !== 1 ? 's' : ''} from your weave`);
    }
  }
  updateEmptyMessage(images, openFilePicker);
}

restoreState();
const addBtn = document.getElementById('add-btn');
const urlInput = document.getElementById('image-url');
const masonry = document.querySelector('.moodboard-masonry');
const clearBtn = document.getElementById('clear-btn');
const exportBtn = document.getElementById('export-btn');

const savedImages = JSON.parse(localStorage.getItem('loomImages')) || [];

function createMoodboardItem(url, fade = false) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('moodboard-item');

  const img = document.createElement('img');
  img.src = url;
  if (fade) img.classList.add('fade-in');

  const removeBtn = document.createElement('button');
  removeBtn.classList.add('remove-btn');
  removeBtn.title = 'Remove image';
  removeBtn.innerHTML = '<span class="material-symbols-outlined">close</span>';

  removeBtn.addEventListener('click', () => {
    wrapper.classList.add('fade-out');
    wrapper.addEventListener('transitionend', () => {
      wrapper.remove();
    });

    const index = savedImages.indexOf(url);
    if (index > -1) {
      savedImages.splice(index, 1);
      localStorage.setItem('loomImages', JSON.stringify(savedImages));
    }
  });

  wrapper.appendChild(img);
  wrapper.appendChild(removeBtn);
  return wrapper;
}

savedImages.forEach(url => {
  masonry.appendChild(createMoodboardItem(url));
});

function validateImage(url, callback) {
  const img = new Image();
  img.onload = () => callback(true);
  img.onerror = () => callback(false);
  img.src = url;
}

function addImage() {
  const url = urlInput.value.trim();
  if (!url) return;

  validateImage(url, (isValid) => {
    if (isValid) {
      masonry.appendChild(createMoodboardItem(url, true));
      savedImages.push(url);
      localStorage.setItem('loomImages', JSON.stringify(savedImages));
      urlInput.value = '';
      urlInput.placeholder = 'Paste image URL here';
    } else {
      urlInput.value = '';
      urlInput.placeholder = 'Invalid image URL, try again';
    }
  });
}

addBtn.addEventListener('click', addImage);
urlInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    addImage();
  }
});

function clearImages() {
  localStorage.removeItem('loomImages');
  savedImages.length = 0;

  const items = masonry.querySelectorAll('.moodboard-item');
  items.forEach(item => {
    item.classList.add('fade-out');
    item.addEventListener('transitionend', () => {
      item.remove();
    });
  });

  urlInput.placeholder = 'Paste image URL here';
}

clearBtn.addEventListener('click', clearImages);

exportBtn.addEventListener('click', () => {
  html2canvas(masonry, {
    useCORS: true,
    scale: 2
  }).then(canvas => {
    const link = document.createElement('a');
    link.download = 'moodboard.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
});

document.getElementById('share-btn').addEventListener('click', () => {
  html2canvas(masonry, { useCORS: true, scale: 2 }).then(canvas => {
    canvas.toBlob(blob => {
      const file = new File([blob], 'moodboard.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
          files: [file],
          title: 'My moodboard',
          text: 'Check out my moodboard from Loom!'
        });
      } else {
        alert('Sharing is not allowed on this device/browser.');
      }
    });
  });
});
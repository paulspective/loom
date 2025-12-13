const addBtn = document.getElementById('add-btn');
const urlInput = document.getElementById('image-url');
const masonry = document.querySelector('.moodboard-masonry');

const savedImages = JSON.parse(localStorage.getItem('loomImages')) || [];
savedImages.forEach(url => {
  const img = document.createElement('img');
  img.src = url;
  masonry.appendChild(img);
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
      const img = document.createElement('img');
      img.src = url;
      img.classList.add('fade-in');
      masonry.appendChild(img);

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
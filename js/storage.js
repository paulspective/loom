const KEY = 'loomImages';

export function loadImages() {
  return JSON.parse(localStorage.getItem(KEY)) || [];
}

export function saveImages(images) {
  localStorage.setItem(KEY, JSON.stringify(images));
}

export function clearStoredImages() {
  localStorage.removeItem(KEY);
}
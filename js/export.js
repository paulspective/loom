import { masonry } from './dom.js';

export async function exportMoodboard(masonry) {
  const images = masonry.querySelectorAll('img');
  if (images.length === 0) {
    alert('Nothing to export yet.');
    return;
  }

  masonry.querySelectorAll('.fade-in').forEach(el => {
    el.classList.remove('fade-in');
  });

  const canvas = await html2canvas(masonry, {
    useCORS: true,
    scale: 1
  });

  const link = document.createElement('a');
  link.download = 'moodboard.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export async function shareMoodboard(masonry) {
  const images = masonry.querySelectorAll('img');
  if (images.length === 0) {
    alert('There\'s nothing to share yet.');
    return;
  }

  masonry.querySelectorAll('.fade-in').forEach(el => {
    el.classList.remove('fade-in');
  });

  const canvas = await html2canvas(masonry, {
    useCORS: true,
    scale: 1
  });

  return new Promise(resolve => {
    canvas.toBlob(blob => {
      const file = new File([blob], 'moodboard.png', {
        type: 'image/png'
      });

      if (
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        navigator.share({
          files: [file],
          title: 'My moodboard',
          text: 'Check out my moodboard from Loom!'
        });
      } else {
        alert('Sharing not supported on this device.');
      }

      resolve();
    });
  });
}
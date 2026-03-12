export async function exportMoodboard(masonry) {
  const images = masonry.querySelectorAll('img');
  if (!images.length) {
    alert('Nothing to export yet.');
    return;
  }

  masonry.querySelectorAll('.fade-in').forEach(el => el.classList.remove('fade-in'));

  const MAX_PIXELS = 3000;
  const maxDimension = Math.max(masonry.offsetWidth, masonry.offsetHeight);
  const scale = Math.min(2, MAX_PIXELS / maxDimension);

  let canvas;
  try {
    canvas = await html2canvas(masonry, {
      useCORS: true,
      scale
    });
  } catch (err) {
    console.error('html2canvas failed:', err);
    alert('Could not create export image.');
    return;
  }

  canvas.toBlob(blob => {
    if (!blob) {
      console.error('toBlob returned null');
      alert('Export failed.');
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'moodboard.png';
    link.href = url;

    link.addEventListener('click', () => URL.revokeObjectURL(url), { once: true });
    link.click();
  }, 'image/png');
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

  const MAX_PIXELS = 3000;
  const maxDimension = Math.max(masonry.offsetWidth, masonry.offsetHeight);
  const scale = Math.min(2, MAX_PIXELS / maxDimension);

  const canvas = await html2canvas(masonry, {
    useCORS: true,
    scale
  });

  return new Promise(resolve => {
    canvas.toBlob(blob => {
      if (!blob) {
        console.error('toBlob returned null');
        alert('Share failed.');
        resolve();
        return;
      }

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
        }).catch(err => {
          console.warn('Share API failed:', err);
          const url = URL.createObjectURL(blob);
          window.open(url);
          setTimeout(() => URL.revokeObjectURL(url), 2000);
        });
      } else {
        alert('Sharing not supported on this device.');
      }

      resolve();
    });
  });
}
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
    canvas = await html2canvas(masonry, { useCORS: true, scale });
  } catch (err) {
    console.error('html2canvas failed:', err);
    alert('Could not create export image.');
    return;
  }

  // Utility to trigger download
  const triggerDownload = (href) => {
    const link = document.createElement('a');
    link.download = 'moodboard.png';
    link.href = href;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (canvas.toBlob) {
    canvas.toBlob(blob => {
      if (!blob) {
        console.error('toBlob returned null');
        alert('Export failed.');
        return;
      }
      const url = URL.createObjectURL(blob);
      triggerDownload(url);
      URL.revokeObjectURL(url);
    }, 'image/png');
  } else {
    // Fallback for browsers without toBlob
    const dataUrl = canvas.toDataURL('image/png');
    triggerDownload(dataUrl);
  }
}

export async function shareMoodboard(masonry) {
  const images = masonry.querySelectorAll('img');
  if (images.length === 0) {
    alert('There\'s nothing to share yet.');
    return;
  }

  masonry.querySelectorAll('.fade-in').forEach(el => el.classList.remove('fade-in'));

  const MAX_PIXELS = 3000;
  const maxDimension = Math.max(masonry.offsetWidth, masonry.offsetHeight);
  const scale = Math.min(2, MAX_PIXELS / maxDimension);

  const canvas = await html2canvas(masonry, { useCORS: true, scale });

  return new Promise(resolve => {
    if (canvas.toBlob) {
      canvas.toBlob(blob => {
        if (!blob) {
          console.error('toBlob returned null');
          alert('Share failed.');
          resolve();
          return;
        }

        const file = new File([blob], 'moodboard.png', { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
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
    } else {
      // Fallback if toBlob is missing
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'moodboard.png';
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      resolve();
    }
  });
}
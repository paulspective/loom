export async function exportMoodboard(masonry, showModal) {
  const images = masonry.querySelectorAll('img');
  if (!images.length) {
    showModal({
      title: 'Nothing to export.',
      message: 'Add some images to your weave first.',
      actions: [{ label: 'Got it', style: 'primary' }]
    });
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
    showModal({
      title: 'Export failed.',
      message: 'Something went wrong while creating your image.',
      actions: [{ label: 'Got it', style: 'primary' }]
    });
    return;
  }

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
        showModal({
          title: 'Export failed.',
          message: 'Could not generate the image blob.',
          actions: [{ label: 'Got it', style: 'primary' }]
        });
        return;
      }
      const url = URL.createObjectURL(blob);
      triggerDownload(url);
      URL.revokeObjectURL(url);
    }, 'image/png');
  } else {
    const dataUrl = canvas.toDataURL('image/png');
    triggerDownload(dataUrl);
  }
}

export async function shareMoodboard(masonry, showModal) {
  const images = masonry.querySelectorAll('img');
  if (!images.length) {
    showModal({
      title: 'Nothing to share.',
      message: 'Add some images to your weave first.',
      actions: [{ label: 'Got it', style: 'primary' }]
    });
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
          showModal({
            title: 'Share failed.',
            message: 'Could not generate the image.',
            actions: [{ label: 'Got it', style: 'primary' }]
          });
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
          showModal({
            title: 'Sharing not supported.',
            message: 'Your device or browser doesn\'t support the Share API.',
            actions: [{ label: 'Got it', style: 'primary' }]
          });
        }
        resolve();
      });
    } else {
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
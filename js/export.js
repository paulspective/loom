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
    const srcs = Array.from(images).map(i => i.src);
    showModal({
      title: 'Export failed.',
      message: 'Export failed. You can open or copy the image URLs to download them manually.',
      actions: [
        { label: 'Open images', style: 'primary', onClick: () => srcs.forEach(s => window.open(s)) },
        { label: 'Copy URLs', style: 'primary', onClick: async () => {
            try { await navigator.clipboard.writeText(srcs.join('\n'));
              showModal({ title: 'Copied', message: 'Image URLs copied to clipboard.', actions: [{ label: 'OK', style: 'primary' }] });
            } catch (e) { showModal({ title: 'Copy failed', message: 'Could not copy to clipboard.', actions: [{ label: 'OK', style: 'primary' }] }); }
          }
        },
        { label: 'Got it', style: 'ghost' }
      ]
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

  const triggerBlobDownload = () => {
    if (canvas.toBlob) {
      try {
        canvas.toBlob(blob => {
          if (!blob) {
            throw new Error('toBlob returned null');
          }
          const url = URL.createObjectURL(blob);
          triggerDownload(url);
          URL.revokeObjectURL(url);
        }, 'image/png');
        return true;
      } catch (err) {
        console.error('toBlob failed:', err);
        return false;
      }
    }
    return false;
  };

  try {
    const ok = triggerBlobDownload();
    if (!ok) {
      const dataUrl = canvas.toDataURL('image/png');
      triggerDownload(dataUrl);
    }
  } catch (err) {
    console.error('Export serialization failed:', err);
    const srcs = Array.from(images).map(i => i.src);
    showModal({
      title: 'Export failed.',
      message: 'Could not serialize the image. This usually happens when some images are blocked by CORS.',
      actions: [
        { label: 'Open images', style: 'primary', onClick: () => srcs.forEach(s => window.open(s)) },
        { label: 'Copy URLs', style: 'primary', onClick: async () => {
            try { await navigator.clipboard.writeText(srcs.join('\n'));
              showModal({ title: 'Copied', message: 'Image URLs copied to clipboard.', actions: [{ label: 'OK', style: 'primary' }] });
            } catch (e) { showModal({ title: 'Copy failed', message: 'Could not copy to clipboard.', actions: [{ label: 'OK', style: 'primary' }] }); }
          }
        },
        { label: 'Got it', style: 'ghost' }
      ]
    });
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
export function validateImage(url) {
  return new Promise(resolve => {
    const img = new Image();
    let timedOut = false;

    const timeoutId = setTimeout(() => {
      timedOut = true;
      resolve(false);
    }, 10000);

    img.onload = () => {
      if (timedOut) return;
      clearTimeout(timeoutId);
      resolve(true);
    };

    img.onerror = () => {
      if (timedOut) return;
      clearTimeout(timeoutId);
      resolve(false);
    };

    img.src = url;
  });
}
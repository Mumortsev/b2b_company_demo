// Native, keyboard-accessible image viewer; original image positions are unchanged.
document.addEventListener('click', (event) => {
  const link = event.target.closest('[data-toggle="gallery"] a');
  if (!link || link.hasAttribute('data-product-detail') || !/\.(png|jpe?g|webp)(\?|$)/i.test(link.getAttribute('href') || '')) return;
  event.preventDefault();
  const dialog = document.createElement('dialog'); dialog.className = 'potok-image-dialog'; dialog.setAttribute('aria-label', 'Просмотр иллюстрации');
  const close = document.createElement('button'); close.className = 'potok-dialog-close'; close.textContent = '×'; close.setAttribute('aria-label', 'Закрыть изображение');
  const image = document.createElement('img'); image.src = link.querySelector('img')?.currentSrc || link.href; image.alt = link.querySelector('img')?.alt || 'Иллюстрация';
  dialog.append(close, image); document.body.append(dialog);
  const finish = () => dialog.close(); close.addEventListener('click', finish);
  dialog.addEventListener('click', (event) => { if (event.target === dialog) finish(); });
  dialog.addEventListener('close', () => { dialog.remove(); link.focus({ preventScroll: true }); }, { once: true });
  dialog.showModal();
});

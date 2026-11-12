export function pastedImage(clipboard) {
  for (const item of Array.from(clipboard?.items || [])) {
    if (item.kind === 'file' && item.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file) return file;
    }
  }
  return Array.from(clipboard?.files || []).find(file => file.type.startsWith('image/')) || null;
}

async function imageBlob(src) {
  const response = await fetch(src);
  if (!response.ok) throw new Error('image download failed');
  return response.blob();
}

async function pngBlob(src) {
  const blob = await imageBlob(src);
  const bitmap = await createImageBitmap(blob);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('canvas unavailable');
    context.drawImage(bitmap, 0, 0);
    return await new Promise((resolve, reject) => canvas.toBlob(result => result ? resolve(result) : reject(new Error('image conversion failed')), 'image/png'));
  } finally { bitmap.close(); }
}

export async function copyImage(src) {
  if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') throw new Error('clipboard unavailable');
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob(src) })]);
}

export async function downloadImage(src) {
  const blob = await pngBlob(src);
  const extension = 'png';
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `roomvar-${new Date().toISOString().slice(0,19).replace(/[T:]/g,'-')}.${extension}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

const icons = {
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/>',
  redo: '<path d="M20 7v5h-5M4 17v-5h5M6 7a7 7 0 0 1 12-2l2 3M4 16l2 3a7 7 0 0 0 12-2"/>'
};

export function installImageActions(slot, img, { t, toast, redo }) {
  const actions = document.createElement('div');
  actions.className = 'img-actions';
  for (const action of ['copy', 'download', ...(redo ? ['redo'] : [])]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'icon-btn image-action';
    button.dataset.imageAction = action;
    button.title = t(action);
    button.setAttribute('aria-label', t(action));
    button.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${icons[action]}</svg>`;
    button.onclick = async () => {
      if (action === 'redo') { redo(); return; }
      button.disabled = true;
      try {
        if (action === 'copy') { await copyImage(img.src); toast(t('copied')); }
        else await downloadImage(img.src);
      } catch { toast(t(action === 'copy' ? 'copyFailed' : 'downloadFailed')); }
      finally { button.disabled = false; }
    };
    actions.appendChild(button);
  }
  slot.appendChild(actions);
}
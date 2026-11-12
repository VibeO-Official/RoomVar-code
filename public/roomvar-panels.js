export function fitPanelWidth(side, width, viewport, otherWidth) {
  const min = side === 'left' ? 56 : 210;
  const max = side === 'left' ? 180 : 520;
  return Math.max(min, Math.min(width, max, viewport - otherWidth - 360));
}

export function installPanels(doc = document) {
  const app = doc.getElementById('app');
  if (!app) return;
  const widths = { left: 0, right: 260 };
  const hidden = { left: false, right: false };
  const narrow = () => doc.defaultView.innerWidth <= 820;
  const apply = () => {
    app.style.setProperty('--history-width', `${widths.right}px`);
    app.classList.toggle('history-hidden', hidden.right);
    for (const side of ['left', 'right']) {
      const toggle = doc.getElementById(`${side}Toggle`);
      const isOpen = narrow() ? doc.body.classList.contains('sb-open') : !hidden.right;
      const labels = { ru: ['Открыть меню', 'Скрыть меню'], uz: ['Menyuni ochish', 'Menyuni yopish'], en: ['Show menu', 'Hide menu'] };
      const label = (labels[doc.documentElement.lang] || labels.ru)[Number(isOpen)];
      toggle?.setAttribute('aria-expanded', String(isOpen));
      toggle?.setAttribute('title', label);
      toggle?.setAttribute('aria-label', label);
      doc.getElementById(`${side}Resize`)?.setAttribute('aria-valuenow', String(widths[side]));
    }
  };
  for (const side of ['left', 'right']) {
    const toggle = doc.getElementById(`${side}Toggle`);
    const close = doc.getElementById(`${side}Close`);
    const handle = doc.getElementById(`${side}Resize`);
    const change = () => {
      if (narrow()) {
        const cls = 'sb-open';
        const next = !doc.body.classList.contains(cls);
        doc.body.classList.remove('tools-open', 'sb-open');
        doc.body.classList.toggle(cls, next);
      } else { hidden.right = !hidden.right; }
      apply();
    };
    toggle?.addEventListener('click', change);
    close?.addEventListener('click', () => {
      doc.body.classList.remove('tools-open', 'sb-open');
      if (!narrow()) hidden.right = true;
      apply();
    });
    handle?.addEventListener('pointerdown', (e) => {
      const start = e.clientX, initial = widths[side];
      handle.setPointerCapture(e.pointerId);
      app.classList.add('resizing');
      const move = (event) => {
        const other = side === 'left' ? 'right' : 'left';
        widths[side] = fitPanelWidth(side, initial + (event.clientX - start), doc.defaultView.innerWidth, hidden[other] ? 0 : widths[other]);
        apply();
      };
      const end = () => {
        handle.removeEventListener('pointermove', move);
        app.classList.remove('resizing');
      };
      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', end, { once: true });
      handle.addEventListener('pointercancel', end, { once: true });
    });
    handle?.addEventListener('keydown', (e) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      e.preventDefault();
      const delta = e.key === 'ArrowRight' ? 16 : -16;
      const other = side === 'left' ? 'right' : 'left';
      widths[side] = fitPanelWidth(side, widths[side] + delta, doc.defaultView.innerWidth, hidden[other] ? 0 : widths[other]);
      apply();
    });
  }
  doc.getElementById('scrim')?.addEventListener('click', () => { doc.body.classList.remove('tools-open', 'sb-open'); apply(); });
  doc.addEventListener('roomvar:preferences', apply);
  doc.defaultView.addEventListener('resize', apply);
  apply();
}

if (typeof document !== 'undefined') installPanels();
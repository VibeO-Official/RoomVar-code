export function pastedImage(clipboard: { items?: ArrayLike<{ kind: string; type: string; getAsFile?: () => File | null }>; files?: ArrayLike<File> } | null): File | null;
export function copyImage(src: string): Promise<void>;
export function downloadImage(src: string): Promise<void>;
export function installImageActions(slot: HTMLElement, img: HTMLImageElement, options: { t: (key: string) => string; toast: (message: string) => void; redo?: () => void }): void;
// Historical Pollinations URLs must not bypass the prompt-aware generator.
export function resolveImageRequest(url, prompt = '') {
  if (url?.startsWith('hf:')) return url;
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'image.pollinations.ai') {
      const encoded = parsed.pathname.replace(/^\/(?:p|prompt)\//, '');
      const original = prompt.trim() || decodeURIComponent(encoded);
      return original ? 'hf:' + original : url;
    }
  } catch { /* Data URLs and missing URLs are already handled by the caller. */ }
  return url;
}
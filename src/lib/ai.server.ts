// Free text/vision via Pollinations; image generation via Hugging Face Spaces.
// No API keys and no Lovable AI credits.
const TEXT_URL = "https://text.pollinations.ai/openai";
const IMAGE_SPACE = "https://black-forest-labs-flux-1-schnell.hf.space";

export class AiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

type Msg = { role: "user" | "assistant" | "system"; content: unknown };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function polliChat(messages: Msg[]): Promise<string> {
  let lastErr: unknown = null;
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(TEXT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "openai", messages }),
      });
      if (!res.ok) throw new Error(`pollinations ${res.status}`);
      const d = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const text = (d.choices?.[0]?.message?.content ?? "").trim();
      if (text) return text;
      throw new Error("pollinations empty");
    } catch (e) {
      lastErr = e;
      console.warn("pollinations", String(e));
      await sleep(1500 * (i + 1));
    }
  }
  throw new AiError("Бесплатный ИИ сейчас перегружен. Подождите минуту и попробуйте снова. " + String(lastErr ?? ""), 503);
}

/** Plain text answer. */
export async function askText(system: string, user: string): Promise<string> {
  return polliChat([
    { role: "system", content: system },
    { role: "user", content: user },
  ]);
}

/** Translate a user prompt to English so the free image model draws exactly what was asked. */
export async function toEnglish(prompt: string): Promise<string> {
  const original = prompt.trim();
  // FLUX does not reliably follow Cyrillic prompts. Never silently send an untranslated prompt.
  if (/^банан[.!?]*$/iu.test(original)) return "a banana";
  if (!/[а-яё]/iu.test(original)) return original;
  const translated = (await askText(
    "Translate this image prompt into English only. Preserve the exact subject, quantities, attributes and exclusions. Never add people, rooms or an interior-design theme unless requested. Return only the translation.",
    original,
  )).trim();
  if (!translated || /[а-яё]/iu.test(translated)) {
    throw new AiError("Не удалось перевести описание для генератора. Попробуйте ещё раз или напишите описание на английском.", 502);
  }
  return translated;
}

/** Structured JSON answer, optionally looking at one image (data URL). */
export async function askJson<T>(instructions: string, text: string, imageDataUrl?: string): Promise<T> {
  const content: unknown[] = [{ type: "text", text: instructions + "\n\nЗапрос пользователя: " + text + "\n\nОтветь строго одним JSON-объектом без markdown и пояснений." }];
  if (imageDataUrl) content.push({ type: "image_url", image_url: { url: imageDataUrl } });
  const raw = await polliChat([{ role: "user", content }]);
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) throw new AiError("ИИ вернул неверный ответ.", 502);
  try {
    return JSON.parse(m[0]) as T;
  } catch {
    throw new AiError("ИИ вернул неверный ответ.", 502);
  }
}

/** Wait for the completed Gradio result, never return an intermediate preview. */
export async function completedImageUrl(response: Response): Promise<string> {
  if (!response.body) throw new AiError("Hugging Face не прислал изображение.", 502);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let event = "";
  let result = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const lines = buffer.split("\n");
      buffer = done ? "" : (lines.pop() ?? "");
      for (const raw of lines) {
        const line = raw.trim();
        if (line.startsWith("event:")) event = line.slice(6).trim();
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (event === "error") {
          let message = "Hugging Face сейчас недоступен или бесплатный лимит исчерпан. Попробуйте позже.";
          try { const detail: unknown = JSON.parse(data); if (typeof detail === "string" && detail.trim()) message = detail; } catch { /* keep safe message */ }
          throw new AiError(message, 503);
        }
        if (event === "complete") {
          try {
            const payload = JSON.parse(data) as { url?: string }[];
            const url = new URL(payload[0]?.url ?? "");
            if (url.origin !== IMAGE_SPACE || !url.pathname.startsWith("/gradio_api/file=")) throw new Error("Invalid image URL");
            result = url.href;
          } catch { throw new AiError("Hugging Face вернул неверное изображение.", 502); }
        }
      }
      if (done) break;
    }
  } finally { reader.releaseLock(); }
  if (!result) throw new AiError("Генерация Hugging Face не завершилась. Попробуйте позже.", 502);
  return result;
}

/** FLUX.1-schnell: 4 inference steps, native 1024px image, no watermark. */
export async function generateImage(promptEn: string): Promise<Uint8Array<ArrayBuffer>> {
  const res = await fetch(`${IMAGE_SPACE}/gradio_api/call/infer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: [promptEn, Math.floor(Math.random() * 2147483647), true, 1024, 1024, 4] }),
  });
  if (!res.ok) throw new AiError(res.status === 429 ? "Бесплатный лимит Hugging Face исчерпан. Попробуйте позже." : "Не удалось связаться с Hugging Face. Попробуйте позже.", res.status);
  const job = await res.json() as { event_id?: string };
  if (!job.event_id || !/^[a-f0-9]+$/i.test(job.event_id)) throw new AiError("Hugging Face не запустил генерацию.", 502);
  const stream = await fetch(`${IMAGE_SPACE}/gradio_api/call/infer/${job.event_id}`);
  if (!stream.ok) throw new AiError("Очередь Hugging Face недоступна. Попробуйте позже.", stream.status);
  const url = await completedImageUrl(stream);
  const image = await fetch(url);
  if (!image.ok || !image.headers.get("Content-Type")?.startsWith("image/")) {
    throw new AiError("Не удалось загрузить готовую картинку Hugging Face.", 502);
  }
  const bytes = new Uint8Array(await image.arrayBuffer());
  if (bytes.length < 1000) throw new AiError("Hugging Face вернул пустую картинку.", 502);
  return bytes;
}

/** Search link on Uzum Market for a product query. */
export const uzumLink = (q: string) => `https://uzum.uz/ru/search?query=${encodeURIComponent(q)}`;

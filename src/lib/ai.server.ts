const LLM7_URL = "https://api.llm7.io/v1/chat/completions";
const IMAGE_SPACE = "https://black-forest-labs-flux-1-schnell.hf.space";

export class AiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

type Msg = { role: "user" | "assistant" | "system"; content: unknown };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function llm7Chat(messages: Msg[]): Promise<string> {
  let lastErr: unknown = null;
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(LLM7_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "default", messages }),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`llm7 ${res.status}: ${body.slice(0, 200)}`);
      }
      const d = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const text = (d.choices?.[0]?.message?.content ?? "").trim();
      if (text) return text;
      throw new Error("llm7 empty");
    } catch (e) {
      lastErr = e;
      console.warn("llm7", String(e));
      await sleep(1500 * (i + 1));
    }
  }
  throw new AiError("Бесплатный ИИ сейчас перегружен. Подождите минуту и попробуйте снова. " + String(lastErr ?? ""), 503);
}

/** Plain text answer. */
export async function askText(system: string, user: string): Promise<string> {
  return llm7Chat([
    { role: "system", content: system },
    { role: "user", content: user },
  ]);
}

/** Translate a user prompt to English so the free image model draws exactly what was asked. */
export async function toEnglish(prompt: string): Promise<string> {
  const original = prompt.trim();
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
  const content: unknown[] = [
    { type: "text", text: instructions + "\n\nЗапрос пользователя: " + text + "\n\nОтветь строго одним JSON-объектом без markdown и пояснений." },
  ];
  if (imageDataUrl) content.push({ type: "image_url", image_url: { url: imageDataUrl } });
  const raw = await llm7Chat([{ role: "user", content }]);
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) throw new AiError("ИИ вернул неверный ответ.", 502);
  try {
    return JSON.parse(m[0]) as T;
  } catch {
    throw new AiError("ИИ вернул неверный ответ.", 502);
  }
}

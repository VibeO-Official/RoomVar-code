import { createFileRoute } from "@tanstack/react-router";
import { authorizedApiRequest } from '@/lib/api-auth.server';
import { z } from 'zod';
import { detectReplyLanguage, languageInstruction } from '@/lib/reply-language';

// Free text AI without any API key: Pollinations (anonymous tier), called from
// the server so browser referrer/region limits don't apply. Falls back to a
// public Hugging Face Space when Pollinations is busy.
type Msg = { role: "user" | "assistant" | "system"; content: string };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function pollinations(messages: Msg[]): Promise<string> {
  const res = await fetch("https://text.pollinations.ai/openai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "openai", messages }),
  });
  if (!res.ok) throw new Error(`pollinations ${res.status}`);
  const d = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return (d.choices?.[0]?.message?.content ?? "").trim();
}

async function readGradio(base: string, endpoint: string, data: unknown[]): Promise<unknown[]> {
  const start = await fetch(`${base}/gradio_api/call/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });
  if (!start.ok) throw new Error(`hf start ${start.status}`);
  const { event_id } = (await start.json()) as { event_id: string };
  const res = await fetch(`${base}/gradio_api/call/${endpoint}/${event_id}`);
  if (!res.ok) throw new Error(`hf result ${res.status}`);
  const text = await res.text();
  let event = "", last: unknown[] | null = null;
  for (const line of text.split("\n")) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) {
      if (event === "error") throw new Error("hf error");
      try { const v = JSON.parse(line.slice(5).trim()); if (Array.isArray(v)) last = v; } catch { /* ignore */ }
    }
  }
  if (!last) throw new Error("hf empty");
  return last;
}

async function hfText(messages: Msg[]): Promise<string> {
  const system = messages.filter((m) => m.role === "system").map(m => m.content).join('\n');
  const rest = messages.filter((m) => m.role !== "system");
  const prompt = [system, ...rest.map((m) => (m.role === "user" ? "Пользователь: " : "Ассистент: ") + m.content)].join("\n\n") + "\n\nАссистент:";
  const out = await readGradio("https://huggingface-projects-llama-3-2-3b-instruct.hf.space", "generate", [prompt, 1024, 0.6, 0.9, 50, 1.2]);
  return String(out[0] ?? "").trim();
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!await authorizedApiRequest(request)) return Response.json({ error: 'Войдите в Roomvar.' }, { status: 401 });
        let body: { messages?: Msg[] };
        try { body = await request.json(); } catch { return Response.json({ error: "Неверный запрос." }, { status: 400 }); }
        const validation = z.object({ messages: z.array(z.object({ role: z.enum(['user','assistant','system']), content: z.string().max(6000) })).max(12) }).safeParse(body);
        if (!validation.success) return Response.json({ error: 'Неверный запрос.' }, { status: 400 });
        const messages = (body.messages ?? [])
          .filter((m) => m && typeof m.content === "string" && ["user", "assistant", "system"].includes(m.role))
          .slice(-12)
          .map((m) => ({ role: m.role, content: m.content.slice(0, 6000) }));
        if (!messages.some((m) => m.role === "user")) return Response.json({ error: "Пустое сообщение." }, { status: 400 });
        const latestUser = [...messages].reverse().find(m => m.role === 'user');
        const preferred = messages.find(m => m.role === 'system')?.content ?? '';
        const fallback = /Uzbek/.test(preferred) ? 'uz' : /fallback language is English/.test(preferred) ? 'en' : 'ru';
        const language = detectReplyLanguage(latestUser?.content ?? '', fallback);
        const system = messages.filter(m => m.role === 'system').map(m => m.content).join('\n');
        messages.splice(0, messages.length, { role: 'system', content: system + '\n' + languageInstruction(language) }, ...messages.filter(m => m.role !== 'system'));

        for (let i = 0; i < 3; i++) {
          try { const t = await pollinations(messages); if (t) return Response.json({ text: t }); }
          catch (e) { console.warn("pollinations", String(e)); }
          await sleep(2000 * (i + 1));
        }
        try { const t = await hfText(messages); if (t) return Response.json({ text: t }); }
        catch (e) { console.warn("hf text", String(e)); }
        return Response.json({ error: "Бесплатные ИИ сейчас перегружены. Подождите минуту и попробуйте снова." }, { status: 503 });
      },
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";
import { AiError, askJson, generateImage, uzumLink } from "@/lib/ai.server";
import { authorizedUserId } from '@/lib/api-auth.server';
import { detectReplyLanguage, languageInstruction } from '@/lib/reply-language';
import { z } from 'zod';

type Plan = {
  style: string;
  advice: string;
  items: { name: string; search_query: string; why: string }[];
  visual_prompt: string;
};

const INSTRUCTIONS = `Ты дизайнер интерьера Roomvar. Посмотри на фото комнаты пользователя и его просьбу.
Ответь строго JSON-объектом с полями:
- "style": стиль комнаты (современный, минимализм, лофт, скандинавский, классика и т.д.), цвета и материалы — коротко.
- "advice": 2–4 предложения на языке пользователя: какой стиль ты увидел и почему выбрал эту мебель.
- "items": 1–3 предмета мебели, которые просит пользователь (если просит стул — именно стул), подходящие под стиль комнаты.
  Каждый предмет: {"name": название на русском, "search_query": короткий поисковый запрос на русском для магазина Uzum Market (например "стул обеденный дерево серый"), "why": почему подходит, 1 предложение}.
- "visual_prompt": детальное описание НА АНГЛИЙСКОМ для генерации фото: эта же комната (опиши стены, пол, окна, свет, планировку как на фото),
  но с добавленной выбранной мебелью, реалистично, правильная перспектива и масштаб, фотореалистичное фото интерьера.`;

export const Route = createFileRoute("/api/room")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const userId = await authorizedUserId(request);
        if (!userId) return Response.json({ error: 'Войдите в Roomvar.' }, { status: 401 });
        let body: { image?: string | undefined; text?: string | undefined };
        try {
          body = z.object({ image: z.string().max(5000000).regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/), text: z.string().trim().max(1500).optional() }).parse(await request.json());
        } catch {
          return Response.json({ error: "Неверный запрос." }, { status: 400 });
        }
        const image = String(body.image ?? "");
        const text = String(body.text ?? "").trim().slice(0, 1500) || "Подбери подходящую мебель";
        if (!image.startsWith("data:image/")) return Response.json({ error: "Прикрепите фото комнаты." }, { status: 400 });
        const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
        const { data: quota, error: quotaError } = await supabaseAdmin.rpc('consume_image_generation', { _user_id: userId });
        if (quotaError) return Response.json({ error: 'Не удалось проверить лимит.' }, { status: 500 });
        const allowance = quota as { allowed: boolean; used: number; limit: number; reset_at: string };
        if (!allowance.allowed) return Response.json({ error: 'Лимит 5 изображений исчерпан. Он обновляется каждые 12 часов.', quota }, { status: 429 });
        try {
          const plan = await askJson<Plan>(INSTRUCTIONS + '\n' + languageInstruction(detectReplyLanguage(text)) + '\nThe language rule applies to style, advice, item names and why. Only visual_prompt must be in English and search_query in Russian.', text, image);
          const bin = await generateImage(plan.visual_prompt);
          let binStr = "";
          for (let i = 0; i < bin.length; i += 8192) binStr += String.fromCharCode(...bin.subarray(i, i + 8192));
          const b64 = btoa(binStr);
          return Response.json({
            quota,
            style: plan.style,
            advice: plan.advice,
            items: (plan.items ?? []).map((i) => ({ ...i, url: uzumLink(i.search_query) })),
            image: `data:image/webp;base64,${b64}`,
          });
        } catch (e) {
          await supabaseAdmin.rpc('refund_image_generation', { _user_id: userId });
          const s = e instanceof AiError ? e.status : 500;
          console.warn("room", String(e));
          return Response.json({ error: e instanceof Error ? e.message : "Ошибка" }, { status: s });
        }
      },
    },
  },
});

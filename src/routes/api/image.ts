import { createFileRoute } from "@tanstack/react-router";
import { AiError, generateImage, toEnglish } from "@/lib/ai.server";
import { authorizedUserId } from '@/lib/api-auth.server';
import { z } from 'zod';

export const LIMIT_MESSAGE = "Лимит 5 изображений исчерпан. Он обновляется каждые 12 часов.";

type Quota = { allowed: boolean; used: number; limit: number; reset_at: string };

// Free high-quality FLUX.1-dev via Hugging Face Spaces. Translate first.
export const Route = createFileRoute("/api/image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const userId = await authorizedUserId(request);
        if (!userId) return Response.json({ error: 'Войдите в Roomvar.' }, { status: 401 });
        let prompt = "";
        try {
          const body = z.object({ prompt: z.string().trim().min(1).max(1500) }).parse(await request.json());
          prompt = body.prompt;
        } catch {
          /* empty */
        }
        if (!prompt) return Response.json({ error: "Пустое описание." }, { status: 400 });
        const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
        const { data, error: qErr } = await supabaseAdmin.rpc('consume_image_generation', { _user_id: userId });
        if (qErr) return Response.json({ error: "Не удалось проверить лимит." }, { status: 500 });
        const quota = data as unknown as Quota;
        if (!quota.allowed) {
          return Response.json({ error: LIMIT_MESSAGE, limitReached: true, quota }, { status: 429 });
        }
        try {
          const en = await toEnglish(prompt);
          const bin = await generateImage(en);
          return new Response(bin, { headers: {
            "Content-Type": "image/webp", "Cache-Control": "no-store",
            "X-Quota-Used": String(quota.used), "X-Quota-Limit": String(quota.limit), "X-Quota-Reset": String(quota.reset_at),
          } });
        } catch (e) {
          await supabaseAdmin.rpc('refund_image_generation', { _user_id: userId });
          const s = e instanceof AiError ? e.status : 500;
          return Response.json({ error: e instanceof Error ? e.message : "Ошибка" }, { status: s });
        }
      },
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type SyntheticEvent } from "react";
import { createPortal } from 'react-dom';
import { QuotaWater } from '@/components/QuotaWater';
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Roomvar — ваш помощник по дизайну интерьера" },
    { name: "description", content: "Roomvar: идеи для интерьера, подбор мебели, визуализация комнаты и личная история чатов." },
    { property: "og:title", content: "Roomvar — дизайн вашего пространства" },
    { property: "og:description", content: "Обсуждайте идеи, создавайте изображения и сохраняйте свои проекты в Roomvar." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

function Index() {
  const [ready, setReady] = useState(false);
  const [waterHost, setWaterHost] = useState<HTMLElement | null>(null);
  const [quota, setQuota] = useState({ used: 0, limit: 5 });
  const [motion, setMotion] = useState(true);
  const [colors, setColors] = useState<{ water: string; highlight: string } | null>(null);
  useEffect(() => {
    const roomvarGoogleSignIn = async () => {
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      return { error: result.error ? String(result.error.message || result.error) : null };
    };
    Object.assign(window, { roomvarClient: supabase, roomvarGoogleSignIn,
      roomvarSetQuota: (value: { used: number; limit: number }) => setQuota(value),
      roomvarSetMotion: (value: boolean) => setMotion(value && !window.matchMedia('(prefers-reduced-motion: reduce)').matches),
    });
    setReady(true);
    return () => { for (const key of ['roomvarClient', 'roomvarGoogleSignIn', 'roomvarSetQuota', 'roomvarSetMotion']) Reflect.deleteProperty(window, key); };
  }, []);
  function onFrameLoad(event: SyntheticEvent<HTMLIFrameElement>) {
    const doc = event.currentTarget.contentDocument;
    if (!doc) return;
    const host = doc.getElementById('quotaWater');
    setWaterHost(host);
    const style = doc.defaultView?.getComputedStyle(doc.documentElement);
    const canvas = doc.createElement('canvas'); canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (!style || !ctx) return;
    const resolve = (token: string) => {
      ctx.fillStyle = style.getPropertyValue(token).trim(); ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      return `rgb(${r}, ${g}, ${b})`;
    };
    setColors({ water: resolve('--accent'), highlight: resolve('--accent-2') });
  }
  return (
    <>{ready ? <iframe onLoad={onFrameLoad} src="/roomvar.html" title="Roomvar" className="fixed inset-0 h-full w-full border-0 bg-background" allow="microphone; clipboard-read; clipboard-write" /> : <div className="min-h-screen bg-background" />}
    {waterHost && colors && createPortal(<QuotaWater fill={quota.used / quota.limit} motion={motion} {...colors} />, waterHost)}</>
  );
}

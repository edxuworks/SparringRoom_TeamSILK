"use client";

/**
 * components/VoiceVisualizer.tsx — live voice-activity line.
 *
 * An oscillating waveform whose amplitude tracks the live mic input volume (so
 * the user can SEE their voice is being heard), and the AI output volume while
 * the adversary speaks (rendered in amber). Driven by the ElevenLabs SDK's
 * getInputVolume() / getOutputVolume(), read on each animation frame.
 * Flat line when idle.
 */

import { useEffect, useRef } from "react";
import type { useConversation } from "@elevenlabs/react";

type Conversation = ReturnType<typeof useConversation>;

export function VoiceVisualizer({
  conversation,
  active,
}: {
  conversation: Conversation;
  active: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  // Keep latest props in refs so the rAF loop isn't re-created each render.
  const activeRef = useRef(active);
  const convRef = useRef(conversation);
  useEffect(() => {
    activeRef.current = active;
    convRef.current = conversation;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let phase = 0;
    let smoothed = 0;
    // Read theme tokens so the line stays visible in both Cloud (light) and
    // Local (dark) themes. Re-read occasionally so a theme flip is picked up.
    const root = document.documentElement;
    let youColor = "#111827";
    let aiColor = "#c7a45a";
    const refreshColors = () => {
      const s = getComputedStyle(root);
      youColor = s.getPropertyValue("--color-text-primary").trim() || youColor;
      aiColor = s.getPropertyValue("--color-gold").trim() || aiColor;
    };
    refreshColors();
    let frame = 0;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      if (frame++ % 30 === 0) refreshColors();

      const conv = convRef.current;
      let inV = 0;
      let outV = 0;
      if (activeRef.current) {
        try {
          inV = conv.getInputVolume?.() ?? 0;
          outV = conv.getOutputVolume?.() ?? 0;
        } catch {
          /* no active session yet */
        }
      }
      const speaking = activeRef.current && conv.isSpeaking;
      const target = Math.max(inV, outV);
      smoothed += (target - smoothed) * 0.25; // ease for a fluid line

      // small idle "breathing" floor so the line is alive while connected
      const floor = activeRef.current ? 0.05 : 0;
      const amp = (h / 2 - 6) * Math.min(1, smoothed * 3 + floor);

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = speaking ? aiColor : youColor; // accent=AI, text=you
      ctx.beginPath();
      for (let x = 0; x <= w; x++) {
        const t = x / w;
        // taper the ends so it reads as a centered waveform
        const envelope = Math.sin(t * Math.PI);
        const y = h / 2 + Math.sin(t * Math.PI * 6 + phase) * amp * envelope;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      phase += 0.12 + smoothed * 0.6;
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={96}
      className="h-24 w-full"
      aria-hidden
    />
  );
}

"use client";

/**
 * components/MicOrb.tsx — the voice-round centerpiece (ref_03 A4).
 * A mic in a circle whose ring pulses with live volume: ink while you speak,
 * gold while the Technician speaks, muted when idle. Driven by the ElevenLabs
 * SDK volume getters via requestAnimationFrame (no re-renders).
 */

import { useEffect, useRef } from "react";
import { Mic } from "lucide-react";
import type { useConversation } from "@elevenlabs/react";

type Conversation = ReturnType<typeof useConversation>;

export function MicOrb({
  conversation,
  active,
  speaking,
}: {
  conversation: Conversation;
  active: boolean;
  speaking: boolean;
}) {
  const ringRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  const convRef = useRef(conversation);
  useEffect(() => {
    activeRef.current = active;
    convRef.current = conversation;
  });

  useEffect(() => {
    let raf = 0;
    let smoothed = 0;
    const tick = () => {
      let vol = 0;
      if (activeRef.current) {
        try {
          vol = Math.max(
            convRef.current.getInputVolume?.() ?? 0,
            convRef.current.getOutputVolume?.() ?? 0,
          );
        } catch {
          /* no session yet */
        }
      }
      smoothed += (vol - smoothed) * 0.25;
      const scale = 1 + Math.min(0.4, smoothed * 1.6);
      if (ringRef.current) ringRef.current.style.transform = `scale(${scale})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="relative flex h-32 w-32 items-center justify-center">
      <div
        ref={ringRef}
        className={
          "absolute inset-0 rounded-full transition-colors duration-300 " +
          (speaking ? "bg-gold/15" : active ? "bg-ink/[0.06]" : "bg-transparent")
        }
      />
      <div
        className={
          "relative flex h-20 w-20 items-center justify-center rounded-full border-2 transition-colors duration-300 " +
          (speaking
            ? "border-gold text-gold"
            : active
              ? "border-ink text-ink"
              : "border-[--color-border-strong] text-[--color-text-muted]")
        }
      >
        <Mic className="h-8 w-8" strokeWidth={1.5} />
      </div>
    </div>
  );
}

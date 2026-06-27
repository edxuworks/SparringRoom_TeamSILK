/**
 * app/api/elevenlabs/signed-url/route.ts — mints a signed WebSocket URL so the
 * ElevenLabs API key never reaches the browser.
 *
 * The client calls this, then passes the returned signedUrl to
 * useConversation().startSession({ signedUrl }).
 */

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID;

  if (!apiKey || !agentId) {
    return NextResponse.json(
      { error: "ELEVENLABS_API_KEY and ELEVENLABS_AGENT_ID must be set" },
      { status: 500 },
    );
  }

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${encodeURIComponent(agentId)}`,
      { headers: { "xi-api-key": apiKey }, cache: "no-store" },
    );
    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json(
        { error: "Failed to get signed URL", detail },
        { status: res.status },
      );
    }
    const data = (await res.json()) as { signed_url?: string };
    if (!data.signed_url) {
      return NextResponse.json(
        { error: "No signed_url in response" },
        { status: 502 },
      );
    }
    return NextResponse.json({ signedUrl: data.signed_url });
  } catch (err) {
    return NextResponse.json(
      { error: "Request failed", detail: String(err) },
      { status: 500 },
    );
  }
}

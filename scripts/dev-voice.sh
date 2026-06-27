#!/usr/bin/env bash
#
# scripts/dev-voice.sh — one command to run the full voice loop locally.
#
# Boots the Next.js dev server, opens a public cloudflared tunnel, points the
# ElevenLabs agent's Custom LLM at the tunnel (via the ElevenLabs API), and
# opens the app in your browser. Ctrl+C tears it all down.
#
# Requires: .env.local with ELEVENLABS_API_KEY + ELEVENLABS_AGENT_ID, and
#           cloudflared (brew install cloudflared).
#
set -euo pipefail
cd "$(dirname "$0")/.."

# --- load .env.local ---
EL_KEY=$(awk -F= '/^ELEVENLABS_API_KEY=/{print $2}' .env.local)
AGENT=$(awk -F= '/^ELEVENLABS_AGENT_ID=/{print $2}' .env.local)
SECRET_NAME="SPARRING_LLM_KEY"
PORT=3000

[ -n "$EL_KEY" ] && [ -n "$AGENT" ] || { echo "ELEVENLABS_API_KEY / ELEVENLABS_AGENT_ID missing in .env.local"; exit 1; }
command -v cloudflared >/dev/null || { echo "cloudflared not found — run: brew install cloudflared"; exit 1; }

LOG_DIR=$(mktemp -d)
DEV_PID=""; TUN_PID=""
cleanup() {
  echo; echo "shutting down..."
  [ -n "$TUN_PID" ] && kill "$TUN_PID" 2>/dev/null || true
  [ -n "$DEV_PID" ] && kill "$DEV_PID" 2>/dev/null || true
  lsof -ti :$PORT 2>/dev/null | xargs kill -9 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# --- 1. dev server ---
if curl -s -o /dev/null -w '%{http_code}' "http://localhost:$PORT/" 2>/dev/null | grep -q 200; then
  echo "dev server already running on :$PORT"
else
  echo "starting dev server..."
  npm run dev > "$LOG_DIR/dev.log" 2>&1 &
  DEV_PID=$!
  for _ in $(seq 1 40); do sleep 1; curl -s -o /dev/null -w '%{http_code}' "http://localhost:$PORT/" 2>/dev/null | grep -q 200 && break; done
fi

# --- 2. tunnel ---
echo "opening public tunnel..."
cloudflared tunnel --url "http://localhost:$PORT" > "$LOG_DIR/tunnel.log" 2>&1 &
TUN_PID=$!
TUNNEL_URL=""
for _ in $(seq 1 40); do
  sleep 1
  TUNNEL_URL=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$LOG_DIR/tunnel.log" | head -1 || true)
  [ -n "$TUNNEL_URL" ] && break
done
[ -n "$TUNNEL_URL" ] || { echo "tunnel failed to start; see $LOG_DIR/tunnel.log"; exit 1; }
echo "tunnel: $TUNNEL_URL"

# --- 3. ensure custom-LLM secret exists (reuse by name, else create) ---
SECRET_ID=$(curl -s "https://api.elevenlabs.io/v1/convai/secrets" -H "xi-api-key: $EL_KEY" \
  | python3 -c "import sys,json;print(next((s['secret_id'] for s in json.load(sys.stdin).get('secrets',[]) if s.get('name')=='$SECRET_NAME'),''))")
if [ -z "$SECRET_ID" ]; then
  SECRET_ID=$(curl -s -X POST "https://api.elevenlabs.io/v1/convai/secrets" -H "xi-api-key: $EL_KEY" -H "Content-Type: application/json" \
    -d "{\"type\":\"new\",\"name\":\"$SECRET_NAME\",\"value\":\"not-used-by-shim\"}" \
    | python3 -c "import sys,json;print(json.load(sys.stdin).get('secret_id',''))")
fi
[ -n "$SECRET_ID" ] || { echo "could not resolve/create custom-LLM secret"; exit 1; }

# --- 4. point the agent's custom LLM at the tunnel ---
echo "configuring agent $AGENT ..."
curl -s -X PATCH "https://api.elevenlabs.io/v1/convai/agents/$AGENT" -H "xi-api-key: $EL_KEY" -H "Content-Type: application/json" -d "{
  \"conversation_config\": { \"agent\": { \"prompt\": {
    \"llm\": \"custom-llm\",
    \"custom_llm\": { \"url\": \"$TUNNEL_URL/api/llm/v1\", \"model_id\": \"sparring-adversary\", \"api_key\": {\"secret_id\": \"$SECRET_ID\"} }
  }}}
}" | python3 -c "import sys,json;d=json.load(sys.stdin);print('agent llm ->', d.get('conversation_config',{}).get('agent',{}).get('prompt',{}).get('llm','?'))"

# --- 5. open the app ---
echo
echo "READY — opening http://localhost:$PORT  (Voice mode -> Start Round)"
( command -v open >/dev/null && open "http://localhost:$PORT" ) || true
echo "Press Ctrl+C to stop the server and tunnel."
wait

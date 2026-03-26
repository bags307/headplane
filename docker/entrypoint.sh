#!/bin/bash
set -e

# Config paths from env vars with defaults
HEADSCALE_CONFIG="${HEADSCALE_CONFIG:-/etc/headscale/config.yaml}"
HEADPLANE_CONFIG="${HEADPLANE_CONFIG:-/etc/headplane/config.yaml}"

API_KEY_FILE="/var/lib/headscale/.api-key"

HEADSCALE_PID=""
HEADPLANE_PID=""

cleanup() {
    echo "[entrypoint] Received shutdown signal, stopping processes..."

    if [ -n "$HEADPLANE_PID" ] && kill -0 "$HEADPLANE_PID" 2>/dev/null; then
        echo "[entrypoint] Stopping headplane (PID $HEADPLANE_PID)..."
        kill -TERM "$HEADPLANE_PID" 2>/dev/null || true
        wait "$HEADPLANE_PID" 2>/dev/null || true
    fi

    if [ -n "$HEADSCALE_PID" ] && kill -0 "$HEADSCALE_PID" 2>/dev/null; then
        echo "[entrypoint] Stopping headscale (PID $HEADSCALE_PID)..."
        kill -TERM "$HEADSCALE_PID" 2>/dev/null || true
        wait "$HEADSCALE_PID" 2>/dev/null || true
    fi

    echo "[entrypoint] All processes stopped."
    exit 0
}

trap cleanup SIGTERM SIGINT

# Start headscale in the background
echo "[entrypoint] Starting headscale..."
/usr/local/bin/headscale serve --config "$HEADSCALE_CONFIG" &
HEADSCALE_PID=$!
echo "[entrypoint] headscale started (PID $HEADSCALE_PID)"

# Wait up to 30 seconds for headscale health
echo "[entrypoint] Waiting for headscale to become healthy..."
TIMEOUT=30
ELAPSED=0
until curl -sf http://127.0.0.1:8080/health > /dev/null 2>&1; do
    if [ "$ELAPSED" -ge "$TIMEOUT" ]; then
        echo "[entrypoint] ERROR: headscale did not become healthy within ${TIMEOUT}s"
        cleanup
        exit 1
    fi
    sleep 1
    ELAPSED=$((ELAPSED + 1))
done
echo "[entrypoint] headscale is healthy (after ${ELAPSED}s)"

# Generate API key if it doesn't already exist
if [ ! -f "$API_KEY_FILE" ]; then
    echo "[entrypoint] No API key found at $API_KEY_FILE, generating one..."
    mkdir -p "$(dirname "$API_KEY_FILE")"
    API_KEY=$(/usr/local/bin/headscale apikeys create --expiration 365d --output json 2>/dev/null | tr -d '"' || \
              /usr/local/bin/headscale apikeys create --expiration 365d 2>/dev/null | tr -d '[:space:]')
    if [ -z "$API_KEY" ]; then
        echo "[entrypoint] ERROR: Failed to generate headscale API key"
        cleanup
        exit 1
    fi
    echo "$API_KEY" > "$API_KEY_FILE"
    chmod 600 "$API_KEY_FILE"
    echo "[entrypoint] API key saved to $API_KEY_FILE"
else
    echo "[entrypoint] Loading existing API key from $API_KEY_FILE"
    API_KEY=$(cat "$API_KEY_FILE")
fi

export HEADSCALE_API_KEY="$API_KEY"
echo "[entrypoint] HEADSCALE_API_KEY exported"

# Start headplane in the background
echo "[entrypoint] Starting headplane..."
node /app/build/server/index.js &
HEADPLANE_PID=$!
echo "[entrypoint] headplane started (PID $HEADPLANE_PID)"

# Wait for either process to exit
echo "[entrypoint] Both processes running. Waiting for either to exit..."
wait -n "$HEADSCALE_PID" "$HEADPLANE_PID" 2>/dev/null || wait "$HEADSCALE_PID" "$HEADPLANE_PID"
EXIT_CODE=$?

echo "[entrypoint] A process exited (exit code: $EXIT_CODE), initiating shutdown..."
cleanup
exit "$EXIT_CODE"

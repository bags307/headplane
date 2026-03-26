#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HEADPLANE_DIR="$(dirname "$SCRIPT_DIR")"
HEADSCALE_DIR="${HEADSCALE_DIR:-$HOME/projects/headscale}"
IMAGE_TAG="${IMAGE_TAG:-remodlai/lexscale:latest}"
PLATFORM="${PLATFORM:-linux/amd64}"
PUSH_FLAG="--push"

# Check for --load flag
for arg in "$@"; do
    if [ "$arg" = "--load" ]; then
        PUSH_FLAG="--load"
    fi
done

echo "=== Building combined headscale+headplane image ==="
echo "  Headplane: $HEADPLANE_DIR"
echo "  Headscale: $HEADSCALE_DIR"
echo "  Image:     $IMAGE_TAG"
echo "  Platform:  $PLATFORM"
echo "  Mode:      ${PUSH_FLAG#--}"

# Verify source dirs exist
[ -d "$HEADPLANE_DIR" ] || { echo "ERROR: Headplane dir not found: $HEADPLANE_DIR"; exit 1; }
[ -d "$HEADSCALE_DIR" ] || { echo "ERROR: Headscale dir not found: $HEADSCALE_DIR"; exit 1; }

# Create temp build context
BUILD_CTX=$(mktemp -d)
trap "rm -rf $BUILD_CTX" EXIT

echo "  Build ctx: $BUILD_CTX"

# Copy headplane (excluding heavy/unnecessary dirs)
echo "[1/3] Copying headplane source..."
rsync -a \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='headplane-data' \
    --exclude='.next' \
    "$HEADPLANE_DIR/" "$BUILD_CTX/"

# Copy headscale source into subdirectory
echo "[2/3] Copying headscale source..."
rsync -a \
    --exclude='.git' \
    "$HEADSCALE_DIR/" "$BUILD_CTX/headscale/"

# Build
echo "[3/3] Building Docker image..."
docker buildx build \
    --platform "$PLATFORM" \
    --file "$BUILD_CTX/Dockerfile.combined" \
    --tag "$IMAGE_TAG" \
    $PUSH_FLAG \
    "$BUILD_CTX"

echo ""
echo "=== Done: $IMAGE_TAG ==="

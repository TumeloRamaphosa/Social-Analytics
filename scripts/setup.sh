#!/bin/bash

# Social Analytics Platform - Quick Setup Script
# Run this on a fresh machine to set up everything

set -e

echo "🚀 Social Analytics Platform Setup"
echo "===================================="
echo ""

# Check if we're on macOS or Linux
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
    echo "Detected: macOS"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
    echo "Detected: Linux"
else
    echo "❌ Unsupported OS: $OSTYPE"
    exit 1
fi

# Check for required tools
echo ""
echo "📋 Checking prerequisites..."

command -v node >/dev/null 2>&1 || { echo "❌ Node.js not found. Install from https://nodejs.org"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "Installing pnpm..."; npm install -g pnpm; }
command -v git >/dev/null 2>&1 || { echo "❌ Git not found"; exit 1; }

echo "✅ Prerequisites OK"
echo ""

# Ask for platform location
read -p "Where should we install? (default: ~/Social-Analytics): " PLATFORM_DIR
PLATFORM_DIR=${PLATFORM_DIR:-$HOME/Social-Analytics}

echo ""
echo "📦 Cloning platform..."
git clone https://github.com/TumeloRamaphosa/Social-Analytics.git "$PLATFORM_DIR" || {
    echo "❌ Failed to clone. Create repo first or use existing."
    exit 1
}

cd "$PLATFORM_DIR"

echo ""
echo "📥 Installing dependencies..."
pnpm install

echo ""
echo "🧠 Setting up Ollama (local AI)..."
if command -v ollama >/dev/null 2>&1; then
    echo "✅ Ollama already installed"
    echo "   Pulling default models..."
    ollama pull llama3.2:3b 2>/dev/null || true
    ollama pull gemma2:2b 2>/dev/null || true
else
    echo "   To install Ollama: https://ollama.com/download"
    echo "   Then run: ollama pull llama3.2:3b"
fi

echo ""
echo "🖼️ Setting up ComfyUI (image generation)..."
if [ -d "/Applications/ComfyUI" ] || [ -d "$HOME/ComfyUI" ]; then
    echo "✅ ComfyUI found"
else
    echo "   To install ComfyUI:"
    echo "   1. Download: https://www.comfyui.com/download"
    echo "   2. Or: git clone https://github.com/comfyanonymous/ComfyUI"
fi

echo ""
echo "☁️ Setting up Google Drive..."
if [ -d "$HOME/Library/CloudStorage/GoogleDrive-"* ] || [ -d "/Users/"$USER"/Library/CloudStorage/GoogleDrive-"* ]; then
    echo "✅ Google Drive folder found"
    echo "   Output folder: ~/Library/CloudStorage/GoogleDrive-<your-email>/"
else
    echo "   To install Google Drive: https://drive.google.com/download/mac"
fi

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "To start the platform:"
echo "  cd $PLATFORM_DIR"
echo "  pnpm dev"
echo ""
echo "Then open: http://localhost:3456"
echo ""
echo "For ComfyUI (image generation):"
echo "  1. Download ComfyUI from https://www.comfyui.com/download"
echo "  2. Open it and it runs at http://localhost:8188"
echo "  3. Download FLUX models via ComfyUI Manager"
echo ""
echo "For Google Drive sync:"
echo "  1. Download Google Drive Desktop: https://drive.google.com/download/mac"
echo "  2. Sign in and set output folder to Drive folder"
echo ""
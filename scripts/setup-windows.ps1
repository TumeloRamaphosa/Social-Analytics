#!/bin/bash

# Social Analytics - Windows PC Setup (Content Generation Machine)
# Run this on your Windows PC (192.168.1.114) with dual GTX 1080s

set -e

echo "🎮 Windows PC Content Generation Setup"
echo "========================================"
echo ""

echo "This script sets up this machine as a dedicated content generation server."
echo "It will run:"
echo "  - Ollama (text AI)"
echo "  - ComfyUI (image/video AI)"
echo "  - Platform integration via network"
echo ""

# Check if we're on Windows (Git Bash, WSL, or native)
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]] || grep -qiE "microsoft|WSL" /proc/version 2>/dev/null; then
    echo "✅ Windows environment detected"
else
    echo "⚠️  Not on Windows - some commands may differ"
fi

echo ""
echo "📋 Checking GPU..."
if command -v nvidia-smi >/dev/null 2>&1; then
    nvidia-smi --query-gpu=name,memory.total --format=csv,noheader
    echo "✅ NVIDIA GPU detected - can run FLUX and ComfyUI!"
else
    echo "⚠️  No NVIDIA GPU detected"
fi

echo ""
echo "🧠 Setting up Ollama..."
if command -v ollama >/dev/null 2>&1; then
    echo "✅ Ollama installed"
    ollama pull llama3.2:3b 2>/dev/null || echo "   (Run 'ollama pull llama3.2:3b' to download model)"
    ollama pull glm-4.7-flash 2>/dev/null || echo "   (Run 'ollama pull glm-4.7-flash' for best results)"
else
    echo "📥 Installing Ollama for Windows..."
    echo "   Download from: https://ollama.com/download/windows"
    echo "   Or run in PowerShell:"
    echo "   winget install Ollama.Ollama"
fi

echo ""
echo "🖼️ Setting up ComfyUI (FLUX image generation)..."
echo "   ComfyUI is needed for FLUX image generation"
echo ""
echo "   Option 1 - ComfyUI Desktop (recommended):"
echo "   https://www.comfyui.com/download"
echo ""
echo "   Option 2 - Portable (command line):"
echo "   git clone https://github.com/comfyanonymous/ComfyUI"
echo ""
echo "   Once installed, download FLUX models:"
echo "   - FLUX.1 Schnell (fast, 12GB)"
echo "   - FLUX.1 Dev (quality, 24GB)"
echo "   - FLUX.2 Klein 4B (efficient, 8GB) - works on 8GB VRAM!"
echo ""

echo "☁️ Setting up Google Drive..."
echo "   Download: https://drive.google.com/download/windows"
echo "   Install and sign in with your Google account"
echo "   This syncs all generated content to cloud automatically"
echo ""

echo "🔗 Network Setup"
echo "==============="
echo "This machine will be accessible from other devices at:"
echo "   - Platform: http://192.168.1.114:3456 (if running platform)"
echo "   - Ollama:  http://192.168.1.114:11434"
echo "   - ComfyUI: http://192.168.1.114:8188"
echo ""

echo "📁 Output Folders"
echo "================"
echo "Set these as output folders in ComfyUI/Platform:"
echo "   C:\\Users\\YourName\\Google Drive\\Studex Social\\Generated Images"
echo "   C:\\Users\\YourName\\Google Drive\\Studex Social\\Generated Videos"
echo ""

echo "🎉 Setup Guide Complete!"
echo ""
echo "Quick Start:"
echo "1. Install Ollama: winget install Ollama.Ollama"
echo "2. Install ComfyUI: https://www.comfyui.com/download"
echo "3. Install Google Drive: https://drive.google.com/download/windows"
echo "4. Run: ollama serve"
echo "5. Run ComfyUI"
echo ""
echo "Then access from your Mac Mini at:"
echo "   - Ollama API: http://192.168.1.114:11434"
echo "   - ComfyUI: http://192.168.1.114:8188"
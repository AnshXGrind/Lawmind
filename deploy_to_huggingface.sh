#!/bin/bash
# deploy_to_huggingface.sh
# Deploys LawMind backend to a Hugging Face Space
# Usage: ./deploy_to_huggingface.sh [your-hf-username] [space-name]

set -e

USERNAME="${1:-$(huggingface-cli whoami 2>/dev/null | head -1)}"
SPACE_NAME="${2:-lawmind-legal-ai}"

if [ -z "$USERNAME" ]; then
  echo "❌ Could not detect HF username. Pass it as first argument."
  echo "   Usage: ./deploy_to_huggingface.sh YOUR_USERNAME lawmind-legal-ai"
  exit 1
fi

echo "🚀 Deploying LawMind to Hugging Face"
echo "   Space: ${USERNAME}/${SPACE_NAME}"
echo "==========================================="

# Install huggingface-hub if needed
if ! python -c "import huggingface_hub" 2>/dev/null; then
  echo "📦 Installing huggingface-hub..."
  pip install huggingface-hub --quiet
fi

# Login to Hugging Face
echo "🔑 Authenticating with Hugging Face..."
huggingface-cli login

# Create space if needed
echo "📁 Ensuring Space exists..."
python - <<PYEOF
from huggingface_hub import create_repo
import sys

try:
    create_repo(
        repo_id="${USERNAME}/${SPACE_NAME}",
        repo_type="space",
        space_sdk="docker",
        exist_ok=True,
        private=False,
    )
    print("  ✅ Space ready: ${USERNAME}/${SPACE_NAME}")
except Exception as e:
    print(f"  ⚠️  {e}")
    sys.exit(0)
PYEOF

# Create a temp directory with the files HF Space needs
echo "📦 Preparing files for upload..."
TMP_DIR=$(mktemp -d)
trap "rm -rf $TMP_DIR" EXIT

cp Dockerfile "$TMP_DIR/"
cp README.md "$TMP_DIR/"
cp app.py "$TMP_DIR/"

# Copy backend files (flatten backend/ → root for the Space)
rsync -av --exclude="__pycache__" \
         --exclude="*.pyc" \
         --exclude=".env" \
         --exclude="*.db" \
         --exclude="uploads/" \
         --exclude="exports/" \
         --exclude="data/" \
         backend/ "$TMP_DIR/"

echo ""
echo "📤 Uploading to Hugging Face..."
python - <<PYEOF
from huggingface_hub import HfApi
import os, pathlib

api = HfApi()
tmp = os.environ.get("TMP_DIR", "/tmp")

# Upload folder to space
api.upload_folder(
    folder_path="${TMP_DIR}",
    repo_id="${USERNAME}/${SPACE_NAME}",
    repo_type="space",
    commit_message="Deploy from local machine",
)
print("  ✅ Upload complete!")
PYEOF

echo ""
echo "==========================================="
echo "✅ Deployment complete!"
echo "   Space URL: https://huggingface.co/spaces/${USERNAME}/${SPACE_NAME}"
echo "   API URL:   https://${USERNAME}-${SPACE_NAME}.hf.space"
echo "   Swagger:   https://${USERNAME}-${SPACE_NAME}.hf.space/docs"
echo ""
echo "⚙️  NEXT STEPS:"
echo "   1. Go to: https://huggingface.co/spaces/${USERNAME}/${SPACE_NAME}/settings"
echo "   2. Add Secrets: GEMINI_API_KEY, SECRET_KEY, CORS_ORIGINS"
echo "   3. Wait ~2 min for the Docker build to complete"
echo "   4. Test: python test_huggingface.py https://${USERNAME}-${SPACE_NAME}.hf.space"

#!/bin/bash
# ==============================================================================
# Helper Script to Push 3D Assets for Phantom to GitHub
# ==============================================================================

set -e

REPO_NAME="3D-assets-for-Phantom"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "========================================================"
echo "  Pushing $REPO_NAME to GitHub"
echo "========================================================"

# Check if origin is already set
CURRENT_REMOTE=$(git remote get-url origin 2>/dev/null || echo "")

if [ -z "$CURRENT_REMOTE" ]; then
    echo ""
    echo "Please enter your GitHub username (e.g., devanshsingh or dishaguglani09):"
    read -r GITHUB_USER
    if [ -z "$GITHUB_USER" ]; then
        echo "Error: GitHub username cannot be empty."
        exit 1
    fi
    REMOTE_URL="https://github.com/$GITHUB_USER/$REPO_NAME.git"
    echo "Adding remote origin: $REMOTE_URL"
    git remote add origin "$REMOTE_URL"
else
    REMOTE_URL="$CURRENT_REMOTE"
    echo "Using existing remote origin: $REMOTE_URL"
fi

echo ""
echo "Ensuring all assets and code are tracked..."
git add .
if ! git diff --cached --quiet; then
    git commit -m "Update: 3D assets and Spline integration"
else
    echo "Working tree clean, ready to push."
fi

git branch -M main

echo ""
echo "Pushing to $REMOTE_URL..."
echo "Note: If GitHub prompts for a password, use a Personal Access Token (PAT)"
echo "with 'repo' scope from: https://github.com/settings/tokens"
echo "--------------------------------------------------------"

git push -u origin main

echo ""
echo "========================================================"
echo "  Successfully pushed to GitHub!"
echo "========================================================"

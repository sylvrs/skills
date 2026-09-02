#!/usr/bin/env bash
# Link all skills in this repository to Cursor and global agent directories.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DIR="$REPO_DIR/skills"

CURSOR_SKILLS="$HOME/.cursor/skills"
AGENTS_SKILLS="$HOME/.agents/skills"

mkdir -p "$CURSOR_SKILLS" "$AGENTS_SKILLS"

echo "Linking skills from $SKILLS_DIR..."

for skill_path in "$SKILLS_DIR"/*; do
  [ -d "$skill_path" ] || continue
  skill_name="$(basename "$skill_path")"

  # Remove existing non-symlink directories if present to avoid nested symlinks
  if [ -d "$CURSOR_SKILLS/$skill_name" ] && [ ! -L "$CURSOR_SKILLS/$skill_name" ]; then
    rm -rf "$CURSOR_SKILLS/$skill_name"
  fi
  if [ -d "$AGENTS_SKILLS/$skill_name" ] && [ ! -L "$AGENTS_SKILLS/$skill_name" ]; then
    rm -rf "$AGENTS_SKILLS/$skill_name"
  fi

  # Link to ~/.cursor/skills
  ln -sfn "$skill_path" "$CURSOR_SKILLS/$skill_name"
  echo "  ✓ Linked ~/.cursor/skills/$skill_name -> $skill_path"

  # Link to ~/.agents/skills (for open agent ecosystem)
  ln -sfn "$skill_path" "$AGENTS_SKILLS/$skill_name"
  echo "  ✓ Linked ~/.agents/skills/$skill_name -> $skill_path"
done

echo ""
echo "All skills successfully linked to local agent environments!"

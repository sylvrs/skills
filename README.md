# skills

A collection of custom, production-grade AI agent skills for Cursor, Claude Code, and the open Agent Skills ecosystem (`skills.sh`).

## Available Skills

| Skill | Description | Supported Agents |
| --- | --- | --- |
| [`emprove`](skills/emprove/) | Interactive code audit, test fidelity improvement, YAGNI simplification, and repository standards alignment with human checkpoints. | Cursor, Claude Code, Codex |

---

## Installation for Teammates

This repository is private. Ensure your machine is authenticated with GitHub (`gh auth login` or SSH keys) before running the installation commands below.

### 1. Install Globally (Recommended)

To install a skill across all your local projects and workspaces:

```bash
# Install emprove
npx skills add sylvrs/skills --skill emprove -g

# Or install all skills in this repository
npx skills add sylvrs/skills --all -g
```

The CLI will detect your installed coding agents (Cursor, Claude Code, Codex, etc.) and link the skills into their respective configurations.

### 2. Install into a Specific Project Repository

To install a skill into only the current workspace and record it in `skills-lock.json`:

```bash
npx skills add sylvrs/skills --skill emprove
```

---

## Updating Skills

Whenever new updates, tenets, or bugfixes are pushed to this repository, teammates can update with:

```bash
# Update all global skills
npx skills update -g

# Or update only emprove
npx skills update emprove
```

To list all currently installed skills and their sources:

```bash
npx skills ls -g
```

---

## Authoring & Local Development Workflow

If you are developing or adding skills in this repository:

### 1. Local Linking (Instant Live Reload)

Run the linking script to symlink all skills in `skills/*` into your local `~/.cursor/skills/` and `~/.agents/skills/`:

```bash
./link.sh
```

Any edits you make in `skills/<skill-name>/` are immediately reflected in your active Cursor and agent sessions—no reinstall or update step needed.

### 2. Adding a New Skill

1. Create a new directory under `skills/`:
   ```bash
   mkdir -p skills/my-skill
   ```
2. Add `SKILL.md` with valid YAML frontmatter:
   ```markdown
   ---
   name: my-skill
   description: Concise description of when and how the agent should use this skill
   ---

   # My Skill
   ```
3. Run `./link.sh` to link your new skill locally.
4. Run validation tests:
   ```bash
   node skills/<skill-name>/tests/validate-skill.mjs
   ```
5. Commit and push:
   ```bash
   git add skills/my-skill
   git commit -m "feat(skills): add my-skill"
   git push origin main
   ```
Teammates can now run `npx skills add sylvrs/skills --skill my-skill -g` or `npx skills update -g`.

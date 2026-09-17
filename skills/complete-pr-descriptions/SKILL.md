---
name: complete-pr-descriptions
description: Draft and update GitHub pull request titles (Conventional Commits) and descriptions in ASD-STE100, fill repository templates, link closing issues, and manage draft status. Use when completing, reviewing, or publishing pull request titles or descriptions.
---

# Complete PR Descriptions

Use this workflow for GitHub pull request titles and descriptions.

## Human voice first

PR descriptions are for other humans. They should read like the author's account of the change, not a generated summary of the diff.

- Ask the user for their wider framing before drafting Problem and Solution: why this change, who it is for, and what they want reviewers to notice.
- Prefer the user's words. Edit lightly for clarity and template fit; do not replace their perspective with a fresh AI rewrite.
- If the user has already stated product intent in the conversation, use that and confirm it with them. Do not invent motivations they did not give.
- When the user supplies Problem, Solution, and/or Risks, keep that wording. Do not expand those sections with extra approach narrative unless they ask.
- AI may draft mechanical sections (Type, Risks from evidence, Tophatting steps, Checklist, Screenshots placeholders) when the user has not supplied them.
- The AI Assistance section must make human involvement obvious: what the human decided, directed, reviewed, or wrote, and what the AI did. Never imply the PR was AI-only when a human drove product or UX choices.
- When the user wants to author or heavily revise the description themselves, help with structure and checklist accuracy; do not overwrite their draft with a full regenerated body.

## Workflow

1. Read the current pull request body, repository template, diff, commits, and checks.
2. Identify issue references from the request, branch, PR, and repository context.
3. Add `Closes #123` or `Closes #123, #456` at the top when issue numbers are known. Do not invent issue numbers. Omit the line when no issue is linked.
4. Ask the user for (or confirm) their Problem and Solution framing. Then assemble the full description: human narrative where they provided it, mechanical sections filled from evidence.
5. Ask the user whether they have tophatted each PR.
6. For frontend changes, ask the user whether they checked mobile widths.
7. Instruct the user to upload screenshots or videos, or provide paths to screenshots or videos on disk. Inspect provided files before including them.
8. Draft a conventional-commit title (see **Titles**) and agent-written body sections in ASD-STE100, then run the avoid-ai-writing pass (see **Writing Rules**). Keep user-authored Problem and Solution text unless clarity, ASD-STE100, or a clear AI-ism needs a light fix.
9. Show the complete proposed title and description to the user.
10. Wait for explicit user review and approval before changing the PR title or description.
11. Update the PR with `gh pr edit <number> --title "<title>" --body-file <file>` or the supported equivalent.
12. Before changing draft status, check the PR's remaining TODOs.
13. Mark the PR as ready only when the description is the only thing remaining on our TODO list for this PR.
14. When marking ready (or when the user asks to request reviewers), add SWE reviewers per **Reviewers** below.

## Titles

Use [Conventional Commits](https://www.conventionalcommits.org/) for the GitHub PR title (and for auto-generated stack titles you replace after `gh stack submit`).

Format: `<type>: <description>`

- Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`. Prefer `feat`, `fix`, `chore`, or `docs` unless another type is clearly better.
- Description: lowercase, imperative, no trailing period. Example: `feat: add admin pre-create user API`.
- One type and one description. Do not stack types (`feat/fix:`).
- Title the PR for the slice outcome, not the latest fixup commit.
- If `gh stack submit --auto` wrote a sentence title, replace it when you apply the approved description.

## Commits

When this skill (or a PR/stack follow-up it owns) creates a git commit:

- Use [Conventional Commits](https://www.conventionalcommits.org/) for the subject. Same format as **Titles**: `<type>: <description>`, lowercase, imperative, no trailing period.
- Do not rewrite older commit messages unless the user asks.

## Reviewers

SWE team reviewer pool (GitHub logins):

- `cmargerum`
- `mattdrose`
- `jacobp925`

Rules:

- Prefer **1–2** reviewers from this pool for a normal PR.
- Do **not** request all three by default.
- Request **all three** only for very large changes (**2000+ lines** in the PR diff), or when the user explicitly asks for the full set.
- Skip anyone already an author/co-author on the PR.
- Prefer reviewers who recently touched the same area when that is clear from `git log` / blame; otherwise rotate or pick from the pool.
- Use `gh pr edit <number> --add-reviewer <login>[,<login>]`.
- If a login cannot be added, report which ones failed and continue with the ones that succeeded.

## Writing Rules

Write PR bodies and any GitHub comments in ASD-STE100 (Simplified Technical English):

- Use short sentences.
- Use active voice.
- Use approved/common words. Prefer one word per meaning; avoid synonyms for variation.
- Write one idea per sentence.
- Prefer imperative or direct statements for procedures ("Open the player page." not "You can open the player page.").
- Tophatting steps start at the behavior to check. Do not tell reviewers how to sign in. Do not mention DevAuth, Microsoft sign-in, seeded users, or similar access setup. Reviewers already have access.
- Avoid jargon, idioms, and figurative language unless the term is required domain vocabulary (for example basketball or Apollo names).
- State what changed and why it was necessary, in the user's terms when they gave them.
- Describe risks and verification steps from evidence. Do not claim checks or manual verification that did not happen.
- Keep the Problem, Solution, and Risks sections concise.
- Use the repository's existing section names and template order.
- State when issue links are not available.
- Describe how AI assistance was used. Name human decisions and AI tasks separately. Do not use a generic disclosure when the actual work is known.
- For frontend PRs, state the mobile verification result.
- State whether screenshots or videos are attached. If they are not available, instruct the user to upload them or provide paths on disk.

### Avoid AI writing pass

Before you show a proposed PR body to the user, or post any GitHub comment or review reply, run an **avoid-ai-writing** pass (`technical` voice) after the ASD-STE100 draft. Read and follow `~/.agents/skills/avoid-ai-writing/SKILL.md` (or the linked `avoid-ai-writing` skill).

- ASD-STE100 is the base standard. avoid-ai-writing removes remaining AI-isms (em dashes, hollow intensifiers, stacked parallelisms, filler transitions, and similar tells).
- Prefer plain, direct wording. Do not make the text sound more polished than a careful engineer would write.
- Keep the user's own Problem and Solution wording when they supplied it. Edit only for clarity, template fit, ASD-STE100 compliance, and clear AI-isms. Do not replace their voice with a full rewrite.
- Mechanical sections you draft (Risks, Tophatting, Checklist notes, AI Assistance, comment replies) must pass both checks.

## Checkboxes

If something isn't checked (`[x]`), use `[~]` as a filler. This is because GitHub marks these check lists as "tasks" and we don't want any remaining tasks.

- Never leave `[ ]` in the final PR body.
- Use `[x]` only for a completed and verified item.
- Use `[~]` for items that are not applicable, not verified, or not provided.
- Do not use `[~]` to imply that an item is complete.
- Mark tophatting and mobile-friendly items as `[x]` only after the user confirms them.
- Mark screenshot items as `[x]` only after the user provides the assets or paths.

## External Changes

- Use `gh` for GitHub reads and writes.
- Do not edit a PR before the user reviews the complete proposed body.
- Do not mark a PR ready while any other TODO remains.
- Treat missing screenshots, unconfirmed tophatting, and unconfirmed mobile verification as TODOs.
- If a PR is part of a stack, preserve its base and update dependent PRs after changing a lower PR.
- Any GitHub comment or review reply posted on the user's behalf must use a Markdown blockquote with an agent speaker tag on the first line, a blank quoted line, then the comment body. Example:

  ```md
  > `agent` · Cursor
  >
  > This is fixed in commit `abc123`.
  > The seed game date is inside the season range.
  ```

  Do not leave comments that could be mistaken for the human author writing in their own voice.
- Comment and reply prose must also follow **Writing Rules** (ASD-STE100 + avoid-ai-writing pass) before posting.

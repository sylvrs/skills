---
name: emprove
description: >-
  Audits and cleans up code across working changes, a commit range, or a codebase.
  Evaluates 4 pillars (Complexity, Test Fidelity, Simplicity/YAGNI, Repo Standards),
  the Emprove Pentagon, concrete type discipline, anti-slop linting, and technology
  guides for TypeScript, React, NestJS, and Tailwind CSS. Use full mode for interactive strategic
  cleanups or lite mode for fast inter-task gates.
---

# Emprove

<INVOCATION-GATE>
Use this skill when explicitly invoked with `/emprove` or during planned orchestrator audit/gate phases. Do not automatically trigger on general coding questions or routine edits unless instructed.
</INVOCATION-GATE>

`emprove` is an interactive code audit and cleanup skill. It identifies cognitive and structural friction, eliminates low-fidelity tests, reduces unnecessary abstractions, catches anti-slop patterns, enforces concrete domain types, and aligns code with repository standards (`AGENTS.md`, `docs/standards/`, `docs/dragons/`).

Because agents cannot guess long-term architectural roadmaps, `emprove` bridges the gap by auditing first, pausing at a **Strategic Human Checkpoint** to ask targeted questions, and only refactoring what the human approves.

## Precedence Ladder

When evaluating code or resolving conflicts between rules:

1. **Repository Non-Negotiables:** Workspace root rules, `AGENTS.md` non-negotiables, security boundaries, and strict invariants always win.
2. **Repository Standards:** `docs/standards/`, architecture guides, and project linters.
3. **Emprove Tenets & Technology Guides:** Core quality pillars and dialect rules.
4. **Peer Skill Catalogs:** Suggestions from `beautiful-code`, `ponytail`, etc.

*Rule:* If an Emprove tenet conflicts with a repository standard (e.g. an interface required by team conventions), Emprove reports the conflict at the checkpoint rather than unilaterally overriding it.

## Invocation Modes

| Mode | Syntax | When to use | Behavior |
| --- | --- | --- | --- |
| **full** (Default) | `/emprove` or `/emprove full [target]` | Feature completion, PR prep, major refactor | Full 4-pillar audit, Strategic Human Checkpoint dialogue, prioritized refactor plan, gate verification. |
| **lite** | `/emprove lite [target]` | Between tasks in an implementation plan (e.g. Stoudemire) | Fast pass/warn/fail scorecard on the recent diff. Report-only by default; flags blockers without prompting. |

## Scope Resolution

When invoked, `emprove` determines the target scope in this order:

1. **Explicit argument:** If an argument is provided (e.g., `/emprove src/modules/posts` or `/emprove HEAD~2..HEAD`), audit that directory, file, or git commit range.
2. **Uncommitted working changes:** If no argument is provided, inspect `git status --porcelain`. If dirty, audit the uncommitted working tree changes (`git diff HEAD`).
3. **Clean tree fallback:**
   - **In full mode:** If the tree is clean and no argument is provided, prompt the user using `AskQuestion` (or conversationally if unavailable):
     - Audit recent commit range (`HEAD~1..HEAD`)
     - Audit a specific directory path
     - Audit the entire codebase (high-level structural scan)
   - **In lite mode:** NEVER prompt and NEVER block. If the working tree is clean, automatically audit the last commit range (`HEAD~1..HEAD`). If the scope has no modified source files, output an immediate one-line pass: `Emprove Lite: No changes in scope. PASS.` and exit immediately.

## Peer Skill Discovery & Graceful Degradation

At startup, `emprove` checks for installed peer skills in `.cursor/skills/` and `~/.cursor/skills/`:
- **Optional Peers:** `beautiful-code`, `ponytail`, `react-best-practices`.
- **When Present:** `emprove` references their specialized catalogs in audit recommendations.
- **When Absent:** `emprove` degrades gracefully. It falls back completely on its built-in `reference.md` and dialect/technology guides. It never errors or depends on external skills to function.

## Technology & Dialect Routing

During analysis, `emprove` automatically loads applicable dialect and technology guides based on the files in scope:
- **TypeScript / JavaScript:** [references/typescript.md](references/typescript.md)
- **React (SPA / Hooks / State / RTL):** [references/react.md](references/react.md)
- **NestJS (API / Fastify / DTOs / Guards):** [references/nestjs.md](references/nestjs.md)
- **Tailwind CSS (Utilities / Inline Styles / Design Tokens):** [references/tailwind.md](references/tailwind.md)

## The 4 Canonical Pillars

Every audit evaluates four defined pillars:

1. **Control Flow & Complexity:** Cyclomatic nesting depth (>3 levels), guard clauses, table-driven dispatch, and Single Level of Abstraction (SLAP).
2. **Test Fidelity & Assertion Quality:** Eliminating mock echo chambers, vacuum assertions (`toBeDefined`), and async ghost passes. *Strengthening-only: never delete or weaken tests.*
3. **Simplicity, Anti-Slop & Concrete Types:** YAGNI, rule of three, concrete domain contracts over anonymous shapes, eliminating type laundering (`as unknown as T`) and empty object spreads.
4. **Repository Standards & Architectural Alignment:** Verifying strict typing, domain naming, error cause chains, and alignment with `AGENTS.md` and local docs.

## The 5-Phase Lifecycle (Full Mode)

```
[1. Discover Context] ──► [2. Resolve Scope] ──► [3. Audit 4 Pillars]
                                                        │
          ┌─────────────────────────────────────────────┘
          ▼
[4. Strategic Human Checkpoint]
          │ (Clarify architectural intent & approve items)
          ▼
[5. Refactor & Verify Gates] ──► [Green Clean Code]
```

### Phase 1: Context & Standards Discovery
Inspect workspace configuration: `AGENTS.md`, `docs/standards/`, `docs/dragons/`, package scripts, test runners, and peer skills.

### Phase 2: Scope Resolution
Collect target files. Exclude lockfiles, vendor bundles, generated files, and migrations (unless explicitly requested).

### Phase 3: The 4-Pillar Audit
Evaluate the code against the 4 Canonical Pillars, the Emprove Pentagon, and applicable technology guides.

### Phase 4: Strategic Human Checkpoint (Full Mode Only)
Agents cannot infer long-term architectural roadmaps. When structural friction is found:
- Do NOT make unrequested assumptions.
- Formulate 1 to 3 targeted questions using `AskQuestion` (or conversationally if unavailable).
- State the observed friction, trade-offs, and recommend the cleanest path.
- *If the user does not approve or reply, deliver the report and STOP without editing code.*

### Phase 5: Behavior-Preserving Refactoring & Verification
1. Apply approved simplifications one cohesive change at a time.
2. Never change external behavior or contract without explicit instruction.
3. Run project verification gates (e.g. `pnpm check`, `pnpm test <file>`).

## Lite Mode Contract (Inter-Task Fast Gate)

Lite mode is optimized for fast agent loops (e.g., between Stoudemire tasks):
- **Budget:** Inspects only the task's changed lines and immediate callers. Hard cap: maximum 5 findings.
- **Report-Only by Default:** Flags findings without altering public exported signatures. Non-blocking suggestions emit a WARN; only red test gates or repository non-negotiable violations emit a FAIL.
- **Gate Discipline:** If the preceding task already ran and passed `pnpm check` / `pnpm test`, lite mode does not duplicate the run unless files were modified.

## Output Templates

### Full Audit Report

```markdown
# Emprove Audit: [Target Scope]

## Summary
- **Files Scanned:** N
- **Friction Count:** X items (Complexity: A, Test Fidelity: B, Simplicity: C, Repo Standards: D)
- **Net Potential Delta:** -X lines, -Y indirection layers
- **Peer Skills Active:** [beautiful-code] (or "Standalone")

## Findings

### [Pillar Name] <Title>
- **Location:** `path/to/file.ts:lineStart-lineEnd`
- **Friction:** Concise explanation of defect.
- **Remedy:** Concrete replacement pattern or deletion.
- **Impact:** Expected LOC or complexity reduction.

## Strategic Questions
[1-3 structured questions for the human guide]
```

### Lite Scorecard

```markdown
### Emprove Lite Scorecard
| Pillar | Status | Notes |
| --- | --- | --- |
| Control Flow | PASS | Inlined guard clause |
| Test Fidelity | PASS | Strengthened mock assertion to verify output transformation |
| Simplicity & Types | WARN | Anonymous return shape in `getUser`; consider promoting to `UserProfile` |
| Repo Standards | PASS | Conformed to strict typing rules |

**Result:** PASS (0 blocking errors, 1 non-blocking warning).
```

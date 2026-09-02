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

## Non-Negotiable Core Invariants (Primacy)

These are hard execution constraints, not suggestions. A violation of any invariant immediately fails an audit:

1. **Tests are Strengthening-Only:** NEVER delete, weaken, or skip a test to pass an audit or eliminate friction. Rewrite assertions to verify domain logic or enrich test setups.
2. **Never Ask in a Vacuum:** Every checkpoint question MUST include context, trade-offs, and a concrete `// TODAY` vs `// PROPOSED` code block. Questions without code examples are forbidden.
3. **Zero Silent Assumptions:** Never refactor architectural forks without explicit user approval of a numbered/lettered option.
4. **Single Source of Style Truth:** Never mix inline `style` with Tailwind `className` for static layout, spacing, or colors. `style` is reserved strictly for continuous, unbounded runtime metrics.
5. **No Blind Full-Tree Scans in Lite Mode:** Lite mode audits ONLY recent changes (`HEAD~1..HEAD` or dirty tree), strictly caps findings at 5, and NEVER prompts.

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

## Progressive Disclosure & Technology Routing

To prevent attention dilution, "lost in the middle" degradation, and token waste, **do NOT load all reference guides simultaneously**. Inspect the files in scope during Phase 2 and load ONLY matching guides on demand:

| Target Scope Files | Guide to Load | When to Leave Unloaded |
| --- | --- | --- |
| TypeScript / JavaScript (`.ts`, `.js`) | [references/typescript.md](references/typescript.md) | No TS/JS files in diff |
| React Components (`.tsx`, `.jsx`) | [references/react.md](references/react.md) | Non-React/Backend files |
| NestJS Architecture (`*.controller.ts`, `*.service.ts`, `*.module.ts`) | [references/nestjs.md](references/nestjs.md) | Frontend/React files |
| Tailwind CSS / Styles (`className`, `tailwind.config.*`, CSS) | [references/tailwind.md](references/tailwind.md) | Backend-only changes |

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
Collect target files. Exclude lockfiles, vendor bundles, generated files, and migrations (unless explicitly requested). Route relevant technology guides based on the table above.

### Phase 3: The 4-Pillar Audit
Evaluate the code against the 4 Canonical Pillars, the Emprove Pentagon, and loaded technology guides.
- **Phase Exit Gate 3 ──► 4:** Every finding MUST include an exact file path and line numbers (`path/to/file.ts:lineStart-lineEnd`). Abstract or unlocated findings are forbidden.

### Phase 4: Strategic Human Checkpoint (Full Mode Only)
Agents cannot infer long-term architectural roadmaps. When structural friction is found:
- Do NOT make unrequested assumptions.
- Formulate 1 to 3 targeted questions using `AskQuestion` (or conversationally if unavailable).
- **Never Ask in a Vacuum:** Every question MUST provide:
  1. **Background & Context:** Where the code lives and its current role.
  2. **Concrete Code Example / Sketch:** A concise before-and-after snippet illustrating "Today (Current)" vs. "Proposed (Option A / Option B)".
  3. **Trade-offs & Clear Recommendation:** Explain the pros/cons of each option with a justified default recommendation.
- **Phase Exit Gate 4 ──► 5:** If the user does not explicitly approve an option, deliver the report and STOP without editing code.

### Phase 5: Pre-Flight Invariant Verification & Refactoring
Before editing any file in Phase 5, output a mandatory 3-bullet pre-flight proof:
- `[User Approval Verified]:` Specific option chosen by user.
- `[External Contract Invariant]:` Confirms public signatures / API behavior remain identical.
- `[Verification Gate]:` Test command that will verify the refactoring (e.g. `pnpm test <file>`).

Apply approved simplifications one cohesive change at a time, running verification gates between each edit.

## Lite Mode Contract (Inter-Task Fast Gate)

Lite mode is optimized for fast agent loops (e.g., between Stoudemire tasks):
- **Budget:** Inspects only the task's changed lines and immediate callers. Hard cap: maximum 5 findings.
- **Report-Only by Default:** Flags findings without altering public exported signatures. Non-blocking suggestions emit a WARN; only red test gates or repository non-negotiable violations emit a FAIL.
- **Gate Discipline:** If the preceding task already ran and passed `pnpm check` / `pnpm test`, lite mode does not duplicate the run unless files were modified.

## Anti-Rationalization Table (Preempting Agent Excuses)

When running `emprove`, agents are strictly forbidden from adopting these rationalizations:

| Agent Excuse | Hard Rule Enforcement |
| --- | --- |
| *"The change is small or self-explanatory, so I don't need a code sketch."* | **FORBIDDEN.** Every checkpoint question requires a `// TODAY` vs `// PROPOSED` snippet, regardless of diff size. |
| *"The user said 'looks good' or gave a thumbs up, so I will guess their choice."* | **FORBIDDEN.** If the user's reply does not name an option, ask for clarification before editing. |
| *"This tautological test provides no value, so deleting it is cleaner."* | **FORBIDDEN.** Deleting or weakening tests is an immediate protocol violation. Strengthen its assertions instead. |
| *"Tailwind doesn't have a utility for this static property, so `style={{}}` is fine."* | **FORBIDDEN.** Static values must use Tailwind tokens or `@theme`. Inline `style` is reserved strictly for continuous runtime metrics. |
| *"I'll batch all refactoring into one big commit to move faster."* | **FORBIDDEN.** Refactor one cohesive item at a time; verify tests pass after each step. |

## Final Exit Checklist (Verify Before Responding) (Recency)

Before emitting the final audit report or executing any refactoring, verify:
- [ ] Are all checkpoint questions accompanied by context, trade-offs, and a concrete `// TODAY` vs `// PROPOSED` code block?
- [ ] Were any tests deleted or weakened? (If yes, abort and revert; tests are strengthening-only).
- [ ] Were non-relevant technology guides kept unloaded to protect attention geometry?
- [ ] Are all findings grounded with exact `file:lineStart-lineEnd` citations?
- [ ] If in Phase 5, was the 3-bullet Pre-Flight Invariant Verification emitted prior to file edits?

## Output Templates

### Full Audit Report

````markdown
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

### Question 1: [Short Title]
- **Context:** [Where the code lives and why this question is being asked]
- **Friction Found:** [Concrete defect or architectural fork]
- **Current vs. Proposed:**
  ```typescript
  // TODAY (Current):
  ...
  // PROPOSED (Option A - Recommended):
  ...
  ```
- **Trade-offs:**
  - **[Option A] (Recommended):** [Action + pros/cons]
  - **[Option B]:** [Action + pros/cons]
````

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

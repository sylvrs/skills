# Emprove Quality Reference

This document catalogs the universal quality heuristics used by `emprove`. These principles apply across any language, framework, and codebase.

---

## 1. The Emprove Pentagon

```
                      ┌─────────────────────────────────────────┐
                      │          THE EMPROVE PENTAGON           │
                      ├─────────────────────────────────────────┤
                      │ 1. State Topology & Mutation Locality   │
                      │ 2. Error Boundaries & Cause Chains      │
                      │ 3. API Ergonomics & Call-Site Clarity   │
                      │ 4. Single Level of Abstraction (SLAP)   │
                      │ 5. Zombie Abstractions & Speculation    │
                      └─────────────────────────────────────────┘
```

### 1.1 State Topology & Mutation Locality
- **Zero Out-of-Band Mutation:** Functions must not silently modify object references passed in as arguments. Return transformed objects or name the method explicitly for mutation (`entity.applyTransition()`).
- **Eliminate Boolean State Combinatorics:** Multiple independent flags (`isLoading`, `hasError`, `isSuccess`) yield 2^n possible states, permitting invalid combinations (e.g. `isLoading && hasError`). Replace with **mutually exclusive state unions or state machines**.
- **Eliminate Temporal Coupling:** Prevent requirements where function B must follow A and precede C. Use pipelines or typed transition tokens where A returns a value required to invoke B.

### 1.2 Error Boundaries & Cause Chains
- **Domain Results vs. Invariant Exceptions:** Expected operational outcomes (e.g. `NotFound`, `ValidationFailed`) belong in explicit typed return values (Result unions). Unchecked exceptions belong at system boundaries or for true invariant crashes.
- **Cause Chain Preservation:** Catch blocks must never swallow errors (`catch (e) {}`) or silently return `null` unless the caller contract explicitly allows it. Always preserve root context with `{ cause }`.
- **Perimeter Validation, Core Trust:** Validate untrusted data strictly at system edges (HTTP inputs, configs, database inputs). Avoid defensive null/undefined checks inside core domain routines.

### 1.3 API Ergonomics & Call-Site Clarity (Poka-Yoke)
- **Eliminate Boolean Traps:** Signatures like `updateUser(id, true, false, true)` obscure intent. Require a named options bag for more than 2 parameters or when toggling behaviors.
- **Symmetrical Lifecycle Pairs:** Every acquired resource (subscription, timer, file descriptor) must have an obvious, deterministic cleanup path (`try...finally`, `using`, `defer`).

### 1.4 Single Level of Abstraction Principle (SLAP) & Vertical Locality
- **Table of Contents Flow:** High-level functions should read like orchestrators, delegating detailed parsing, regex matching, or SQL construction to lower-level helpers.
- **Vertical Locality:** Logic used in only one place belongs with the caller. Avoid scattering single-use helper functions into shared utility directories.

### 1.5 Zombie Abstractions & Speculative Indirection
- **Single-Implementation Interfaces:** An interface with only one concrete implementation across the repository provides zero decoupling and doubles cognitive jumping. Inline it until a second implementation is required.
- **Pass-Through Layers:** Controllers that only call services that only call repositories without transformation or business validation are dead weight. Flatten them.

---

## 2. Pillar-to-Heuristic Index

| Canonical Pillar | Core Reference Sections | Technology Guides |
| --- | --- | --- |
| **1. Control Flow & Complexity** | §1.4 (SLAP), §5 (Complexity & Guard Clauses) | `references/typescript.md` §3 |
| **2. Test Fidelity & Assertion Quality** | §6 (High-Value Test ROI & Strengthening Taxonomy) | `references/react.md` §5, `references/nestjs.md` §6 |
| **3. Simplicity, Anti-Slop & Concrete Types** | §1.5 (Zombie Code), §3 (Concrete Types), §4 (Anti-Slop), §8 (Dead Code) | `references/typescript.md` §1-§2, `references/react.md` §1-§3, `references/tailwind.md` §1-§5 |
| **4. Repository Standards & Architecture** | §1.1-§1.3 (State & Errors), §7 (Async), §9 (Defensive Security Hygiene), `AGENTS.md` | `references/typescript.md` §4-§5, §7, `references/nestjs.md` §1-§5, `references/tailwind.md` §6-§7 |

---

## 3. Concrete Domain Types vs. Anonymous Shapes

### Core Principle
> **Naming a shape is exempt from YAGNI. Abstracting over shapes is not.**

`type UserProfile = { ... }` is domain modeling, not premature abstraction. Abstracting with generic factories (`DeepPartial<Pick<T, K>>`) or speculative wrapper interfaces is type-level over-engineering and subject to the rule of three.

### When to Promote to a Named Concrete Type
1. The shape crosses module, controller, service, or API boundaries.
2. The shape represents a core domain entity or state machine.
3. The shape has 3+ fields and is consumed in multiple functions or component props.

### Counter-Rules: When NOT to Create a Named Type
1. **Never alias a bare primitive without an invariant:** Do not write `type Id = string` unless using a branded type (`type UserId = string & { readonly __brand: unique symbol }`).
2. **Never extract a named type used only once in local function scope:** Keep local temporary shapes inline.
3. **Never hand-maintain duplicated types that parallel existing sources of truth:** Derive them using `z.infer<typeof schema>`, `typeof config`, `$inferSelect`, or `Pick<DomainModel, 'id' | 'name'>`.
4. **Valid Index Signatures:** Use `Record<string, TargetType>` only when keys are truly dynamic runtime values (e.g. cache lookups). For known closed sets of keys, use concrete interfaces or `Record<KnownEnumUnion, TargetType>`.

---

## 4. Anti-Slop Heuristics

`emprove` inspects code for low-evidence patterns identified in the `anti-slop` specification:

### 4.1 Type Laundering (`no-chained-type-assertions`)
- **Smell:** `value as unknown as TargetType` or angle-bracket double casts.
- **Why it hurts:** Tells the compiler to abandon verified type evidence; runtime shape mismatches become invisible runtime bugs.
- **Remedy:** Validate at the boundary with a schema parser (Zod/Valibot), narrow with type guards, or construct the expected type shape explicitly.

### 4.2 Conditional Empty Object Spreads (`no-conditional-empty-object-spread`)
- **Smell:** `{ ...(condition ? { key: value } : {}) }`.
- **Why it hurts:** Degrades TypeScript's optional property inference, confuses exact optional property types, and hurts readability.
- **Remedy:** Use clean ternary assignment or direct conditional assignment:
  ```typescript
  const payload: Payload = condition ? { id, key: value } : { id };
  ```

### 4.3 Known Value Widening & Widen-Then-Assert
- **Smell:** Flowing a known specific type into `unknown`, `any`, or broad records, and later casting it back (`as Specific`).
- **Remedy:** Preserve the specific type end-to-end through generic parameters or narrow return types.

### 4.4 Require Invariant Justification for Unavoidable Casts
- **Rule:** If a single type assertion (`as T`) is truly unavoidable due to an external non-typed library boundary, require a preceding `// SAFETY: <explanation>` comment explaining why the invariant holds.

### 4.5 Module Mocking Overuse
- **Smell:** Heavy reliance on `vi.mock("some-module")` or `jest.mock(...)` in tests.
- **Why it hurts:** Creates brittle mocks disconnected from actual module behavior.
- **Remedy:** Pass dependencies explicitly (Dependency Injection) and supply in-memory test doubles.

---

## 5. Control Flow & Complexity Reduction

### Smell: Deeply Nested Conditional Pyramids
- **Heuristic:** Nesting >3 levels deep signals missing guard clauses or tangled responsibilities.
- **Remedy:** Invert conditions to return early (guard clauses).

```typescript
// BEFORE: High cognitive load
function processOrder(order: Order) {
  if (order.isValid) {
    if (order.isPaid) {
      if (!order.isCancelled) {
        return ship(order);
      }
    }
  }
  return null;
}

// AFTER: Guard clauses
function processOrder(order: Order) {
  if (!order.isValid || !order.isPaid || order.isCancelled) {
    return null;
  }
  return ship(order);
}
```

### Smell: Branching Dispatch Chains
- **Heuristic:** Long `if-else if-else if` or switch statements dispatching by key.
- **Remedy:** Replace with a constant lookup table or record map (`[key]To[Value]`).

---

## 6. High-Value Test Fidelity & In-Place Assertion Tightening

### The Test ROI Equation
A test provides genuine value only if the defect risk outweighs its ongoing maintenance tax and CI execution overhead:

\[
\text{Test Value} = \frac{\text{Probability of Defect} \times \text{Cost of Defect}}{\text{Maintenance Burden} + \text{Execution Time}}
\]

### Core Directive: In-Place Tightening Over Test Sprawl
`emprove` is an audit and cleanup tool, **never an autonomous test generator**.
- **Default Action:** Sharpen existing test assertions in place (replace vacuum assertions with domain checks; strip mock echo chambers).
- **Prohibition on Sprawl:** Do NOT create new test files or sprout dozens of new `it()` blocks for trivial permutations.

### Anatomy of Test Slop (Patterns to Reject)
1. **The Plumbing / Pass-Through Test:** Testing 1-line functions (e.g. `getPost(id) { return this.repo.find(id); }`) where tests merely spy that the delegate was called. If the underlying data layer is tested, pass-through unit tests add 100% refactoring drag with 0% defect detection.
2. **The Type-System Redundancy Test:** Writing runtime unit assertions to verify shapes, non-nullability, or types that TypeScript (`strict: true`) or schema parsers (Zod) already enforce at compile time.
3. **Happy-Path Permutation Sprawl:** Multiplying `it()` blocks for trivial variations of identical execution paths.
4. **The Mock Echo Chamber:** Mocking every collaborator, feeding mock data into a function, and asserting that the function returned the exact mock data without business logic or transformation.

### The Strict Test Creation Gate
`emprove` is strictly **forbidden** from generating a new test block (`it(...)` or `test(...)`) *unless* the candidate test satisfies ALL THREE conditions:
1. **High Defect Impact:** Exercises state machine/lifecycle transitions, financial/permission invariants, complex calculations, or external system error boundaries.
2. **Zero Existing Coverage:** The critical invariant has zero existing automated tests.
3. **Minimal Footprint:** Maximum 1 to 2 focused, high-leverage assertions, not combinatorial sprawl.

### Non-Negotiable Test Strengthening Rule
> **Tests are strengthened, never weakened or deleted.**
> Emprove never deletes an existing test case autonomously. If an assertion is tautological, rewrite the assertion to verify real observable behavior. Test deletion strictly requires explicit human approval at the Strategic Checkpoint.

```
┌────────────────────────────────────────────────────────────────────────┐
│                     TAUTOLOGICAL TEST TAXONOMY                         │
├──────────────────────┬─────────────────────────────────────────────────┤
│ The Mock Echo Chamber│ Asserting mock return values against outputs    │
│ Invariable Passers   │ Assertions that cannot fail mathematically      │
│ Async Ghost Passes   │ Unawaited promises / swallowed test errors      │
│ Implementation Spies │ Asserting private method calls instead of state │
│ Blind Snapshot Sprawl│ Unreviewed multi-page generated snapshots       │
└──────────────────────┴─────────────────────────────────────────────────┘
```

### 6.1 The Mock Echo Chamber
- **Defect:** Test configures a mock to return X, invokes the wrapper, and asserts that the wrapper returned X without intermediate business logic.
- **Remedy:** Assert the observable domain output or state transformation that occurs between mock input and output.

### 6.2 Invariable / Vacuum Assertions
- **Defect:** `expect(result).toBeDefined();` or `expect(array.length).toBeGreaterThanOrEqual(0);`.
- **Remedy:** Assert exact values, structural shapes, or expected record lengths.

### 6.3 Async Ghost Passes
- **Defect:** Omitting `await` on asynchronous expectations (`expect(promise).rejects.toThrow()`), or using `try/catch` in tests where exceptions are silently swallowed.
- **Remedy:** Always `await` async expectations. Ensure error tests fail if the code succeeds.

### 6.4 Implementation Spies
- **Defect:** Asserting that internal private method `_calculate()` was called with arguments Y.
- **Remedy:** Assert the observable output or state change on the public interface.

---

## 7. Async & Concurrency Correctness

- **No Floating Promises:** Every Promise returned must be awaited, returned, or explicitly handled with `.catch()`. Floating unhandled promises trigger unhandled rejections and hidden failures.
- **Sequential Await Bottlenecks:** Avoid awaiting independent asynchronous operations in serial `for` loops. Group independent operations with `Promise.all` or `Promise.allSettled`.
- **Cancellation & Cleanup:** Asynchronous calls triggered in event listeners or effects must accept an `AbortSignal` to prevent race conditions and memory leaks when operations are superseded.

---

## 8. Dead Code & Comment Slop

### Dead Code Detection
- **Unreferenced Exports:** Functions, types, or components exported from a module that have zero external references across the repository should be inlined, made internal, or deleted.
- **Orphaned Files:** Source files never imported by any entrypoint or route.
- **Commented-Out Blocks:** Remove commented-out code blocks; version control preserves historical code.

### Comment Slop
- **Narrating Comments:** Code should read without comments narrating what each line does (`// increment i by 1`). Delete narrating comments; reserve comments exclusively for non-obvious intent, constraints, or bug references.

---

## 9. Defensive Security Hygiene

Security is evaluated through static code review and defensive architectural patterns, not by generating speculative attack tests. `emprove` audits five core hygiene invariants:

### 9.1 Perimeter Validation & Boundary Parsing
- **Defect:** Unvalidated external inputs flowing directly into domain services or database operations.
- **Remedy:** Validate and parse untrusted data strictly at system edges (HTTP bodies, query params, route headers) using strict schema parsers (Zod, Valibot) or validated DTOs.
- **Rule:** Never rely on manual runtime `if (!data.id)` checks inside core business routines when perimeter validation can guarantee the shape.

### 9.2 Secret & Credential Hygiene
- **Defect:** Hardcoded API keys, JWT secrets, database connection strings, auth tokens, or fallback dev credentials in source files.
- **Remedy:** Secrets must be sourced exclusively from environment variables or secure secret managers. Dev defaults like `process.env.JWT_SECRET || "supersecret"` in production pathways are critical defects.

### 9.3 Sensitive Data Exposure (Data Leakage)
- **Defect:** Returning raw database models or internal domain objects that leak password hashes, MFA secrets, internal notes, or PII through API responses or unstructured logging.
- **Remedy:** Prune at the boundary using explicit response DTOs, projection schemas, or mapper functions that allowlist fields rather than denylisting them.

### 9.4 Tenant & Actor Isolation (BOLA / IDOR)
- **Defect:** Querying or mutating resources by bare resource ID (`WHERE id = :id`) without constraining to the authenticated tenant or user context (`WHERE id = :id AND org_id = :orgId`).
- **Remedy:** Ensure authorization and ownership filters are applied at the query level or validated prior to data mutation.

### 9.5 Injection Safety
- **Defect:** Building SQL queries, HTML strings, or shell commands via raw string concatenation or template literals.
- **Remedy:** Always use parameterized queries via type-safe query builders (Drizzle, Kysely, Prisma) or prepared statements. Pass shell arguments as arrays, never concatenated strings.

---

## 10. Non-Goals & Scope Boundaries

`emprove` is strictly focused on code readability, test fidelity, structural simplicity, architectural alignment, and static defensive hygiene. The following areas are explicit non-goals:
- **Dynamic Security Testing & Penetration Attacks:** Active penetration testing, exploit payloads, and third-party CVE scanning belong to dedicated security tooling. `emprove` audits static defensive hygiene, not dynamic attack execution.
- **Performance Micro-Optimizations:** Do not introduce complex algorithms or caching layers without profiling evidence.
- **Speculative Refactoring:** Never refactor working code outside the target scope.

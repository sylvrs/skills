# TypeScript Dialect Guide

This guide maps the universal `emprove` tenets, anti-slop rules, and concrete type discipline to TypeScript and JavaScript codebases.

---

## 1. Strict Typing & Anti-Slop Discipline

### Anti-Pattern: Type Laundering (`as unknown as T`)
- **Smell:** Bypassing the type checker by double casting.
- **Fix:** Narrow with type guards, use schema boundary parsers, or model the shape explicitly.

### Anti-Pattern: Unsafe Dictionaries (`Record<string, any>` / `Record<string, unknown>`)
- **Smell:** Open dictionary contracts that drop type evidence.
- **Fix:** Use concrete mapped types, indexed keys with typed values, or generic constraints `T extends Record<string, string>`.

### Invariant Justification: Required `SAFETY:` Marker
- When a single type assertion (`as T`) is legitimately necessary, require a comment:
  ```typescript
  // SAFETY: The payload has already been validated by the schema parser at the boundary.
  const data = request.body as CreateUserInput;
  ```

---

## 2. Concrete Domain Types vs. Anonymous Shapes

### Anti-Pattern: Deep Anonymous Objects Across Boundaries
```typescript
// BAD: Anonymous inline shape repeated across multiple function boundaries
async function syncAccount(account: { id: string; settings: { theme: string; notify: boolean } }) { ... }
```

### Remedy: Named Concrete Type
```typescript
// GOOD: Concrete domain contract
export interface AccountSettings {
  theme: string;
  notify: boolean;
}

export interface SyncableAccount {
  id: string;
  settings: AccountSettings;
}

async function syncAccount(account: SyncableAccount) { ... }
```

---

## 3. State & Modeling: Discriminated Unions

### Anti-Pattern: Sprawling Boolean Flags
```typescript
// BEFORE: 16 possible states, many invalid
interface PostViewState {
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  post?: Post;
}
```

### Remedy: Discriminated Union
```typescript
// AFTER: Exactly 4 valid, mutually exclusive states
type PostViewState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; post: Post }
  | { status: "error"; error: Error };
```

---

## 4. Enums vs. Const Maps

### Anti-Pattern: Numeric or Heterogeneous TypeScript `enum`
- **Smell:** TypeScript `enum` creates quirky JavaScript runtime objects and nominal type mismatches across package boundaries.
- **Fix:** Use an `as const` object map with a derived union type:

```typescript
export const PostStatus = {
  Draft: "draft",
  Published: "published",
  Archived: "archived",
} as const;

export type PostStatus = (typeof PostStatus)[keyof typeof PostStatus];
```

---

## 5. Error Handling & Result Types

### Anti-Pattern: Empty Catch Blocks or Catching to Return `null`
```typescript
// BEFORE: Swallows context
try {
  return await fetchPlayer(id);
} catch (e) {
  return null;
}
```

### Remedy: Explicit Result or Chained Error
```typescript
// AFTER: Preserves cause
try {
  return await fetchPlayer(id);
} catch (cause) {
  throw new PlayerRetrievalError(`Failed to fetch player with id ${id}`, { cause });
}
```

### Domain Failures vs. Invariant Violations
- Domain failures (e.g. `UserNotFound`, `InsufficientFunds`) should use closed error code unions:
  ```typescript
  type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
  ```

---

## 6. High-Fidelity TypeScript Testing

### Anti-Pattern: Missing `await` on Async Assertions
```typescript
// BAD: Promise is never awaited; test finishes green immediately!
it("rejects invalid input", () => {
  expect(service.process(null)).rejects.toThrow("Invalid");
});

// GOOD:
it("rejects invalid input", async () => {
  await expect(service.process(null)).rejects.toThrow("Invalid");
});
```

### Anti-Pattern: Asserting Mock Calls Instead of Observable Behavior
```typescript
// BAD: Implementation spying
expect(mockDatabase.save).toHaveBeenCalledWith(expectedEntity);

// GOOD: Observable behavior
const updatedUser = await userService.getUser(userId);
expect(updatedUser.status).toBe("active");
```

---

## 7. Relative Imports & Boundary Locality

### Heuristic: Relative for Local Cohesion, Aliases for Boundary Crossing
- **Relative Imports (`./`, `../`):** Use for files within the same cohesive module, feature, page, or directory subtree (e.g. co-located components, sub-hooks, local types, DTOs, sibling utilities, and unit tests). This keeps modules self-contained, portable, and relocatable without coupling to external path mappings.
- **Path Aliases (`@/...`, `~/...`, or package names):** Use when crossing architectural or domain boundaries (e.g. importing from shared libraries, core utilities, database schemas, common design systems, or another top-level module's public interface).

### Anti-Pattern: Deep Relative Path Mountaineering (`../../../../`)
- **Smell:** Long upward traversal chains escaping a module to reach distant layers (`../../../../shared/utils/date`).
- **Why it hurts:** Fragile under refactoring or file movement, tightly couples the module to filesystem hierarchy, and obscures which boundary is being crossed.
- **Remedy:** Use configured root path aliases for cross-layer references:

```typescript
// BAD: Deep traversal climbing across module boundaries
import { formatDate } from "../../../../shared/utils/date";
import { UserRole } from "../../../models/enums";

// GOOD: Clean, intentional boundary import via alias
import { formatDate } from "@/shared/utils/date";
import { UserRole } from "@/models/enums";
```

### Anti-Pattern: Aliasing Intra-Module Siblings
- **Smell:** Using root path aliases to import immediate siblings or co-located sub-elements within the same feature folder (`import { UserCard } from "@/pages/users/components/UserCard"` inside `pages/users/users-view.tsx`).
- **Why it hurts:** Destroys local module cohesion, makes the feature harder to move or extract, and creates noisy refactoring churn if the module is relocated.
- **Remedy:** Prefer short relative imports within the same feature or page folder:

```typescript
// BAD: Root alias for an adjacent co-located child in the same feature
import { UserCard } from "@/pages/users/components/UserCard";
import { useUserFilter } from "@/pages/users/hooks/useUserFilter";

// GOOD: Relative import preserves local module cohesion
import { UserCard } from "./components/UserCard";
import { useUserFilter } from "./hooks/useUserFilter";
```

### Anti-Pattern: Reaching Across Feature Boundaries via Relative Traversal
- **Smell:** Using relative paths to reach sideways into another feature's private internals (`import { parsePost } from "../../posts/internal/parser"` from inside `users/`).
- **Why it hurts:** Violates domain module encapsulation and leaks internal details across boundaries.
- **Remedy:** Import only from the external module's public entry point via its alias, or promote truly shared logic to a shared package or directory:

```typescript
// BAD: Sideways relative traversal into another domain's internals
import { parsePost } from "../../posts/internal/parser";

// GOOD: Import public contract via alias or shared module
import { parsePost } from "@/modules/posts";
```


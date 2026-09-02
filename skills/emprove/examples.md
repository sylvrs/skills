# Emprove Examples

This document demonstrates realistic usage scenarios for the `emprove` skill across core principles, React, NestJS, Tailwind CSS, anti-slop patterns, and concrete types.

---

## Example 1: Full Strategic Audit with Human Checkpoint

### User Invocation
```
/emprove apps/backend/src/posts/posts.service.ts
```

### Emprove Output
````markdown
# Emprove Audit: apps/backend/src/posts/posts.service.ts

## Summary
- **Files Scanned:** 1
- **Friction Count:** 3 items (Complexity: 1, Simplicity: 1, Repo Standards: 1)
- **Net Potential Delta:** -24 lines, -1 interface
- **Peer Skills Active:** beautiful-code

## Findings

### [Simplicity, Anti-Slop & Concrete Types] Single-Implementation Interface
- **Location:** `apps/backend/src/posts/posts.service.ts:14-22`
- **Friction:** `IPostValidator` has exactly one implementation (`DefaultPostValidator`). Adds an indirection jump without polymorphism.
- **Remedy:** Inline validation into `PostsService` or make `DefaultPostValidator` a concrete dependency.
- **Impact:** -12 lines, eliminates unnecessary interface.

### [Control Flow & Complexity] Deeply Nested Permission Checks
- **Location:** `apps/backend/src/posts/posts.service.ts:58-74`
- **Friction:** 4 levels of nested `if (user) { if (role) { if (!isBanned) ... } }`.
- **Remedy:** Invert into guard clauses returning `ForbiddenException` immediately.
- **Impact:** -8 lines, reduces cognitive complexity from 9 to 2.

### [Repository Standards & Architecture] Double Casting Bypass
- **Location:** `apps/backend/src/posts/posts.service.ts:102`
- **Friction:** Uses `as unknown as PostEntity` violating repository strict-types policy.
- **Remedy:** Construct the valid `PostEntity` shape explicitly.

## Strategic Questions

Before applying changes, I need your guidance on architectural direction:

### Question 1: IPostValidator Single-Implementation Interface
- **Context & Location:** `apps/backend/src/posts/posts.service.ts:14-22`
- **Friction Found:** Indirection without polymorphism. `IPostValidator` has exactly one implementer (`DefaultPostValidator`) across the entire repository, injected via string token `@Inject("IPostValidator")`.
- **Architectural Trajectory:** Where is this domain heading?
  - *If Static / Local:* Validation rules remain private to this service. Collapse to a concrete class to eliminate dead indirection and string-token injection.
  - *If Evolving / Pluggable:* The roadmap anticipates pluggable league, tenant, or external validation engines. Keep the interface and document the contract.
- **Current vs. Proposed:**
  ```typescript
  // TODAY (Current):
  export interface IPostValidator {
    validate(post: CreatePostInput): Promise<void>;
  }
  @Injectable()
  export class DefaultPostValidator implements IPostValidator { ... }

  // PROPOSED (Option A - Concrete Validator):
  @Injectable()
  export class PostValidator {
    validate(post: CreatePostInput): void { ... }
  }
  ```
- **Trade-offs & Recommendation:**
  - **[Option A] Inline into concrete validator (Recommended):** Eliminates 1 unnecessary interface and string token injection; simplifies call stack and navigation. Follows YAGNI until multiple validation engines exist.
  - **[Option B] Keep interface:** Useful only if you plan to inject pluggable, tenant-specific, or external third-party validators in the near future.
````

---

## Example 2: Lite Inter-Task Scorecard

### Context
Ran in an agent execution loop after a task was committed. `emprove lite` automatically inspected the recent commit `HEAD~1..HEAD`.

### Emprove Output
```markdown
### Emprove Lite Scorecard (Recent Task Commit)

| Pillar | Status | Notes |
| --- | --- | --- |
| Control Flow | PASS | Clean early returns |
| Test Fidelity | PASS | Async expectations properly awaited |
| Simplicity & Types | WARN | Local variable `meta` has 4 anonymous fields; consider named `UserMeta` |
| Repo Standards | PASS | Conformed to strict typing rules |

**Result:** PASS (0 blocking errors, 1 non-blocking warning).
**Gates:** Skipped (passed in prior task verification).
```

---

## Example 3: Tautological Test Remediation

### The Problem: Mock Echo Chamber
```typescript
// BEFORE: Tests nothing about real functionality
it("returns the post by id", async () => {
  const fakePost = { id: "1", title: "Test" };
  mockRepo.findOne.mockResolvedValue(fakePost);

  const result = await postService.getPost("1");

  // This passes even if getPost() just blindly returns mockRepo.findOne() without authorization or data transformation
  expect(result).toEqual(fakePost);
  expect(mockRepo.findOne).toHaveBeenCalledWith("1");
});
```

### The Fix: Strengthen Assertion on Domain Transformations
Notice that driving through `mockRepo.findOne` is retained, but the assertion is strengthened to verify the actual domain rule (author initials enrichment and internal metadata stripping) rather than echoing the mock input.

```typescript
// AFTER: High-fidelity test verifying actual domain rules
it("enriches post with author initials and hides internal draft metadata", async () => {
  mockRepo.findOne.mockResolvedValue({
    id: "1",
    title: "Draft Announcement",
    authorName: "Marcus Smart",
    draftNotes: "Confidential internal note",
  });

  const result = await postService.getPost("1");

  expect(result).toEqual({
    id: "1",
    title: "Draft Announcement",
    authorInitials: "MS",
  });
  expect(result).not.toHaveProperty("draftNotes");
});
```

---

## Example 4: React Derived State Cleanup

### The Problem: Redundant State Synchronization
```tsx
// BEFORE: Extra render cycles, potential race conditions
function PlayerFilter({ players, searchQuery }: Props) {
  const [filtered, setFiltered] = useState<Player[]>([]);

  useEffect(() => {
    setFiltered(players.filter((p) => p.name.includes(searchQuery)));
  }, [players, searchQuery]);

  return <PlayerList players={filtered} />;
}
```

### The Fix: Compute Directly During Render
Behavior is strictly preserved (same matching behavior, no extra string manipulation), but eliminates redundant state and unnecessary useEffect synchronization.

```tsx
// AFTER: Computed during render; zero sync bugs, zero extra renders
function PlayerFilter({ players, searchQuery }: Props) {
  const filtered = players.filter((p) => p.name.includes(searchQuery));
  return <PlayerList players={filtered} />;
}
```

---

## Example 5: NestJS Fat Controller Refactoring

### The Problem: Controller Doing Database Queries & Invariant Checks
```typescript
// BEFORE: Fat controller mixing transport and persistence
@Controller("reports")
export class ReportsController {
  constructor(private readonly db: DatabaseService) {}

  @Post()
  async createReport(@Body() body: any) {
    if (!body.title) throw new BadRequestException("Missing title");
    const [report] = await this.db.drizzle.insert(reports).values(body).returning();
    return report;
  }
}
```

### The Fix: DTO Validation + Service Delegation
```typescript
// AFTER: Controller is purely a typed routing adapter
@ApiTags("Reports")
@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new scouting report" })
  async createReport(@Body() input: CreateReportInput): Promise<ReportResponse> {
    return this.reportsService.createReport(input);
  }
}
```

---

## Example 6: Anti-Slop & Concrete Type Remediation

### The Problem: Conditional Empty Spread + Anonymous Type Laundering
```typescript
// BEFORE: Anti-slop violation (conditional spread + type laundering)
function buildAuditLog(event: string, user: { id: string; meta?: any }) {
  const payload = {
    event,
    userId: user.id,
    ...(user.meta ? { metadata: user.meta } : {}),
  } as unknown as AuditLogRecord;
  return payload;
}
```

### The Fix: Concrete Domain Type + Direct Assignment
```typescript
// AFTER: Clear domain types, no empty spread, no type laundering
export interface UserMetadata {
  role: string;
  department: string;
}

export interface UserContext {
  id: string;
  meta?: UserMetadata;
}

export interface AuditLogRecord {
  event: string;
  userId: string;
  metadata?: UserMetadata;
}

function buildAuditLog(event: string, user: UserContext): AuditLogRecord {
  const payload: AuditLogRecord = user.meta
    ? { event, userId: user.id, metadata: user.meta }
    : { event, userId: user.id };
  return payload;
}
```

---

## Example 7: Tailwind CSS & Inline Style Remediation

### The Problem: Split-Brain Inline Styles + JIT Interpolation + Arbitrary Sprawl
```tsx
// BEFORE: Mixing inline style with className, broken JIT interpolation, arbitrary values
interface ProgressBarCardProps {
  title: string;
  progressPercent: number; // 0 to 100 continuous runtime value
  status: "success" | "warning" | "danger";
  className?: string;
}

export function ProgressBarCard({
  title,
  progressPercent,
  status,
  className,
}: ProgressBarCardProps) {
  // Anti-pattern 1: Broken dynamic interpolation (Tailwind JIT drops these)
  const statusColor = status === "success" ? "emerald" : status === "warning" ? "amber" : "rose";

  return (
    <div
      // Anti-pattern 2: Naive string concat without cn/twMerge
      // Anti-pattern 3: Arbitrary value soup (p-[17px], rounded-[11px])
      className={`flex flex-col border border-slate-200 shadow-sm p-[17px] rounded-[11px] ${className}`}
      // Anti-pattern 4: Mixing static layout/colors in style with Tailwind className
      style={{
        backgroundColor: "#ffffff",
        marginTop: "16px",
        width: "320px",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-slate-800">{title}</h3>
        {/* Broken class interpolation */}
        <span className={`text-xs font-medium text-${statusColor}-600`}>
          {status}
        </span>
      </div>

      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          // Anti-pattern 5: Attempting to dynamically interpolate runtime percentage into class name
          className={`h-full bg-${statusColor}-500 w-[${progressPercent}%]`}
        />
      </div>

      {/* Anti-pattern 6: Stripping outline with no accessible replacement */}
      <button
        type="button"
        className="mt-4 text-xs text-slate-500 outline-none hover:text-slate-700"
      >
        View details
      </button>
    </div>
  );
}
```

### The Fix: Clean Tailwind Tokens, `cn()`, Typed Mapping & Strict Runtime `style`
```tsx
// AFTER: Strict separation of concerns, complete literals, accessible focus
import { cn } from "@/lib/utils";

interface ProgressBarCardProps {
  title: string;
  progressPercent: number; // 0 to 100 continuous runtime value
  status: "success" | "warning" | "danger";
  className?: string;
}

// 1. Complete static literals in a typed lookup map (JIT safe)
const statusTextClasses: Record<ProgressBarCardProps["status"], string> = {
  success: "text-emerald-600",
  warning: "text-amber-600",
  danger: "text-rose-600",
};

const statusBarClasses: Record<ProgressBarCardProps["status"], string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
};

export function ProgressBarCard({
  title,
  progressPercent,
  status,
  className,
}: ProgressBarCardProps) {
  // Clamp percentage between 0 and 100 for safety
  const clampedProgress = Math.min(100, Math.max(0, progressPercent));

  return (
    <div
      // 2. Pure Tailwind utility classes with standard scale tokens (p-4, rounded-xl, w-80, mt-4)
      // 3. Conflict-safe merging using cn()
      className={cn(
        "flex flex-col w-80 mt-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-slate-800">{title}</h3>
        <span className={cn("text-xs font-medium", statusTextClasses[status])}>
          {status}
        </span>
      </div>

      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className={cn("h-full transition-all duration-300", statusBarClasses[status])}
          // 4. style is reserved EXCLUSIVELY for the continuous, unbounded runtime percentage
          style={{ width: `${clampedProgress}%` }}
        />
      </div>

      {/* 5. Accessible focus ring replaces stripped outline */}
      <button
        type="button"
        className="mt-4 text-xs text-slate-500 hover:text-slate-700 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
      >
        View details
      </button>
    </div>
  );
}
```

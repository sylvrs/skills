# React Technology Guide

This guide defines audit heuristics and refactoring patterns for React applications (SPA, Vite, Next.js client components).

---

## 1. Component Architecture & Hierarchy

### Component Placement Hierarchy
Place components at the most specific tier possible:
1. **Page-Local:** Built for a single view or route. Default home for new components.
2. **Shared:** Reused across 2+ pages; generic enough to adapt via props.
3. **Design System:** Primitive building blocks completely decoupled from domain logic.
- **Audit Rule:** Flag premature promotion to shared components before the Rule of Three. When a peer design system skill or UI package is present in the workspace, check against its component catalog before building custom UI primitives.

### Composition Over Configuration Props
- **Smell:** A mega-component with 20+ boolean flags (`isCompact`, `showFooter`, `hasSidebar`, `withBadge`).
- **Fix:** Use component composition with `children` or compound components (`<Card><Card.Header /><Card.Body /></Card>`).

---

## 2. State Management: Never Store What You Compute

### Anti-Pattern: Redundant Derived State
- **Smell:** Using `useState` + `useEffect` to synchronize a value calculated from existing props or state.
- **Fix:** Compute directly during render. Wrap with `useMemo` only when profiling or measurement demonstrates expensive recomputation.

```tsx
// BAD: Redundant state + extra render cycle
const [fullName, setFullName] = useState("");
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// GOOD: Computed during render
const fullName = `${firstName} ${lastName}`;
```

### Anti-Pattern: Prop-Synced Reset Effect
- **Smell:** Using `useEffect` to reset local form state when an ID prop changes (`useEffect(() => reset(), [userId])`).
- **Fix:** Use the React `key` prop on the component at the call site: `<UserForm key={userId} userId={userId} />`.

---

## 3. useEffect Discipline: The Escape Hatch

Effects are strictly for **synchronizing with external systems** (DOM observers, websockets, non-React widgets).

| Trigger | Proper Location | Anti-Pattern to Flag |
| --- | --- | --- |
| User interaction (click, submit) | Event handler (`onClick`, `onSubmit`) | Setting state in handler → triggering effect |
| Value derived from props/state | Compute during render | `useEffect` with `setState` |
| Reset local state on prop change | `key` prop at call site | `useEffect` resetting state |
| Notify parent of change | Call callback inside event handler | `useEffect` watching state to call `onChange` |
| Multi-step state chain (A → B → C) | Calculate all states in single handler | Chained `useEffect` calls |

---

## 4. Server State & Data Fetching

### Anti-Pattern: Manual `useEffect` Fetch Loops
- **Smell:** Hand-rolling fetch loops with `useState(data)`, `useState(loading)`, `useState(error)` inside `useEffect` without request cancellation, caching, or deduplication.
- **Fix:** Use TanStack Query (`useQuery`, `useInfiniteQuery`) or framework loaders.

### Proper UI State Handling
Render states deterministically:
```tsx
const { data, isLoading, error, refetch } = useQuery(...);

if (error) return <ErrorState error={error} onRetry={refetch} />;
if (isLoading && !data) return <LoadingSpinner />;
if (!data || data.length === 0) return <EmptyState />;
return <DataView data={data} />;
```

---

## 5. React Testing Library Fidelity

### Anti-Pattern: Testing Implementation Details & Hook Internals
- **Smell:** Testing state transitions by spying on internal component hooks or asserting on internal class names/DOM structure.
- **Fix:** Query exclusively by user-accessible roles, labels, and text using `@testing-library/react` and `@testing-library/user-event`:

```tsx
// BAD: Implementation detail
expect(wrapper.find("button.submit-btn-active")).toHaveLength(1);

// GOOD: Observable user interaction
const submitButton = screen.getByRole("button", { name: /save changes/i });
await userEvent.click(submitButton);
expect(await screen.findByRole("status")).toHaveTextContent(/changes saved/i);
```

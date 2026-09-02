# Tailwind CSS Technology Guide

This guide defines audit heuristics, anti-patterns, and refactoring patterns for codebases using Tailwind CSS (v3 and v4) with modern UI component frameworks (React, Next.js, Vite).

---

## 1. The Style vs. ClassName Schism (Mixing Inline Styles & Tailwind)

### The Core Anti-Pattern
Applying styling both through `className="..."` (Tailwind utility classes) AND `style={{ /* ... */ }}` (inline CSS) on the same element:

```tsx
// BAD: Split-brain styling with colliding paradigms
<div
  className="flex flex-col text-sm text-slate-700"
  style={{
    backgroundColor: "#ffffff",
    padding: "16px",
    display: "flex",
    marginTop: "20px",
  }}
>
  ...
</div>
```

### Why It Hurts
1. **Specificity Hijacking:** Inline styles carry an immutable CSS specificity (`1-0-0-0`), overriding utility classes (`0-0-1-0`). Any utility class targeting the same property becomes dead, confusing code.
2. **Cognitive Friction (Split Brain):** Developers must inspect two separate attributes across two mental models to deduce how an element renders.
3. **Broken Responsive & Pseudo States:** Inline styles cannot respond to media queries (`md:`, `lg:`) or interactive states (`hover:`, `focus:`, `dark:`). Once a property is put in `style`, responsive adaptation breaks.

### The Iron Law of Inline `style`
> **Inline `style` is an escape hatch reserved EXCLUSIVELY for unbounded, continuous runtime values that cannot exist as design tokens.**

| Styling Need | Proper Mechanism | Anti-Pattern |
| --- | --- | --- |
| Static layout, sizing, typography, colors, borders | Tailwind `className` (`p-4 bg-white text-base`) | Inline `style={{ padding: 16 }}` |
| Continuous runtime percentages / coordinates | Inline `style={{ width: `${percent}%`, left: `${x}px` }}` | Dynamically constructing `w-[${percent}%]` |
| Dynamic user-selected colors from API / color picker | Inline `style={{ backgroundColor: userColor }}` | Constructing `bg-[#${hex}]` at runtime |
| Dynamic CSS Custom Property injection | Inline `style={{ '--custom-offset': `${offset}px` }}` | Hardcoding arbitrary values in classes |
| Breakpoints & interactive states | Tailwind variants (`hover:bg-blue-600 md:flex`) | JavaScript listeners toggling inline `style` |

### Audit Heuristic: Property Collision
Flag any element where a property declared in `style={{ ... }}` duplicates or overrides a property governed by a class in `className` (e.g., `className="p-4" style={{ padding: '12px' }}`).

---

## 2. Dynamic Class Construction & JIT Static Analysis

### The Anti-Pattern: String Interpolation of Class Names
```tsx
// BROKEN: Silently fails in production JIT
<div className={`text-${color}-600 p-${spacing} bg-${variant}-100`} />
```

### Why It Hurts
Tailwind's compiler parses source files as plain text via static regex patterns. It does **not** evaluate runtime JavaScript. Interpolated tokens like `text-${color}-600` are never detected during build time, meaning their corresponding CSS rules are never generated. The styles fail silently in production.

### The Remedy: Complete Static Literals & Mapping Tables
Always ensure the complete, unbroken class name literal appears in the source code.

```tsx
// GOOD: Typed lookup map with complete literals
const statusBadgeClasses: Record<Status, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  failed: "bg-rose-50 text-rose-700 border-rose-200",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs border", statusBadgeClasses[status])}>
      {status}
    </span>
  );
}
```

---

## 3. Design Tokens vs. Arbitrary Value Sprawl

### The Anti-Pattern: Defaulting to Bracket Syntax Arbitrary Values
```tsx
// BAD: Arbitrary value soup opting out of design system
<div className="w-[342px] p-[17px] text-[#1e293b] rounded-[11px] mt-[23px]">
```

### Why It Hurts
1. **Destroys Visual Rhythm:** Replaces purposeful scales (multiples of 4px) with unmaintainable magic numbers.
2. **Duplication & Drift:** Three developers end up writing `p-[17px]`, `p-[18px]`, and `p-[16px]` for what was intended to be identical card padding.
3. **Hard to Theme:** Raw hex codes like `text-[#1e293b]` bypass dark mode and theme swaps.

### The Remedy: Snap to Scale or Promote to Theme
1. **Snap to scale:** `p-[17px]` $\rightarrow$ `p-4` (16px) or `p-5` (20px); `rounded-[11px]` $\rightarrow$ `rounded-xl` (12px); `text-[#1e293b]` $\rightarrow$ `text-slate-800`.
2. **Promote repeated tokens to `@theme` / `tailwind.config`:** If a non-standard value is part of the approved design language, define it in the theme config rather than repeating brackets across 10 files.
3. **Legitimate Arbitrary Values:** Reserve bracket syntax strictly for external fixed constraints:
   - Complex grid templates: `grid-cols-[240px_1fr]`
   - Viewport calculations: `min-h-[calc(100vh-4rem)]`
   - Fixed third-party integrations: `w-[320px]` (e.g. standard ad slot or embed)

---

## 4. Class Composition & Conflict Resolution (cn / twMerge)

### The Anti-Pattern: Naive String Concatenation for Overrides
```tsx
// BAD: Naive template literal merging
function Button({ className, variant, children }: ButtonProps) {
  return (
    <button className={`px-4 py-2 bg-blue-600 text-white rounded ${className}`}>
      {children}
    </button>
  );
}
```

### Why It Hurts
In CSS, specificity and stylesheet declaration order determine which class wins—**not the order strings appear in `class="..."`**.
If a caller writes `<Button className="px-6 bg-red-500" />`, both `px-4` and `px-6` appear in the DOM. Because `px-4` and `px-6` have the exact same specificity (`0-0-1-0`), the browser picks whichever rule happens to be declared later in the compiled CSS stylesheet.

### The Remedy: Use `cn()` (`clsx` + `tailwind-merge`)
```tsx
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// GOOD: tailwind-merge resolves conflicting classes predictably
function Button({ className, children }: ButtonProps) {
  return (
    <button className={cn("px-4 py-2 bg-blue-600 text-white rounded", className)}>
      {children}
    </button>
  );
}
```

### Counter-Smell: Unnecessary `cn()` Wrapping
Do not wrap simple, static, unconditional class strings with `cn`:
```tsx
// BAD: Pointless abstraction & runtime cost
<div className={cn("flex items-center gap-2")} />

// GOOD: Direct static string literal
<div className="flex items-center gap-2" />
```

---

## 5. @apply Abuse & Zombie CSS Classes

### The Anti-Pattern: Monolithic BEM Classes via `@apply`
```css
/* BAD: Recreating monolithic CSS stylesheets with @apply */
.dashboard-widget-header {
  @apply flex items-center justify-between p-4 bg-white border-b border-slate-200 text-lg font-semibold;
}
```

### Why It Hurts
1. **Reinvents Monolithic CSS:** Reintroduces stylesheet bloat, cross-file indirection, and CSS specificity debugging.
2. **Loss of Co-location:** You must switch between TSX and CSS files to understand or modify layout.
3. **Component Duplication:** In React, the component is the abstraction (`<WidgetHeader />`), not a CSS class.

### The Remedy: Keep Utilities in Component Markup
Reserve `@apply` exclusively for styling elements you cannot directly edit (e.g. rich-text markdown rendered via CMS into a `.prose` container, or global CSS resets).

---

## 6. Accessibility & State Invariants

### The Anti-Pattern: Focus Outline Suppression
```tsx
// BAD: Accessible focus ring stripped
<button className="outline-none focus:outline-none bg-blue-600 ...">
```

### The Remedy: Always Provide `focus-visible` Rings
```tsx
// GOOD: Keyboard navigation gets visible, accessible ring
<button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 bg-blue-600 ...">
```

### Breakpoint Discipline: Mobile-First
Tailwind breakpoints (`sm:`, `md:`, `lg:`) are `min-width` queries. Always define mobile styles first, then layer breakpoint overrides:
```tsx
// BAD: Thinking desktop-first
<div className="flex-row md:flex-col" />

// GOOD: Mobile-first default, expanding at breakpoint
<div className="flex flex-col md:flex-row" />
```

---

## 7. Specificity Battles & The !important Anti-Pattern

### The Anti-Pattern: Brute-Forcing with `!`
```tsx
// BAD: Using !important to overpower competing styles
<div className="!p-4 !bg-white !text-slate-900" />
```

### Why It Hurts
Scattering `!` across markup signals an unmanaged specificity collision or improper class merging. It triggers an escalation cycle where future overrides also require `!important`.

### The Remedy
Remove conflicting inline `style`, delete competing legacy stylesheets, or route conflicting classes through `tailwind-merge` (`cn`).

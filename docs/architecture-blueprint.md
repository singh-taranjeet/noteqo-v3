# Noteqo Architecture Blueprint

> **Authoritative source of truth** for file organisation, naming conventions, typing rules, and coding patterns.
> Every contributor and AI assistant **must** read this before writing code.

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Project Structure](#2-project-structure)
3. [Feature-First Organisation](#3-feature-first-organisation)
4. [File Naming Conventions](#4-file-naming-conventions)
5. [Variable & Symbol Naming](#5-variable--symbol-naming)
6. [Component Rules](#6-component-rules)
7. [Hooks Rules](#7-hooks-rules)
8. [Services Rules](#8-services-rules)
9. [Constants Rules](#9-constants-rules)
10. [Types Rules](#10-types-rules)
11. [Barrel Exports (index.ts)](#11-barrel-exports-indexts)
12. [Import Rules](#12-import-rules)
13. [Styling Rules](#13-styling-rules)
14. [State Management](#14-state-management)
15. [Error Handling](#15-error-handling)
16. [Testing Conventions](#16-testing-conventions)
17. [Performance Best Practices](#17-performance-best-practices)
18. [Git & Code Review Standards](#18-git--code-review-standards)
19. [Quick-Reference Cheat Sheet](#19-quick-reference-cheat-sheet)

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vite + React 19 |
| Language | TypeScript (strict mode) |
| Routing | React Router v6 (`createBrowserRouter`) |
| Server state | TanStack React Query v5 |
| UI primitives | Radix UI / shadcn |
| Styling | Tailwind CSS + SCSS modules where needed |
| Backend | NestJS (monorepo sibling `backend/`) |
| Storage | IndexedDB (Dexie), Vercel Blob |
| Realtime | SSE + WebSockets (Yjs CRDT) |
| Rich text | TipTap v3 |

---

## 2. Project Structure

```
noteqo-v3/
├── backend/                  # NestJS API (feature-module pattern)
├── docs/                     # Architecture docs (this file)
├── frontend/
│   └── src/
│       ├── components/       # Shared, app-wide components
│       │   ├── core/         #   Shell, Header, Sidebar (app chrome)
│       │   ├── ui/           #   Design-system primitives (shadcn)
│       │   └── Providers/    #   Global context providers
│       ├── constants/        # Global app-wide constants
│       ├── data/             # Static data / seed data
│       ├── features/         # ★ Feature modules (see §3)
│       ├── hooks/            # Global reusable hooks
│       ├── layouts/          # Route layout wrappers
│       ├── lib/              # Pure utility functions
│       ├── services/         # Global services (API client)
│       ├── styles/           # Global CSS / SCSS
│       ├── types/            # Global shared types
│       ├── main.tsx          # App entry point
│       ├── routes.tsx        # Route definitions
│       └── sw.ts             # Service worker
└── gemini.md                 # AI assistant rules
```

### Where things go — decision tree

```
Is it used by ≥ 2 features?
  ├── YES → src/components/ui/     (if UI primitive)
  │         src/components/core/   (if app-chrome component)
  │         src/hooks/             (if hook)
  │         src/services/          (if service)
  │         src/types/             (if type)
  │         src/constants/         (if constant)
  │         src/lib/               (if pure utility function)
  └── NO  → src/features/<feature>/  (co-located inside the feature)
```

---

## 3. Feature-First Organisation

Every domain lives under `src/features/<feature-name>/`. Features are **self-contained modules** with a consistent internal structure:

```
features/
└── <feature-name>/
    ├── components/           # React components (one per file)
    │   └── SubComponent/     # Complex components get a folder
    │       ├── SubComponent.tsx
    │       └── SubComponentItem.tsx
    ├── constants/            # Feature-scoped constants
    │   └── <feature>.constants.ts
    ├── hooks/                # Feature-scoped hooks
    │   └── use<HookName>.ts
    ├── services/             # API calls, business logic
    │   └── <domain>[-qualifier].service.ts
    ├── types/                # Feature-scoped types
    │   └── <domain>.types.ts
    ├── utils/                # Feature-scoped pure helpers
    │   └── <domain>.utils.ts
    └── index.ts              # ★ Public API (barrel export)
```

### Rules

| Rule | Rationale |
|---|---|
| **Co-location**: Place hooks, types, utils where they are used | Keeps cognitive load low; no hunting across directories |
| **Single responsibility**: One component per file, one hook per file | Easy to find, easy to test, easy to review |
| **Promote when shared**: Only move to global `src/` when ≥ 2 features depend on it | Prevents premature abstraction |
| **Feature isolation**: Features never import from another feature's internals | Always import from a feature's `index.ts` |

---

## 4. File Naming Conventions

### Summary Table

| Category | Pattern | Example |
|---|---|---|
| **Component** | `PascalCase.tsx` | `CollaborationAvatars.tsx` |
| **Component folder** | `PascalCase/` | `DashboardView/DashboardView.tsx` |
| **Hook** | `use<Name>.ts` | `useNoteEditorLogic.ts` |
| **Service** | `<domain>[-qualifier].service.ts` | `note-api.service.ts` |
| **Constants** | `<domain>.constants.ts` | `auth.constants.ts` |
| **Types** | `<domain>.types.ts` | `workspace.types.ts` |
| **Utils** | `<domain>.utils.ts` | `editor.utils.ts` |
| **Layout** | `<Name>Layout.tsx` | `AuthLayout.tsx` |
| **Barrel** | `index.ts` | `index.ts` |
| **Style (module)** | `<Component>.module.scss` | `NoteEditor.module.scss` |
| **Style (global)** | `kebab-case.scss` | `theme-variables.scss` |
| **Test** | `<source-file>.test.ts(x)` | `useLogin.test.ts` |

### Detailed Rules

1. **Components** use `PascalCase` because they are React components (JSX).
2. **Hooks, services, types, constants, utils** use `camelCase` or `kebab-case` with a **dot-suffix** identifying the category (e.g. `.service.ts`, `.types.ts`).
3. **No generic names**. Avoid `helpers.ts`, `utils.ts` (bare), `types.ts` (bare), or `misc.ts`. Always prefix with the domain: `crypto.utils.ts`, `editor.types.ts`.
4. **Multi-word kebab-case** for compound service names: `note-api.service.ts`, `note-sync-queue.service.ts`, `space-local-storage.service.ts`.
5. **Hook files** always start with `use` (lowercase): `useCreateNote.ts`.
6. **One barrel `index.ts` per feature** — never per sub-folder. Deep sub-folders do not get their own barrels.

---

## 5. Variable & Symbol Naming

### Quick Reference

| Symbol | Convention | Example |
|---|---|---|
| **Component** | `PascalCase` (named export) | `export function CollaborationAvatars()` |
| **Hook** | `camelCase` starting with `use` | `export function useCreateNote()` |
| **Constant (app config)** | `UPPER_SNAKE_CASE` | `export const API_BASE_URL = …` |
| **Constant object** | `UPPER_SNAKE_CASE` key, `UPPER_SNAKE_CASE` inner keys | `EDITOR_CONFIG.AUTOSAVE_DEBOUNCE_MS` |
| **Enum-like const** | `UPPER_SNAKE_CASE` | `export const STORAGE_KEYS = { … } as const` |
| **Type / Interface** | `PascalCase` | `interface RegisterRequestPayload` |
| **Type (union/alias)** | `PascalCase` | `type NoteType = "private" \| "shared"` |
| **Props interface** | `<ComponentName>Props` | `interface CollaborationAvatarsProps` |
| **Service instance** | `camelCase` | `export const noteService = { … }` |
| **Service class** | `PascalCase` | `export class KeysService` |
| **Function** | `camelCase` | `function getInitials(name: string)` |
| **Boolean variable** | `is/has/should/can` prefix | `isFavorite`, `hasAccess`, `shouldAutoSave` |
| **Event handler prop** | `on<Event>` | `onSave`, `onClose`, `onNoteSelect` |
| **Callback prop** | `on<Action>` or `handle<Action>` | `onDelete`, `handleSubmit` |
| **Array / collection** | Plural noun | `users`, `noteIds`, `visibleUsers` |
| **Single item** | Singular noun | `user`, `noteId`, `currentNote` |
| **CSS class (Tailwind)** | As-is from Tailwind | `className="flex items-center gap-2"` |
| **CSS class (custom)** | `kebab-case` | `.editor-container` |
| **Env variable** | `VITE_<NAME>` | `VITE_API_URL` |

### Anti-Patterns (Never Do)

```typescript
// ❌ BAD: Magic numbers inline
if (password.length < 8) { … }

// ✅ GOOD: Named constant
if (password.length < AUTH_CONFIG.MIN_PASSWORD_LENGTH) { … }

// ❌ BAD: Unclear abbreviations
const ns = noteService;
const cb = () => {};

// ✅ GOOD: Descriptive names
const noteApiService = noteService;
const handleSave = () => {};

// ❌ BAD: Hungarian notation or type prefixes
const strName = "hello";
const IUser = { … };      // Don't prefix interfaces with "I"

// ✅ GOOD: Clean names
const name = "hello";
interface User { … }

// ❌ BAD: default export
export default function MyComponent() { … }

// ✅ GOOD: named export
export function MyComponent() { … }
```

---

## 6. Component Rules

### 6.1 One component per file

Each `.tsx` file exports **exactly one** React component. Small helper components used only inside that component (e.g. a list-item renderer) are defined as **private functions** in the same file (not exported).

### 6.2 Named exports only

```typescript
// ✅ GOOD
export function DashboardView() { … }

// ❌ BAD — no default exports for components
export default function DashboardView() { … }
```

### 6.3 Props typing

```typescript
// Define props interface directly above the component
interface NoteCardProps {
  note: Note;
  onSelect: (noteId: string) => void;
  isActive?: boolean;
}

// Use Readonly wrapper for safety
export function NoteCard({ note, onSelect, isActive = false }: Readonly<NoteCardProps>) { … }
```

### 6.4 Component folder pattern

When a component has **multiple sub-components that only serve it**, create a folder:

```
components/
└── DashboardView/
    ├── DashboardView.tsx         # Main component (export from index.ts)
    ├── DashboardStatsCard.tsx    # Sub-component
    └── DashboardNoteGrid.tsx     # Sub-component
```

### 6.5 `"use client"` directive

For Vite/SPA this is informational. Add `"use client"` at the top of files that **require browser-only APIs** (e.g. `useEffect`, event handlers, `window` access). This future-proofs for potential SSR migration and clearly signals interactivity.

### 6.6 Component size guideline

If a component exceeds **~250 lines**, extract sub-components or logic into hooks. Components should be primarily **declarative JSX** with minimal inline logic.

---

## 7. Hooks Rules

### 7.1 Naming

Always prefix with `use`. The name should describe **what the hook provides**, not how:

```typescript
// ✅ GOOD — describes the capability
useCreateNote()
useVersionHistory()
useRealtimeConnection()

// ❌ BAD — describes implementation
useFetchAndDecryptAndSaveNote()
useWebSocketSetup()
```

### 7.2 File naming

One hook per file: `use<HookName>.ts` (not `.tsx` unless it returns JSX, which is rare).

### 7.3 Return type

Always explicitly type the return value:

```typescript
interface UseCreateNoteReturn {
  createNote: (title: string) => Promise<Note>;
  isCreating: boolean;
  error: Error | null;
}

export function useCreateNote(): UseCreateNoteReturn { … }
```

### 7.4 Co-location

| Scope | Location |
|---|---|
| Used by one feature | `features/<feature>/hooks/` |
| Used by ≥ 2 features | `src/hooks/` |

### 7.5 Composition over size

If a hook exceeds **~100 lines**, decompose into smaller hooks. `useNoteEditorLogic` is acceptable as a composition root that orchestrates smaller hooks.

---

## 8. Services Rules

### 8.1 Pattern

Services encapsulate **data-fetching, business logic, and side effects**. They come in two flavours:

| Style | When to use | Example |
|---|---|---|
| **Object literal** | Stateless, pure function bag | `export const noteService = { getById, create, … }` |
| **Class (static methods)** | Needs encapsulation or complex init | `export class KeysService { static async clear() { … } }` |

### 8.2 File naming

```
<domain>.service.ts             # Primary service
<domain>-<qualifier>.service.ts # Variant (note-api.service.ts, note-local.service.ts)
```

### 8.3 Layering

```
Component → Hook → Service → API Client (apiClient)
```

- Components never call services directly. Always go through a hook.
- Hooks orchestrate one or more services.
- Services call `apiClient` for HTTP, or Dexie for IndexedDB.

### 8.4 Error handling

Services throw typed errors (e.g. `ApiError`). Hooks catch and surface errors to components via return values — never via `console.error` and swallow.

---

## 9. Constants Rules

### 9.1 Naming

All constant values use `UPPER_SNAKE_CASE`:

```typescript
export const AUTH_CONFIG = {
  MIN_PASSWORD_LENGTH: 8,
  RECOVERY_FILE_NAME: "noteqo-recovery.txt",
} as const;

export const AUTH_API_ROUTES = {
  REGISTER: "/auth/register",
  LOGIN: "/auth/login",
} as const;
```

### 9.2 Always `as const`

Use `as const` assertion on constant objects to get literal types:

```typescript
// ✅ GOOD — infers literal types
export const ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
} as const;

// ❌ BAD — widens to string
export const ROUTES = {
  LOGIN: "/login",    // type: string
};
```

### 9.3 File naming

```
<domain>.constants.ts
```

### 9.4 No magic numbers

Every numeric or string literal that has semantic meaning must be a named constant:

```typescript
// ❌ BAD
setTimeout(fn, 1500);

// ✅ GOOD
setTimeout(fn, EDITOR_CONFIG.AUTOSAVE_DEBOUNCE_MS);
```

### 9.5 Component-scoped constants

Constants used in **exactly one component** can be defined at the top of the component file (above the component function):

```typescript
/** Maximum avatars to display before showing a "+N" count */
const MAX_VISIBLE_AVATARS = 4;

export function CollaborationAvatars() { … }
```

---

## 10. Types Rules

### 10.1 `interface` vs `type`

| Use `interface` when… | Use `type` when… |
|---|---|
| Defining an object shape | Creating a union, intersection, or mapped type |
| Props, API payloads, entities | `type NoteType = "private" \| "shared"` |
| You want declaration merging | You need conditional types or template literals |

### 10.2 File naming

```
<domain>.types.ts
```

### 10.3 Import style

Always use `import type` for type-only imports:

```typescript
import type { Note, NoteType } from "@/features/workspace";
```

### 10.4 No `any`

**Never** use `any`. Use `unknown` and narrow, or define a proper type:

```typescript
// ❌ BAD
const data: any = await response.json();

// ✅ GOOD
const data: unknown = await response.json();
// or
const data = await response.json() as LoginResponse;
```

### 10.5 Utility types

Prefer TypeScript built-in utility types:

```typescript
Partial<Note>
Pick<Note, "id" | "title">
Omit<Note, "content">
Readonly<CollaborationAvatarsProps>
Record<string, unknown>
```

### 10.6 Export types from barrel

All publicly consumed types must be re-exported from the feature's `index.ts`:

```typescript
// features/workspace/index.ts
export type { Note, NoteType, RemoteNoteVersion } from "./types/workspace.types";
```

---

## 11. Barrel Exports (`index.ts`)

### 11.1 Purpose

The `index.ts` at the root of each feature is the **public API**. External consumers import from here only.

### 11.2 Format

Group exports by category with comments:

```typescript
// features/auth/index.ts

// Components
export { AuthGuard } from "./components/AuthGuard";
export { LoginForm } from "./components/LoginForm";

// Constants
export { AUTH_CONFIG, AUTH_API_ROUTES } from "./constants/auth.constants";

// Hooks
export { useLogin } from "./hooks/useLogin";

// Services
export { authService } from "./services/auth.service";

// Types
export type { User, AuthResponse } from "./types/auth.types";
```

### 11.3 Rules

- **Named exports only** — no `export *` (to keep the public API explicit and tree-shakeable). Exception: `export *` is acceptable for type-only re-exports.
- **Types use `export type`** — ensures they are erased at compile time.
- **No logic** in `index.ts` — only re-exports.
- **Only one `index.ts` per feature** — sub-folders (`components/`, `hooks/`, etc.) do NOT get their own barrel files.

---

## 12. Import Rules

### 12.1 Path aliases

Always use the `@/` alias for imports from `src/`:

```typescript
// ✅ GOOD
import { useCreateNote } from "@/features/workspace";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/services";

// ❌ BAD — deep relative paths
import { useCreateNote } from "../../workspace/hooks/useCreateNote";
```

### 12.2 Never reach into a feature

```typescript
// ❌ BAD — importing from feature internals
import { useCreateNote } from "@/features/workspace/hooks/useCreateNote";

// ✅ GOOD — import from the barrel
import { useCreateNote } from "@/features/workspace";
```

### 12.3 Import ordering

Organise imports in this order (auto-sorted by ESLint/Prettier):

```typescript
// 1. React / framework
import { useState, useMemo } from "react";

// 2. Third-party libraries
import { useQuery } from "@tanstack/react-query";
import { Wifi, WifiOff } from "lucide-react";

// 3. Internal aliases — components, features
import { Button } from "@/components/ui/button";
import { useCreateNote } from "@/features/workspace";

// 4. Relative imports (same feature)
import { EDITOR_CONFIG } from "../constants/editor.constants";
import type { EditorState } from "../types/editor.types";
```

### 12.4 `import type`

Always use `import type` when importing only types:

```typescript
import type { Note } from "@/features/workspace";
```

---

## 13. Styling Rules

### 13.1 Tailwind first

Use Tailwind utility classes as the primary styling method. Avoid writing custom CSS unless:
- You need complex animations.
- You need variables that Tailwind doesn't expose.
- You need `:has()`, `:nth-child`, or other advanced selectors.

### 13.2 SCSS modules for complex components

When custom CSS is needed, use SCSS modules:

```
NoteEditor.module.scss   → imported as styles
```

```typescript
import styles from "./NoteEditor.module.scss";
<div className={styles.editorContainer}>
```

### 13.3 No inline styles

Avoid the `style` prop unless dynamically computed (e.g. user-selected colour):

```typescript
// ✅ OK — dynamic value
<div style={{ backgroundColor: user.color }} />

// ❌ BAD — static styling in style prop
<div style={{ display: "flex", gap: 8 }} />
```

### 13.4 Design tokens

Use CSS custom properties / Tailwind theme for colours, spacing, and typography. Never hard-code hex values:

```css
/* ✅ GOOD */
color: var(--foreground);
color: hsl(var(--primary));

/* ❌ BAD */
color: #1a1a2e;
```

---

## 14. State Management

### 14.1 Hierarchy of state

Choose the **simplest** option that works:

| Kind | Tool | When |
|---|---|---|
| Local UI state | `useState` / `useReducer` | Toggle, form inputs, visibility |
| Derived state | `useMemo` | Computed from other state |
| Server state | TanStack React Query | Any data fetched from the API |
| Cross-component | React Context | Theme, auth, sidebar state |
| Complex shared | Zustand (if needed) | Global UI state shared widely |
| Persistent | IndexedDB (Dexie) | Offline data, encrypted notes |

### 14.2 React Query conventions

```typescript
// Query key factory per feature
export const workspaceKeys = {
  all: ["workspace"] as const,
  notes: () => [...workspaceKeys.all, "notes"] as const,
  note: (id: string) => [...workspaceKeys.notes(), id] as const,
};

// Hook wrapping the query
export function useNote(noteId: string) {
  return useQuery({
    queryKey: workspaceKeys.note(noteId),
    queryFn: () => noteService.getById(noteId),
    enabled: Boolean(noteId),
  });
}
```

### 14.3 No prop drilling beyond 2 levels

If a prop passes through more than 2 intermediary components, use **Context** or **composition** (render props / children).

---

## 15. Error Handling

### 15.1 Typed errors

Use the `ApiError` class for HTTP errors:

```typescript
export class ApiError extends Error {
  public readonly status: number;
  public readonly body: Record<string, unknown> | null;
}
```

### 15.2 Error boundaries

Wrap route-level components with React Error Boundaries (`RootError`). Feature-level error boundaries are used for isolated feature failures.

### 15.3 Never swallow errors

```typescript
// ❌ BAD
try { await save(); } catch { /* silence */ }

// ✅ GOOD
try { await save(); } catch (error) {
  console.error("[NoteService] Save failed:", error);
  throw error; // or surface to the user
}
```

---

## 16. Testing Conventions

### 16.1 File placement

Test files live **next to the source file** they test:

```
hooks/
├── useCreateNote.ts
└── useCreateNote.test.ts
```

### 16.2 Naming

```
<source-file>.test.ts      # Unit tests
<source-file>.test.tsx      # Component tests
<feature>.e2e.test.ts       # End-to-end tests
```

### 16.3 Test structure

```typescript
describe("useCreateNote", () => {
  it("should create a note with the given title", async () => { … });
  it("should throw when offline", async () => { … });
});
```

---

## 17. Performance Best Practices

| Practice | Details |
|---|---|
| **Memoize expensive computations** | Use `useMemo` / `useCallback` for derived data and stable references |
| **Lazy load heavy features** | Use `React.lazy()` + `Suspense` for routes and heavy components (e.g. `DynamicNoteEditor`) |
| **Virtualise long lists** | Use `react-window` or `@tanstack/react-virtual` for 100+ item lists |
| **Debounce user input** | Auto-save, search — use `lodash.debounce` with `EDITOR_CONFIG.AUTOSAVE_DEBOUNCE_MS` |
| **Image optimisation** | Use `loading="lazy"`, `fetchpriority`, and appropriately sized images |
| **Bundle awareness** | Keep feature code co-located so Vite can code-split per route |
| **Avoid re-renders** | Extract `"use client"` interactive bits into leaf components; keep parent components static |

---

## 18. Git & Code Review Standards

### 18.1 Commit messages

Use **Conventional Commits**:

```
feat(editor): add version history dialog
fix(auth): handle expired token redirect
refactor(workspace): extract note table to feature
chore(deps): bump tiptap to v3.23
docs: update architecture blueprint
```

### 18.2 Branch naming

```
feat/<short-description>
fix/<short-description>
refactor/<short-description>
chore/<short-description>
```

### 18.3 PR checklist

- [ ] No `any` types added
- [ ] No magic numbers added
- [ ] Named exports used (no default exports)
- [ ] New feature files follow naming conventions
- [ ] Public API exported via feature `index.ts`
- [ ] No cross-feature internal imports
- [ ] Tests added for new hooks/services

---

## 19. Quick-Reference Cheat Sheet

### File naming at a glance

```
PascalCase.tsx               → Components
use<Name>.ts                 → Hooks
<domain>.service.ts          → Services
<domain>.constants.ts        → Constants
<domain>.types.ts            → Types
<domain>.utils.ts            → Utilities
<Name>Layout.tsx             → Layouts
<source>.test.ts(x)          → Tests
<Component>.module.scss      → Style modules
index.ts                     → Barrel exports
```

### Symbol naming at a glance

```
PascalCase      → Components, Types, Interfaces, Classes
camelCase       → functions, hooks, variables, service instances
UPPER_SNAKE     → constants, env vars, config keys
kebab-case      → CSS classes, multi-word file names (services)
use*            → hooks
on*/handle*     → event handlers
is/has/should   → booleans
```

### Absolute don'ts

| Rule | Why |
|---|---|
| `export default` | Harder to refactor, inconsistent imports |
| `any` type | Type safety is non-negotiable |
| Magic numbers | Unreadable, unmaintainable |
| Bare `utils.ts` / `types.ts` | Undiscoverable — always domain-prefix |
| Import from feature internals | Breaks encapsulation |
| `console.log` in production code | Use the `logService` or remove |
| Inline `style={}` for static values | Use Tailwind or CSS modules |
| Multiple components in one file | One component = one file |
| `index.ts` inside sub-folders | Only at feature root |

---

*Last updated: May 2025*

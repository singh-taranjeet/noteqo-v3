# Next.js Architecture Blueprint
### Standards, Rules & Patterns for Scalable Applications (2025)

---

## Table of Contents

1. [Core Principles](#core-principles)
2. [Project File Structure](#project-file-structure)
3. [Routing & App Directory](#routing--app-directory)
4. [Component Architecture](#component-architecture)
5. [Hooks](#hooks)
6. [Types & Interfaces](#types--interfaces)
7. [Constants & Configuration](#constants--configuration)
8. [Services & API Layer](#services--api-layer)
9. [State Management](#state-management)
10. [Form Handling & Validation](#form-handling--validation)
11. [Error Handling](#error-handling)
12. [Performance & Optimization](#performance--optimization)
13. [Responsive & Mobile-First Design](#responsive--mobile-first-design)
14. [Accessibility](#accessibility)
15. [Naming Conventions](#naming-conventions)
16. [Import Rules](#import-rules)
17. [Utilities](#utilities)
18. [Code Quality & Linting](#code-quality--linting)
19. [Testing](#testing)
20. [Quick Reference Card](#quick-reference-card)

---

## Core Principles

1. **Colocation over distance** — Keep related code close. A hook used only by one component lives next to that component, not in a global `hooks/` folder.
2. **Feature-first organisation** — Group by domain/feature, not by file type.
3. **Explicit over implicit** — Avoid magic. Name things clearly. Make dependencies obvious.
4. **Server by default** — All components are React Server Components (RSC) unless they need interactivity (`'use client'`). Push `'use client'` to the deepest leaf component possible.
5. **Single responsibility** — Each file does one thing. No God files.
6. **Consistency** — A new developer should be able to find any file within 10 seconds.
7. **Max nesting depth: 4 levels** — `a/b/c/d/` is the limit. Flatten or reconsider feature boundaries beyond this.

---

## Project File Structure

```
my-app/
├── public/                         # Static assets (images, fonts, favicons)
│   └── images/
│
├── src/
│   ├── app/                        # Next.js App Router (routes only)
│   │   ├── (auth)/                 # Route group — no URL segment
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (marketing)/
│   │   │   └── about/
│   │   │       └── page.tsx
│   │   ├── dashboard/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   ├── error.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   ├── api/                    # Route handlers
│   │   │   └── users/
│   │   │       └── route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx              # Root layout
│   │   └── not-found.tsx
│   │
│   ├── components/                 # Shared, reusable components
│   │   ├── ui/                     # Layer 1: Primitive/design-system (Button, Input, Modal)
│   │   │   ├── Button/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── Button.tsx
│   │   │   │   └── Button.test.tsx
│   │   │   └── index.ts            # Barrel export
│   │   └── layout/                 # Layer 2: Structural (Header, Sidebar, Footer)
│   │       ├── Header/
│   │       ├── Footer/
│   │       ├── Sidebar/
│   │       └── index.ts
│   │
│   ├── features/                   # Layer 3: Domain-specific feature modules
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── LoginForm/
│   │   │   │   │   ├── index.tsx
│   │   │   │   │   └── LoginForm.tsx
│   │   │   │   └── AuthGuard.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   ├── services/
│   │   │   │   └── auth.service.ts
│   │   │   ├── types/
│   │   │   │   └── auth.types.ts
│   │   │   ├── constants/
│   │   │   │   └── auth.constants.ts
│   │   │   └── index.ts            # Public API of this feature
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   └── users/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── services/
│   │       ├── types/
│   │       └── index.ts
│   │
│   ├── hooks/                      # Global, reusable hooks only
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useMediaQuery.ts
│   │   └── index.ts
│   │
│   ├── lib/                        # Third-party library configs & wrappers
│   │   ├── axios.ts
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── env.ts                  # Validated environment variables
│   │   └── stripe.ts
│   │
│   ├── services/                   # Global API service layer
│   │   ├── api.ts
│   │   └── index.ts
│   │
│   ├── store/                      # Global state (Zustand)
│   │   ├── useAppStore.ts
│   │   └── slices/
│   │       ├── uiSlice.ts
│   │       └── userSlice.ts
│   │
│   ├── types/                      # Global shared types
│   │   ├── api.types.ts
│   │   ├── common.types.ts
│   │   └── index.ts
│   │
│   ├── constants/                  # Global constants
│   │   ├── routes.ts
│   │   ├── config.ts
│   │   └── index.ts
│   │
│   └── utils/                      # Pure utility functions
│       ├── date.utils.ts
│       ├── string.utils.ts
│       ├── number.utils.ts
│       └── index.ts
│
├── .env.local
├── .env.example
├── .eslintrc.json
├── .prettierrc
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Routing & App Directory

1. **The `app/` directory is for routing only.** Only `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, and `route.ts`. No reusable components or business logic.

2. **Use Route Groups `(groupName)` for organisation** without affecting the URL path.

3. **Every `page.tsx` should be lean.** Compose from `features/` components:
   ```tsx
   import { DashboardView } from '@/features/dashboard';
   export default function DashboardPage() {
     return <DashboardView />;
   }
   ```

4. **Always add `loading.tsx` and `error.tsx`** at each route segment that fetches data.

5. **Colocate `_components/` inside a route** only when those components are 100% route-specific and will never be reused.

6. **API routes** go in `app/api/`. Use `route.ts` with typed `Request` and `Response`. Never import from `app/api/` in client components.

---

## Component Architecture

### Server vs Client Components

| Situation | Use |
|---|---|
| Default / data fetching | Server Component (no directive) |
| Has `useState`, `useEffect`, event handlers | `'use client'` |
| Uses browser APIs (`window`, `document`) | `'use client'` |
| Wraps a 3rd-party component that uses hooks | `'use client'` |

### The Three-Layer Model

| Layer | Location | Purpose |
|---|---|---|
| Primitives | `components/ui/` | Button, Input, Badge, Modal — no business logic, pure props |
| Structural | `components/layout/` | Header, Sidebar, PageWrapper — reusable structure, no domain data |
| Feature | `features/[x]/components/` | UserCard, InvoiceTable — knows the domain, composed from Layers 1 & 2 |

**Dependency flows downward only:** `ui/` must never import from `features/`.

### Rules

1. **One component per file.** No exceptions for non-trivial components.

2. **Component folders** for anything beyond a single file:
   ```
   Button/
   ├── index.tsx          ← re-exports Button
   ├── Button.tsx         ← implementation
   └── Button.test.tsx
   ```

3. **`index.ts` barrel files** at folder level to avoid messy import paths.

4. **Props interface must be named `[ComponentName]Props`** and defined above the component:
   ```tsx
   interface ButtonProps {
     label: string;
     variant?: 'primary' | 'secondary';
     onClick?: () => void;
     className?: string;        // ✅ Always accept className for caller customisation
   }

   export function Button({ label, variant = 'primary', onClick, className }: ButtonProps) {
     return <button className={cn('btn', className)} onClick={onClick}>{label}</button>;
   }
   ```

5. **Use named exports, not default exports** (except Next.js special files: `page.tsx`, `layout.tsx`, etc.).

6. **Push `'use client'` as deep as possible.** Extract interactive parts into small client components. Keep parents as server components.

7. **Never fetch data inside client components.** Data fetching belongs in server components or TanStack Query / SWR hooks.

8. **Use `children` for composition over deeply nested props:**
   ```tsx
   // ❌ Avoid: <Card title="Users" subtitle="..." icon={<UsersIcon />} footerText="Total: 12" />
   // ✅ Prefer composable slots:
   <Card>
     <CardHeader><UsersIcon /><CardTitle>Users</CardTitle></CardHeader>
     <CardContent>Manage users</CardContent>
   </Card>
   ```

9. **Prefer composition over configuration.** A component with 10+ boolean props should be split into composable sub-components.

10. **Before building a new component, check `components/ui/` first.** Never rebuild existing primitives in a feature.

11. **Create `EmptyState` and `ErrorState` components** for consistent list/table fallbacks instead of ad-hoc inline markup.

12. **Every data-fetching view must have a loading skeleton** — use meaningful `Suspense` fallbacks, not generic spinners.

13. **Forward refs for primitive UI components** that wrap native elements (`Button`, `Input`, etc.) to support parent ref access.

---

## Hooks

### Scoping

| Hook Usage | Where it lives |
|---|---|
| Used by one component only | Same file as the component |
| Used by multiple components within one feature | `features/[feature]/hooks/` |
| Used across multiple features | `src/hooks/` (global) |

### Rules

1. **All hooks must start with `use`.**
2. **Hook filename must match the export name**: `useAuth.ts` → `useAuth`.
3. **Be descriptive** — `useUserPermissions` over `usePerms`.
4. **Always return a typed object or tuple.**
5. **Avoid side effects at the top level** — use `useEffect`.
6. **Hooks wrapping API calls must return `{ data, isLoading, error }`** — consistent shape.
7. **Prefer TanStack Query / SWR** for server-state hooks instead of manual `useEffect` + `fetch`.

---

## Types & Interfaces

### Where Types Live

| Type Scope | Location |
|---|---|
| Global, shared types | `src/types/` |
| Feature-specific types | `src/features/[feature]/types/` |
| Component-only types | Inside the component file (as `interface XProps`) |
| API response/request types | `src/types/api.types.ts` or feature `types/` |

### Rules

1. **Interfaces use PascalCase**: `User`, `AuthResponse`.
2. **Do NOT prefix interfaces with `I`** (e.g., ~~`IUser`~~).
3. **Type aliases use PascalCase**: `UserId = string`, `Status = 'active' | 'inactive'`.
4. **Enum names are PascalCase, values are UPPER_SNAKE_CASE**.
5. **Generic type parameters use descriptive names** (`TData`, `TError`) except for obvious cases (`T`, `K`, `V`).
6. **Use `interface` for object shapes, `type` for unions/intersections/computed types.**
7. **Always export types at the feature `index.ts`** — consumers import from one place.
8. **Never use `any`.** Use `unknown` when the type is truly unknown, then narrow it.

---
## Constants & Configuration

> **Rule: If a value appears more than once, or could ever change, it must be a constant, environment variable, or type.**

### Where Constants Live

| Constant Scope | Location |
|---|---|
| API base URL, feature flags | `.env` → validated in `lib/env.ts` |
| Global app config (timeouts, pagination) | `src/constants/config.ts` |
| Route paths | `src/constants/routes.ts` |
| Error/success messages | `src/constants/messages.ts` |
| Feature-specific values | `src/features/[feature]/constants/` |
| Component-local magic values | Top of the component file |

### Rules

1. **All constants are UPPER_SNAKE_CASE**:
   ```ts
   export const MAX_RETRY_COUNT = 3;
   export const DEFAULT_PAGE_SIZE = 20;
   ```

2. **Group related constants into a named object** with `as const`:
   ```ts
   export const APP_CONFIG = {
     POLLING_INTERVAL_MS: 5_000,
     DEFAULT_PAGE_SIZE: 20,
     MAX_FILE_SIZE_MB: 10,
     DEBOUNCE_DELAY_MS: 300,
   } as const;
   ```

3. **Route constants use string literals in an object**:
   ```ts
   export const ROUTES = {
     HOME: '/',
     LOGIN: '/login',
     DASHBOARD: '/dashboard',
     USER: (id: string) => `/users/${id}`,
   } as const;
   ```

4. **Never hardcode magic strings or numbers inline:**
   ```ts
   // ❌ Bad
   if (status === 'active') { ... }
   setTimeout(fn, 5000);
   router.push('/dashboard/settings');

   // ✅ Good
   if (status === UserStatus.ACTIVE) { ... }
   setTimeout(fn, APP_CONFIG.POLLING_INTERVAL_MS);
   router.push(ROUTES.DASHBOARD_SETTINGS);
   ```

5. **Validate environment variables at startup** in `lib/env.ts`:
   ```ts
   function requireEnv(key: string): string {
     const value = process.env[key];
     if (!value) throw new Error(`Missing required env var: ${key}`);
     return value;
   }

   export const ENV = {
     API_URL: requireEnv('NEXT_PUBLIC_API_URL'),
     APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? 'MyApp',
   } as const;
   ```

6. **Never expose secrets in `NEXT_PUBLIC_` env vars** — only public configuration.

---

## Services & API Layer

### Structure

```ts
// services/api.ts — base client
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});
```

```ts
// features/users/services/user.service.ts
import { apiClient } from '@/services/api';
import type { User, CreateUserPayload } from '../types/user.types';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

export const userService = {
  getAll: (page = 1) =>
    apiClient.get<PaginatedResponse<User>>('/users', { params: { page } }),
  getById: (id: string) =>
    apiClient.get<ApiResponse<User>>(`/users/${id}`),
  create: (payload: CreateUserPayload) =>
    apiClient.post<ApiResponse<User>>('/users', payload),
  update: (id: string, payload: Partial<CreateUserPayload>) =>
    apiClient.patch<ApiResponse<User>>(`/users/${id}`, payload),
  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/users/${id}`),
};
```

### Rules

1. **Services are plain objects with typed methods** — no classes unless required by a library.
2. **One service file per domain entity** (e.g., `user.service.ts`, `order.service.ts`).
3. **Services never contain UI logic or React imports.**
4. **Always type both request payloads and response shapes.**
5. **Server Actions** (`'use server'`) go in `features/[feature]/actions/`:
   ```ts
   'use server';
   export async function loginAction(formData: FormData) {
     const email = formData.get('email') as string;
     // ... server-side logic
   }
   ```

---

## State Management

### Decision Tree

```
Is the state needed in only one component?
  └── Yes → useState / useReducer (local)

Is it server/remote data (API responses)?
  └── Yes → TanStack Query or SWR

Is it shared across multiple components?
  └── Is it URL-representable (filters, pagination)?
        └── Yes → URL search params (useSearchParams)
        └── No → Zustand store or React Context
```

### Zustand Rules

1. **One store file per concern** — don't combine unrelated slices.
2. **Store actions live inside the store** — not in components.
3. **Derive computed values with selectors** — don't store computed state.
4. **Don't put server data in Zustand** — that's TanStack Query's job.

---

## Form Handling & Validation

1. **Use `react-hook-form` + `zod`** for all non-trivial forms. Define schemas as the single source of truth:
   ```ts
   import { z } from 'zod';

   export const loginSchema = z.object({
     email: z.string().email('Invalid email address'),
     password: z.string().min(8, 'Password must be at least 8 characters'),
   });

   export type LoginFormData = z.infer<typeof loginSchema>;
   ```

2. **Colocate schemas with their feature** in `features/[feature]/schemas/` or alongside the form component.

3. **Show validation errors inline** next to the relevant field, not only in a toast.

4. **Reuse schemas for both client and server validation** — define once, use everywhere.

5. **Controlled vs uncontrolled**: prefer `react-hook-form`'s uncontrolled approach for performance. Only use controlled inputs when you need real-time field interaction.

---

## Error Handling

1. **Every async operation must have error handling.** No unhandled promise rejections.

2. **Type your errors** — never catch `any`:
   ```ts
   // ✅ Good
   } catch (error) {
     if (error instanceof ApiError) {
       showToast(error.message);
     } else {
       showToast(ERROR_MESSAGES.GENERIC);
     }
   }
   ```

3. **Every route segment that fetches data must have an `error.tsx`** boundary.

4. **Services must throw typed errors**, not raw `Error` objects:
   ```ts
   export class ApiError extends Error {
     constructor(
       public readonly statusCode: number,
       message: string,
       public readonly errors?: Record<string, string[]>
     ) {
       super(message);
       this.name = 'ApiError';
     }
   }
   ```

5. **Never swallow errors silently.** At minimum, log them:
   ```ts
   // ❌ try { await doSomething(); } catch (_) {}
   // ✅ try { await doSomething(); } catch (error) { console.error('[doSomething]', error); throw error; }
   ```

6. **Use a structured logger** — format as `[module] action: details`. Configure error boundaries to report to a tracking service (e.g., Sentry) in production.

---

## Performance & Optimization

1. **Prefer Server Components for data fetching** — zero client JS cost.

2. **Use `next/dynamic` for heavy client components**:
   ```ts
   const RichTextEditor = dynamic(() => import('@/components/ui/RichTextEditor'), {
     loading: () => <Skeleton className="h-48 w-full" />,
     ssr: false,
   });
   ```

3. **Always use `next/image`** — never raw `<img>` tags. Configure `sizes` for responsive loading:
   ```tsx
   <Image
     src="/hero.jpg"
     alt="Hero banner"
     width={1200}
     height={600}
     sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
     priority
   />
   ```

4. **Use `next/font`** to load fonts — eliminates layout shift and self-hosts automatically.

5. **Memoise expensive computations** with `useMemo` and stable callbacks with `useCallback` — but only when there is a measurable benefit. Don't pre-optimise.

6. **Paginate or virtualise long lists.** Never render more than ~100 items. Use `@tanstack/react-virtual` for large datasets.

7. **Set `Cache-Control` headers** on API routes and use Next.js `fetch` caching options:
   ```ts
   const data = await fetch('/api/stats', { next: { revalidate: 60 } });
   ```

---

## Responsive & Mobile-First Design

> **Rule: Design for the smallest screen first, then progressively enhance.**

### Tailwind Breakpoint Reference

| Prefix | Min Width | Target |
|---|---|---|
| *(none)* | 0px | Mobile (default) |
| `sm:` | 640px | Large mobile / small tablet |
| `md:` | 768px | Tablet |
| `lg:` | 1024px | Desktop |
| `xl:` | 1280px | Large desktop |

### Rules

1. **Write mobile style first, override with breakpoint prefixes:**
   ```tsx
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
   ```

2. **Typography scales up, not down:**
   ```tsx
   <h1 className="text-2xl font-bold md:text-3xl lg:text-4xl">
   ```

3. **Navigation must be mobile-aware from the start.** Always implement a hamburger/drawer for mobile alongside desktop nav.

4. **Touch targets must be at least 44×44px** on mobile.

5. **Avoid fixed pixel widths on containers.** Use `max-w-*` with `w-full`.

6. **Modals on mobile** must be full-screen or bottom-sheet — never small centered boxes.

7. **Test at:** 375px (iPhone SE), 390px (iPhone 14), 768px (iPad), 1280px (desktop).

---

## Accessibility

> **Rule: Accessible by default, not as an afterthought.**

1. **Use semantic HTML** — `<button>`, `<nav>`, `<main>`, `<header>`, `<section>`. Never `<div onClick>`.
2. **Every interactive element must be keyboard-accessible** — `Tab`, `Enter`/`Space`.
3. **All images must have descriptive `alt` text.** Decorative images use `alt=""`.
4. **Form inputs must always have associated `<label>` elements.**
5. **Use `aria-*` attributes** when semantic HTML is insufficient.
6. **Colour must not be the only means of conveying information** — pair with icon/label.
7. **Minimum contrast ratio:** 4.5:1 normal text, 3:1 large text (WCAG AA).
8. **Focus must be visible.** Never `outline: none` without a custom focus style.

---

## Naming Conventions

| Entity | Convention | Example |
|---|---|---|
| Components | PascalCase | `UserProfile`, `DashboardCard` |
| Hooks | camelCase + `use` prefix | `useAuth`, `useUserData` |
| Services | camelCase + `Service` suffix | `userService`, `authService` |
| Utilities | camelCase | `formatDate`, `truncate` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES`, `API_BASE_URL` |
| Types / Interfaces | PascalCase | `User`, `ApiResponse<T>` |
| Enums | PascalCase (name), UPPER_SNAKE_CASE (values) | `UserRole.ADMIN` |
| Files: Components | PascalCase | `UserCard.tsx` |
| Files: Hooks | camelCase | `useAuth.ts` |
| Files: Services | camelCase + `.service` | `user.service.ts` |
| Files: Types | camelCase + `.types` | `user.types.ts` |
| Files: Constants | camelCase + `.constants` | `auth.constants.ts` |
| Files: Utils | camelCase + `.utils` | `date.utils.ts` |
| Files: Tests | Match source + `.test` / `.spec` | `UserCard.test.tsx` |
| Route pages | lowercase with hyphens | `user-profile/page.tsx` |
| Environment variables | `NEXT_PUBLIC_` prefix for client | `NEXT_PUBLIC_API_URL` |

---

## Import Rules

1. **Use path aliases** (`@/`) over relative imports for cross-folder imports.

2. **Relative imports are fine** for files in the same folder or one level up.

3. **Import order** (enforce with ESLint `import/order`):
   ```ts
   // 1. React & Next.js
   import { useState } from 'react';
   import Link from 'next/link';

   // 2. Third-party libraries
   import { useQuery } from '@tanstack/react-query';

   // 3. Internal absolute (@/)
   import { Button } from '@/components/ui';
   import { useAuth } from '@/features/auth';

   // 4. Relative imports
   import { UserCard } from './UserCard';

   // 5. Types (import type)
   import type { User } from '@/types';
   ```

4. **Use `import type` for type-only imports.**

5. **Only import from a feature's `index.ts`** — never reach into internal files from outside.

---

## Utilities

Split by domain into separate files — **never create a generic `utils.ts` catch-all.**

```
utils/
├── date.utils.ts       # formatDate, parseDate, diffInDays
├── string.utils.ts     # capitalize, truncate, slugify
├── number.utils.ts     # formatCurrency, formatPercent
├── validation.utils.ts # isEmail, isPhone, isEmpty
└── index.ts            # barrel re-export
```

1. **Utilities are pure functions** — no side effects, no React/Next.js imports.
2. **Each utility must be independently unit-tested.**
3. **Add JSDoc** for non-obvious utilities.

---

## Code Quality & Linting

### Required Tooling

| Tool | Purpose |
|---|---|
| TypeScript (`strict: true`) | Type safety |
| ESLint | Code quality enforcement |
| Prettier | Consistent formatting |
| `eslint-plugin-import` | Import order & boundaries |
| `eslint-plugin-react-hooks` | Hooks rules |
| Husky + lint-staged | Enforce on commit |

### Rules

1. **`strict: true` in TypeScript is non-negotiable.**
2. **No `console.log` in committed code.** Use `console.error` / `console.warn` for legitimate logging.
3. **Functions must have a maximum of 4 parameters.** Use an options object for more.
4. **Maximum function length: ~50 lines.** Break down longer functions.
5. **No commented-out code in commits.** Git history preserves it.
6. **Every PR must pass:** TypeScript compilation, ESLint zero errors, all tests green.
7. **Use `httpOnly` cookies for auth tokens** — never store tokens in `localStorage`.
8. **Use `Content-Security-Policy` headers** for XSS prevention.

### Git Conventions

- **Conventional commits:** `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`
- **One concern per PR** — don't mix refactors with features.

---

## Testing

1. **File naming**: `[ComponentName].test.tsx` colocated next to the source file.
2. **Test coverage target**: 80%+ on business logic, hooks, and utilities.
3. **Testing stack**: `Jest` + `@testing-library/react` + `@testing-library/user-event`.
4. **Unit test** pure utilities and hooks in isolation.
5. **Component tests** — test behaviour, not implementation details.
6. **E2E tests** (Playwright or Cypress) for critical user journeys.

---

## Quick Reference Card

A compact cheatsheet of the most commonly violated rules:

| Rule | One-liner |
|---|---|
| `app/` is routing only | No business logic or reusable components in `app/` |
| Feature-first | Group by domain in `features/`, not by file type |
| Named exports | Default exports only for Next.js special files |
| `'use client'` at the leaf | Push client directives as deep as possible |
| No `any` | Use `unknown` + narrowing |
| No magic values | Extract to constants or env vars |
| No `<img>` | Always `next/image` |
| No `useEffect` + `fetch` | Use TanStack Query or SWR |
| No catch-all files | Split `utils.ts` → `date.utils.ts`, `string.utils.ts`, etc. |
| Import from `index.ts` | Never reach into a feature's internal files |
| Semantic HTML | `<button>` not `<div onClick>` |
| Max 4 params | Use an options object for more |
| Max 4 nesting levels | Flatten or reconsider boundaries |
| Mobile-first CSS | Write base styles for mobile, use `md:`/`lg:` to scale up |

---

*Last updated: April 2025 | Next.js 15, React 19, TypeScript 5*

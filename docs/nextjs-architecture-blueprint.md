# Next.js Architecture Blueprint
### Standards, Rules & Patterns for Scalable Applications (2025)

---
# Very important NOTE : Use shadcn componets only
* No hardcoded strings
* proper types constants enums etc

## Table of Contents

1. [Core Principles](#core-principles)
2. [Project File Structure](#project-file-structure)
3. [Routing & App Directory Rules](#routing--app-directory-rules)
4. [Component Rules](#component-rules)
5. [Hooks Rules](#hooks-rules)
6. [Types & Interfaces Rules](#types--interfaces-rules)
7. [Constants Rules](#constants-rules)
8. [Services & API Layer Rules](#services--api-layer-rules)
9. [State Management Rules](#state-management-rules)
10. [Utilities Rules](#utilities-rules)
11. [Naming Conventions](#naming-conventions)
12. [Import Rules](#import-rules)
13. [Testing Rules](#testing-rules)
14. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)

---

## Core Principles

1. **Colocation over distance** — Keep related code close. A hook used only by one component lives next to that component, not in a global `hooks/` folder.
2. **Feature-first organisation** — Group by domain/feature, not by file type.
3. **Explicit over implicit** — Avoid magic. Name things clearly. Make dependencies obvious.
4. **Server by default** — All components are React Server Components (RSC) unless they need interactivity (`'use client'`). Keep the client bundle small.
5. **Single responsibility** — Each file does one thing. No God files.
6. **Consistency** — A new developer should be able to find any file within 10 seconds.

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
│   │   ├── (marketing)/            # Route group
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
│   │   ├── ui/                     # Primitive/design-system components
│   │   │   ├── Button/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── Button.tsx
│   │   │   │   └── Button.test.tsx
│   │   │   ├── Card/
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   └── index.ts            # Barrel export
│   │   └── layout/                 # Structural layout components
│   │       ├── Header/
│   │       ├── Footer/
│   │       ├── Sidebar/
│   │       └── index.ts
│   │
│   ├── features/                   # Domain-specific feature modules
│   │   ├── auth/
│   │   │   ├── components/         # Components used only in this feature
│   │   │   │   ├── LoginForm/
│   │   │   │   │   ├── index.tsx
│   │   │   │   │   └── LoginForm.tsx
│   │   │   │   └── AuthGuard.tsx
│   │   │   ├── hooks/              # Hooks used only in this feature
│   │   │   │   └── useAuth.ts
│   │   │   ├── services/           # API calls for this feature
│   │   │   │   └── auth.service.ts
│   │   │   ├── types/
│   │   │   │   └── auth.types.ts
│   │   │   ├── constants/
│   │   │   │   └── auth.constants.ts
│   │   │   └── index.ts            # Public API of this feature
│   │   │
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   │
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
│   │   ├── axios.ts                # Configured axios instance
│   │   ├── prisma.ts               # Prisma client singleton
│   │   ├── auth.ts                 # Auth.js / NextAuth config
│   │   └── stripe.ts
│   │
│   ├── services/                   # Global API service layer
│   │   ├── api.ts                  # Base API client
│   │   └── index.ts
│   │
│   ├── store/                      # Global state (Zustand / Redux)
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

## Routing & App Directory Rules

### Rules

1. **The `app/` directory is for routing only.** It should contain `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, and `route.ts` files. Do not put reusable components or business logic here.

2. **Use Route Groups `(groupName)` for organisation** without affecting the URL path. Group by section, access level, or team.
   ```
   app/
   ├── (public)/           ← no URL impact
   │   └── home/page.tsx   ← /home
   ├── (protected)/
   │   └── dashboard/page.tsx
   ```

3. **Every `page.tsx` should be lean.** Compose from `features/` components. A page is an orchestrator, not an implementation.
   ```tsx
   // ✅ Good — page.tsx
   import { DashboardView } from '@/features/dashboard';
   export default function DashboardPage() {
     return <DashboardView />;
   }
   ```

4. **Always add `loading.tsx` and `error.tsx` at each route segment** that fetches data. Never let Suspense boundaries be an afterthought.

5. **Colocate `_components/` inside a route** only when those components are 100% route-specific and will never be reused.
   ```
   app/dashboard/
   ├── _components/        ← private, only used by this route
   │   └── DashboardStats.tsx
   └── page.tsx
   ```

6. **API routes** go in `app/api/`. Use `route.ts` with typed `Request` and `Response`. Never import from `app/api/` from client components.

---

## Component Rules

### Server vs Client Components

| Situation | Use |
|---|---|
| Default / data fetching | Server Component (no directive) |
| Has `useState`, `useEffect`, event handlers | `'use client'` |
| Uses browser APIs (`window`, `document`) | `'use client'` |
| Wraps a 3rd-party component that uses hooks | `'use client'` |

```tsx
// ✅ Server Component — no directive needed
async function UserProfile({ userId }: { userId: string }) {
  const user = await fetchUser(userId); // direct DB/API call
  return <div>{user.name}</div>;
}

// ✅ Client Component — explicit directive
'use client';
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### Component File Rules

1. **One component per file.** No exceptions for non-trivial components.

2. **Component folders** for anything beyond a single file:
   ```
   Button/
   ├── index.tsx          ← re-exports Button
   ├── Button.tsx         ← implementation
   ├── Button.test.tsx
   └── Button.module.css  ← if not using Tailwind
   ```

3. **`index.ts` barrel files** at folder level to avoid messy import paths:
   ```ts
   // components/ui/index.ts
   export { Button } from './Button';
   export { Card } from './Card';
   export { Input } from './Input';
   ```

4. **Props interface must be named `[ComponentName]Props`** and defined above the component:
   ```tsx
   interface ButtonProps {
     label: string;
     variant?: 'primary' | 'secondary';
     onClick?: () => void;
     disabled?: boolean;
   }

   export function Button({ label, variant = 'primary', onClick, disabled }: ButtonProps) {
     // ...
   }
   ```

5. **Use named exports, not default exports**, for all components (except Next.js special files: `page.tsx`, `layout.tsx`, etc.):
   ```tsx
   // ✅ Named export
   export function UserCard() { ... }

   // ❌ Default export (except for Next.js special files)
   export default function UserCard() { ... }
   ```

6. **Push `'use client'` as deep as possible.** If only a small interactive part needs state, extract just that into a client component. Keep parents as server components.

7. **Never fetch data inside client components.** Data fetching belongs in server components or React Query / SWR hooks.

---

## Hooks Rules

### Scoping Rules

| Hook Usage | Where it lives |
|---|---|
| Used by one component only | Same file as the component |
| Used by multiple components within one feature | `features/[feature]/hooks/` |
| Used across multiple features | `src/hooks/` (global) |

### Naming Rules

1. **All hooks must start with `use`** — it is a React requirement and a lint rule.
2. **Hook filename must match the export name**: `useAuth.ts` exports `useAuth`.
3. **Be descriptive** — `useUserPermissions` is better than `usePerms`.

### Implementation Rules

```ts
// ✅ Good hook — single responsibility, typed, documented
/**
 * Debounces a value by the given delay.
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300)
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

4. **Always return a typed object or tuple** — avoid returning untyped values.
5. **Avoid side effects at the top level of a hook** — use `useEffect` for side effects.
6. **Hooks that wrap API calls should return `{ data, isLoading, error }`** — consistent shape across the app.
   ```ts
   // ✅ Consistent API hook shape
   export function useUser(id: string) {
     const [data, setData] = useState<User | null>(null);
     const [isLoading, setIsLoading] = useState(false);
     const [error, setError] = useState<Error | null>(null);
     // ...
     return { data, isLoading, error };
   }
   ```
7. **Prefer `react-query` / `@tanstack/query` or `SWR`** for server-state hooks instead of manual `useEffect` + `fetch`.

---

## Types & Interfaces Rules

### Where Types Live

| Type Scope | Location |
|---|---|
| Global, shared types | `src/types/` |
| Feature-specific types | `src/features/[feature]/types/` |
| Component-only types | Inside the component file (as `interface XProps`) |
| API response/request types | `src/types/api.types.ts` or feature `types/` |

### Naming Rules

1. **Interfaces use PascalCase**: `User`, `AuthResponse`, `DashboardConfig`
2. **Do NOT prefix interfaces with `I`** (e.g., ~~`IUser`~~) — not idiomatic TypeScript.
3. **Type aliases use PascalCase**: `UserId = string`, `Status = 'active' | 'inactive'`
4. **Enum names are PascalCase, values are UPPER_SNAKE_CASE**:
   ```ts
   enum UserRole {
     ADMIN = 'ADMIN',
     EDITOR = 'EDITOR',
     VIEWER = 'VIEWER',
   }
   ```
5. **Generic type parameters use descriptive names** (`TData`, `TError`, `TResponse`) not single letters except for very obvious cases (`T`, `K`, `V`).

### Implementation Rules

```ts
// ✅ Good — types/api.types.ts
export interface ApiResponse<TData> {
  data: TData;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<TData> extends ApiResponse<TData[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
```

```ts
// ✅ Good — features/users/types/user.types.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export type CreateUserPayload = Omit<User, 'id' | 'createdAt'>;
export type UpdateUserPayload = Partial<CreateUserPayload>;
```

6. **Use `type` for unions, intersections, and computed types. Use `interface` for object shapes.** Prefer `interface` for things that could be extended; `type` for everything else.
7. **Always export types at the feature `index.ts`** so consumers only import from one place.
8. **Never use `any`.** Use `unknown` when the type is truly unknown, then narrow it.

---

## Constants Rules

### Where Constants Live

| Constant Scope | Location |
|---|---|
| Global app config (URLs, keys, timeouts) | `src/constants/config.ts` |
| Route paths | `src/constants/routes.ts` |
| Feature-specific values | `src/features/[feature]/constants/` |
| Component-local magic values | Top of the component file |

### Naming Rules

1. **All constants are UPPER_SNAKE_CASE**:
   ```ts
   export const MAX_RETRY_COUNT = 3;
   export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
   export const DEFAULT_PAGE_SIZE = 20;
   ```

2. **Route constants are string literals in an object**:
   ```ts
   // constants/routes.ts
   export const ROUTES = {
     HOME: '/',
     LOGIN: '/login',
     DASHBOARD: '/dashboard',
     DASHBOARD_SETTINGS: '/dashboard/settings',
     USER: (id: string) => `/users/${id}`,
   } as const;
   ```

3. **Never hardcode magic strings or numbers inline** — always extract to a constant.
   ```ts
   // ❌ Bad
   if (status === 'active') { ... }
   setTimeout(fn, 5000);

   // ✅ Good
   const ACTIVE_STATUS = 'active' as const;
   const POLLING_INTERVAL_MS = 5_000;
   if (status === ACTIVE_STATUS) { ... }
   setTimeout(fn, POLLING_INTERVAL_MS);
   ```

4. **Use `as const` on object constants** to get literal types and prevent mutation.
5. **Group related constants into a named object** rather than scattering individual exports:
   ```ts
   // ✅ Good
   export const AUTH_CONFIG = {
     SESSION_DURATION_DAYS: 7,
     MAX_LOGIN_ATTEMPTS: 5,
     LOCKOUT_DURATION_MINUTES: 15,
   } as const;
   ```

---

## Services & API Layer Rules

### Structure

```ts
// services/api.ts — base client
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);
```

```ts
// features/users/services/user.service.ts
import { apiClient } from '@/services/api';
import type { User, CreateUserPayload, UpdateUserPayload } from '../types/user.types';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

export const userService = {
  getAll: (page = 1) =>
    apiClient.get<PaginatedResponse<User>>('/users', { params: { page } }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<User>>(`/users/${id}`),

  create: (payload: CreateUserPayload) =>
    apiClient.post<ApiResponse<User>>('/users', payload),

  update: (id: string, payload: UpdateUserPayload) =>
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
5. **Server Actions** (Next.js `'use server'`) go in `features/[feature]/actions/` or route-colocated `_actions/`:
   ```ts
   // features/auth/actions/login.action.ts
   'use server';

   export async function loginAction(formData: FormData) {
     const email = formData.get('email') as string;
     // ... server-side logic
   }
   ```

---

## State Management Rules

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

```ts
// store/useAppStore.ts
import { create } from 'zustand';

interface AppState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
```

1. **One store file per concern** — don't combine unrelated slices.
2. **Store actions live inside the store** — not in components.
3. **Derive computed values with selectors** — don't store computed state.
4. **Don't put server data in Zustand** — that's TanStack Query's job.

---

## Utilities Rules

### Structure

Split utilities by domain into separate files:

```
utils/
├── date.utils.ts       # formatDate, parseDate, diffInDays
├── string.utils.ts     # capitalize, truncate, slugify
├── number.utils.ts     # formatCurrency, formatPercent
├── array.utils.ts      # chunk, groupBy, unique
├── validation.utils.ts # isEmail, isPhone, isEmpty
└── index.ts            # barrel re-export
```

### Rules

1. **Utilities are pure functions** — no side effects, no imports from React or Next.js.
2. **Each utility function must be independently unit-tested.**
3. **Never create a generic `utils.ts` catch-all file.** Name by domain.
4. **Always add JSDoc** for non-obvious utilities:
   ```ts
   /**
    * Truncates a string to the specified length and adds an ellipsis.
    * @param str - The input string
    * @param maxLength - Maximum character count (default: 100)
    */
   export function truncate(str: string, maxLength = 100): string {
     if (str.length <= maxLength) return str;
     return `${str.slice(0, maxLength - 3)}...`;
   }
   ```

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
| Files: Constants | camelCase + `.constants` or standalone | `auth.constants.ts` |
| Files: Utils | camelCase + `.utils` | `date.utils.ts` |
| Files: Tests | Match source + `.test` or `.spec` | `UserCard.test.tsx` |
| Route pages | lowercase with hyphens (Next.js folder convention) | `user-profile/page.tsx` |
| Environment variables | `NEXT_PUBLIC_` prefix for client-accessible | `NEXT_PUBLIC_API_URL` |

---

## Import Rules

1. **Use path aliases over relative imports for cross-folder imports.** Configure `@/` to point to `src/`:
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```
   ```ts
   // ✅ Good
   import { Button } from '@/components/ui';
   import { useAuth } from '@/features/auth';

   // ❌ Bad
   import { Button } from '../../../../components/ui';
   ```

2. **Relative imports are fine for files in the same folder or one level up.**

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

4. **Use `import type` for type-only imports** to help the compiler and tree-shaker:
   ```ts
   import type { User, ApiResponse } from '@/types';
   ```

5. **Only import from a feature's `index.ts`** — never reach into its internal files from outside.
   ```ts
   // ✅ Good — import from public API
   import { LoginForm, useAuth } from '@/features/auth';

   // ❌ Bad — reaching into internals
   import { LoginForm } from '@/features/auth/components/LoginForm/LoginForm';
   ```

---

## Testing Rules

1. **File naming**: `[ComponentName].test.tsx` colocated next to the source file.
2. **Test coverage target**: 80%+ on business logic, hooks, and utilities. Page/layout components need at minimum smoke tests.
3. **Testing library stack**: `Jest` + `@testing-library/react` + `@testing-library/user-event`.
4. **Unit test** pure utilities and hooks in isolation.
5. **Component tests** use `@testing-library/react` — test behaviour, not implementation.
6. **E2E tests** (Playwright or Cypress) for critical user journeys (login, checkout, key workflows).

```tsx
// UserCard.test.tsx
import { render, screen } from '@testing-library/react';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  it('renders the user name', () => {
    render(<UserCard name="Taranjeet" email="t@example.com" />);
    expect(screen.getByText('Taranjeet')).toBeInTheDocument();
  });
});
```

---

## Anti-Patterns to Avoid

| Anti-Pattern | Problem | Fix |
|---|---|---|
| `utils.ts` catch-all file | Becomes a 2000-line black hole | Split by domain: `date.utils.ts`, `string.utils.ts` |
| Everything in `app/` | Mixes routing with business logic | Keep `app/` for routing only; logic in `features/` |
| Deep relative imports `../../../../` | Brittle, hard to refactor | Use `@/` path aliases |
| Default exports everywhere | Harder to refactor, IDE rename fails | Named exports except Next.js special files |
| `any` type | Defeats TypeScript | Use `unknown` + type narrowing |
| `'use client'` on parent components | Infects children, grows client bundle | Push `'use client'` to the leaf component |
| Fetching in `useEffect` | Race conditions, no caching | Use TanStack Query or SWR |
| Zustand for server/remote data | Duplicates cache layer | Use TanStack Query for server state |
| Magic numbers/strings inline | Unreadable, hard to change | Extract to constants |
| 200+ files flat in `components/` | Nobody knows what's good anymore | Group into `ui/`, `layout/`, `features/` |
| Importing across feature boundaries (internal files) | Creates tight coupling | Import only from a feature's `index.ts` |
| Nesting deeper than 4 levels | `a/b/c/d/e/f/index.tsx` | Flatten or reconsider feature boundaries |

---

*Last updated: April 2025 | Next.js 15, React 19, TypeScript 5*

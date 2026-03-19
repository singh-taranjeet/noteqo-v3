# Next.js Architecture Blueprint
### Standards, Rules & Patterns for Scalable Applications (2025)

---

## Table of Contents

1. [Core Principles](#core-principles)
2. [Project File Structure](#project-file-structure)
3. [Routing & App Directory Rules](#routing--app-directory-rules)
4. [Component Rules](#component-rules)
5. [Reusable Component Rules](#reusable-component-rules)
6. [Hooks Rules](#hooks-rules)
7. [Types & Interfaces Rules](#types--interfaces-rules)
8. [No Hardcoded Values Rule](#no-hardcoded-values-rule)
9. [Constants Rules](#constants-rules)
10. [Services & API Layer Rules](#services--api-layer-rules)
11. [State Management Rules](#state-management-rules)
12. [Responsive & Mobile-First Design Rules](#responsive--mobile-first-design-rules)
13. [Accessibility Rules](#accessibility-rules)
14. [Error Handling Rules](#error-handling-rules)
15. [Performance Rules](#performance-rules)
16. [Utilities Rules](#utilities-rules)
17. [Naming Conventions](#naming-conventions)
18. [Import Rules](#import-rules)
19. [Code Quality & Linting Rules](#code-quality--linting-rules)
20. [Testing Rules](#testing-rules)
21. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)

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

## Reusable Component Rules

The rule of thumb: **if you write the same JSX twice, extract it.** A component is reusable when it is driven entirely by props and carries no assumptions about where it is used.

### The Three-Layer Component Model

```
components/ui/          ← Layer 1: Primitive / Design System
                           Button, Input, Badge, Modal, Tooltip
                           No business logic. Pure props. Fully reusable.

components/layout/      ← Layer 2: Structural
                           Header, Sidebar, PageWrapper
                           Reusable structure, no domain data.

features/[x]/components/ ← Layer 3: Feature-Specific
                           UserCard, InvoiceTable, OrderStatus
                           Knows about the domain, composed from Layers 1 & 2.
```

### Rules

1. **Before building a new component, check `components/ui/` first.** Never rebuild Button, Input, or Modal from scratch in a feature.

2. **A reusable component must accept a `className` prop** to allow the caller to adjust layout/spacing without forking the component:
   ```tsx
   interface CardProps {
     title: string;
     children: React.ReactNode;
     className?: string;           // ✅ allows caller to customise spacing
   }

   export function Card({ title, children, className }: CardProps) {
     return (
       <div className={cn('rounded-lg border bg-white p-4', className)}>
         <h3 className="text-lg font-semibold">{title}</h3>
         {children}
       </div>
     );
   }
   ```
   Use `clsx` or `tailwind-merge` (`cn()`) to merge class names safely.

3. **Use `children` for composition, not deeply nested props:**
   ```tsx
   // ❌ Bad — prop drilling the inner content
   <Card title="Users" subtitle="Manage users" icon={<UsersIcon />} footerText="Total: 12" />

   // ✅ Good — composable slots
   <Card>
     <CardHeader>
       <UsersIcon />
       <CardTitle>Users</CardTitle>
     </CardHeader>
     <CardContent>Manage users</CardContent>
     <CardFooter>Total: 12</CardFooter>
   </Card>
   ```

4. **A `ui/` component must never import from `features/`.** The dependency only flows downward.

5. **Extract repeated patterns immediately.** If three different pages render a "loading spinner + text" block, create `<LoadingState />`. If two forms share the same error message markup, create `<FieldError />`.

6. **Prefer composition over configuration.** A component with 12 boolean props (`showHeader`, `showFooter`, `isCompact`, `isFullWidth`…) is a sign it should be split into multiple composable pieces.

7. **Document the component's intent with a JSDoc comment** above the component if its usage is non-obvious:
   ```tsx
   /**
    * StatusBadge — displays a colour-coded pill for entity status values.
    * Use within tables and detail views. Does not handle click events.
    */
   export function StatusBadge({ status }: StatusBadgeProps) { ... }
   ```

8. **Create an `EmptyState` and `ErrorState` component** and use them consistently across all list/table views instead of ad-hoc inline fallbacks.

---

## No Hardcoded Values Rule

> **Rule: If a value appears more than once, or could ever change, it must be a constant, environment variable, or type.**

This is one of the most impactful rules for long-term maintainability. A single hardcoded URL buried in a component can cause a production bug that takes hours to track down.

### Categories & Where They Belong

| Value Type | Example | Where it lives |
|---|---|---|
| API base URL | `https://api.myapp.com` | `.env` → `NEXT_PUBLIC_API_URL` |
| Route paths | `'/dashboard/settings'` | `constants/routes.ts` |
| Timeouts & intervals | `5000`, `30000` | `constants/config.ts` |
| Pagination defaults | `20`, `50` | `constants/config.ts` |
| Status/state strings | `'active'`, `'pending'` | Enum or union type in `types/` |
| Error messages | `'Something went wrong'` | `constants/messages.ts` |
| Regex patterns | `/^[a-z0-9]+$/` | `constants/regex.ts` or `utils/validation.utils.ts` |
| Z-index values | `100`, `9999` | Tailwind config or `constants/ui.ts` |
| Breakpoints | `768`, `1024` | Tailwind config (never inline) |
| Feature flags | `true`, `false` | `.env` → `NEXT_PUBLIC_FEATURE_X` |

### Examples

```ts
// ❌ Bad — hardcoded everywhere
fetch('https://api.myapp.com/v1/users')
setTimeout(refresh, 5000)
if (user.role === 'admin') { ... }
router.push('/dashboard/settings')

// ✅ Good — named constants
fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/users`)
setTimeout(refresh, POLLING_INTERVAL_MS)
if (user.role === UserRole.ADMIN) { ... }
router.push(ROUTES.DASHBOARD_SETTINGS)
```

```ts
// constants/config.ts
export const APP_CONFIG = {
  POLLING_INTERVAL_MS: 5_000,
  DEFAULT_PAGE_SIZE: 20,
  MAX_FILE_SIZE_MB: 10,
  SESSION_TIMEOUT_MINUTES: 30,
  DEBOUNCE_DELAY_MS: 300,
} as const;

// constants/messages.ts
export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Unable to connect. Check your internet connection.',
  UNAUTHORISED: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource could not be found.',
} as const;

export const SUCCESS_MESSAGES = {
  SAVED: 'Changes saved successfully.',
  DELETED: 'Item deleted successfully.',
  CREATED: 'Created successfully.',
} as const;
```

```ts
// ❌ Bad — magic regex inline
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { ... }

// ✅ Good — named and reusable
// constants/regex.ts
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_AU: /^(\+61|0)[2-9]\d{8}$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  URL: /^https?:\/\/.+/,
} as const;

// utils/validation.utils.ts
import { REGEX } from '@/constants/regex';
export const isValidEmail = (value: string) => REGEX.EMAIL.test(value);
```

### Environment Variables

```ts
// ❌ Bad — raw access with no validation
const url = process.env.NEXT_PUBLIC_API_URL;

// ✅ Good — validated at startup in lib/env.ts
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const ENV = {
  API_URL: requireEnv('NEXT_PUBLIC_API_URL'),
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? 'MyApp',
} as const;
```

---

## Responsive & Mobile-First Design Rules

> **Rule: Design for the smallest screen first, then progressively enhance for larger screens. Never design desktop-first.**

### Tailwind Breakpoint Reference

| Prefix | Min Width | Target |
|---|---|---|
| *(none)* | 0px | Mobile (default, always first) |
| `sm:` | 640px | Large mobile / small tablet |
| `md:` | 768px | Tablet |
| `lg:` | 1024px | Desktop |
| `xl:` | 1280px | Large desktop |
| `2xl:` | 1536px | Wide screen |

### Rules

1. **Always write the mobile style first, then override with breakpoint prefixes:**
   ```tsx
   // ❌ Bad — desktop-first, then shrinks down
   <div className="grid-cols-4 sm:grid-cols-2 xs:grid-cols-1">

   // ✅ Good — mobile-first, then expands up
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
   ```

2. **Typography scales up, not down:**
   ```tsx
   // ✅ Good
   <h1 className="text-2xl font-bold md:text-3xl lg:text-4xl">
   <p className="text-sm md:text-base">
   ```

3. **Use responsive padding and spacing:**
   ```tsx
   // ✅ Good — tight on mobile, spacious on desktop
   <main className="px-4 py-6 md:px-8 md:py-10 lg:px-16">
   ```

4. **Navigation must be mobile-aware from the start.** Always implement a hamburger/drawer pattern for mobile alongside the desktop nav. Never ship a horizontal nav without a mobile fallback.
   ```tsx
   <nav>
     {/* Mobile: hamburger */}
     <MobileNav className="flex lg:hidden" />
     {/* Desktop: horizontal links */}
     <DesktopNav className="hidden lg:flex" />
   </nav>
   ```

5. **Images must always use `next/image`** with `sizes` configured for responsive loading:
   ```tsx
   // ✅ Good
   import Image from 'next/image';
   <Image
     src="/hero.jpg"
     alt="Hero banner"
     width={1200}
     height={600}
     sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
     priority
   />

   // ❌ Bad
   <img src="/hero.jpg" />
   ```

6. **Touch targets must be at least 44×44px** on mobile. Buttons and links must have adequate padding:
   ```tsx
   // ✅ Good — large enough touch target
   <button className="min-h-[44px] min-w-[44px] px-4 py-2">
   ```

7. **Avoid fixed pixel widths on containers.** Use `max-w-*` with `w-full`:
   ```tsx
   // ❌ Bad
   <div style={{ width: '1200px' }}>

   // ✅ Good
   <div className="w-full max-w-7xl mx-auto">
   ```

8. **Test all layouts at these widths:** 375px (iPhone SE), 390px (iPhone 14), 768px (iPad), 1280px (desktop), 1536px (wide).

9. **Use a `useMediaQuery` hook** for logic that truly needs to be conditional on screen size (prefer CSS/Tailwind for visual changes):
   ```ts
   // hooks/useMediaQuery.ts
   export function useMediaQuery(query: string): boolean {
     const [matches, setMatches] = useState(false);
     useEffect(() => {
       const media = window.matchMedia(query);
       setMatches(media.matches);
       const listener = () => setMatches(media.matches);
       media.addEventListener('change', listener);
       return () => media.removeEventListener('change', listener);
     }, [query]);
     return matches;
   }

   // Usage
   const isDesktop = useMediaQuery('(min-width: 1024px)');
   ```

10. **Modals and drawers on mobile** must be full-screen or bottom-sheet style — never small centered boxes with fixed `max-w`:
    ```tsx
    <dialog className="
      fixed inset-0 w-full h-full
      md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
      md:w-[500px] md:h-auto md:rounded-xl
    ">
    ```

---

## Accessibility Rules

> **Rule: Accessible by default, not as an afterthought.**

1. **Use semantic HTML elements** — `<button>`, `<nav>`, `<main>`, `<header>`, `<footer>`, `<section>`, `<article>`. Never use `<div>` as a button.
   ```tsx
   // ❌ Bad
   <div onClick={handleClick}>Submit</div>

   // ✅ Good
   <button type="button" onClick={handleClick}>Submit</button>
   ```

2. **Every interactive element must be keyboard-accessible** — reachable via `Tab` and operable via `Enter`/`Space`.

3. **All images must have descriptive `alt` text.** Decorative images use `alt=""`:
   ```tsx
   <Image src="/avatar.png" alt="Jane Doe's profile photo" />
   <Image src="/divider.svg" alt="" role="presentation" />
   ```

4. **Form inputs must always have associated `<label>` elements** — never rely on `placeholder` alone:
   ```tsx
   // ✅ Good
   <label htmlFor="email" className="block text-sm font-medium">
     Email address
   </label>
   <input id="email" type="email" name="email" />
   ```

5. **Use `aria-*` attributes** when semantic HTML is insufficient (e.g., custom dropdowns, modals, tabs):
   ```tsx
   <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
     <h2 id="modal-title">Confirm deletion</h2>
   </div>
   ```

6. **Colour must not be the only means of conveying information.** Always pair colour with an icon, label, or pattern.

7. **Minimum contrast ratio:** 4.5:1 for normal text, 3:1 for large text (WCAG AA).

8. **Focus must be visible.** Never use `outline: none` without providing a custom focus style:
   ```css
   /* ✅ Good — custom focus ring */
   .btn:focus-visible {
     outline: 2px solid theme('colors.blue.500');
     outline-offset: 2px;
   }
   ```

---

## Error Handling Rules

1. **Every async operation must have error handling.** No unhandled promise rejections.

2. **Type your errors.** Never catch `any`:
   ```ts
   // ❌ Bad
   } catch (e: any) { console.log(e.message) }

   // ✅ Good
   } catch (error) {
     if (error instanceof ApiError) {
       showToast(error.message);
     } else {
       showToast(ERROR_MESSAGES.GENERIC);
     }
   }
   ```

3. **Every route segment that fetches data must have an `error.tsx`** boundary:
   ```tsx
   // app/dashboard/error.tsx
   'use client';
   export default function DashboardError({ error, reset }: {
     error: Error;
     reset: () => void;
   }) {
     return (
       <div className="flex flex-col items-center gap-4 p-8">
         <p className="text-red-600">{error.message}</p>
         <button onClick={reset}>Try again</button>
       </div>
     );
   }
   ```

4. **Services must throw typed errors**, not raw `Error` objects:
   ```ts
   // types/api.types.ts
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
   // ❌ Bad
   try { await doSomething(); } catch (_) {}

   // ✅ Good
   try { await doSomething(); } catch (error) {
     console.error('[doSomething]', error);
     throw error; // or handle appropriately
   }
   ```

6. **Form validation errors must be shown inline**, next to the relevant field, not only in a toast.

---

## Performance Rules

1. **Prefer Server Components for data fetching** — they render on the server with zero client JS cost.

2. **Use `next/dynamic` for heavy client components** to keep the initial bundle small:
   ```ts
   import dynamic from 'next/dynamic';
   const RichTextEditor = dynamic(() => import('@/components/ui/RichTextEditor'), {
     loading: () => <Skeleton className="h-48 w-full" />,
     ssr: false,
   });
   ```

3. **Always use `next/image`** — never raw `<img>` tags. It handles lazy loading, resizing, and WebP conversion automatically.

4. **Use `next/font`** to load fonts — it eliminates layout shift and self-hosts fonts automatically:
   ```ts
   // app/layout.tsx
   import { Inter } from 'next/font/google';
   const inter = Inter({ subsets: ['latin'] });
   ```

5. **Memoise expensive computations** with `useMemo`, and stable callbacks with `useCallback` — but only when there is a measurable performance benefit. Don't pre-optimise everything:
   ```ts
   // ✅ Justified — expensive filter over large list
   const filteredUsers = useMemo(
     () => users.filter(u => u.name.includes(search)),
     [users, search]
   );
   ```

6. **Paginate or virtualise long lists.** Never render more than ~100 items to the DOM at once. Use `@tanstack/react-virtual` for large datasets.

7. **Avoid layout thrashing** — do not read and write to the DOM in the same tick. Let React manage DOM updates.

8. **Set `Cache-Control` headers** on API routes and use Next.js `fetch` caching options for server-side data:
   ```ts
   // Revalidate every 60 seconds
   const data = await fetch('/api/stats', { next: { revalidate: 60 } });

   // Never cache (always fresh)
   const data = await fetch('/api/user', { cache: 'no-store' });
   ```

---

## Code Quality & Linting Rules

### Required Tooling

| Tool | Purpose | Config file |
|---|---|---|
| TypeScript (`strict: true`) | Type safety | `tsconfig.json` |
| ESLint | Code quality enforcement | `.eslintrc.json` |
| Prettier | Consistent formatting | `.prettierrc` |
| `eslint-plugin-import` | Import order & boundaries | `.eslintrc.json` |
| `eslint-plugin-react-hooks` | Hooks rules | `.eslintrc.json` |
| Husky + lint-staged | Enforce on commit | `.husky/pre-commit` |

### TypeScript Config (`strict` mode required)

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### ESLint Rules (key enforcements)

```json
// .eslintrc.json (key rules)
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/consistent-type-imports": "error",
    "no-console": ["warn", { "allow": ["error", "warn"] }],
    "import/order": ["error", { "newlines-between": "always" }],
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "no-magic-numbers": ["error", { "ignore": [0, 1, -1] }]
  }
}
```

### Code Quality Rules

1. **`strict: true` in TypeScript is non-negotiable.** No exceptions.
2. **No `console.log` in committed code.** Use `console.error` / `console.warn` for legitimate logging, and strip debug logs with ESLint.
3. **Functions must have a maximum of 4 parameters.** If you need more, accept an options object:
   ```ts
   // ❌ Bad
   function createUser(name: string, email: string, role: string, age: number, org: string) {}

   // ✅ Good
   function createUser(options: CreateUserOptions) {}
   ```
4. **Maximum function length: ~50 lines.** If a function is longer, it should be broken down.
5. **No commented-out code in commits.** Delete it — git history preserves it.
6. **Every PR must pass:** TypeScript compilation, ESLint with zero errors, all tests green.

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
| Hardcoded API URLs | Breaks across environments | Use `process.env` via `lib/env.ts` |
| Hardcoded route strings | Silent breakage on rename | Use `ROUTES` constants object |
| 200+ files flat in `components/` | Nobody knows what's good anymore | Group into `ui/`, `layout/`, `features/` |
| Importing across feature boundaries (internal files) | Creates tight coupling | Import only from a feature's `index.ts` |
| Nesting deeper than 4 levels | `a/b/c/d/e/f/index.tsx` | Flatten or reconsider feature boundaries |
| Rebuilding existing UI components | Wasted effort, inconsistent UX | Always check `components/ui/` first |
| Component with 10+ boolean props | Impossible to understand or test | Split into composable sub-components |
| Desktop-first CSS | Broken mobile layouts | Write mobile styles first, use `md:` / `lg:` to scale up |
| Raw `<img>` tags | No lazy loading, no size optimisation | Always use `next/image` |
| Fixed pixel widths on containers | Breaks on small screens | Use `w-full max-w-*` |
| `<div onClick={}>` as interactive | Not keyboard accessible, not semantic | Use `<button>` or `<a>` |
| Missing `alt` text on images | Screen readers cannot interpret | Always provide descriptive `alt` |
| Swallowing errors silently | Bugs are invisible in production | Always log or rethrow |
| No `error.tsx` boundary on data routes | Unhandled crashes show blank screen | Add `error.tsx` to every data-fetching segment |
| Commented-out code committed | Clutters history, confuses readers | Delete it; git log preserves it |
| `console.log` in production code | Leaks internals, pollutes logs | Remove with ESLint `no-console` rule |
| Functions with 5+ parameters | Hard to call, hard to test | Refactor to accept an options object |

---

*Last updated: April 2025 | Next.js 15, React 19, TypeScript 5*

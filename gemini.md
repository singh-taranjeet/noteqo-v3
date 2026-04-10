# Gemini System Instructions

Always follow the architecture blueprint guidelines when making code modifications.

Please read and adhere strictly to the rules defined in `docs/nextjs-architecture-blueprint.md` before making architectural and coding decisions. 

### Key Principles to Remember:
1. **Feature-first organization**: Group by domain/feature inside `src/features/` instead of globally by file type.
2. **Server by default**: Default to React Server Components unless interactivity is explicitly needed (`'use client'`). Push `'use client'` to the deepest leaf component possible.
3. **App routing isolation**: Use the `app/` directory for routing only. Do not mix business logic or reusable components within `app/`. Every `page.tsx` should be lean and composed from `features/` components.
4. **Named exports**: Use named exports instead of default exports, except for Next.js specific files (like `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, etc.).
5. **Strict Typing**: Strictly type all constants, hooks, services, and avoid using `any` completely. Export types from feature `index.ts`.
6. **Co-location & Single Responsibility**: Keep hooks, components, and types exactly where they are used. Strictly maintain one component per file.
7. **Constants Structure**: Constants are UPPER_SNAKE_CASE. No magic numbers inline.
8. **Alias Imports**: Use path aliases (e.g. `@/`) over deeply nested relative imports. Import only from a feature's `index.ts` rather than reaching deep into its folders.

(Full rules available at `docs/nextjs-architecture-blueprint.md`)

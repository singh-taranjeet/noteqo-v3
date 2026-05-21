# Gemini System Instructions

Always follow the architecture blueprint guidelines when making code modifications.

Please read and adhere strictly to the rules defined in `docs/architecture-blueprint.md` before making architectural and coding decisions.

**Stack**: Vite + React 19 + TypeScript (strict) · React Router v6 · TanStack React Query v5 · Radix/shadcn · Tailwind + SCSS modules · NestJS backend

### Key Principles to Remember:
1. **Feature-first organisation**: Group by domain/feature inside `src/features/` instead of globally by file type. Each feature has `components/`, `hooks/`, `services/`, `constants/`, `types/`, and a single `index.ts` barrel.
2. **Named exports only**: Use named exports everywhere — no `export default`.
3. **Strict Typing**: Strictly type all constants, hooks, services, and avoid using `any` completely. Use `import type` for type-only imports. Export types from feature `index.ts`.
4. **Co-location & Single Responsibility**: Keep hooks, components, and types exactly where they are used. One component per file. Promote to global `src/` only when used by ≥ 2 features.
5. **Constants Structure**: Constants are `UPPER_SNAKE_CASE` with `as const`. No magic numbers inline. File pattern: `<domain>.constants.ts`.
6. **Alias Imports**: Use path aliases (`@/`) over deeply nested relative imports. Import only from a feature's `index.ts` — never reach into its sub-folders.
7. **File Naming**: Components → `PascalCase.tsx` · Hooks → `use<Name>.ts` · Services → `<domain>.service.ts` · Types → `<domain>.types.ts` · Constants → `<domain>.constants.ts`.
8. **Layering**: `Component → Hook → Service → API Client`. Components never call services directly.
9. **No magic values, no `any`, no default exports, no bare `utils.ts`/`types.ts`**.

(Full rules available at `docs/architecture-blueprint.md`)

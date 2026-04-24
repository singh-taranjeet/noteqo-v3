# Gemini Agent Rules — NestJS Note-Taking App (Notion-like)

You are an AI coding agent working on a NestJS backend for a Notion-like note-taking application.
Follow **all** rules below on every file you create or modify. No exceptions.

---

## Table of Contents

1. [Full Project Structure](#1-full-project-structure)
2. [File Placement Rules](#2-file-placement-rules)
3. [Module Anatomy](#3-module-anatomy)
4. [Layer Architecture & Boundaries](#4-layer-architecture--boundaries)
5. [Shared Module Rules](#5-shared-module-rules)
6. [Database Layer Architecture](#6-database-layer-architecture)
7. [Configuration Architecture](#7-configuration-architecture)
8. [Inter-Module Communication](#8-inter-module-communication)
9. [No Hard-Coded Strings or Values](#9-no-hard-coded-strings-or-values)
10. [Strict TypeScript — No `any`](#10-strict-typescript--no-any)
11. [Proper Typing — DTOs, Entities, Interfaces](#11-proper-typing--dtos-entities-interfaces)
12. [Constants File Conventions](#12-constants-file-conventions)
13. [Services — Business Logic Rules](#13-services--business-logic-rules)
14. [Controllers — HTTP Layer Rules](#14-controllers--http-layer-rules)
15. [Enums and Union Types](#15-enums-and-union-types)
16. [Error Handling](#16-error-handling)
17. [Validation](#17-validation)
18. [Decorators & Guards](#18-decorators--guards)
19. [Naming Conventions](#19-naming-conventions)
20. [Code Quality Rules](#20-code-quality-rules)
21. [Database & Migrations](#21-database--migrations)
22. [Testing Architecture](#22-testing-architecture)
23. [Imports & Barrel Files](#23-imports--barrel-files)
24. [Advanced NestJS Best Practices](#24-advanced-nestjs-best-practices)
25. [Quick Checklist](#25-quick-checklist)

---

## 1. Full Project Structure

This is the canonical folder tree for the entire project. Every file must live exactly where
this structure prescribes. Do not invent new top-level directories without a documented reason.

```
project-root/
├── src/
│   ├── main.ts                               # Bootstrap only — no logic here
│   ├── app.module.ts                         # Root module — imports feature modules only
│   ├── app.controller.ts                     # Health check endpoint only
│   │
│   ├── auth/                                 # Authentication & authorisation
│   │   ├── constants/
│   │   │   └── auth.constants.ts
│   │   ├── decorators/
│   │   │   └── public.decorator.ts           # @Public() route decorator
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   ├── register.dto.ts
│   │   │   └── refresh-token.dto.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── local-auth.guard.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── local.strategy.ts
│   │   ├── types/
│   │   │   └── auth.types.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   └── index.ts
│   │
│   ├── users/
│   │   ├── constants/
│   │   │   └── users.constants.ts
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   ├── update-user.dto.ts
│   │   │   └── user-response.dto.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   ├── types/
│   │   │   └── users.types.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.repository.ts
│   │   ├── users.module.ts
│   │   └── index.ts
│   │
│   ├── workspaces/                           # Top-level container (like a Notion workspace)
│   │   ├── constants/
│   │   │   └── workspaces.constants.ts
│   │   ├── dto/
│   │   │   ├── create-workspace.dto.ts
│   │   │   ├── update-workspace.dto.ts
│   │   │   ├── invite-member.dto.ts
│   │   │   └── workspace-response.dto.ts
│   │   ├── entities/
│   │   │   ├── workspace.entity.ts
│   │   │   └── workspace-member.entity.ts
│   │   ├── types/
│   │   │   └── workspaces.types.ts
│   │   ├── workspaces.controller.ts
│   │   ├── workspaces.service.ts
│   │   ├── workspaces.repository.ts
│   │   ├── workspaces.module.ts
│   │   └── index.ts
│   │
│   ├── notes/                                # Notes (pages in Notion terms)
│   │   ├── constants/
│   │   │   └── notes.constants.ts
│   │   ├── dto/
│   │   │   ├── create-note.dto.ts
│   │   │   ├── update-note.dto.ts
│   │   │   ├── query-notes.dto.ts
│   │   │   └── note-response.dto.ts
│   │   ├── entities/
│   │   │   └── note.entity.ts
│   │   ├── types/
│   │   │   └── notes.types.ts
│   │   ├── notes.controller.ts
│   │   ├── notes.service.ts
│   │   ├── notes.repository.ts
│   │   ├── notes.module.ts
│   │   └── index.ts
│   │
│   ├── blocks/                               # Content blocks within a note
│   │   ├── constants/
│   │   │   └── blocks.constants.ts
│   │   ├── dto/
│   │   │   ├── create-block.dto.ts
│   │   │   ├── update-block.dto.ts
│   │   │   ├── reorder-blocks.dto.ts
│   │   │   └── block-response.dto.ts
│   │   ├── entities/
│   │   │   └── block.entity.ts
│   │   ├── types/
│   │   │   └── blocks.types.ts
│   │   ├── blocks.controller.ts
│   │   ├── blocks.service.ts
│   │   ├── blocks.repository.ts
│   │   ├── blocks.module.ts
│   │   └── index.ts
│   │
│   ├── permissions/                          # Fine-grained access control per note/workspace
│   │   ├── constants/
│   │   │   └── permissions.constants.ts
│   │   ├── dto/
│   │   │   ├── grant-permission.dto.ts
│   │   │   └── permission-response.dto.ts
│   │   ├── entities/
│   │   │   └── permission.entity.ts
│   │   ├── types/
│   │   │   └── permissions.types.ts
│   │   ├── permissions.service.ts
│   │   ├── permissions.repository.ts
│   │   ├── permissions.module.ts
│   │   └── index.ts
│   │
│   ├── search/                               # Full-text search across notes and blocks
│   │   ├── constants/
│   │   │   └── search.constants.ts
│   │   ├── dto/
│   │   │   ├── search-query.dto.ts
│   │   │   └── search-response.dto.ts
│   │   ├── types/
│   │   │   └── search.types.ts
│   │   ├── search.controller.ts
│   │   ├── search.service.ts
│   │   ├── search.module.ts
│   │   └── index.ts
│   │
│   ├── uploads/                              # File and image upload handling
│   │   ├── constants/
│   │   │   └── uploads.constants.ts
│   │   ├── dto/
│   │   │   └── upload-response.dto.ts
│   │   ├── types/
│   │   │   └── uploads.types.ts
│   │   ├── uploads.controller.ts
│   │   ├── uploads.service.ts
│   │   ├── uploads.module.ts
│   │   └── index.ts
│   │
│   ├── config/                               # Environment config — no business logic
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   ├── redis.config.ts
│   │   ├── storage.config.ts
│   │   ├── config.constants.ts              # Config namespace key strings
│   │   ├── config.validation.ts             # Joi/Zod env var schema
│   │   └── index.ts
│   │
│   └── shared/                              # Cross-cutting infrastructure — no feature logic
│       ├── constants/
│       │   ├── app.constants.ts             # Global constants (pagination defaults etc.)
│       │   ├── http.constants.ts            # HTTP status messages, header names
│       │   └── index.ts
│       ├── decorators/
│       │   ├── current-user.decorator.ts
│       │   ├── workspace-id.decorator.ts
│       │   ├── api-paginated-response.decorator.ts
│       │   └── index.ts
│       ├── exceptions/
│       │   ├── note.exception.ts
│       │   ├── workspace.exception.ts
│       │   ├── permission.exception.ts
│       │   └── index.ts
│       ├── filters/
│       │   ├── http-exception.filter.ts
│       │   └── index.ts
│       ├── guards/
│       │   ├── jwt-auth.guard.ts
│       │   ├── workspace-member.guard.ts
│       │   └── index.ts
│       ├── interceptors/
│       │   ├── logging.interceptor.ts
│       │   ├── response-transform.interceptor.ts
│       │   └── index.ts
│       ├── pipes/
│       │   ├── parse-uuid.pipe.ts
│       │   └── index.ts
│       ├── types/
│       │   ├── pagination.types.ts          # PaginationOptions, PaginatedResult<T>
│       │   ├── api-response.types.ts        # ApiResponse<T>, ApiErrorResponse
│       │   ├── authenticated-user.types.ts
│       │   └── index.ts
│       └── utils/
│           ├── pagination.util.ts
│           ├── date.util.ts
│           └── index.ts
│
├── database/
│   ├── migrations/                          # TypeORM migration files
│   │   └── 1700000000000-init-schema.ts
│   └── seeds/                               # Seed scripts for dev/test
│       └── dev.seed.ts
│
├── test/
│   ├── e2e/                                 # End-to-end tests, one file per feature module
│   │   ├── notes.e2e-spec.ts
│   │   ├── auth.e2e-spec.ts
│   │   └── workspaces.e2e-spec.ts
│   ├── fixtures/                            # Typed test data builder functions
│   │   ├── note.fixture.ts
│   │   ├── user.fixture.ts
│   │   └── workspace.fixture.ts
│   └── jest-e2e.json
│
├── .env
├── .env.example                             # All keys present, values blank — commit this
├── .env.test
├── nest-cli.json
├── tsconfig.json
├── tsconfig.build.json
└── package.json
```

---

## 2. File Placement Rules

These rules are absolute. When creating any file, find the matching rule and follow it exactly.

### File type → location mapping

| File Type | Directory | Naming Pattern |
|---|---|---|
| NestJS module | `src/<feature>/` | `<feature>.module.ts` |
| Controller | `src/<feature>/` | `<feature>.controller.ts` |
| Service | `src/<feature>/` | `<feature>.service.ts` |
| Repository | `src/<feature>/` | `<feature>.repository.ts` |
| ORM Entity | `src/<feature>/entities/` | `<feature>.entity.ts` |
| Create DTO | `src/<feature>/dto/` | `create-<feature>.dto.ts` |
| Update DTO | `src/<feature>/dto/` | `update-<feature>.dto.ts` |
| Query params DTO | `src/<feature>/dto/` | `query-<feature>.dto.ts` |
| Response DTO | `src/<feature>/dto/` | `<feature>-response.dto.ts` |
| Feature types | `src/<feature>/types/` | `<feature>.types.ts` |
| Feature constants | `src/<feature>/constants/` | `<feature>.constants.ts` |
| Auth strategy | `src/auth/strategies/` | `<name>.strategy.ts` |
| Auth guard | `src/auth/guards/` | `<name>.guard.ts` |
| Shared guard | `src/shared/guards/` | `<name>.guard.ts` |
| Custom decorator | `src/shared/decorators/` | `<name>.decorator.ts` |
| Exception filter | `src/shared/filters/` | `<name>.filter.ts` |
| Custom exception class | `src/shared/exceptions/` | `<domain>.exception.ts` |
| Interceptor | `src/shared/interceptors/` | `<name>.interceptor.ts` |
| Custom pipe | `src/shared/pipes/` | `<name>.pipe.ts` |
| Utility / helper function | `src/shared/utils/` | `<name>.util.ts` |
| Global types | `src/shared/types/` | `<name>.types.ts` |
| Global constants | `src/shared/constants/` | `<name>.constants.ts` |
| Config factory | `src/config/` | `<name>.config.ts` |
| Config validation schema | `src/config/` | `config.validation.ts` |
| DB migration | `database/migrations/` | `<timestamp>-<description>.ts` |
| DB seed | `database/seeds/` | `<name>.seed.ts` |
| Unit test | Same directory as source | `<source-file>.spec.ts` |
| E2E test | `test/e2e/` | `<feature>.e2e-spec.ts` |
| Test fixture/factory | `test/fixtures/` | `<domain>.fixture.ts` |

### Boundary decision rules

- A file used by **one module only** → lives inside that module's directory.
- A file used by **two or more modules** → lives in `src/shared/`.
- A file that **configures an external service** (DB, Redis, JWT, S3) → lives in `src/config/`.
- A file that **re-exports only** (barrel) → `index.ts` in its directory.
- A file that **wraps a third-party library** → `src/shared/utils/` or a dedicated adapter module.

### Files that must NEVER exist

```
src/helpers.ts          → use src/shared/utils/<name>.util.ts
src/types.ts            → use src/shared/types/<name>.types.ts
src/utils.ts            → break into specific util files
src/common.ts           → forbidden name
src/misc.ts             → forbidden name
src/<feature>/<feature>.helper.ts  → inline into service or move to shared/utils/
```

---

## 3. Module Anatomy

Every feature module must contain exactly these parts. All are required.

### Required files

```
src/notes/
├── constants/
│   └── notes.constants.ts      # ALL strings, numbers, events, routes for this module
├── dto/
│   ├── create-note.dto.ts
│   ├── update-note.dto.ts
│   ├── query-notes.dto.ts
│   └── note-response.dto.ts    # What the API returns — never the raw entity
├── entities/
│   └── note.entity.ts          # ORM mapping only — never imported by other modules
├── types/
│   └── notes.types.ts          # Domain interfaces and union types
├── notes.controller.ts
├── notes.service.ts
├── notes.repository.ts
├── notes.module.ts
└── index.ts                    # Barrel — exports only what other modules may need
```

### Module registration rules

```typescript
// src/notes/notes.module.ts
@Module({
  imports: [
    TypeOrmModule.forFeature([NoteEntity]),
    WorkspacesModule,     // import the module, never the service directly
    PermissionsModule,
  ],
  controllers: [NotesController],
  providers: [NotesService, NotesRepository],
  exports: [NotesService], // export ONLY services — never repositories, entities, helpers
})
export class NotesModule {}
```

- **Import modules, not providers** — never add another module's service to `providers`.
- **Export only services** — repositories, entities, and constants are private to the module.
- Circular imports between modules are forbidden — use events (see Section 8) or extract a shared module.

### Barrel file rules

```typescript
// src/notes/index.ts — expose only what external consumers legitimately need
export { NotesModule } from './notes.module';
export { NotesService } from './notes.service';
export type { NoteResponse, NoteVisibility } from './types/notes.types';
// Do NOT export: NotesRepository, NoteEntity, internal constants
```

---

## 4. Layer Architecture & Boundaries

The application is strictly layered. Each layer may only call the layer directly below it.

```
┌──────────────────────────────────────────────────────────────┐
│  HTTP / Transport Layer                                       │
│  Controller — receives Request, validates via DTO,           │
│               calls Service, returns Response DTO            │
├──────────────────────────────────────────────────────────────┤
│  Business Logic Layer                                        │
│  Service — orchestrates domain rules, authorisation checks,  │
│            calls Repository or other Services,               │
│            emits events, throws NestJS HTTP exceptions       │
├──────────────────────────────────────────────────────────────┤
│  Data Access Layer                                           │
│  Repository — issues ORM queries, maps Entity → domain type  │
├──────────────────────────────────────────────────────────────┤
│  Persistence Layer                                           │
│  Entity — ORM column/relation decorators only, no methods    │
└──────────────────────────────────────────────────────────────┘
```

### Layer permission table

| Layer | Allowed | Forbidden |
|---|---|---|
| **Controller** | Parse request, call service, return response DTO, apply guards/pipes/decorators | Business logic, DB access, throwing domain exceptions |
| **Service** | Domain logic, call repository, call other services, emit events, throw HTTP exceptions | Direct ORM queries, reading `process.env`, parsing HTTP request objects |
| **Repository** | ORM queries, entity-to-domain mapping, pagination | Business rules, HTTP exceptions, calling services |
| **Entity** | Column definitions, ORM relation decorators, simple column transformers | Methods, computed properties, business logic |

### Layer violation examples

```typescript
// ❌ WRONG — controller contains business logic
@Post()
async create(@Body() dto: CreateNoteDto) {
  const existing = await this.notesRepository.findByTitle(dto.title); // repo called in controller
  if (existing) throw new ConflictException('Duplicate title');        // domain rule in controller
  return this.notesService.create(dto, userId);
}

// ❌ WRONG — service calls ORM directly
async findOne(id: string): Promise<NoteResponse> {
  return this.noteEntityRepository.findOne({ where: { id } }); // ORM in service layer
}

// ✅ CORRECT — controller delegates everything
@Post()
async create(@Body() dto: CreateNoteDto, @CurrentUser() user: AuthenticatedUser) {
  return this.notesService.create(dto, user.id);
}

// ✅ CORRECT — service calls repository
async findOne(id: string, userId: string): Promise<NoteResponse> {
  const note = await this.notesRepository.findById(id);
  if (!note) throw new NotFoundException(NOTE_ERROR_MESSAGES.NOT_FOUND);
  return note;
}
```

---

## 5. Shared Module Rules

`src/shared/` is for **infrastructure code only** — no knowledge of any feature domain.

### What belongs in `src/shared/`

- Generic decorators (`@CurrentUser`, `@WorkspaceId`, `@ApiPaginatedResponse`)
- Global exception filters and interceptors
- Generic pipe implementations
- Reusable generic types (`PaginatedResult<T>`, `ApiResponse<T>`, `AuthenticatedUser`)
- Utility functions with no domain knowledge (date utils, pagination math)
- Custom exception base classes

### What does NOT belong in `src/shared/`

- Any type, constant, or logic specific to notes, blocks, or workspaces
- Feature services or repositories
- Anything that imports from a feature module

### SharedModule setup

```typescript
// src/shared/shared.module.ts
@Global()
@Module({
  providers: [
    { provide: APP_FILTER,      useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor },
    {
      provide: APP_PIPE,
      useFactory: () => new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
  ],
  exports: [],
})
export class SharedModule {}
```

---

## 6. Database Layer Architecture

### Entity rules

- One entity file per DB table, located in `src/<feature>/entities/`.
- Entities are **never imported by other modules** — only the owning repository uses them.
- Entities have no methods, no computed properties, no business logic.
- All column and table names come from constants — never raw strings in the entity file.

```typescript
// src/notes/entities/note.entity.ts
import { NOTE_TABLE, NOTE_COLUMN, NOTE_VISIBILITY, NOTE_STATUS } from '../constants/notes.constants';

@Entity({ name: NOTE_TABLE.NAME })
export class NoteEntity {
  @PrimaryGeneratedColumn('uuid', { name: NOTE_COLUMN.ID })
  id: string;

  @Column({ name: NOTE_COLUMN.TITLE, length: NOTE_TITLE_MAX_LENGTH })
  title: string;

  @Column({ name: NOTE_COLUMN.VISIBILITY, type: 'enum', enum: Object.values(NOTE_VISIBILITY) })
  visibility: NoteVisibility;

  @Column({ name: NOTE_COLUMN.STATUS, type: 'enum', enum: Object.values(NOTE_STATUS) })
  status: NoteStatus;

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn({ name: NOTE_COLUMN.OWNER_ID })
  @Index()
  owner: UserEntity;

  @CreateDateColumn({ name: NOTE_COLUMN.CREATED_AT })
  createdAt: Date;

  @UpdateDateColumn({ name: NOTE_COLUMN.UPDATED_AT })
  updatedAt: Date;
}
```

### DB table/column constants

All table names, column names, and relation lists must be defined in the module's constants file:

```typescript
// src/notes/constants/notes.constants.ts (database section)
export const NOTE_TABLE   = { NAME: 'notes' } as const;

export const NOTE_COLUMN  = {
  ID:              'id',
  TITLE:           'title',
  VISIBILITY:      'visibility',
  STATUS:          'status',
  OWNER_ID:        'owner_id',
  WORKSPACE_ID:    'workspace_id',
  PARENT_NOTE_ID:  'parent_note_id',
  CREATED_AT:      'created_at',
  UPDATED_AT:      'updated_at',
} as const;

export const NOTE_RELATIONS = {
  DEFAULT: ['blocks']                    as const,
  FULL:    ['blocks', 'owner', 'workspace'] as const,
} as const;
```

### Repository rules

- All DB access goes through a repository class — never call ORM directly in a service.
- Repositories return domain types — the `toDomain` mapper is a private method and never exported.
- Repository methods must have explicit parameter and return types.

### Repository pattern

```typescript
// src/notes/notes.repository.ts
@Injectable()
export class NotesRepository {
  constructor(
    @InjectRepository(NoteEntity)
    private readonly orm: Repository<NoteEntity>,
  ) {}

  async findById(id: string): Promise<Note | null> {
    const entity = await this.orm.findOne({
      where: { id },
      relations: NOTE_RELATIONS.DEFAULT,
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByWorkspace(
    workspaceId: string,
    options: PaginationOptions,
  ): Promise<PaginatedResult<Note>> {
    const [entities, total] = await this.orm.findAndCount({
      where: { workspaceId, status: NOTE_STATUS.ACTIVE },
      order: {
        [options.sortField ?? NOTE_SORT_FIELDS.UPDATED_AT]: options.sortOrder ?? 'DESC',
      },
      take:  options.limit  ?? NOTE_DEFAULT_PAGE_SIZE,
      skip:  options.offset ?? 0,
    });
    return { data: entities.map(e => this.toDomain(e)), total, ...options };
  }

  // toDomain is private — entity shape never leaks outside the repository
  private toDomain(entity: NoteEntity): Note {
    return {
      id:          entity.id,
      title:       entity.title,
      visibility:  entity.visibility,
      status:      entity.status,
      ownerId:     entity.owner.id,
      createdAt:   entity.createdAt,
      updatedAt:   entity.updatedAt,
    };
  }
}
```

---

## 7. Configuration Architecture

All environment-dependent values follow a strict three-file pattern.

### Three-file pattern

```
src/config/
├── config.constants.ts      # 1. Namespace key strings for registerAs / get()
├── config.validation.ts     # 2. Joi schema — validates all env vars at startup
├── app.config.ts            # 3. One config factory per external concern
├── database.config.ts
├── jwt.config.ts
└── redis.config.ts
```

### Config namespace keys

```typescript
// src/config/config.constants.ts
export const CONFIG_KEYS = {
  APP:      'app',
  DATABASE: 'database',
  JWT:      'jwt',
  REDIS:    'redis',
  STORAGE:  'storage',
} as const;
```

### Config validation schema

```typescript
// src/config/config.validation.ts
import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV:     Joi.string().valid('development', 'production', 'test').required(),
  PORT:         Joi.number().default(3000),
  DB_HOST:      Joi.string().required(),
  DB_PORT:      Joi.number().default(5432),
  DB_NAME:      Joi.string().required(),
  DB_USERNAME:  Joi.string().required(),
  DB_PASSWORD:  Joi.string().required(),
  JWT_SECRET:   Joi.string().min(32).required(),
  JWT_EXPIRY:   Joi.string().default('7d'),
  REDIS_URL:    Joi.string().uri().required(),
});
```

### Config factory

```typescript
// src/config/jwt.config.ts
import { registerAs } from '@nestjs/config';
import { CONFIG_KEYS } from './config.constants';

export const jwtConfig = registerAs(CONFIG_KEYS.JWT, () => ({
  secret:    process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRY,
}));
```

### Accessing config in services

```typescript
// ✅ CORRECT — typed config access via ConfigService
constructor(private readonly config: ConfigService) {}

private getJwtSecret(): string {
  return this.config.getOrThrow<string>(`${CONFIG_KEYS.JWT}.secret`);
}

// ❌ WRONG — process.env anywhere outside src/config/
const secret = process.env.JWT_SECRET;
```

---

## 8. Inter-Module Communication

### Rules

- A module may **import another module** to use its exported service.
- A module may **never** directly import another module's repository, entity, or internal type.
- For **decoupled side effects** (index for search, send notification) → use `EventEmitter2`.
- For **synchronous cross-module queries** (does this workspace exist?) → call the exported service.
- Circular imports between modules are forbidden — redesign using events or a shared module.

### Event-based decoupling

```typescript
// src/notes/constants/notes.constants.ts
export const NOTE_EVENTS = {
  CREATED: 'note.created',
  DELETED: 'note.deleted',
} as const;

// src/notes/notes.service.ts — emits the event
async create(dto: CreateNoteDto, userId: string): Promise<NoteResponse> {
  const note = await this.notesRepository.save(dto);
  this.eventEmitter.emit(NOTE_EVENTS.CREATED, { note, userId });
  return note;
}

// src/search/search.service.ts — listens without importing NotesModule
@OnEvent(NOTE_EVENTS.CREATED)
async handleNoteCreated(payload: NoteCreatedEvent): Promise<void> {
  await this.indexNote(payload.note);
}
```

### Allowed vs forbidden cross-module imports

```typescript
// ✅ CORRECT — import the module, use the exported service
@Module({ imports: [WorkspacesModule] })
export class NotesModule {}

constructor(private readonly workspacesService: WorkspacesService) {}

// ❌ WRONG — importing a repository from another module
constructor(private readonly workspacesRepository: WorkspacesRepository) {}

// ❌ WRONG — importing an entity from another module
import { WorkspaceEntity } from '../workspaces/entities/workspace.entity';
```

---

## 9. No Hard-Coded Strings or Values

**Never** hard-code strings, numbers, URLs, table names, error messages, event names, or route paths
inside logic files. Everything must come from a constants file.

```typescript
// ❌ WRONG
if (user.role === 'admin') { ... }
throw new Error('Note not found');
@Get('/notes/:id/blocks')
const cacheKey = `note:${id}`;

// ✅ CORRECT
if (user.role === NOTE_ROLES.ADMIN) { ... }
throw new NotFoundException(NOTE_ERROR_MESSAGES.NOT_FOUND);
@Get(NOTE_ROUTES.BLOCKS)
const cacheKey = NOTE_CACHE_KEYS.byId(id);
```

---

## 10. Strict TypeScript — No `any`

- **Never use `any`**. If you are tempted, create a proper type instead.
- Required tsconfig flags: `"strict": true`, `"noImplicitAny": true`, `"strictNullChecks": true`.
- Use `unknown` for values whose type is indeterminate, and narrow with type guards.
- Prefer `type` for unions/intersections; prefer `interface` for shapes that may be extended.

```typescript
// ❌ WRONG
function processBlock(block: any): any { ... }
const result: any = await service.findOne(id);

// ✅ CORRECT
function processBlock(block: NoteBlock): ProcessedBlock { ... }
const result: Note = await service.findOne(id);

// ✅ CORRECT — unknown with type guard
function parseWebhook(payload: unknown): WebhookEvent {
  if (!isWebhookEvent(payload)) {
    throw new BadRequestException(WEBHOOK_ERROR_MESSAGES.INVALID_PAYLOAD);
  }
  return payload;
}
```

---

## 11. Proper Typing — DTOs, Entities, Interfaces

### Request DTOs

```typescript
// src/notes/dto/create-note.dto.ts
export class CreateNoteDto {
  @IsString()
  @MaxLength(NOTE_TITLE_MAX_LENGTH)
  title: string;

  @IsOptional()
  @IsEnum(NOTE_VISIBILITY)
  visibility?: NoteVisibility;

  @IsOptional()
  @IsUUID()
  parentNoteId?: string;
}

// src/notes/dto/update-note.dto.ts
export class UpdateNoteDto extends PartialType(CreateNoteDto) {}
```

### Response DTOs — always used at controller boundary, never raw entities

```typescript
// src/notes/dto/note-response.dto.ts
export class NoteResponseDto {
  id: string;
  title: string;
  visibility: NoteVisibility;
  status: NoteStatus;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Domain types — the shape of objects inside the service layer

```typescript
// src/notes/types/notes.types.ts
export type NoteVisibility = (typeof NOTE_VISIBILITY)[keyof typeof NOTE_VISIBILITY];
export type NoteStatus     = (typeof NOTE_STATUS)[keyof typeof NOTE_STATUS];

export interface Note {
  id:            string;
  title:         string;
  visibility:    NoteVisibility;
  status:        NoteStatus;
  ownerId:       string;
  workspaceId:   string;
  parentNoteId:  string | null;
  createdAt:     Date;
  updatedAt:     Date;
}
```

---

## 12. Constants File Conventions

Every module **must** have a `constants/` directory. All exported objects must use `as const`.

```typescript
// src/notes/constants/notes.constants.ts

// Limits
export const NOTE_TITLE_MAX_LENGTH   = 255 as const;
export const NOTE_CONTENT_MAX_LENGTH = 100_000 as const;
export const NOTE_MAX_NESTING_DEPTH  = 5 as const;
export const NOTE_DEFAULT_PAGE_SIZE  = 20 as const;
export const NOTE_MAX_PAGE_SIZE      = 100 as const;

// Domain values
export const NOTE_VISIBILITY = {
  PUBLIC:    'public',
  PRIVATE:   'private',
  WORKSPACE: 'workspace',
} as const;

export const NOTE_STATUS = {
  ACTIVE:   'active',
  ARCHIVED: 'archived',
  TRASHED:  'trashed',
} as const;

export const NOTE_SORT_FIELDS = {
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
  TITLE:      'title',
} as const;

// HTTP routes
export const NOTE_ROUTES = {
  BASE:   'notes',
  BY_ID:  ':noteId',
  BLOCKS: ':noteId/blocks',
  SHARE:  ':noteId/share',
} as const;

// Error messages
export const NOTE_ERROR_MESSAGES = {
  NOT_FOUND:         'Note not found',
  ALREADY_EXISTS:    'A note with this title already exists in this workspace',
  MAX_DEPTH_EXCEEDED:`Notes cannot be nested more than ${NOTE_MAX_NESTING_DEPTH} levels deep`,
  PERMISSION_DENIED: 'You do not have permission to perform this action',
} as const;

// Cache key builders
export const NOTE_CACHE_KEYS = {
  byId:             (id: string)            => `note:${id}`,
  listByWorkspace:  (workspaceId: string)   => `notes:workspace:${workspaceId}`,
} as const;

// Events
export const NOTE_EVENTS = {
  CREATED:  'note.created',
  UPDATED:  'note.updated',
  DELETED:  'note.deleted',
  ARCHIVED: 'note.archived',
  RESTORED: 'note.restored',
} as const;

```

---

## 13. Services — Business Logic Rules

- Services contain **only** business logic — no raw SQL, no direct ORM, no HTTP-layer concerns.
- Every public method must have an explicit return type.
- Use `async/await` — never `.then()/.catch()` chains.
- Throw NestJS HTTP exceptions — never raw `Error`.
- Guard clauses first, happy path last.

```typescript
@Injectable()
export class NotesService {
  private readonly logger = new Logger(NotesService.name);

  constructor(
    private readonly notesRepository: NotesRepository,
    private readonly permissionsService: PermissionsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findOne(noteId: string, requestingUserId: string): Promise<NoteResponse> {
    const note = await this.notesRepository.findById(noteId);
    if (!note) {
      throw new NotFoundException(NOTE_ERROR_MESSAGES.NOT_FOUND);
    }

    const canAccess = await this.permissionsService.canUserReadNote(requestingUserId, noteId);
    if (!canAccess) {
      throw new ForbiddenException(NOTE_ERROR_MESSAGES.PERMISSION_DENIED);
    }

    return note;
  }

  async create(dto: CreateNoteDto, userId: string): Promise<NoteResponse> {
    this.logger.log(`Creating note for user ${userId}`);
    const note = await this.notesRepository.create({ ...dto, ownerId: userId });
    this.eventEmitter.emit(NOTE_EVENTS.CREATED, { note, userId });
    return note;
  }
}
```

---

## 14. Controllers — HTTP Layer Rules

- Controllers handle **only** request/response mapping. Zero business logic.
- Use `@HttpCode()` for all non-default status codes.
- Document every endpoint with `@ApiTags`, `@ApiOperation`, `@ApiResponse`.
- All route strings come from constants.

```typescript
@ApiTags('Notes')
@Controller(NOTE_ROUTES.BASE)
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new note' })
  @ApiResponse({ status: HttpStatus.CREATED, type: NoteResponseDto })
  async create(
    @Body() createNoteDto: CreateNoteDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<NoteResponseDto> {
    return this.notesService.create(createNoteDto, user.id);
  }

  @Get(NOTE_ROUTES.BY_ID)
  @ApiOperation({ summary: 'Get note by ID' })
  async findOne(
    @Param('noteId', ParseUUIDPipe) noteId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<NoteResponseDto> {
    return this.notesService.findOne(noteId, user.id);
  }
}
```

---

## 15. Enums and Union Types

Prefer `as const` objects over TypeScript `enum`. Derive the union type from the object.

```typescript
// ✅ CORRECT
export const BLOCK_TYPE = {
  PARAGRAPH:      'paragraph',
  HEADING_1:      'heading_1',
  HEADING_2:      'heading_2',
  BULLETED_LIST:  'bulleted_list',
  NUMBERED_LIST:  'numbered_list',
  CODE:           'code',
  IMAGE:          'image',
  TABLE:          'table',
  DIVIDER:        'divider',
  CALLOUT:        'callout',
} as const;

export type BlockType = (typeof BLOCK_TYPE)[keyof typeof BLOCK_TYPE];

// ❌ WRONG
enum BlockType { Paragraph = 'paragraph' }
```

---

## 16. Error Handling

- Catch errors at the service layer and rethrow as NestJS HTTP exceptions.
- Use **typed custom exception classes** from `src/shared/exceptions/`.
- Never swallow errors silently (`catch (e) {}`).
- Always log with context before rethrowing.

```typescript
// src/shared/exceptions/note.exception.ts
export class NoteNotFoundException extends NotFoundException {
  constructor(noteId: string) {
    super(`Note with ID "${noteId}" was not found`);
  }
}

export class NotePermissionException extends ForbiddenException {
  constructor(action: string) {
    super(`You are not allowed to ${action} this note`);
  }
}

// src/shared/filters/http-exception.filter.ts
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx    = host.switchToHttp();
    const res    = ctx.getResponse<Response>();
    const status = exception.getStatus();

    this.logger.error(`HTTP ${status}: ${exception.message}`);

    res.status(status).json({
      statusCode: status,
      message:    exception.message,
      timestamp:  new Date().toISOString(),
    });
  }
}
```

---

## 17. Validation

- Use `ValidationPipe` globally: `{ whitelist: true, forbidNonWhitelisted: true, transform: true }`.
- Every DTO property must have at least one `class-validator` decorator.
- Use `@Type(() => Number)` for numeric query params when `transform: true` is on.
- Apply `ParseUUIDPipe` to all UUID route params — never trust raw strings.

---

## 18. Decorators & Guards

- Global decorators → `src/shared/decorators/`.
- Feature-specific decorators → `src/<feature>/decorators/`.
- Global guards → `src/shared/guards/`.
- Auth guards → `src/auth/guards/`.
- All guards must implement `CanActivate` with an explicit `boolean | Promise<boolean>` return type.

```typescript
// src/shared/decorators/current-user.decorator.ts
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
```

---

## 19. Naming Conventions

| Artifact | Convention | Example |
|---|---|---|
| Files | kebab-case | `create-note.dto.ts` |
| Classes | PascalCase | `NotesService` |
| Variables / functions | camelCase | `findNoteById` |
| Constants objects | SCREAMING_SNAKE_CASE | `NOTE_ERROR_MESSAGES` |
| Interfaces | PascalCase, no `I` prefix | `NoteResponse` |
| Types | PascalCase | `BlockType` |
| Const-enum objects | SCREAMING_SNAKE_CASE | `BLOCK_TYPE` |
| DB table names | snake_case via constant | `workspace_members` |
| DB column names | snake_case via constant | `created_at` |
| API route segments | kebab-case | `/workspace-members` |
| Event names | `domain.action` | `note.created` |
| Cache keys | `domain:qualifier` | `note:abc-123` |
| Config namespace keys | camelCase string | `'database'` |

---

## 20. Code Quality Rules

- **No magic numbers** — every numeric literal in logic must be a named constant.
- **No nested ternaries** — use early returns or `if/else`.
- Functions must do **one thing** — if you need "and" to describe it, split it.
- Maximum function length: **30 lines** of logic.
- Maximum file length: **250 lines**. Split if exceeded.
- No `console.log` — use `new Logger(ClassName.name)`.
- No `process.env` outside `src/config/`.
- No default exports — always named exports.

```typescript
// ✅ CORRECT
private readonly logger = new Logger(NotesService.name);

async create(dto: CreateNoteDto, userId: string): Promise<NoteResponse> {
  this.logger.log(`Creating note for user ${userId}`);
  // ...
}
```

---

## 21. Database & Migrations

- **Never** use `synchronize: true` outside of isolated test environments.
- Migration file naming: `database/migrations/<timestamp>-<description>.ts`.
- All table and column name strings in migrations must reference constants from entity files.
- Index every FK column with `@Index()` on the entity.
- Index every column used in frequent `WHERE` or `ORDER BY` clauses.

---

## 22. Testing Architecture

### Unit tests — co-located with source

```
src/notes/
├── notes.service.ts
├── notes.service.spec.ts      ← unit test beside its source file
├── notes.repository.ts
└── notes.repository.spec.ts
```

### E2E tests — in `test/e2e/`

```
test/
├── e2e/
│   ├── notes.e2e-spec.ts
│   └── auth.e2e-spec.ts
└── fixtures/
    ├── note.fixture.ts        ← typed builder functions, no `any`
    └── user.fixture.ts
```

### Testing rules

- Unit tests mock all dependencies — never hit real DB or network.
- Fixtures return fully typed objects — never use `as any` in test setup.
- Every service method must have: success case, not-found case, permission-denied case (where applicable).

```typescript
// test/fixtures/note.fixture.ts
export function buildNote(overrides: Partial<Note> = {}): Note {
  return {
    id:           'note-uuid-001',
    title:        'Test Note',
    visibility:   NOTE_VISIBILITY.PRIVATE,
    status:       NOTE_STATUS.ACTIVE,
    ownerId:      'user-uuid-001',
    workspaceId:  'workspace-uuid-001',
    parentNoteId: null,
    createdAt:    new Date('2024-01-01'),
    updatedAt:    new Date('2024-01-01'),
    ...overrides,
  };
}

// src/notes/notes.service.spec.ts
describe('NotesService', () => {
  describe('findOne', () => {
    it('should return a note when it exists and the user has access', async () => {
      const note = buildNote();
      repositoryMock.findById.mockResolvedValue(note);
      permissionsMock.canUserReadNote.mockResolvedValue(true);
      await expect(service.findOne(note.id, 'user-uuid-001')).resolves.toEqual(note);
    });

    it('should throw NotFoundException when note does not exist', async () => {
      repositoryMock.findById.mockResolvedValue(null);
      await expect(service.findOne('missing-id', 'user-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user lacks permission', async () => {
      repositoryMock.findById.mockResolvedValue(buildNote());
      permissionsMock.canUserReadNote.mockResolvedValue(false);
      await expect(service.findOne('note-id', 'user-id')).rejects.toThrow(ForbiddenException);
    });
  });
});
```

---

## 23. Imports & Barrel Files

- Use path aliases — never `../../../`.
- Import order: NestJS/external libs → internal modules → types → constants. Blank line between groups.
- Never use default exports.

```jsonc
// tsconfig.json paths section
{
  "compilerOptions": {
    "paths": {
      "@auth/*":        ["src/auth/*"],
      "@users/*":       ["src/users/*"],
      "@notes/*":       ["src/notes/*"],
      "@blocks/*":      ["src/blocks/*"],
      "@workspaces/*":  ["src/workspaces/*"],
      "@permissions/*": ["src/permissions/*"],
      "@search/*":      ["src/search/*"],
      "@uploads/*":     ["src/uploads/*"],
      "@config/*":      ["src/config/*"],
      "@shared/*":      ["src/shared/*"],
      "@db/*":          ["database/*"]
    }
  }
}
```

```typescript
// ✅ CORRECT import order
import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { NotesRepository } from '@notes/notes.repository';
import { PermissionsService } from '@permissions/permissions.service';

import { Note, NoteResponse } from '@notes/types/notes.types';
import { PaginatedResult, PaginationOptions } from '@shared/types/pagination.types';

import { NOTE_ERROR_MESSAGES, NOTE_EVENTS } from '@notes/constants/notes.constants';
```

---

## 23. Advanced NestJS Best Practices

### Dependency Injection Scope
- **Default to Singleton Scope**: Avoid using `Scope.REQUEST` or `Scope.TRANSIENT` unless absolutely necessary (e.g., multi-tenant DB connections per request). They have a significant performance impact due to garbage collection and instantiation per request.

### Transaction Management
- Always handle transactions explicitly for multi-step database operations to ensure data consistency.
- Prefer passing a query runner or transaction entity manager through service methods, or use a Unit of Work / `cls-hooked` (AsyncLocalStorage) pattern to avoid cluttering business logic with transaction objects.

### Graceful Shutdown
- Enable shutdown hooks in `main.ts` (`app.enableShutdownHooks()`) to ensure database connections and server ports are closed gracefully when the application receives termination signals (SIGINT, SIGTERM).

### Logging Contexts
- Always instantiate the NestJS built-in `Logger` with the class name as context: `private readonly logger = new Logger(MyClass.name);`.
- Use correlation IDs (Request IDs) injected via middleware/interceptors to trace request flows across logs.

### Performance & Security
- **Rate Limiting**: Apply `@nestjs/throttler` to rate-limit endpoints, specifically public-facing ones (e.g., auth routes).
- **Helmet**: Always configure helmet in `main.ts` to set appropriate HTTP security headers.
- **Serialization**: Use `ClassSerializerInterceptor` combined with `@Exclude()` in entities/DTOs to prevent leaking sensitive information like passwords.

### API Versioning & Documentation
- Enable global URI versioning (e.g., `v1`, `v2`) in `main.ts`.
- Use `@nestjs/swagger` decorators on all controllers and DTOs to maintain a single source of truth for the OpenAPI specification.

---

## 25. Quick Checklist

Run through this before creating or modifying any file.

**Architecture**
- [ ] File lives in the correct directory per the Section 2 mapping table
- [ ] No logic has crossed a layer boundary (controller → repo, service → ORM, etc.)
- [ ] Cross-module access uses the exported service — not a repository or entity
- [ ] Module exports only its service — not its repository, entity, or internal helpers
- [ ] No circular module imports

**Types & Safety**
- [ ] No `any` anywhere — not even in tests
- [ ] All service methods have explicit return types
- [ ] All DTOs have `class-validator` decorators
- [ ] Response DTOs are used at the controller boundary — not raw ORM entities
- [ ] Union types derived from `as const` objects, not TypeScript `enum`

**Constants**
- [ ] No hard-coded strings or numbers in logic files
- [ ] All constants in `*.constants.ts` with `as const`
- [ ] DB table/column names come from constants
- [ ] Route paths, event names, and cache keys come from constants

**Infrastructure**
- [ ] No `process.env` accessed outside `src/config/`
- [ ] No `console.log` — only `new Logger(ClassName.name)`
- [ ] No raw ORM queries in services
- [ ] Custom exception classes used for all domain errors
- [ ] `synchronize: true` not used outside test environment

**Conventions**
- [ ] All files named in kebab-case
- [ ] No default exports
- [ ] Path aliases used — no `../../..` chains
- [ ] Barrel `index.ts` updated if a new public export was added
- [ ] Unit test co-located with source; E2E test in `test/e2e/`

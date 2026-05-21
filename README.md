<p align="center">
  <img src="docs/screenshots/landing-page.png" alt="Noteqo Landing Page" width="800" />
</p>

<h1 align="center">Noteqo</h1>

<p align="center">
  <strong>The end-to-end encrypted workspace for your ideas, documents, and team collaboration.</strong>
</p>

<p align="center">
  <a href="https://noteqo.com">Live App</a> ·
  <a href="#features">Features</a> ·
  <a href="#tech-stack">Tech Stack</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="#getting-started">Getting Started</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/NestJS-10-E0234E?logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/E2E-Encrypted-22C55E?logo=letsencrypt&logoColor=white" alt="E2E Encrypted" />
  <img src="https://img.shields.io/badge/License-Private-gray" alt="License" />
</p>

---

## Overview

**Noteqo** is a privacy-first, real-time collaborative note-taking workspace built with end-to-end encryption. Your notes are encrypted on-device before they ever leave your browser — we have zero access to your content or encryption keys.

The application combines a powerful block-based editor with real-time collaboration, offline-first architecture, and a beautiful dark-mode interface.

🔗 **Live at [noteqo.com](https://noteqo.com)**

---

## Screenshots

### Landing Page

<p align="center">
  <img src="docs/screenshots/landing-page.png" alt="Noteqo Landing Page" width="800" />
</p>

### Rich Block Editor

A powerful Notion-inspired editor with sidebar navigation, slash commands, drag-and-drop blocks, code highlighting, callouts, task lists, and more.

<p align="center">
  <img src="docs/screenshots/editor-view.png" alt="Noteqo Editor" width="800" />
</p>

---

## Key Highlights

<table>
  <tr>
    <td align="center" width="33%">🔐<br/><strong>E2E Encrypted</strong><br/><sub>AES-256-GCM encryption on-device. Zero-knowledge architecture.</sub></td>
    <td align="center" width="33%">👥<br/><strong>Real-Time Collaboration</strong><br/><sub>Yjs CRDT-powered live editing with cursor presence.</sub></td>
    <td align="center" width="33%">📡<br/><strong>Offline-First</strong><br/><sub>IndexedDB persistence. Works without internet.</sub></td>
  </tr>
  <tr>
    <td align="center">✏️<br/><strong>Block Editor</strong><br/><sub>Slash commands, drag handles, code blocks, callouts.</sub></td>
    <td align="center">🤖<br/><strong>AI Assistant</strong><br/><sub>Streaming text generation and summarization.</sub></td>
    <td align="center">🔍<br/><strong>Search & Organize</strong><br/><sub>Full-text search, note trees, and workspaces.</sub></td>
  </tr>
</table>

### 🔐 End-to-End Encryption
- Notes are encrypted client-side using **AES-256-GCM** before leaving the browser
- RSA key pairs for secure key exchange between collaborators
- Zero-knowledge architecture — the server never sees plaintext content
- Exportable recovery keys for account security

### ✏️ Rich Block Editor
- Notion-inspired slash command menu with fuzzy search
- Block types: headings, paragraphs, bullet/numbered lists, task lists, code blocks, blockquotes, callouts, accordions, horizontal rules
- Multi-column layout support with drag-to-resize
- Floating toolbar with formatting actions (bold, italic, underline, strikethrough, code, link)
- Drag handle for block reordering
- Emoji picker with category browsing and search
- Markdown shortcuts support

### 👥 Real-Time Collaboration
- **Yjs CRDT-based** conflict-free real-time editing
- Live cursor presence with user avatars and color assignment
- WebSocket gateway for instant document synchronization
- Encrypted collaboration — all sync traffic is E2E encrypted
- Works offline — changes merge automatically when reconnecting

### 🔍 Search & Organization
- Full-text search with debounced input and highlighted results
- Hierarchical note tree with collapsible folders
- Workspace spaces with role-based access control (owner, admin, editor, viewer)
- Breadcrumb navigation for nested note paths

### 🤖 AI Writing Assistant
- Integrated AI assistant with streaming responses
- Text generation, summarization, and tone adjustment
- Context-aware prompts within the editor

### 📁 Encrypted Media
- File uploads encrypted client-side before storage on Vercel Blob
- Image and file attachment blocks with inline preview
- Zero-knowledge media storage with client-held decryption keys

### 📱 Offline-First & PWA
- Full offline support via Service Worker and IndexedDB persistence
- Progressive Web App — installable on desktop and mobile
- Automatic sync when connectivity is restored

### 🎨 Design System
- Comprehensive design token system with CSS custom properties
- Light and dark theme with system preference detection
- Built on Radix UI primitives and shadcn/ui components
- Smooth transitions and micro-animations

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **Vite** | Build tool and dev server |
| **React 19** | UI framework |
| **TypeScript** (strict) | Type-safe development |
| **React Router v6** | Client-side routing with lazy loading |
| **TanStack React Query v5** | Server state management and caching |
| **TipTap v3** | Rich text editor framework |
| **Yjs** | CRDT for real-time collaboration |
| **Radix UI / shadcn** | Accessible UI primitives |
| **Tailwind CSS + SCSS** | Styling with design tokens |
| **Dexie (IndexedDB)** | Client-side encrypted storage |
| **Web Crypto API** | AES-256-GCM / RSA encryption |

### Backend

| Technology | Purpose |
|---|---|
| **NestJS** | Backend framework |
| **TypeScript** | Type-safe server code |
| **PostgreSQL** | Primary database |
| **TypeORM** | Database ORM with migrations |
| **WebSocket Gateway** | Real-time collaboration sync |
| **Server-Sent Events** | Live notifications |
| **Vercel Blob** | Encrypted file storage |
| **JWT (RS256)** | Authentication with RSA key pairs |

---

## Architecture

```
noteqo-v3/
├── backend/                  # NestJS API server
│   └── src/
│       ├── auth/             # JWT authentication & guards
│       ├── collaboration/    # Yjs CRDT WebSocket gateway
│       ├── config/           # Environment & service config
│       ├── events/           # Server-Sent Events
│       ├── media/            # Encrypted file storage
│       ├── notes/            # Notes CRUD & versioning
│       ├── spaces/           # Workspaces & RBAC
│       ├── sync/             # Data synchronization
│       └── users/            # User management
├── frontend/                 # Vite + React 19 SPA
│   └── src/
│       ├── components/       # Shared UI components
│       │   ├── core/         # App shell (Header, Sidebar)
│       │   ├── ui/           # shadcn design primitives
│       │   └── Providers/    # Global context providers
│       ├── features/         # Feature modules ★
│       │   ├── ai/           # AI writing assistant
│       │   ├── auth/         # Authentication flows
│       │   ├── crypto/       # E2E encryption services
│       │   ├── editor/       # Block editor & extensions
│       │   ├── media/        # Encrypted media handling
│       │   ├── realtime/     # Yjs CRDT provider
│       │   ├── spaces/       # Workspace management
│       │   ├── storage/      # IndexedDB persistence
│       │   └── workspace/    # Notes & library views
│       ├── layouts/          # Route layout wrappers
│       ├── services/         # Global API client
│       └── styles/           # Global CSS & design tokens
└── docs/                     # Architecture documentation
```

The project follows a **feature-first architecture** — each domain is a self-contained module with its own components, hooks, services, types, and constants. See [`docs/architecture-blueprint.md`](docs/architecture-blueprint.md) for the complete coding standards.

### Key Architecture Decisions

- **Component → Hook → Service → API Client** layering — components never call services directly
- **Named exports only** — no default exports for better tree-shaking and refactoring
- **Strict TypeScript** — no `any`, always `import type` for type-only imports
- **Feature isolation** — features only import from other features via barrel `index.ts` exports

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **PostgreSQL** ≥ 14
- **pnpm** or **npm**

### Installation

```bash
# Clone the repository
git clone https://github.com/singh-taranjeet/noteqo-v3.git
cd noteqo-v3

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install
```

### Environment Setup

Create `.env` files in both `frontend/` and `backend/` directories:

**Backend `.env`**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/noteqo
JWT_PUBLIC_KEY=<your-rsa-public-key>
JWT_PRIVATE_KEY=<your-rsa-private-key>
BLOB_READ_WRITE_TOKEN=<vercel-blob-token>
PORT=3001
```

**Frontend `.env`**
```env
VITE_API_URL=http://localhost:3001
```

### Development

```bash
# Start the backend (from /backend)
npm run start:dev

# Start the frontend (from /frontend)
npm run dev
```

The frontend runs at `http://localhost:5173` and the backend API at `http://localhost:3001`.

---

## Deployment

The application is deployed on **[Render](https://render.com)**:

- **Frontend**: Static site build with Vite (`npm run build`)
- **Backend**: Web service running NestJS
- **Database**: Managed PostgreSQL on Render
- **Storage**: Vercel Blob for encrypted file storage

Live at **[noteqo.com](https://noteqo.com)**

---

## Project Standards

- **Conventional Commits** — all commit messages follow the [Conventional Commits](https://www.conventionalcommits.org/) specification
- **Feature-First Organization** — code is grouped by domain, not by file type
- **Strict TypeScript** — zero `any` types, explicit return types on hooks and services
- **Architecture Blueprint** — see [`docs/architecture-blueprint.md`](docs/architecture-blueprint.md)

---

## License

This project is proprietary. All rights reserved.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/singh-taranjeet">Taranjeet Singh</a>
</p>

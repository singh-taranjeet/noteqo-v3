# E2E Encrypted Note Editor — Architecture & Design Reference

> A comprehensive reference covering competitive research, import architecture, encryption design, and team collaboration flows for an offline-first, end-to-end encrypted note editor.

---

## Table of Contents

1. [Competitive Landscape](#1-competitive-landscape)
2. [Market Gaps & Opportunities](#2-market-gaps--opportunities)
3. [Import Architecture](#3-import-architecture)
4. [E2E Encryption — Core Design](#4-e2e-encryption--core-design)
5. [Team Collaboration with E2E](#5-team-collaboration-with-e2e)
6. [Concurrent Write Strategy](#6-concurrent-write-strategy)
7. [Database Schema](#7-database-schema)
8. [Crypto Stack Reference](#8-crypto-stack-reference)
9. [Implementation Priorities](#9-implementation-priorities)

---

## 1. Competitive Landscape

### Major players

| App | E2E Encryption | Offline-first | Block Editor | Real-time Collab | Relational DB | AI Built-in |
|---|---|---|---|---|---|---|
| **Notion** | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ (costly) |
| **Obsidian** | ~ (paid sync) | ✓ | ✗ | ✗ | ~ (plugin) | ~ (plugin) |
| **Anytype** | ✓ | ✓ | ✓ | ~ | ✓ | ✗ |
| **Joplin** | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Standard Notes** | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Monday / Airtable** | ✗ | ✗ | ✗ | ✓ | ✓ | ~ |
| **Your app** | ✓ | ✓ | ✓ | ~ (goal) | ~ (goal) | ~ (goal) |

### Key observations

- **Notion** dominates with ~25% market share but stores everything unencrypted in the cloud. Their AI features send notes to third-party providers.
- **Obsidian** is local-first but requires a paid add-on for E2E sync and has no visual block editor or real-time collaboration.
- **Anytype** is the closest competitor — E2E encrypted, offline-first, block editor — but P2P sync is slow, the ecosystem is small, and mobile is rough.
- **Joplin** and **Standard Notes** have real E2E but very basic editors (plain Markdown / plain text).
- **No single tool** currently combines E2E encryption + a quality block editor + offline-first. That is your primary market position.

---

## 2. Market Gaps & Opportunities

### Critical gaps

#### 1. E2E + rich block editing don't coexist
Apps with E2E have basic editors. Apps with great block editors lack E2E. Nobody has both production-grade. This is your primary positioning.

#### 2. Conflict-free offline sync
Offline apps like Obsidian create sync conflicts across devices. Cloud apps lose offline entirely. A properly designed encrypted sync that handles conflicts gracefully is unsolved at the consumer level.

### Opportunities

#### 3. Encrypted real-time collaboration (future)
Real-time collaboration traditionally requires the server to see document state. No mainstream tool offers true multi-user E2E collaboration. Large future whitespace.

#### 4. Painless data migration
Users cite data migration as the top barrier to switching apps. First-class import from Notion, Obsidian, Joplin, etc. is a strong trust signal.

#### 5. On-device AI (private)
Notion AI sends data to third-party LLMs. Privacy-conscious users want AI (summaries, search, writing help) that runs locally. Nobody has solved this at consumer scale yet.

#### 6. First-class mobile UX
Notion and Obsidian are desktop-centric. Mobile offline capture with encrypted sync on reconnect is largely unsolved.

#### 7. Simple team notes without project management bloat
Monday and Airtable are overkill. There's a gap for a focused, private, team-note tool that doesn't morph into a full PM suite.

---

## 3. Import Architecture

### The universal import pipeline

```
Ingest → Parse → Normalise → Asset fetch → Preview → Commit + encrypt
```

| Stage | What happens |
|---|---|
| **Ingest** | Accept zip, folder, API token, or file drop. Auto-detect source format. |
| **Parse** | Format-specific parser: Markdown+YAML, Notion blocks, HTML, JSON. |
| **Normalise** | Map to your internal block model. Resolve links, tags, hierarchy. |
| **Asset fetch** | Download & re-host all images/attachments. Notion URLs expire ~1h. |
| **Preview** | Show user what will import, warn on data loss, allow folder remapping. |
| **Commit + encrypt** | Write to local store, encrypt with user's key, queue sync. Never block UI. |

### Source format guide

#### Notion

- **Best API path:** Use the [Notion Markdown API](https://developers.notion.com/guides/data-apis/working-with-markdown-content) (launched Feb 2026) — one API call returns a clean Markdown string per page for public integrations.
- **Manual export:** Zip contains HTML + Markdown + CSV. HTML best preserves hierarchy.
- **Watch out for:**
  - Image URLs are pre-signed S3 — **expire in ~1 hour**. Download all assets immediately.
  - Databases export as CSV; subpages export as individual Markdown files in subfolders.
  - Callouts have no Markdown equivalent — exported as HTML or `:::callout` fences.
  - API rate limit: **3 requests/second** — implement exponential backoff for large workspaces.
  - Synced blocks export as a reference ID, not actual content — resolve manually.
- **Recommended library:** [`notion-to-md`](https://github.com/souvikinator/notion-to-md) (40k+ weekly downloads)

#### Obsidian

- **Format:** Plain `.md` files in a folder (the vault).
- **Metadata:** YAML frontmatter in `---` delimiters at the top of each file. Parse with a YAML library, not regex.
- **Wikilinks:** `[[Note Title]]` syntax — convert to your internal link format. Preserve alias syntax: `[[Target|Display Text]]`.
- **Block references:** `[[Note^block-id]]` and heading refs `[[Note#Heading]]` need special handling — map to new internal IDs.
- **Attachments:** Live in a configurable folder (default: `/attachments`). Check `.obsidian/app.json` for the actual path.
- **Dataview inline fields:** `key:: value` syntax is not standard Markdown — parse separately or ignore gracefully.
- **Recommended library:** [`obsidianmd-parser`](https://pypi.org/project/obsidianmd-parser/) (Python) or walk the folder directly in Node.js.

#### Joplin

- **Format:** `.jex` — a tar archive of Markdown files + a `resources/` folder for attachments.
- Each note has a UUID, title, and parent notebook UUID in its Markdown frontmatter.
- Internal note links use `:/note-uuid` syntax — map UUIDs to your new note IDs.
- Tag associations stored in separate tag files within the archive.
- Always prefer JEX over raw Markdown export (raw loses attachments).

#### Standard Notes

- Backup exports as a `.txt` file containing a JSON array of note objects.
- Each note has `content.text` (body), `content.title`, and a `content_type` field.
- Tags are separate items in the JSON with their own UUIDs — resolve associations from `references` arrays.
- Encrypted backups require the user's password to decrypt before parsing — never store passwords.

#### Apple Notes / Bear

- Apple Notes: exports individual `.enex` or HTML files. No bulk export API.
- Bear: exports as `.bear2bk` (zip of Markdown + assets) or individual `.md` files.
- Bear uses `#tag/subtag` inline in text — parse separately from headings.
- For Apple Notes HTML, use Turndown.js to convert to Markdown.

#### Generic HTML / Markdown fallback

- Use **Turndown.js** (HTML→MD) as the universal fallback for any HTML source.
- Use **unified / remark** for Markdown AST parsing — gives a structured block tree.
- Accept `.md`, `.txt`, `.html`, `.htm` as drag-and-drop targets at minimum.

### Data fidelity — Notion

| Element | Survives import? |
|---|---|
| Headings, paragraphs, lists | ✓ Full |
| To-do / task lists | ✓ Full |
| Tables | ~ Partial (no formulas) |
| Page hierarchy | ✓ Via folders |
| Inline images | ~ Must fetch before expiry |
| Callout blocks | ~ HTML export only |
| Page comments | ~ HTML export only |
| Database views & filters | ✗ Lost |
| Relational links between DBs | ✗ Lost |
| Embeds (Figma, Loom, etc.) | ✗ Lost |

### Data fidelity — Obsidian

| Element | Survives import? |
|---|---|
| Note content (Markdown) | ✓ Full |
| YAML frontmatter metadata | ✓ Full |
| Tags | ✓ Full |
| Folder structure | ✓ Full |
| Attachments | ✓ Full (local files) |
| Wikilinks `[[…]]` | ~ Resolve or convert |
| Backlinks graph | ~ Rebuild from links |
| Block references `^id` | ~ Map to new IDs |
| Dataview queries | ✗ Lost (plugin-only) |
| Canvas files `.canvas` | ✗ JSON — custom parse needed |

### Import UX best practices

1. **Auto-detect the source format** — sniff zip/folder structure. Never make users select their source manually.
2. **Show a preview before committing** — tree of notes, count, and list of data that will be lost or degraded.
3. **Import is non-destructive** — always import into a dated folder (`Imported from Notion — 2026-04-09`). Never overwrite existing notes.
4. **Async with progress + resumability** — run in a background worker, show live progress, resume on restart.
5. **Fetch and re-host all assets** — download every image during import, store locally encrypted. Broken images weeks later destroy trust.
6. **Preserve original IDs as metadata** — store `source: notion`, `source_id: abc123` on each note. Enables de-duplication on re-import.
7. **Produce an import report** — "483 notes imported, 12 skipped, 3 images failed." List failed items with actionable next steps.
8. **Offer a "keep Markdown raw" option** — some Obsidian users want `[[wikilinks]]` preserved as-is.

---

## 4. E2E Encryption — Core Design

### The three keys

| Key | Type | Purpose |
|---|---|---|
| **User keypair** | Asymmetric (X25519) | Each user has a public key (on server) and private key (on device only). |
| **Document key** | Symmetric (AES-256) | One per note. Encrypts all content. Must be distributed to collaborators. |
| **Encrypted key slot** | Envelope | The document key encrypted with a collaborator's public key. One slot per user per note. |

### How envelope encryption works

```
┌─────────────────────────────────────────────┐
│  Note content (plaintext)                   │
│         ↓                                   │
│  AES-256-GCM encrypt with docKey            │
│         ↓                                   │
│  Ciphertext → stored on server              │
│                                             │
│  docKey → encrypted with User 1 public key  │  ← key slot for User 1
│  docKey → encrypted with User 2 public key  │  ← key slot for User 2
│         ↓                                   │
│  Both key slots → stored on server          │
└─────────────────────────────────────────────┘
```

The server stores only ciphertext and key slots — both opaque. It cannot read the content or the document key.

### Creating a note

```
1. docKey = crypto.getRandomValues(new Uint8Array(32))
2. ciphertext = AES-256-GCM.encrypt(docKey, plaintext)
3. mySlot = box.seal(docKey, myPublicKey)
4. Upload ciphertext + mySlot to server
```

### Reading a note

```
1. Fetch mySlot from server
2. docKey = box.open(mySlot, myPrivateKey)
3. Fetch ciphertext from server
4. plaintext = AES-256-GCM.decrypt(docKey, ciphertext)
5. Render in editor
```

### Writing changes to a note

```
1. docKey already in memory from read step
2. newCiphertext = AES-256-GCM.encrypt(docKey, newPlaintext)
3. Upload newCiphertext to server (replace old)
4. Key slots for all members unchanged — same docKey
```

### Key derivation (user private key storage)

The user's private key must be stored securely on-device, protected by their password:

```
masterKey   = Argon2id(password, salt, { memory: 64MB, iterations: 3 })
storedBlob  = AES-256-GCM.encrypt(masterKey, privateKey)
```

Store `storedBlob` locally (and optionally back it up encrypted to the server — the server can't decrypt it without the user's password).

### What the server stores

| Field | Server can read? | Notes |
|---|---|---|
| `users.publicKey` | ✓ Yes | Intentionally public |
| `notes.ciphertext` | ✗ No | Opaque blob |
| `key_slots.encryptedDocKey` | ✗ No | Meaningless without private key |
| `notes.version` | ✓ Yes | Integer, no sensitive content |
| `notes.updatedAt` | ✓ Yes | Timestamp metadata only |
| `team_members` | ✓ Yes | User IDs + note IDs (access list) |

### Encrypt everything — including metadata

Don't stop at the body. Encrypt:
- Note title
- Tags and folder names
- Attachment filenames
- Any user-created labels or categories

The server should see only: user IDs, note IDs, timestamps, and access lists.

---

## 5. Team Collaboration with E2E

> This covers async collaboration (no real-time sync) — the simplest and most robust approach.

### One-time setup per user

```
1. On signup: generate keypair locally
     publicKey  → upload to server (safe, inherently public)
     privateKey → encrypt with password-derived key, store locally

2. Prompt for recovery phrase / key backup
   (If user loses device + no backup → loses access to all notes)
```

### Adding a team member to a note

The owner must be online (or have their private key available) to do this:

```
1. Fetch teammate's publicKey from server (by user ID or email)
2. Decrypt your own key slot:
     docKey = box.open(mySlot, myPrivateKey)
3. Create their key slot:
     theirSlot = box.seal(docKey, theirPublicKey)
4. Upload theirSlot to server, associated with this note + their user ID
```

After step 4, the teammate can independently read and write the note — even when you are offline.

### Teammate reads or writes

**Reading:**
```
1. Fetch their key slot from server
2. docKey = box.open(theirSlot, theirPrivateKey)
3. Fetch ciphertext
4. plaintext = AES-256-GCM.decrypt(docKey, ciphertext)
```

**Writing:**
```
1. docKey already in memory from read
2. Edit note in editor
3. On save: newCiphertext = AES-256-GCM.encrypt(docKey, newPlaintext)
4. Upload newCiphertext, bump version number
```

### Removing a team member

Removing their key slot from the server is not enough — they already have `docKey` on their device. **You must rotate the document key:**

```
1. Generate a new docKey:
     newDocKey = crypto.getRandomValues(new Uint8Array(32))

2. Re-encrypt key slots for all remaining members:
     for each remainingUser:
       newSlot = box.seal(newDocKey, remainingUser.publicKey)
     Upload all new slots atomically

3. Re-encrypt the note content:
     newCiphertext = AES-256-GCM.encrypt(newDocKey, plaintext)
     Upload newCiphertext

4. Delete removed member's key slot from server
```

> **Important to communicate to users:** The removed member can still decrypt content they downloaded before the rotation. Key rotation only prevents access to content written after the moment of removal. This is the same limitation that Signal has, and is the honest behaviour of any E2E system.

### Invite flow options

**Option A — Owner-mediated (simpler, recommended to start)**

- Owner generates a one-time invite token, shares a link: `app://join/{docId}/{inviteToken}`
- Invitee signs up/logs in, their public key is registered on the server
- Owner's client fetches their public key, creates their key slot
- Owner must be online when the invite is redeemed (or within a reasonable window)

**Option B — Pre-key / async invite (Signal-style, more complex)**

- Owner pre-generates encrypted key bundles before the invitee joins
- Server stores these bundles; invitee picks one up when they join
- Owner does not need to be online when the invite is redeemed
- Requires more complex key management (pre-key rotation, one-time pre-keys)

Start with Option A. Move to Option B if async invites become a pain point.

---

## 6. Concurrent Write Strategy

Since there is no real-time sync, two users editing the same note simultaneously will produce conflicting saves.

### Option A — Version conflict detection (recommended)

Every save includes a `version` number. If a teammate saves while you had an older version open, the server rejects your save:

```
Client sends: PUT /notes/{id}  { ciphertext, version: 5 }
Server checks: current version is 6 → reject with 409 Conflict
Client shows: "This note was updated while you were editing. Review the differences."
```

Show a simple diff UI — user manually merges. Honest and transparent.

### Option B — Last-write-wins with version history

Accept every save. Keep the last N encrypted snapshots:

```
notes_versions table:
  note_id, ciphertext, version, saved_by_user_id, saved_at
```

If User 2 overwrites your work, you can restore from version history. Since all versions use the same `docKey`, decrypting any historical snapshot is trivial.

**Recommendation:** Implement version history regardless of which conflict strategy you choose. It is low cost (encrypted blobs are small) and provides a strong safety net that builds user trust.

---

## 7. Database Schema

```sql
-- Users and keys
CREATE TABLE users (
  id          UUID PRIMARY KEY,
  email       TEXT UNIQUE NOT NULL,
  public_key  BYTEA NOT NULL,          -- X25519 public key (safe to store)
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Encrypted notes
CREATE TABLE notes (
  id           UUID PRIMARY KEY,
  ciphertext   BYTEA NOT NULL,         -- AES-256-GCM encrypted content
  version      INTEGER DEFAULT 1,      -- for conflict detection
  created_by   UUID REFERENCES users(id),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Key slots — one row per (user, note) pair
CREATE TABLE key_slots (
  note_id           UUID REFERENCES notes(id) ON DELETE CASCADE,
  user_id           UUID REFERENCES users(id) ON DELETE CASCADE,
  encrypted_doc_key BYTEA NOT NULL,    -- docKey encrypted with user's public key
  PRIMARY KEY (note_id, user_id)
);

-- Version history
CREATE TABLE note_versions (
  id         UUID PRIMARY KEY,
  note_id    UUID REFERENCES notes(id) ON DELETE CASCADE,
  ciphertext BYTEA NOT NULL,           -- snapshot at time of save
  version    INTEGER NOT NULL,
  saved_by   UUID REFERENCES users(id),
  saved_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Team / workspace membership (optional layer above note-level access)
CREATE TABLE team_members (
  team_id  UUID,
  user_id  UUID REFERENCES users(id),
  role     TEXT DEFAULT 'member',      -- 'owner', 'editor', 'viewer'
  PRIMARY KEY (team_id, user_id)
);
```

> The server never stores plaintext content, document keys, or user private keys. All sensitive data is opaque ciphertext or encrypted key material.

---

## 8. Crypto Stack Reference

### Recommended libraries

| Purpose | Library | Notes |
|---|---|---|
| Keypair generation + key slots | `tweetnacl-js` or `libsodium-wrappers` | X25519 + XSalsa20-Poly1305. Battle-tested, sensible defaults. |
| Symmetric encryption (content) | Web Crypto API (`crypto.subtle`) | Native, hardware-accelerated. No library needed. |
| Key derivation (password → master key) | `argon2-browser` | Argon2id, memory-hard. Never use PBKDF2 for new apps. |
| CRDT sync (if added later) | `yjs` | Yjs produces binary deltas — encrypt each delta with `docKey` before sending. |

### Primitives summary

```
Key derivation:   Argon2id(password, salt, { m: 65536, t: 3, p: 1 }) → 32 bytes
Keypair:          X25519 (via tweetnacl box.keyPair())
Key slot:         box.seal(docKey, recipientPublicKey)   → opaque blob
Slot open:        box.open(slot, myPrivateKey)           → docKey
Content encrypt:  AES-256-GCM, 96-bit random nonce per operation
Content decrypt:  AES-256-GCM, nonce prepended to ciphertext
```

### Security notes

- **Never reuse a nonce** with the same key. Generate `crypto.getRandomValues(12 bytes)` per encryption operation and prepend it to the ciphertext.
- **Verify public keys** — display key fingerprints in the UI (like Signal's safety numbers) so users can detect if the server ever substitutes a malicious key.
- **Private key backup** — prompt users to save a recovery phrase (BIP-39 mnemonic) or download an encrypted key file. A lost private key with no backup = permanent data loss.
- **Do not send passwords to the server** — derive an auth token separately from the master key (use a different KDF output or HKDF sub-key). The master key and the auth credential must be cryptographically independent.
- **Encrypt note titles and metadata** — do not leak information through unencrypted fields. The server should only see IDs, timestamps, and access lists.

---

## 9. Implementation Priorities

### Phase 1 — Core (ship this first)

- [ ] User keypair generation + encrypted private key storage
- [ ] Password-based key derivation (Argon2id)
- [ ] Per-note document key generation
- [ ] AES-256-GCM encrypt/decrypt for note content
- [ ] Key slots: create, fetch, decrypt
- [ ] Basic block editor (Tiptap or BlockNote)
- [ ] Offline-first local storage (SQLite or IndexedDB with encrypted blobs)
- [ ] Single-user flow working end-to-end

### Phase 2 — Team collaboration

- [ ] Public key registry on server
- [ ] Owner-mediated invite flow (invite token → key slot creation)
- [ ] Async read/write for team members
- [ ] Version numbering + conflict detection UI
- [ ] Version history (last N encrypted snapshots)
- [ ] Member removal + key rotation

### Phase 3 — Import

- [ ] Notion import (Markdown API + zip fallback)
- [ ] Obsidian vault import
- [ ] Generic Markdown / HTML import
- [ ] Asset fetching + local re-hosting
- [ ] Import progress UI + import report

### Phase 4 — Polish & growth

- [ ] Mobile app (React Native or Flutter) — offline-first from day one
- [ ] Recovery phrase / key backup flow
- [ ] Key fingerprint verification UI
- [ ] Joplin + Standard Notes import
- [ ] On-device AI (Ollama / llama.cpp via WASM) — local summarisation and search
- [ ] Optional: real-time collaboration (Yjs + encrypted delta sync)

---

## Appendix: Useful references

- [Yjs documentation](https://docs.yjs.dev) — CRDT library for future real-time sync
- [tweetnacl-js](https://github.com/dchest/tweetnacl-js) — X25519 + XSalsa20-Poly1305 in the browser
- [libsodium-wrappers](https://github.com/jedisct1/libsodium.js) — full libsodium port for JS
- [argon2-browser](https://github.com/antelle/argon2-browser) — Argon2id in the browser via WASM
- [Notion Markdown API](https://developers.notion.com/guides/data-apis/working-with-markdown-content) — native page-as-markdown endpoint
- [notion-to-md](https://github.com/souvikinator/notion-to-md) — Notion block-to-Markdown conversion library
- [CryptPad](https://cryptpad.org) — open-source E2E encrypted collaborative office suite (study their architecture)
- [Local-first software](https://www.inkandswitch.com/local-first/) — Ink & Switch essay, the conceptual foundation for this architecture

---

*Generated from research and design session — April 2026*

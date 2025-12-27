---
conversation: https://chatgpt.com/c/68f2a33c-f3a8-832a-b9b3-5d40808060e6
---

# Architecture & Decisions — macOS Budget App (YNAB-style) with Swift + Deno + WebView

We’re building a **macOS-native** document app with a **Swift + WKWebView
shell**, a **TypeScript logic core** running in **Deno** (compiled to a single
binary), and a **React-like UI** that communicates exclusively through a
**simple IPC surface**. The UI operates on **windowed** data (1–5 months) and
recomputes visible availability instantly, while the Deno layer remains the
**source of truth**, streaming **authoritative patches** after each mutation and
on external changes. File operations are fully **macOS-native** (NSDocument,
autosave, file coordination, security-scoped bookmarks). The UI is
**adapter-swappable**: the same code runs in the mac app and on the web via a
mock IPC. tRPC over IPC provides clear contracts and excellent **editor
jump-to-definition** across the boundary. We avoid unnecessary overhead (no
HTTP, no bundled Chromium, no initial client caching), keeping the system small,
fast, and straightforward to build and maintain.

## 1) Product & UX Goals

- **Local-first, snappy UI** focused on numeric data entry in a budget grid.
- **Windowed data view**: the interface loads and operates on **1–5 months** at
  a time rather than the entire dataset.
- **Single-document app behavior**: one window operates on one budget file.
- **Cross-target UI**: the same UI should run in the macOS app and on a website
  as a demo, differing only by the data adapter.

**Why**: Keeps the app fast and memory-efficient, aligns with macOS document UX,
and allows a public demo without coupling the UI to the desktop runtime.

---

## 2) Platform & Runtime Stack

- **macOS only** target, packaged as a native `.app`.
- **Swift + WKWebView** as the host shell. No bundled Chromium.
- **Deno** for TypeScript “server” logic compiled into a single binary and
  shipped inside the `.app`.
- **No embedded HTTP server**: communication is via a **custom IPC bridge**
  rather than localhost networking.

**Why**:

- WKWebView gives a small footprint and native performance on macOS.
- Deno lets us write the core logic in TypeScript while producing a single
  signed binary.
- Removing HTTP eliminates unnecessary moving parts and permissions prompts,
  while keeping performance extremely high.

---

## 3) File Model & macOS Integration

- **Swift owns file I/O** (Option A). The Swift layer is authoritative for
  opening, saving, autosaving, and coordinating access to the document file.
- **NSDocument** document model for first-class macOS behavior: recent
  documents, autosave-in-place, file versioning, and safe writes.
- **Security-scoped bookmarks** used for sandbox friendliness and
  future-proofing: when a user picks a file, we store a bookmark, and on later
  launches we resolve it to regain access without re-prompting.
- **External changes** handled via **NSFilePresenter**: the app is notified when
  the file changes on disk (e.g., iCloud or another app), and we reload or merge
  accordingly.

**Why**:

- Using NSDocument aligns with macOS expectations and reduces boilerplate for
  save/restore/versions.
- Security-scoped bookmarks are the standard macOS solution for persisting
  user-granted access in sandboxed contexts.
- NSFilePresenter integrates cleanly with coordinated file changes and avoids
  race conditions.

---

## 4) Process & IPC Topology

- **Three layers**:

  1. **Frontend** (React or Preact) running inside WKWebView.
  2. **Swift bridge** handling communication with the WebView and the Deno
     process.
  3. **Deno process** (compiled single binary) doing
     parse/serialize/mutate/compute work.

- **Transport**:

  - All UI interactions go through a single global IPC surface in the WebView
    (conceptually `window.__ipc`).
  - Swift forwards requests and responses between the WebView and the Deno
    process over stdin/stdout.
  - No sockets or HTTP; messages are serialized and streamed over the process
    pipes.

**Why**:

- Keeps the architecture simple, fast, and self-contained.
- The same IPC surface can be **mocked** in the browser demo[^1], so the UI
  stays identical across targets.

---

## 5) API Contract Between UI and Logic

- **tRPC over IPC**: the UI talks to a tRPC client; Swift just relays; Deno
  hosts the tRPC router.
- **Editor integration requirement** (“click to definition”): the tRPC
  **router** and **procedure symbols** live in a shared TypeScript workspace
  package with declaration maps, enabling the editor to jump from client usage
  to server resolver source.

**Why**:

- tRPC provides end-to-end type inference and excellent developer ergonomics.
- A shared router package with declaration maps guarantees high editor
  integration without coupling the UI to runtime details.

---

## 6) Data Loading Strategy (Windowed Views)

- The UI displays a **window** (1–5 months) at any time.

- When the user scrolls, we **load/unload** month windows incrementally.

- The server returns:

  - The **window data** necessary for those months.
  - A **carry-in** value per category for the month immediately **before** the
    window.

- The UI uses the carry-in to **recompute availability locally** for months
  within the visible window when a user edits a value, for instant feedback.

**Why**:

- Keeps the frontend light while preserving a responsive feel.
- Avoids loading the entire dataset and allows smooth paging without heavy state
  in the browser.

---

## 7) Mutation & Consistency Model

- **Server is the source of truth** for the full dataset.
- **Immediate local response** in the UI: when a user edits a visible cell, the
  UI recomputes the visible months using the carry-in (fast math in the window).
- **Authoritative reconciliation**: the UI then **notifies Deno** of the change.
  Deno applies the mutation to the canonical dataset, performs any required
  cascading recalculations, and returns **authoritative patches** for the
  visible window.
- **Streaming patches**: Deno can continue to stream **additional patches** for
  months outside the visible window (e.g., cascading availability), without
  blocking the UI.

**Why**:

- Delivers instant perceived performance while ensuring eventual consistency
  with the canonical dataset.
- Streaming avoids large payloads and keeps the UI updated as background
  computations finish.

---

## 8) State Shape & Patches

- The UI maintains **only** the current window state plus per-category
  **carry-in** for the month prior to the window.
- **Patches** are the unit of synchronization:

  - They target cells (category, month) and update specific fields (e.g.,
    budgeted, activity, available).
  - The UI applies patches to its current window state as they arrive.

**Why**:

- Patches keep synchronization efficient and straightforward.
- The UI stays stateless beyond the window, making paging and memory usage
  predictable.

---

## 9) Caching & Optimistic Updates

- **Not used initially**.
- With a local stdin/stdout transport, latency is already near-instant, so
  client caching and optimistic layers aren’t necessary to achieve snappy UX.
- The UI simply reflects the window state, applies local recompute for visible
  months on input, and then applies server patches as they arrive.

**Why**:

- Reduces complexity up-front.
- We only add caching or optimism later if a real need emerges.

---

## 10) UI Framework Choice

- The UI will be built in a **React-like** framework: either **React** or
  **Preact**.
- Both follow the same architectural pattern and work identically with the
  IPC+tRPC approach.
- The choice can be made at implementation time without affecting the
  architecture.

**Why**:

- Keeps flexibility while preserving the data boundary and transport decisions.
- Either option supports the performance and developer experience goals for a
  numeric grid UI.

---

## 11) Cross-Target UI (macOS app & Web Demo)

ref: [^1]

- The UI talks to a **single IPC surface**.
- **macOS app**: Swift implements the IPC by relaying to the Deno process.
- **Web demo**: a **mock IPC** implements the same surface in the browser (or an
  HTTP-backed shim), so the UI logic is unchanged.

**Why**:

- Maximizes code reuse and keeps the UI truly decoupled from platform concerns.
- Enables an easy public demo without the desktop runtime.

---

## 12) Build, Packaging, Signing

- **Deno compile** produces a single binary with the TypeScript server logic.
- The `.app` bundle includes:

  - The Swift executable (host).
  - The compiled Deno binary (logic).
  - Local UI assets.

- **Codesigning & notarization** are applied to the app and included binaries.
- No additional browser engine is bundled — WKWebView is used.

**Why**:

- Keeps the app footprint small and distribution simple.
- Aligns with Apple’s signing/notarization flow and leverages the built-in
  WebKit engine.

---

## 13) Dataset Size & Performance

- **Server-side indexing and fast recompute** are assumed for the canonical
  dataset to handle cascading availability efficiently.
- The UI receives only the necessary **window** and **carry-in**, keeping
  rendering fast and predictable.
- **Patches are chunked** if needed to avoid UI jank when large updates cascade.

**Why**:

- Efficient computation lives where it belongs (the Deno layer).
- The UI remains responsive even with large underlying datasets.

---

## 14) MoneyMoney & Budget Libraries

- There will be a standalone **TypeScript library** for working with budget
  files: parse, serialize, window extraction, and domain math.
- There will also be a **TypeScript client** for **MoneyMoney** to support
  transaction import and categorization syncing.
- These live as reusable packages and are used by the Deno layer (and
  potentially by tooling or a CLI).

**Why**:

- Separates domain logic from app plumbing.
- Enables reuse in the desktop app and any supporting tools.

_(Note: Integration details are intentionally out of scope here, since the plan
is to build these libraries as standalone packages; this document captures the
decision to structure them as such.)_

---

## 15) RSC Decision

- **React Server Components are not the core of this architecture.**
- We chose to keep the UI portable and adapter-swappable (mac and web), and RSC
  would couple the UI to a specific server runtime and build pipeline.
- The system remains compatible with server-rendered or streamed techniques if
  desired, but the shared UI is **not** built on RSC.

**Why**:

- Portability and adapter swapping are primary goals.
- Avoiding RSC at the core simplifies the build, removes cross-runtime friction,
  and keeps the UI usable in the browser demo without extra infrastructure.

---

## 16) Responsibilities by Layer

**Frontend (React/Preact in WKWebView or browser)**

- Renders the windowed budget grid.
- Recomputes availability **within the visible window** immediately after edits
  using carry-in.
- Dispatches user actions through tRPC over IPC.
- Applies incoming **patches** to keep the view synchronized.
- Loads/unloads month windows as the user scrolls.

**Swift Host (macOS)**

- Owns file lifecycle (open/save/autosave/recent files) via NSDocument.
- Manages security-scoped bookmarks for persistent access.
- Receives file change notifications via NSFilePresenter and triggers
  reload/merge.
- Bridges messages between the WebView and the Deno process over stdin/stdout.
- Provides minimal macOS UI chrome as needed (menus, etc.).

**Deno Logic (TypeScript, compiled)**

- Parses and serializes the budget file.
- Maintains the canonical dataset and fast indexes for cascading computations.
- Implements the tRPC router and domain operations.
- Returns **window data** (including carry-in) and **streams patches** after
  mutations or external changes.
- Acts as the single source of truth for the full ledger.

---

## 17) Developer Experience

- **tRPC router in a shared package** with declaration maps ensures “jump to
  definition” from UI to server resolvers.
- **IPC contract is stable** and simple: a single request/response/stream
  surface.
- **No client cache or optimism** to start — the system is snappy by design.
- **UI portability** is guaranteed: swap the IPC implementation (Swift relay vs.
  mock/HTTP) without touching UI code.

**Why**:

- Keeps iteration fast, reduces accidental complexity, and promotes clear module
  boundaries.

---

## 18) Risks & Mitigations (within our chosen path)

- **Large cascades after edits** could produce many patches.

  - _Mitigation_: stream patches in chunks and prioritize visible months first.

- **External file edits** may conflict with in-memory edits.

  - _Mitigation_: NSFilePresenter notifies; reload or merge strategies apply.
    Canonical recompute on the Deno side ensures consistency.

- **UI smoothness** when applying many patches.

  - _Mitigation_: apply in small batches and ensure the window remains small
    (1–5 months).

---

## 19) What’s explicitly **not** part of this plan

- Shipping a browser engine (Chromium) or running an embedded HTTP server.
- Making RSC the basis of the shared UI.
- Introducing client-side caches or optimistic update frameworks upfront.

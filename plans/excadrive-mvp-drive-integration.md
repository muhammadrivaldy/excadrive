# Plan: ExcaDrive MVP Drive Integration

> Source PRD: <https://github.com/muhammadrivaldy/excadrive/issues/1>

## Architectural decisions

Durable decisions that apply across all phases:

- **Supported routes**: MVP supports official Excalidraw web app pages on `excalidraw.com` only.
- **Interaction surface**: Primary UX is the Chrome extension popup (no in-page toolbar for MVP).
- **Auth approach**: Google OAuth via extension flow, requesting minimum Drive scopes needed for `.excalidraw` import/export.
- **Storage schema**: Link metadata is stored per browser tab/session context (not global), including file ID, file name, and link timestamp.
- **Key models**: `AuthState`, `PageSupportState`, `LinkedFileState`, `OperationState` (idle/loading/success/error), `DriveFileRef`.
- **Service boundaries**:
  - Excalidraw bridge (read/write scene in active page)
  - Google Drive client (picker, download, create, update)
  - Flow orchestrators (`Import`, `ExportSaveAs`, `SaveLinked`)
- **Save semantics**:
  - `Save As` always creates a new Drive file
  - `Save` updates only the linked file in active tab/session
  - Unlinked sessions cannot silently overwrite an existing file
- **Sync policy**: No background sync/autosave; all operations are explicit and user-triggered.

---

## Phase 1: Extension Foundation and Page Gating

**User stories**: 1, 2, 25, 28

### What to build

Deliver a thin end-to-end shell where the extension popup detects whether the active tab is a supported Excalidraw page, surfaces enabled/disabled Drive actions accordingly, and establishes consistent operation status messaging.

### Acceptance criteria

- [ ] Popup clearly distinguishes supported vs unsupported pages.
- [ ] Drive actions are disabled with clear reasons when page is unsupported.
- [ ] Popup can surface operation status placeholders (loading/success/error) for future phases.
- [ ] The foundation is demoable without Drive integration (page detection + UX gating works).

---

## Phase 2: Authentication Vertical Slice

**User stories**: 3, 4, 5, 6, 20

### What to build

Add Google sign-in from the popup with minimal Drive scopes, persist authenticated session state for extension use, and gate Drive actions on auth state with clear re-auth recovery.

### Acceptance criteria

- [ ] User can sign in from popup and see signed-in state.
- [ ] Requested scopes are limited to MVP Drive import/export needs.
- [ ] Signed-out state prevents import/export and gives actionable prompt.
- [ ] Expired/invalid auth triggers re-auth flow with recoverable messaging.

---

## Phase 3: Import From Drive Vertical Slice

**User stories**: 7, 8, 9, 10, 11, 21, 22

### What to build

Implement import flow via Google Picker: select `.excalidraw`, fetch content, validate payload, and load scene into active Excalidraw tab with explicit loading and outcome feedback.

### Acceptance criteria

- [ ] User can launch picker and select a valid `.excalidraw` file.
- [ ] Invalid/non-supported file content is rejected with clear error.
- [ ] Valid imported content is applied to active Excalidraw session.
- [ ] Import shows loading, success, and categorized failure states.
- [ ] Retry from failure paths works without extension restart.

---

## Phase 4: First Export (`Save As`) and Link Initialization

**User stories**: 12, 13, 14, 17, 23, 24

### What to build

Implement first export path that reads current Excalidraw scene, creates a new `.excalidraw` file in Drive, then initializes tab/session-scoped linked file state for subsequent saves.

### Acceptance criteria

- [ ] `Export to Drive` creates a new `.excalidraw` file from current scene.
- [ ] New file uses sensible default naming.
- [ ] Successful first export stores linked metadata for active tab/session.
- [ ] Unlinked `Save` is blocked or redirected safely to first-export path.
- [ ] No implicit/background writes occur.

---

## Phase 5: Linked Save and Save-As Semantics

**User stories**: 15, 16, 18, 19, 22, 24

### What to build

Implement linked save behavior: `Save` updates current linked file in active tab/session; `Save As` creates a new file and updates active link; ensure multi-tab isolation and stale-link safety.

### Acceptance criteria

- [ ] `Save` overwrites only the linked file for active tab/session.
- [ ] `Save As` always creates a new Drive file and updates active link.
- [ ] Two Excalidraw tabs do not cross-overwrite each other's linked file.
- [ ] Closing/reopening tab/session does not cause unsafe stale-link overwrites.
- [ ] Failures are recoverable with retry-safe behavior.

---

## Phase 6: Hardening, Error Taxonomy, and MVP Sign-off

**User stories**: 21, 22, 26, 27 (+ regression over all prior stories)

### What to build

Consolidate end-to-end reliability: standardize user-facing error categories, verify all major recovery paths, and execute/manual document MVP QA pass for ship readiness.

### Acceptance criteria

- [ ] Error taxonomy is consistent across auth, picker, import, create, and update.
- [ ] Manual QA checklist covers happy paths + high-risk failure paths.
- [ ] Tab/session link isolation is manually validated across multi-tab scenarios.
- [ ] MVP success criteria from PRD are demonstrably met end-to-end.
- [ ] Post-MVP follow-up backlog is captured (non-MVP enhancements only).

# Phase 4 Checklist: First Export (`Save As`) and Link Initialization

> Parent plan: `plans/excadrive-mvp-drive-integration.md`
> Phase: 4 (First Export and Link Initialization)

## Goal

Allow a signed-in user to export the current Excalidraw scene to a new `.excalidraw` file in Drive (`Save As`) and initialize tab/session-scoped linked file metadata for future `Save`.

## Done definition

- `Export to Drive` creates a new `.excalidraw` file from current scene.
- New file is created with sensible default naming.
- Successful export initializes linked metadata for active tab/session.
- Unlinked `Save` cannot silently overwrite and follows safe behavior.
- Manual acceptance test script below passes.

## Implementation checklist

## 1) Define export and link contracts

- [ ] Define export payload contract generated from Excalidraw scene.
- [ ] Define `LinkedFileState` contract with at least file ID, file name, linked timestamp, and context key.
- [ ] Define context key policy for tab/session scoping.
- [ ] Define unlinked `Save` behavior contract (blocked or redirected to first export path).

## 2) Implement scene read from Excalidraw bridge

- [ ] Request current scene from active supported Excalidraw tab.
- [ ] Validate extracted scene is serializable and non-empty as required.
- [ ] Convert scene to `.excalidraw` JSON payload format.
- [ ] Handle bridge read failures with clear recoverable error.

## 3) Implement Drive file create (`Save As`)

- [ ] Create new `.excalidraw` file in Drive from scene payload.
- [ ] Apply sensible default naming strategy for first export.
- [ ] Capture created file metadata from Drive response.
- [ ] Handle create failure paths (auth, permission, network, API) clearly.

## 4) Initialize and persist linked file metadata

- [ ] Persist link metadata using active tab/session context key.
- [ ] Confirm metadata retrieval is deterministic on popup reopen.
- [ ] Display linked file indicator in popup after successful export.
- [ ] Ensure link data for one tab/session does not leak to another.

## 5) Enforce safe unlinked save behavior

- [ ] Prevent direct overwrite when no link exists.
- [ ] Provide clear message directing user to first export flow.
- [ ] Ensure no write request is sent for blocked unlinked `Save`.
- [ ] Keep behavior consistent across popup reopen/reload.

## 6) UX and reliability baseline

- [ ] Show loading/success/error states during export.
- [ ] Show created file name in success confirmation.
- [ ] Support retry after export failure without stale link writes.
- [ ] Confirm no uncaught exceptions in repeated first-export attempts.

## 7) Manual acceptance test steps

## Test setup

- [ ] Ensure signed-in state from Phase 2.
- [ ] Ensure active supported tab at `https://excalidraw.com`.
- [ ] Ensure current drawing has content for export test.

## Test cases

### Case A: First export happy path

- [ ] Trigger `Export to Drive` (or `Save As`) on unlinked session.
- [ ] Confirm loading appears then success message.
- [ ] Confirm new `.excalidraw` file exists in Drive.
- [ ] Confirm popup now shows linked file state for this tab/session.

### Case B: Unlinked save safety

- [ ] Start with a fresh unlinked tab/session.
- [ ] Trigger `Save` directly.
- [ ] Confirm operation is blocked/redirected safely.
- [ ] Confirm no overwrite request is sent.

### Case C: Export failure and retry

- [ ] Simulate Drive create failure.
- [ ] Confirm categorized error appears.
- [ ] Retry export after issue is resolved.
- [ ] Confirm success and link initialization on retry.

### Case D: Link persistence in active context

- [ ] Reopen popup in same tab/session after successful first export.
- [ ] Confirm linked file indicator and metadata remain available.
- [ ] Confirm state is still tied to this context.

### Case E: Context isolation smoke check

- [ ] Open second Excalidraw tab without first export.
- [ ] Confirm second tab does not inherit first tab link.
- [ ] Confirm second tab remains unlinked until its own export.

## Exit criteria

- [ ] All test cases pass.
- [ ] Phase 4 acceptance criteria in parent plan can be checked off.
- [ ] Link metadata behavior is documented for Phase 5 save semantics.

# Phase 5 Checklist: Linked Save and Save-As Semantics

> Parent plan: `plans/excadrive-mvp-drive-integration.md`
> Phase: 5 (Linked Save and Save-As Semantics)

## Goal

Implement safe repeated saves where `Save` updates only the active tab/session linked Drive file, while `Save As` always creates a new file and updates the active link.

## Done definition

- `Save` overwrites only the linked file in active context.
- `Save As` always creates new file and re-links active context.
- Multi-tab isolation prevents cross-overwrite.
- Stale/invalid links are handled safely with recoverable UX.
- Manual acceptance test script below passes.

## Implementation checklist

## 1) Finalize save semantic contracts

- [ ] Define strict `Save` precondition: linked metadata must exist in active context.
- [ ] Define strict `Save As` contract: always create new Drive file.
- [ ] Define re-link behavior after successful `Save As`.
- [ ] Define stale-link error handling contract (missing/deleted/forbidden file).

## 2) Implement linked `Save` update flow

- [ ] Read active context linked metadata before update.
- [ ] Read current scene from Excalidraw bridge.
- [ ] Send Drive update request targeting linked file ID only.
- [ ] Return update result with clear file identity in success state.

## 3) Implement `Save As` new-file flow with re-link

- [ ] Reuse export create path to generate a new Drive file.
- [ ] Update linked metadata to new file on success.
- [ ] Keep previous link untouched on `Save As` failure.
- [ ] Show user-facing confirmation that active link changed.

## 4) Multi-tab/session isolation hardening

- [ ] Verify each tab/session uses isolated link key.
- [ ] Ensure `Save` in tab A cannot write tab B linked file.
- [ ] Ensure popup always resolves link for current active tab.
- [ ] Validate isolation after tab switch and popup reopen.

## 5) Stale link and recovery behavior

- [ ] Detect when linked file no longer exists or is inaccessible.
- [ ] Block unsafe overwrite attempts on stale link.
- [ ] Offer clear recovery path (`Save As` or relink flow).
- [ ] Ensure recovery does not create duplicate writes unintentionally.

## 6) UX and reliability baseline

- [ ] Show loading/success/error states for `Save` and `Save As`.
- [ ] Include linked file name in success and relevant error messages.
- [ ] Keep button states consistent during in-flight operations.
- [ ] Confirm repeated saves remain stable over multiple cycles.

## 7) Manual acceptance test steps

## Test setup

- [ ] Ensure signed-in state and working Excalidraw bridge.
- [ ] Ensure one tab has linked file from Phase 4.
- [ ] Open a second Excalidraw tab for isolation tests.

## Test cases

### Case A: Linked save happy path

- [ ] In linked tab, modify drawing and click `Save`.
- [ ] Confirm Drive updates the linked file only.
- [ ] Confirm success message references expected linked file.

### Case B: Save As re-link behavior

- [ ] In linked tab, click `Save As`.
- [ ] Confirm new file is created in Drive.
- [ ] Confirm active linked file now points to newly created file.
- [ ] Confirm subsequent `Save` updates new linked file, not old one.

### Case C: Unlinked save remains safe

- [ ] In an unlinked tab/session, click `Save`.
- [ ] Confirm action is blocked or redirected safely.
- [ ] Confirm no overwrite request is sent.

### Case D: Multi-tab isolation

- [ ] Give tab A and tab B different linked files.
- [ ] Save in tab A and verify only file A changes.
- [ ] Save in tab B and verify only file B changes.
- [ ] Confirm no cross-overwrite events occur.

### Case E: Stale link recovery

- [ ] Invalidate linked file access (delete/revoke/change permissions).
- [ ] Attempt `Save` from linked context.
- [ ] Confirm stale-link error appears with recovery guidance.
- [ ] Use `Save As` recovery and confirm new link works.

## Exit criteria

- [ ] All test cases pass.
- [ ] Phase 5 acceptance criteria in parent plan can be checked off.
- [ ] Known edge cases are documented for Phase 6 hardening.

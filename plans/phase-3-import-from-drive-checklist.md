# Phase 3 Checklist: Import From Drive Vertical Slice

> Parent plan: `plans/excadrive-mvp-drive-integration.md`
> Phase: 3 (Import From Drive Vertical Slice)

## Goal

Let a signed-in user import a valid `.excalidraw` file from Google Drive (via Picker) into the active Excalidraw tab, with robust validation and clear feedback.

## Done definition

- User can launch picker and select a valid `.excalidraw` file.
- Imported file content is validated before apply.
- Valid scene is loaded into active Excalidraw tab.
- Invalid files and API failures show clear, categorized errors.
- User can retry import without restarting extension.
- Manual acceptance test script below passes.

## Implementation checklist

## 1) Define import flow contracts

- [ ] Define `DriveFileRef` contract needed for import (id, name, mime/type metadata).
- [ ] Define import result contract: `success`, `errorCode`, `message`, `sourceFile`.
- [ ] Define import error taxonomy: picker canceled, no selection, permission denied, download failed, invalid JSON, invalid Excalidraw schema.
- [ ] Define clear operation states for import (`idle/loading/success/error`).

## 2) Integrate Google Picker for `.excalidraw`

- [ ] Implement picker launch action from popup.
- [ ] Restrict picker selection intent toward `.excalidraw` files.
- [ ] Handle picker cancel and empty selection deterministically.
- [ ] Return selected file reference to import orchestrator.

## 3) Download and validate file content

- [ ] Fetch selected file bytes/content from Drive API.
- [ ] Parse JSON safely with explicit parse error handling.
- [ ] Validate imported payload against expected Excalidraw structure.
- [ ] Reject invalid payloads with user-facing guidance.

## 4) Bridge to active Excalidraw tab

- [ ] Ensure import applies to active supported tab only.
- [ ] Send validated scene payload through Excalidraw bridge.
- [ ] Confirm bridge reports success/failure result back to popup.
- [ ] Handle bridge timeout/unavailable states gracefully.

## 5) Popup UX and retry behavior

- [ ] Show loading indicator during picker/download/validation/apply.
- [ ] Show success state with imported file name on completion.
- [ ] Show categorized error message on failure.
- [ ] Allow immediate retry after any recoverable failure.

## 6) Reliability and safety checks

- [ ] Ensure import flow does not alter linked save metadata.
- [ ] Ensure repeated imports in same session remain stable.
- [ ] Confirm non-`.excalidraw` content cannot silently apply.
- [ ] Confirm no uncaught exceptions across picker and bridge boundaries.

## 7) Manual acceptance test steps

## Test setup

- [ ] Ensure user is signed in from Phase 2.
- [ ] Ensure active tab is `https://excalidraw.com`.
- [ ] Prepare at least one valid and one invalid/malformed `.excalidraw` file in Drive.

## Test cases

### Case A: Happy path import

- [ ] Click `Import from Drive`.
- [ ] Select a valid `.excalidraw` file in picker.
- [ ] Confirm loading state appears.
- [ ] Confirm scene updates in Excalidraw and success message appears.

### Case B: Picker cancel path

- [ ] Open picker and cancel without selecting a file.
- [ ] Confirm no scene changes occur.
- [ ] Confirm user gets non-destructive canceled/aborted message.

### Case C: Invalid file content

- [ ] Select malformed or invalid `.excalidraw` content.
- [ ] Confirm import is rejected before scene apply.
- [ ] Confirm error message explains invalid file.

### Case D: Drive/API failure simulation

- [ ] Simulate network/API failure during download.
- [ ] Confirm error category is clear and actionable.
- [ ] Retry import and confirm flow can recover.

### Case E: Multiple imports in one session

- [ ] Run import flow 3+ times with different valid files.
- [ ] Confirm each selection updates the active scene correctly.
- [ ] Confirm popup state does not get stuck between runs.

## Exit criteria

- [ ] All test cases pass.
- [ ] Phase 3 acceptance criteria in parent plan can be checked off.
- [ ] Any known bridge limitations are documented before Phase 4.

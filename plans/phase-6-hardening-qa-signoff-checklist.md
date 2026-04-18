# Phase 6 Checklist: Hardening, Error Taxonomy, and MVP Sign-off

> Parent plan: `plans/excadrive-mvp-drive-integration.md`
> Phase: 6 (Hardening, Error Taxonomy, and MVP Sign-off)

## Goal

Harden MVP reliability by standardizing user-facing error categories, validating recovery paths end-to-end, and completing a full manual QA sign-off against PRD success criteria.

## Done definition

- Error taxonomy is consistent across auth, picker, import, create, and update flows.
- Manual QA checklist covers happy-path and failure-path scenarios.
- Tab/session link isolation is verified in regression passes.
- PRD MVP success criteria are explicitly demonstrated.
- Follow-up backlog is documented for non-MVP enhancements.

## Implementation checklist

## 1) Standardize error taxonomy across flows

- [ ] Define canonical error categories and map all flow-specific errors to them.
- [ ] Ensure popup messages are user-friendly and actionable per category.
- [ ] Ensure technical diagnostics remain available for debugging.
- [ ] Remove duplicate/contradictory error copy across modules.

## 2) Unify operation state behavior

- [ ] Ensure consistent `idle/loading/success/error` behavior for every action.
- [ ] Standardize in-flight button disabled behavior to prevent double-submit.
- [ ] Standardize success-message timing and reset behavior.
- [ ] Ensure state transitions recover cleanly after failures.

## 3) Reliability and regression hardening

- [ ] Run repeated action cycles for import/export/save flows to catch state leaks.
- [ ] Validate auth expiration and re-auth across all protected actions.
- [ ] Validate stale-link handling and recovery remains deterministic.
- [ ] Validate tab/session isolation under rapid tab switching.

## 4) Manual QA playbook finalization

- [ ] Consolidate phase checklists into one MVP QA runbook.
- [ ] Define pass/fail criteria for each major user journey.
- [ ] Capture reproducible steps for known flaky areas.
- [ ] Record final evidence notes for each acceptance item.

## 5) PRD success-criteria sign-off

- [ ] Verify sign-in from extension works reliably.
- [ ] Verify import from personal Drive into Excalidraw works reliably.
- [ ] Verify first export to Drive works reliably.
- [ ] Verify repeated save to same linked file works reliably.
- [ ] Verify workflow needs no manual JSON handling.

## 6) Documentation and follow-up backlog

- [ ] Document known limitations explicitly as non-MVP items.
- [ ] Capture post-MVP candidates (sync, advanced browsing, PNG/SVG export, broader host support).
- [ ] Document operational setup notes needed for new contributors.
- [ ] Create prioritized follow-up issue list for next iteration.

## 7) Manual acceptance test steps

## Test setup

- [ ] Start from clean browser profile or clean extension state baseline.
- [ ] Prepare valid and invalid sample `.excalidraw` files.
- [ ] Prepare two Excalidraw tabs for isolation checks.

## Test cases

### Case A: End-to-end happy path regression

- [ ] Sign in from popup.
- [ ] Import valid `.excalidraw` from Drive.
- [ ] First export (`Save As`) to Drive.
- [ ] Modify scene and run repeated `Save`.
- [ ] Confirm all steps succeed with expected UI feedback.

### Case B: Auth recovery regression

- [ ] Force expired/invalid auth and attempt protected action.
- [ ] Confirm `reauth_required` style UX appears.
- [ ] Re-auth and retry original action successfully.

### Case C: Import failure regression

- [ ] Test picker cancel.
- [ ] Test malformed/invalid file payload.
- [ ] Test Drive fetch/network failure.
- [ ] Confirm each path maps to correct error category and recovery hint.

### Case D: Save semantics and isolation regression

- [ ] Validate unlinked `Save` cannot overwrite.
- [ ] Validate linked `Save` updates only active context file.
- [ ] Validate `Save As` creates new file and re-links active context.
- [ ] Validate tab A and tab B never cross-overwrite.

### Case E: Stability stress smoke

- [ ] Run 20+ popup open/close cycles across states.
- [ ] Run repeated import/save cycles (5+ each).
- [ ] Confirm no stuck loading states, no stale toasts, no uncaught exceptions.

## Exit criteria

- [ ] All test cases pass or have approved documented exceptions.
- [ ] Phase 6 acceptance criteria in parent plan can be checked off.
- [ ] MVP is declared release-ready for intended personal workflow scope.

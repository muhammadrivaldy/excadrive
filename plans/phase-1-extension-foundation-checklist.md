# Phase 1 Checklist: Extension Foundation and Page Gating

> Parent plan: `plans/excadrive-mvp-drive-integration.md`
> Phase: 1 (Extension Foundation and Page Gating)

## Goal

Ship a demoable vertical slice where the popup can tell whether the active tab is a supported Excalidraw page (`excalidraw.com`), and gate Drive actions with clear user feedback.

## Done definition

- Popup shows support status for current tab.
- Import/Export/Save actions are visible but disabled on unsupported pages.
- Disabled actions show clear reason text.
- Popup can render operation placeholders (`idle`, `loading`, `success`, `error`) for future phases.
- Manual acceptance test script below passes.

## Implementation checklist

## 1) Bootstrap extension shell

- [ ] Create baseline extension manifest for popup-first MVP architecture.
- [ ] Configure required extension permissions for active-tab page checks only (no Drive/OAuth yet).
- [ ] Wire popup entry so it can query active tab URL.
- [ ] Verify extension loads in Chrome without runtime errors.

## 2) Define durable Phase 1 contracts

- [ ] Define `PageSupportState` contract with at least: `supported`, `reason`, `hostname`.
- [ ] Define `OperationState` contract with at least: `idle`, `loading`, `success`, `error`.
- [ ] Define single source of truth for supported host policy (`excalidraw.com` only).
- [ ] Keep these contracts framework-agnostic so later phases can reuse them.

## 3) Implement page-support detection flow

- [ ] Query active tab from popup open event.
- [ ] Parse URL safely and handle invalid or missing tab URL.
- [ ] Mark supported only when hostname matches the allowed policy.
- [ ] Return deterministic unsupported reasons (for example: no active tab, non-web URL, unsupported host).

## 4) Build popup foundation UI

- [ ] Add support status section (supported/unsupported state + reason text).
- [ ] Add action buttons for `Import from Drive`, `Export to Drive`, and `Save`.
- [ ] Disable all Drive actions when page is unsupported.
- [ ] Add operation status area capable of showing `idle/loading/success/error` placeholders.
- [ ] Ensure layout remains readable on narrow popup widths.

## 5) Wire action gating behavior

- [ ] Centralize gating logic so every Drive action checks `PageSupportState`.
- [ ] Prevent click handlers from running on unsupported pages.
- [ ] Show consistent user-facing message when blocked by unsupported page.
- [ ] Keep gating logic isolated for reuse by auth/import/export phases.

## 6) Error handling and observability baseline

- [ ] Handle popup initialization failures without blank UI.
- [ ] Display recoverable message when tab lookup fails.
- [ ] Add lightweight internal logging labels for support-state outcomes.
- [ ] Confirm no uncaught exceptions during popup open/close cycles.

## 7) Manual acceptance test steps

## Test setup

- [ ] Load unpacked extension in Chrome developer mode.
- [ ] Open one tab at `https://excalidraw.com`.
- [ ] Open one tab at a non-supported host (for example `https://example.com`).

## Test cases

### Case A: Supported page detection

- [ ] Open popup while active tab is `excalidraw.com`.
- [ ] Confirm status shows supported.
- [ ] Confirm Drive action buttons are enabled from page-gating perspective.

### Case B: Unsupported page gating

- [ ] Switch to unsupported tab and reopen popup.
- [ ] Confirm status shows unsupported.
- [ ] Confirm all Drive actions are disabled.
- [ ] Confirm clear reason text is visible.

### Case C: Action block safety

- [ ] Attempt to click disabled action on unsupported page.
- [ ] Confirm no downstream flow starts.
- [ ] Confirm user sees consistent blocked-state messaging.

### Case D: Operation placeholder rendering

- [ ] Trigger each placeholder UI state through local debug controls or temporary state toggles.
- [ ] Confirm `idle/loading/success/error` views render correctly.
- [ ] Confirm state transitions do not break popup layout.

### Case E: Reliability smoke checks

- [ ] Open and close popup repeatedly (10+ times) on supported and unsupported tabs.
- [ ] Confirm no crashes, blank popup, or stale support status.
- [ ] Confirm browser console has no uncaught errors from popup scripts.

## Exit criteria

- [ ] All test cases pass.
- [ ] Phase 1 acceptance criteria in parent plan can be checked off.
- [ ] Any open issues are documented as explicit follow-ups before Phase 2 starts.

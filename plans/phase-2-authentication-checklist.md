# Phase 2 Checklist: Authentication Vertical Slice

> Parent plan: `plans/excadrive-mvp-drive-integration.md`
> Phase: 2 (Authentication Vertical Slice)

## Goal

Enable Google sign-in from the extension popup with minimum Drive permissions, show signed-in state, and gate Drive actions with clear re-auth behavior.

## Done definition

- User can sign in from popup and sees signed-in status.
- Drive scopes are limited to MVP import/export needs.
- Signed-out state blocks Drive actions with clear guidance.
- Expired/invalid auth can be recovered through re-auth without restarting browser.
- Manual acceptance test script below passes.

## Implementation checklist

## 1) Prepare OAuth prerequisites

- [ ] Configure OAuth app for Chrome extension use.
- [ ] Ensure extension identity values are aligned between Chrome and OAuth config.
- [ ] Document required setup values and where to manage them safely.
- [ ] Verify local development can request auth without hardcoded secrets in repo.

## 2) Define auth contracts and state model

- [ ] Define `AuthState` contract with at least: `status`, `accountEmail`, `lastAuthAt`, `errorCode`.
- [ ] Define auth statuses: `signed_out`, `signing_in`, `signed_in`, `reauth_required`, `error`.
- [ ] Define minimal error taxonomy for auth: canceled, denied, expired, network, unknown.
- [ ] Centralize minimum Drive scope policy for MVP.

## 3) Implement sign-in flow from popup

- [ ] Add `Sign in with Google` action in popup when user is signed out.
- [ ] Implement auth request flow and token retrieval.
- [ ] Persist active auth session state for popup usage.
- [ ] Load auth state on popup open so status is always current.

## 4) Implement sign-out and re-auth behavior

- [ ] Add sign-out action that clears local auth state cleanly.
- [ ] Detect expired/invalid auth during protected action attempts.
- [ ] Convert invalid auth to `reauth_required` with clear UI call-to-action.
- [ ] Ensure re-auth success returns user to normal signed-in state.

## 5) Gate Drive actions using auth state

- [ ] Require signed-in state before running Drive actions.
- [ ] Keep blocked-state messaging consistent for all Drive buttons.
- [ ] Show current account identity (or equivalent signed-in indicator) in popup.
- [ ] Ensure unsupported page gating and auth gating work together without conflicts.

## 6) UX and reliability baseline

- [ ] Add loading state during sign-in and re-auth.
- [ ] Add success message after first successful sign-in.
- [ ] Show actionable error messages for denied/canceled/expired auth paths.
- [ ] Confirm popup remains stable across repeated sign-in and sign-out cycles.

## 7) Manual acceptance test steps

## Test setup

- [ ] Load unpacked extension in Chrome developer mode.
- [ ] Open `https://excalidraw.com` in active tab.
- [ ] Confirm Phase 1 page support detection is working.

## Test cases

### Case A: First-time sign-in happy path

- [ ] Open popup while signed out.
- [ ] Click `Sign in with Google` and complete consent.
- [ ] Confirm popup shows signed-in state and account indicator.
- [ ] Confirm Drive actions are no longer blocked by auth.

### Case B: User cancels or denies consent

- [ ] Start sign-in flow and cancel/deny at consent step.
- [ ] Confirm popup stays signed out.
- [ ] Confirm user sees clear recoverable error message.

### Case C: Sign-out behavior

- [ ] From signed-in state, trigger sign-out.
- [ ] Confirm auth state resets to signed out.
- [ ] Confirm Drive actions are blocked with sign-in prompt.

### Case D: Re-auth required behavior

- [ ] Simulate/trigger expired or invalid auth.
- [ ] Attempt a Drive-gated action.
- [ ] Confirm UI shows re-auth required message.
- [ ] Complete re-auth and confirm state returns to signed in.

### Case E: Stability and repeatability

- [ ] Repeat sign-in/sign-out cycle at least 5 times.
- [ ] Confirm no stuck loading states or stale account identity.
- [ ] Confirm no uncaught popup exceptions.

## Exit criteria

- [ ] All test cases pass.
- [ ] Phase 2 acceptance criteria in parent plan can be checked off.
- [ ] Any auth setup caveats are documented for next phases.

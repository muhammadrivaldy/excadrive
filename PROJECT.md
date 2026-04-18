# Project Overview

`excadrive` is a Chrome extension that adds Google Drive import and export capabilities while the user is working in Excalidraw. The goal is not to replace Excalidraw or introduce live synchronization. Instead, the extension should make it feel natural to open an Excalidraw project from Google Drive and save it back with minimal friction.

## Product Goal

Build a lightweight Chrome extension that helps a user:

- open an Excalidraw file from Google Drive into the current Excalidraw session
- export the current Excalidraw scene to Google Drive as a `.excalidraw` file
- re-save to the same Google Drive file after the first export, without repeating the full flow each time

The product should feel seamless, simple, and safe for a personal workflow.

## MVP Scope

The MVP focuses on explicit import and export only.

### In Scope

- Chrome extension UI for actions related to Google Drive
- Google account authentication from the extension
- import an existing `.excalidraw` file from Google Drive
- export the current Excalidraw scene to Google Drive
- `Save As` behavior for first-time export
- `Save` behavior to overwrite the previously linked Google Drive file
- local storage of the last linked Drive file metadata needed for repeated saves
- basic success and error feedback for auth, import, and export actions

### Out of Scope

- live sync
- collaborative editing
- background autosave
- conflict resolution across devices or tabs
- folder browsing beyond what is needed for MVP file selection
- PNG or SVG export in v1
- support for apps beyond Excalidraw

## Core User Experience

The extension is used while the user is already inside Excalidraw.

### Import Flow

1. The user opens Excalidraw in Chrome.
2. The extension detects the supported page and enables Drive actions.
3. The user clicks `Import from Drive`.
4. The extension asks the user to authenticate with Google if needed.
5. The extension shows a simple picker or recent file list from Google Drive.
6. The selected `.excalidraw` file is fetched and loaded into the active Excalidraw session.

### Export Flow

1. The user clicks `Export to Drive`.
2. If this drawing has not been linked to a Drive file yet, the extension creates a new `.excalidraw` file in Google Drive.
3. The extension stores the returned Drive file ID locally for the current working context.
4. Future saves can use `Save` to update the same Google Drive file directly.

## MVP Features

### 1. Authentication

- sign in with Google from the Chrome extension
- request the minimum Drive permissions needed for import and export
- show signed-in state in the extension UI

### 2. Excalidraw Page Integration

- detect when the user is on a supported Excalidraw page
- provide extension actions through popup, injected UI, or both
- read the current Excalidraw scene for export
- write imported scene data back into the page

### 3. Google Drive File Handling

- list or pick candidate `.excalidraw` files
- download file content from Drive
- create a new Drive file on first export
- update an existing Drive file on subsequent saves

### 4. Linked File Convenience

- remember the last Drive file associated with the current work session
- show whether the current drawing is linked or not
- provide a clear distinction between `Save` and `Save As`

### 5. Basic UX Feedback

- loading state during import and export
- success messages for file saved or imported
- clear error messages for auth failure, missing permissions, invalid file, or failed upload

## Functional Requirements

- The extension must work on supported Excalidraw pages in Chrome.
- The extension must be able to authenticate the user with Google.
- The extension must import valid `.excalidraw` JSON data from Google Drive.
- The extension must export the current Excalidraw scene as a valid `.excalidraw` file.
- The extension must support overwriting a previously linked Google Drive file.
- The extension must not perform automatic background sync.
- The extension must keep the import/export workflow explicit and user-triggered.

## Non-Functional Requirements

- Keep the UI simple enough for personal daily use.
- Minimize the number and sensitivity of requested Google Drive scopes.
- Avoid destructive behavior and accidental overwrites.
- Ensure failures are understandable and recoverable by the user.
- Keep the architecture small enough for fast iteration during MVP development.

## Risks and Constraints

- Excalidraw page integration may depend on how easily the extension can access or inject scene data.
- Google OAuth and Drive API handling inside a Chrome extension must be implemented carefully.
- If page internals change, some page integration logic may need maintenance.
- Since the product intentionally avoids sync, users must trigger saves explicitly.

## Success Criteria For MVP

The MVP is successful if a user can:

- sign in with Google from the extension
- import a `.excalidraw` file from personal Google Drive into Excalidraw
- export the current drawing to Google Drive
- save again to the same linked file without repeating the full export flow
- complete the above reliably without needing manual JSON handling

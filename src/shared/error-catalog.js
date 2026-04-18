import { ERROR_CODE } from "./constants.js";

export const ERROR_MESSAGES = Object.freeze({
  [ERROR_CODE.UNSUPPORTED_PAGE]:
    "Open https://excalidraw.com to use Drive actions.",
  [ERROR_CODE.NOT_AUTHENTICATED]: "Please sign in with Google first.",
  [ERROR_CODE.REAUTH_REQUIRED]:
    "Session expired. Sign in again to continue.",
  [ERROR_CODE.OAUTH_NOT_CONFIGURED]:
    "OAuth is not configured yet. Open extension options.",
  [ERROR_CODE.OAUTH_DENIED]: "Google access was denied.",
  [ERROR_CODE.OAUTH_CANCELED]: "Authentication was canceled.",
  [ERROR_CODE.OAUTH_FAILED]: "Authentication failed.",
  [ERROR_CODE.DRIVE_LIST_FAILED]: "Could not load files from Drive.",
  [ERROR_CODE.DRIVE_DOWNLOAD_FAILED]: "Could not download file from Drive.",
  [ERROR_CODE.DRIVE_CREATE_FAILED]: "Could not create file in Drive.",
  [ERROR_CODE.DRIVE_UPDATE_FAILED]: "Could not update linked Drive file.",
  [ERROR_CODE.PICKER_CANCELED]: "No file selected.",
  [ERROR_CODE.INVALID_FILE]: "Selected file is not a valid Excalidraw JSON scene.",
  [ERROR_CODE.BRIDGE_UNAVAILABLE]:
    "Could not connect to Excalidraw page. Refresh and retry.",
  [ERROR_CODE.BRIDGE_READ_FAILED]:
    "Could not read current scene from Excalidraw.",
  [ERROR_CODE.BRIDGE_WRITE_FAILED]:
    "Could not apply imported scene to Excalidraw.",
  [ERROR_CODE.LINK_NOT_FOUND]: "No linked file. Use Save As first.",
  [ERROR_CODE.STALE_LINK]:
    "Linked file is no longer available. Use Save As to relink.",
  [ERROR_CODE.UNKNOWN]: "Operation failed. Please retry."
});

export function toUserMessage(error) {
  if (!error || typeof error !== "object") {
    return ERROR_MESSAGES[ERROR_CODE.UNKNOWN];
  }

  const mapped = ERROR_MESSAGES[error.code];
  if (mapped) {
    return mapped;
  }

  if (typeof error.message === "string" && error.message.trim()) {
    return error.message;
  }

  return ERROR_MESSAGES[ERROR_CODE.UNKNOWN];
}

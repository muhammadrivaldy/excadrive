export const SUPPORTED_HOSTS = ["excalidraw.com"];

export const AUTH_STORAGE_KEY = "auth.token";
export const SETTINGS_STORAGE_KEY = "settings";

export const LINK_KEY_PREFIX = "link.tab.";

export const OPERATION_STATUS = Object.freeze({
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error"
});

export const AUTH_STATUS = Object.freeze({
  SIGNED_OUT: "signed_out",
  SIGNING_IN: "signing_in",
  SIGNED_IN: "signed_in",
  REAUTH_REQUIRED: "reauth_required",
  ERROR: "error"
});

export const ERROR_CODE = Object.freeze({
  UNSUPPORTED_PAGE: "unsupported_page",
  NOT_AUTHENTICATED: "not_authenticated",
  REAUTH_REQUIRED: "reauth_required",
  OAUTH_NOT_CONFIGURED: "oauth_not_configured",
  OAUTH_DENIED: "oauth_denied",
  OAUTH_CANCELED: "oauth_canceled",
  OAUTH_FAILED: "oauth_failed",
  DRIVE_LIST_FAILED: "drive_list_failed",
  DRIVE_DOWNLOAD_FAILED: "drive_download_failed",
  DRIVE_CREATE_FAILED: "drive_create_failed",
  DRIVE_UPDATE_FAILED: "drive_update_failed",
  PICKER_CANCELED: "picker_canceled",
  INVALID_FILE: "invalid_file",
  BRIDGE_UNAVAILABLE: "bridge_unavailable",
  BRIDGE_READ_FAILED: "bridge_read_failed",
  BRIDGE_WRITE_FAILED: "bridge_write_failed",
  LINK_NOT_FOUND: "link_not_found",
  STALE_LINK: "stale_link",
  UNKNOWN: "unknown"
});

export const DRIVE_SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.readonly"
];

export const EXCALIDRAW_MIME = "application/vnd.excalidraw+json";

export const MESSAGE = Object.freeze({
  GET_SESSION_STATUS: "GET_SESSION_STATUS",
  AUTH_SIGN_IN: "AUTH_SIGN_IN",
  AUTH_SIGN_OUT: "AUTH_SIGN_OUT",
  AUTH_GET_TOKEN: "AUTH_GET_TOKEN",
  DRIVE_LIST_EXCALIDRAW_FILES: "DRIVE_LIST_EXCALIDRAW_FILES",
  IMPORT_FILE: "IMPORT_FILE",
  EXPORT_SAVE_AS: "EXPORT_SAVE_AS",
  SAVE_LINKED: "SAVE_LINKED",
  CLEAR_LINK: "CLEAR_LINK",
  GET_SETTINGS: "GET_SETTINGS",
  SAVE_SETTINGS: "SAVE_SETTINGS",
  BRIDGE_READ_SCENE: "BRIDGE_READ_SCENE",
  BRIDGE_WRITE_SCENE: "BRIDGE_WRITE_SCENE",
  BRIDGE_PING: "BRIDGE_PING"
});

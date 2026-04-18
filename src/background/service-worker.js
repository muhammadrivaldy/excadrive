import {
  ERROR_CODE,
  MESSAGE,
  OPERATION_STATUS
} from "../shared/constants.js";
import { parseAndValidateExcalidrawFile } from "../shared/excalidraw-schema.js";
import { fail, ok } from "../shared/messages.js";
import { getPageSupport } from "../shared/page-support.js";
import {
  getAuthState,
  getValidToken,
  signIn,
  signOut
} from "./auth.js";
import {
  createDriveFile,
  downloadDriveFile,
  getDriveFileMetadata,
  listExcalidrawFiles,
  updateDriveFile
} from "./drive-api.js";
import { buildDefaultFileName } from "./file-name.js";
import { getActiveTabContext, getAllTabIds } from "./chrome-utils.js";
import {
  clearLinkedFile,
  cleanupOrphanedLinkedFiles,
  getLinkedFile,
  getSettings,
  saveSettings,
  setLinkedFile
} from "./storage.js";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  void handleMessage(message, sender)
    .then((result) => sendResponse(result))
    .catch((error) => {
      sendResponse(
        fail(ERROR_CODE.UNKNOWN, "Unexpected background error.", {
          raw: String(error?.message || "")
        })
      );
    });

  return true;
});

chrome.tabs.onRemoved.addListener((tabId) => {
  void clearLinkedFile(tabId);
});

chrome.runtime.onStartup.addListener(() => {
  void compactRuntimeState();
});

chrome.runtime.onInstalled.addListener(() => {
  void compactRuntimeState();
});

async function handleMessage(message) {
  switch (message?.type) {
    case MESSAGE.GET_SESSION_STATUS:
      return getSessionStatus();
    case MESSAGE.AUTH_SIGN_IN:
      return signIn();
    case MESSAGE.AUTH_SIGN_OUT:
      return signOut();
    case MESSAGE.AUTH_GET_TOKEN:
      return getValidToken();
    case MESSAGE.DRIVE_LIST_EXCALIDRAW_FILES:
      return listFilesForImport();
    case MESSAGE.IMPORT_FILE:
      return importFile(message.payload || {});
    case MESSAGE.EXPORT_SAVE_AS:
      return exportSaveAs(message.payload || {});
    case MESSAGE.SAVE_LINKED:
      return saveLinked();
    case MESSAGE.CLEAR_LINK:
      return clearCurrentLink();
    case MESSAGE.GET_SETTINGS:
      return ok({ settings: await getSettings() });
    case MESSAGE.SAVE_SETTINGS:
      return ok({ settings: await saveSettings(message.payload || {}) });
    default:
      return fail(ERROR_CODE.UNKNOWN, "Unsupported background message.");
  }
}

async function getSessionStatus() {
  const context = await getActiveTabContext();
  const authState = await getAuthState();
  const linkedFile = context.tabId !== null ? await getLinkedFile(context.tabId) : null;

  return ok({
    context,
    authState,
    linkedFile,
    operation: {
      status: OPERATION_STATUS.IDLE,
      message: "Ready"
    }
  });
}

async function compactRuntimeState() {
  try {
    const tabIds = await getAllTabIds();
    await cleanupOrphanedLinkedFiles(tabIds);
  } catch {
    // no-op for background compaction best-effort cleanup
  }
}

async function listFilesForImport() {
  const gating = await requireSupportedAndAuthenticated();
  if (!gating.ok) {
    return gating;
  }

  const settings = await getSettings();
  const listed = await listExcalidrawFiles(gating.data.token, settings.maxRecentFiles);
  if (!listed.ok) {
    return listed;
  }

  return ok({ files: listed.data.files });
}

async function importFile(payload) {
  const gating = await requireSupportedAndAuthenticated();
  if (!gating.ok) {
    return gating;
  }

  if (!payload.fileId) {
    return fail(ERROR_CODE.PICKER_CANCELED, "No Drive file selected for import.");
  }

  const downloaded = await downloadDriveFile(gating.data.token, payload.fileId);
  if (!downloaded.ok) {
    return downloaded;
  }

  const parsed = parseAndValidateExcalidrawFile(downloaded.data.content);
  if (!parsed.ok) {
    return parsed;
  }

  const bridge = await sendBridgeMessage(gating.data.tabId, {
    type: MESSAGE.BRIDGE_WRITE_SCENE,
    payload: {
      scene: parsed.data.scene
    }
  });

  if (!bridge.ok) {
    return bridge;
  }

  return ok({
    importedFile: {
      fileId: payload.fileId,
      fileName: payload.fileName || ""
    }
  });
}

async function exportSaveAs(payload) {
  const gating = await requireSupportedAndAuthenticated();
  if (!gating.ok) {
    return gating;
  }

  const read = await sendBridgeMessage(gating.data.tabId, {
    type: MESSAGE.BRIDGE_READ_SCENE,
    payload: {}
  });

  if (!read.ok) {
    return read;
  }

  const settings = await getSettings();
  const defaultFileName = buildDefaultFileName(settings.defaultFileNamePrefix);
  const fileName = payload.fileName || defaultFileName;
  const content = JSON.stringify(read.data.scene, null, 2);

  const created = await createDriveFile(gating.data.token, fileName, content);
  if (!created.ok) {
    return created;
  }

  await setLinkedFile(gating.data.tabId, {
    fileId: created.data.file.id,
    fileName: created.data.file.name
  });

  return ok({
    file: created.data.file,
    linkedFile: await getLinkedFile(gating.data.tabId)
  });
}

async function saveLinked() {
  const gating = await requireSupportedAndAuthenticated();
  if (!gating.ok) {
    return gating;
  }

  const linkedFile = await getLinkedFile(gating.data.tabId);
  if (!linkedFile?.fileId) {
    return fail(
      ERROR_CODE.LINK_NOT_FOUND,
      "This tab has no linked Drive file. Use Save As first."
    );
  }

  const metadata = await getDriveFileMetadata(gating.data.token, linkedFile.fileId);
  if (!metadata.ok) {
    return metadata.error.code === ERROR_CODE.STALE_LINK
      ? fail(
          ERROR_CODE.STALE_LINK,
          "Linked Drive file no longer exists or is inaccessible. Use Save As to relink."
        )
      : metadata;
  }

  const read = await sendBridgeMessage(gating.data.tabId, {
    type: MESSAGE.BRIDGE_READ_SCENE,
    payload: {}
  });

  if (!read.ok) {
    return read;
  }

  const content = JSON.stringify(read.data.scene, null, 2);
  const updated = await updateDriveFile(gating.data.token, linkedFile.fileId, content);
  if (!updated.ok) {
    return updated.error.code === ERROR_CODE.STALE_LINK
      ? fail(
          ERROR_CODE.STALE_LINK,
          "Linked Drive file no longer exists or is inaccessible. Use Save As to relink."
        )
      : updated;
  }

  await setLinkedFile(gating.data.tabId, {
    fileId: linkedFile.fileId,
    fileName:
      updated.data.file.name || metadata.data.file.name || linkedFile.fileName || ""
  });

  return ok({
    file: {
      fileId: linkedFile.fileId,
      fileName:
        updated.data.file.name || metadata.data.file.name || linkedFile.fileName || ""
    },
    linkedFile: await getLinkedFile(gating.data.tabId)
  });
}

async function clearCurrentLink() {
  const context = await getActiveTabContext();
  if (context.tabId !== null) {
    await clearLinkedFile(context.tabId);
  }

  return ok({ cleared: true });
}

async function requireSupportedAndAuthenticated() {
  const context = await getActiveTabContext();
  const support = getPageSupport(context.url);

  if (!support.supported || context.tabId === null) {
    return fail(
      ERROR_CODE.UNSUPPORTED_PAGE,
      support.reason || "Unsupported page. Open Excalidraw to continue.",
      { support }
    );
  }

  const tokenResult = await getValidToken();
  if (!tokenResult.ok) {
    return tokenResult.error.code === ERROR_CODE.REAUTH_REQUIRED
      ? fail(ERROR_CODE.REAUTH_REQUIRED, "Session expired. Please sign in again.")
      : fail(ERROR_CODE.NOT_AUTHENTICATED, "Please sign in with Google first.");
  }

  return ok({
    tabId: context.tabId,
    context,
    token: tokenResult.data.token
  });
}

async function sendBridgeMessage(tabId, message) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        resolve(
          fail(ERROR_CODE.BRIDGE_UNAVAILABLE, "Could not connect to Excalidraw tab.", {
            raw: chrome.runtime.lastError.message
          })
        );
        return;
      }

      if (!response) {
        resolve(
          fail(
            ERROR_CODE.BRIDGE_UNAVAILABLE,
            "Excalidraw bridge did not respond. Refresh the page and retry."
          )
        );
        return;
      }

      resolve(response);
    });
  });
}

import {
  AUTH_STATUS,
  MESSAGE,
  OPERATION_STATUS
} from "../shared/constants.js";
import { toUserMessage } from "../shared/error-catalog.js";

const elements = {
  hostStatus: document.getElementById("host-status"),
  authStatus: document.getElementById("auth-status"),
  linkStatus: document.getElementById("link-status"),
  operationStatus: document.getElementById("operation-status"),
  signInBtn: document.getElementById("sign-in-btn"),
  signOutBtn: document.getElementById("sign-out-btn"),
  settingsBtn: document.getElementById("settings-btn"),
  importBtn: document.getElementById("import-btn"),
  saveAsBtn: document.getElementById("save-as-btn"),
  saveBtn: document.getElementById("save-btn"),
  unlinkBtn: document.getElementById("unlink-btn"),
  fileList: document.getElementById("file-list")
};

const state = {
  context: null,
  authState: null,
  linkedFile: null,
  files: [],
  operation: {
    status: OPERATION_STATUS.IDLE,
    message: "Idle"
  }
};

init();

async function init() {
  bindEvents();
  await refreshSession();
}

function bindEvents() {
  elements.signInBtn.addEventListener("click", async () => {
    await runAction("Signing in...", async () => {
      const response = await sendMessage({ type: MESSAGE.AUTH_SIGN_IN });
      if (!response.ok) {
        throw response.error;
      }

      state.authState = response.data.authState;
      await refreshSession();
      setStatus(OPERATION_STATUS.SUCCESS, "Signed in successfully.");
    });
  });

  elements.signOutBtn.addEventListener("click", async () => {
    await runAction("Signing out...", async () => {
      const response = await sendMessage({ type: MESSAGE.AUTH_SIGN_OUT });
      if (!response.ok) {
        throw response.error;
      }

      state.authState = response.data.authState;
      state.files = [];
      render();
      setStatus(OPERATION_STATUS.SUCCESS, "Signed out.");
    });
  });

  elements.importBtn.addEventListener("click", async () => {
    await runAction("Loading Drive files...", async () => {
      const list = await sendMessage({ type: MESSAGE.DRIVE_LIST_EXCALIDRAW_FILES });
      if (!list.ok) {
        throw list.error;
      }

      state.files = list.data.files;
      renderFileList();

      if (state.files.length === 0) {
        setStatus(OPERATION_STATUS.ERROR, "No `.excalidraw` files found in Drive.");
        return;
      }

      setStatus(
        OPERATION_STATUS.SUCCESS,
        "Select a file in the list below to import."
      );
    });
  });

  elements.settingsBtn.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });

  elements.saveAsBtn.addEventListener("click", async () => {
    await runAction("Exporting as new Drive file...", async () => {
      const response = await sendMessage({ type: MESSAGE.EXPORT_SAVE_AS, payload: {} });
      if (!response.ok) {
        throw response.error;
      }

      state.linkedFile = response.data.linkedFile;
      render();
      setStatus(
        OPERATION_STATUS.SUCCESS,
        `Saved as ${response.data.file.name || "new file"}.`
      );
    });
  });

  elements.saveBtn.addEventListener("click", async () => {
    await runAction("Saving linked Drive file...", async () => {
      const response = await sendMessage({ type: MESSAGE.SAVE_LINKED });
      if (!response.ok) {
        throw response.error;
      }

      state.linkedFile = response.data.linkedFile;
      render();
      setStatus(
        OPERATION_STATUS.SUCCESS,
        `Saved ${response.data.file.fileName || "linked file"}.`
      );
    });
  });

  elements.unlinkBtn.addEventListener("click", async () => {
    await runAction("Clearing link...", async () => {
      const response = await sendMessage({ type: MESSAGE.CLEAR_LINK });
      if (!response.ok) {
        throw response.error;
      }

      state.linkedFile = null;
      render();
      setStatus(OPERATION_STATUS.SUCCESS, "Linked file cleared for this tab.");
    });
  });
}

async function refreshSession() {
  const response = await sendMessage({ type: MESSAGE.GET_SESSION_STATUS });
  if (!response.ok) {
    setStatus(OPERATION_STATUS.ERROR, response.error.message || "Failed to load state.");
    return;
  }

  state.context = response.data.context;
  state.authState = response.data.authState;
  state.linkedFile = response.data.linkedFile;
  render();
}

function render() {
  const support = state.context?.pageSupport;
  if (!support) {
    elements.hostStatus.textContent = "Checking page support...";
  } else if (support.supported) {
    elements.hostStatus.textContent = `Supported page: ${support.hostname}`;
  } else {
    elements.hostStatus.textContent = `Unsupported page: ${support.reason}`;
  }

  const auth = state.authState;
  if (!auth) {
    elements.authStatus.textContent = "Checking sign-in state...";
  } else {
    const label = authLabel(auth.status);
    elements.authStatus.textContent = label;
  }

  if (state.linkedFile?.fileId) {
    elements.linkStatus.textContent = `Linked: ${state.linkedFile.fileName || state.linkedFile.fileId}`;
  } else {
    elements.linkStatus.textContent = "No linked Drive file for this tab.";
  }

  renderFileList();
  renderButtons();
}

function renderButtons() {
  const supported = Boolean(state.context?.pageSupport?.supported);
  const authStatus = state.authState?.status;
  const authenticated = authStatus === AUTH_STATUS.SIGNED_IN;
  const hasLink = Boolean(state.linkedFile?.fileId);

  elements.signInBtn.disabled = authStatus === AUTH_STATUS.SIGNED_IN;
  elements.signOutBtn.disabled = authStatus !== AUTH_STATUS.SIGNED_IN;

  const actionsEnabled = supported && authenticated;
  elements.importBtn.disabled = !actionsEnabled;
  elements.saveAsBtn.disabled = !actionsEnabled;
  elements.saveBtn.disabled = !actionsEnabled || !hasLink;
  elements.unlinkBtn.disabled = !supported || !hasLink;
}

function renderFileList() {
  elements.fileList.innerHTML = "";

  if (!state.files || state.files.length === 0) {
    const empty = document.createElement("p");
    empty.className = "hint";
    empty.textContent = "No files loaded. Click Import from Drive.";
    elements.fileList.appendChild(empty);
    return;
  }

  for (const file of state.files) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "file-item";
    button.textContent = file.name || file.id;
    button.addEventListener("click", () => {
      void runImportSelection(file);
    });
    elements.fileList.appendChild(button);
  }
}

async function runImportSelection(file) {
  await runAction(`Importing ${file.name || "file"}...`, async () => {
    const response = await sendMessage({
      type: MESSAGE.IMPORT_FILE,
      payload: {
        fileId: file.id,
        fileName: file.name || ""
      }
    });

    if (!response.ok) {
      throw response.error;
    }

    setStatus(
      OPERATION_STATUS.SUCCESS,
      `Imported ${response.data.importedFile.fileName || "selected file"}.`
    );
  });
}

async function runAction(loadingMessage, action) {
  setStatus(OPERATION_STATUS.LOADING, loadingMessage);

  try {
    await action();
  } catch (error) {
    const message = toUserMessage(error);
    setStatus(OPERATION_STATUS.ERROR, message);
  }

  renderButtons();
}

function setStatus(status, message) {
  state.operation.status = status;
  state.operation.message = message;
  elements.operationStatus.textContent = message;
  elements.operationStatus.className = `status ${status}`;
}

function authLabel(status) {
  switch (status) {
    case AUTH_STATUS.SIGNED_IN:
      return "Signed in";
    case AUTH_STATUS.SIGNED_OUT:
      return "Signed out";
    case AUTH_STATUS.REAUTH_REQUIRED:
      return "Session expired; sign in again";
    case AUTH_STATUS.SIGNING_IN:
      return "Signing in...";
    case AUTH_STATUS.ERROR:
      return "Authentication error";
    default:
      return "Unknown auth state";
  }
}

function sendMessage(message) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        resolve({
          ok: false,
          error: {
            code: "unknown",
            message: chrome.runtime.lastError.message
          }
        });
        return;
      }

      resolve(response || {
        ok: false,
        error: {
          code: "unknown",
          message: "No response from background service worker."
        }
      });
    });
  });
}

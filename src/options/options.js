import { MESSAGE } from "../shared/constants.js";

const form = document.getElementById("settings-form");
const oauthClientIdInput = document.getElementById("oauth-client-id");
const filePrefixInput = document.getElementById("file-prefix");
const maxRecentFilesInput = document.getElementById("max-recent-files");
const statusEl = document.getElementById("status");

void init();

async function init() {
  const response = await sendMessage({ type: MESSAGE.GET_SETTINGS });
  if (!response.ok) {
    statusEl.textContent = response.error?.message || "Failed to load settings.";
    return;
  }

  const settings = response.data.settings;
  oauthClientIdInput.value = settings.oauthClientId || "";
  filePrefixInput.value = settings.defaultFileNamePrefix || "Excalidraw Drawing";
  maxRecentFilesInput.value = String(settings.maxRecentFiles || 20);
  statusEl.textContent = "Settings loaded.";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  statusEl.textContent = "Saving settings...";

  const payload = {
    oauthClientId: oauthClientIdInput.value,
    defaultFileNamePrefix: filePrefixInput.value,
    maxRecentFiles: Number(maxRecentFilesInput.value)
  };

  const response = await sendMessage({
    type: MESSAGE.SAVE_SETTINGS,
    payload
  });

  if (!response.ok) {
    statusEl.textContent = response.error?.message || "Failed to save settings.";
    return;
  }

  statusEl.textContent = "Settings saved.";
});

function sendMessage(message) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        resolve({
          ok: false,
          error: {
            message: chrome.runtime.lastError.message
          }
        });
        return;
      }

      resolve(response || { ok: false, error: { message: "No response." } });
    });
  });
}

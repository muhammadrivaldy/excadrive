import {
  AUTH_STORAGE_KEY,
  LINK_KEY_PREFIX,
  SETTINGS_STORAGE_KEY
} from "../shared/constants.js";

const DEFAULT_SETTINGS = Object.freeze({
  oauthClientId: "",
  defaultFileNamePrefix: "Excalidraw Drawing",
  maxRecentFiles: 20
});

function getLinkKey(tabId) {
  return `${LINK_KEY_PREFIX}${tabId}`;
}

export async function getSettings() {
  const payload = await chrome.storage.local.get([SETTINGS_STORAGE_KEY]);
  const saved = payload[SETTINGS_STORAGE_KEY] || {};

  return {
    ...DEFAULT_SETTINGS,
    ...saved,
    maxRecentFiles: sanitizeMaxRecentFiles(saved.maxRecentFiles)
  };
}

export async function saveSettings(nextSettings) {
  const normalized = {
    oauthClientId: normalizeString(nextSettings.oauthClientId),
    defaultFileNamePrefix:
      normalizeString(nextSettings.defaultFileNamePrefix) ||
      DEFAULT_SETTINGS.defaultFileNamePrefix,
    maxRecentFiles: sanitizeMaxRecentFiles(nextSettings.maxRecentFiles)
  };

  await chrome.storage.local.set({ [SETTINGS_STORAGE_KEY]: normalized });
  return normalized;
}

export async function getAuthToken() {
  const payload = await chrome.storage.local.get([AUTH_STORAGE_KEY]);
  return payload[AUTH_STORAGE_KEY] || null;
}

export async function setAuthToken(tokenPayload) {
  await chrome.storage.local.set({ [AUTH_STORAGE_KEY]: tokenPayload });
}

export async function clearAuthToken() {
  await chrome.storage.local.remove([AUTH_STORAGE_KEY]);
}

export async function getLinkedFile(tabId) {
  if (!Number.isInteger(tabId)) {
    return null;
  }

  const key = getLinkKey(tabId);
  const payload = await chrome.storage.local.get([key]);
  return payload[key] || null;
}

export async function setLinkedFile(tabId, fileRef) {
  if (!Number.isInteger(tabId)) {
    return;
  }

  const key = getLinkKey(tabId);
  const value = {
    fileId: fileRef.fileId,
    fileName: fileRef.fileName,
    linkedAt: new Date().toISOString()
  };

  await chrome.storage.local.set({ [key]: value });
}

export async function clearLinkedFile(tabId) {
  if (!Number.isInteger(tabId)) {
    return;
  }

  await chrome.storage.local.remove([getLinkKey(tabId)]);
}

export async function clearAllLinkedFiles() {
  const all = await chrome.storage.local.get(null);
  const linkKeys = Object.keys(all).filter((key) =>
    key.startsWith(LINK_KEY_PREFIX)
  );

  if (linkKeys.length > 0) {
    await chrome.storage.local.remove(linkKeys);
  }
}

export async function cleanupOrphanedLinkedFiles(activeTabIds) {
  const ids = new Set(activeTabIds.filter((value) => Number.isInteger(value)));
  const all = await chrome.storage.local.get(null);
  const orphanKeys = [];

  for (const key of Object.keys(all)) {
    if (!key.startsWith(LINK_KEY_PREFIX)) {
      continue;
    }

    const tabIdText = key.slice(LINK_KEY_PREFIX.length);
    const tabId = Number(tabIdText);
    if (!Number.isInteger(tabId) || !ids.has(tabId)) {
      orphanKeys.push(key);
    }
  }

  if (orphanKeys.length > 0) {
    await chrome.storage.local.remove(orphanKeys);
  }

  return {
    removed: orphanKeys.length
  };
}

function normalizeString(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function sanitizeMaxRecentFiles(value) {
  const candidate = Number(value);
  if (!Number.isFinite(candidate)) {
    return DEFAULT_SETTINGS.maxRecentFiles;
  }

  const rounded = Math.floor(candidate);
  return Math.max(5, Math.min(50, rounded));
}

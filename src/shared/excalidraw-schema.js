import { ERROR_CODE } from "./constants.js";
import { fail, ok } from "./messages.js";

export function isValidExcalidrawScene(value) {
  if (!value || typeof value !== "object") {
    return false;
  }

  if (!Array.isArray(value.elements)) {
    return false;
  }

  return true;
}

export function parseAndValidateExcalidrawFile(rawText) {
  if (typeof rawText !== "string" || rawText.trim() === "") {
    return fail(ERROR_CODE.INVALID_FILE, "File content is empty.");
  }

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return fail(ERROR_CODE.INVALID_FILE, "File is not valid JSON.");
  }

  if (!isValidExcalidrawScene(parsed)) {
    return fail(
      ERROR_CODE.INVALID_FILE,
      "File is not a valid Excalidraw scene payload."
    );
  }

  return ok({ scene: normalizeScene(parsed) });
}

export function normalizeScene(scene) {
  return {
    type: scene.type || "excalidraw",
    version: scene.version || 2,
    source: scene.source || "https://excalidraw.com",
    elements: Array.isArray(scene.elements) ? scene.elements : [],
    appState: scene.appState && typeof scene.appState === "object" ? scene.appState : {},
    files: scene.files && typeof scene.files === "object" ? scene.files : {}
  };
}

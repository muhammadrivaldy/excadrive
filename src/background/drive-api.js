import {
  ERROR_CODE,
  EXCALIDRAW_MIME
} from "../shared/constants.js";
import { fail, ok } from "../shared/messages.js";

const DRIVE_API_BASE = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_BASE = "https://www.googleapis.com/upload/drive/v3";

function authHeaders(accessToken, extra = {}) {
  return {
    Authorization: `Bearer ${accessToken}`,
    ...extra
  };
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export async function listExcalidrawFiles(accessToken, maxResults = 20) {
  const q = encodeURIComponent("trashed = false and name contains '.excalidraw'");
  const fields = encodeURIComponent("files(id,name,modifiedTime,size,mimeType)");
  const url = `${DRIVE_API_BASE}/files?q=${q}&orderBy=modifiedTime desc&pageSize=${maxResults}&fields=${fields}`;

  let response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: authHeaders(accessToken)
    });
  } catch (error) {
    return fail(ERROR_CODE.DRIVE_LIST_FAILED, "Failed to list Drive files.", {
      raw: String(error?.message || "")
    });
  }

  if (!response.ok) {
    const payload = await safeJson(response);
    return fail(ERROR_CODE.DRIVE_LIST_FAILED, "Failed to list Drive files.", {
      status: response.status,
      payload
    });
  }

  const payload = await safeJson(response);
  const files = Array.isArray(payload.files) ? payload.files : [];

  return ok({ files });
}

export async function downloadDriveFile(accessToken, fileId) {
  const url = `${DRIVE_API_BASE}/files/${encodeURIComponent(fileId)}?alt=media`;

  let response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: authHeaders(accessToken)
    });
  } catch (error) {
    return fail(ERROR_CODE.DRIVE_DOWNLOAD_FAILED, "Failed to download Drive file.", {
      raw: String(error?.message || "")
    });
  }

  if (!response.ok) {
    const payload = await safeJson(response);
    return fail(ERROR_CODE.DRIVE_DOWNLOAD_FAILED, "Failed to download Drive file.", {
      status: response.status,
      payload
    });
  }

  const content = await response.text();
  return ok({ content });
}

export async function createDriveFile(accessToken, fileName, content) {
  const metadata = {
    name: ensureExcalidrawExtension(fileName),
    mimeType: EXCALIDRAW_MIME
  };

  const multipartBody = buildMultipartBody(metadata, content);

  let response;
  try {
    response = await fetch(`${DRIVE_UPLOAD_BASE}/files?uploadType=multipart`, {
      method: "POST",
      headers: authHeaders(accessToken, {
        "Content-Type": `multipart/related; boundary=${multipartBody.boundary}`
      }),
      body: multipartBody.body
    });
  } catch (error) {
    return fail(ERROR_CODE.DRIVE_CREATE_FAILED, "Failed to create Drive file.", {
      raw: String(error?.message || "")
    });
  }

  if (!response.ok) {
    const payload = await safeJson(response);
    return fail(ERROR_CODE.DRIVE_CREATE_FAILED, "Failed to create Drive file.", {
      status: response.status,
      payload
    });
  }

  const payload = await safeJson(response);
  return ok({
    file: {
      id: payload.id,
      name: payload.name || metadata.name
    }
  });
}

export async function updateDriveFile(accessToken, fileId, content) {
  const metadata = {
    mimeType: EXCALIDRAW_MIME
  };

  const multipartBody = buildMultipartBody(metadata, content);

  let response;
  try {
    response = await fetch(
      `${DRIVE_UPLOAD_BASE}/files/${encodeURIComponent(fileId)}?uploadType=multipart`,
      {
        method: "PATCH",
        headers: authHeaders(accessToken, {
          "Content-Type": `multipart/related; boundary=${multipartBody.boundary}`
        }),
        body: multipartBody.body
      }
    );
  } catch (error) {
    return fail(ERROR_CODE.DRIVE_UPDATE_FAILED, "Failed to update Drive file.", {
      raw: String(error?.message || "")
    });
  }

  if (!response.ok) {
    const payload = await safeJson(response);
    const code = response.status === 404 ? ERROR_CODE.STALE_LINK : ERROR_CODE.DRIVE_UPDATE_FAILED;

    return fail(code, "Failed to update Drive file.", {
      status: response.status,
      payload
    });
  }

  const payload = await safeJson(response);
  return ok({
    file: {
      id: payload.id || fileId,
      name: payload.name || ""
    }
  });
}

export async function getDriveFileMetadata(accessToken, fileId) {
  const fields = encodeURIComponent("id,name,mimeType,modifiedTime,trashed");
  const url = `${DRIVE_API_BASE}/files/${encodeURIComponent(fileId)}?fields=${fields}`;

  let response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: authHeaders(accessToken)
    });
  } catch (error) {
    return fail(ERROR_CODE.DRIVE_DOWNLOAD_FAILED, "Failed to check linked Drive file.", {
      raw: String(error?.message || "")
    });
  }

  if (!response.ok) {
    const payload = await safeJson(response);
    const code = response.status === 404 ? ERROR_CODE.STALE_LINK : ERROR_CODE.DRIVE_DOWNLOAD_FAILED;

    return fail(code, "Failed to check linked Drive file.", {
      status: response.status,
      payload
    });
  }

  const payload = await safeJson(response);
  return ok({ file: payload });
}

function ensureExcalidrawExtension(name) {
  const normalized = typeof name === "string" ? name.trim() : "";
  if (!normalized) {
    return "Excalidraw Drawing.excalidraw";
  }

  if (normalized.toLowerCase().endsWith(".excalidraw")) {
    return normalized;
  }

  return `${normalized}.excalidraw`;
}

function buildMultipartBody(metadata, content) {
  const boundary = `excadrive-${Math.random().toString(16).slice(2)}`;
  const body = [
    `--${boundary}`,
    "Content-Type: application/json; charset=UTF-8",
    "",
    JSON.stringify(metadata),
    `--${boundary}`,
    `Content-Type: ${EXCALIDRAW_MIME}`,
    "",
    content,
    `--${boundary}--`
  ].join("\r\n");

  return { boundary, body };
}

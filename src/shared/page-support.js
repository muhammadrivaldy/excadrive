import { ERROR_CODE, SUPPORTED_HOSTS } from "./constants.js";

export function getPageSupport(urlValue) {
  if (!urlValue) {
    return {
      supported: false,
      reason: "No active page URL found.",
      code: ERROR_CODE.UNSUPPORTED_PAGE,
      hostname: ""
    };
  }

  let parsed;
  try {
    parsed = new URL(urlValue);
  } catch {
    return {
      supported: false,
      reason: "Active tab URL is invalid.",
      code: ERROR_CODE.UNSUPPORTED_PAGE,
      hostname: ""
    };
  }

  if (parsed.protocol !== "https:") {
    return {
      supported: false,
      reason: "Only HTTPS pages are supported.",
      code: ERROR_CODE.UNSUPPORTED_PAGE,
      hostname: parsed.hostname || ""
    };
  }

  if (!SUPPORTED_HOSTS.includes(parsed.hostname)) {
    return {
      supported: false,
      reason: "This page is not a supported Excalidraw host.",
      code: ERROR_CODE.UNSUPPORTED_PAGE,
      hostname: parsed.hostname
    };
  }

  return {
    supported: true,
    reason: "Supported Excalidraw page detected.",
    code: "ok",
    hostname: parsed.hostname
  };
}

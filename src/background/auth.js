import {
  AUTH_STATUS,
  DRIVE_SCOPES,
  ERROR_CODE
} from "../shared/constants.js";
import { fail, ok } from "../shared/messages.js";
import {
  clearAuthToken,
  getAuthToken,
  getSettings,
  setAuthToken
} from "./storage.js";

function getOAuthRedirectUri() {
  return chrome.identity.getRedirectURL("oauth2");
}

function buildAuthUrl(clientId) {
  const redirectUri = getOAuthRedirectUri();
  const scope = encodeURIComponent(DRIVE_SCOPES.join(" "));
  const responseType = "token";
  const prompt = "consent";

  return [
    "https://accounts.google.com/o/oauth2/v2/auth",
    `?client_id=${encodeURIComponent(clientId)}`,
    `&redirect_uri=${encodeURIComponent(redirectUri)}`,
    `&response_type=${responseType}`,
    `&scope=${scope}`,
    "&include_granted_scopes=true",
    `&prompt=${prompt}`
  ].join("");
}

function parseTokenFromRedirect(redirectUrl) {
  if (!redirectUrl) {
    return fail(ERROR_CODE.OAUTH_CANCELED, "Authentication was canceled.");
  }

  const fragment = redirectUrl.split("#")[1] || "";
  const params = new URLSearchParams(fragment);
  const accessToken = params.get("access_token");
  const expiresIn = Number(params.get("expires_in") || "0");
  const tokenType = params.get("token_type") || "Bearer";
  const error = params.get("error");

  if (error === "access_denied") {
    return fail(ERROR_CODE.OAUTH_DENIED, "Google access was denied.");
  }

  if (!accessToken) {
    return fail(ERROR_CODE.OAUTH_FAILED, "No access token returned by Google.");
  }

  const expiresAt = Date.now() + Math.max(60, expiresIn) * 1000;

  return ok({
    token: {
      accessToken,
      tokenType,
      expiresAt,
      scopes: DRIVE_SCOPES,
      createdAt: new Date().toISOString()
    }
  });
}

export async function getAuthState() {
  const token = await getAuthToken();
  if (!token) {
    return {
      status: AUTH_STATUS.SIGNED_OUT,
      accountEmail: "",
      lastAuthAt: "",
      errorCode: ""
    };
  }

  if (isExpired(token)) {
    return {
      status: AUTH_STATUS.REAUTH_REQUIRED,
      accountEmail: "",
      lastAuthAt: token.createdAt || "",
      errorCode: ERROR_CODE.REAUTH_REQUIRED
    };
  }

  return {
    status: AUTH_STATUS.SIGNED_IN,
    accountEmail: "Google account connected",
    lastAuthAt: token.createdAt || "",
    errorCode: ""
  };
}

export async function signIn() {
  const settings = await getSettings();
  if (!settings.oauthClientId) {
    return fail(
      ERROR_CODE.OAUTH_NOT_CONFIGURED,
      "OAuth client ID is not configured. Set it in options."
    );
  }

  const authUrl = buildAuthUrl(settings.oauthClientId);

  let redirectUrl = "";
  try {
    redirectUrl = await chrome.identity.launchWebAuthFlow({
      url: authUrl,
      interactive: true
    });
  } catch (error) {
    const message = String(error?.message || "");
    if (message.toLowerCase().includes("canceled")) {
      return fail(ERROR_CODE.OAUTH_CANCELED, "Authentication was canceled.");
    }

    return fail(ERROR_CODE.OAUTH_FAILED, "Authentication failed.", {
      raw: message
    });
  }

  const parsed = parseTokenFromRedirect(redirectUrl);
  if (!parsed.ok) {
    return parsed;
  }

  await setAuthToken(parsed.data.token);
  return ok({ authState: await getAuthState() });
}

export async function signOut() {
  await clearAuthToken();
  return ok({ authState: await getAuthState() });
}

export async function getValidToken() {
  const token = await getAuthToken();
  if (!token) {
    return fail(ERROR_CODE.NOT_AUTHENTICATED, "Sign in is required.");
  }

  if (isExpired(token)) {
    return fail(ERROR_CODE.REAUTH_REQUIRED, "Session expired. Please sign in again.");
  }

  return ok({ token: token.accessToken });
}

function isExpired(token) {
  return !token.expiresAt || Date.now() >= token.expiresAt - 30 * 1000;
}

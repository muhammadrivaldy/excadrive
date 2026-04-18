(function bootstrapContentBridge() {
  const injectedUrl = chrome.runtime.getURL("src/content/injected-bridge.js");
  const injectedScript = document.createElement("script");
  injectedScript.src = injectedUrl;
  injectedScript.dataset.excadrive = "bridge";
  injectedScript.onload = () => injectedScript.remove();
  (document.head || document.documentElement).appendChild(injectedScript);

  const pending = new Map();
  let requestSeq = 0;

  window.addEventListener("message", (event) => {
    if (event.source !== window) {
      return;
    }

    const message = event.data;
    if (!message || message.source !== "EXCADRIVE_INJECTED_BRIDGE") {
      return;
    }

    if (message.type !== "EXCADRIVE_BRIDGE_RESPONSE") {
      return;
    }

    const key = String(message.requestId || "");
    if (!pending.has(key)) {
      return;
    }

    const done = pending.get(key);
    pending.delete(key);
    done(message.payload || {
      ok: false,
      error: {
        code: "bridge_unavailable",
        message: "Bridge payload missing."
      }
    });
  });

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    const messageType = message && message.type;

    if (
      messageType !== "BRIDGE_READ_SCENE" &&
      messageType !== "BRIDGE_WRITE_SCENE" &&
      messageType !== "BRIDGE_PING"
    ) {
      return false;
    }

    void handleBridgeRequest(messageType, message.payload || {})
      .then((result) => sendResponse(result))
      .catch((error) => {
        sendResponse({
          ok: false,
          error: {
            code: "bridge_unavailable",
            message: "Bridge request failed.",
            details: {
              raw: String(error && error.message ? error.message : "")
            }
          }
        });
      });

    return true;
  });

  function handleBridgeRequest(type, payload) {
    const requestId = `bridge-${Date.now()}-${requestSeq++}`;

    const envelope = {
      source: "EXCADRIVE_CONTENT_SCRIPT",
      type: "EXCADRIVE_BRIDGE_REQUEST",
      requestId,
      payload: {
        type,
        payload
      }
    };

    return new Promise((resolve) => {
      const timeoutId = window.setTimeout(() => {
        pending.delete(requestId);
        resolve({
          ok: false,
          error: {
            code: "bridge_unavailable",
            message: "Bridge timed out. Refresh Excalidraw and retry."
          }
        });
      }, 5000);

      pending.set(requestId, (response) => {
        window.clearTimeout(timeoutId);
        resolve(response);
      });

      window.postMessage(envelope, "*");
    });
  }
})();

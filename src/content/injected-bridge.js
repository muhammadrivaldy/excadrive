(function injectedBridge() {
  const BRIDGE_SOURCE = "EXCADRIVE_INJECTED_BRIDGE";

  window.addEventListener("message", async (event) => {
    if (event.source !== window) {
      return;
    }

    const message = event.data;
    if (!message || message.source !== "EXCADRIVE_CONTENT_SCRIPT") {
      return;
    }

    if (message.type !== "EXCADRIVE_BRIDGE_REQUEST") {
      return;
    }

    const requestId = message.requestId;
    const operation = message.payload || {};
    const responsePayload = await runOperation(operation.type, operation.payload || {});

    window.postMessage(
      {
        source: BRIDGE_SOURCE,
        type: "EXCADRIVE_BRIDGE_RESPONSE",
        requestId,
        payload: responsePayload
      },
      "*"
    );
  });

  async function runOperation(type, payload) {
    switch (type) {
      case "BRIDGE_PING":
        return {
          ok: true,
          data: { alive: true }
        };
      case "BRIDGE_READ_SCENE":
        return readScene();
      case "BRIDGE_WRITE_SCENE":
        return writeScene(payload.scene);
      default:
        return fail("bridge_unavailable", "Unsupported bridge operation.");
    }
  }

  function readScene() {
    const scene = getSceneFromGlobals();
    if (!scene) {
      return fail(
        "bridge_read_failed",
        "Could not read current Excalidraw scene from page context."
      );
    }

    return {
      ok: true,
      data: {
        scene
      }
    };
  }

  function writeScene(scene) {
    if (!scene || typeof scene !== "object") {
      return fail("bridge_write_failed", "Scene payload is invalid.");
    }

    const writeOk = publishSceneToPage(scene);
    if (!writeOk) {
      return fail(
        "bridge_write_failed",
        "Could not write scene into Excalidraw page context."
      );
    }

    return {
      ok: true,
      data: {
        applied: true
      }
    };
  }

  function getSceneFromGlobals() {
    try {
      if (window.excalidrawAPI && typeof window.excalidrawAPI.getSceneElements === "function") {
        return {
          type: "excalidraw",
          version: 2,
          source: "https://excalidraw.com",
          elements: window.excalidrawAPI.getSceneElements(),
          appState:
            typeof window.excalidrawAPI.getAppState === "function"
              ? window.excalidrawAPI.getAppState()
              : {},
          files:
            typeof window.excalidrawAPI.getFiles === "function"
              ? window.excalidrawAPI.getFiles()
              : {}
        };
      }

      const fallback = window.localStorage.getItem("excalidraw");
      if (fallback) {
        const parsed = JSON.parse(fallback);
        if (parsed && Array.isArray(parsed.elements)) {
          return {
            type: parsed.type || "excalidraw",
            version: parsed.version || 2,
            source: parsed.source || "https://excalidraw.com",
            elements: parsed.elements,
            appState: parsed.appState || {},
            files: parsed.files || {}
          };
        }
      }
    } catch {
      return null;
    }

    return null;
  }

  function publishSceneToPage(scene) {
    try {
      if (window.excalidrawAPI && typeof window.excalidrawAPI.updateScene === "function") {
        window.excalidrawAPI.updateScene({
          elements: scene.elements || [],
          appState: scene.appState || {},
          files: scene.files || {}
        });
        return true;
      }

      const event = new CustomEvent("excadrive:import-scene", {
        detail: {
          scene
        }
      });
      window.dispatchEvent(event);
      window.localStorage.setItem("excalidraw", JSON.stringify(scene));
      return true;
    } catch {
      return false;
    }
  }

  function fail(code, message) {
    return {
      ok: false,
      error: {
        code,
        message
      }
    };
  }
})();

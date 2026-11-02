/*! coi-serviceworker v0.1.7 - MIT License - https://github.com/gzuidhof/coi-serviceworker */
let coepCredentialless = false;
if (typeof window === 'undefined') {
  self.addEventListener("install", () => self.skipWaiting());
  self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

  self.addEventListener("message", (ev) => {
    if (!ev.data) return;
    if (ev.data.type === "deregister") {
      self.registration.unregister().then(() => {
        return self.clients.matchAll();
      }).then((clients) => {
        clients.forEach((client) => client.navigate(client.url));
      });
    }
  });

  self.addEventListener("fetch", function (event) {
    const r = event.request;
    if (r.cache === "only-if-cached" && r.mode !== "same-origin") return;

    const request = (coepCredentialless && r.mode === "no-cors")
      ? new Request(r, { credentials: "omit" })
      : r;

    event.respondWith(
      fetch(request).then((response) => {
        if (response.status === 0) return response;

        const newHeaders = new Headers(response.headers);
        newHeaders.set("Cross-Origin-Embedder-Policy", coepCredentialless ? "credentialless" : "require-corp");
        if (!newHeaders.get("Cross-Origin-Opener-Policy")) {
          newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
        }
        if (!newHeaders.get("Cross-Origin-Resource-Policy")) {
          newHeaders.set("Cross-Origin-Resource-Policy", "cross-origin");
        }

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      }).catch((e) => console.error(e))
    );
  });
} else {
  (() => {
    const reloadedBySelf = window.sessionStorage && window.sessionStorage.getItem("coiReloadedBySelf");
    window.sessionStorage && window.sessionStorage.removeItem("coiReloadedBySelf");
    const coepDegradation = reloadedBySelf == "coepdegrade";

    // You can customize the script URL here
    const currentScript = document.currentScript;
    const scriptUrl = currentScript ? currentScript.src : "/coi-serviceworker.js";

    if (window.crossOriginIsolated || !("serviceWorker" in navigator)) {
      if (window.crossOriginIsolated) {
        window.sessionStorage && window.sessionStorage.setItem("coiCoepHasRun", "true");
      }
      return;
    }

    navigator.serviceWorker.register(scriptUrl).then((registration) => {
      registration.addEventListener("updatefound", () => {
        window.location.reload();
      });

      if (registration.active && !navigator.serviceWorker.controller) {
        window.sessionStorage && window.sessionStorage.setItem("coiReloadedBySelf", "true");
        window.location.reload();
      }
    }, (err) => {
      console.warn("COI ServiceWorker registration failed: ", err);
    });
  })();
}

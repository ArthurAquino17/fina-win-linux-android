(function () {
  function getCtx() {
    return window.FinaRuntime;
  }

  const state = new Proxy({}, {
    get: (_, prop) => getCtx().state[prop],
    set: (_, prop, value) => {
      getCtx().state[prop] = value;
      return true;
    },
  });
  const els = new Proxy({}, {
    get: (_, prop) => getCtx().els[prop],
  });

function setupPWA() {
  els.installBtn.hidden = true;

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state.deferredPrompt = event;
    els.installBtn.hidden = false;
  });

  window.addEventListener("appinstalled", () => {
    state.deferredPrompt = null;
    els.installBtn.hidden = true;
  });

  els.installBtn.addEventListener("click", async () => {
    if (!state.deferredPrompt) return;
    state.deferredPrompt.prompt();
    await state.deferredPrompt.userChoice;
    state.deferredPrompt = null;
    els.installBtn.hidden = true;
  });
}

  window.FinaPWA = {
    setupPWA,
  };
})();

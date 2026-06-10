(function () {
  function getCtx() {
    return window.FinaRuntime;
  }

  function loadUsers(...args) {
    return getCtx().loadUsers(...args);
  }

  function renderAuthMode(...args) {
    return getCtx().renderAuthMode(...args);
  }

  function bindEvents(...args) {
    return getCtx().bindEvents(...args);
  }

  function setupPWA(...args) {
    return getCtx().setupPWA(...args);
  }

  function loadSession(...args) {
    return getCtx().loadSession(...args);
  }

  function startAppForCurrentUser(...args) {
    return getCtx().startAppForCurrentUser(...args);
  }

  function showAuthScreen(...args) {
    return getCtx().showAuthScreen(...args);
  }

  const state = new Proxy({}, {
    get: (_, prop) => getCtx().state[prop],
    set: (_, prop, value) => {
      getCtx().state[prop] = value;
      return true;
    },
  });

function init() {
  loadUsers();
  renderAuthMode();
  bindEvents();
  setupPWA();

  const sessionUser = loadSession();
  if (sessionUser) {
    state.currentUser = sessionUser;
    startAppForCurrentUser();
    return;
  }

  showAuthScreen();
}

  window.FinaBoot = {
    init,
  };
})();

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

  function normalizeEmail(...args) {
    return getCtx().normalizeEmail(...args);
  }

  function hashPassword(...args) {
    return getCtx().hashPassword(...args);
  }

  function uuid(...args) {
    return getCtx().uuid(...args);
  }

  function saveUsers(...args) {
    return getCtx().saveUsers(...args);
  }

  function saveSession(...args) {
    return getCtx().saveSession(...args);
  }

  function loadTransactionsForUser(...args) {
    return getCtx().loadTransactionsForUser(...args);
  }

  function loadBudgetsForUser(...args) {
    return getCtx().loadBudgetsForUser(...args);
  }

  function loadBudgetCardModelsForUser(...args) {
    return getCtx().loadBudgetCardModelsForUser(...args);
  }

  function loadRecurringForUser(...args) {
    return getCtx().loadRecurringForUser(...args);
  }

  function loadGoalsForUser(...args) {
    return getCtx().loadGoalsForUser(...args);
  }

  function loadAccountsForUser(...args) {
    return getCtx().loadAccountsForUser(...args);
  }

  function loadPortfolioForUser(...args) {
    return getCtx().loadPortfolioForUser(...args);
  }

  function loadOwnedCardsForUser(...args) {
    return getCtx().loadOwnedCardsForUser(...args);
  }

  function loadCustomCategoriesForUser(...args) {
    return getCtx().loadCustomCategoriesForUser(...args);
  }

  function loadFinancialProfileForUser(...args) {
    return getCtx().loadFinancialProfileForUser(...args);
  }

  function loadSettingsForUser(...args) {
    return getCtx().loadSettingsForUser(...args);
  }

  function generateRecurringForMonth(...args) {
    return getCtx().generateRecurringForMonth(...args);
  }

  function populateCategories(...args) {
    return getCtx().populateCategories(...args);
  }

  function populateAccounts(...args) {
    return getCtx().populateAccounts(...args);
  }

  function populateCardNameSuggestions(...args) {
    return getCtx().populateCardNameSuggestions(...args);
  }

  function populateBudgetCardOptions(...args) {
    return getCtx().populateBudgetCardOptions(...args);
  }

  function syncFinancialProfileForm(...args) {
    return getCtx().syncFinancialProfileForm(...args);
  }

  function todayISO(...args) {
    return getCtx().todayISO(...args);
  }

  function updateUserBadge(...args) {
    return getCtx().updateUserBadge(...args);
  }

  function applySettings(...args) {
    return getCtx().applySettings(...args);
  }

  function switchTab(...args) {
    return getCtx().switchTab(...args);
  }

  function refreshUI(...args) {
    return getCtx().refreshUI(...args);
  }

  function startAutomaticQuoteUpdates(...args) {
    return getCtx().startAutomaticQuoteUpdates(...args);
  }

function setAuthMessage(message, tone = "normal") {
  els.authMessage.textContent = message;
  els.authMessage.style.color = tone === "error" ? "#b91c1c" : "#64748b";
}

function renderAuthMode() {
  const isLogin = state.authMode === "login";
  els.authSubmitBtn.textContent = isLogin ? "Entrar" : "Criar conta";
  els.authToggleBtn.textContent = isLogin ? "Criar conta" : "Ja tenho conta";
  els.authName.parentElement.hidden = isLogin;
  setAuthMessage(
    isLogin
      ? "Use seu email e senha para abrir seu painel local."
      : "Crie uma conta local para separar seus lancamentos.",
  );
}

function showAuthScreen() {
  els.authScreen.hidden = false;
  els.authScreen.style.display = "grid";
  els.appMain.hidden = true;
  els.appMain.style.display = "none";
}

function showAppScreen() {
  els.authScreen.hidden = true;
  els.authScreen.style.display = "none";
  els.appMain.hidden = false;
  els.appMain.style.display = "";
}

function startAppForCurrentUser() {
  loadTransactionsForUser();
  loadBudgetsForUser();
  loadBudgetCardModelsForUser();
  loadRecurringForUser();
  loadGoalsForUser();
  loadAccountsForUser();
  loadPortfolioForUser();
  loadOwnedCardsForUser();
  loadCustomCategoriesForUser();
  loadFinancialProfileForUser();
  loadSettingsForUser();
  generateRecurringForMonth();
  populateCategories();
  populateAccounts();
  populateCardNameSuggestions();
  populateBudgetCardOptions();
  syncFinancialProfileForm();
  els.txDate.value = todayISO();
  els.incomeDate.value = todayISO();
  els.installmentDate.value = todayISO();
  els.recurringDay.value = "5";
  updateUserBadge();
  applySettings();
  showAppScreen();
  switchTab(state.activeTab);
  refreshUI();
  startAutomaticQuoteUpdates();
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const email = normalizeEmail(els.authEmail.value);
  const password = els.authPassword.value;
  const name = els.authName.value.trim();

  if (!email || !password) {
    setAuthMessage("Informe email e senha.", "error");
    return;
  }

  if (state.authMode === "register") {
    if (!name) {
      setAuthMessage("Informe seu nome para criar a conta.", "error");
      return;
    }
    if (state.users.some((user) => normalizeEmail(user.email) === email)) {
      setAuthMessage("Ja existe uma conta com esse email.", "error");
      return;
    }

    const user = {
      id: uuid(),
      name,
      email,
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
    };
    state.users.push(user);
    saveUsers();
    saveSession(user.id);
    state.currentUser = user;
    setAuthMessage("Conta criada com sucesso.", "normal");
    startAppForCurrentUser();
    return;
  }

  const user = state.users.find((item) => normalizeEmail(item.email) === email);
  if (!user) {
    setAuthMessage("Conta nao encontrada. Crie uma conta primeiro.", "error");
    return;
  }

  const passwordHash = await hashPassword(password);
  if (user.passwordHash !== passwordHash) {
    setAuthMessage("Senha incorreta.", "error");
    return;
  }

  saveSession(user.id);
  state.currentUser = user;
  setAuthMessage("Login realizado com sucesso.", "normal");
  startAppForCurrentUser();
}

  window.FinaAuth = {
    setAuthMessage,
    renderAuthMode,
    showAuthScreen,
    showAppScreen,
    startAppForCurrentUser,
    handleAuthSubmit,
  };
})();

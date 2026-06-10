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

  const { DEFAULT_FINANCIAL_PROFILE, AUTO_BACKUP_KEY } = window.FinaAppData;

  function initTabs(...args) {
    return getCtx().initTabs(...args);
  }

  function setFunctionMenuVisible(...args) {
    return getCtx().setFunctionMenuVisible(...args);
  }

  function handleSubmit(...args) {
    return getCtx().handleSubmit(...args);
  }

  function handleIncomeSubmit(...args) {
    return getCtx().handleIncomeSubmit(...args);
  }

  function handleBudgetSubmit(...args) {
    return getCtx().handleBudgetSubmit(...args);
  }

  function handleRecurringSubmit(...args) {
    return getCtx().handleRecurringSubmit(...args);
  }

  function handleGoalSubmit(...args) {
    return getCtx().handleGoalSubmit(...args);
  }

  function handleInvestorProfileSubmit(...args) {
    return getCtx().handleInvestorProfileSubmit(...args);
  }

  function handleCardProfileSubmit(...args) {
    return getCtx().handleCardProfileSubmit(...args);
  }

  function handlePortfolioSubmit(...args) {
    return getCtx().handlePortfolioSubmit(...args);
  }

  function handleOwnedCardSubmit(...args) {
    return getCtx().handleOwnedCardSubmit(...args);
  }

  function refreshPortfolioQuotes(...args) {
    return getCtx().refreshPortfolioQuotes(...args);
  }

  function refreshMarketQuotes(...args) {
    return getCtx().refreshMarketQuotes(...args);
  }

  function handleAccountSubmit(...args) {
    return getCtx().handleAccountSubmit(...args);
  }

  function handleCategorySubmit(...args) {
    return getCtx().handleCategorySubmit(...args);
  }

  function handleInstallmentSubmit(...args) {
    return getCtx().handleInstallmentSubmit(...args);
  }

  function resetForm(...args) {
    return getCtx().resetForm(...args);
  }

  function deleteSelected(...args) {
    return getCtx().deleteSelected(...args);
  }

  function exportCSV(...args) {
    return getCtx().exportCSV(...args);
  }

  function exportIncomeCSV(...args) {
    return getCtx().exportIncomeCSV(...args);
  }

  function exportJSON(...args) {
    return getCtx().exportJSON(...args);
  }

  function exportReportHTML(...args) {
    return getCtx().exportReportHTML(...args);
  }

  function saveLocalSnapshot(...args) {
    return getCtx().saveLocalSnapshot(...args);
  }

  function renderAppHealth(...args) {
    return getCtx().renderAppHealth(...args);
  }

  function resetAllUserData(...args) {
    return getCtx().resetAllUserData(...args);
  }

  function storageKeyForUser(...args) {
    return getCtx().storageKeyForUser(...args);
  }

  function saveUsers(...args) {
    return getCtx().saveUsers(...args);
  }

  function clearSession(...args) {
    return getCtx().clearSession(...args);
  }

  function importJSONFile(...args) {
    return getCtx().importJSONFile(...args);
  }

  function importCSVFile(...args) {
    return getCtx().importCSVFile(...args);
  }

  function suggestCategory(...args) {
    return getCtx().suggestCategory(...args);
  }

  function saveSettingsForUser(...args) {
    return getCtx().saveSettingsForUser(...args);
  }

  function applySettings(...args) {
    return getCtx().applySettings(...args);
  }

  function refreshUI(...args) {
    return getCtx().refreshUI(...args);
  }

  function handleCardSelectionChange(...args) {
    return getCtx().handleCardSelectionChange(...args);
  }

  function updateMilesProfileFromInputs(...args) {
    return getCtx().updateMilesProfileFromInputs(...args);
  }

  function stopAutomaticQuoteUpdates(...args) {
    return getCtx().stopAutomaticQuoteUpdates(...args);
  }

  function showAuthScreen(...args) {
    return getCtx().showAuthScreen(...args);
  }

  function setAuthMessage(...args) {
    return getCtx().setAuthMessage(...args);
  }

  function renderAuthMode(...args) {
    return getCtx().renderAuthMode(...args);
  }

  function handleAuthSubmit(...args) {
    return getCtx().handleAuthSubmit(...args);
  }

function bindEvents() {
  initTabs();
  els.toggleFunctionsBtn.addEventListener("click", () => {
    setFunctionMenuVisible(els.functionMenuGrid.hidden);
  });
  els.transactionForm.addEventListener("submit", handleSubmit);
  els.incomeForm.addEventListener("submit", handleIncomeSubmit);
  els.budgetForm.addEventListener("submit", handleBudgetSubmit);
  els.recurringForm.addEventListener("submit", handleRecurringSubmit);
  els.goalForm.addEventListener("submit", handleGoalSubmit);
  els.investorProfileForm.addEventListener("submit", handleInvestorProfileSubmit);
  els.cardProfileForm.addEventListener("submit", handleCardProfileSubmit);
  els.portfolioForm.addEventListener("submit", handlePortfolioSubmit);
  els.ownedCardForm.addEventListener("submit", handleOwnedCardSubmit);
  els.refreshQuotesBtn.addEventListener("click", () => refreshPortfolioQuotes({ force: true }));
  els.refreshMarketQuotesBtn.addEventListener("click", () => refreshMarketQuotes({ force: true }));
  els.accountForm.addEventListener("submit", handleAccountSubmit);
  els.categoryForm.addEventListener("submit", handleCategorySubmit);
  els.installmentForm.addEventListener("submit", handleInstallmentSubmit);
  els.clearFormBtn.addEventListener("click", resetForm);
  els.deleteBtn.addEventListener("click", deleteSelected);
  els.exportBtn.addEventListener("click", exportCSV);
  els.exportIncomeBtn.addEventListener("click", exportIncomeCSV);
  els.exportJsonBtn.addEventListener("click", exportJSON);
  els.exportReportBtn.addEventListener("click", exportReportHTML);
  els.autoBackupBtn.addEventListener("click", () => {
    saveLocalSnapshot();
    renderAppHealth();
    window.alert("Snapshot local salvo neste navegador.");
  });
  els.resetDataBtn.addEventListener("click", resetAllUserData);
  els.deleteAccountBtn.addEventListener("click", () => {
    if (!state.currentUser) return;
    const confirmed = window.confirm("Excluir esta conta local e todos os dados dela?");
    if (!confirmed) return;
    const userId = state.currentUser.id;
    for (const namespace of ["transactions", "budgets", "budgetCardModels", "recurring", "goals", "accounts", "portfolio", "ownedCards", "categories", "financialProfile", "settings"]) {
      localStorage.removeItem(storageKeyForUser(userId, namespace));
    }
    localStorage.removeItem(`${AUTO_BACKUP_KEY}.${userId}`);
    state.users = state.users.filter((user) => user.id !== userId);
    saveUsers();
    clearSession();
    window.location.reload();
  });
  els.importJsonInput.addEventListener("change", () => {
    importJSONFile(els.importJsonInput.files[0]);
    els.importJsonInput.value = "";
  });
  els.importCsvInput.addEventListener("change", () => {
    importCSVFile(els.importCsvInput.files[0]);
    els.importCsvInput.value = "";
  });
  els.txDescription.addEventListener("input", () => {
    const suggested = suggestCategory(els.txDescription.value);
    if (suggested) els.txCategory.value = suggested;
  });
  els.darkModeToggle.addEventListener("change", () => {
    state.settings.darkMode = els.darkModeToggle.checked;
    saveSettingsForUser();
    applySettings();
  });
  els.tutorialToggle.addEventListener("change", () => {
    state.settings.showTutorial = els.tutorialToggle.checked;
    saveSettingsForUser();
    applySettings();
  });
  els.searchInput.addEventListener("input", () => {
    state.filters.search = els.searchInput.value;
    refreshUI();
  });
  els.filterType.addEventListener("change", () => {
    state.filters.type = els.filterType.value;
    refreshUI();
  });
  els.filterMonth.addEventListener("change", () => {
    state.filters.month = els.filterMonth.value;
    refreshUI();
  });
  els.filterCategory.addEventListener("change", () => {
    state.filters.category = els.filterCategory.value;
    refreshUI();
  });
  els.filterMinAmount.addEventListener("input", () => {
    state.filters.minAmount = els.filterMinAmount.value;
    refreshUI();
  });
  els.filterMaxAmount.addEventListener("input", () => {
    state.filters.maxAmount = els.filterMaxAmount.value;
    refreshUI();
  });
  els.applyFiltersBtn.addEventListener("click", refreshUI);
  els.userCard.addEventListener("change", () => {
    handleCardSelectionChange(els.userCard.value);
  });
  els.milesUserCard.addEventListener("change", () => {
    handleCardSelectionChange(els.milesUserCard.value);
  });
  for (const input of [els.milesPerDollar, els.cardDollarRate, els.transferBonus, els.mileValue]) {
    input.addEventListener("input", updateMilesProfileFromInputs);
  }
  els.lockBtn.addEventListener("click", () => {
    stopAutomaticQuoteUpdates();
    clearSession();
    state.currentUser = null;
    showAuthScreen();
    setAuthMessage("Tela bloqueada. Entre novamente para continuar.", "normal");
  });
  els.logoutBtn.addEventListener("click", () => {
    stopAutomaticQuoteUpdates();
    clearSession();
    state.currentUser = null;
    state.transactions = [];
    state.budgets = {};
    state.budgetCardModels = {};
    state.recurring = [];
    state.goals = [];
    state.accounts = [];
    state.portfolio = [];
    state.ownedCards = [];
    state.customCategories = [];
    state.financialProfile = { ...DEFAULT_FINANCIAL_PROFILE };
    state.editingId = null;
    showAuthScreen();
    setAuthMessage("Voce saiu da conta.", "normal");
  });
  els.authToggleBtn.addEventListener("click", () => {
    state.authMode = state.authMode === "login" ? "register" : "login";
    renderAuthMode();
  });
  els.authForm.addEventListener("submit", handleAuthSubmit);
}

  window.FinaEvents = {
    bindEvents,
  };
})();

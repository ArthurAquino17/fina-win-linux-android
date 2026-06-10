(function () {
  function createStorage({ state, keys, defaults, utils }) {
    const { USERS_KEY, SESSION_KEY } = keys;
    const { DEFAULT_ACCOUNTS, DEFAULT_FINANCIAL_PROFILE } = defaults;
    const { storageKeyForUser, safeJsonParse } = utils;

    function loadUsers() {
      state.users = safeJsonParse(localStorage.getItem(USERS_KEY), []);
    }

    function saveUsers() {
      localStorage.setItem(USERS_KEY, JSON.stringify(state.users));
    }

    function loadSession() {
      const userId = sessionStorage.getItem(SESSION_KEY);
      if (!userId) return null;
      return state.users.find((user) => user.id === userId) || null;
    }

    function saveSession(userId) {
      sessionStorage.setItem(SESSION_KEY, userId);
    }

    function clearSession() {
      sessionStorage.removeItem(SESSION_KEY);
    }

    function loadTransactionsForUser() {
      if (!state.currentUser) {
        state.transactions = [];
        return;
      }
      state.transactions = safeJsonParse(localStorage.getItem(storageKeyForUser(state.currentUser.id)), []);
    }

    function saveTransactionsForUser() {
      if (!state.currentUser) return;
      localStorage.setItem(storageKeyForUser(state.currentUser.id), JSON.stringify(state.transactions));
    }

    function loadBudgetsForUser() {
      if (!state.currentUser) {
        state.budgets = {};
        return;
      }
      state.budgets = safeJsonParse(localStorage.getItem(storageKeyForUser(state.currentUser.id, "budgets")), {});
    }

    function saveBudgetsForUser() {
      if (!state.currentUser) return;
      localStorage.setItem(storageKeyForUser(state.currentUser.id, "budgets"), JSON.stringify(state.budgets));
    }

    function loadBudgetCardModelsForUser() {
      if (!state.currentUser) {
        state.budgetCardModels = {};
        return;
      }
      state.budgetCardModels = safeJsonParse(localStorage.getItem(storageKeyForUser(state.currentUser.id, "budgetCardModels")), {});
    }

    function saveBudgetCardModelsForUser() {
      if (!state.currentUser) return;
      localStorage.setItem(storageKeyForUser(state.currentUser.id, "budgetCardModels"), JSON.stringify(state.budgetCardModels));
    }

    function loadRecurringForUser() {
      if (!state.currentUser) {
        state.recurring = [];
        return;
      }
      state.recurring = safeJsonParse(localStorage.getItem(storageKeyForUser(state.currentUser.id, "recurring")), []);
    }

    function saveRecurringForUser() {
      if (!state.currentUser) return;
      localStorage.setItem(storageKeyForUser(state.currentUser.id, "recurring"), JSON.stringify(state.recurring));
    }

    function loadGoalsForUser() {
      if (!state.currentUser) {
        state.goals = [];
        return;
      }
      state.goals = safeJsonParse(localStorage.getItem(storageKeyForUser(state.currentUser.id, "goals")), []);
    }

    function saveGoalsForUser() {
      if (!state.currentUser) return;
      localStorage.setItem(storageKeyForUser(state.currentUser.id, "goals"), JSON.stringify(state.goals));
    }

    function loadAccountsForUser() {
      if (!state.currentUser) {
        state.accounts = [];
        return;
      }
      state.accounts = safeJsonParse(localStorage.getItem(storageKeyForUser(state.currentUser.id, "accounts")), []);
      if (!state.accounts.length) {
        state.accounts = DEFAULT_ACCOUNTS.map((account) => ({ ...account }));
        saveAccountsForUser();
      }
    }

    function saveAccountsForUser() {
      if (!state.currentUser) return;
      localStorage.setItem(storageKeyForUser(state.currentUser.id, "accounts"), JSON.stringify(state.accounts));
    }

    function loadPortfolioForUser() {
      if (!state.currentUser) {
        state.portfolio = [];
        return;
      }
      state.portfolio = safeJsonParse(localStorage.getItem(storageKeyForUser(state.currentUser.id, "portfolio")), []);
    }

    function savePortfolioForUser() {
      if (!state.currentUser) return;
      localStorage.setItem(storageKeyForUser(state.currentUser.id, "portfolio"), JSON.stringify(state.portfolio));
    }

    function loadOwnedCardsForUser() {
      if (!state.currentUser) {
        state.ownedCards = [];
        return;
      }
      state.ownedCards = safeJsonParse(localStorage.getItem(storageKeyForUser(state.currentUser.id, "ownedCards")), []);
    }

    function saveOwnedCardsForUser() {
      if (!state.currentUser) return;
      localStorage.setItem(storageKeyForUser(state.currentUser.id, "ownedCards"), JSON.stringify(state.ownedCards));
    }

    function loadCustomCategoriesForUser() {
      if (!state.currentUser) {
        state.customCategories = [];
        return;
      }
      state.customCategories = safeJsonParse(localStorage.getItem(storageKeyForUser(state.currentUser.id, "categories")), []);
    }

    function saveCustomCategoriesForUser() {
      if (!state.currentUser) return;
      localStorage.setItem(storageKeyForUser(state.currentUser.id, "categories"), JSON.stringify(state.customCategories));
    }

    function loadFinancialProfileForUser() {
      if (!state.currentUser) {
        state.financialProfile = { ...DEFAULT_FINANCIAL_PROFILE };
        return;
      }
      state.financialProfile = {
        ...DEFAULT_FINANCIAL_PROFILE,
        ...safeJsonParse(localStorage.getItem(storageKeyForUser(state.currentUser.id, "financialProfile")), {}),
      };
    }

    function saveFinancialProfileForUser() {
      if (!state.currentUser) return;
      localStorage.setItem(storageKeyForUser(state.currentUser.id, "financialProfile"), JSON.stringify(state.financialProfile));
    }

    function loadSettingsForUser() {
      if (!state.currentUser) return;
      state.settings = {
        ...state.settings,
        ...safeJsonParse(localStorage.getItem(storageKeyForUser(state.currentUser.id, "settings")), {}),
      };
    }

    function saveSettingsForUser() {
      if (!state.currentUser) return;
      localStorage.setItem(storageKeyForUser(state.currentUser.id, "settings"), JSON.stringify(state.settings));
    }

    return {
      loadUsers,
      saveUsers,
      loadSession,
      saveSession,
      clearSession,
      loadTransactionsForUser,
      saveTransactionsForUser,
      loadBudgetsForUser,
      saveBudgetsForUser,
      loadBudgetCardModelsForUser,
      saveBudgetCardModelsForUser,
      loadRecurringForUser,
      saveRecurringForUser,
      loadGoalsForUser,
      saveGoalsForUser,
      loadAccountsForUser,
      saveAccountsForUser,
      loadPortfolioForUser,
      savePortfolioForUser,
      loadOwnedCardsForUser,
      saveOwnedCardsForUser,
      loadCustomCategoriesForUser,
      saveCustomCategoriesForUser,
      loadFinancialProfileForUser,
      saveFinancialProfileForUser,
      loadSettingsForUser,
      saveSettingsForUser,
    };
  }

  window.FinaStorage = {
    createStorage,
  };
})();

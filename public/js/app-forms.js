(function () {
  function getCtx() {
    return window.FinaRuntime;
  }

  const { DEFAULT_CATEGORIES, DEFAULT_ACCOUNTS, DEFAULT_FINANCIAL_PROFILE, AUTO_BACKUP_KEY } = window.FinaAppData;
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

  function clearElement(...args) {
    return getCtx().clearElement(...args);
  }

  function profileValue(...args) {
    return getCtx().profileValue(...args);
  }

  function populateCardOptions(...args) {
    return getCtx().populateCardOptions(...args);
  }

  function populateBudgetCardOptions(...args) {
    return getCtx().populateBudgetCardOptions(...args);
  }

  function findCardByKey(...args) {
    return getCtx().findCardByKey(...args);
  }

  function findOwnedCardByKey(...args) {
    return getCtx().findOwnedCardByKey(...args);
  }

  function applySelectedCardMilesDefaults(...args) {
    return getCtx().applySelectedCardMilesDefaults(...args);
  }

  function moneyToFloat(...args) {
    return getCtx().moneyToFloat(...args);
  }

  function floatToMoney(...args) {
    return getCtx().floatToMoney(...args);
  }

  function cardLabelFromKey(...args) {
    return getCtx().cardLabelFromKey(...args);
  }

  function transactionTypeForTab(...args) {
    return getCtx().transactionTypeForTab(...args);
  }

  function todayISO(...args) {
    return getCtx().todayISO(...args);
  }

  function addMonths(...args) {
    return getCtx().addMonths(...args);
  }

  function uuid(...args) {
    return getCtx().uuid(...args);
  }

  function storageKeyForUser(...args) {
    return getCtx().storageKeyForUser(...args);
  }

  function filteredTransactions(...args) {
    return getCtx().filteredTransactions(...args);
  }

  function matchesFilters(...args) {
    return getCtx().matchesFilters(...args);
  }

  function monthTransactions(...args) {
    return getCtx().monthTransactions(...args);
  }

  function currentMonthISO(...args) {
    return getCtx().currentMonthISO(...args);
  }

  function generateRecurringForMonth(...args) {
    return getCtx().generateRecurringForMonth(...args);
  }

  function updateMetrics(...args) {
    return getCtx().updateMetrics(...args);
  }

  function renderCoach(...args) {
    return getCtx().renderCoach(...args);
  }

  function renderActionPlan(...args) {
    return getCtx().renderActionPlan(...args);
  }

  function renderMonthlyDashboard(...args) {
    return getCtx().renderMonthlyDashboard(...args);
  }

  function drawCategoryChart(...args) {
    return getCtx().drawCategoryChart(...args);
  }

  function renderCategoryList(...args) {
    return getCtx().renderCategoryList(...args);
  }

  function renderBudgetList(...args) {
    return getCtx().renderBudgetList(...args);
  }

  function renderRecurringList(...args) {
    return getCtx().renderRecurringList(...args);
  }

  function renderGoalList(...args) {
    return getCtx().renderGoalList(...args);
  }

  function renderAccountList(...args) {
    return getCtx().renderAccountList(...args);
  }

  function renderPortfolio(...args) {
    return getCtx().renderPortfolio(...args);
  }

  function renderOwnedCards(...args) {
    return getCtx().renderOwnedCards(...args);
  }

  function renderCustomCategoryList(...args) {
    return getCtx().renderCustomCategoryList(...args);
  }

  function renderInvestmentAnalysis(...args) {
    return getCtx().renderInvestmentAnalysis(...args);
  }

  function renderMilesCalculator(...args) {
    return getCtx().renderMilesCalculator(...args);
  }

  function renderCardRecommendations(...args) {
    return getCtx().renderCardRecommendations(...args);
  }

  function renderEducation(...args) {
    return getCtx().renderEducation(...args);
  }

  function renderAppHealth(...args) {
    return getCtx().renderAppHealth(...args);
  }

  function saveTransactionsForUser(...args) {
    return getCtx().saveTransactionsForUser(...args);
  }

  function saveBudgetsForUser(...args) {
    return getCtx().saveBudgetsForUser(...args);
  }

  function saveBudgetCardModelsForUser(...args) {
    return getCtx().saveBudgetCardModelsForUser(...args);
  }

  function saveRecurringForUser(...args) {
    return getCtx().saveRecurringForUser(...args);
  }

  function saveGoalsForUser(...args) {
    return getCtx().saveGoalsForUser(...args);
  }

  function saveAccountsForUser(...args) {
    return getCtx().saveAccountsForUser(...args);
  }

  function savePortfolioForUser(...args) {
    return getCtx().savePortfolioForUser(...args);
  }

  function saveOwnedCardsForUser(...args) {
    return getCtx().saveOwnedCardsForUser(...args);
  }

  function saveCustomCategoriesForUser(...args) {
    return getCtx().saveCustomCategoriesForUser(...args);
  }

  function saveFinancialProfileForUser(...args) {
    return getCtx().saveFinancialProfileForUser(...args);
  }

  function saveSettingsForUser(...args) {
    return getCtx().saveSettingsForUser(...args);
  }

  function saveLocalSnapshot(...args) {
    return getCtx().saveLocalSnapshot(...args);
  }

  function refreshMarketQuotes(...args) {
    return getCtx().refreshMarketQuotes(...args);
  }

  function refreshPortfolioQuotes(...args) {
    return getCtx().refreshPortfolioQuotes(...args);
  }

  function ownedCardKey(...args) {
    return getCtx().ownedCardKey(...args);
  }

function createCell(text) {
  const cell = document.createElement("td");
  cell.textContent = text;
  return cell;
}

function populateCategories() {
  const used = state.transactions.map((tx) => tx.category).filter(Boolean);
  const categories = Array.from(new Set([...DEFAULT_CATEGORIES, ...state.customCategories, ...used])).sort();

  for (const select of [els.txCategory, els.incomeCategory, els.budgetCategory, els.recurringCategory, els.installmentCategory]) {
    if (!select) continue;
    const currentValue = select.value;
    clearElement(select);
    for (const category of categories) {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      select.appendChild(option);
    }
    if (currentValue && categories.includes(currentValue)) {
      select.value = currentValue;
    }
  }

  if (els.filterCategory) {
    const currentValue = els.filterCategory.value || "Todas";
    clearElement(els.filterCategory);
    const all = document.createElement("option");
    all.value = "Todas";
    all.textContent = "Todas";
    els.filterCategory.appendChild(all);
    for (const category of categories) {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      els.filterCategory.appendChild(option);
    }
    els.filterCategory.value = categories.includes(currentValue) ? currentValue : "Todas";
  }

  clearElement(els.descriptionSuggestions);
  for (const tx of state.transactions.slice(-80)) {
    if (!tx.description) continue;
    const option = document.createElement("option");
    option.value = tx.description;
    els.descriptionSuggestions.appendChild(option);
  }
}

function populateAccounts() {
  const selects = [els.txAccount, els.incomeAccount, els.installmentAccount];
  for (const select of selects) {
    if (!select) continue;
    const currentValue = select.value;
    clearElement(select);
    for (const account of state.accounts) {
      const option = document.createElement("option");
      option.value = account.id;
      option.textContent = account.name;
      select.appendChild(option);
    }
    if (currentValue && state.accounts.some((account) => account.id === currentValue)) {
      select.value = currentValue;
    }
  }
}

function syncFinancialProfileForm() {
  if (!els.investorProfileForm || !els.cardProfileForm) return;
  populateCardOptions();
  els.investorHorizon.value = state.financialProfile.investorHorizon;
  els.investorRisk.value = state.financialProfile.investorRisk;
  els.emergencyReserve.value = profileValue("emergencyReserve") ? String(profileValue("emergencyReserve")).replace(".", ",") : "";
  els.monthlyInvestment.value = profileValue("monthlyInvestment") ? String(profileValue("monthlyInvestment")).replace(".", ",") : "";
  els.investmentGoal.value = state.financialProfile.investmentGoal;
  els.stockPreference.value = state.financialProfile.stockPreference;
  els.cryptoPreference.value = state.financialProfile.cryptoPreference;
  els.cardMonthlySpend.value = profileValue("cardMonthlySpend") ? String(profileValue("cardMonthlySpend")).replace(".", ",") : "";
  els.cardMonthlyIncome.value = profileValue("cardMonthlyIncome") ? String(profileValue("cardMonthlyIncome")).replace(".", ",") : "";
  els.cardBenefitFocus.value = state.financialProfile.cardBenefitFocus;
  els.cardInternationalUse.value = state.financialProfile.cardInternationalUse;
  els.userCard.value =
    findCardByKey(state.financialProfile.userCard) || findOwnedCardByKey(state.financialProfile.userCard) || state.financialProfile.userCard === "auto"
      ? state.financialProfile.userCard
      : "auto";
  if (els.milesUserCard) els.milesUserCard.value = els.userCard.value;
  applySelectedCardMilesDefaults();
  els.milesPerDollar.value = String(profileValue("milesPerDollar", 1.8));
  els.cardDollarRate.value = String(profileValue("cardDollarRate", 5.5)).replace(".", ",");
  els.transferBonus.value = String(profileValue("transferBonus", 0));
  els.mileValue.value = String(profileValue("mileValue", 20)).replace(".", ",");
}

function applySettings() {
  document.body.classList.toggle("dark-mode", Boolean(state.settings.darkMode));
  els.darkModeToggle.checked = Boolean(state.settings.darkMode);
  els.tutorialToggle.checked = Boolean(state.settings.showTutorial);
  els.tutorialCard.hidden = !state.settings.showTutorial;
}

function renderTransactionTable(tbody, transactions, emptyMessage, editable = false) {
  if (!tbody) return;
  clearElement(tbody);

  if (!transactions.length) {
    const row = document.createElement("tr");
    const cell = createCell(emptyMessage);
    cell.colSpan = 6;
    cell.className = "tip";
    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }

  for (const tx of transactions) {
    const row = document.createElement("tr");
    row.appendChild(createCell(tx.tx_date));
    row.appendChild(createCell(tx.description));
    row.appendChild(createCell(tx.category));
    row.appendChild(createCell(tx.tx_type));
    row.appendChild(createCell(floatToMoney(tx.amount)));
    const cardName = cardLabelFromKey(tx.cardKey);
    const note = [cardName ? `Cartao: ${cardName}` : "", tx.note || ""].filter(Boolean).join(" | ");
    row.appendChild(createCell(note));
    if (editable) row.addEventListener("click", () => loadTransactionIntoForm(tx.id));
    tbody.appendChild(row);
  }
}

function renderTransactions(transactions) {
  renderTransactionTable(els.transactionsTbody, transactions, "Nenhuma despesa encontrada.", true);
}

function renderIncomeTransactions(transactions) {
  renderTransactionTable(els.incomeTbody, transactions, "Nenhuma renda encontrada.", false);
}

function refreshUI() {
  populateCategories();
  populateAccounts();
  populateCardOptions();
  populateBudgetCardOptions();
  const current = filteredTransactions();
  const expenseRows = state.transactions.filter((tx) => matchesFilters(tx, "expenses"));
  const incomeRows = state.transactions.filter((tx) => matchesFilters(tx, "income"));
  const monthData = monthTransactions(state.filters.month || currentMonthISO());
  updateMetrics(current);
  renderCoach(current);
  renderActionPlan(current);
  renderMonthlyDashboard();
  drawCategoryChart(current);
  renderCategoryList(current);
  renderBudgetList(monthData);
  renderRecurringList();
  renderGoalList();
  renderAccountList();
  renderPortfolio();
  renderOwnedCards();
  renderCustomCategoryList();
  renderInvestmentAnalysis();
  renderMilesCalculator();
  renderCardRecommendations();
  renderEducation();
  renderAppHealth();
  renderTransactions(expenseRows);
  renderIncomeTransactions(incomeRows);
  els.deleteBtn.disabled = state.editingId == null;
}

function resetForm() {
  state.editingId = null;
  els.transactionForm.reset();
  els.txDate.value = todayISO();
  els.txType.value = transactionTypeForTab() || "Despesa";
  if (state.accounts[0]) els.txAccount.value = state.accounts[0].id;
  if (els.txCard) els.txCard.value = "none";
  els.deleteBtn.disabled = true;
}

function loadTransactionIntoForm(id) {
  const tx = state.transactions.find((item) => item.id === id);
  if (!tx) return;
  state.editingId = tx.id;
  els.txDate.value = tx.tx_date;
  els.txDescription.value = tx.description;
  els.txCategory.value = tx.category;
  els.txAmount.value = tx.amount;
  els.txType.value = tx.tx_type;
  els.txAccount.value = tx.accountId || state.accounts[0]?.id || "cash";
  if (els.txCard) els.txCard.value = tx.cardKey || "none";
  els.txNote.value = tx.note || "";
  els.deleteBtn.disabled = false;
}

function handleBudgetSubmit(event) {
  event.preventDefault();
  const category = els.budgetCategory.value;
  const limit = moneyToFloat(els.budgetLimit.value);
  if (!category || !Number.isFinite(limit) || limit < 0) return;
  state.budgets[category] = limit;
  state.budgetCardModels[category] = {
    cardKey: els.budgetCard.value || "none",
    cardModel: els.budgetCardModel.value || "none",
  };
  saveBudgetsForUser();
  saveBudgetCardModelsForUser();
  saveLocalSnapshot();
  els.budgetForm.reset();
  populateCategories();
  populateBudgetCardOptions();
  refreshUI();
}

function handleRecurringSubmit(event) {
  event.preventDefault();
  const amount = moneyToFloat(els.recurringAmount.value);
  const day = Number(els.recurringDay.value);
  const item = {
    id: uuid(),
    description: els.recurringDescription.value.trim(),
    category: els.recurringCategory.value,
    amount,
    tx_type: els.recurringType.value,
    day: Math.max(1, Math.min(28, Number.isFinite(day) ? day : 1)),
  };
  if (!item.description || !item.category || !Number.isFinite(item.amount) || item.amount <= 0) return;
  state.recurring.push(item);
  saveRecurringForUser();
  els.recurringForm.reset();
  els.recurringType.value = "Despesa";
  els.recurringDay.value = "5";
  generateRecurringForMonth();
  saveLocalSnapshot();
  refreshUI();
}

function handleGoalSubmit(event) {
  event.preventDefault();
  const target = moneyToFloat(els.goalTarget.value);
  const current = moneyToFloat(els.goalCurrent.value);
  const goal = {
    id: uuid(),
    name: els.goalName.value.trim(),
    target,
    current: Number.isFinite(current) ? current : 0,
    type: els.goalType.value,
  };
  if (!goal.name || !Number.isFinite(goal.target) || goal.target <= 0) return;
  state.goals.push(goal);
  saveGoalsForUser();
  saveLocalSnapshot();
  els.goalForm.reset();
  refreshUI();
}

function handleInvestorProfileSubmit(event) {
  event.preventDefault();
  state.financialProfile = {
    ...state.financialProfile,
    investorHorizon: els.investorHorizon.value,
    investorRisk: els.investorRisk.value,
    emergencyReserve: Number.isFinite(moneyToFloat(els.emergencyReserve.value)) ? moneyToFloat(els.emergencyReserve.value) : 0,
    monthlyInvestment: Number.isFinite(moneyToFloat(els.monthlyInvestment.value)) ? moneyToFloat(els.monthlyInvestment.value) : 0,
    investmentGoal: els.investmentGoal.value,
    stockPreference: els.stockPreference.value,
    cryptoPreference: els.cryptoPreference.value,
  };
  saveFinancialProfileForUser();
  saveLocalSnapshot();
  refreshUI();
  refreshMarketQuotes({ force: true, silent: true });
}

function updateMilesProfileFromInputs() {
  state.financialProfile = {
    ...state.financialProfile,
    milesPerDollar: Number(els.milesPerDollar.value) || 0,
    cardDollarRate: Number.isFinite(moneyToFloat(els.cardDollarRate.value)) ? moneyToFloat(els.cardDollarRate.value) : 5.5,
    transferBonus: Number(els.transferBonus.value) || 0,
    mileValue: Number.isFinite(moneyToFloat(els.mileValue.value)) ? moneyToFloat(els.mileValue.value) : 20,
  };
  saveFinancialProfileForUser();
  renderMilesCalculator();
  updateMetrics(filteredTransactions());
  renderEducation();
}

function handleCardProfileSubmit(event) {
  event.preventDefault();
  state.financialProfile = {
    ...state.financialProfile,
    cardMonthlySpend: Number.isFinite(moneyToFloat(els.cardMonthlySpend.value)) ? moneyToFloat(els.cardMonthlySpend.value) : 0,
    cardMonthlyIncome: Number.isFinite(moneyToFloat(els.cardMonthlyIncome.value)) ? moneyToFloat(els.cardMonthlyIncome.value) : 0,
    cardBenefitFocus: els.cardBenefitFocus.value,
    cardInternationalUse: els.cardInternationalUse.value,
    userCard: els.userCard.value || els.milesUserCard.value || "auto",
  };
  applySelectedCardMilesDefaults();
  updateMilesProfileFromInputs();
  saveLocalSnapshot();
  refreshUI();
}

function handleCardSelectionChange(value) {
  state.financialProfile.userCard = value || "auto";
  if (els.userCard) els.userCard.value = state.financialProfile.userCard;
  if (els.milesUserCard) els.milesUserCard.value = state.financialProfile.userCard;
  applySelectedCardMilesDefaults();
  saveFinancialProfileForUser();
  refreshUI();
}

function handlePortfolioSubmit(event) {
  event.preventDefault();
  const quantity = moneyToFloat(els.portfolioQuantity.value);
  const avgPrice = moneyToFloat(els.portfolioAvgPrice.value);
  const currentPrice = moneyToFloat(els.portfolioCurrentPrice.value);
  const asset = {
    id: uuid(),
    name: els.portfolioAssetName.value.trim().toUpperCase(),
    type: els.portfolioAssetType.value,
    quantity,
    avgPrice,
    currentPrice: Number.isFinite(currentPrice) && currentPrice > 0 ? currentPrice : avgPrice,
  };
  if (!asset.name || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(avgPrice) || avgPrice < 0) return;
  state.portfolio.push(asset);
  savePortfolioForUser();
  saveLocalSnapshot();
  els.portfolioForm.reset();
  refreshUI();
  refreshPortfolioQuotes({ force: true, silent: true });
}

function handleOwnedCardSubmit(event) {
  event.preventDefault();
  const limit = moneyToFloat(els.ownedCardLimit.value);
  const dueDay = Number(els.ownedCardDueDay.value);
  const card = {
    id: uuid(),
    name: els.ownedCardName.value.trim(),
    issuer: els.ownedCardIssuer.value.trim(),
    limit: Number.isFinite(limit) ? limit : 0,
    dueDay: Math.max(1, Math.min(28, Number.isFinite(dueDay) ? dueDay : 10)),
  };
  if (!card.name) return;
  state.ownedCards.push(card);
  state.financialProfile.userCard = ownedCardKey(card);
  applySelectedCardMilesDefaults();
  saveOwnedCardsForUser();
  saveFinancialProfileForUser();
  saveLocalSnapshot();
  els.ownedCardForm.reset();
  els.ownedCardDueDay.value = "10";
  populateCardOptions();
  refreshUI();
}

function handleAccountSubmit(event) {
  event.preventDefault();
  const name = els.accountName.value.trim();
  const initialBalance = moneyToFloat(els.accountInitial.value);
  if (!name) return;
  state.accounts.push({
    id: uuid(),
    name,
    initialBalance: Number.isFinite(initialBalance) ? initialBalance : 0,
  });
  saveAccountsForUser();
  saveLocalSnapshot();
  els.accountForm.reset();
  refreshUI();
}

function handleCategorySubmit(event) {
  event.preventDefault();
  const name = els.categoryName.value.trim();
  if (!name) return;
  const exists = [...DEFAULT_CATEGORIES, ...state.customCategories].some((category) => category.toLowerCase() === name.toLowerCase());
  if (exists) return;
  state.customCategories.push(name);
  saveCustomCategoriesForUser();
  saveLocalSnapshot();
  els.categoryForm.reset();
  refreshUI();
}

function handleInstallmentSubmit(event) {
  event.preventDefault();
  const total = moneyToFloat(els.installmentTotal.value);
  const count = Number(els.installmentCount.value);
  const firstDate = els.installmentDate.value;
  const description = els.installmentDescription.value.trim();
  if (!description || !Number.isFinite(total) || total <= 0 || !Number.isFinite(count) || count <= 0 || !firstDate) return;
  const groupId = uuid();
  const amount = Number((total / count).toFixed(2));
  for (let index = 0; index < count; index += 1) {
    state.transactions.push({
      id: uuid(),
      tx_date: addMonths(firstDate, index),
      description: `${description} (${index + 1}/${count})`,
      category: els.installmentCategory.value,
      amount,
      tx_type: "Despesa",
      note: "Compra parcelada",
      accountId: els.installmentAccount.value || state.accounts[0]?.id || "cash",
      installmentGroupId: groupId,
    });
  }
  saveTransactionsForUser();
  saveLocalSnapshot();
  els.installmentForm.reset();
  els.installmentCount.value = "2";
  els.installmentDate.value = todayISO();
  refreshUI();
}

function handleSubmit(event) {
  event.preventDefault();
  const amount = moneyToFloat(els.txAmount.value);
  const activeTabType = transactionTypeForTab();
  const txType = activeTabType || els.txType.value;
  const tx = {
    id: state.editingId || uuid(),
    tx_date: els.txDate.value,
    description: els.txDescription.value.trim(),
    category: els.txCategory.value.trim(),
    amount,
    tx_type: txType,
    accountId: els.txAccount.value || state.accounts[0]?.id || "cash",
    cardKey: txType === "Despesa" ? els.txCard.value || "none" : "none",
    note: els.txNote.value.trim(),
  };

  if (!tx.description || !tx.category || !tx.tx_date || !Number.isFinite(tx.amount) || tx.amount <= 0) {
    return;
  }

  const index = state.transactions.findIndex((item) => item.id === tx.id);
  if (index >= 0) {
    state.transactions[index] = tx;
  } else {
    state.transactions.push(tx);
  }

  saveTransactionsForUser();
  saveLocalSnapshot();
  resetForm();
  refreshUI();
}

function handleIncomeSubmit(event) {
  event.preventDefault();
  const amount = moneyToFloat(els.incomeAmount.value);
  const tx = {
    id: uuid(),
    tx_date: els.incomeDate.value,
    description: els.incomeDescription.value.trim(),
    category: els.incomeCategory.value.trim(),
    amount,
    tx_type: "Receita",
    accountId: els.incomeAccount.value || state.accounts[0]?.id || "cash",
    cardKey: "none",
    note: els.incomeNote.value.trim(),
  };

  if (!tx.description || !tx.category || !tx.tx_date || !Number.isFinite(tx.amount) || tx.amount <= 0) return;

  state.transactions.push(tx);
  saveTransactionsForUser();
  saveLocalSnapshot();
  els.incomeForm.reset();
  els.incomeDate.value = todayISO();
  if (state.accounts[0]) els.incomeAccount.value = state.accounts[0].id;
  refreshUI();
}

function deleteSelected() {
  if (state.editingId == null) return;
  state.transactions = state.transactions.filter((tx) => tx.id !== state.editingId);
  saveTransactionsForUser();
  saveLocalSnapshot();
  resetForm();
  refreshUI();
}

function resetAllUserData() {
  if (!state.currentUser) return;
  const confirmed = window.confirm("Redefinir todos os dados financeiros e recomecar do zero?");
  if (!confirmed) return;

  const userId = state.currentUser.id;
  for (const namespace of ["transactions", "budgets", "budgetCardModels", "recurring", "goals", "accounts", "portfolio", "ownedCards", "categories", "financialProfile", "settings"]) {
    localStorage.removeItem(storageKeyForUser(userId, namespace));
  }
  localStorage.removeItem(`${AUTO_BACKUP_KEY}.${userId}`);

  state.transactions = [];
  state.budgets = {};
  state.budgetCardModels = {};
  state.recurring = [];
  state.goals = [];
  state.accounts = DEFAULT_ACCOUNTS.map((account) => ({ ...account }));
  state.portfolio = [];
  state.ownedCards = [];
  state.customCategories = [];
  state.financialProfile = { ...DEFAULT_FINANCIAL_PROFILE };
  state.settings = {
    darkMode: false,
    showTutorial: true,
  };
  state.editingId = null;
  state.filters = {
    search: "",
    type: "Todos",
    month: "",
    category: "Todas",
    minAmount: "",
    maxAmount: "",
  };

  saveTransactionsForUser();
  saveBudgetsForUser();
  saveBudgetCardModelsForUser();
  saveRecurringForUser();
  saveGoalsForUser();
  saveAccountsForUser();
  savePortfolioForUser();
  saveOwnedCardsForUser();
  saveCustomCategoriesForUser();
  saveFinancialProfileForUser();
  saveSettingsForUser();

  els.searchInput.value = "";
  els.filterType.value = "Todos";
  els.filterMonth.value = "";
  els.filterCategory.value = "Todas";
  els.filterMinAmount.value = "";
  els.filterMaxAmount.value = "";
  resetForm();
  applySettings();
  syncFinancialProfileForm();
  refreshUI();
}

function updateUserBadge() {
  if (!state.currentUser) {
    els.userBadge.textContent = "";
    return;
  }
  els.userBadge.textContent = state.currentUser.name || state.currentUser.email;
}

  window.FinaForms = {
    createCell,
    populateCategories,
    populateAccounts,
    syncFinancialProfileForm,
    applySettings,
    renderTransactionTable,
    renderTransactions,
    renderIncomeTransactions,
    refreshUI,
    resetForm,
    loadTransactionIntoForm,
    handleBudgetSubmit,
    handleRecurringSubmit,
    handleGoalSubmit,
    handleInvestorProfileSubmit,
    updateMilesProfileFromInputs,
    handleCardProfileSubmit,
    handleCardSelectionChange,
    handlePortfolioSubmit,
    handleOwnedCardSubmit,
    handleAccountSubmit,
    handleCategorySubmit,
    handleInstallmentSubmit,
    handleSubmit,
    handleIncomeSubmit,
    deleteSelected,
    resetAllUserData,
    updateUserBadge,
  };
})();

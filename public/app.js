const USERS_KEY = "fina.web.users.v2";
const SESSION_KEY = "fina.web.session.v2";
const APP_VERSION = "4.1-abas";
const AUTO_BACKUP_KEY = "fina.web.autoBackup.v1";

const DEFAULT_CATEGORIES = [
  "Salario",
  "Cartao",
  "Contas",
  "Alimentacao",
  "Moradia",
  "Transporte",
  "Saude",
  "Lazer",
  "Educacao",
  "Investimento",
  "Assinaturas",
  "Impostos",
  "Outros",
];

const DEFAULT_ACCOUNTS = [
  { id: "cash", name: "Dinheiro", initialBalance: 0 },
  { id: "bank", name: "Banco", initialBalance: 0 },
  { id: "card", name: "Cartao", initialBalance: 0 },
];

const CATEGORY_RULES = [
  { words: ["uber", "99", "onibus", "metro", "combustivel", "gasolina"], category: "Transporte" },
  { words: ["netflix", "spotify", "prime", "disney", "hbo", "assinatura"], category: "Assinaturas" },
  { words: ["mercado", "ifood", "restaurante", "padaria", "acougue"], category: "Alimentacao" },
  { words: ["aluguel", "condominio", "energia", "internet", "agua"], category: "Contas" },
  { words: ["farmacia", "consulta", "exame", "remedio"], category: "Saude" },
  { words: ["salario", "pix recebido", "comissao"], category: "Salario" },
];

const state = {
  currentUser: null,
  users: [],
  transactions: [],
  budgets: {},
  recurring: [],
  goals: [],
  accounts: [],
  customCategories: [],
  settings: {
    darkMode: false,
    showTutorial: true,
  },
  editingId: null,
  filters: {
    search: "",
    type: "Todos",
    month: "",
    category: "Todas",
    minAmount: "",
    maxAmount: "",
  },
  deferredPrompt: null,
  authMode: "login",
  activeTab: "overview",
};

const els = {
  authScreen: document.getElementById("authScreen"),
  authForm: document.getElementById("authForm"),
  authName: document.getElementById("authName"),
  authEmail: document.getElementById("authEmail"),
  authPassword: document.getElementById("authPassword"),
  authSubmitBtn: document.getElementById("authSubmitBtn"),
  authToggleBtn: document.getElementById("authToggleBtn"),
  authMessage: document.getElementById("authMessage"),
  appMain: document.getElementById("appMain"),
  userBadge: document.getElementById("userBadge"),
  logoutBtn: document.getElementById("logoutBtn"),
  lockBtn: document.getElementById("lockBtn"),
  incomeTotal: document.getElementById("incomeTotal"),
  expenseTotal: document.getElementById("expenseTotal"),
  balanceTotal: document.getElementById("balanceTotal"),
  expenseRatio: document.getElementById("expenseRatio"),
  budgetHealth: document.getElementById("budgetHealth"),
  recurringTotal: document.getElementById("recurringTotal"),
  financeScore: document.getElementById("financeScore"),
  monthForecast: document.getElementById("monthForecast"),
  statusLine: document.getElementById("statusLine"),
  incomeRatioLine: document.getElementById("incomeRatioLine"),
  savingsLine: document.getElementById("savingsLine"),
  topCategoryLine: document.getElementById("topCategoryLine"),
  guidanceLine: document.getElementById("guidanceLine"),
  coachList: document.getElementById("coachList"),
  actionPlanList: document.getElementById("actionPlanList"),
  tutorialCard: document.getElementById("tutorialCard"),
  darkModeToggle: document.getElementById("darkModeToggle"),
  tutorialToggle: document.getElementById("tutorialToggle"),
  autoBackupBtn: document.getElementById("autoBackupBtn"),
  resetDataBtn: document.getElementById("resetDataBtn"),
  deleteAccountBtn: document.getElementById("deleteAccountBtn"),
  categoryChart: document.getElementById("categoryChart"),
  categoryList: document.getElementById("categoryList"),
  goalForm: document.getElementById("goalForm"),
  goalName: document.getElementById("goalName"),
  goalTarget: document.getElementById("goalTarget"),
  goalCurrent: document.getElementById("goalCurrent"),
  goalType: document.getElementById("goalType"),
  goalList: document.getElementById("goalList"),
  installmentForm: document.getElementById("installmentForm"),
  installmentDescription: document.getElementById("installmentDescription"),
  installmentCategory: document.getElementById("installmentCategory"),
  installmentTotal: document.getElementById("installmentTotal"),
  installmentCount: document.getElementById("installmentCount"),
  installmentDate: document.getElementById("installmentDate"),
  installmentAccount: document.getElementById("installmentAccount"),
  accountForm: document.getElementById("accountForm"),
  accountName: document.getElementById("accountName"),
  accountInitial: document.getElementById("accountInitial"),
  accountList: document.getElementById("accountList"),
  categoryForm: document.getElementById("categoryForm"),
  categoryName: document.getElementById("categoryName"),
  customCategoryList: document.getElementById("customCategoryList"),
  monthlyDashboard: document.getElementById("monthlyDashboard"),
  budgetForm: document.getElementById("budgetForm"),
  budgetCategory: document.getElementById("budgetCategory"),
  budgetLimit: document.getElementById("budgetLimit"),
  budgetList: document.getElementById("budgetList"),
  recurringForm: document.getElementById("recurringForm"),
  recurringDescription: document.getElementById("recurringDescription"),
  recurringCategory: document.getElementById("recurringCategory"),
  recurringAmount: document.getElementById("recurringAmount"),
  recurringType: document.getElementById("recurringType"),
  recurringDay: document.getElementById("recurringDay"),
  recurringList: document.getElementById("recurringList"),
  descriptionSuggestions: document.getElementById("descriptionSuggestions"),
  transactionsTbody: document.getElementById("transactionsTbody"),
  transactionForm: document.getElementById("transactionForm"),
  txDate: document.getElementById("txDate"),
  txDescription: document.getElementById("txDescription"),
  txCategory: document.getElementById("txCategory"),
  txAmount: document.getElementById("txAmount"),
  txType: document.getElementById("txType"),
  txAccount: document.getElementById("txAccount"),
  txNote: document.getElementById("txNote"),
  clearFormBtn: document.getElementById("clearFormBtn"),
  deleteBtn: document.getElementById("deleteBtn"),
  searchInput: document.getElementById("searchInput"),
  filterType: document.getElementById("filterType"),
  filterMonth: document.getElementById("filterMonth"),
  filterCategory: document.getElementById("filterCategory"),
  filterMinAmount: document.getElementById("filterMinAmount"),
  filterMaxAmount: document.getElementById("filterMaxAmount"),
  applyFiltersBtn: document.getElementById("applyFiltersBtn"),
  exportBtn: document.getElementById("exportBtn"),
  exportJsonBtn: document.getElementById("exportJsonBtn"),
  exportReportBtn: document.getElementById("exportReportBtn"),
  importJsonInput: document.getElementById("importJsonInput"),
  importCsvInput: document.getElementById("importCsvInput"),
  installBtn: document.getElementById("installBtn"),
};

function uuid() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function currentMonthISO() {
  return todayISO().slice(0, 7);
}

function addMonths(dateText, months) {
  const date = new Date(`${dateText}T12:00:00`);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().slice(0, 10);
}

function previousMonthISO(month) {
  return addMonths(`${month}-15`, -1).slice(0, 7);
}

function moneyToFloat(value) {
  const input = String(value || "")
    .trim()
    .replace(/\s/g, "")
    .replace(/^R\$\s?/, "");

  if (!input) return Number.NaN;

  const lastComma = input.lastIndexOf(",");
  const lastDot = input.lastIndexOf(".");
  const decimalSeparator = lastComma > lastDot ? "," : ".";

  let normalized = input;
  if (lastComma >= 0 && lastDot >= 0) {
    const thousandSeparator = decimalSeparator === "," ? "." : ",";
    normalized = normalized.replace(new RegExp(`\\${thousandSeparator}`, "g"), "").replace(decimalSeparator, ".");
  } else if (lastComma >= 0) {
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  } else if (lastDot >= 0) {
    const decimalDigits = normalized.length - lastDot - 1;
    if (decimalDigits === 3 && /^\d{1,3}(\.\d{3})+$/.test(normalized)) {
      normalized = normalized.replace(/\./g, "");
    }
  }

  return Number(normalized);
}

function floatToMoney(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));
}

function storageKeyForUser(userId, namespace = "transactions") {
  return `fina.web.${namespace}.${userId}`;
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  if (window.crypto && window.crypto.subtle) {
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  let hash = 0;
  for (const char of password) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return `fallback-${hash}`;
}

function safeJsonParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

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
  els.appMain.style.display = "block";
}

function switchTab(tabName) {
  state.activeTab = tabName;
  document.querySelectorAll("[data-tab]").forEach((element) => {
    const tabs = String(element.dataset.tab || "").split(/\s+/);
    element.classList.toggle("tab-hidden", !tabs.includes(tabName));
  });
  document.querySelectorAll("[data-tab-button]").forEach((button) => {
    button.classList.toggle("active", button.dataset.tabButton === tabName);
  });
}

function initTabs() {
  document.querySelectorAll("[data-tab-button]").forEach((button) => {
    button.addEventListener("click", () => {
      switchTab(button.dataset.tabButton);
      const focusTarget = button.dataset.focusTarget ? document.getElementById(button.dataset.focusTarget) : null;
      if (focusTarget) {
        focusTarget.scrollIntoView({ behavior: "smooth", block: "center" });
        window.setTimeout(() => focusTarget.focus(), 180);
      }
    });
  });
  switchTab(state.activeTab);
}

function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function createCell(text) {
  const cell = document.createElement("td");
  cell.textContent = text;
  return cell;
}

function populateCategories() {
  const used = state.transactions.map((tx) => tx.category).filter(Boolean);
  const categories = Array.from(new Set([...DEFAULT_CATEGORIES, ...state.customCategories, ...used])).sort();

  for (const select of [els.txCategory, els.budgetCategory, els.recurringCategory, els.installmentCategory]) {
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
  const selects = [els.txAccount, els.installmentAccount];
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

function suggestCategory(description) {
  const text = String(description || "").toLowerCase();
  const rule = CATEGORY_RULES.find((item) => item.words.some((word) => text.includes(word)));
  return rule ? rule.category : "";
}

function monthTransactions(month = currentMonthISO()) {
  return state.transactions.filter((tx) => tx.tx_date.slice(0, 7) === month);
}

function matchesFilters(tx) {
  const search = state.filters.search.trim().toLowerCase();
  const month = state.filters.month.trim();
  const type = state.filters.type;
  const category = state.filters.category;
  const minAmount = moneyToFloat(state.filters.minAmount);
  const maxAmount = moneyToFloat(state.filters.maxAmount);

  if (search) {
    const haystack = `${tx.description} ${tx.category} ${tx.note || ""}`.toLowerCase();
    if (!haystack.includes(search)) return false;
  }
  if (type !== "Todos" && tx.tx_type !== type) return false;
  if (category && category !== "Todas" && tx.category !== category) return false;
  if (month && tx.tx_date.slice(0, 7) !== month) return false;
  if (state.filters.minAmount && Number.isFinite(minAmount) && Number(tx.amount || 0) < minAmount) return false;
  if (state.filters.maxAmount && Number.isFinite(maxAmount) && Number(tx.amount || 0) > maxAmount) return false;
  return true;
}

function filteredTransactions() {
  return state.transactions
    .filter(matchesFilters)
    .sort((a, b) => `${b.tx_date} ${b.id}`.localeCompare(`${a.tx_date} ${a.id}`));
}

function summary(transactions) {
  const totals = { Receita: 0, Despesa: 0 };
  for (const tx of transactions) {
    if (tx.tx_type === "Receita" || tx.tx_type === "Despesa") {
      totals[tx.tx_type] += Number(tx.amount || 0);
    }
  }
  totals.Saldo = totals.Receita - totals.Despesa;
  return totals;
}

function categoryTotals(transactions) {
  const totals = new Map();
  for (const tx of transactions) {
    if (tx.tx_type !== "Despesa") continue;
    totals.set(tx.category, (totals.get(tx.category) || 0) + Number(tx.amount || 0));
  }

  return Array.from(totals.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total || a.category.localeCompare(b.category));
}

function budgetUsage(transactions) {
  const expensesByCategory = categoryTotals(transactions);
  return expensesByCategory.map((item) => {
    const limit = Number(state.budgets[item.category] || 0);
    const usage = limit > 0 ? item.total / limit : 0;
    return { ...item, limit, usage };
  });
}

function recurringTotalByType(type) {
  return state.recurring
    .filter((item) => item.tx_type === type)
    .reduce((total, item) => total + Number(item.amount || 0), 0);
}

function accountBalances(transactions = state.transactions) {
  const balances = new Map(state.accounts.map((account) => [account.id, Number(account.initialBalance || 0)]));
  for (const tx of transactions) {
    const accountId = tx.accountId || state.accounts[0]?.id || "cash";
    const current = balances.get(accountId) || 0;
    const amount = Number(tx.amount || 0);
    balances.set(accountId, tx.tx_type === "Receita" ? current + amount : current - amount);
  }
  return balances;
}

function calculateFinancialScore(transactions) {
  const totals = summary(transactions);
  const income = totals.Receita;
  const expense = totals.Despesa;
  const balance = totals.Saldo;
  let score = 50;
  if (income > 0) {
    const expenseRatio = expense / income;
    const savingsRatio = balance / income;
    score += Math.max(-30, Math.min(20, (0.7 - expenseRatio) * 80));
    score += Math.max(-10, Math.min(20, savingsRatio * 70));
  }
  const overBudget = budgetUsage(monthTransactions(state.filters.month || currentMonthISO())).filter((item) => item.limit > 0 && item.usage > 1).length;
  score -= overBudget * 8;
  score += Math.min(10, state.goals.length * 3);
  score += Math.min(8, state.recurring.length * 2);
  return Math.max(0, Math.min(100, Math.round(score)));
}

function forecastMonthExpense(month = currentMonthISO()) {
  const transactions = monthTransactions(month).filter((tx) => tx.tx_type === "Despesa");
  const total = transactions.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  const today = new Date();
  const selectedMonth = todayISO().slice(0, 7) === month;
  if (!selectedMonth) return total;
  const day = Math.max(1, today.getDate());
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  return (total / day) * lastDay;
}

function generateRecurringForMonth(month = currentMonthISO()) {
  if (!state.recurring.length) return;
  let changed = false;

  for (const item of state.recurring) {
    const day = String(Math.max(1, Math.min(28, Number(item.day || 1)))).padStart(2, "0");
    const txDate = `${month}-${day}`;
    const alreadyExists = state.transactions.some((tx) => tx.recurringId === item.id && tx.tx_date.slice(0, 7) === month);
    if (alreadyExists) continue;

    state.transactions.push({
      id: uuid(),
      tx_date: txDate,
      description: item.description,
      category: item.category,
      amount: Number(item.amount || 0),
      tx_type: item.tx_type,
      note: "Lancamento recorrente",
      recurringId: item.id,
    });
    changed = true;
  }

  if (changed) saveTransactionsForUser();
}

function categoryTip(category, share, totalExpenses) {
  const name = String(category || "").trim().toLowerCase();
  if (totalExpenses <= 0) return "Cadastre despesas para ver dicas especificas desta categoria.";

  if (name === "cartao" || name === "cartão") {
    return share >= 0.25
      ? "Cartao esta pesado: revise parcelas, assinaturas e compras por impulso."
      : "Defina um teto mensal para o cartao e revise compras parceladas antes da fatura.";
  }
  if (name === "contas" || name === "moradia") {
    return share >= 0.35
      ? "Despesas fixas estao altas; renegocie contratos, energia, internet e servicos recorrentes."
      : "Preveja essas contas no inicio do mes para evitar apertos no caixa.";
  }
  if (name === "alimentacao") {
    return share >= 0.2
      ? "Alimentacao esta alta; planeje compras, marmitas e limites para delivery."
      : "Comprar com lista e cozinhar em casa ajuda a manter essa categoria sob controle.";
  }
  if (name === "transporte") {
    return share >= 0.15
      ? "Transporte pesa bastante; compare rotas, combustivel e manutencao."
      : "Agrupar saidas e planejar deslocamentos reduz custo por viagem.";
  }
  if (name === "saude") {
    return share >= 0.15
      ? "Saude esta relevante; separe uma reserva para consultas, remedios e exames."
      : "Uma reserva pequena evita que gastos medicos quebrem o orcamento.";
  }
  if (name === "lazer") {
    return share >= 0.15
      ? "Lazer esta consumindo bastante; defina um teto mensal antes de gastar."
      : "Mantenha o lazer, mas com limite claro para nao virar vazamento financeiro.";
  }
  if (name === "assinaturas") {
    return share >= 0.1
      ? "Assinaturas acumuladas ja comecam a pesar; corte as pouco usadas."
      : "Revise assinaturas todo mes e cancele o que nao entrega valor real.";
  }
  if (name === "impostos") return "Impostos pedem reserva antecipada; separar esse valor evita surpresa.";
  if (name === "educacao") return "Priorize cursos e materiais com retorno pratico para renda ou carreira.";
  if (name === "investimento") return "Investimento e bom, mas preserve reserva de emergencia e contas essenciais.";

  if (share >= 0.25) return "Categoria muito pesada: defina um teto mensal e acompanhe toda semana.";
  if (share >= 0.12) return "Categoria com peso moderado: pequenos ajustes aqui ja melhoram o orcamento.";
  return "Categoria sob controle: mantenha o acompanhamento e evite pequenos excessos.";
}

function updateMetrics(transactions) {
  const totals = summary(transactions);
  const expensesByCategory = categoryTotals(transactions);
  const usage = budgetUsage(monthTransactions(state.filters.month || currentMonthISO()));
  const income = totals.Receita;
  const expense = totals.Despesa;
  const balance = totals.Saldo;
  const expenseRatio = income > 0 ? expense / income : 0;
  const savingsRatio = income > 0 ? balance / income : 0;
  const categoriesWithBudget = usage.filter((item) => item.limit > 0);
  const overBudget = categoriesWithBudget.filter((item) => item.usage > 1);
  const nearBudget = categoriesWithBudget.filter((item) => item.usage >= 0.8 && item.usage <= 1);

  els.incomeTotal.textContent = floatToMoney(income);
  els.expenseTotal.textContent = floatToMoney(expense);
  els.balanceTotal.textContent = floatToMoney(balance);
  els.expenseRatio.textContent = `${Math.round(expenseRatio * 100)}%`;
  els.budgetHealth.textContent = overBudget.length ? `${overBudget.length} acima` : nearBudget.length ? `${nearBudget.length} no limite` : "Saudavel";
  els.recurringTotal.textContent = floatToMoney(recurringTotalByType("Despesa"));
  els.financeScore.textContent = String(calculateFinancialScore(transactions));
  els.monthForecast.textContent = floatToMoney(forecastMonthExpense(state.filters.month || currentMonthISO()));

  let status = "Cadastre uma receita para calcular os indicadores.";
  let guidance = "Cadastre receitas e despesas para ver recomendacoes.";
  if (income <= 0) {
    guidance = "Sem renda registrada, nao e possivel medir se as despesas estao saudaveis.";
  } else if (expenseRatio <= 0.5) {
    status = "Despesa leve em relacao a renda.";
    guidance = "Ainda ha espaco para investir, guardar ou acelerar objetivos financeiros.";
  } else if (expenseRatio <= 0.7) {
    status = "Despesa dentro de uma faixa razoavel.";
    guidance = "Acompanhe categorias grandes para evitar que o orcamento aperte.";
  } else if (expenseRatio <= 0.85) {
    status = "Despesa alta. O orcamento merece ajustes.";
    guidance = "Reduza categorias variaveis e crie um teto mensal para gastos nao essenciais.";
  } else {
    status = "Despesa muito alta para a renda atual.";
    guidance = "A prioridade e cortar vazamentos e proteger as despesas fixas essenciais.";
  }

  let topCategoryLine = "Maior categoria: -";
  if (expensesByCategory.length) {
    const top = expensesByCategory[0];
    const shareOfExpense = expense > 0 ? top.total / expense : 0;
    topCategoryLine = `Maior categoria: ${top.category} (${floatToMoney(top.total)} | ${Math.round(shareOfExpense * 100)}% das despesas)`;
    if (shareOfExpense >= 0.4) {
      guidance += " A maior parte dos gastos esta concentrada em uma so categoria.";
    } else if (shareOfExpense >= 0.25) {
      guidance += " A maior categoria ja pesa bastante; uma pequena reducao pode fazer diferenca.";
    }
  }

  els.statusLine.textContent = `${status} | ${transactions.length} lancamentos no filtro atual.`;
  els.incomeRatioLine.textContent = `Despesa sobre renda: ${Math.round(expenseRatio * 100)}% | Meta sugerida: ate ${floatToMoney(income * 0.7)}`;
  els.savingsLine.textContent = `Taxa de poupanca: ${Math.round(savingsRatio * 100)}% | Saldo: ${floatToMoney(balance)}`;
  els.topCategoryLine.textContent = topCategoryLine;
  els.guidanceLine.textContent = guidance;
}

function buildCoachMessages(transactions) {
  const totals = summary(transactions);
  const income = totals.Receita;
  const expense = totals.Despesa;
  const balance = totals.Saldo;
  const messages = [];
  const monthlyUsage = budgetUsage(monthTransactions(state.filters.month || currentMonthISO()));
  const recurringExpenses = recurringTotalByType("Despesa");
  const selectedMonth = state.filters.month || currentMonthISO();
  const previousMonth = previousMonthISO(selectedMonth);
  const currentByCategory = categoryTotals(monthTransactions(selectedMonth));
  const previousByCategory = new Map(categoryTotals(monthTransactions(previousMonth)).map((item) => [item.category, item.total]));

  if (income > 0 && expense / income > 0.85) {
    messages.push("Suas despesas estao acima de 85% da renda. Priorize cortes em lazer, assinaturas e compras no cartao.");
  }
  if (income > 0 && balance / income < 0.1) {
    messages.push("A reserva do mes esta baixa. Tente separar pelo menos 10% da renda antes de gastos variaveis.");
  }
  for (const item of monthlyUsage) {
    if (item.limit > 0 && item.usage > 1) {
      messages.push(`${item.category} passou ${floatToMoney(item.total - item.limit)} do limite mensal.`);
    } else if (item.limit > 0 && item.usage >= 0.8) {
      messages.push(`${item.category} ja usou ${Math.round(item.usage * 100)}% do limite. Vale desacelerar essa categoria.`);
    }
  }
  if (income > 0 && recurringExpenses / income > 0.35) {
    messages.push("Gastos recorrentes consomem mais de 35% da renda. Revise contratos e assinaturas fixas.");
  }
  for (const item of currentByCategory.slice(0, 5)) {
    const previous = Number(previousByCategory.get(item.category) || 0);
    if (previous > 0 && item.total > previous * 1.35) {
      messages.push(`${item.category} subiu ${Math.round(((item.total - previous) / previous) * 100)}% em relacao ao mes anterior.`);
    }
  }
  const forecast = forecastMonthExpense(selectedMonth);
  if (income > 0 && forecast > income * 0.8) {
    messages.push(`Pela media atual, o mes pode fechar com ${floatToMoney(forecast)} em despesas.`);
  }
  if (!messages.length) {
    messages.push("Seu painel esta equilibrado. Continue registrando tudo para manter previsibilidade.");
  }
  return messages.slice(0, 6);
}

function renderCoach(transactions) {
  clearElement(els.coachList);
  for (const message of buildCoachMessages(transactions)) {
    const item = document.createElement("li");
    item.textContent = message;
    els.coachList.appendChild(item);
  }
}

function buildActionPlan(transactions) {
  const totals = summary(transactions);
  const actions = [];
  const selectedMonth = state.filters.month || currentMonthISO();
  const overBudget = budgetUsage(monthTransactions(selectedMonth)).filter((item) => item.limit > 0 && item.usage > 1);
  const topCategory = categoryTotals(transactions)[0];

  if (overBudget[0]) {
    actions.push(`Reduzir ${overBudget[0].category} em ${floatToMoney(overBudget[0].total - overBudget[0].limit)} para voltar ao limite.`);
  }
  if (topCategory) {
    actions.push(`Revisar os 3 maiores lancamentos de ${topCategory.category} antes de novas compras.`);
  }
  if (totals.Receita > 0 && totals.Saldo / totals.Receita < 0.1) {
    actions.push(`Separar ${floatToMoney(totals.Receita * 0.1)} assim que receber a proxima renda.`);
  }
  if (state.recurring.length) {
    actions.push("Conferir gastos fixos e cancelar pelo menos um item pouco usado.");
  }
  if (!actions.length) {
    actions.push("Manter registros semanais e preservar os limites atuais.");
  }
  return actions.slice(0, 3);
}

function renderActionPlan(transactions) {
  clearElement(els.actionPlanList);
  for (const action of buildActionPlan(transactions)) {
    const item = document.createElement("li");
    item.textContent = action;
    els.actionPlanList.appendChild(item);
  }
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(" ");
  let line = "";
  let lineCount = 0;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, y + lineCount * lineHeight);
      line = word;
      lineCount += 1;
    } else {
      line = testLine;
    }
  }

  if (line) ctx.fillText(line, x, y + lineCount * lineHeight);
}

function drawCategoryChart(transactions) {
  const canvas = els.categoryChart;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth || 900;
  const cssHeight = 260;
  canvas.width = Math.floor(cssWidth * dpr);
  canvas.height = Math.floor(cssHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  ctx.fillStyle = "#081322";
  ctx.fillRect(0, 0, cssWidth, cssHeight);

  const totals = categoryTotals(transactions);
  if (!totals.length) {
    ctx.fillStyle = "#8fb0c7";
    ctx.font = "14px system-ui";
    ctx.fillText("Cadastre despesas para visualizar o grafico por categoria.", 30, 130);
    return;
  }

  const items = totals.slice(0, 6);
  const income = summary(transactions).Receita;
  const expense = summary(transactions).Despesa;
  const left = 44;
  const right = cssWidth - 20;
  const top = 24;
  const bottom = 198;
  const plotHeight = bottom - top;
  const slotWidth = (right - left - 20) / items.length;
  const barWidth = Math.min(78, slotWidth * 0.58);

  ctx.strokeStyle = "rgba(103, 232, 249, 0.38)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(left, top);
  ctx.lineTo(left, bottom);
  ctx.lineTo(right, bottom);
  ctx.stroke();

  for (let tick = 0; tick <= 100; tick += 20) {
    const y = bottom - (plotHeight * tick) / 100;
    ctx.strokeStyle = "rgba(143, 176, 199, 0.18)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();
    ctx.fillStyle = "#8fb0c7";
    ctx.font = "11px system-ui";
    ctx.textAlign = "right";
    ctx.fillText(`${tick}%`, left - 8, y + 4);
  }

  items.forEach((item, index) => {
    const amount = Number(item.total || 0);
    const shareExpense = expense > 0 ? amount / expense : 0;
    const shareIncome = income > 0 ? amount / income : 0;
    const barHeight = Math.max(10, plotHeight * Math.min(shareIncome, 1));
    const centerX = left + 20 + slotWidth * index + slotWidth / 2;
    const x = centerX - barWidth / 2;
    const y = bottom - barHeight;
    const color = shareIncome >= 0.3 ? "#ff6b81" : shareIncome >= 0.15 ? "#ff855c" : shareIncome >= 0.08 ? "#ffd166" : "#22d3ee";

    ctx.fillStyle = color;
    ctx.fillRect(x, y, barWidth, barHeight);
    ctx.fillStyle = "#e9f8ff";
    ctx.font = "bold 12px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(floatToMoney(amount), centerX, y - 10);
    ctx.font = "11px system-ui";
    wrapText(ctx, item.category, centerX, bottom + 18, slotWidth - 12, 13);
    ctx.fillStyle = "#8fb0c7";
    ctx.font = "10px system-ui";
    wrapText(ctx, `${Math.round(shareExpense * 100)}% despesas | ${Math.round(shareIncome * 100)}% renda`, centerX, bottom + 40, slotWidth - 12, 12);
  });
}

function renderCategoryList(transactions) {
  const totals = categoryTotals(transactions);
  clearElement(els.categoryList);

  if (!totals.length) {
    const empty = document.createElement("p");
    empty.className = "tip";
    empty.textContent = "Cadastre despesas para ver dicas especificas por categoria.";
    els.categoryList.appendChild(empty);
    return;
  }

  const totalExpense = summary(transactions).Despesa;
  for (const item of totals.slice(0, 10)) {
    const share = totalExpense > 0 ? item.total / totalExpense : 0;
    const row = document.createElement("article");
    const head = document.createElement("div");
    const title = document.createElement("strong");
    const amount = document.createElement("span");
    const bar = document.createElement("div");
    const fill = document.createElement("span");
    const tip = document.createElement("div");

    row.className = "category-item";
    head.className = "category-row";
    bar.className = "bar";
    tip.className = "tip";

    title.textContent = item.category;
    amount.textContent = `${floatToMoney(item.total)} · ${Math.round(share * 100)}%`;
    fill.style.width = `${Math.max(6, Math.min(100, share * 100))}%`;
    tip.textContent = categoryTip(item.category, share, totalExpense);

    head.appendChild(title);
    head.appendChild(amount);
    bar.appendChild(fill);
    row.appendChild(head);
    row.appendChild(bar);
    row.appendChild(tip);
    els.categoryList.appendChild(row);
  }
}

function renderBudgetList(transactions) {
  clearElement(els.budgetList);
  const usageByCategory = new Map(budgetUsage(transactions).map((item) => [item.category, item]));
  const categories = Array.from(new Set([...Object.keys(state.budgets), ...usageByCategory.keys()])).sort();

  if (!categories.length) {
    const empty = document.createElement("p");
    empty.className = "tip";
    empty.textContent = "Defina limites para acompanhar o desempenho por categoria.";
    els.budgetList.appendChild(empty);
    return;
  }

  for (const category of categories) {
    const item = usageByCategory.get(category) || { category, total: 0, limit: Number(state.budgets[category] || 0), usage: 0 };
    const row = document.createElement("article");
    const head = document.createElement("div");
    const title = document.createElement("strong");
    const amount = document.createElement("span");
    const bar = document.createElement("div");
    const fill = document.createElement("span");
    const tip = document.createElement("div");

    row.className = "category-item";
    head.className = "category-row";
    bar.className = "bar";
    tip.className = "tip";
    if (item.usage > 1) row.classList.add("is-danger");
    if (item.usage >= 0.8 && item.usage <= 1) row.classList.add("is-warning");

    title.textContent = category;
    amount.textContent = `${floatToMoney(item.total)} / ${floatToMoney(item.limit)}`;
    fill.style.width = `${Math.max(5, Math.min(100, item.usage * 100))}%`;
    tip.textContent =
      item.limit <= 0
        ? "Sem limite definido."
        : item.usage > 1
          ? `Acima do limite em ${floatToMoney(item.total - item.limit)}.`
          : `Restam ${floatToMoney(Math.max(0, item.limit - item.total))} neste mes.`;

    head.appendChild(title);
    head.appendChild(amount);
    bar.appendChild(fill);
    row.appendChild(head);
    row.appendChild(bar);
    row.appendChild(tip);
    els.budgetList.appendChild(row);
  }
}

function renderRecurringList() {
  clearElement(els.recurringList);
  if (!state.recurring.length) {
    const empty = document.createElement("p");
    empty.className = "tip";
    empty.textContent = "Cadastre despesas fixas, salario ou assinaturas que aparecem todo mes.";
    els.recurringList.appendChild(empty);
    return;
  }

  for (const item of state.recurring) {
    const row = document.createElement("article");
    const head = document.createElement("div");
    const title = document.createElement("strong");
    const amount = document.createElement("span");
    const detail = document.createElement("div");
    const remove = document.createElement("button");

    row.className = "category-item";
    head.className = "category-row";
    detail.className = "tip";
    remove.className = "ghost";
    remove.type = "button";

    title.textContent = item.description;
    amount.textContent = floatToMoney(item.amount);
    detail.textContent = `${item.tx_type} | ${item.category} | dia ${item.day}`;
    remove.textContent = "Remover";
    remove.addEventListener("click", () => {
      state.recurring = state.recurring.filter((recurring) => recurring.id !== item.id);
      saveRecurringForUser();
      renderRecurringList();
      refreshUI();
    });

    head.appendChild(title);
    head.appendChild(amount);
    row.appendChild(head);
    row.appendChild(detail);
    row.appendChild(remove);
    els.recurringList.appendChild(row);
  }
}

function renderGoalList() {
  clearElement(els.goalList);
  if (!state.goals.length) {
    const empty = document.createElement("p");
    empty.className = "tip";
    empty.textContent = "Crie metas para reserva, dividas, investimentos ou compras planejadas.";
    els.goalList.appendChild(empty);
    return;
  }

  for (const goal of state.goals) {
    const progress = Number(goal.target || 0) > 0 ? Number(goal.current || 0) / Number(goal.target) : 0;
    const row = document.createElement("article");
    const head = document.createElement("div");
    const title = document.createElement("strong");
    const amount = document.createElement("span");
    const bar = document.createElement("div");
    const fill = document.createElement("span");
    const detail = document.createElement("div");
    const remove = document.createElement("button");

    row.className = "category-item";
    head.className = "category-row";
    bar.className = "bar";
    detail.className = "tip";
    remove.className = "ghost";
    remove.type = "button";

    title.textContent = `${goal.name} | ${goal.type}`;
    amount.textContent = `${floatToMoney(goal.current)} / ${floatToMoney(goal.target)}`;
    fill.style.width = `${Math.max(5, Math.min(100, progress * 100))}%`;
    detail.textContent = `${Math.round(progress * 100)}% concluido`;
    remove.textContent = "Remover";
    remove.addEventListener("click", () => {
      state.goals = state.goals.filter((item) => item.id !== goal.id);
      saveGoalsForUser();
      refreshUI();
    });

    head.appendChild(title);
    head.appendChild(amount);
    bar.appendChild(fill);
    row.appendChild(head);
    row.appendChild(bar);
    row.appendChild(detail);
    row.appendChild(remove);
    els.goalList.appendChild(row);
  }
}

function renderAccountList() {
  clearElement(els.accountList);
  const balances = accountBalances();
  for (const account of state.accounts) {
    const row = document.createElement("article");
    const head = document.createElement("div");
    const title = document.createElement("strong");
    const amount = document.createElement("span");
    const detail = document.createElement("div");

    row.className = "category-item";
    head.className = "category-row";
    detail.className = "tip";
    title.textContent = account.name;
    amount.textContent = floatToMoney(balances.get(account.id) || 0);
    detail.textContent = `Saldo inicial: ${floatToMoney(account.initialBalance || 0)}`;

    head.appendChild(title);
    head.appendChild(amount);
    row.appendChild(head);
    row.appendChild(detail);
    els.accountList.appendChild(row);
  }
}

function renderCustomCategoryList() {
  clearElement(els.customCategoryList);
  if (!state.customCategories.length) {
    const empty = document.createElement("p");
    empty.className = "tip";
    empty.textContent = "Categorias personalizadas aparecem nos formularios e filtros.";
    els.customCategoryList.appendChild(empty);
    return;
  }

  for (const category of state.customCategories) {
    const row = document.createElement("article");
    const head = document.createElement("div");
    const title = document.createElement("strong");
    const remove = document.createElement("button");

    row.className = "category-item";
    head.className = "category-row";
    remove.className = "ghost";
    remove.type = "button";
    title.textContent = category;
    remove.textContent = "Remover";
    remove.addEventListener("click", () => {
      state.customCategories = state.customCategories.filter((item) => item !== category);
      saveCustomCategoriesForUser();
      refreshUI();
    });

    head.appendChild(title);
    head.appendChild(remove);
    row.appendChild(head);
    els.customCategoryList.appendChild(row);
  }
}

function metricCard(label, value, detail = "") {
  const item = document.createElement("article");
  const title = document.createElement("span");
  const strong = document.createElement("strong");
  const small = document.createElement("small");
  item.className = "mini-metric";
  title.textContent = label;
  strong.textContent = value;
  small.textContent = detail;
  item.appendChild(title);
  item.appendChild(strong);
  if (detail) item.appendChild(small);
  return item;
}

function renderMonthlyDashboard() {
  clearElement(els.monthlyDashboard);
  const selectedMonth = state.filters.month || currentMonthISO();
  const previousMonth = previousMonthISO(selectedMonth);
  const current = summary(monthTransactions(selectedMonth));
  const previous = summary(monthTransactions(previousMonth));
  const expenseDelta = current.Despesa - previous.Despesa;
  const incomeDelta = current.Receita - previous.Receita;
  const forecast = forecastMonthExpense(selectedMonth);

  els.monthlyDashboard.appendChild(metricCard("Mes atual", selectedMonth, "Filtro ativo"));
  els.monthlyDashboard.appendChild(metricCard("Despesas vs mes anterior", floatToMoney(expenseDelta), previousMonth));
  els.monthlyDashboard.appendChild(metricCard("Receitas vs mes anterior", floatToMoney(incomeDelta), previousMonth));
  els.monthlyDashboard.appendChild(metricCard("Previsao de despesas", floatToMoney(forecast), "Com base na media diaria"));
}

function applySettings() {
  document.body.classList.toggle("dark-mode", Boolean(state.settings.darkMode));
  els.darkModeToggle.checked = Boolean(state.settings.darkMode);
  els.tutorialToggle.checked = Boolean(state.settings.showTutorial);
  els.tutorialCard.hidden = !state.settings.showTutorial;
}

function renderTransactions(transactions) {
  clearElement(els.transactionsTbody);

  if (!transactions.length) {
    const row = document.createElement("tr");
    const cell = createCell("Nenhum lancamento encontrado.");
    cell.colSpan = 6;
    cell.className = "tip";
    row.appendChild(cell);
    els.transactionsTbody.appendChild(row);
    return;
  }

  for (const tx of transactions) {
    const row = document.createElement("tr");
    row.appendChild(createCell(tx.tx_date));
    row.appendChild(createCell(tx.description));
    row.appendChild(createCell(tx.category));
    row.appendChild(createCell(tx.tx_type));
    row.appendChild(createCell(floatToMoney(tx.amount)));
    row.appendChild(createCell(tx.note || ""));
    row.addEventListener("click", () => loadTransactionIntoForm(tx.id));
    els.transactionsTbody.appendChild(row);
  }
}

function refreshUI() {
  populateCategories();
  populateAccounts();
  const current = filteredTransactions();
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
  renderCustomCategoryList();
  renderTransactions(current);
  els.deleteBtn.disabled = state.editingId == null;
}

function resetForm() {
  state.editingId = null;
  els.transactionForm.reset();
  els.txDate.value = todayISO();
  els.txType.value = "Despesa";
  if (state.accounts[0]) els.txAccount.value = state.accounts[0].id;
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
  els.txNote.value = tx.note || "";
  els.deleteBtn.disabled = false;
}

function exportCSV() {
  const rows = filteredTransactions();
  if (!rows.length) return;
  const header = ["data", "descricao", "categoria", "tipo", "valor", "observacao"];
  const csvRows = rows.map((tx) =>
    [tx.tx_date, tx.description, tx.category, tx.tx_type, Number(tx.amount).toFixed(2), tx.note || ""]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(";"),
  );
  const blob = new Blob([`\ufeff${header.join(";")}\n${csvRows.join("\n")}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `fina_${todayISO()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function exportJSON() {
  if (!state.currentUser) return;
  const payload = {
    version: APP_VERSION,
    exportedAt: new Date().toISOString(),
    user: {
      name: state.currentUser.name,
      email: state.currentUser.email,
    },
    transactions: state.transactions,
    budgets: state.budgets,
    recurring: state.recurring,
    goals: state.goals,
    accounts: state.accounts,
    customCategories: state.customCategories,
    settings: state.settings,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `fina_backup_${todayISO()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function exportReportHTML() {
  const rows = filteredTransactions();
  const totals = summary(rows);
  const actions = buildActionPlan(rows).map((item) => `<li>${item}</li>`).join("");
  const coach = buildCoachMessages(rows).map((item) => `<li>${item}</li>`).join("");
  const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Relatorio Fina ${todayISO()}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #0f172a; margin: 32px; }
    h1, h2 { margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { border-bottom: 1px solid #dbe4ee; padding: 8px; text-align: left; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .box { border: 1px solid #dbe4ee; border-radius: 8px; padding: 12px; }
  </style>
</head>
<body>
  <h1>Relatorio Fina</h1>
  <p>Gerado em ${new Date().toLocaleString("pt-BR")}</p>
  <section class="grid">
    <div class="box"><strong>Receitas</strong><br>${floatToMoney(totals.Receita)}</div>
    <div class="box"><strong>Despesas</strong><br>${floatToMoney(totals.Despesa)}</div>
    <div class="box"><strong>Saldo</strong><br>${floatToMoney(totals.Saldo)}</div>
  </section>
  <h2>Coach financeiro</h2>
  <ul>${coach}</ul>
  <h2>Plano de acao</h2>
  <ol>${actions}</ol>
  <h2>Lancamentos</h2>
  <table>
    <thead><tr><th>Data</th><th>Descricao</th><th>Categoria</th><th>Tipo</th><th>Valor</th></tr></thead>
    <tbody>
      ${rows
        .map((tx) => `<tr><td>${tx.tx_date}</td><td>${tx.description}</td><td>${tx.category}</td><td>${tx.tx_type}</td><td>${floatToMoney(tx.amount)}</td></tr>`)
        .join("")}
    </tbody>
  </table>
</body>
</html>`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `fina_relatorio_${todayISO()}.html`;
  link.click();
  URL.revokeObjectURL(url);
}

function importJSONFile(file) {
  if (!file || !state.currentUser) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const payload = safeJsonParse(reader.result, null);
    if (!payload || !Array.isArray(payload.transactions)) {
      window.alert("Arquivo de backup invalido.");
      return;
    }
    state.transactions = payload.transactions;
    state.budgets = payload.budgets && typeof payload.budgets === "object" ? payload.budgets : state.budgets;
    state.recurring = Array.isArray(payload.recurring) ? payload.recurring : state.recurring;
    state.goals = Array.isArray(payload.goals) ? payload.goals : state.goals;
    state.accounts = Array.isArray(payload.accounts) ? payload.accounts : state.accounts;
    state.customCategories = Array.isArray(payload.customCategories) ? payload.customCategories : state.customCategories;
    state.settings = payload.settings && typeof payload.settings === "object" ? { ...state.settings, ...payload.settings } : state.settings;
    saveTransactionsForUser();
    saveBudgetsForUser();
    saveRecurringForUser();
    saveGoalsForUser();
    saveAccountsForUser();
    saveCustomCategoriesForUser();
    saveSettingsForUser();
    applySettings();
    refreshUI();
  });
  reader.readAsText(file);
}

function importCSVFile(file) {
  if (!file || !state.currentUser) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const lines = String(reader.result || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    const imported = [];
    for (const line of lines.slice(1)) {
      const parts = line.split(";").map((part) => part.replace(/^"|"$/g, "").replace(/""/g, '"').trim());
      const [tx_date, description, category, tx_type, amount, note] = parts;
      const value = moneyToFloat(amount);
      if (!tx_date || !description || !category || !Number.isFinite(value)) continue;
      imported.push({
        id: uuid(),
        tx_date,
        description,
        category,
        tx_type: tx_type === "Receita" ? "Receita" : "Despesa",
        amount: value,
        note: note || "Importado por CSV",
        accountId: state.accounts[0]?.id || "cash",
      });
    }
    state.transactions.push(...imported);
    saveTransactionsForUser();
    refreshUI();
  });
  reader.readAsText(file);
}

function saveLocalSnapshot() {
  if (!state.currentUser) return;
  const payload = {
    version: APP_VERSION,
    savedAt: new Date().toISOString(),
    userId: state.currentUser.id,
    transactions: state.transactions,
    budgets: state.budgets,
    recurring: state.recurring,
    goals: state.goals,
    accounts: state.accounts,
    customCategories: state.customCategories,
    settings: state.settings,
  };
  localStorage.setItem(`${AUTO_BACKUP_KEY}.${state.currentUser.id}`, JSON.stringify(payload));
}

function handleBudgetSubmit(event) {
  event.preventDefault();
  const category = els.budgetCategory.value;
  const limit = moneyToFloat(els.budgetLimit.value);
  if (!category || !Number.isFinite(limit) || limit < 0) return;
  state.budgets[category] = limit;
  saveBudgetsForUser();
  saveLocalSnapshot();
  els.budgetForm.reset();
  populateCategories();
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
  const tx = {
    id: state.editingId || uuid(),
    tx_date: els.txDate.value,
    description: els.txDescription.value.trim(),
    category: els.txCategory.value.trim(),
    amount,
    tx_type: els.txType.value,
    accountId: els.txAccount.value || state.accounts[0]?.id || "cash",
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
  for (const namespace of ["transactions", "budgets", "recurring", "goals", "accounts", "categories", "settings"]) {
    localStorage.removeItem(storageKeyForUser(userId, namespace));
  }
  localStorage.removeItem(`${AUTO_BACKUP_KEY}.${userId}`);

  state.transactions = [];
  state.budgets = {};
  state.recurring = [];
  state.goals = [];
  state.accounts = DEFAULT_ACCOUNTS.map((account) => ({ ...account }));
  state.customCategories = [];
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
  saveRecurringForUser();
  saveGoalsForUser();
  saveAccountsForUser();
  saveCustomCategoriesForUser();
  saveSettingsForUser();

  els.searchInput.value = "";
  els.filterType.value = "Todos";
  els.filterMonth.value = "";
  els.filterCategory.value = "Todas";
  els.filterMinAmount.value = "";
  els.filterMaxAmount.value = "";
  resetForm();
  applySettings();
  refreshUI();
}

function updateUserBadge() {
  if (!state.currentUser) {
    els.userBadge.textContent = "";
    return;
  }
  els.userBadge.textContent = state.currentUser.name || state.currentUser.email;
}

function startAppForCurrentUser() {
  loadTransactionsForUser();
  loadBudgetsForUser();
  loadRecurringForUser();
  loadGoalsForUser();
  loadAccountsForUser();
  loadCustomCategoriesForUser();
  loadSettingsForUser();
  generateRecurringForMonth();
  populateCategories();
  populateAccounts();
  els.txDate.value = todayISO();
  els.installmentDate.value = todayISO();
  els.recurringDay.value = "5";
  updateUserBadge();
  applySettings();
  showAppScreen();
  switchTab(state.activeTab);
  refreshUI();
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

function bindEvents() {
  initTabs();
  els.transactionForm.addEventListener("submit", handleSubmit);
  els.budgetForm.addEventListener("submit", handleBudgetSubmit);
  els.recurringForm.addEventListener("submit", handleRecurringSubmit);
  els.goalForm.addEventListener("submit", handleGoalSubmit);
  els.accountForm.addEventListener("submit", handleAccountSubmit);
  els.categoryForm.addEventListener("submit", handleCategorySubmit);
  els.installmentForm.addEventListener("submit", handleInstallmentSubmit);
  els.clearFormBtn.addEventListener("click", resetForm);
  els.deleteBtn.addEventListener("click", deleteSelected);
  els.exportBtn.addEventListener("click", exportCSV);
  els.exportJsonBtn.addEventListener("click", exportJSON);
  els.exportReportBtn.addEventListener("click", exportReportHTML);
  els.autoBackupBtn.addEventListener("click", () => {
    saveLocalSnapshot();
    window.alert("Snapshot local salvo neste navegador.");
  });
  els.resetDataBtn.addEventListener("click", resetAllUserData);
  els.deleteAccountBtn.addEventListener("click", () => {
    if (!state.currentUser) return;
    const confirmed = window.confirm("Excluir esta conta local e todos os dados dela?");
    if (!confirmed) return;
    const userId = state.currentUser.id;
    for (const namespace of ["transactions", "budgets", "recurring", "goals", "accounts", "categories", "settings"]) {
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
  els.lockBtn.addEventListener("click", () => {
    clearSession();
    state.currentUser = null;
    showAuthScreen();
    setAuthMessage("Tela bloqueada. Entre novamente para continuar.", "normal");
  });
  els.logoutBtn.addEventListener("click", () => {
    clearSession();
    state.currentUser = null;
    state.transactions = [];
    state.budgets = {};
    state.recurring = [];
    state.goals = [];
    state.accounts = [];
    state.customCategories = [];
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

init();

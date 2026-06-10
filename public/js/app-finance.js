(function () {
  function getCtx() {
    return window.FinaRuntime;
  }

  const { CATEGORY_RULES } = window.FinaAppData;
  const state = new Proxy({}, {
    get: (_, prop) => getCtx().state[prop],
    set: (_, prop, value) => {
      getCtx().state[prop] = value;
      return true;
    },
  });

  function currentMonthISO(...args) {
    return getCtx().currentMonthISO(...args);
  }

  function todayISO(...args) {
    return getCtx().todayISO(...args);
  }

  function moneyToFloat(...args) {
    return getCtx().moneyToFloat(...args);
  }

  function uuid(...args) {
    return getCtx().uuid(...args);
  }

  function monthlyMilesSavings(...args) {
    return getCtx().monthlyMilesSavings(...args);
  }

  function saveTransactionsForUser(...args) {
    return getCtx().saveTransactionsForUser(...args);
  }

  function transactionTypeForTab(...args) {
    return getCtx().transactionTypeForTab(...args);
  }

function suggestCategory(description) {
  const text = String(description || "").toLowerCase();
  const rule = CATEGORY_RULES.find((item) => item.words.some((word) => text.includes(word)));
  return rule ? rule.category : "";
}

function monthTransactions(month = currentMonthISO()) {
  return state.transactions.filter((tx) => tx.tx_date.slice(0, 7) === month);
}

function matchesFilters(tx, tabName = state.activeTab) {
  const search = state.filters.search.trim().toLowerCase();
  const month = state.filters.month.trim();
  const type = state.filters.type;
  const tabType = transactionTypeForTab(tabName);
  const category = state.filters.category;
  const minAmount = moneyToFloat(state.filters.minAmount);
  const maxAmount = moneyToFloat(state.filters.maxAmount);

  if (search) {
    const haystack = `${tx.description} ${tx.category} ${tx.note || ""}`.toLowerCase();
    if (!haystack.includes(search)) return false;
  }
  if (tabType && tx.tx_type !== tabType) return false;
  if (!tabType && type !== "Todos" && tx.tx_type !== type) return false;
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
  const balance = totals.Saldo + monthlyMilesSavings();
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

function profileValue(field, fallback = 0) {
  const value = Number(state.financialProfile[field]);
  return Number.isFinite(value) ? value : fallback;
}

function inferredMonthlyIncome() {
  const current = summary(monthTransactions(state.filters.month || currentMonthISO()));
  if (current.Receita > 0) return current.Receita;
  const all = summary(state.transactions);
  return all.Receita > 0 ? all.Receita : 0;
}

  window.FinaFinance = {
    suggestCategory,
    monthTransactions,
    matchesFilters,
    filteredTransactions,
    summary,
    categoryTotals,
    budgetUsage,
    recurringTotalByType,
    accountBalances,
    calculateFinancialScore,
    forecastMonthExpense,
    generateRecurringForMonth,
    categoryTip,
    profileValue,
    inferredMonthlyIncome,
  };
})();

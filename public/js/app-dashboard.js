(function () {
  function getCtx() {
    return window.FinaRuntime;
  }

  const { APP_VERSION } = window.FinaAppData;
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

  function currentMonthISO(...args) {
    return getCtx().currentMonthISO(...args);
  }

  function previousMonthISO(...args) {
    return getCtx().previousMonthISO(...args);
  }

  function floatToMoney(...args) {
    return getCtx().floatToMoney(...args);
  }

  function summary(...args) {
    return getCtx().summary(...args);
  }

  function categoryTotals(...args) {
    return getCtx().categoryTotals(...args);
  }

  function budgetUsage(...args) {
    return getCtx().budgetUsage(...args);
  }

  function monthTransactions(...args) {
    return getCtx().monthTransactions(...args);
  }

  function monthlyMilesSavings(...args) {
    return getCtx().monthlyMilesSavings(...args);
  }

  function recurringTotalByType(...args) {
    return getCtx().recurringTotalByType(...args);
  }

  function calculateFinancialScore(...args) {
    return getCtx().calculateFinancialScore(...args);
  }

  function forecastMonthExpense(...args) {
    return getCtx().forecastMonthExpense(...args);
  }

  function clearElement(...args) {
    return getCtx().clearElement(...args);
  }

  function createInfoButton(...args) {
    return getCtx().createInfoButton(...args);
  }

  function inferInfoAction(...args) {
    return getCtx().inferInfoAction(...args);
  }

  function categoryTip(...args) {
    return getCtx().categoryTip(...args);
  }

  function cardLabelFromKey(...args) {
    return getCtx().cardLabelFromKey(...args);
  }

  function cardModelLabel(...args) {
    return getCtx().cardModelLabel(...args);
  }

  function accountBalances(...args) {
    return getCtx().accountBalances(...args);
  }

  function saveRecurringForUser(...args) {
    return getCtx().saveRecurringForUser(...args);
  }

  function saveGoalsForUser(...args) {
    return getCtx().saveGoalsForUser(...args);
  }

  function saveCustomCategoriesForUser(...args) {
    return getCtx().saveCustomCategoriesForUser(...args);
  }

  function refreshUI(...args) {
    return getCtx().refreshUI(...args);
  }

  function calculateMiles(...args) {
    return getCtx().calculateMiles(...args);
  }

  function localSnapshotInfo(...args) {
    return getCtx().localSnapshotInfo(...args);
  }

  function profileValue(...args) {
    return getCtx().profileValue(...args);
  }

  function investorProfileName(...args) {
    return getCtx().investorProfileName(...args);
  }

  function recommendationArticle(...args) {
    return getCtx().recommendationArticle(...args);
  }

function updateMetrics(transactions) {
  const totals = summary(transactions);
  const expensesByCategory = categoryTotals(transactions);
  const usage = budgetUsage(monthTransactions(state.filters.month || currentMonthISO()));
  const income = totals.Receita;
  const expense = totals.Despesa;
  const balance = totals.Saldo;
  const milesSavings = monthlyMilesSavings();
  const economicBalance = balance + milesSavings;
  const expenseRatio = income > 0 ? expense / income : 0;
  const savingsRatio = income > 0 ? economicBalance / income : 0;
  const categoriesWithBudget = usage.filter((item) => item.limit > 0);
  const overBudget = categoriesWithBudget.filter((item) => item.usage > 1);
  const nearBudget = categoriesWithBudget.filter((item) => item.usage >= 0.8 && item.usage <= 1);

  els.incomeTotal.textContent = floatToMoney(income);
  els.expenseTotal.textContent = floatToMoney(expense);
  els.balanceTotal.textContent = floatToMoney(economicBalance);
  els.milesSavingsTotal.textContent = floatToMoney(milesSavings);
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
  els.savingsLine.textContent = `Taxa de poupanca economica: ${Math.round(savingsRatio * 100)}% | Saldo + milhas: ${floatToMoney(economicBalance)}`;
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
    const text = document.createElement("span");
    text.textContent = message;
    item.appendChild(text);
    item.appendChild(createInfoButton(inferInfoAction(message)));
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
    const text = document.createElement("span");
    text.textContent = action;
    item.appendChild(text);
    item.appendChild(createInfoButton(inferInfoAction(action)));
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
    const model = state.budgetCardModels[category] || {};
    const cardName = cardLabelFromKey(model.cardKey);

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
    if (model.cardModel && model.cardModel !== "none") {
      tip.textContent += ` Modelo: ${cardModelLabel(model.cardModel)}${cardName ? ` | Cartao: ${cardName}` : ""}.`;
    }

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

function metricCard(label, value, detail = "", action = null) {
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
  if (action) item.appendChild(createInfoButton(action));
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

function buildAppHealthAudits() {
  const selectedMonth = state.filters.month || currentMonthISO();
  const monthRows = monthTransactions(selectedMonth);
  const totals = summary(monthRows);
  const transactionCount = state.transactions.length;
  const incomeCount = state.transactions.filter((tx) => tx.tx_type === "Receita").length;
  const expenseCount = state.transactions.filter((tx) => tx.tx_type === "Despesa").length;
  const budgetCount = Object.keys(state.budgets).filter((category) => Number(state.budgets[category]) > 0).length;
  const miles = calculateMiles();
  const snapshot = localSnapshotInfo();
  const checks = [
    {
      area: "Receitas",
      level: incomeCount ? "ok" : "warning",
      status: incomeCount ? "Ativa" : "Pendente",
      detail: incomeCount
        ? `${incomeCount} receita(s) cadastrada(s). No mes filtrado: ${floatToMoney(totals.Receita)}.`
        : "Cadastre ao menos uma renda para liberar indicadores de gasto, poupanca e score.",
      action: "Aba Rendas",
    },
    {
      area: "Despesas",
      level: expenseCount ? "ok" : "warning",
      status: expenseCount ? "Ativa" : "Pendente",
      detail: expenseCount
        ? `${expenseCount} despesa(s) cadastrada(s). No mes filtrado: ${floatToMoney(totals.Despesa)}.`
        : "Cadastre gastos reais para alimentar categorias, graficos, orcamentos e alertas.",
      action: "Aba Despesas",
    },
    {
      area: "Planejamento",
      level: budgetCount && state.goals.length && state.accounts.length ? "ok" : "warning",
      status: budgetCount ? "Configurado" : "Incompleto",
      detail: `${budgetCount} orcamento(s), ${state.goals.length} meta(s) e ${state.accounts.length} conta(s).`,
      action: "Aba Planejamento",
    },
    {
      area: "Investimentos",
      level: profileValue("monthlyInvestment") > 0 || profileValue("emergencyReserve") > 0 ? "ok" : "warning",
      status: investorProfileName(),
      detail: `Reserva informada: ${floatToMoney(profileValue("emergencyReserve"))}. Aporte mensal: ${floatToMoney(profileValue("monthlyInvestment"))}.`,
      action: "Aba Investimentos",
    },
    {
      area: "Portfólio",
      level: state.portfolio.length ? "ok" : "warning",
      status: state.portfolio.length ? "Acompanhado" : "Sem ativos",
      detail: state.portfolio.length
        ? `${state.portfolio.length} ativo(s) cadastrado(s), com cotacao manual ou externa.`
        : "Cadastre ativos para medir patrimonio, resultado e concentracao.",
      action: "Aba Portfolio",
    },
    {
      area: "Cartões e milhas",
      level: miles.card && miles.monthlyMiles > 0 ? "ok" : "warning",
      status: miles.card ? miles.card.name : "Sem cartão",
      detail: miles.card
        ? `${Math.round(miles.monthlyMiles).toLocaleString("pt-BR")} milhas/mes e ${floatToMoney(miles.monthlyValue)} de economia estimada.`
        : "Cadastre ou selecione um cartao para calcular milhas.",
      action: "Abas Cartões/Milhas",
    },
    {
      area: "Automação",
      level: state.recurring.length ? "ok" : "warning",
      status: state.recurring.length ? "Ativa" : "Manual",
      detail: state.recurring.length
        ? `${state.recurring.length} recorrencia(s) configurada(s) para gerar lancamentos automaticamente.`
        : "Adicione recorrencias para contas fixas, assinaturas e entradas mensais.",
      action: "Aba Automação",
    },
    {
      area: "Relatórios",
      level: transactionCount ? "ok" : "warning",
      status: transactionCount ? "Com dados" : "Sem base",
      detail: transactionCount
        ? `${transactionCount} lancamento(s) alimentam dashboard, graficos e exportacoes.`
        : "Relatorios precisam de receitas ou despesas cadastradas.",
      action: "Aba Relatórios",
    },
    {
      area: "Backup",
      level: snapshot ? "ok" : "danger",
      status: snapshot ? "Snapshot local salvo" : "Sem snapshot",
      detail: snapshot
        ? `Ultimo snapshot: ${new Date(snapshot.savedAt).toLocaleString("pt-BR")}.`
        : "Salve um snapshot local ou exporte JSON para reduzir risco de perda de dados.",
      action: "Configurações",
    },
  ];
  return checks;
}

function renderAppHealth() {
  if (!els.appHealthSummary || !els.appHealthList) return;
  clearElement(els.appHealthSummary);
  clearElement(els.appHealthList);
  const checks = buildAppHealthAudits();
  const okCount = checks.filter((item) => item.level === "ok").length;
  const warningCount = checks.filter((item) => item.level === "warning").length;
  const dangerCount = checks.filter((item) => item.level === "danger").length;

  els.appHealthSummary.appendChild(metricCard("Funções prontas", `${okCount}/${checks.length}`, "Areas com dados suficientes"));
  els.appHealthSummary.appendChild(metricCard("Pendências", String(warningCount + dangerCount), "Pontos a configurar"));
  els.appHealthSummary.appendChild(metricCard("Alertas críticos", String(dangerCount), "Backup e segurança"));
  els.appHealthSummary.appendChild(metricCard("Versão", APP_VERSION, "Interface atual"));

  for (const check of checks) {
    const item = recommendationArticle(`${check.area}: ${check.status}`, check.detail, [check.action]);
    item.classList.add(`health-${check.level}`);
    els.appHealthList.appendChild(item);
  }
}

  window.FinaDashboard = {
    updateMetrics,
    buildCoachMessages,
    renderCoach,
    buildActionPlan,
    renderActionPlan,
    wrapText,
    drawCategoryChart,
    renderCategoryList,
    renderBudgetList,
    renderRecurringList,
    renderGoalList,
    renderAccountList,
    renderCustomCategoryList,
    metricCard,
    renderMonthlyDashboard,
    buildAppHealthAudits,
    renderAppHealth,
  };
})();

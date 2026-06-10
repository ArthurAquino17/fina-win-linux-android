(function () {
  function getCtx() {
    return window.FinaRuntime;
  }

  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function localSnapshotInfo() {
    const { state, AUTO_BACKUP_KEY, safeJsonParse } = getCtx();
    if (!state.currentUser) return null;
    const raw = localStorage.getItem(`${AUTO_BACKUP_KEY}.${state.currentUser.id}`);
    const snapshot = safeJsonParse(raw, null);
    if (!snapshot || !snapshot.savedAt) return null;
    return snapshot;
  }

  function exportCSV() {
    const { filteredTransactions, cardLabelFromKey, todayISO } = getCtx();
    const rows = filteredTransactions();
    if (!rows.length) return;
    const header = ["data", "descricao", "categoria", "tipo", "valor", "cartao", "observacao"];
    const csvRows = rows.map((tx) =>
      [tx.tx_date, tx.description, tx.category, tx.tx_type, Number(tx.amount).toFixed(2), cardLabelFromKey(tx.cardKey), tx.note || ""]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(";"),
    );
    const blob = new Blob([`\ufeff${header.join(";")}\n${csvRows.join("\n")}`], { type: "text/csv;charset=utf-8" });
    triggerDownload(blob, `fina_${todayISO()}.csv`);
  }

  function exportIncomeCSV() {
    const { state, matchesFilters, todayISO } = getCtx();
    const rows = state.transactions.filter((tx) => matchesFilters(tx, "income"));
    if (!rows.length) return;
    const header = ["data", "descricao", "categoria", "tipo", "valor", "observacao"];
    const csvRows = rows.map((tx) =>
      [tx.tx_date, tx.description, tx.category, tx.tx_type, Number(tx.amount).toFixed(2), tx.note || ""]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(";"),
    );
    const blob = new Blob([`\ufeff${header.join(";")}\n${csvRows.join("\n")}`], { type: "text/csv;charset=utf-8" });
    triggerDownload(blob, `fina_rendas_${todayISO()}.csv`);
  }

  function exportJSON() {
    const { state, APP_VERSION, todayISO } = getCtx();
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
      budgetCardModels: state.budgetCardModels,
      recurring: state.recurring,
      goals: state.goals,
      accounts: state.accounts,
      portfolio: state.portfolio,
      ownedCards: state.ownedCards,
      customCategories: state.customCategories,
      financialProfile: state.financialProfile,
      settings: state.settings,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    triggerDownload(blob, `fina_backup_${todayISO()}.json`);
  }

  function exportReportHTML() {
    const { filteredTransactions, summary, buildActionPlan, buildCoachMessages, floatToMoney, todayISO } = getCtx();
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
    triggerDownload(blob, `fina_relatorio_${todayISO()}.html`);
  }

  function importJSONFile(file) {
    const {
      state,
      DEFAULT_FINANCIAL_PROFILE,
      safeJsonParse,
      saveTransactionsForUser,
      saveBudgetsForUser,
      saveBudgetCardModelsForUser,
      saveRecurringForUser,
      saveGoalsForUser,
      saveAccountsForUser,
      savePortfolioForUser,
      saveOwnedCardsForUser,
      saveCustomCategoriesForUser,
      saveFinancialProfileForUser,
      saveSettingsForUser,
      applySettings,
      syncFinancialProfileForm,
      refreshUI,
    } = getCtx();
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
      state.budgetCardModels = payload.budgetCardModels && typeof payload.budgetCardModels === "object" ? payload.budgetCardModels : state.budgetCardModels;
      state.recurring = Array.isArray(payload.recurring) ? payload.recurring : state.recurring;
      state.goals = Array.isArray(payload.goals) ? payload.goals : state.goals;
      state.accounts = Array.isArray(payload.accounts) ? payload.accounts : state.accounts;
      state.portfolio = Array.isArray(payload.portfolio) ? payload.portfolio : state.portfolio;
      state.ownedCards = Array.isArray(payload.ownedCards) ? payload.ownedCards : state.ownedCards;
      state.customCategories = Array.isArray(payload.customCategories) ? payload.customCategories : state.customCategories;
      state.financialProfile =
        payload.financialProfile && typeof payload.financialProfile === "object"
          ? { ...DEFAULT_FINANCIAL_PROFILE, ...payload.financialProfile }
          : state.financialProfile;
      state.settings = payload.settings && typeof payload.settings === "object" ? { ...state.settings, ...payload.settings } : state.settings;
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
      applySettings();
      syncFinancialProfileForm();
      refreshUI();
    });
    reader.readAsText(file);
  }

  function importCSVFile(file) {
    const { state, uuid, moneyToFloat, cardKeyFromLabel, saveTransactionsForUser, refreshUI } = getCtx();
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
        const [tx_date, description, category, tx_type, amount, cardOrNote, maybeNote] = parts;
        const hasCardColumn = parts.length >= 7;
        const cardKey = hasCardColumn ? cardKeyFromLabel(cardOrNote) : "none";
        const note = hasCardColumn ? maybeNote : cardOrNote;
        const value = moneyToFloat(amount);
        if (!tx_date || !description || !category || !Number.isFinite(value)) continue;
        imported.push({
          id: uuid(),
          tx_date,
          description,
          category,
          tx_type: tx_type === "Receita" ? "Receita" : "Despesa",
          amount: value,
          cardKey,
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
    const { state, APP_VERSION, AUTO_BACKUP_KEY } = getCtx();
    if (!state.currentUser) return;
    const payload = {
      version: APP_VERSION,
      savedAt: new Date().toISOString(),
      userId: state.currentUser.id,
      transactions: state.transactions,
      budgets: state.budgets,
      budgetCardModels: state.budgetCardModels,
      recurring: state.recurring,
      goals: state.goals,
      accounts: state.accounts,
      portfolio: state.portfolio,
      ownedCards: state.ownedCards,
      customCategories: state.customCategories,
      financialProfile: state.financialProfile,
      settings: state.settings,
    };
    localStorage.setItem(`${AUTO_BACKUP_KEY}.${state.currentUser.id}`, JSON.stringify(payload));
  }

  window.FinaBackup = {
    localSnapshotInfo,
    exportCSV,
    exportIncomeCSV,
    exportJSON,
    exportReportHTML,
    importJSONFile,
    importCSVFile,
    saveLocalSnapshot,
  };
})();

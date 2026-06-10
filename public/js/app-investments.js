(function () {
  function getCtx() {
    return window.FinaRuntime;
  }

  function normalizeQuoteTicker(value) {
    return String(value || "").trim().toUpperCase().replace(/\s+/g, "").replace(/\.SA$/, "");
  }

  function quoteCacheKey(type, ticker) {
    return `${type}:${normalizeQuoteTicker(ticker)}`;
  }

  function quoteTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatQuoteChange(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return "0,00%";
    const formatted = Math.abs(numeric).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${numeric >= 0 ? "+" : "-"}${formatted}%`;
  }

  function isQuoteStale(value) {
    const { QUOTE_STALE_MS } = getCtx();
    const date = new Date(value);
    return Number.isNaN(date.getTime()) || Date.now() - date.getTime() > QUOTE_STALE_MS;
  }

  function marketQuoteForCandidate(kind, candidate) {
    const { state } = getCtx();
    return state.marketQuotes[quoteCacheKey(kind, candidate.ticker)];
  }

  function marketQuoteCandidates() {
    const { state, STOCK_SCREEN_CATALOG, CRYPTO_SCREEN_CATALOG } = getCtx();
    const candidates = [];
    if (state.financialProfile.stockPreference !== "none") {
      for (const candidate of STOCK_SCREEN_CATALOG) {
        candidates.push({ kind: "stock", type: "Ação", candidate });
      }
    }
    if (state.financialProfile.cryptoPreference !== "none") {
      for (const candidate of CRYPTO_SCREEN_CATALOG) {
        candidates.push({ kind: "crypto", type: "Cripto", candidate });
      }
    }
    return candidates;
  }

  function marketQuotesNeedRefresh(candidates) {
    const { state } = getCtx();
    if (!candidates.length) return false;
    if (isQuoteStale(state.marketQuoteStatus.lastUpdatedAt)) return true;
    return candidates.some(({ kind, candidate }) => !marketQuoteForCandidate(kind, candidate));
  }

  function renderMarketQuoteStatus() {
    const { state, els } = getCtx();
    if (!els.marketQuoteStatusLine) return;
    if (!marketQuoteCandidates().length) {
      els.marketQuoteStatusLine.textContent = "Ative ações ou criptomoedas no perfil do investidor para buscar cotações externas automaticamente.";
      return;
    }
    if (state.marketQuoteStatus.loading) {
      els.marketQuoteStatusLine.textContent = "Atualizando cotações externas de ações, ETFs, FIIs e criptomoedas...";
      return;
    }
    if (state.marketQuoteStatus.lastUpdatedAt) {
      els.marketQuoteStatusLine.textContent = `Cotações automáticas: ${state.marketQuoteStatus.updated} atualizadas, ${state.marketQuoteStatus.failed} sem resposta. Última atualização: ${quoteTime(state.marketQuoteStatus.lastUpdatedAt)}.`;
      return;
    }
    els.marketQuoteStatusLine.textContent = "As cotações são buscadas automaticamente em fontes externas quando esta aba é aberta e depois a cada 5 minutos.";
  }

  function investorProfileName() {
    const { state } = getCtx();
    const risk = state.financialProfile.investorRisk;
    const horizon = state.financialProfile.investorHorizon;
    if (risk === "high" && horizon === "long") return "Arrojado";
    if (risk === "medium" || horizon === "long") return "Moderado";
    return "Conservador";
  }

  function suggestedAllocation(profileName) {
    const { state } = getCtx();
    const stockPreference = state.financialProfile.stockPreference;
    const cryptoPreference = state.financialProfile.cryptoPreference;
    const wantsStocks = stockPreference && stockPreference !== "none";
    const wantsCrypto = cryptoPreference && cryptoPreference !== "none";

    if (state.financialProfile.investmentGoal === "reserve") {
      return [
        ["Reserva liquida", 80],
        ["Renda fixa pos-fixada", 20],
      ];
    }
    if (profileName === "Arrojado") {
      const allocation = [
        ["Reserva liquida", 20],
        ["Renda fixa", 25],
        ["Fundos imobiliarios", 15],
        ["Acoes e ETFs", wantsStocks ? (stockPreference === "high" ? 30 : 22) : 10],
        ["Exterior", 10],
      ];
      if (wantsCrypto) allocation.push(["Criptomoedas", cryptoPreference === "high" ? 8 : cryptoPreference === "medium" ? 5 : 2]);
      return normalizeAllocation(allocation);
    }
    if (profileName === "Moderado") {
      const allocation = [
        ["Reserva liquida", 30],
        ["Renda fixa", 40],
        ["Fundos imobiliarios", 15],
        ["Acoes e ETFs", wantsStocks ? (stockPreference === "high" ? 18 : stockPreference === "medium" ? 14 : 8) : 5],
      ];
      if (wantsCrypto) allocation.push(["Criptomoedas", cryptoPreference === "high" ? 4 : cryptoPreference === "medium" ? 3 : 1]);
      return normalizeAllocation(allocation);
    }
    const allocation = [
      ["Reserva liquida", 55],
      ["Renda fixa pos-fixada", 35],
      ["Renda fixa protegida", 10],
    ];
    if (wantsStocks) allocation.push(["Acoes e ETFs", stockPreference === "high" ? 8 : stockPreference === "medium" ? 5 : 3]);
    if (wantsCrypto) allocation.push(["Criptomoedas", cryptoPreference === "high" ? 2 : 1]);
    return normalizeAllocation(allocation);
  }

  function normalizeAllocation(items) {
    const total = items.reduce((sum, item) => sum + Number(item[1] || 0), 0);
    if (total <= 100) return items;
    return items.map(([label, percent]) => [label, Math.max(1, Math.round((percent / total) * 100))]);
  }

  function buildInvestmentRecommendations() {
    const { state, currentMonthISO, monthTransactions, summary, inferredMonthlyIncome, profileValue, floatToMoney } = getCtx();
    const selectedMonth = state.filters.month || currentMonthISO();
    const current = summary(monthTransactions(selectedMonth));
    const income = inferredMonthlyIncome();
    const monthlyExpenses = current.Despesa || summary(state.transactions).Despesa;
    const reserve = profileValue("emergencyReserve");
    const monthlyInvestment = profileValue("monthlyInvestment");
    const profileName = investorProfileName();
    const reserveTarget = Math.max(monthlyExpenses * 6, income * 3);
    const reserveCoverage = monthlyExpenses > 0 ? reserve / monthlyExpenses : 0;
    const actions = [];

    if (income <= 0) {
      actions.push("Registre ao menos uma receita para calibrar a recomendacao de aporte.");
    }
    if (reserveTarget > 0 && reserve < reserveTarget) {
      actions.push(`Prioridade: completar reserva de emergencia. Faltam ${floatToMoney(reserveTarget - reserve)} para uma cobertura sugerida.`);
    }
    if (monthlyInvestment <= 0 && current.Saldo > 0) {
      actions.push(`Seu saldo do filtro permite estudar um aporte de ate ${floatToMoney(current.Saldo)} sem mexer na reserva.`);
    } else if (monthlyInvestment > 0) {
      actions.push(`Aporte mensal informado: ${floatToMoney(monthlyInvestment)}. Automatize esse valor logo apos receber.`);
    }
    if (profileName === "Arrojado" && reserveCoverage < 6) {
      actions.push("Mesmo com perfil arrojado, mantenha reserva antes de aumentar renda variavel.");
    }
    if (state.financialProfile.stockPreference !== "none") {
      actions.push("Acoes: prefira diversificacao por setores/ETFs, compras graduais e limite por empresa para reduzir concentracao.");
    }
    if (state.financialProfile.cryptoPreference !== "none") {
      actions.push("Criptomoedas: trate como parcela de alto risco, mantenha posicao pequena e evite usar dinheiro da reserva.");
    }
    if (reserveTarget > 0 && reserve < reserveTarget && state.financialProfile.cryptoPreference !== "none") {
      actions.push("Como a reserva ainda nao esta completa, a exposicao em cripto deve ficar simbolica ate o caixa estar protegido.");
    }
    if (state.financialProfile.investmentGoal === "income") {
      actions.push("Para renda passiva, acompanhe consistencia de proventos, vacancia e concentracao por emissor/setor.");
    }
    if (state.financialProfile.investmentGoal === "purchase") {
      actions.push("Para compra planejada, prefira liquidez e baixo risco conforme a data de uso do dinheiro se aproxima.");
    }
    return { profileName, reserveTarget, reserveCoverage, actions, allocation: suggestedAllocation(profileName) };
  }

  function renderInvestmentAnalysis() {
    const { state, els, clearElement, floatToMoney, metricCard, profileValue } = getCtx();
    if (!els.investmentSummary || !els.investmentPlan) return;
    clearElement(els.investmentSummary);
    clearElement(els.investmentPlan);
    const data = buildInvestmentRecommendations();

    els.investmentSummary.appendChild(metricCard("Perfil", data.profileName, `${state.financialProfile.investorRisk} | ${state.financialProfile.investorHorizon}`));
    els.investmentSummary.appendChild(metricCard("Reserva alvo", floatToMoney(data.reserveTarget), "Base: 6 meses de gastos ou 3 rendas"));
    els.investmentSummary.appendChild(metricCard("Cobertura atual", `${data.reserveCoverage.toFixed(1)} meses`, floatToMoney(profileValue("emergencyReserve"))));
    els.investmentSummary.appendChild(metricCard("Aporte", floatToMoney(profileValue("monthlyInvestment")), "Informado no perfil"));
    els.investmentSummary.appendChild(metricCard("Acoes", state.financialProfile.stockPreference === "none" ? "Fora" : state.financialProfile.stockPreference, "Diversificacao e longo prazo"));
    els.investmentSummary.appendChild(metricCard("Cripto", state.financialProfile.cryptoPreference === "none" ? "Fora" : state.financialProfile.cryptoPreference, "Parcela de alto risco"));

    const allocation = document.createElement("article");
    allocation.className = "recommendation-card";
    const title = document.createElement("strong");
    const list = document.createElement("div");
    title.textContent = "Carteira sugerida";
    list.className = "allocation-list";
    for (const [label, percent] of data.allocation) {
      const row = document.createElement("div");
      const name = document.createElement("span");
      const value = document.createElement("b");
      const bar = document.createElement("div");
      const fill = document.createElement("span");
      name.textContent = label;
      value.textContent = `${percent}%`;
      bar.className = "bar";
      fill.style.width = `${percent}%`;
      bar.appendChild(fill);
      row.appendChild(name);
      row.appendChild(value);
      row.appendChild(bar);
      list.appendChild(row);
    }
    allocation.appendChild(title);
    allocation.appendChild(list);
    els.investmentPlan.appendChild(allocation);

    for (const action of data.actions) {
      const item = document.createElement("article");
      item.className = "recommendation-card";
      item.textContent = action;
      els.investmentPlan.appendChild(item);
    }
    renderMarketSuggestions(data.profileName);
  }

  function marketCandidateScore(candidate, profileName, preference) {
    let score = candidate.score;
    if (profileName === "Conservador" && ["growth", "infrastructure"].includes(candidate.style)) score -= 12;
    if (profileName === "Arrojado" && ["growth", "infrastructure"].includes(candidate.style)) score += 8;
    if (preference === "low" && candidate.style === "core") score += 6;
    if (preference === "high" && ["growth", "quality"].includes(candidate.style)) score += 5;
    return score;
  }

  async function refreshMarketQuotes(options = {}) {
    const { state, els, quoteForAsset } = getCtx();
    const normalizedOptions = options && !options.type ? options : {};
    const force = Boolean(normalizedOptions.force);
    const candidates = marketQuoteCandidates();
    if (!candidates.length) {
      renderMarketQuoteStatus();
      return;
    }
    if (!force && !marketQuotesNeedRefresh(candidates)) return;
    if (state.marketQuoteStatus.loading) return;

    state.marketQuoteStatus.loading = true;
    if (els.refreshMarketQuotesBtn) els.refreshMarketQuotesBtn.disabled = true;
    renderMarketQuoteStatus();

    let updated = 0;
    let failed = 0;
    for (const item of candidates) {
      try {
        const quote = await quoteForAsset({ name: item.candidate.ticker, type: item.type });
        if (!quote) {
          failed += 1;
          continue;
        }
        state.marketQuotes[quoteCacheKey(item.kind, item.candidate.ticker)] = {
          ...quote,
          ticker: item.candidate.ticker,
          type: item.type,
        };
        updated += 1;
      } catch {
        failed += 1;
      }
    }

    state.marketQuoteStatus = {
      loading: false,
      updated,
      failed,
      lastUpdatedAt: new Date().toISOString(),
    };
    if (els.refreshMarketQuotesBtn) els.refreshMarketQuotesBtn.disabled = false;
    renderMarketSuggestions(investorProfileName());
    renderMarketQuoteStatus();
  }

  function renderMarketSuggestions(profileName) {
    const { state, els, STOCK_SCREEN_CATALOG, CRYPTO_SCREEN_CATALOG, clearElement, floatToMoney } = getCtx();
    if (!els.marketSuggestions) return;
    clearElement(els.marketSuggestions);
    renderMarketQuoteStatus();
    const groups = [];
    if (state.financialProfile.stockPreference !== "none") {
      groups.push({
        title: "Ações para estudar",
        kind: "stock",
        items: STOCK_SCREEN_CATALOG.map((item) => ({
          ...item,
          finalScore: marketCandidateScore(item, profileName, state.financialProfile.stockPreference),
        }))
          .sort((a, b) => b.finalScore - a.finalScore)
          .slice(0, 5),
      });
    }
    if (state.financialProfile.cryptoPreference !== "none") {
      groups.push({
        title: "Criptos para estudar",
        kind: "crypto",
        items: CRYPTO_SCREEN_CATALOG.map((item) => ({
          ...item,
          finalScore: marketCandidateScore(item, profileName, state.financialProfile.cryptoPreference),
        }))
          .sort((a, b) => b.finalScore - a.finalScore)
          .slice(0, 4),
      });
    }
    if (!groups.length) {
      const empty = document.createElement("p");
      empty.className = "tip";
      empty.textContent = "Ative Acoes ou Criptomoedas no perfil do investidor para ver uma triagem educacional por liquidez, qualidade, diversificacao e risco.";
      els.marketSuggestions.appendChild(empty);
      return;
    }

    for (const group of groups) {
      const section = document.createElement("article");
      const title = document.createElement("strong");
      section.className = "recommendation-card";
      title.textContent = group.title;
      section.appendChild(title);
      for (const candidate of group.items) {
        const row = document.createElement("div");
        const head = document.createElement("div");
        const name = document.createElement("strong");
        const score = document.createElement("span");
        const detail = document.createElement("p");
        const quote = marketQuoteForCandidate(group.kind, candidate);
        head.className = "category-row";
        score.className = "quote-pill";
        name.textContent = `${candidate.ticker} · ${candidate.name}`;
        if (quote) {
          const change = Number(quote.change);
          score.classList.add(Number.isFinite(change) && change < 0 ? "negative" : "positive");
          score.textContent = `${floatToMoney(quote.price)} · ${formatQuoteChange(quote.change)}`;
          detail.textContent = `${candidate.criteria}. Score ${candidate.finalScore}/100. Fonte: ${quote.source}, ${quoteTime(quote.updatedAt)}.`;
        } else {
          score.textContent = `${candidate.finalScore}/100`;
          detail.textContent = `${candidate.criteria}. Cotação externa aguardando atualização.`;
        }
        head.appendChild(name);
        head.appendChild(score);
        row.appendChild(head);
        row.appendChild(detail);
        section.appendChild(row);
      }
      els.marketSuggestions.appendChild(section);
    }
  }

  window.FinaInvestments = {
    normalizeQuoteTicker,
    quoteCacheKey,
    quoteTime,
    formatQuoteChange,
    isQuoteStale,
    marketQuoteForCandidate,
    marketQuoteCandidates,
    marketQuotesNeedRefresh,
    renderMarketQuoteStatus,
    investorProfileName,
    suggestedAllocation,
    normalizeAllocation,
    buildInvestmentRecommendations,
    renderInvestmentAnalysis,
    marketCandidateScore,
    refreshMarketQuotes,
    renderMarketSuggestions,
  };
})();

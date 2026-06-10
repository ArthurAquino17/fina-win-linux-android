(function () {
  function getCtx() {
    return window.FinaRuntime;
  }

  function portfolioTotals() {
    const { state } = getCtx();
    return state.portfolio.reduce(
      (totals, asset) => {
        const quantity = Number(asset.quantity || 0);
        const avgPrice = Number(asset.avgPrice || 0);
        const currentPrice = Number(asset.currentPrice || avgPrice);
        const invested = quantity * avgPrice;
        const current = quantity * currentPrice;
        totals.invested += invested;
        totals.current += current;
        totals.byType.set(asset.type, (totals.byType.get(asset.type) || 0) + current);
        return totals;
      },
      { invested: 0, current: 0, byType: new Map() },
    );
  }

  function portfolioQuoteAssets() {
    const { state } = getCtx();
    return state.portfolio.filter((asset) => ["Ação", "ETF", "FII", "Cripto"].includes(asset.type));
  }

  function portfolioQuotesNeedRefresh() {
    const { isQuoteStale } = getCtx();
    const assets = portfolioQuoteAssets();
    if (!assets.length) return false;
    return assets.some((asset) => isQuoteStale(asset.quoteUpdatedAt));
  }

  function latestPortfolioQuoteAt() {
    return portfolioQuoteAssets()
      .map((asset) => new Date(asset.quoteUpdatedAt).getTime())
      .filter((time) => Number.isFinite(time))
      .sort((a, b) => b - a)[0];
  }

  function renderPortfolioQuoteStatus() {
    const { state, els, quoteTime } = getCtx();
    if (!els.quoteStatusLine) return;
    if (!state.portfolio.length) {
      els.quoteStatusLine.textContent = "Cadastre ativos no portfólio antes de buscar cotações.";
      return;
    }
    if (!portfolioQuoteAssets().length) {
      els.quoteStatusLine.textContent = "Cotações automáticas são usadas para ações, ETFs, FIIs e criptomoedas. Renda fixa permanece manual.";
      return;
    }
    if (state.portfolioQuoteLoading) {
      els.quoteStatusLine.textContent = "Atualizando cotações externas do portfólio...";
      return;
    }
    const latest = latestPortfolioQuoteAt();
    if (latest) {
      els.quoteStatusLine.textContent = `Cotações automáticas ativas. Última atualização: ${quoteTime(latest)}. O preço manual é mantido se a fonte externa falhar.`;
      return;
    }
    els.quoteStatusLine.textContent = "Cotações externas serão buscadas automaticamente. Use o botão para forçar uma nova tentativa.";
  }

  async function refreshPortfolioQuotes(options = {}) {
    const {
      state,
      els,
      quoteForAsset,
      savePortfolioForUser,
      saveLocalSnapshot,
      refreshUI,
    } = getCtx();
    const normalizedOptions = options && !options.type ? options : {};
    const force = Boolean(normalizedOptions.force);
    if (!state.portfolio.length) {
      renderPortfolioQuoteStatus();
      return;
    }
    if (!portfolioQuoteAssets().length) {
      renderPortfolioQuoteStatus();
      return;
    }
    if (!force && !portfolioQuotesNeedRefresh()) {
      renderPortfolioQuoteStatus();
      return;
    }
    if (state.portfolioQuoteLoading) return;

    state.portfolioQuoteLoading = true;
    if (els.refreshQuotesBtn) els.refreshQuotesBtn.disabled = true;
    renderPortfolioQuoteStatus();

    let updated = 0;
    let failed = 0;
    try {
      for (const asset of portfolioQuoteAssets()) {
        try {
          const quote = await quoteForAsset(asset);
          if (!quote) {
            failed += 1;
            continue;
          }
          asset.currentPrice = quote.price;
          asset.quoteChange = quote.change;
          asset.quoteSource = quote.source;
          asset.quoteUpdatedAt = quote.updatedAt;
          updated += 1;
        } catch {
          failed += 1;
        }
      }
    } finally {
      state.portfolioQuoteLoading = false;
      if (els.refreshQuotesBtn) els.refreshQuotesBtn.disabled = false;
    }

    savePortfolioForUser();
    saveLocalSnapshot();
    refreshUI();
    if (els.quoteStatusLine) {
      els.quoteStatusLine.textContent = `Cotações atualizadas: ${updated}. Sem resposta/fallback manual: ${failed}. Última tentativa: ${new Date().toLocaleString("pt-BR")}.`;
    }
  }

  function renderPortfolio() {
    const {
      state,
      els,
      clearElement,
      floatToMoney,
      metricCard,
      savePortfolioForUser,
      saveLocalSnapshot,
      refreshUI,
    } = getCtx();
    if (!els.portfolioSummary || !els.portfolioAllocation || !els.portfolioList) return;
    clearElement(els.portfolioSummary);
    clearElement(els.portfolioAllocation);
    clearElement(els.portfolioList);

    const totals = portfolioTotals();
    const result = totals.current - totals.invested;
    const resultRatio = totals.invested > 0 ? result / totals.invested : 0;

    els.portfolioSummary.appendChild(metricCard("Valor investido", floatToMoney(totals.invested), "Preco medio x quantidade"));
    els.portfolioSummary.appendChild(metricCard("Valor atual", floatToMoney(totals.current), "Preco atual x quantidade"));
    els.portfolioSummary.appendChild(metricCard("Resultado", floatToMoney(result), `${Math.round(resultRatio * 100)}%`));
    els.portfolioSummary.appendChild(metricCard("Ativos", String(state.portfolio.length), "Cadastrados manualmente"));

    if (!state.portfolio.length) {
      const empty = document.createElement("p");
      empty.className = "tip";
      empty.textContent = "Cadastre acoes, criptos, FIIs, ETFs ou renda fixa para acompanhar seu patrimonio.";
      els.portfolioList.appendChild(empty);
      renderPortfolioQuoteStatus();
      return;
    }
    renderPortfolioQuoteStatus();

    for (const [type, value] of Array.from(totals.byType.entries()).sort((a, b) => b[1] - a[1])) {
      const share = totals.current > 0 ? value / totals.current : 0;
      const row = document.createElement("article");
      const head = document.createElement("div");
      const title = document.createElement("strong");
      const amount = document.createElement("span");
      const bar = document.createElement("div");
      const fill = document.createElement("span");
      row.className = "recommendation-card";
      head.className = "category-row";
      bar.className = "bar";
      title.textContent = type;
      amount.textContent = `${floatToMoney(value)} · ${Math.round(share * 100)}%`;
      fill.style.width = `${Math.max(5, Math.min(100, share * 100))}%`;
      bar.appendChild(fill);
      head.appendChild(title);
      head.appendChild(amount);
      row.appendChild(head);
      row.appendChild(bar);
      els.portfolioAllocation.appendChild(row);
    }

    for (const asset of state.portfolio) {
      const quantity = Number(asset.quantity || 0);
      const avgPrice = Number(asset.avgPrice || 0);
      const currentPrice = Number(asset.currentPrice || avgPrice);
      const invested = quantity * avgPrice;
      const current = quantity * currentPrice;
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
      title.textContent = `${asset.name} | ${asset.type}`;
      amount.textContent = floatToMoney(current);
      detail.textContent = `${quantity.toLocaleString("pt-BR")} un. | PM ${floatToMoney(avgPrice)} | Atual ${floatToMoney(currentPrice)} | Resultado ${floatToMoney(current - invested)}`;
      if (asset.quoteSource) {
        detail.textContent += ` | ${asset.quoteSource}${Number.isFinite(Number(asset.quoteChange)) ? ` ${Number(asset.quoteChange).toFixed(2)}%` : ""}`;
      }
      remove.textContent = "Remover";
      remove.addEventListener("click", () => {
        state.portfolio = state.portfolio.filter((item) => item.id !== asset.id);
        savePortfolioForUser();
        saveLocalSnapshot();
        refreshUI();
      });
      head.appendChild(title);
      head.appendChild(amount);
      row.appendChild(head);
      row.appendChild(detail);
      row.appendChild(remove);
      els.portfolioList.appendChild(row);
    }
  }

  function maybeRefreshQuotesForActiveTab() {
    const { state, refreshMarketQuotes } = getCtx();
    if (!state.currentUser) return;
    window.setTimeout(() => {
      if (!state.currentUser) return;
      if (state.activeTab === "investments") {
        refreshMarketQuotes({ silent: true });
      }
      if (state.activeTab === "portfolio") {
        refreshPortfolioQuotes({ silent: true });
      }
    }, 0);
  }

  function stopAutomaticQuoteUpdates() {
    const { state } = getCtx();
    if (state.quoteAutoTimer) {
      window.clearInterval(state.quoteAutoTimer);
      state.quoteAutoTimer = null;
    }
  }

  function startAutomaticQuoteUpdates() {
    const { state, QUOTE_AUTO_REFRESH_MS, refreshMarketQuotes } = getCtx();
    stopAutomaticQuoteUpdates();
    window.setTimeout(() => {
      if (!state.currentUser) return;
      refreshMarketQuotes({ silent: true });
      refreshPortfolioQuotes({ silent: true });
    }, 900);
    state.quoteAutoTimer = window.setInterval(() => {
      if (!state.currentUser) return;
      refreshMarketQuotes({ silent: true });
      refreshPortfolioQuotes({ silent: true });
    }, QUOTE_AUTO_REFRESH_MS);
  }

  window.FinaPortfolio = {
    portfolioTotals,
    portfolioQuoteAssets,
    portfolioQuotesNeedRefresh,
    latestPortfolioQuoteAt,
    renderPortfolioQuoteStatus,
    refreshPortfolioQuotes,
    renderPortfolio,
    maybeRefreshQuotesForActiveTab,
    stopAutomaticQuoteUpdates,
    startAutomaticQuoteUpdates,
  };
})();

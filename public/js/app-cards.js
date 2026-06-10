(function () {
  function getCtx() {
    return window.FinaRuntime;
  }

  function cardKey(card) {
    return String(card.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function findCardByKey(key) {
    const { CREDIT_CARD_CATALOG } = getCtx();
    return CREDIT_CARD_CATALOG.find((card) => cardKey(card) === key) || null;
  }

  function ownedCardKey(card) {
    return `owned-${String(card.id || "").replace(/[^a-zA-Z0-9-]/g, "")}`;
  }

  function findOwnedCardByKey(key) {
    const { state } = getCtx();
    return state.ownedCards.find((card) => ownedCardKey(card) === key) || null;
  }

  function cardFromOwnedCard(card) {
    const { CREDIT_CARD_CATALOG, profileValue } = getCtx();
    const catalog = CREDIT_CARD_CATALOG.find((item) => item.name.toLowerCase() === String(card.name || "").toLowerCase());
    return {
      ...(catalog || {
        name: card.name,
        segment: "custom",
        minIncome: 0,
        minSpend: 0,
        annualFee: "Informada pelo usuario",
        strengths: ["miles"],
        pointsPerDollar: profileValue("milesPerDollar", 1.8),
        dollarRate: profileValue("cardDollarRate", 5.5),
        milesRule: "Cartao cadastrado pelo usuario; ajuste pontos por dolar e dolar usado na calculadora.",
        notes: "Cartao proprio cadastrado manualmente.",
      }),
      name: card.name,
      ownedId: card.id,
      issuer: card.issuer,
      limit: Number(card.limit || 0),
    };
  }

  function rankedCards() {
    const { CREDIT_CARD_CATALOG } = getCtx();
    return CREDIT_CARD_CATALOG.map((card) => ({ ...card, score: scoreCard(card) })).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  }

  function rankedOwnedCards() {
    const { state } = getCtx();
    return state.ownedCards
      .map((card) => {
        const normalized = cardFromOwnedCard(card);
        return { ...normalized, score: scoreCard(normalized) };
      })
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  }

  function selectedCard() {
    const { state } = getCtx();
    const key = state.financialProfile.userCard;
    if (key && key !== "auto") {
      const owned = findOwnedCardByKey(key);
      if (owned) {
        const card = cardFromOwnedCard(owned);
        return { ...card, score: scoreCard(card), automatic: false };
      }
      const explicit = findCardByKey(key);
      if (explicit) return { ...explicit, score: scoreCard(explicit), automatic: false };
    }
    const ownedBest = rankedOwnedCards()[0];
    if (ownedBest) return { ...ownedBest, automatic: true };
    const best = rankedCards()[0];
    return best ? { ...best, automatic: true } : null;
  }

  function populateCardOptions() {
    const { state, els, CREDIT_CARD_CATALOG, clearElement } = getCtx();
    for (const select of [els.userCard, els.milesUserCard]) {
      if (!select) continue;
      const currentValue = select.value || state.financialProfile.userCard || "auto";
      clearElement(select);
      const auto = document.createElement("option");
      auto.value = "auto";
      auto.textContent = "Automático pelo meu perfil";
      if (state.ownedCards.length) auto.textContent = "Automático (prefere meus cartões)";
      select.appendChild(auto);
      for (const card of state.ownedCards) {
        const option = document.createElement("option");
        option.value = ownedCardKey(card);
        option.textContent = `${card.name} (meu cartão)`;
        select.appendChild(option);
      }
      for (const card of CREDIT_CARD_CATALOG) {
        const option = document.createElement("option");
        option.value = cardKey(card);
        option.textContent = card.name;
        select.appendChild(option);
      }
      select.value = findCardByKey(currentValue) || findOwnedCardByKey(currentValue) || currentValue === "auto" ? currentValue : "auto";
    }
    populateExpenseCardOptions();
  }

  function populateExpenseCardOptions() {
    const { state, els, CREDIT_CARD_CATALOG, clearElement } = getCtx();
    if (!els.txCard) return;
    const currentValue = els.txCard.value || "none";
    clearElement(els.txCard);
    const none = document.createElement("option");
    none.value = "none";
    none.textContent = "Nenhum / dinheiro, Pix ou débito";
    els.txCard.appendChild(none);
    for (const card of state.ownedCards) {
      const option = document.createElement("option");
      option.value = ownedCardKey(card);
      option.textContent = `${card.name} (meu cartão)`;
      els.txCard.appendChild(option);
    }
    for (const card of CREDIT_CARD_CATALOG) {
      const option = document.createElement("option");
      option.value = cardKey(card);
      option.textContent = card.name;
      els.txCard.appendChild(option);
    }
    els.txCard.value = currentValue === "none" || findCardByKey(currentValue) || findOwnedCardByKey(currentValue) ? currentValue : "none";
  }

  function populateBudgetCardOptions() {
    const { state, els, CREDIT_CARD_CATALOG, clearElement } = getCtx();
    if (!els.budgetCard) return;
    const currentValue = els.budgetCard.value || "none";
    clearElement(els.budgetCard);
    const none = document.createElement("option");
    none.value = "none";
    none.textContent = "Nenhum";
    els.budgetCard.appendChild(none);
    for (const card of state.ownedCards) {
      const option = document.createElement("option");
      option.value = ownedCardKey(card);
      option.textContent = `${card.name} (meu cartão)`;
      els.budgetCard.appendChild(option);
    }
    for (const card of CREDIT_CARD_CATALOG) {
      const option = document.createElement("option");
      option.value = cardKey(card);
      option.textContent = card.name;
      els.budgetCard.appendChild(option);
    }
    els.budgetCard.value = currentValue === "none" || findCardByKey(currentValue) || findOwnedCardByKey(currentValue) ? currentValue : "none";
  }

  function populateCardNameSuggestions() {
    const { els, CREDIT_CARD_CATALOG, clearElement } = getCtx();
    if (!els.cardNameSuggestions) return;
    clearElement(els.cardNameSuggestions);
    for (const card of CREDIT_CARD_CATALOG) {
      const option = document.createElement("option");
      option.value = card.name;
      els.cardNameSuggestions.appendChild(option);
    }
  }

  function cardLabelFromKey(key) {
    if (!key || key === "none") return "";
    const owned = findOwnedCardByKey(key);
    if (owned) return owned.name;
    const catalog = findCardByKey(key);
    return catalog ? catalog.name : "";
  }

  function cardKeyFromLabel(value) {
    const { state, CREDIT_CARD_CATALOG } = getCtx();
    const label = String(value || "").trim();
    if (!label || label === "none") return "none";
    const owned = state.ownedCards.find((card) => card.name.toLowerCase() === label.toLowerCase());
    if (owned) return ownedCardKey(owned);
    const catalog = CREDIT_CARD_CATALOG.find((card) => card.name.toLowerCase() === label.toLowerCase() || cardKey(card) === label);
    return catalog ? cardKey(catalog) : "none";
  }

  function selectedCardKeyForSpend() {
    const { state } = getCtx();
    const key = state.financialProfile.userCard;
    if (key && key !== "auto" && (findCardByKey(key) || findOwnedCardByKey(key))) return key;
    if (state.ownedCards.length === 1) return ownedCardKey(state.ownedCards[0]);
    return "";
  }

  function cardModelLabel(model) {
    const labels = {
      none: "Sem cartao",
      invoice: "Controlar fatura total",
      category: "Limite por categoria no cartao",
      installments: "Reservar parcelas futuras",
      benefits: "Otimizar milhas/cashback",
    };
    return labels[model] || labels.none;
  }

  function renderOwnedCards() {
    const {
      state,
      els,
      clearElement,
      floatToMoney,
      saveOwnedCardsForUser,
      saveFinancialProfileForUser,
      saveLocalSnapshot,
      refreshUI,
    } = getCtx();
    if (!els.ownedCardList) return;
    clearElement(els.ownedCardList);
    if (!state.ownedCards.length) {
      const empty = document.createElement("p");
      empty.className = "tip";
      empty.textContent = "Cadastre seus cartoes para separar bancos, limites e calculo de milhas.";
      els.ownedCardList.appendChild(empty);
      return;
    }

    for (const card of state.ownedCards) {
      const row = document.createElement("article");
      const head = document.createElement("div");
      const title = document.createElement("strong");
      const limit = document.createElement("span");
      const detail = document.createElement("div");
      const remove = document.createElement("button");
      row.className = "category-item";
      head.className = "category-row";
      detail.className = "tip";
      remove.className = "ghost";
      remove.type = "button";
      title.textContent = card.name;
      limit.textContent = floatToMoney(card.limit || 0);
      detail.textContent = `${card.issuer || "Emissor nao informado"} | vencimento dia ${card.dueDay || 10}`;
      remove.textContent = "Remover";
      remove.addEventListener("click", () => {
        const removedKey = ownedCardKey(card);
        state.ownedCards = state.ownedCards.filter((item) => item.id !== card.id);
        if (state.financialProfile.userCard === removedKey) state.financialProfile.userCard = "auto";
        saveOwnedCardsForUser();
        saveFinancialProfileForUser();
        saveLocalSnapshot();
        populateCardOptions();
        refreshUI();
      });
      head.appendChild(title);
      head.appendChild(limit);
      row.appendChild(head);
      row.appendChild(detail);
      row.appendChild(remove);
      els.ownedCardList.appendChild(row);
    }
  }

  function inferredCardSpend() {
    const { state, currentMonthISO, monthTransactions, profileValue } = getCtx();
    const explicit = profileValue("cardMonthlySpend");
    if (explicit > 0) return explicit;
    const expenses = monthTransactions(state.filters.month || currentMonthISO()).filter((tx) => tx.tx_type === "Despesa");
    const selectedKey = selectedCardKeyForSpend();
    const keyedExpenses = expenses.filter((tx) => tx.cardKey && tx.cardKey !== "none");
    const selectedCardExpenses = selectedKey ? keyedExpenses.filter((tx) => tx.cardKey === selectedKey) : [];
    if (selectedCardExpenses.length) {
      return selectedCardExpenses.reduce((total, tx) => total + Number(tx.amount || 0), 0);
    }
    if (keyedExpenses.length) {
      return keyedExpenses.reduce((total, tx) => total + Number(tx.amount || 0), 0);
    }
    return expenses
      .filter((tx) => {
        const account = state.accounts.find((item) => item.id === tx.accountId);
        return String(account?.name || tx.category || "").toLowerCase().includes("cart");
      })
      .reduce((total, tx) => total + Number(tx.amount || 0), 0);
  }

  function selectedMilesCardKey(card = null) {
    const { state } = getCtx();
    const key = state.financialProfile.userCard;
    if (key && key !== "auto" && (findCardByKey(key) || findOwnedCardByKey(key))) return key;
    if (card?.ownedId) return ownedCardKey({ id: card.ownedId });
    if (card?.name) {
      const catalog = findCardByKey(cardKey(card));
      if (catalog) return cardKey(catalog);
    }
    if (state.ownedCards.length === 1) return ownedCardKey(state.ownedCards[0]);
    return "";
  }

  function milesCardExpenses(card = null) {
    const { state, currentMonthISO, monthTransactions } = getCtx();
    const selectedKey = selectedMilesCardKey(card);
    if (!selectedKey) return [];
    return monthTransactions(state.filters.month || currentMonthISO()).filter((tx) => tx.tx_type === "Despesa" && tx.cardKey === selectedKey);
  }

  function milesCardSpend(card = null) {
    return milesCardExpenses(card).reduce((total, tx) => total + Number(tx.amount || 0), 0);
  }

  function calculateMiles() {
    const { profileValue } = getCtx();
    const card = selectedCard();
    const spend = milesCardSpend(card);
    const spendCount = milesCardExpenses(card).length;
    const selectedKey = selectedMilesCardKey(card);
    const dollarRate = Math.max(0.01, profileValue("cardDollarRate", 5.5));
    const pointsPerDollar = Math.max(0, profileValue("milesPerDollar", 1.8));
    const transferBonus = Math.max(0, profileValue("transferBonus", 0)) / 100;
    const mileValue = Math.max(0, profileValue("mileValue", 20));
    const monthlyPoints = (spend / dollarRate) * pointsPerDollar;
    const monthlyMiles = monthlyPoints * (1 + transferBonus);
    const annualMiles = monthlyMiles * 12;
    const annualValue = (annualMiles / 1000) * mileValue;
    const monthlyValue = annualValue / 12;
    return { card, selectedKey, spend, spendCount, dollarRate, pointsPerDollar, monthlyMiles, annualMiles, monthlyValue, annualValue };
  }

  function monthlyMilesSavings() {
    return calculateMiles().monthlyValue;
  }

  function renderMilesCalculator() {
    const { els, clearElement, floatToMoney, metricCard } = getCtx();
    if (!els.milesResult) return;
    clearElement(els.milesResult);
    const result = calculateMiles();
    if (els.milesCardBadge) {
      els.milesCardBadge.textContent = result.card
        ? result.card.automatic && result.card.ownedId
          ? "melhor cartão salvo"
          : result.card.automatic
            ? "melhor cartão pelo perfil"
            : "cartão selecionado"
        : "sem cartão";
    }
    if (els.milesCardLine) {
      els.milesCardLine.textContent = result.card
        ? `${result.card.name}: ${result.card.milesRule} A base do cálculo é ${floatToMoney(result.spend)} em ${result.spendCount} despesa(s) lançada(s) neste cartão no mês.`
        : "Selecione um cartão e lance despesas usando esse cartão para calcular as milhas.";
    }
    els.milesResult.appendChild(metricCard("Gasto usado", floatToMoney(result.spend), result.spendCount ? "Somente despesas deste cartão" : "Nenhuma despesa neste cartão no mês", { tab: "expenses", targetId: "txCard", label: "Ver despesas do cartão" }));
    els.milesResult.appendChild(metricCard("Cartao", result.card ? result.card.name : "Nao definido", result.card ? result.card.annualFee : "Selecione no perfil", { tab: "cards", targetId: "ownedCardName", label: "Ver cartões completos" }));
    els.milesResult.appendChild(metricCard("Milhas por mes", Math.round(result.monthlyMiles).toLocaleString("pt-BR"), "Com bonus informado", { tab: "education", targetId: "educationSummary", label: "Entender milhas" }));
    els.milesResult.appendChild(metricCard("Economia mensal", floatToMoney(result.monthlyValue), "Valor estimado das milhas", { tab: "education", targetId: "wealthEducation", label: "Ver impacto completo" }));
    els.milesResult.appendChild(metricCard("Milhas por ano", Math.round(result.annualMiles).toLocaleString("pt-BR"), "Estimativa simples", { tab: "education", targetId: "educationModules", label: "Ver estratégia completa" }));
    els.milesResult.appendChild(metricCard("Valor potencial", floatToMoney(result.annualValue), "Pelo valor por 1.000 milhas", { tab: "planning", targetId: "goalName", label: "Usar em metas" }));
  }

  function scoreCard(card) {
    const { state, profileValue, inferredMonthlyIncome } = getCtx();
    const profile = state.financialProfile;
    const spend = inferredCardSpend();
    const income = profileValue("cardMonthlyIncome") || inferredMonthlyIncome();
    let score = 40;
    if (card.strengths.includes(profile.cardBenefitFocus)) score += 28;
    if (profile.cardBenefitFocus === "premium" && card.segment === "premium") score += 10;
    if (profile.cardBenefitFocus === "miles" && card.segment === "airline") score += 12;
    if (profile.cardBenefitFocus === "noFee" && card.strengths.includes("noFee")) score += 16;
    if (profile.cardInternationalUse === "often" && card.strengths.includes("premium")) score += 10;
    if (income >= card.minIncome) score += 10;
    else score -= Math.min(24, ((card.minIncome - income) / Math.max(card.minIncome, 1)) * 24);
    if (spend >= card.minSpend) score += 10;
    else score -= Math.min(20, ((card.minSpend - spend) / Math.max(card.minSpend, 1)) * 20);
    if (spend < 1200 && card.segment === "premium") score -= 12;
    return Math.max(0, Math.round(score));
  }

  function renderCardRecommendations() {
    const { els, clearElement, floatToMoney } = getCtx();
    if (!els.cardRecommendations) return;
    clearElement(els.cardRecommendations);
    const spend = inferredCardSpend();
    const ranked = rankedCards();

    for (const card of ranked.slice(0, 8)) {
      const row = document.createElement("article");
      const head = document.createElement("div");
      const title = document.createElement("strong");
      const score = document.createElement("span");
      const details = document.createElement("p");
      const tags = document.createElement("div");
      row.className = "recommendation-card";
      head.className = "category-row";
      tags.className = "tag-row";
      title.textContent = card.name;
      score.textContent = `${card.score}/100`;
      details.textContent = `${card.notes} Anuidade: ${card.annualFee}. Gasto analisado: ${floatToMoney(spend)}.`;
      for (const strength of card.strengths) {
        const tag = document.createElement("span");
        tag.className = "badge";
        tag.textContent = strength === "noFee" ? "sem anuidade" : strength;
        tags.appendChild(tag);
      }
      head.appendChild(title);
      head.appendChild(score);
      row.appendChild(head);
      row.appendChild(details);
      row.appendChild(tags);
      els.cardRecommendations.appendChild(row);
    }
  }

  function applySelectedCardMilesDefaults() {
    const { state, els } = getCtx();
    const card = selectedCard();
    if (!card) return;
    state.financialProfile = {
      ...state.financialProfile,
      milesPerDollar: Number(card.pointsPerDollar || 0),
      cardDollarRate: Number(card.dollarRate || state.financialProfile.cardDollarRate || 5.5),
    };
    if (els.milesPerDollar) els.milesPerDollar.value = String(state.financialProfile.milesPerDollar);
    if (els.cardDollarRate) els.cardDollarRate.value = String(state.financialProfile.cardDollarRate).replace(".", ",");
  }

  window.FinaCards = {
    cardKey,
    findCardByKey,
    ownedCardKey,
    findOwnedCardByKey,
    cardFromOwnedCard,
    rankedCards,
    rankedOwnedCards,
    selectedCard,
    populateCardOptions,
    populateExpenseCardOptions,
    populateBudgetCardOptions,
    populateCardNameSuggestions,
    cardLabelFromKey,
    cardKeyFromLabel,
    selectedCardKeyForSpend,
    cardModelLabel,
    renderOwnedCards,
    inferredCardSpend,
    selectedMilesCardKey,
    milesCardExpenses,
    milesCardSpend,
    calculateMiles,
    monthlyMilesSavings,
    renderMilesCalculator,
    scoreCard,
    renderCardRecommendations,
    applySelectedCardMilesDefaults,
  };
})();

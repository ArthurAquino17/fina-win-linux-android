(function () {
  function getCtx() {
    return window.FinaRuntime;
  }

  function futureValue(monthlyContribution, months, annualRate) {
    const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;
    if (monthlyContribution <= 0 || months <= 0) return 0;
    if (monthlyRate <= 0) return monthlyContribution * months;
    return monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  }

  function recommendationArticle(titleText, bodyText, tags = [], action = null) {
    const { createInfoButton, inferInfoAction } = getCtx();
    const article = document.createElement("article");
    const title = document.createElement("strong");
    const body = document.createElement("p");
    const tagRow = document.createElement("div");
    article.className = "recommendation-card";
    title.textContent = titleText;
    body.textContent = bodyText;
    tagRow.className = "tag-row";
    article.appendChild(title);
    article.appendChild(body);
    for (const tagText of tags) {
      const tag = document.createElement("span");
      tag.textContent = tagText;
      tagRow.appendChild(tag);
    }
    if (tags.length) article.appendChild(tagRow);
    article.appendChild(createInfoButton(action || inferInfoAction(`${titleText} ${bodyText} ${tags.join(" ")}`)));
    return article;
  }

  function buildEducationData() {
    const {
      state,
      currentMonthISO,
      monthTransactions,
      summary,
      inferredMonthlyIncome,
      calculateMiles,
      monthlyMilesSavings,
      categoryTotals,
      recurringTotalByType,
      budgetUsage,
      profileValue,
      portfolioTotals,
      buildInvestmentRecommendations,
      rankedCards,
      selectedCard,
      STOCK_SCREEN_CATALOG,
      CRYPTO_SCREEN_CATALOG,
    } = getCtx();
    const selectedMonth = state.filters.month || currentMonthISO();
    const monthRows = monthTransactions(selectedMonth);
    const totals = summary(monthRows);
    const allTotals = summary(state.transactions);
    const income = totals.Receita || inferredMonthlyIncome();
    const expense = totals.Despesa;
    const rawBalance = totals.Saldo;
    const miles = calculateMiles();
    const milesSavings = monthlyMilesSavings();
    const economicBalance = rawBalance + milesSavings;
    const expenseRatio = income > 0 ? expense / income : 0;
    const savingsRatio = income > 0 ? economicBalance / income : 0;
    const categories = categoryTotals(monthRows);
    const topCategory = categories[0];
    const cardSpend = miles.spend;
    const cardShare = expense > 0 ? cardSpend / expense : 0;
    const recurringExpenses = recurringTotalByType("Despesa");
    const recurringShare = income > 0 ? recurringExpenses / income : 0;
    const overBudget = budgetUsage(monthRows).filter((item) => item.limit > 0 && item.usage > 1);
    const variableSavings = categories
      .filter((item) => !["Moradia", "Saude", "Impostos", "Investimento"].includes(item.category))
      .slice(0, 3)
      .reduce((total, item) => total + item.total * 0.08, 0);
    const recurringSavings = recurringExpenses * 0.05;
    const potentialSavings = Math.max(0, variableSavings + recurringSavings);
    const monthlyInvestment = profileValue("monthlyInvestment");
    const investableNow = Math.max(0, economicBalance);
    const patrimonyContribution = Math.max(monthlyInvestment, investableNow + potentialSavings);
    const portfolio = portfolioTotals();
    const investment = buildInvestmentRecommendations();
    const bestCard = rankedCards()[0] || selectedCard();
    const marketStock = STOCK_SCREEN_CATALOG.slice().sort((a, b) => b.score - a.score)[0];
    const marketCrypto = CRYPTO_SCREEN_CATALOG.slice().sort((a, b) => b.score - a.score)[0];

    return {
      selectedMonth,
      totals,
      allTotals,
      income,
      expense,
      rawBalance,
      miles,
      milesSavings,
      economicBalance,
      expenseRatio,
      savingsRatio,
      categories,
      topCategory,
      cardSpend,
      cardShare,
      recurringExpenses,
      recurringShare,
      overBudget,
      potentialSavings,
      patrimonyContribution,
      portfolio,
      investment,
      bestCard,
      marketStock,
      marketCrypto,
    };
  }

  function buildEducationModules(data) {
    const { floatToMoney } = getCtx();
    const modules = [];
    modules.push({
      title: "1. Fundamentos: renda, gasto e caixa",
      body:
        data.income > 0
          ? `Sua despesa consome ${Math.round(data.expenseRatio * 100)}% da renda no mes. A leitura basica e separar primeiro contas essenciais, depois metas, e so entao consumo variavel.`
          : "Comece registrando receitas. Sem renda cadastrada, o app nao consegue medir taxa de gasto, capacidade de aporte e margem de seguranca.",
      tags: ["receitas", "despesas", "saldo"],
      action: { url: "https://www.bcb.gov.br/cidadaniafinanceira", label: "Abrir guia do Banco Central" },
    });
    modules.push({
      title: "2. Gastos: onde cortar sem perder controle",
      body: data.topCategory
        ? `${data.topCategory.category} e sua maior categoria, com ${floatToMoney(data.topCategory.total)}. Um corte de 8% nas maiores categorias variaveis aponta potencial mensal de ${floatToMoney(data.potentialSavings)}.`
        : "Cadastre despesas por categoria para enxergar concentracao e descobrir quais cortes geram resultado real.",
      tags: ["orcamento", "categorias", "limites"],
      action: { tab: "expenses", targetId: "txDescription", label: "Ver despesas completas" },
    });
    modules.push({
      title: "3. Cartao e milhas: concentrar com regra",
      body:
        data.cardSpend > 0
          ? `Hoje o calculo usa ${floatToMoney(data.cardSpend)} no cartao, equivalente a ${Math.round(data.cardShare * 100)}% das despesas. Centralizar gastos planejados pode aumentar milhas, mas gastos parcelados e juros anulam o beneficio.`
          : "Para usar milhas de forma inteligente, concentre apenas gastos que ja seriam feitos, pague a fatura integral e cadastre o cartao correto na aba Cartoes.",
      tags: ["cartao", "milhas", "fatura integral"],
      action: { tab: "miles", targetId: "milesUserCard", label: "Abrir calculadora completa" },
    });
    modules.push({
      title: "4. Investimentos: ordem de prioridade",
      body: `Seu perfil atual e ${data.investment.profileName}. Antes de renda variavel, confira reserva de emergencia, prazo do objetivo, diversificacao e liquidez. A reserva alvo estimada e ${floatToMoney(data.investment.reserveTarget)}.`,
      tags: ["reserva", "risco", "diversificacao"],
      action: { url: "https://www.gov.br/cvm/pt-br/assuntos/educacao", label: "Abrir educação da CVM" },
    });
    modules.push({
      title: "5. Crescimento patrimonial",
      body: `Usando aporte mensal de referencia de ${floatToMoney(data.patrimonyContribution)}, a diferenca vem de constancia, reinvestimento e controle de perdas. O patrimonio cresce melhor quando economia vira aporte automatico.`,
      tags: ["aportes", "juros compostos", "patrimonio"],
      action: { tab: "investments", targetId: "monthlyInvestment", label: "Ver plano de aportes" },
    });
    modules.push({
      title: "6. Indicadores de mercado",
      body: "Acompanhe Selic/CDI para renda fixa, IPCA para inflacao, dolar para ativos globais, Ibovespa para bolsa local, S&P 500 para exterior e BTC/ETH para cripto. Use esses dados como contexto, nao como ordem de compra.",
      tags: ["Selic", "IPCA", "dolar", "Ibovespa"],
      action: { url: "https://borainvestir.b3.com.br/", label: "Abrir conteúdos da B3" },
    });
    if (data.overBudget.length) {
      modules.push({
        title: "7. Alerta de orcamento",
        body: `${data.overBudget[0].category} passou ${floatToMoney(data.overBudget[0].total - data.overBudget[0].limit)} do limite. Revise os ultimos lancamentos antes de aumentar investimentos ou compras no cartao.`,
        tags: ["alerta", "limite", "prioridade"],
        action: { tab: "planning", targetId: "budgetLimit", label: "Ver orçamento completo" },
      });
    }
    return modules;
  }

  function renderEducation() {
    const { els, clearElement, floatToMoney, metricCard } = getCtx();
    if (!els.educationSummary || !els.educationModules || !els.wealthEducation || !els.marketEducation) return;
    clearElement(els.educationSummary);
    clearElement(els.educationModules);
    clearElement(els.wealthEducation);
    clearElement(els.marketEducation);

    const data = buildEducationData();
    const oneYear = futureValue(data.patrimonyContribution, 12, 0.08);
    const fiveYears = futureValue(data.patrimonyContribution, 60, 0.08);
    const conservative = futureValue(data.patrimonyContribution, 60, 0.06);
    const growth = futureValue(data.patrimonyContribution, 60, 0.12);
    const bestCardName = data.bestCard ? data.bestCard.name : "Nao definido";

    els.educationSummary.appendChild(metricCard("Mes analisado", data.selectedMonth, "Filtro atual"));
    els.educationSummary.appendChild(metricCard("Taxa de gasto", `${Math.round(data.expenseRatio * 100)}%`, "Despesas / receitas"));
    els.educationSummary.appendChild(metricCard("Economia economica", `${Math.round(data.savingsRatio * 100)}%`, "Saldo + milhas"));
    els.educationSummary.appendChild(metricCard("Potencial de corte", floatToMoney(data.potentialSavings), "8% variaveis + 5% fixos"));
    els.educationSummary.appendChild(metricCard("Milhas estimadas", floatToMoney(data.milesSavings), `${Math.round(data.miles.monthlyMiles).toLocaleString("pt-BR")} milhas/mes`));
    els.educationSummary.appendChild(metricCard("Cartao indicado", bestCardName, data.bestCard ? `${data.bestCard.score || 0}/100` : "Complete o perfil"));

    for (const module of buildEducationModules(data)) {
      els.educationModules.appendChild(recommendationArticle(module.title, module.body, module.tags, module.action));
    }

    els.wealthEducation.appendChild(
      recommendationArticle(
        "Simulacao de patrimonio",
        `Com ${floatToMoney(data.patrimonyContribution)} por mes, uma taxa educacional de 8% ao ano projetaria ${floatToMoney(oneYear)} em 12 meses e ${floatToMoney(fiveYears)} em 5 anos, antes de impostos e custos.`,
        ["simulacao", "juros compostos"],
        { tab: "investments", targetId: "monthlyInvestment", label: "Ajustar aporte" },
      ),
    );
    els.wealthEducation.appendChild(
      recommendationArticle(
        "Cenarios de retorno",
        `No mesmo aporte por 5 anos, um cenario de 6% ao ano daria ${floatToMoney(conservative)}; em 12% ao ano, ${floatToMoney(growth)}. Retorno maior normalmente vem com oscilacao e risco maiores.`,
        ["risco", "retorno", "prazo"],
        { url: "https://www.gov.br/cvm/pt-br/assuntos/educacao", label: "Abrir guia da CVM" },
      ),
    );
    els.wealthEducation.appendChild(
      recommendationArticle(
        "Carteira e concentracao",
        data.portfolio.current > 0
          ? `Seu portfolio atual soma ${floatToMoney(data.portfolio.current)}. Compare a distribuicao por tipo com sua carteira sugerida e evite depender de uma unica empresa, cripto, setor ou emissor.`
          : "Cadastre ativos na aba Portfolio para comparar seu patrimonio real com a carteira sugerida pelo perfil.",
        ["portfolio", "diversificacao"],
        { tab: "portfolio", targetId: "portfolioAssetName", label: "Abrir portfólio completo" },
      ),
    );

    els.marketEducation.appendChild(
      recommendationArticle(
        "Renda fixa e inflacao",
        "Selic e CDI ajudam a comparar investimentos pos-fixados. IPCA mostra perda de poder de compra; retorno real e o retorno acima da inflacao.",
        ["Selic", "CDI", "IPCA"],
        { url: "https://www.bcb.gov.br/cidadaniafinanceira", label: "Abrir Banco Central" },
      ),
    );
    els.marketEducation.appendChild(
      recommendationArticle(
        "Bolsa e acoes",
        data.marketStock
          ? `${data.marketStock.ticker} aparece como estudo de alta liquidez no catalogo local. Analise lucro, divida, governanca, setor, preco e concentracao antes de comprar.`
          : "Para acoes, acompanhe lucro, caixa, divida, setor, margem, dividendos e valuation. Evite decidir apenas por noticia ou rentabilidade passada.",
        ["acoes", "liquidez", "valuation"],
        { url: "https://www.gov.br/cvm/pt-br/assuntos/educacao", label: "Abrir educação da CVM" },
      ),
    );
    els.marketEducation.appendChild(
      recommendationArticle(
        "Criptomoedas",
        data.marketCrypto
          ? `${data.marketCrypto.ticker} aparece como cripto de referencia para estudo. Em cripto, limite exposicao, proteja custodia e nao use reserva de emergencia.`
          : "Em cripto, priorize liquidez, seguranca, tese de uso, custodia e tamanho pequeno na carteira.",
        ["cripto", "volatilidade", "custodia"],
        { url: "https://borainvestir.b3.com.br/", label: "Abrir conteúdos da B3" },
      ),
    );
  }

  window.FinaEducation = {
    futureValue,
    recommendationArticle,
    buildEducationData,
    buildEducationModules,
    renderEducation,
  };
})();

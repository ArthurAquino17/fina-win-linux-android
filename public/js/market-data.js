(function () {
  const QUOTE_SOURCES = {
    brapiBase: "https://brapi.dev/api/quote",
    coingeckoBase: "https://api.coingecko.com/api/v3/simple/price",
    binanceTickerBase: "https://api.binance.com/api/v3/ticker/24hr",
  };

  const CRYPTO_IDS = {
    BTC: "bitcoin",
    ETH: "ethereum",
    SOL: "solana",
    BNB: "binancecoin",
    XRP: "ripple",
    ADA: "cardano",
    LINK: "chainlink",
    MATIC: "matic-network",
    USDT: "tether",
    USDC: "usd-coin",
  };

  const CRYPTO_BRL_SYMBOLS = {
    BTC: "BTCBRL",
    ETH: "ETHBRL",
    SOL: "SOLBRL",
    LINK: "LINKBRL",
    USDC: "USDCBRL",
  };

  const STOCK_SCREEN_CATALOG = [
    { ticker: "PETR4", name: "Petrobras PN", style: "value", score: 88, criteria: "liquidez alta, geracao de caixa e peso relevante no mercado brasileiro" },
    { ticker: "VALE3", name: "Vale ON", style: "value", score: 86, criteria: "liquidez alta, exportadora global e forte geracao operacional" },
    { ticker: "ITUB4", name: "Itau Unibanco PN", style: "quality", score: 84, criteria: "banco grande, historico de lucro e eficiencia operacional" },
    { ticker: "BBAS3", name: "Banco do Brasil ON", style: "income", score: 82, criteria: "lucro recorrente, dividendos e valuation historicamente competitivo" },
    { ticker: "WEGE3", name: "WEG ON", style: "growth", score: 80, criteria: "qualidade operacional, crescimento e exposicao global" },
    { ticker: "B3SA3", name: "B3 ON", style: "quality", score: 76, criteria: "infraestrutura de mercado, margens altas e baixa alavancagem operacional" },
    { ticker: "TAEE11", name: "Taesa Unit", style: "income", score: 74, criteria: "receita regulada e historico de dividendos" },
    { ticker: "IVVB11", name: "ETF S&P 500", style: "diversificacao", score: 78, criteria: "diversificacao internacional via ETF negociado na B3" },
  ];

  const CRYPTO_SCREEN_CATALOG = [
    { ticker: "BTC", name: "Bitcoin", style: "core", score: 92, criteria: "maior capitalizacao, liquidez global e tese de reserva digital" },
    { ticker: "ETH", name: "Ethereum", style: "core", score: 88, criteria: "ecossistema amplo de contratos inteligentes e alta liquidez" },
    { ticker: "SOL", name: "Solana", style: "growth", score: 76, criteria: "rede de alta atividade, maior risco e maior volatilidade" },
    { ticker: "LINK", name: "Chainlink", style: "infrastructure", score: 72, criteria: "infraestrutura de oraculos, uso em DeFi e risco de altcoin" },
    { ticker: "USDC", name: "USD Coin", style: "stable", score: 68, criteria: "stablecoin para caixa em dolar, nao substitui renda fixa e tem risco de emissor" },
  ];

  function normalizeTicker(value) {
    return String(value || "").trim().toUpperCase().replace(/\s+/g, "");
  }

  function cryptoIdForTicker(ticker) {
    return CRYPTO_IDS[normalizeTicker(ticker).replace(/[-/].*$/, "")] || "";
  }

  function binanceSymbolForTicker(ticker) {
    return CRYPTO_BRL_SYMBOLS[normalizeTicker(ticker).replace(/[-/].*$/, "")] || "";
  }

  async function fetchBinanceCryptoQuote(asset) {
    const symbol = binanceSymbolForTicker(asset.name);
    if (!symbol) return null;
    const response = await fetch(`${QUOTE_SOURCES.binanceTickerBase}?symbol=${encodeURIComponent(symbol)}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Binance ${response.status}`);
    const data = await response.json();
    const price = Number(data.lastPrice);
    if (!Number.isFinite(price)) return null;
    return {
      price,
      change: Number(data.priceChangePercent || 0),
      source: "Binance",
      updatedAt: data.closeTime ? new Date(Number(data.closeTime)).toISOString() : new Date().toISOString(),
    };
  }

  async function fetchCoinGeckoCryptoQuote(asset) {
    const id = cryptoIdForTicker(asset.name);
    if (!id) return null;
    const url = `${QUOTE_SOURCES.coingeckoBase}?ids=${encodeURIComponent(id)}&vs_currencies=brl&include_24hr_change=true&include_last_updated_at=true`;
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`CoinGecko ${response.status}`);
    const data = await response.json();
    const quote = data[id];
    if (!quote || !Number.isFinite(Number(quote.brl))) return null;
    return {
      price: Number(quote.brl),
      change: Number(quote.brl_24h_change || 0),
      source: "CoinGecko",
      updatedAt: quote.last_updated_at ? new Date(Number(quote.last_updated_at) * 1000).toISOString() : new Date().toISOString(),
    };
  }

  async function fetchCryptoQuote(asset) {
    try {
      const binanceQuote = await fetchBinanceCryptoQuote(asset);
      if (binanceQuote) return binanceQuote;
    } catch {
      // CoinGecko is kept as a fallback when Binance is unavailable or lacks the pair.
    }
    return fetchCoinGeckoCryptoQuote(asset);
  }

  async function fetchBrapiQuote(asset) {
    const ticker = normalizeTicker(asset.name).replace(/\.SA$/, "");
    if (!ticker) return null;
    const response = await fetch(`${QUOTE_SOURCES.brapiBase}/${encodeURIComponent(ticker)}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`brapi ${response.status}`);
    const data = await response.json();
    const result = Array.isArray(data.results) ? data.results[0] : null;
    const price = Number(result?.regularMarketPrice);
    if (!Number.isFinite(price)) return null;
    return {
      price,
      change: Number(result?.regularMarketChangePercent || 0),
      source: "brapi",
      updatedAt: result?.regularMarketTime ? new Date(result.regularMarketTime).toISOString() : new Date().toISOString(),
    };
  }

  async function quoteForAsset(asset) {
    if (asset.type === "Cripto") return fetchCryptoQuote(asset);
    if (["Ação", "ETF", "FII"].includes(asset.type)) return fetchBrapiQuote(asset);
    return null;
  }

  window.FinaMarketData = {
    STOCK_SCREEN_CATALOG,
    CRYPTO_SCREEN_CATALOG,
    quoteForAsset,
  };
})();

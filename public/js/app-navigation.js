(function () {
  function getCtx() {
    return window.FinaRuntime;
  }

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

  function refreshUI(...args) {
    return getCtx().refreshUI(...args);
  }

  function maybeRefreshQuotesForActiveTab(...args) {
    return getCtx().maybeRefreshQuotesForActiveTab(...args);
  }

function transactionTypeForTab(tabName = state.activeTab) {
  if (tabName === "income") return "Receita";
  if (tabName === "expenses") return "Despesa";
  return "";
}

function syncTransactionTypeForActiveTab() {
  const type = transactionTypeForTab();
  if (type && els.txType) els.txType.value = type;
}

function setFunctionMenuVisible(visible) {
  if (!els.functionMenuGrid || !els.toggleFunctionsBtn) return;
  els.functionMenuGrid.hidden = !visible;
  els.toggleFunctionsBtn.setAttribute("aria-expanded", String(visible));
  els.toggleFunctionsBtn.textContent = visible ? "Ocultar funções" : "Funções do app";
}

function switchTab(tabName) {
  state.activeTab = tabName;
  if (tabName === "overview") setFunctionMenuVisible(false);
  document.querySelectorAll("[data-tab]").forEach((element) => {
    const tabs = String(element.dataset.tab || "").split(/\s+/);
    element.classList.toggle("tab-hidden", !tabs.includes(tabName));
  });
  document.querySelectorAll("[data-tab-button]").forEach((button) => {
    button.classList.toggle("active", button.dataset.tabButton === tabName);
  });
  syncTransactionTypeForActiveTab();
  if (state.currentUser) {
    refreshUI();
    maybeRefreshQuotesForActiveTab();
  }
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

function goToAppInfo(tabName, targetId = "") {
  switchTab(tabName);
  const target = targetId ? document.getElementById(targetId) : document.querySelector(`[data-tab="${tabName}"]`);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    if (typeof target.focus === "function" && ["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(target.tagName)) {
      window.setTimeout(() => target.focus(), 180);
    }
  }
}

function createInfoButton(action = {}) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "secondary info-action";
  button.textContent = action.label || "Ver informações completas";
  if (action.url) {
    button.addEventListener("click", () => {
      window.open(action.url, "_blank", "noopener,noreferrer");
    });
    return button;
  }
  button.addEventListener("click", () => goToAppInfo(action.tab || "education", action.targetId || ""));
  return button;
}

function inferInfoAction(text) {
  const content = String(text || "").toLowerCase();
  if (content.includes("milha") || content.includes("ponto") || content.includes("cartao") || content.includes("cartão") || content.includes("fatura")) {
    return { tab: "miles", targetId: "milesUserCard" };
  }
  if (content.includes("receita") || content.includes("renda") || content.includes("salario") || content.includes("salário")) {
    return { tab: "income", targetId: "incomeDescription" };
  }
  if (content.includes("orcamento") || content.includes("orçamento") || content.includes("limite") || content.includes("meta") || content.includes("reserva")) {
    return { tab: "planning", targetId: "budgetLimit" };
  }
  if (content.includes("invest") || content.includes("aporte") || content.includes("cripto") || content.includes("acoes") || content.includes("ações")) {
    return { tab: "investments", targetId: "investorHorizon" };
  }
  if (content.includes("recorrente") || content.includes("fixo") || content.includes("assinatura") || content.includes("parcel")) {
    return { tab: "automation", targetId: "recurringDescription" };
  }
  if (content.includes("categoria") || content.includes("gasto") || content.includes("despesa")) {
    return { tab: "expenses", targetId: "txDescription" };
  }
  return { tab: "reports", targetId: "categoryChart" };
}

function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

  window.FinaNavigation = {
    transactionTypeForTab,
    syncTransactionTypeForActiveTab,
    setFunctionMenuVisible,
    switchTab,
    initTabs,
    goToAppInfo,
    createInfoButton,
    inferInfoAction,
    clearElement,
  };
})();

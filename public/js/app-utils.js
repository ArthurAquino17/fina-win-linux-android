(function () {
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

  window.FinaUtils = {
    uuid,
    todayISO,
    currentMonthISO,
    addMonths,
    previousMonthISO,
    moneyToFloat,
    floatToMoney,
    storageKeyForUser,
    normalizeEmail,
    hashPassword,
    safeJsonParse,
  };
})();

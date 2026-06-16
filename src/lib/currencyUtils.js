const CURRENCY_SYMBOLS = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

export const DEFAULT_USD_RATE =
  parseFloat(process.env.NEXT_PUBLIC_INR_TO_USD_RATE || "83") || 83;

export function getCurrencyCode(source) {
  if (!source) return "INR";
  if (typeof source === "string") {
    return source.trim().toUpperCase() || "INR";
  }
  const code = source.currency || source.currency_code;
  return code ? String(code).trim().toUpperCase() : "INR";
}

export function getCurrencySymbol(currency) {
  if (typeof currency === "object" && currency?.currency_symbol) {
    return currency.currency_symbol;
  }
  const code = getCurrencyCode(currency);
  return CURRENCY_SYMBOLS[code] || `${code} `;
}

export function parsePrice(value) {
  if (value == null || value === "") return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const cleaned = String(value).replace(/[₹$€£,\s]/g, "");
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : 0;
}

export function formatPrice(amount, currency = "INR", options = {}) {
  const code = getCurrencyCode(currency);
  const symbol = getCurrencySymbol(currency);
  const num = parsePrice(amount);

  let decimals = options.decimals;
  if (decimals === undefined || decimals === "auto") {
    if (options.round) {
      decimals = code === "USD" ? 2 : 0;
    } else {
      decimals = code === "INR" ? (num % 1 === 0 ? 0 : 2) : 2;
    }
  }

  const formatted = num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${symbol}${formatted}`;
}

export function formatDailyPrice(amount, days, currency = "INR") {
  const dayCount = parsePrice(days);
  if (!dayCount || dayCount <= 0) return "";
  const daily = parsePrice(amount) / dayCount;
  return `${formatPrice(daily, currency)}/day`;
}

function inferPlanBaseCurrency(plan, courseCurrency = "INR") {
  return getCurrencyCode(plan?.currency || courseCurrency || "INR");
}

/**
 * Resolve plan prices for the user's selected currency.
 * - `price` / `original_price` are treated as INR by default (existing data).
 * - Optional `price_usd` / `original_price_usd` override USD amounts.
 * - Missing USD values are derived from INR using DEFAULT_USD_RATE.
 */
export function getPlanPriceFields(
  plan,
  selectedCurrency = "INR",
  courseCurrency = "INR",
  exchangeRate = DEFAULT_USD_RATE
) {
  const selected = getCurrencyCode(selectedCurrency);
  const base = inferPlanBaseCurrency(plan, courseCurrency);
  const rate = exchangeRate > 0 ? exchangeRate : DEFAULT_USD_RATE;

  let inrPrice =
    plan?.price_inr != null
      ? parsePrice(plan.price_inr)
      : base === "INR"
        ? parsePrice(plan?.price)
        : 0;
  let inrOriginal =
    plan?.original_price_inr != null
      ? parsePrice(plan.original_price_inr)
      : base === "INR"
        ? parsePrice(plan?.original_price)
        : 0;

  let usdPrice =
    plan?.price_usd != null
      ? parsePrice(plan.price_usd)
      : base === "USD"
        ? parsePrice(plan?.price)
        : 0;
  let usdOriginal =
    plan?.original_price_usd != null
      ? parsePrice(plan.original_price_usd)
      : base === "USD"
        ? parsePrice(plan?.original_price)
        : 0;

  if (!usdPrice && inrPrice > 0) {
    usdPrice = Math.round((inrPrice / rate) * 100) / 100;
  }
  if (!usdOriginal && inrOriginal > 0) {
    usdOriginal = Math.round((inrOriginal / rate) * 100) / 100;
  }
  if (!inrPrice && usdPrice > 0) {
    inrPrice = Math.round(usdPrice * rate);
  }
  if (!inrOriginal && usdOriginal > 0) {
    inrOriginal = Math.round(usdOriginal * rate);
  }

  if (selected === "USD") {
    return { price: usdPrice, original_price: usdOriginal, currency: "USD" };
  }
  return { price: inrPrice, original_price: inrOriginal, currency: "INR" };
}

/** @deprecated Use getPlanPriceFields with selected currency instead */
export function resolvePlanCurrency(plan, courseCurrency) {
  return getCurrencyCode(plan?.currency || courseCurrency || "INR");
}

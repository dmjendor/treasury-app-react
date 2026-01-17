export function normalizeCode(code) {
  return String(code ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

export function formatRate(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value)))
    return "";
  const num = Number(value);
  return Number.isInteger(num) ? String(num) : String(num);
}

export function findBaseCurrency(currencies) {
  return (currencies ?? []).find((c) => Number(c.multiplier) === 1);
}

export function findCommonCurrency(currencies, commonCurrencyId) {
  if (commonCurrencyId == null) return undefined;
  const target = String(commonCurrencyId);
  return (currencies ?? []).find((c) => String(c.id) === target);
}

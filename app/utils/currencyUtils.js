// app/currencies/currencyUtils.js
"use client";

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

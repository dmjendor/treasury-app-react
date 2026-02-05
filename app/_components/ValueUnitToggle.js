// app/_components/ValueUnitToggle.js
"use client";

import React from "react";
import Toggle from "@/app/_components/Toggle";
import { useOptionalVault } from "@/app/_context/VaultProvider";
import { useValueUnit } from "@/app/_context/ValueUnitProvider";

/**
 * Render a value unit toggle for vault details.
 * @param {{ label?: string, vault?: any }} props
 * @returns {JSX.Element}
 */
export default function ValueUnitToggle({ label = "", vault: vaultProp }) {
  const { valueUnit, setValueUnit } = useValueUnit();
  const optionalVault = useOptionalVault();
  const vault = vaultProp ?? optionalVault?.vault ?? null;
  const isBase = valueUnit === "base";
  const currencyCount = Array.isArray(vault?.currencyList)
    ? vault.currencyList.length
    : 0;

  if (currencyCount <= 1) return null;

  const baseLabel = findCurrencyLabel(
    vault?.currencyList,
    vault?.base_currency_id,
    "Base",
  );
  const commonLabel = findCurrencyLabel(
    vault?.currencyList,
    vault?.common_currency_id,
    "Common",
  );
  const displayLabel = isBase ? baseLabel : commonLabel;
  const labelText = label ? `${label}${displayLabel}` : displayLabel;
  return (
    <Toggle
      name="valueUnit"
      hint={`${commonLabel} / ${baseLabel}`}
      label={labelText}
      checked={isBase}
      onChange={(e) => setValueUnit(e.target.checked ? "base" : "common")}
      className="rounded-xl border border-border bg-primary-700 px-3 py-2 text-primary-200"
    />
  );
}

function findCurrencyLabel(currencies, currencyId, fallbackLabel) {
  const list = Array.isArray(currencies) ? currencies : [];
  const match = list.find((c) => String(c.id) === String(currencyId));
  return match?.name || fallbackLabel;
}

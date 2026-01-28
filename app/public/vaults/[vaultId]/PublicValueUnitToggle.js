// app/public/vaults/[vaultId]/PublicValueUnitToggle.js
"use client";

import React from "react";
import Toggle from "@/app/_components/Toggle";
import { usePublicValueUnit } from "@/app/public/vaults/[vaultId]/PublicValueUnitProvider";

/**
 * Render a value unit toggle for public vault details.
 * @param {{ commonLabel?: string, baseLabel?: string }} props
 * @returns {JSX.Element}
 */
export default function PublicValueUnitToggle({
  commonLabel = "Common",
  baseLabel = "Base",
  label = "",
}) {
  const { valueUnit, setValueUnit } = usePublicValueUnit();
  const isBase = valueUnit === "base";
  return (
    <Toggle
      name="publicValueUnit"
      hint={`${commonLabel} / ${baseLabel}`}
      label={`${label} ${isBase ? baseLabel : commonLabel}`}
      checked={isBase}
      onChange={(e) => setValueUnit(e.target.checked ? "base" : "common")}
      className="rounded-xl border border-border bg-primary-700 px-3 py-2 text-primary-200"
    />
  );
}

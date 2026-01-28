// app/_components/HoldingsFormClient.js
"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import InputComponent from "@/app/_components/InputComponent";
import { Button } from "@/app/_components/Button";
import { LinkButton } from "@/app/_components/LinkButton";
import { createHoldingsEntryAction } from "@/app/_lib/actions/holdings";
import { useGlobalUI } from "@/app/_context/GlobalUIProvider";
import { useVault } from "@/app/_context/VaultProvider";
import { normalizeCode } from "@/app/utils/currencyUtils";

function sortByRate(a, b) {
  const left = Number(a?.rate);
  const right = Number(b?.rate);
  const leftSafe = Number.isFinite(left) ? left : Number.POSITIVE_INFINITY;
  const rightSafe = Number.isFinite(right) ? right : Number.POSITIVE_INFINITY;
  return leftSafe - rightSafe;
}

function parseEntryValue(raw) {
  if (raw == null || String(raw).trim() === "") return null;
  const num = Number(raw);
  if (!Number.isFinite(num)) return NaN;
  if (num === 0) return null;
  return num;
}

/**
 * Render a holdings entry form for all currencies in a vault.
 * @param {{ vaultId: string, currencies: Array<{id:string,name:string,code?:string,rate?:number}>, isModal?: boolean }} props
 * @returns {JSX.Element}
 */
export default function HoldingsFormClient({ vaultId, currencies, isModal }) {
  const router = useRouter();
  const { toggleSpinner } = useGlobalUI();
  const { invalidateHoldings } = useVault();
  const [busy, setBusy] = useState(false);

  const sortedCurrencies = useMemo(
    () => [...(currencies || [])].sort(sortByRate),
    [currencies],
  );

  const [valuesById, setValuesById] = useState(() => {
    const initial = {};
    for (const currency of sortedCurrencies) {
      initial[String(currency.id)] = "";
    }
    return initial;
  });

  function updateValue(currencyId, next) {
    setValuesById((prev) => ({
      ...prev,
      [String(currencyId)]: next,
    }));
  }

  function close() {
    if (!vaultId) return;
    if (isModal) {
      router.back();
      return;
    }
    router.replace(`/account/vaults/${vaultId}/holdings`);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!vaultId) {
      toast.error("Missing vault id.");
      return;
    }

    if (!sortedCurrencies.length) {
      toast.error("Add a currency before logging holdings.");
      return;
    }

    const entries = [];
    for (const currency of sortedCurrencies) {
      const raw = valuesById[String(currency.id)];
      const parsed = parseEntryValue(raw);
      if (Number.isNaN(parsed)) {
        toast.error(`Invalid value for ${currency.name}.`);
        return;
      }
      if (parsed == null) continue;
      entries.push({ currencyId: String(currency.id), value: parsed });
    }

    if (entries.length === 0) {
      toast.error("Enter at least one amount.");
      return;
    }

    setBusy(true);
    toggleSpinner(true, "Saving");

    try {
      const results = await Promise.all(
        entries.map((entry) =>
          createHoldingsEntryAction({
            vaultId,
            currencyId: entry.currencyId,
            value: entry.value,
          }),
        ),
      );

      const failed = results.find((res) => !res?.ok);
      if (failed) {
        toast.error(failed?.error || "Failed to save holdings.");
        return;
      }

      toast.success(
        entries.length === 1
          ? "Holding saved."
          : `Holdings saved (${entries.length}).`,
      );

      if (isModal) {
        invalidateHoldings();
      }

      close();
    } catch (err) {
      toast.error(err?.message || "Failed to save holdings.");
    } finally {
      toggleSpinner(false);
      setBusy(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto text-fg space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {!isModal && <h1 className="text-2xl font-semibold">Add holdings</h1>}
          <p className="text-sm text-muted-fg">
            Enter amounts for each currency you want to record.
          </p>
        </div>
        {!isModal && vaultId ? (
          <LinkButton
            href={`/account/vaults/${vaultId}/holdings`}
            variant="outline"
          >
            Back
          </LinkButton>
        ) : null}
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {sortedCurrencies.map((currency) => {
            const code = currency?.code ? normalizeCode(currency.code) : "";
            return (
              <InputComponent
                key={currency.id}
                label={currency.name || "Currency"}
                hint={code ? code : undefined}
                value={valuesById[String(currency.id)] || ""}
                onChange={(e) => updateValue(currency.id, e.target.value)}
                disabled={busy}
                inputMode="decimal"
                type="number"
                step="any"
              />
            );
          })}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={close}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={busy}
          >
            {busy ? "Saving..." : "Save holdings"}
          </Button>
        </div>
      </form>
    </div>
  );
}

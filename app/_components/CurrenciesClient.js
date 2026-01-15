"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCurrencies } from "@/app/hooks/useCurrencies";
import { findBaseCurrency, normalizeCode } from "@/app/utils/currencyUtils";
import { CurrenciesTable } from "@/app/_components/CurrenciesTable"; // adjust path as needed
import { Button } from "@/app/_components/Button";
import InputComponent from "@/app/_components/InputComponent";

export default function CurrenciesClient({ vaultId }) {
  const router = useRouter();

  const { currencies, loading, busy, error, reload } = useCurrencies({
    vaultId,
  });

  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("rate");
  const [sortDir, setSortDir] = useState("asc");

  const baseCurrency = useMemo(
    () => findBaseCurrency(currencies),
    [currencies]
  );

  function toggleSort(nextKey) {
    if (sortKey === nextKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(nextKey);
      setSortDir("asc");
    }
  }

  function onEditCurrency(c) {
    router.push(`/account/vaults/${vaultId}/currencies/${c.id}/edit`);
  }

  function onDeleteCurrency(c) {
    router.push(`/account/vaults/${vaultId}/currencies/${c.id}/delete`);
  }

  return (
    <div className="p-6 max-w-5xl mx-auto text-(--fg)">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Currencies</h1>
          <p className="text-sm text-(--muted-fg)">
            Vault currencies. Exactly one base currency (rate = 1).
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/account/vaults/${vaultId}/currencies/new`}
            className="px-3 py-2 rounded-lg bg-(--primary-700) text-(--primary-50) hover:bg-(--primary-600) border border-(--border) transition-colors"
          >
            Create
          </Link>

          <Button
            type="outline"
            onClick={reload}
            disabled={busy}
          >
            Refresh
          </Button>
        </div>
      </header>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <label className="text-sm text-(--muted-fg)">Search</label>
          <InputComponent
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Gold, GP, Silver..."
          />
        </div>

        <div>
          <label className="text-sm text-(--muted-fg)">Sort</label>
          <div className="mt-1 flex gap-2">
            <button
              type="button"
              onClick={() => toggleSort("name")}
              className={`px-3 py-2 rounded-lg border border-(--border) bg-(--input) text-(--input-fg) hover:bg-(--primary-600) hover:text-(--primary-50) transition-colors ${
                sortKey === "name" ? "ring-2 ring-(--accent-500)" : ""
              }`}
            >
              Name {sortKey === "name" ? (sortDir === "asc" ? "▲" : "▼") : ""}
            </button>

            <button
              type="button"
              onClick={() => toggleSort("code")}
              className={`px-3 py-2 rounded-lg border border-(--border) bg-(--input) text-(--input-fg) hover:bg-(--primary-600) hover:text-(--primary-50) transition-colors ${
                sortKey === "cide" ? "ring-2 ring-(--accent-500)" : ""
              }`}
            >
              Code {sortKey === "code" ? (sortDir === "asc" ? "▲" : "▼") : ""}
            </button>

            <button
              type="button"
              onClick={() => toggleSort("rate")}
              className={`px-3 py-2 rounded-lg border border-(--border) bg-(--input) text-(--input-fg) hover:bg-(--primary-600) hover:text-(--primary-50) transition-colors ${
                sortKey === "rate" ? "ring-2 ring-(--accent-500)" : ""
              }`}
            >
              Rate {sortKey === "rate" ? (sortDir === "asc" ? "▲" : "▼") : ""}
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-4 p-3 rounded-lg border border-(--danger) bg-[color-mix(in_oklch,var(--danger)_12%,transparent)] text-sm">
          {error}
        </div>
      ) : null}

      <CurrenciesTable
        currencies={currencies}
        loading={loading}
        busy={busy}
        baseCurrency={baseCurrency}
        query={query}
        sortKey={sortKey}
        sortDir={sortDir}
        onEdit={onEditCurrency}
        onDelete={onDeleteCurrency}
      />
    </div>
  );
}

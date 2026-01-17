"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCurrencies } from "@/app/hooks/useCurrencies";
import {
  findBaseCurrency,
  findCommonCurrency,
} from "@/app/utils/currencyUtils";
import { CurrenciesTable } from "@/app/_components/CurrenciesTable"; // adjust path as needed
import { Button } from "@/app/_components/Button";
import InputComponent from "@/app/_components/InputComponent";
import { useVault } from "@/app/_context/VaultProvider";
import { LinkButton } from "@/app/_components/LinkButton";

export default function CurrenciesClient({ vaultId }) {
  const router = useRouter();
  const { vault, updateVault } = useVault();
  const { currencies, loading, busy, error, reload } = useCurrencies({
    vaultId,
  });

  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("rate");
  const [sortDir, setSortDir] = useState("asc");
  const [hydrating, setHydrating] = useState(false);

  useEffect(() => {
    hydrateVault();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vaultId, vault.base_currency_id, vault.common_currency_id]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    function handleRefresh(event) {
      if (event?.detail?.vaultId && event.detail.vaultId !== vaultId) return;
      reload();
      hydrateVault();
    }

    window.addEventListener("vault:refresh", handleRefresh);
    return () => window.removeEventListener("vault:refresh", handleRefresh);
  }, [vaultId, reload]);

  async function hydrateVault() {
    if (!vaultId) return;

    setHydrating(true);
    try {
      const res = await fetch(`/api/vaults/${vaultId}`, { cache: "no-store" });
      if (!res.ok) return;

      const json = await res.json().catch(() => null);
      if (json?.data) updateVault(json.data);
    } catch {
    } finally {
      setHydrating(false);
    }
  }

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
    <div className="p-6 max-w-5xl mx-auto text-fg">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Currencies</h1>
          <p className="text-sm text-muted-fg">
            Vault currencies. Exactly one base currency (rate = 1).
          </p>
        </div>

        <div className="flex gap-2">
          <LinkButton
            variant="primary"
            href={`/account/vaults/${vaultId}/currencies/new`}
            className="px-3 py-2 rounded-lg bg-btn-primary-bg text-btn-primary-fg hover:bg-btn-primary-hover-bg border border-border transition-colors"
          >
            Create
          </LinkButton>

          <Button
            variant="accent"
            onClick={() => {
              reload();
              hydrateVault();
            }}
            disabled={busy}
          >
            Refresh
          </Button>
        </div>
      </header>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <label className="text-sm text-muted-fg">Search</label>
          <InputComponent
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Gold, GP, Silver..."
          />
        </div>

        <div>
          <label className="text-sm text-muted-fg">Sort</label>
          <div className="mt-1 flex gap-2">
            <button
              type="button"
              onClick={() => toggleSort("name")}
              className={`px-3 py-2 rounded-lg border border-border bg-input text-input-fg hover:bg-btn-secondary-hover-bg hover:text-btn-secondary-fg transition-colors ${
                sortKey === "name" ? "ring-2 ring-accent" : ""
              }`}
            >
              Name {sortKey === "name" ? (sortDir === "asc" ? "▲" : "▼") : ""}
            </button>

            <button
              type="button"
              onClick={() => toggleSort("code")}
              className={`px-3 py-2 rounded-lg border border-border bg-input text-input-fg hover:bg-btn-secondary-hover-bg hover:text-btn-secondary-fg transition-colors ${
                sortKey === "cide" ? "ring-2 ring-accent" : ""
              }`}
            >
              Code {sortKey === "code" ? (sortDir === "asc" ? "▲" : "▼") : ""}
            </button>

            <button
              type="button"
              onClick={() => toggleSort("rate")}
              className={`px-3 py-2 rounded-lg border border-border bg-input text-input-fg hover:bg-btn-secondary-hover-bg hover:text-btn-secondary-fg transition-colors ${
                sortKey === "rate" ? "ring-2 ring-accent" : ""
              }`}
            >
              Rate {sortKey === "rate" ? (sortDir === "asc" ? "▲" : "▼") : ""}
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-4 p-3 rounded-lg border border-danger-600 bg-danger-100 text-sm text-danger-700">
          {error}
        </div>
      ) : null}

      <CurrenciesTable
        currencies={currencies}
        loading={loading}
        busy={busy}
        baseCurrencyId={vault.base_currency_id}
        commonCurrencyId={vault.common_currency_id}
        query={query}
        sortKey={sortKey}
        sortDir={sortDir}
        onEdit={onEditCurrency}
        onDelete={onDeleteCurrency}
      />
    </div>
  );
}

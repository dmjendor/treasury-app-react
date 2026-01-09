"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useCurrencies } from "@/app/hooks/useCurrencies";
import {
  findBaseCurrency,
  normalizeCode,
  formatRate,
} from "@/app/utils/currencyUtils";

export default function Page({ params }) {
  const vaultId = params.vaultId;

  const { currencies, loading, busy, error, reload } = useCurrencies({
    vaultId,
  });

  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("name"); // name | abbreviation | multiplier
  const [sortDir, setSortDir] = useState("asc"); // asc | desc

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

  const filteredAndSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = currencies ?? [];

    if (q) {
      list = list.filter((c) => {
        const n = String(c.name ?? "").toLowerCase();
        const a = String(c.abbreviation ?? "").toLowerCase();
        return n.includes(q) || a.includes(q);
      });
    }

    const dir = sortDir === "asc" ? 1 : -1;

    list = [...list].sort((a, b) => {
      const va =
        sortKey === "multiplier"
          ? Number(a.multiplier)
          : String(a[sortKey] ?? "").toLowerCase();
      const vb =
        sortKey === "multiplier"
          ? Number(b.multiplier)
          : String(b[sortKey] ?? "").toLowerCase();

      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });

    // pin base on top
    const baseId = baseCurrency?.id;
    if (baseId) {
      list = [
        ...list.filter((c) => c.id === baseId),
        ...list.filter((c) => c.id !== baseId),
      ];
    }

    return list;
  }, [currencies, query, sortKey, sortDir, baseCurrency]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Currencies</h1>
          <p className="text-sm text-muted-foreground">
            Vault currencies. Exactly one base currency (rate = 1).
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/account/vaults/${vaultId}/currencies/new`}
            className="px-3 py-2 rounded-lg bg-black text-white hover:opacity-90"
          >
            Create
          </Link>

          <button
            type="button"
            onClick={() => reload()}
            className="px-3 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
            disabled={busy}
          >
            Refresh
          </button>
        </div>
      </header>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <label className="text-sm text-muted-foreground">Search</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Gold, GP, Silver..."
            className="mt-1 w-full max-w-md px-3 py-2 border rounded-lg bg-white"
          />
        </div>

        <div>
          <label className="text-sm text-muted-foreground">Sort</label>
          <div className="mt-1 flex gap-2">
            <button
              type="button"
              onClick={() => toggleSort("name")}
              className={`px-3 py-2 rounded-lg border ${
                sortKey === "name" ? "bg-gray-50" : ""
              }`}
            >
              Name {sortKey === "name" ? (sortDir === "asc" ? "▲" : "▼") : ""}
            </button>
            <button
              type="button"
              onClick={() => toggleSort("abbreviation")}
              className={`px-3 py-2 rounded-lg border ${
                sortKey === "abbreviation" ? "bg-gray-50" : ""
              }`}
            >
              Code{" "}
              {sortKey === "abbreviation"
                ? sortDir === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </button>
            <button
              type="button"
              onClick={() => toggleSort("multiplier")}
              className={`px-3 py-2 rounded-lg border ${
                sortKey === "multiplier" ? "bg-gray-50" : ""
              }`}
            >
              Rate{" "}
              {sortKey === "multiplier" ? (sortDir === "asc" ? "▲" : "▼") : ""}
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-4 p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <div className="mt-6 rounded-2xl border overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {loading ? "Loading..." : `${filteredAndSorted.length} currencies`}
          </div>

          <div className="text-sm">
            Base:{" "}
            <span className="font-medium">
              {baseCurrency
                ? `${baseCurrency.name} (${normalizeCode(
                    baseCurrency.abbreviation
                  )})`
                : "Not set"}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white border-b">
              <tr className="text-left">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Rate</th>
                <th className="px-4 py-3">Base</th>
                <th className="px-4 py-3 w-40">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    className="px-4 py-4 text-muted-foreground"
                    colSpan={5}
                  >
                    Loading currencies...
                  </td>
                </tr>
              ) : filteredAndSorted.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-6 text-muted-foreground"
                    colSpan={5}
                  >
                    No currencies yet. Create your first one and set it as base
                    (rate = 1), usually Gold or GP.
                  </td>
                </tr>
              ) : (
                filteredAndSorted.map((c) => {
                  const isBase = Number(c.multiplier) === 1;

                  return (
                    <tr
                      key={c.id}
                      className="border-b last:border-b-0"
                    >
                      <td className="px-4 py-3 font-medium">{c.name}</td>
                      <td className="px-4 py-3 font-mono">
                        {normalizeCode(c.abbreviation)}
                      </td>
                      <td className="px-4 py-3">{formatRate(c.multiplier)}</td>
                      <td className="px-4 py-3">{isBase ? "⭐" : ""}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Link
                            href={`/account/vaults/${vaultId}/currencies/${c.id}/edit`}
                            className="px-3 py-2 rounded-lg border hover:bg-gray-50"
                          >
                            Edit
                          </Link>

                          <Link
                            href={`/account/vaults/${vaultId}/currencies/${c.id}/delete`}
                            className={`px-3 py-2 rounded-lg border hover:bg-gray-50 ${
                              isBase ? "pointer-events-none opacity-50" : ""
                            }`}
                            title={
                              isBase
                                ? "You can’t delete the base currency"
                                : "Delete currency"
                            }
                          >
                            Delete
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useMemo } from "react";
import { formatRate, normalizeCode } from "./currencyUtils";

function sortCurrencies(list, { sortKey, sortDir }) {
  const dir = sortDir === "asc" ? 1 : -1;
  return [...list].sort((a, b) => {
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
}

export function CurrenciesTable({
  currencies,
  loading,
  busy,
  baseCurrency,
  query,
  sortKey,
  sortDir,
  onEdit,
  onDelete,
}) {
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

    list = sortCurrencies(list, { sortKey, sortDir });

    // Pin base on top
    const baseId = baseCurrency?.id;
    if (baseId)
      list = [
        list.find((c) => c.id === baseId),
        ...list.filter((c) => c.id !== baseId),
      ].filter(Boolean);

    return list;
  }, [currencies, query, sortKey, sortDir, baseCurrency]);

  return (
    <div className="mt-6 rounded-2xl border overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {loading
            ? "Loading..."
            : `${filteredAndSorted.length} currency${
                filteredAndSorted.length === 1 ? "" : "ies"
              }`}
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
                  No currencies yet. Create your first one and set it as the
                  base (rate = 1), usually Gold or GP.
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
                        <button
                          type="button"
                          onClick={() => onEdit(c)}
                          className="px-3 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                          disabled={busy}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(c)}
                          className="px-3 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                          disabled={busy || isBase}
                          title={
                            isBase
                              ? "You can’t delete the base currency"
                              : "Delete currency"
                          }
                        >
                          Delete
                        </button>
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
  );
}

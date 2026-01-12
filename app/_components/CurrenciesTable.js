"use client";

import React, { useMemo } from "react";
import { formatRate, normalizeCode } from "@/app/utils/currencyUtils";
import { Button } from "@/app/_components/Button";

function sortCurrencies(list, { sortKey, sortDir }) {
  const dir = sortDir === "asc" ? 1 : -1;
  return [...list].sort((a, b) => {
    const va =
      sortKey === "rate"
        ? Number(a.rate)
        : String(a[sortKey] ?? "").toLowerCase();
    const vb =
      sortKey === "rate"
        ? Number(b.rate)
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
    <div className="mt-6 overflow-hidden rounded-2xl border border-(--border) bg-(--card) text-(--card-fg)">
      <div className="flex items-center justify-between px-4 py-3 bg-(--primary-700) border-b border-(--border)">
        <div className="text-sm text-(--muted-fg)">
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
          <thead className="bg-(--primary-700) text-(--primary-50)">
            <tr className="text-left">
              <th className="px-4 py-3 font-medium text-(--muted-fg)">Name</th>
              <th className="px-4 py-3 font-medium text-(--muted-fg)">Code</th>
              <th className="px-4 py-3 font-medium text-(--muted-fg)">Rate</th>
              <th className="px-4 py-3 font-medium text-(--muted-fg)">Base</th>
              <th className="px-4 py-3 w-40 font-medium text-(--muted-fg)">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-(--border)">
            {loading ? (
              <tr>
                <td
                  className="px-4 py-4 text-(--muted-fg)"
                  colSpan={5}
                >
                  Loading currencies...
                </td>
              </tr>
            ) : filteredAndSorted.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-6 text-(--muted-fg)"
                  colSpan={5}
                >
                  No currencies yet. Create your first one and set it as the
                  base (rate = 1), usually Gold or GP.
                </td>
              </tr>
            ) : (
              filteredAndSorted.map((c) => {
                const isBase = Number(c.rate) === 1;

                return (
                  <tr
                    key={c.id}
                    className="bg-(--card) hover:bg-(--primary-500) hover:text-(--primary-900) transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">{c.name}</td>

                    <td className="px-4 py-3 font-mono">
                      {normalizeCode(c.code)}
                    </td>

                    <td className="px-4 py-3">{formatRate(c.rate)}</td>

                    <td className="px-4 py-3">{isBase ? "⭐" : ""}</td>

                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          type="primary"
                          onClick={() => onEdit(c)}
                          disabled={busy}
                        >
                          Edit
                        </Button>

                        <Button
                          type="danger"
                          onClick={() => onDelete(c)}
                          disabled={busy || isBase}
                          title={
                            isBase
                              ? "You can’t delete the base currency"
                              : "Delete currency"
                          }
                        >
                          Delete
                        </Button>
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

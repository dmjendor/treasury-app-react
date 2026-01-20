"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import ContainerTabs from "@/app/_components/ContainerTabs";
import ValuablesTable from "@/app/_components/ValuablesTable";
import { LinkButton } from "@/app/_components/LinkButton";
import { Button } from "@/app/_components/Button";
import InputComponent from "@/app/_components/InputComponent";

export default function ValuablesClient({ vaultId, containers, valuables }) {
  const initialContainerId =
    containers?.[0]?.id != null ? String(containers[0].id) : null;

  const [activeContainerId, setActiveContainerId] =
    useState(initialContainerId);

  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("name"); // name | value | quantity
  const [sortDir, setSortDir] = useState("asc"); // asc | desc

  const visibleValuables = useMemo(() => {
    const list = Array.isArray(valuables) ? valuables : [];
    const q = query.trim().toLowerCase();

    const filtered = list.filter((v) => {
      if (
        activeContainerId &&
        String(v.container_id) !== String(activeContainerId)
      ) {
        return false;
      }

      if (!q) return true;

      return String(v.name ?? "")
        .toLowerCase()
        .includes(q);
    });

    const dir = sortDir === "asc" ? 1 : -1;

    filtered.sort((a, b) => {
      const av = a?.[sortKey];
      const bv = b?.[sortKey];

      if (sortKey === "value" || sortKey === "quantity") {
        return (Number(av) - Number(bv)) * dir;
      }

      return (
        String(av ?? "").localeCompare(String(bv ?? ""), undefined, {
          sensitivity: "base",
        }) * dir
      );
    });

    return filtered;
  }, [valuables, activeContainerId, query, sortKey, sortDir]);

  function toggleSort(nextKey) {
    if (sortKey === nextKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(nextKey);
      setSortDir("asc");
    }
  }

  function sortLabel(key, label) {
    const arrow = sortKey === key ? (sortDir === "asc" ? " ▲" : " ▼") : "";
    return `${label}${arrow}`;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6 text-fg">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-fg">Valuables</h1>
          <p className="text-sm text-muted-fg">
            Track valuables by container and keep totals tidy.
          </p>
        </div>

        <div className="flex gap-2">
          <LinkButton
            href={`/account/vaults/${encodeURIComponent(vaultId)}/valuables/new`}
            variant="accent"
          >
            Add valuable
          </LinkButton>
        </div>
      </header>

      <section className="space-y-4 rounded-2xl border border-border bg-accent-500 p-4">
        <ContainerTabs
          containers={containers}
          activeId={activeContainerId}
          onChange={(id) =>
            setActiveContainerId(id != null ? String(id) : null)
          }
          vaultId={vaultId}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex-1">
            <label className="text-sm text-muted-fg">Search</label>
            <div className="mt-1 w-full max-w-md">
              <InputComponent
                name="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Name"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-fg">Sort</label>
            <div className="mt-1 flex flex-wrap gap-2">
              <Button
                variant={sortKey === "name" ? "primary" : "outline"}
                size="sm"
                onClick={() => toggleSort("name")}
              >
                {sortLabel("name", "Name")}
              </Button>

              <Button
                variant={sortKey === "value" ? "primary" : "outline"}
                size="sm"
                onClick={() => toggleSort("value")}
              >
                {sortLabel("value", "Value")}
              </Button>

              <Button
                variant={sortKey === "quantity" ? "primary" : "outline"}
                size="sm"
                onClick={() => toggleSort("quantity")}
              >
                {sortLabel("quantity", "Qty")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <ValuablesTable
        vaultId={vaultId}
        valuables={visibleValuables}
        activeContainerId={activeContainerId}
      />
    </div>
  );
}

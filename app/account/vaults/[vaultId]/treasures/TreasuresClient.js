"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import ContainerTabs from "@/app/_components/ContainerTabs";
import TreasuresTable from "@/app/_components/TreasuresTable";
import { LinkButton } from "@/app/_components/LinkButton";
import { Button } from "@/app/_components/Button";
import InputComponent from "@/app/_components/InputComponent";

export default function TreasuresClient({ vaultId, containers, treasures }) {
  const [activeContainerId, setActiveContainerId] = useState(
    containers?.[0]?.id ?? null,
  );

  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("name"); // name | value | quantity
  const [sortDir, setSortDir] = useState("asc"); // asc | desc

  const visibleTreasures = useMemo(() => {
    const list = Array.isArray(treasures) ? treasures : [];
    const q = query.trim().toLowerCase();

    const filtered = list.filter((t) => {
      if (activeContainerId && t.container_id !== activeContainerId)
        return false;
      if (!q) return true;

      const hay = [t.name, t.genericname, t.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
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
  }, [treasures, activeContainerId, query, sortKey, sortDir]);

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
    <div className="p-6 max-w-6xl mx-auto text-fg space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Treasure</h1>
          <p className="text-sm text-muted-fg">
            Manage treasure by container. Identification switching can come
            later.
          </p>
        </div>

        <div className="flex gap-2">
          <LinkButton
            href={`/account/vaults/${vaultId}/treasures/new`}
            variant="accent"
          >
            Add treasure
          </LinkButton>
        </div>
      </header>

      <section className="rounded-2xl border border-border bg-primary-400 p-4 space-y-4">
        <ContainerTabs
          containers={containers}
          activeId={activeContainerId}
          onChange={setActiveContainerId}
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
                placeholder="Name, description"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-fg">Sort</label>
            <div className="mt-1 flex gap-2 flex-wrap">
              <Button
                variant={sortKey === "name" ? "accent" : "outline"}
                size="sm"
                onClick={() => toggleSort("name")}
              >
                {sortLabel("name", "Name")}
              </Button>

              <Button
                variant={sortKey === "value" ? "accent" : "outline"}
                size="sm"
                onClick={() => toggleSort("value")}
              >
                {sortLabel("value", "Value")}
              </Button>

              <Button
                variant={sortKey === "quantity" ? "accent" : "outline"}
                size="sm"
                onClick={() => toggleSort("quantity")}
              >
                {sortLabel("quantity", "Qty")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <TreasuresTable
        vaultId={vaultId}
        treasures={visibleTreasures}
        activeContainerId={activeContainerId}
      />
    </div>
  );
}

"use client";

import React, { useMemo, useState } from "react";
import Select from "@/app/_components/Select";
import { Button } from "@/app/_components/Button";
import SubCard from "@/app/_components/SubCard";

export default function DefaultTreasurePicker({
  items,
  onPick,
  valueUnit = "common",
  commonRate = 1,
  commonCode = "Common",
  baseCode = "Base",
}) {
  const rows = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  const [categoryId, setCategoryId] = useState("");
  const [itemId, setItemId] = useState("");

  const { categories, filteredItems, selectedItem } = useMemo(() => {
    const categoriesList = rows
      .filter((r) => r.parent_id == null)
      .map((r) => ({ id: r.id, name: r.name }))
      .sort((a, b) =>
        String(a.name).localeCompare(String(b.name), undefined, {
          sensitivity: "base",
        }),
      );

    const itemsList = rows
      .filter((r) => categoryId && String(r.parent_id) === String(categoryId))
      .sort((a, b) =>
        String(a.name).localeCompare(String(b.name), undefined, {
          sensitivity: "base",
        }),
      );

    const chosen = itemId
      ? (rows.find((r) => String(r.id) === String(itemId)) ?? null)
      : null;

    return {
      categories: categoriesList,
      filteredItems: itemsList,
      selectedItem: chosen,
    };
  }, [rows, categoryId, itemId]);

  function clear() {
    setCategoryId("");
    setItemId("");
  }

  function formatValue(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "0";
    return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  const previewValue = useMemo(() => {
    if (!selectedItem) return null;
    const baseValue = Number(selectedItem.value) || 0;
    if (valueUnit === "common") {
      const rate = Number(commonRate) || 1;
      const commonValue = rate ? baseValue / rate : baseValue;
      return `${formatValue(commonValue)} ${commonCode}`;
    }
    return `${formatValue(baseValue)} ${baseCode}`;
  }, [selectedItem, valueUnit, commonRate, commonCode, baseCode]);

  return (
    <div className="space-y-3">
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          id="dt-category"
          label="Category"
          hint="What type of treasure are you wanting to add."
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setItemId("");
          }}
        >
          <option value="">Choose…</option>
          {categories.map((c) => (
            <option
              key={c.id}
              value={c.id}
            >
              {c.name}
            </option>
          ))}
        </Select>

        <Select
          id="dt-item"
          label="Item"
          hint={
            categoryId
              ? "Select an item to auto fill."
              : "Pick a category first."
          }
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
          disabled={!categoryId}
        >
          <option value="">Choose…</option>
          {filteredItems.map((it) => (
            <option
              key={it.id}
              value={it.id}
            >
              {it.name}
            </option>
          ))}
        </Select>
      </div>

      {selectedItem ? (
        <SubCard className="text-sm">
          <div className="text-lg font-bold">Preview</div>
          <div className="mt-1 font-semibold">{selectedItem.name}</div>
          <div className="mt-1">Value: {previewValue}</div>

          <div className="mt-3">
            <Button
              type="button"
              variant="accent"
              onClick={() => onPick?.(selectedItem)}
            >
              Use this item
            </Button>
          </div>
        </SubCard>
      ) : null}
    </div>
  );
}

"use client";

import React, { useMemo, useState } from "react";
import Select from "@/app/_components/Select";
import { Button } from "@/app/_components/Button";

export default function DefaultTreasurePicker({ items, onPick }) {
  const rows = useMemo(() => (Array.isArray(items) ? items : []), [items]);
  console.log("ros", rows);
  const [categoryId, setCategoryId] = useState("");
  const [itemId, setItemId] = useState("");

  const { categories, filteredItems, selectedItem } = useMemo(() => {
    const categoriesList = rows
      .filter((r) => r.parent_id == null)
      .map((r) => ({ id: r.id, name: r.name }))
      .sort((a, b) =>
        String(a.name).localeCompare(String(b.name), undefined, {
          sensitivity: "base",
        })
      );

    const itemsList = rows
      .filter((r) => categoryId && String(r.parent_id) === String(categoryId))
      .sort((a, b) =>
        String(a.name).localeCompare(String(b.name), undefined, {
          sensitivity: "base",
        })
      );

    const chosen = itemId
      ? rows.find((r) => String(r.id) === String(itemId)) ?? null
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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-(--fg)">
          Pick default treasure
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clear}
        >
          Clear
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          id="dt-category"
          label="Category"
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
        <div className="rounded-xl border border-(--border) bg-(--surface-800) p-3 text-sm">
          <div className="text-(--muted-fg)">Preview</div>
          <div className="mt-1 font-semibold text-(--fg)">
            {selectedItem.name}
          </div>
          <div className="mt-1 text-(--muted-fg)">
            Value: {selectedItem.value ?? 0}
          </div>

          <div className="mt-3">
            <Button
              type="button"
              variant="accent"
              onClick={() => onPick?.(selectedItem)}
            >
              Use this item
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

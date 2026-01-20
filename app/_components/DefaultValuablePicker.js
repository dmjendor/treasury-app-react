"use client";

import React, { useMemo, useState } from "react";
import Select from "@/app/_components/Select";
import { Button } from "@/app/_components/Button";

function toInt(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.trunc(n);
}

function randomIntInclusive(min, max) {
  const a = toInt(min);
  const b = toInt(max);

  if (a === b) return a;

  const lo = Math.min(a, b);
  const hi = Math.max(a, b);

  return lo + Math.floor(Math.random() * (hi - lo + 1));
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function roundToStep(value, step) {
  const v = toNumber(value);
  const s = Math.max(1, Math.trunc(toNumber(step)));
  return Math.round(v / s) * s;
}

function baseToDisplayed(baseValue, valueUnit, commonRate) {
  const base = toNumber(baseValue);
  const rate = toNumber(commonRate) || 1;
  return valueUnit === "common" ? base / rate : base;
}

function displayedToBase(displayValue, valueUnit, commonRate) {
  const val = toNumber(displayValue);
  const rate = toNumber(commonRate) || 1;
  return valueUnit === "common" ? val * rate : val;
}

function roundBaseByDisplayedStep(
  baseValue,
  valueUnit,
  commonRate,
  stepInDisplayedUnit,
) {
  const displayed = baseToDisplayed(baseValue, valueUnit, commonRate);
  const roundedDisplayed = roundToStep(displayed, stepInDisplayedUnit);
  return displayedToBase(roundedDisplayed, valueUnit, commonRate);
}

function formatWhole(n) {
  return String(Math.round(toNumber(n)));
}

function getDisplayedRange(
  lowBase,
  highBase,
  valueUnit,
  commonRate,
  roundStep,
) {
  const lowDisp = baseToDisplayed(lowBase, valueUnit, commonRate);
  const highDisp = baseToDisplayed(highBase, valueUnit, commonRate);

  // Optional: show the range already rounded to the chosen step
  // (keeps the dropdown range consistent with the final pick)
  const lowR = roundToStep(lowDisp, roundStep);
  const highR = roundToStep(highDisp, roundStep);

  return { low: lowR, high: highR };
}

const ROUND_OPTIONS = [1, 10, 100, 1000];

export default function DefaultValuablePicker({
  valueUnit,
  commonRate,
  valueLabel,
  items,
  onPick,
}) {
  const rows = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  const [categoryId, setCategoryId] = useState("");
  const [itemId, setItemId] = useState("");
  const [roundStep, setRoundStep] = useState(10);

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

  const range = useMemo(() => {
    if (!selectedItem) return null;
    const low = toInt(selectedItem.low_value);
    const high = toInt(selectedItem.high_value);
    return { low, high };
  }, [selectedItem]);

  function clear() {
    setCategoryId("");
    setItemId("");
  }

  function updateValue(value) {
    return valueUnit === "common" ? value / commonRate : value;
  }

  function handlePick() {
    if (!selectedItem) return;

    const low = toInt(selectedItem.low_value);
    const high = toInt(selectedItem.high_value);
    const rawBase = randomIntInclusive(low, high);
    const roundedBase = roundBaseByDisplayedStep(
      rawBase,
      valueUnit,
      commonRate,
      roundStep,
    );

    // store base as an integer
    const valueBase = Math.round(roundedBase);

    onPick?.({ defaultValuable: selectedItem, value: valueBase });
  }
  const disp = getDisplayedRange(
    selectedItem?.low_value,
    selectedItem?.high_value,
    valueUnit,
    commonRate,
    roundStep,
  );
  return (
    <div className="space-y-3">
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          id="dv-category"
          label="Category"
          hint="Choose a type of valuable."
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
          id="dv-item"
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
          {filteredItems.map((it) => {
            const r = getDisplayedRange(
              it.low_value,
              it.high_value,
              valueUnit,
              commonRate,
              roundStep,
            );

            return (
              <option
                key={it.id}
                value={it.id}
              >
                {it.name} [{formatWhole(r.low)} - {formatWhole(r.high)}{" "}
                {valueLabel}]
              </option>
            );
          })}
        </Select>
      </div>

      {selectedItem ? (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-start sm:justify-between">
          {/* Left: item preview */}
          <div className="min-w-0">
            <div className="text-muted-fg font-bold text-lg">Preview</div>
            <div className="mt-1 truncate text-sm font-semibold text-fg">
              {selectedItem.name}
            </div>

            <div className="text-xs text-muted-fg">
              Range: {formatWhole(disp.low)} to {formatWhole(disp.high)}{" "}
              {valueLabel}
            </div>

            <div className="mt-3">
              <Button
                type="button"
                variant="accent"
                onClick={handlePick}
              >
                Use this item
              </Button>
            </div>
          </div>

          {/* Right: rounding (small footprint) */}
          <div className="shrink-0 sm:pl-4 sm:border-l sm:border-border">
            <div className="text-xs font-semibold text-fg">Round</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {ROUND_OPTIONS.map((opt) => {
                const active = roundStep === opt;
                return (
                  <Button
                    key={opt}
                    variant={active ? "accent" : "outline"}
                    onClick={() => setRoundStep(opt)}
                    size="sm"
                  >
                    {opt}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

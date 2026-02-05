"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Select from "@/app/_components/Select";
import { Button } from "@/app/_components/Button";
import InputComponent from "@/app/_components/InputComponent";
import {
  createValuableAction,
  generateValuablesAction,
  getDefaultValuablesAction,
} from "@/app/_lib/actions/valuables";
import { toCamelCase } from "@/app/_lib/actions/_utils";

function asNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}

function formatNumberString(n) {
  if (!Number.isFinite(n)) return "";
  const rounded = Math.round((n + Number.EPSILON) * 100000) / 100000;
  return String(rounded);
}

export default function ValuablesForm({
  mode, // "new" | "edit"
  vault,
  updateVault, // optional
  valuableId, // edit only
  onClose,
  onSaved, // called with payload on submit

  submitting = false,
  error = "",
}) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const vaultId = vault?.id != null ? String(vault.id) : "";

  const currencyList = useMemo(() => {
    return Array.isArray(vault?.currencyList) ? vault.currencyList : [];
  }, [vault?.currencyList]);

  const commonCurrencyId =
    vault?.common_currency_id != null ? String(vault.common_currency_id) : "";
  const baseCurrencyId =
    vault?.base_currency_id != null ? String(vault.base_currency_id) : "";

  const containerOptions = useMemo(() => {
    const list = Array.isArray(vault?.containerList) ? vault.containerList : [];
    return list.map((c) => ({
      value: String(c.id),
      label: c.name,
    }));
  }, [vault?.containerList]);

  const baseCurrency = useMemo(() => {
    return (
      currencyList.find((c) => String(c.id) === String(baseCurrencyId)) || null
    );
  }, [currencyList, baseCurrencyId]);

  const commonCurrency = useMemo(() => {
    return (
      currencyList.find((c) => String(c.id) === String(commonCurrencyId)) ||
      null
    );
  }, [currencyList, commonCurrencyId]);

  const baseLabel = baseCurrency?.code || baseCurrency?.name || "Base";

  const commonLabel = commonCurrency?.code || commonCurrency?.name || "Common";

  const commonRate = Number(commonCurrency?.rate) || 1;

  const [formError, setFormError] = useState(error || "");
  const [loading, setLoading] = useState(isEdit);
  const [busy, setBusy] = useState(false);
  const isSubmitting = Boolean(submitting || busy);

  const [containerId, setContainerId] = useState("");
  const [name, setName] = useState("");

  const [valueBase, setValueBase] = useState(0);
  const [valueUnit, setValueUnit] = useState("common"); // "common" | "base"
  const [valueLabel, setValueLabel] = useState(commonLabel);
  const [displayValue, setDisplayValue] = useState("");
  const [showDefaults, setShowDefaults] = useState(false);
  const [generatorError, setGeneratorError] = useState("");
  const [generatorBusy, setGeneratorBusy] = useState(false);
  const [defaultValuables, setDefaultValuables] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [rangeId, setRangeId] = useState("");
  const [generateCount, setGenerateCount] = useState("1");

  const [quantity, setQuantity] = useState("1");

  const canUseDefaults =
    !isEdit &&
    (generatorError ||
      (Array.isArray(defaultValuables) && defaultValuables.length > 0));

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      if (!vaultId) return;
      const res = await getDefaultValuablesAction({ vaultId });
      if (cancelled) return;
      if (!res?.ok) {
        setDefaultValuables([]);
        setGeneratorError(res?.error || "Failed to load categories.");
        return;
      }
      setGeneratorError("");
      setDefaultValuables(Array.isArray(res?.data) ? res.data : []);
    }

    loadCategories();
    return () => {
      cancelled = true;
    };
  }, [vaultId]);

  useEffect(() => {
    setFormError(error || "");
  }, [error]);

  // Hydrate edit
  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      if (!isEdit) {
        setLoading(false);
        return;
      }

      if (!vaultId || !valuableId) {
        setFormError("Valuable is required.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setFormError("");

      try {
        const res = await fetch(
          `/api/vaults/${vaultId}/valuables/${valuableId}`,
          { cache: "no-store" },
        );

        if (!res.ok) {
          throw new Error(`Failed to load valuable (${res.status}).`);
        }

        const json = await res.json().catch(() => null);
        const v = Array.isArray(json?.data) ? json.data[0] : json?.data;
        if (cancelled) return;

        setContainerId(v?.container_id != null ? String(v.container_id) : "");
        setName(v?.name ?? "");

        const base = Number(v?.value) || 0;
        setValueBase(base);

        setValueUnit("common");
        setDisplayValue(
          commonRate ? formatNumberString(base / commonRate) : "",
        );

        setQuantity(String(v?.quantity ?? "1"));
      } catch (e) {
        if (!cancelled) setFormError(e?.message || "Failed to load valuable.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [isEdit, vaultId, valuableId, commonRate]);

  function handleDisplayValueChange(nextStr) {
    setDisplayValue(nextStr);

    const n = asNumber(nextStr);
    if (!Number.isFinite(n)) {
      setValueBase(0);
      return;
    }

    if (valueUnit === "common") {
      setValueBase(n * commonRate);
    } else {
      setValueBase(n);
    }
  }

  function handleValueUnitChange(nextUnit) {
    const unit =
      typeof nextUnit === "string" ? nextUnit : nextUnit?.target?.value;
    if (!unit || unit === valueUnit) return;

    if (unit === "common") {
      setDisplayValue(
        commonRate ? formatNumberString(valueBase / commonRate) : "",
      );
      setValueLabel(commonLabel);
    } else {
      setDisplayValue(formatNumberString(valueBase));
      setValueLabel(baseLabel);
    }

    setValueUnit(unit);
  }

  const { categories, ranges, selectedRange, selectedCategory } =
    useMemo(() => {
      const rows = Array.isArray(defaultValuables) ? defaultValuables : [];
      const categoryList = rows
        .filter((row) => row.parent_id == null)
        .map((row) => ({
          id: String(row.id),
          name: row.name || "Category",
          raw: row,
        }))
        .sort((a, b) =>
          String(a.name).localeCompare(String(b.name), undefined, {
            sensitivity: "base",
          }),
        );

      const rangeList = rows
        .filter(
          (row) => categoryId && String(row.parent_id) === String(categoryId),
        )
        .map((row) => ({
          id: String(row.id),
          low: Number(row.low_value) || 0,
          high: Number(row.high_value) || 0,
          raw: row,
        }))
        .sort((a, b) => a.low - b.low);

      const selected =
        rangeId && rangeList.length > 0
          ? rangeList.find((row) => row.id === rangeId) || null
          : null;
      const category =
        categoryId && categoryList.length > 0
          ? categoryList.find((row) => row.id === categoryId) || null
          : null;

      return {
        categories: categoryList,
        ranges: rangeList,
        selectedRange: selected,
        selectedCategory: category,
      };
    }, [defaultValuables, categoryId, rangeId]);

  const commonCurrencyCode = useMemo(() => {
    return (
      commonCurrency?.code ||
      commonCurrency?.symbol ||
      commonCurrency?.name ||
      "Common"
    );
  }, [commonCurrency]);

  const baseCurrencyCode = useMemo(() => {
    return (
      baseCurrency?.code || baseCurrency?.symbol || baseCurrency?.name || "Base"
    );
  }, [baseCurrency]);

  const valueUnitCode =
    valueUnit === "base" ? baseCurrencyCode : commonCurrencyCode;

  function validateNonNegativeNumber(raw, label) {
    const n = asNumber(raw);
    if (!Number.isFinite(n) || n < 0) return `${label} must be 0 or greater.`;
    return "";
  }

  function formatRangeValue(valueCommon) {
    const n = Number(valueCommon);
    if (!Number.isFinite(n)) return "";
    const baseValue = n * (commonRate || 1);
    const displayValue = valueUnit === "base" ? baseValue : n;
    return formatNumberString(displayValue);
  }

  async function handleGenerate() {
    setGeneratorError("");

    if (!vaultId) return setGeneratorError("Vault is required.");
    if (!containerId) return setGeneratorError("Container is required.");
    if (!selectedCategory) return setGeneratorError("Choose a category.");
    if (!selectedRange) return setGeneratorError("Choose a value range.");

    const qty = Math.max(1, Math.trunc(asNumber(generateCount) || 1));
    const rate = Number(commonRate) || 1;
    const lowValue =
      valueUnit === "common"
        ? Math.round(selectedRange.low)
        : Math.round(selectedRange.low * rate);
    const highValue =
      valueUnit === "common"
        ? Math.round(selectedRange.high)
        : Math.round(selectedRange.high * rate);

    setGeneratorBusy(true);
    const valuableObj = {
      vault_id: vaultId,
      container_id: containerId,
      category_key: toCamelCase(selectedCategory.raw),
      low_value: lowValue,
      high_value: highValue,
      quantity: qty,
      value_unit: valueUnit,
      common_rate: rate,
    };

    try {
      const res = await generateValuablesAction(valuableObj);

      if (!res?.ok) {
        throw new Error(res?.error || "Failed to generate valuables.");
      }

      router.replace(`/account/vaults/${vaultId}/valuables`);
      router.refresh();
    } catch (err) {
      setGeneratorError(err?.message || "Failed to generate valuables.");
    } finally {
      setGeneratorBusy(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    if (!vaultId) return setFormError("Vault is required.");
    if (!name.trim()) return setFormError("Name is required.");
    if (!containerId) return setFormError("Container is required.");
    if (isEdit && !valuableId) return setFormError("Valuable is required.");

    const valueErr = validateNonNegativeNumber(valueBase, "Value");
    if (valueErr) return setFormError(valueErr);

    const qtyErr = validateNonNegativeNumber(quantity, "Quantity");
    if (qtyErr) return setFormError(qtyErr);

    const payload = {
      vault_id: vaultId,
      container_id: containerId,
      name: name.trim(),
      value: Number(valueBase) || 0,
      quantity: Number(quantity) || 0,
    };

    if (onSaved) {
      onSaved(payload);
      return;
    }

    setBusy(true);
    try {
      if (isEdit) {
        const res = await fetch(
          `/api/vaults/${vaultId}/valuables/${valuableId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );

        const json = await res.json().catch(() => null);
        if (!res.ok || json?.ok === false) {
          throw new Error(
            json?.error || `Failed to update valuable (${res.status}).`,
          );
        }
      } else {
        const res = await createValuableAction(payload);
        if (!res?.ok) {
          throw new Error(res?.error || "Failed to create valuable.");
        }
      }

      router.replace(`/account/vaults/${vaultId}/valuables`);
      router.refresh();
    } catch (err) {
      setFormError(err?.message || "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  function handleClose() {
    if (onClose) {
      onClose();
      return;
    }

    router.back();
    router.refresh();
  }

  const valueUnitControl = (
    <div className="flex items-center gap-3">
      <label className="inline-flex items-center gap-2 text-sm text-muted-fg">
        <input
          type="radio"
          name="valueUnit"
          value="common"
          checked={valueUnit === "common"}
          onChange={() => handleValueUnitChange("common")}
          className="h-4 w-4 accent-accent"
        />
        {commonLabel}
      </label>

      <label className="inline-flex items-center gap-2 text-sm text-muted-fg">
        <input
          type="radio"
          name="valueUnit"
          value="base"
          checked={valueUnit === "base"}
          onChange={() => handleValueUnitChange("base")}
          className="h-4 w-4 accent-accent"
        />
        {baseLabel}
      </label>
    </div>
  );

  return (
    <div className="space-y-4">
      {canUseDefaults ? (
        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-fg">
                Generated valuables
              </div>
              <div className="text-xs text-muted-fg">
                Pick a category and value range to generate a new valuable.
              </div>
            </div>

            <Button
              variant="accent"
              onClick={() => setShowDefaults((s) => !s)}
            >
              {showDefaults ? "Hide" : "Generate"}
            </Button>
          </div>

          {showDefaults ? (
            <div className="mt-3 space-y-3">
              {generatorError ? (
                <div className="rounded-xl border border-danger-600 bg-danger-100 p-3 text-sm text-danger-700">
                  {generatorError}
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  id="gen-category"
                  label="Category"
                  hint="Choose a type of valuable."
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    setRangeId("");
                  }}
                >
                  <option value="">Choose...</option>
                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </Select>

                <Select
                  id="gen-range"
                  label="Range"
                  hint={
                    categoryId
                      ? "Select a value band."
                      : "Pick a category first."
                  }
                  value={rangeId}
                  onChange={(e) => setRangeId(e.target.value)}
                  disabled={!categoryId}
                >
                  <option value="">Choose...</option>
                  {ranges.map((range) => (
                    <option
                      key={range.id}
                      value={range.id}
                    >
                      ({formatRangeValue(range.low)} -{" "}
                      {formatRangeValue(range.high)}) {valueUnitCode}
                    </option>
                  ))}
                </Select>
              </div>

              <InputComponent
                id="gen-quantity"
                label="How many"
                type="number"
                min={1}
                value={generateCount}
                onChange={(e) => setGenerateCount(e.target.value)}
              />

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="accent"
                  disabled={generatorBusy}
                  onClick={handleGenerate}
                >
                  {generatorBusy ? "Generating..." : "Generate valuables"}
                </Button>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-card p-5 text-fg"
      >
        {loading ? <div className="text-sm text-muted-fg">Loading…</div> : null}

        {formError ? (
          <div className="rounded-xl border border-danger-600 bg-danger-100 p-3 text-sm text-danger-700">
            {formError}
          </div>
        ) : null}

        <Select
          id="containerId"
          label="Container"
          hint="Where this valuable is stored"
          value={containerId}
          onChange={(e) => setContainerId(e.target.value)}
        >
          <option value="">Choose a container…</option>
          {containerOptions.map((o) => (
            <option
              key={o.value}
              value={o.value}
            >
              {o.label}
            </option>
          ))}
        </Select>

        <InputComponent
          id="name"
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <InputComponent
            id="displayValue"
            label="Value"
            labelRight={valueUnitControl}
            hint={`Enter value in ${commonLabel} or ${baseLabel}.`}
            value={displayValue}
            onChange={(e) => handleDisplayValueChange(e.target.value)}
          />

          <InputComponent
            id="quantity"
            label="Quantity"
            hint="How many of this item are you giving."
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || loading}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting || loading}
            onClick={handleClose}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

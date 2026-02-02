/**
 * Reward prep wizard step 3.
 */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useWatch } from "react-hook-form";
import { Button } from "@/app/_components/Button";
import DefaultTreasurePicker from "@/app/_components/DefaultTreasurePicker";
import Select from "@/app/_components/Select";
import SubCard from "@/app/_components/SubCard";
import InputComponent from "@/app/_components/InputComponent";
import Textarea from "@/app/_components/Textarea";
import { getDefaultTreasuresAction } from "@/app/_lib/actions/treasures";

function asNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}

function formatNumberString(n) {
  if (!Number.isFinite(n)) return "";
  const rounded = Math.round((n + Number.EPSILON) * 100000) / 100000;
  return String(rounded);
}

/**
 * Reward prep wizard step 3.
 * @param {{ form: any }} props
 * @returns {JSX.Element}
 */
export default function RewardPrepStepTreasures({ form, vault }) {
  const { control } = form;

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "treasures",
  });

  const valueUnit = useWatch({ control, name: "value_unit" }) || "common";
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formError, setFormError] = useState("");
  const [defaultsError, setDefaultsError] = useState("");
  const [showDefaults, setShowDefaults] = useState(false);
  const [defaultTreasures, setDefaultTreasures] = useState([]);
  const [isEditingValue, setIsEditingValue] = useState(false);
  const [draft, setDraft] = useState({
    container_id: "",
    name: "",
    genericname: "",
    description: "",
    valueBase: 0,
    valueUnit: "common",
    displayValue: "",
    quantity: "1",
    identified: false,
    magical: false,
    archived: false,
  });

  const rows = useMemo(() => (Array.isArray(fields) ? fields : []), [fields]);

  const currencyList = useMemo(() => {
    return Array.isArray(vault?.currencyList) ? vault.currencyList : [];
  }, [vault]);

  const commonCurrencyId =
    vault?.common_currency_id != null ? String(vault.common_currency_id) : "";
  const baseCurrencyId =
    vault?.base_currency_id != null ? String(vault.base_currency_id) : "";

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

  const baseLabel = baseCurrency?.name || "Base";
  const commonLabel = commonCurrency?.name || "Common";
  const baseCode =
    baseCurrency?.code || baseCurrency?.symbol || baseCurrency?.name || "Base";
  const commonCode =
    commonCurrency?.code ||
    commonCurrency?.symbol ||
    commonCurrency?.name ||
    "Common";

  const commonRate = Number(commonCurrency?.rate) || 1;
  const valueUnitLabel = valueUnit === "base" ? baseLabel : commonLabel;

  const containerOptions = useMemo(() => {
    const list = Array.isArray(vault?.containerList) ? vault.containerList : [];
    return list.map((c) => ({
      value: String(c.id),
      label: c.name,
    }));
  }, [vault]);

  useEffect(() => {
    let cancelled = false;

    async function loadDefaults() {
      if (!vault?.id) return;
      setDefaultsError("");
      const res = await getDefaultTreasuresAction({ vaultId: vault.id });
      if (cancelled) return;
      if (!res?.ok) {
        setDefaultsError(res?.error || "Default treasures could not load.");
        setDefaultTreasures([]);
        return;
      }
      setDefaultTreasures(Array.isArray(res?.data) ? res.data : []);
    }

    loadDefaults();
    return () => {
      cancelled = true;
    };
  }, [vault?.id]);

  function resetDraft(next = {}) {
    setDraft({
      container_id: "",
      name: "",
      genericname: "",
      description: "",
      valueBase: 0,
      valueUnit,
      displayValue: "",
      quantity: "1",
      identified: false,
      magical: false,
      archived: false,
      ...next,
    });
  }

  function formatValueForUnit(valueBase, unit) {
    if (!Number.isFinite(valueBase)) return "";
    if (unit === "common") {
      return commonRate ? formatNumberString(valueBase / commonRate) : "";
    }
    return formatNumberString(valueBase);
  }

  function startAdd() {
    setFormError("");
    setEditingIndex(null);
    resetDraft();
    setIsAdding(true);
  }

  function startEdit(index) {
    const row = rows[index];
    if (!row) return;
    setFormError("");
    setEditingIndex(index);

    const base = Number(row.value) || 0;
    const nextValueUnit = valueUnit;
    const displayValue = formatValueForUnit(base, nextValueUnit);

    resetDraft({
      container_id: row.container_id ?? "",
      name: row.name ?? "",
      genericname: row.genericname ?? "",
      description: row.description ?? "",
      valueBase: base,
      valueUnit: nextValueUnit,
      displayValue,
      quantity:
        row.quantity == null || Number.isNaN(Number(row.quantity))
          ? "1"
          : String(row.quantity),
      identified: Boolean(row.identified),
      magical: Boolean(row.magical),
      archived: Boolean(row.archived),
    });
    setIsAdding(true);
  }

  function closeForm() {
    setIsAdding(false);
    setEditingIndex(null);
    setFormError("");
  }

  function validateDraft(next) {
    if (!next.container_id) return "Container is required.";
    if (!next.name.trim()) return "Treasure name is required.";
    const value = Number(next.valueBase);
    if (!Number.isFinite(value) || value < 0) return "Value must be 0 or more.";
    const quantity = Number(next.quantity);
    if (!Number.isFinite(quantity) || quantity < 0)
      return "Quantity must be 0 or more.";
    return "";
  }

  function handleSave(e) {
    e?.preventDefault();
    setFormError("");

    const error = validateDraft(draft);
    if (error) {
      setFormError(error);
      return;
    }

    const payload = {
      container_id: draft.container_id,
      name: draft.name.trim(),
      genericname: draft.genericname.trim() || null,
      description: draft.description.trim() || null,
      value: Number(draft.valueBase) || 0,
      quantity: Number(draft.quantity) || 0,
      identified: draft.magical ? Boolean(draft.identified) : false,
      magical: Boolean(draft.magical),
      archived: Boolean(draft.archived),
    };

    if (editingIndex != null) {
      update(editingIndex, payload);
    } else {
      append(payload);
    }

    closeForm();
  }

  function handleDisplayValueChange(nextStr) {
    setDraft((prev) => {
      const n = asNumber(nextStr);
      let valueBase = 0;
      if (Number.isFinite(n)) {
        valueBase = valueUnit === "common" ? n * commonRate : n;
      }
      return {
        ...prev,
        displayValue: nextStr,
        valueBase,
      };
    });
  }

  function applyDefaultTreasure(t) {
    const base = Number(t?.value) || 0;
    setDraft((prev) => ({
      ...prev,
      name: t?.name ?? "",
      valueBase: base,
      displayValue: formatValueForUnit(base, valueUnit),
    }));
  }

  function fmtMoney(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "";
    return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-primary-700 overflow-hidden bg-primary-700 text-primary-50">
        <div className="px-4 py-3 flex items-center justify-between border-b border-primary-900">
          <div className="text-sm opacity-90">
            {rows.length} treasure item{rows.length === 1 ? "" : "s"}
          </div>

          <Button
            type="button"
            variant="accent"
            size="sm"
            onClick={startAdd}
            disabled={isAdding}
          >
            Add treasure
          </Button>
        </div>
        {isAdding ? (
          <SubCard className="space-y-4">
            <div className="text-sm font-semibold text-fg">
              {editingIndex != null ? "Edit treasure" : "Add treasure"}
            </div>

            {formError ? (
              <div className="rounded-xl border border-danger-600 bg-danger-100 p-3 text-sm text-danger-700">
                {formError}
              </div>
            ) : null}

            {!defaultsError && defaultTreasures.length > 0 ? (
              <section className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-fg">
                      Game system default treasures
                    </div>
                    <div className="text-xs text-muted-fg">
                      Pick one to prefill name and value, then tweak below.
                    </div>
                  </div>

                  <Button
                    variant="accent"
                    size="sm"
                    type="button"
                    onClick={() => setShowDefaults((s) => !s)}
                  >
                    {showDefaults ? "Hide" : "Use defaults"}
                  </Button>
                </div>

                {showDefaults ? (
                  <div className="mt-3 max-h-64 overflow-auto rounded-xl border border-border bg-surface p-2">
                    <DefaultTreasurePicker
                      items={defaultTreasures}
                      valueUnit={valueUnit}
                      commonRate={commonRate}
                      commonCode={commonCode}
                      baseCode={baseCode}
                      onPick={(picked) => {
                        applyDefaultTreasure(picked);
                        setShowDefaults(false);
                      }}
                    />
                  </div>
                ) : null}
              </section>
            ) : null}

            {defaultsError ? (
              <div className="rounded-xl border border-danger-600 bg-danger-100 p-3 text-sm text-danger-700">
                {defaultsError}
              </div>
            ) : null}

            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-[2fr,1fr,1fr]">
                <Select
                  id="container_id"
                  label="Container"
                  hint="Where this treasure is stored"
                  value={draft.container_id}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      container_id: e.target.value,
                    }))
                  }
                >
                  <option value="">Choose a container...</option>
                  {containerOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </Select>

                <InputComponent
                  label="Name"
                  placeholder="Ancient coin"
                  value={draft.name}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div className="grid gap-3 md:grid-cols-[2fr,1fr]">
                <InputComponent
                  label="Qty"
                  type="number"
                  min={0}
                  value={draft.quantity}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, quantity: e.target.value }))
                  }
                />

                <InputComponent
                  id="displayValue"
                  label={`Book value (${valueUnitLabel})`}
                  hint={`Enter value in ${valueUnitLabel}.`}
                  value={
                    isEditingValue
                      ? draft.displayValue
                      : formatValueForUnit(draft.valueBase, valueUnit)
                  }
                  onChange={(e) => handleDisplayValueChange(e.target.value)}
                  onFocus={() => setIsEditingValue(true)}
                  onBlur={() => {
                    setIsEditingValue(false);
                    setDraft((prev) => ({
                      ...prev,
                      displayValue: formatValueForUnit(
                        prev.valueBase,
                        valueUnit,
                      ),
                    }));
                  }}
                />
              </div>

              <Textarea
                label="Description"
                rows={3}
                placeholder="Optional description"
                value={draft.description}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <InputComponent
                  id="magical"
                  label="Magical"
                  type="checkbox"
                  checked={draft.magical}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      magical: e.target.checked,
                      identified: e.target.checked ? prev.identified : false,
                    }))
                  }
                />
                {draft.magical ? (
                  <InputComponent
                    id="identified"
                    label="Identified"
                    type="checkbox"
                    checked={draft.identified}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        identified: e.target.checked,
                      }))
                    }
                  />
                ) : null}
              </div>

              {draft.magical && !draft.identified ? (
                <InputComponent
                  label="Generic name"
                  hint="Name to be displayed before the item is identified"
                  placeholder="Mysterious sword"
                  value={draft.genericname}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      genericname: e.target.value,
                    }))
                  }
                />
              ) : null}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                >
                  {editingIndex != null ? "Update" : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={closeForm}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </SubCard>
        ) : null}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-accent-500 border-b border-primary-900">
              <tr className="text-left text-fg">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Magical</th>
                <th className="px-4 py-3 w-40">Actions</th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-6 text-muted-fg bg-card"
                    colSpan={7}
                  >
                    No treasure in this reward yet.
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className="border-b border-border last:border-b-0 hover:bg-surface hover:text-fg transition-colors bg-card text-muted-fg"
                  >
                    <td className="px-4 py-3 font-medium">
                      {row.name}
                      {row.genericname ? (
                        <div className="text-xs text-muted-fg">
                          {row.genericname}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      {`${fmtMoney(
                        valueUnit === "common"
                          ? (Number(row.value) || 0) / (commonRate || 1)
                          : Number(row.value) || 0,
                      )} ${valueUnit === "common" ? commonCode : baseCode}`}
                    </td>
                    <td className="px-4 py-3">{row.quantity ?? 0}</td>
                    <td className="px-4 py-3">{row.magical ? "Yes" : ""}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => startEdit(index)}
                          disabled={isAdding}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

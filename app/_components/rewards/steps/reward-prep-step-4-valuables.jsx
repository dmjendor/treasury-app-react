/**
 * Reward prep wizard step 4.
 */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray } from "react-hook-form";
import { Button } from "@/app/_components/Button";
import SubCard from "@/app/_components/SubCard";
import InputComponent from "@/app/_components/InputComponent";
import Select from "@/app/_components/Select";
import {
  generateValuablesAction,
  getDefaultValuablesAction,
} from "@/app/_lib/actions/valuables";

/**
 * Reward prep wizard step 4.
 * @param {{ form: any }} props
 * @returns {JSX.Element}
 */
export default function RewardPrepStepValuables({ form, vault }) {
  const {
    control,
  } = form;

  const router = useRouter();
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "valuables",
  });

  const rows = useMemo(() => (Array.isArray(fields) ? fields : []), [fields]);

  const [formError, setFormError] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [draft, setDraft] = useState({
    name: "",
    quantity: "1",
    value: "",
  });

  const [showGenerator, setShowGenerator] = useState(false);
  const [generatorError, setGeneratorError] = useState("");
  const [generatorBusy, setGeneratorBusy] = useState(false);
  const [defaultValuables, setDefaultValuables] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [rangeId, setRangeId] = useState("");
  const [generatorContainerId, setGeneratorContainerId] = useState("");
  const [generateCount, setGenerateCount] = useState("1");
  const [showManualForm, setShowManualForm] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      if (!vault?.id) return;
      const res = await getDefaultValuablesAction({ vaultId: vault.id });
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
  }, [vault?.id]);

  const { categories, ranges, selectedRange, selectedCategory } = useMemo(() => {
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
      .filter((row) => categoryId && String(row.parent_id) === String(categoryId))
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
    const list = Array.isArray(vault?.currencyList) ? vault.currencyList : [];
    const common =
      list.find(
        (currency) =>
          String(currency.id) === String(vault?.common_currency_id ?? ""),
      ) || null;
    return (
      common?.code || common?.symbol || common?.name || "Common"
    );
  }, [vault]);

  const containerOptions = useMemo(() => {
    const list = Array.isArray(vault?.containerList) ? vault.containerList : [];
    return list.map((c) => ({
      value: String(c.id),
      label: c.name,
    }));
  }, [vault]);

  function resolveCategoryKey(row) {
    if (!row) return "";
    if (row.category_key) return String(row.category_key);
    if (row.key) return String(row.key);
    if (row.slug) return String(row.slug);
    return String(row.name || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  function resetDraft(next = {}) {
    setDraft({
      name: "",
      quantity: "1",
      value: "",
      ...next,
    });
  }

  function startEdit(index) {
    const row = rows[index];
    if (!row) return;
    setFormError("");
    setEditingIndex(index);
    resetDraft({
      name: row.name ?? "",
      quantity:
        row.quantity == null || Number.isNaN(Number(row.quantity))
          ? "1"
          : String(row.quantity),
      value:
        row.value == null || Number.isNaN(Number(row.value))
          ? ""
          : String(row.value),
    });
  }

  function closeEdit() {
    setEditingIndex(null);
    setFormError("");
    resetDraft();
  }

  function validateDraft(next) {
    if (!next.name.trim()) return "Valuable name is required.";
    const value = Number(next.value);
    if (!Number.isFinite(value) || value < 0)
      return "Value must be 0 or more.";
    const quantity = Number(next.quantity);
    if (!Number.isFinite(quantity) || quantity < 1)
      return "Quantity must be at least 1.";
    return "";
  }

  function handleSave() {
    setFormError("");

    const error = validateDraft(draft);
    if (error) {
      setFormError(error);
      return;
    }

    const payload = {
      name: draft.name.trim(),
      quantity: Number(draft.quantity) || 1,
      value: Number(draft.value) || 0,
    };

    if (editingIndex != null) {
      update(editingIndex, payload);
    } else {
      append(payload);
    }

    closeEdit();
  }

  async function handleGenerate() {
    setGeneratorError("");

    if (!vault?.id) return setGeneratorError("Vault is required.");
    if (!selectedCategory) return setGeneratorError("Choose a category.");
    if (!selectedRange) return setGeneratorError("Choose a value range.");
    if (!generatorContainerId) {
      return setGeneratorError("Choose a container.");
    }

    const qty = Math.max(1, Math.trunc(Number(generateCount) || 1));

    setGeneratorBusy(true);
    try {
      const res = await generateValuablesAction({
        vault_id: String(vault.id),
        container_id: generatorContainerId,
        category_key: resolveCategoryKey(selectedCategory.raw),
        low_value: Math.round(selectedRange.low),
        high_value: Math.round(selectedRange.high),
        quantity: qty,
        target: "prepvaluables",
      });

      if (!res?.ok) {
        throw new Error(res?.error || "Failed to generate valuables.");
      }

      const created = Array.isArray(res?.data) ? res.data : [];
      if (created.length > 0) {
        append(
          created.map((row) => ({
            name: row.name ?? "Valuable",
            quantity: row.quantity ?? 1,
            value: row.value ?? 0,
          })),
        );
      }

      router.refresh();
    } catch (err) {
      setGeneratorError(err?.message || "Failed to generate valuables.");
    } finally {
      setGeneratorBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-fg">
              Generated valuables
            </div>
          <div className="text-xs text-muted-fg">
            Pick a category and value range to generate valuables.
          </div>
        </div>

          <Button
            variant="accent"
            size="sm"
            type="button"
            onClick={() => setShowGenerator((s) => !s)}
          >
            {showGenerator ? "Hide" : "Generate"}
          </Button>
        </div>

          {showGenerator ? (
            <div className="mt-3 space-y-3">
              {generatorError ? (
                <div className="rounded-xl border border-danger-600 bg-danger-100 p-3 text-sm text-danger-700">
                  {generatorError}
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  id="prep-gen-container"
                  label="Container"
                  hint="Where generated valuables should be stored."
                  value={generatorContainerId}
                  onChange={(e) => setGeneratorContainerId(e.target.value)}
                >
                  <option value="">Choose...</option>
                  {containerOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </Select>

                <Select
                  id="prep-gen-category"
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
                  id="prep-gen-range"
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
                    ({range.low} - {range.high}) {commonCurrencyCode}
                  </option>
                ))}
                </Select>
              </div>

              <InputComponent
                id="prep-gen-quantity"
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
                size="sm"
                disabled={generatorBusy}
                onClick={handleGenerate}
              >
                {generatorBusy ? "Generating..." : "Generate valuables"}
              </Button>
              </div>
            </div>
          ) : null}
        </section>

      {showManualForm ? (
        <SubCard className="space-y-3">
          <div className="text-sm font-semibold text-fg">
            {editingIndex != null ? "Edit valuable" : "Add valuable"}
          </div>

          {formError ? (
            <div className="rounded-xl border border-danger-600 bg-danger-100 p-3 text-sm text-danger-700">
              {formError}
            </div>
          ) : null}

          <div className="grid gap-3 md:grid-cols-[2fr,1fr,1fr]">
            <InputComponent
              label="Name"
              placeholder="Jeweled goblet"
              value={draft.name}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, name: e.target.value }))
              }
            />

            <InputComponent
              label="Qty"
              type="number"
              min={1}
              value={draft.quantity}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, quantity: e.target.value }))
              }
            />

            <InputComponent
              label="Value"
              type="number"
              min={0}
              value={draft.value}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, value: e.target.value }))
              }
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSave}
            >
              {editingIndex != null ? "Update valuable" : "Add valuable"}
            </Button>
            {editingIndex != null ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={closeEdit}
              >
                Cancel
              </Button>
            ) : null}
          </div>
        </SubCard>
      ) : null}

      <div className="rounded-2xl border border-primary-700 overflow-hidden bg-primary-700 text-primary-50">
        <div className="px-4 py-3 flex items-center justify-between border-b border-primary-900">
          <div className="text-sm opacity-90">
            {rows.length} valuable item{rows.length === 1 ? "" : "s"}
          </div>
          <Button
            type="button"
            variant="accent"
            size="sm"
            onClick={() => setShowManualForm((s) => !s)}
          >
            {showManualForm ? "Hide form" : "Add valuable"}
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-accent-500 border-b border-primary-900">
              <tr className="text-left text-fg">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3 w-40">Actions</th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-6 text-muted-fg bg-card"
                    colSpan={4}
                  >
                    No valuable in this reward yet.
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className="border-b border-border last:border-b-0 hover:bg-surface hover:text-fg transition-colors bg-card text-muted-fg"
                  >
                    <td className="px-4 py-3 font-medium">{row.name}</td>
                    <td className="px-4 py-3">{row.value ?? 0}</td>
                    <td className="px-4 py-3">{row.quantity ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => startEdit(index)}
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

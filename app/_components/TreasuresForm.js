"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Select from "@/app/_components/Select";
import { Button } from "@/app/_components/Button";
import DefaultTreasurePicker from "@/app/_components/DefaultTreasurePicker";
import InputComponent from "@/app/_components/InputComponent";
import Textarea from "@/app/_components/Textarea";

function asNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}

function formatNumberString(n) {
  if (!Number.isFinite(n)) return "";
  const rounded = Math.round((n + Number.EPSILON) * 100000) / 100000;
  return String(rounded);
}

export default function TreasuresForm({
  mode, // "new" | "edit"
  vault,
  updateVault, // optional, parent can pass but form doesn't require it
  treasureId, // required for edit
  onClose,
  onSaved, // called with payload on submit

  defaultTreasures, // optional list for "new"
  submitting = false,
  error = "",
}) {
  const isEdit = mode === "edit";
  const vaultId = vault?.id != null ? String(vault.id) : "";
  const { data: session } = useSession();
  const isOwner =
    session?.user?.userId &&
    vault?.user_id &&
    String(session.user.userId) === String(vault.user_id);

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

  const baseLabel =
    baseCurrency?.code || baseCurrency?.symbol || baseCurrency?.name || "Base";

  const commonLabel =
    commonCurrency?.code ||
    commonCurrency?.symbol ||
    commonCurrency?.name ||
    "Common";

  const commonRate = Number(commonCurrency?.rate) || 1;

  const [formError, setFormError] = useState(error || "");
  const [loading, setLoading] = useState(isEdit);

  const [containerId, setContainerId] = useState("");
  const [name, setName] = useState("");
  const [genericname, setGenericname] = useState("");
  const [description, setDescription] = useState("");
  const [gmNotes, setGmNotes] = useState("");

  const [valueBase, setValueBase] = useState(0);
  const [valueUnit, setValueUnit] = useState("common"); // "common" | "base"
  const [displayValue, setDisplayValue] = useState("");

  const [quantity, setQuantity] = useState("1");
  const [identified, setIdentified] = useState(false);
  const [magical, setMagical] = useState(false);
  const [archived, setArchived] = useState(false);
  const [showDefaults, setShowDefaults] = useState(false);

  const canUseDefaults =
    !isEdit && Array.isArray(defaultTreasures) && defaultTreasures.length > 0;

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

      if (!vaultId || !treasureId) {
        setFormError("Treasure is required.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setFormError("");

      try {
        const res = await fetch(
          `/api/vaults/${vaultId}/treasures/${treasureId}`,
          {
            cache: "no-store",
          },
        );

        if (!res.ok) {
          throw new Error(`Failed to load treasure (${res.status}).`);
        }

        const json = await res.json().catch(() => null);
        const t = Array.isArray(json?.data) ? json.data[0] : json?.data;
        if (cancelled) return;

        setContainerId(t?.container_id != null ? String(t.container_id) : "");
        setName(t?.name ?? "");
        setGenericname(t?.genericname ?? "");
        setDescription(t?.description ?? "");
        setGmNotes(t?.gm_notes ?? "");

        const base = Number(t?.value) || 0;
        setValueBase(base);

        // keep UI in common unless user switches
        setValueUnit("common");
        setDisplayValue(
          commonRate ? formatNumberString(base / commonRate) : "",
        );

        setQuantity(String(t?.quantity ?? "1"));
        setIdentified(Boolean(t?.identified));
        setMagical(Boolean(t?.magical));
        setArchived(Boolean(t?.archived));
      } catch (e) {
        if (!cancelled) setFormError(e?.message || "Failed to load treasure.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [isEdit, vaultId, treasureId, commonRate]);

  function applyDefaultTreasure(t) {
    setName(t?.name ?? "");

    const base = Number(t?.value) || 0;
    setValueBase(base);

    if (valueUnit === "common") {
      setDisplayValue(commonRate ? formatNumberString(base / commonRate) : "");
    } else {
      setDisplayValue(formatNumberString(base));
    }
  }

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
    if (nextUnit === valueUnit) return;

    if (nextUnit === "common") {
      setDisplayValue(
        commonRate ? formatNumberString(valueBase / commonRate) : "",
      );
    } else {
      setDisplayValue(formatNumberString(valueBase));
    }

    setValueUnit(nextUnit);
  }

  function validateNonNegativeNumber(raw, label) {
    const n = asNumber(raw);
    if (!Number.isFinite(n) || n < 0) return `${label} must be 0 or greater.`;
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    if (!vaultId) return setFormError("Vault is required.");
    if (!name.trim()) return setFormError("Name is required.");
    if (!containerId) return setFormError("Container is required.");
    if (isEdit && !treasureId) return setFormError("Treasure is required.");

    const valueErr = validateNonNegativeNumber(valueBase, "Value");
    if (valueErr) return setFormError(valueErr);

    const qtyErr = validateNonNegativeNumber(quantity, "Quantity");
    if (qtyErr) return setFormError(qtyErr);

    const payload = {
      vault_id: vaultId,
      container_id: containerId,
      name: name.trim(),
      genericname: genericname.trim() || null,
      description: description.trim() || null,
      value: Number(valueBase) || 0,
      quantity: Number(quantity) || 0,
      identified: !!identified,
      magical: !!magical,
      archived: !!archived,
    };
    if (isOwner) {
      payload.gm_notes = gmNotes.trim() || null;
    }

    onSaved?.(payload);
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
                Game system default treasures
              </div>
              <div className="text-xs text-muted-fg">
                Pick one to prefill name and value, then tweak below.
              </div>
            </div>

            <Button
              variant="accent"
              onClick={() => setShowDefaults((s) => !s)}
            >
              {showDefaults ? "Hide" : "Use defaults"}
            </Button>
          </div>

          {showDefaults ? (
            <div className="mt-3 max-h-64 overflow-auto rounded-xl border border-border bg-surface p-2">
              <DefaultTreasurePicker
                items={defaultTreasures}
                onPick={(picked) => {
                  applyDefaultTreasure(picked);
                  setShowDefaults(false);
                }}
              />
            </div>
          ) : null}
        </section>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-border bg-card p-5 text-fg space-y-4"
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
          hint="Where this treasure is stored"
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


        <Textarea
          label="Description"
          hint="Optional notes, inscriptions, etc."
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />

        {isOwner ? (
          <Textarea
            label="GM notes"
            hint="Private notes for the GM only."
            id="gm_notes"
            value={gmNotes}
            onChange={(e) => setGmNotes(e.target.value)}
            rows={4}
          />
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <InputComponent
            id="displayValue"
            label="Book value"
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

        <div className="grid gap-3 sm:grid-cols-2">
          <InputComponent
            id="magical"
            label="Magical"
            type="checkbox"
            checked={magical}
            onChange={(e) => setMagical(e.target.checked)}
          />
          {magical && (
            <InputComponent
              id="identified"
              label="Identified"
              type="checkbox"
              checked={identified}
              onChange={(e) => setIdentified(e.target.checked)}
            />
          )}
        </div>

        {magical && !identified ? (
          <InputComponent
            id="genericname"
            label="Generic name"
            hint="Optional. Example: Mysterious Sword."
            value={genericname}
            onChange={(e) => setGenericname(e.target.value)}
          />
        ) : null}

        {isEdit ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <InputComponent
              id="archived"
              label="Archived"
              type="checkbox"
              checked={archived}
              onChange={(e) => setArchived(e.target.checked)}
            />
          </div>
        ) : null}

        <div className="flex gap-2 pt-2">
          <Button
            type="submit"
            variant="primary"
            disabled={submitting || loading}
          >
            {submitting ? "Saving…" : "Save"}
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={submitting || loading}
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

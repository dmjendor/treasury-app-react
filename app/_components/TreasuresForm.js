"use client";

import React, { useMemo, useState } from "react";
import FormField from "@/app/_components/FormField";
import Select from "@/app/_components/Select";
import { Button } from "@/app/_components/Button";
import DefaultTreasurePicker from "@/app/_components/DefaultTreasurePicker";
import InputComponent from "@/app/_components/InputComponent";
import Textarea from "@/app/_components/Textarea";

function asNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : -1;
}

function formatNumberString(n) {
  if (!Number.isFinite(n)) return "";
  const rounded = Math.round((n + Number.EPSILON) * 100000) / 100000;
  return String(rounded);
}

export default function TreasureForm({
  vaultId,
  containers,
  defaultTreasures,
  systemId,

  currencyList,
  commonCurrencyId,
  baseCurrencyId,

  submitting,
  error,
  onSubmit,
  onCancel,
  isEdit,
}) {
  const canUseDefaults =
    !!systemId &&
    Array.isArray(defaultTreasures) &&
    defaultTreasures.length > 0;

  const containerOptions = useMemo(() => {
    return (Array.isArray(containers) ? containers : []).map((c) => ({
      value: c.id,
      label: c.name,
    }));
  }, [containers]);

  const baseCurrency = useMemo(() => {
    return (Array.isArray(currencyList) ? currencyList : []).find(
      (c) => c.id === baseCurrencyId
    );
  }, [currencyList, baseCurrencyId]);
  const baseLabel =
    baseCurrency?.code ||
    baseCurrency?.symbol ||
    baseCurrency?.name ||
    "Common";

  const commonCurrency = useMemo(() => {
    return (Array.isArray(currencyList) ? currencyList : []).find(
      (c) => c.id === commonCurrencyId
    );
  }, [currencyList, commonCurrencyId]);

  const commonRate = Number(commonCurrency?.rate) || 1;

  const commonLabel =
    commonCurrency?.code ||
    commonCurrency?.symbol ||
    commonCurrency?.name ||
    "Common";

  const [formError, setFormError] = useState(error);
  const [containerId, setContainerId] = useState("");
  const [name, setName] = useState("");
  const [genericname, setGenericname] = useState("");
  const [description, setDescription] = useState("");

  const [valueBase, setValueBase] = useState(0);
  const [valueUnit, setValueUnit] = useState("common"); // "common" | "base"
  const [displayValue, setDisplayValue] = useState(0);

  const [quantity, setQuantity] = useState("1");

  const [identified, setIdentified] = useState(false);
  const [magical, setMagical] = useState(false);
  const [archived, setArchived] = useState(false);

  function applyDefaultTreasure(t) {
    setName(t?.name ?? "");

    const base = asNumber(t?.value);
    setValueBase(base);

    if (valueUnit === "common") {
      setDisplayValue(commonRate ? formatNumberString(base / commonRate) : "");
    } else {
      setDisplayValue(formatNumberString(base));
    }
  }

  function handleDisplayValueChange(nextStr) {
    setDisplayValue(nextStr);
    const n = asNumber(nextStr, 0);

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
        commonRate ? formatNumberString(valueBase / commonRate) : ""
      );
    } else {
      setDisplayValue(formatNumberString(valueBase));
    }

    setValueUnit(nextUnit);
  }

  function verifyNumber(value, type) {
    console.log(value, type);
    const number = asNumber(value);
    if (number < 0)
      setFormError(
        `You must enter a ${type} that is greater than or equal to zero.`
      );

    return number;
  }

  function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    const valueToUse = verifyNumber(valueBase, "value");
    const quantityToUse = verifyNumber(quantity, "quantity");
    if (valueToUse < 0 || quantityToUse < 0) return;

    const payload = {
      vault_id: vaultId,
      container_id: containerId,
      name: name.trim(),
      genericname: genericname.trim() || null,
      description: description.trim() || null,
      value: valueToUse,
      quantity: quantityToUse,
      identified: !!identified,
      magical: !!magical,
      archived: !!archived,
    };

    onSubmit?.(payload);
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
          className="h-4 w-4 accent-accent-100"
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
          className="h-4 w-4 accent-accent-100"
        />
        {baseLabel}
      </label>
    </div>
  );

  return (
    <div className="space-y-4">
      {canUseDefaults ? (
        <div className="rounded-2xl border border-border bg-urface-800 p-4">
          <DefaultTreasurePicker
            items={defaultTreasures}
            onPick={applyDefaultTreasure}
          />
          <div className="mt-3 text-xs text-muted-fg">
            Picking an item fills name and value. You can still edit everything
            below.
          </div>
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-border bg-card text-card-fg p-5 space-y-4"
      >
        {formError ? (
          <div className="rounded-xl border border-danger-600 bg-danger-100 p-3 text-sm">
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

        <InputComponent
          id="genericname"
          label="Generic name"
          hint="Optional. Example: “Mysterious Sword”."
          value={genericname}
          onChange={(e) => setGenericname(e.target.value)}
        />

        <Textarea
          label="Description"
          hint="Optional notes, inscriptions, etc."
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <input
            type="hidden"
            name="valueBase"
            value={formatNumberString(valueBase)}
          />

          <InputComponent
            id="displayValue"
            label="Book value"
            labelRight={valueUnitControl}
            hint={`Enter value in ${commonLabel} or ${baseLabel}.`}
            value={displayValue}
            onChange={(e) => handleDisplayValueChange(e.target.value)}
          />

          <InputComponent
            label="Quantity"
            hint="How many of this item are you giving."
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <InputComponent
            id="identified"
            label="Identified"
            type="checkbox"
            checked={identified}
            onChange={(e) => setIdentified(e.target.checked)}
          />
          <InputComponent
            id="magical"
            label="Magical"
            type="checkbox"
            checked={magical}
            onChange={(e) => setMagical(e.target.checked)}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {isEdit ? (
            <InputComponent
              id="archived"
              label="Archived"
              type="checkbox"
              checked={archived}
              onChange={(e) => setArchived(e.target.checked)}
            />
          ) : null}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            type="submit"
            variant="primary"
            disabled={submitting}
          >
            {submitting ? "Saving…" : "Save"}
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

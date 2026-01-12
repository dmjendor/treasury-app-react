"use client";

import React, { useMemo, useState } from "react";
import FormField from "@/app/_components/FormField";
import Select from "@/app/_components/Select";
import { Button } from "@/app/_components/Button";
import DefaultTreasurePicker from "@/app/_components/DefaultTreasurePicker";
import InputComponent from "@/app/_components/InputComponent";
import Textarea from "@/app/_components/Textarea";

function asNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export default function TreasureForm({
  vaultId, // not required by the form itself, but often handy for callers
  containers,
  defaultTreasures,
  editionId,
  initialValues,
  submitting,
  error,
  onSubmit,
  onCancel,
}) {
  const canUseDefaults =
    !!editionId &&
    Array.isArray(defaultTreasures) &&
    defaultTreasures.length > 0;

  const containerOptions = useMemo(() => {
    return (Array.isArray(containers) ? containers : []).map((c) => ({
      value: c.id,
      label: c.name,
    }));
  }, [containers]);

  const [containerId, setContainerId] = useState(
    initialValues?.container_id ?? ""
  );
  const [name, setName] = useState(initialValues?.name ?? "");
  const [genericname, setGenericname] = useState(
    initialValues?.genericname ?? ""
  );
  const [description, setDescription] = useState(
    initialValues?.description ?? ""
  );
  const [value, setValue] = useState(
    initialValues?.value != null ? String(initialValues.value) : ""
  );
  const [quantity, setQuantity] = useState(
    initialValues?.quantity != null ? String(initialValues.quantity) : "1"
  );
  const [location, setLocation] = useState(initialValues?.location ?? "");
  const [identified, setIdentified] = useState(!!initialValues?.identified);
  const [archived, setArchived] = useState(!!initialValues?.archived);

  function applyDefaultTreasure(t) {
    setName(t?.name ?? "");
    setValue(t?.value != null ? String(t.value) : "");
  }

  function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      vault_id: vaultId,
      container_id: containerId,
      name: name.trim(),
      genericname: genericname.trim() || null,
      description: description.trim() || null,
      value: asNumber(value, 0),
      quantity: Math.max(0, asNumber(quantity, 1)),
      location: location.trim() || null,
      identified: !!identified,
      archived: !!archived,
    };

    onSubmit?.(payload);
  }

  return (
    <div className="space-y-4">
      {canUseDefaults ? (
        <div className="rounded-2xl border border-(--border) bg-(--surface-800) p-4">
          <DefaultTreasurePicker
            items={defaultTreasures}
            onPick={applyDefaultTreasure}
          />
          <div className="mt-3 text-xs text-(--muted-fg)">
            Picking an item fills name and value. You can still edit everything
            below.
          </div>
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-(--border) bg-(--card) text-(--card-fg) p-5 space-y-4"
      >
        {error ? (
          <div className="rounded-xl border border-(--danger) bg-[color-mix(in_oklch,var(--danger)_12%,transparent)] p-3 text-sm">
            {error}
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
          hint="Optional. Example: “Mysterious Sword” (used later for identify logic)."
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
          className="w-full rounded-lg border border-(--border) bg-(--input) text-(--input-fg) px-3 py-2"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <InputComponent
            label="Value"
            hint="Value for one item."
            id="value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />

          <InputComponent
            label="Quantity"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>

        <InputComponent
          id="location"
          label="Location"
          hint="Optional. Example: “Hidden compartment”."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <InputComponent
            id="identified"
            label="Identified"
            type="checkbox"
            checked={identified}
            onChange={(e) => setIdentified(e.target.checked)}
          />

          <input
            id="archived"
            label="Archived"
            type="checkbox"
            checked={archived}
            onChange={(e) => setArchived(e.target.checked)}
          />
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

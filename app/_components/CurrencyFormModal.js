"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { normalizeCode, findBaseCurrency } from "@/app/utils/currencyUtils";
import InputComponent from "@/app/_components/InputComponent";

export default function CurrencyFormModal({ mode, vaultId, currencyId }) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [allCurrencies, setAllCurrencies] = useState([]);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [rate, setRate] = useState("1");
  const [setAsBase, setSetAsBase] = useState(false);

  const baseCurrency = useMemo(
    () => findBaseCurrency(allCurrencies),
    [allCurrencies]
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!vaultId) return;

      setLoading(true);
      setError("");

      try {
        const resList = await fetch(`/api/vaults/${vaultId}/currencies`, {
          cache: "no-store",
        });
        if (!resList.ok)
          throw new Error(`Failed to load currencies (${resList.status}).`);
        const listData = await resList.json();
        const list = Array.isArray(listData)
          ? listData
          : listData?.currencies ?? [];

        if (cancelled) return;
        setAllCurrencies(list);

        if (!isEdit) {
          const hasBase = Boolean(findBaseCurrency(list));
          setName("");
          setCode("");
          setSetAsBase(!hasBase);
          setRate(!hasBase ? "1" : "0.1");
          return;
        }

        const resOne = await fetch(
          `/api/vaults/${vaultId}/currencies/${currencyId}`,
          { cache: "no-store" }
        );
        if (!resOne.ok)
          throw new Error(`Failed to load currency (${resOne.status}).`);
        const cur = await resOne.json();

        if (cancelled) return;

        const isBase = Number(cur?.rate) === 1;
        setName(cur?.name ?? "");
        setCode(cur?.code ?? "");
        setSetAsBase(isBase);
        setRate(isBase ? "1" : String(cur?.rate ?? ""));
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load currency.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [vaultId, isEdit, currencyId]);

  function close() {
    router.back();
  }

  function handleBaseToggle(checked) {
    setSetAsBase(checked);
    if (checked) setRate("1");
  }

  function validate() {
    const trimmedName = String(name ?? "").trim();
    const normalizedCode = normalizeCode(code);
    const parsedRate = Number(rate);

    if (!trimmedName) return "Name is required.";
    if (!normalizedCode) return "Code is required.";
    if (!Number.isFinite(parsedRate) || parsedRate <= 0)
      return "Rate must be a number greater than 0.";

    const existing = allCurrencies.find(
      (c) =>
        normalizeCode(c.code) === normalizedCode &&
        String(c.id) !== String(currencyId ?? "")
    );
    if (existing) return `Code "${normalizedCode}" is already used.`;

    const currentBase = baseCurrency;
    const editingIsBase =
      isEdit && String(currentBase?.id) === String(currencyId);

    if (setAsBase && parsedRate !== 1)
      return "Base currency must have a rate of 1.";
    if (!setAsBase && parsedRate === 1 && currentBase && !editingIsBase) {
      return `Only one base currency is allowed. "${currentBase.name}" is currently the base.`;
    }

    return "";
  }

  async function demoteExistingBaseIfNeeded() {
    if (!setAsBase) return;

    const currentBase = baseCurrency;
    if (!currentBase) return;
    if (isEdit && String(currentBase.id) === String(currencyId)) return;

    const demoteRes = await fetch(
      `/api/vaults/${vaultId}/currencies/${currentBase.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rate: 0.1 }),
      }
    );

    if (!demoteRes.ok)
      throw new Error(`Could not update previous base (${demoteRes.status}).`);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    const msg = validate();
    if (msg) return setError(msg);

    const payload = {
      vault_id: vaultId, // important for create
      name: String(name).trim(),
      code: normalizeCode(code),
      rate: setAsBase ? 1 : Number(rate),
    };

    setBusy(true);
    try {
      // await demoteExistingBaseIfNeeded();

      if (isEdit) {
        const res = await fetch(
          `/api/vaults/${vaultId}/currencies/${currencyId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        if (!res.ok)
          throw new Error(`Failed to update currency (${res.status}).`);
      } else {
        const res = await fetch(`/api/vaults/${vaultId}/currencies`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok)
          throw new Error(`Failed to create currency (${res.status}).`);
      }

      router.refresh();
      router.back();
    } catch (e2) {
      setError(e2?.message || "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => (busy ? null : close())}
      />
      <div className="relative w-full max-w-lg rounded-2xl border border-(--color-border) bg-(--color-card) text-(--color-card-fg) shadow-xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              {isEdit ? "Edit Currency" : "Create Currency"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Exactly one base currency is allowed. Base currency must have a
              rate of 1.
            </p>
          </div>
          <button
            type="button"
            className="px-2 py-1 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
            onClick={close}
            disabled={busy}
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="mt-4 text-sm text-muted-foreground">Loading…</div>
        ) : null}

        {error ? (
          <div className="mt-4 p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        <form
          onSubmit={onSubmit}
          className="mt-4 space-y-4"
        >
          <InputComponent
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={busy}
            required
          />

          <InputComponent
            label="Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={busy}
            required
          />

          <div className="flex items-center gap-3">
            <InputComponent
              id="setAsBase"
              type="checkbox"
              label="Set as base currency (rate = 1)"
              checked={setAsBase}
              onChange={(e) => handleBaseToggle(e.target.checked)}
              disabled={busy}
            />
          </div>

          <div>
            <InputComponent
              label="Rate"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              disabled={busy || setAsBase}
              inputMode="decimal"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={close}
              className="px-3 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
              disabled={busy}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-2 rounded-lg bg-black text-white hover:opacity-90 disabled:opacity-50"
              disabled={busy}
            >
              {busy ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

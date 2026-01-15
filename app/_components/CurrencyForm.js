"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import InputComponent from "@/app/_components/InputComponent";
import { normalizeCode } from "@/app/utils/currencyUtils";

/**
 * CurrencyForm
 *
 * Reusable currency create/edit form.
 * Parent controls layout (modal vs page) and close behavior.
 *
 * Props:
 * - mode: "create" | "edit"
 * - vault: {
 *     id: string
 *     currencyList?: Array<{ id: string|number, name: string, code: string, rate: number }>
 *     base_currency_id?: string|number|null
 *     common_currency_id?: string|number|null
 *   }
 * - currencyId?: string
 * - onClose?: () => void
 * - onSaved?: (savedCurrency: any) => void
 */
export default function CurrencyForm({
  mode,
  vault,
  currencyId,
  onClose,
  onSaved,
}) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const vaultId = vault?.id ? String(vault.id) : "";
  const list = useMemo(
    () => (Array.isArray(vault?.currencyList) ? vault.currencyList : []),
    [vault]
  );

  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(isEdit); // only "loading" if we must fetch an edit currency
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [rate, setRate] = useState("1");
  const [setAsBase, setSetAsBase] = useState(false);

  const baseId =
    vault?.base_currency_id != null ? String(vault.base_currency_id) : "";
  const commonId =
    vault?.common_currency_id != null ? String(vault.common_currency_id) : "";

  const baseCurrency = useMemo(() => {
    if (!baseId) return null;
    return list.find((c) => String(c.id) === String(baseId)) || null;
  }, [list, baseId]);

  const editingCurrencyFromList = useMemo(() => {
    if (!isEdit || !currencyId) return null;
    return list.find((c) => String(c.id) === String(currencyId)) || null;
  }, [isEdit, currencyId, list]);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      if (!vaultId) return;

      setError("");

      // Create mode defaults
      if (!isEdit) {
        const hasBase = Boolean(baseId);
        setName("");
        setCode("");
        setSetAsBase(!hasBase);
        setRate(!hasBase ? "1" : "0.1");
        return;
      }

      // Edit mode: prefer vault.currencyList data
      if (editingCurrencyFromList) {
        const cur = editingCurrencyFromList;
        const isBase =
          String(cur.id) === String(baseId) || Number(cur.rate) === 1;

        setName(cur?.name ?? "");
        setCode(cur?.code ?? "");
        setSetAsBase(isBase);
        setRate(isBase ? "1" : String(cur?.rate ?? ""));
        setLoading(false);
        return;
      }

      // Fallback: fetch single currency if not in list
      if (!currencyId) return;

      setLoading(true);
      try {
        const res = await fetch(
          `/api/vaults/${vaultId}/currencies/${currencyId}`,
          { cache: "no-store" }
        );
        if (!res.ok) {
          throw new Error(`Failed to load currency (${res.status}).`);
        }

        const cur = await res.json();
        if (cancelled) return;

        const isBase =
          String(cur?.id) === String(baseId) || Number(cur?.rate) === 1;

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

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [vaultId, isEdit, currencyId, baseId, editingCurrencyFromList]);

  function close() {
    if (busy) return;
    if (onClose) return onClose();
    router.back();
  }

  function handleBaseToggle(checked) {
    setSetAsBase(checked);
    if (checked) setRate("1");
  }

  function validate() {
    const trimmedName = String(name ?? "").trim();
    const normalized = normalizeCode(code);
    const parsedRate = Number(rate);

    if (!trimmedName) return "Name is required.";
    if (!normalized) return "Code is required.";
    if (!Number.isFinite(parsedRate) || parsedRate <= 0) {
      return "Rate must be a number greater than 0.";
    }

    // Code uniqueness within vault.currencyList
    const existing = list.find(
      (c) =>
        normalizeCode(c.code) === normalized &&
        String(c.id) !== String(currencyId ?? "")
    );
    if (existing) return `Code "${normalized}" is already used.`;

    // Base rules
    const editingIsBase = isEdit && String(currencyId) === String(baseId);

    if (setAsBase && parsedRate !== 1) {
      return "Base currency must have a rate of 1.";
    }

    if (!setAsBase && parsedRate === 1 && baseId && !editingIsBase) {
      return `Only one base currency is allowed. "${
        baseCurrency?.name ?? "A currency"
      }" is currently the base.`;
    }

    return "";
  }

  async function demoteExistingBaseIfNeeded() {
    // If user is setting this currency as base, demote current base currency (unless it's the same currency)
    if (!setAsBase) return;
    if (!baseId) return;
    if (isEdit && String(currencyId) === String(baseId)) return;

    const res = await fetch(`/api/vaults/${vaultId}/currencies/${baseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rate: 0.1 }),
    });

    if (!res.ok) {
      throw new Error(`Could not update previous base (${res.status}).`);
    }
  }

  async function updateVaultBaseCurrencyId(newBaseCurrencyId) {
    // TODO: wire this to your existing vault settings update action/endpoint.
    // You said: "we will also need to update the vault with the id of the currency being edited."
    //
    // Example (placeholder):
    // const res = await fetch(`/api/vaults/${vaultId}`, {
    //   method: "PATCH",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ base_currency_id: newBaseCurrencyId }),
    // });
    // if (!res.ok) throw new Error(`Failed to update vault base currency (${res.status}).`);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    const msg = validate();
    if (msg) return setError(msg);

    const payload = {
      vault_id: vaultId,
      name: String(name).trim(),
      code: normalizeCode(code),
      rate: setAsBase ? 1 : Number(rate),
    };

    setBusy(true);
    try {
      await demoteExistingBaseIfNeeded();

      let saved = null;

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
        saved = await res.json().catch(() => null);
      } else {
        const res = await fetch(`/api/vaults/${vaultId}/currencies`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok)
          throw new Error(`Failed to create currency (${res.status}).`);
        saved = await res.json().catch(() => null);
      }

      // If this currency is now base, also update vault.base_currency_id
      if (setAsBase) {
        const newBaseId = isEdit
          ? currencyId
          : saved?.id ?? saved?.currency?.id;
        if (newBaseId) {
          await updateVaultBaseCurrencyId(newBaseId);
        }
      }

      onSaved?.(saved);

      router.refresh();
      close();
    } catch (e2) {
      setError(e2?.message || "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto text-(--fg) space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">
            {isEdit ? "Edit Currency" : "Create Currency"}
          </h2>
          <p className="text-sm text-color-muted-fg">
            Exactly one base currency is allowed. Base currency must have a rate
            of 1.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="mt-4 text-sm text-color-muted-fg">Loading…</div>
      ) : null}

      {error ? (
        <div className="mt-4 p-3 rounded-lg border border-color-danger-200 bg-color-danger-50 text-sm text-color-danger-900">
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

        <InputComponent
          id="setAsBase"
          type="checkbox"
          label="Set as base currency (rate = 1)"
          checked={setAsBase}
          onChange={(e) => handleBaseToggle(e.target.checked)}
          disabled={busy}
        />

        <InputComponent
          label="Rate"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          disabled={busy || setAsBase}
          inputMode="decimal"
        />

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={close}
            className="px-3 py-2 rounded-lg border border-color-border hover:bg-color-surface-50 disabled:opacity-50"
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-2 rounded-lg bg-color-primary-900 text-color-fg hover:opacity-90 disabled:opacity-50"
            disabled={busy}
          >
            {busy ? "Saving..." : "Save"}
          </button>
        </div>
      </form>

      {/* Optional: handy debug line while you wire base/common behaviors */}
      {/* <div className="mt-3 text-xs text-color-muted-fg">
        Base: {baseId || "none"} • Common: {commonId || "none"}
      </div> */}
    </div>
  );
}

// app/_components/ValuableView.js
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/app/_components/Button";
import ErrorMessage from "@/app/_components/ErrorMessage";
import { useVault } from "@/app/_context/VaultProvider";

function formatAmount(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num.toLocaleString() : "0";
}

function normalizeCode(code) {
  return String(code ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

/**
 * Render a valuable view panel.
 * @param {{ vaultId: string, valuableId: string, onClose?: () => void }} props
 * @returns {JSX.Element}
 */
export default function ValuableView({ vaultId, valuableId, onClose }) {
  const router = useRouter();
  const { vault } = useVault();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [valuable, setValuable] = useState(null);

  const isOwner =
    session?.user?.userId &&
    vault?.user_id &&
    String(session.user.userId) === String(vault.user_id);

  const currencyInfo = useMemo(() => {
    const list = Array.isArray(vault?.currencyList) ? vault.currencyList : [];
    const base =
      list.find((c) => String(c.id) === String(vault?.base_currency_id)) ||
      list.find((c) => Number(c.rate) === 1) ||
      null;
    const common =
      list.find((c) => String(c.id) === String(vault?.common_currency_id)) ||
      null;

    return {
      baseRate: Number(base?.rate) || 1,
      baseCode: normalizeCode(base?.code || base?.abbreviation || "BASE"),
      commonRate: Number(common?.rate) || 0,
      commonCode: normalizeCode(common?.code || common?.abbreviation || "COMMON"),
    };
  }, [vault]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(
          `/api/vaults/${vaultId}/valuables/${valuableId}`,
          { cache: "no-store" },
        );
        if (!res.ok) {
          throw new Error(`Failed to load valuable (${res.status}).`);
        }
        const body = await res.json().catch(() => null);
        if (!cancelled) {
          setValuable(body?.data || null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Failed to load valuable.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (vaultId && valuableId) load();

    return () => {
      cancelled = true;
    };
  }, [valuableId, vaultId]);

  function handleClose() {
    if (onClose) {
      onClose();
      return;
    }
    router.back();
  }

  const quantity = Number(valuable?.quantity) || 0;
  const baseValue = Number(valuable?.value) || 0;
  const totalBase = baseValue * (quantity || 1);
  const totalCommon =
    currencyInfo.commonRate > 0
      ? totalBase / currencyInfo.commonRate
      : totalBase;

  return (
    <div className="space-y-4 p-6 text-fg">
      <header className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-fg">
            Valuable
          </div>
          <h2 className="text-xl font-semibold">
            {valuable?.name || "Valuable"}
          </h2>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
        >
          Close
        </Button>
      </header>

      {loading ? <div className="text-sm text-muted-fg">Loading...</div> : null}
      {error ? <ErrorMessage error={error} /> : null}

      {!loading && valuable ? (
        <div className="space-y-4">
          {valuable?.description ? (
            <div className="rounded-xl border border-border bg-card p-4 text-sm">
              <div className="text-xs uppercase tracking-wide text-muted-fg">
                Description
              </div>
              <div className="mt-1 text-fg">{valuable.description}</div>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wide text-muted-fg">
                Value (total)
              </div>
              <div className="mt-1 text-sm font-semibold">
                {formatAmount(totalBase)} {currencyInfo.baseCode}
              </div>
              <div className="text-xs text-muted-fg">
                {formatAmount(totalCommon)} {currencyInfo.commonCode}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wide text-muted-fg">
                Quantity
              </div>
              <div className="mt-1 text-sm font-semibold">{quantity || 0}</div>
            </div>
          </div>

          {isOwner && valuable?.gm_notes ? (
            <div className="rounded-xl border border-border bg-card p-4 text-sm">
              <div className="text-xs uppercase tracking-wide text-muted-fg">
                GM notes
              </div>
              <div className="mt-1 text-fg">{valuable.gm_notes}</div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

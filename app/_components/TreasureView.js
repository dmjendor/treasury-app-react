// app/_components/TreasureView.js
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/app/_components/Button";
import ErrorMessage from "@/app/_components/ErrorMessage";
import { updateTreasureAction } from "@/app/_lib/actions/treasures";
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
 * Render a treasure view panel.
 * @param {{ vaultId: string, treasureId: string, onClose?: () => void }} props
 * @returns {JSX.Element}
 */
export default function TreasureView({ vaultId, treasureId, onClose }) {
  const router = useRouter();
  const { vault } = useVault();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [treasure, setTreasure] = useState(null);

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
      commonCode: normalizeCode(
        common?.code || common?.abbreviation || "COMMON",
      ),
    };
  }, [vault]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(
          `/api/vaults/${vaultId}/treasures/${treasureId}`,
          { cache: "no-store" },
        );
        if (!res.ok) {
          throw new Error(`Failed to load treasure (${res.status}).`);
        }
        const body = await res.json().catch(() => null);
        if (!cancelled) {
          setTreasure(body?.data || null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Failed to load treasure.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (vaultId && treasureId) load();

    return () => {
      cancelled = true;
    };
  }, [treasureId, vaultId]);

  function handleClose() {
    if (onClose) {
      onClose();
      return;
    }
    router.back();
  }

  async function handleIdentify() {
    if (busy || !treasure) return;
    setBusy(true);
    setError("");

    const res = await updateTreasureAction({
      id: treasureId,
      vaultId,
      patch: { identified: true },
    });

    if (!res?.ok) {
      setError(res?.error || "Failed to identify treasure.");
      setBusy(false);
      return;
    }

    setTreasure((prev) => (prev ? { ...prev, identified: true } : prev));
    setBusy(false);
  }

  const quantity = Number(treasure?.quantity) || 0;
  const baseValue = Number(treasure?.value) || 0;
  const totalBase = baseValue * (quantity || 1);
  const totalCommon =
    currencyInfo.commonRate > 0
      ? totalBase / currencyInfo.commonRate
      : totalBase;

  const showName = treasure?.identified || !treasure?.magical;
  const displayName = showName
    ? treasure?.name || "Treasure"
    : treasure?.genericname || "Mysterious item";

  return (
    <div className="space-y-4 p-6 text-fg">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{displayName}</h2>
        </div>
      </header>

      {loading ? <div className="text-sm text-muted-fg">Loading...</div> : null}
      {error ? <ErrorMessage error={error} /> : null}

      {!loading && treasure ? (
        <div className="space-y-4">
          {treasure?.description &&
          (!treasure?.magical || treasure?.identified) ? (
            <div className="rounded-xl border border-border bg-card p-4 text-sm">
              <div className="text-xs uppercase tracking-wide text-muted-fg">
                Description
              </div>
              <div className="mt-1 text-fg">{treasure.description}</div>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wide text-muted-fg">
                Value (total)
              </div>
              <div
                className={`mt-1 text-sm font-semibold ${treasure?.magical && !treasure?.identified ? "hidden" : ""}`}
              >
                {formatAmount(totalCommon)} {currencyInfo.commonCode}
              </div>
              <div
                className={`text-xs text-muted-fg ${treasure?.magical && !treasure?.identified ? "hidden" : ""}`}
              >
                {formatAmount(totalBase)} {currencyInfo.baseCode}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wide text-muted-fg">
                Quantity
              </div>
              <div className="mt-1 text-sm font-semibold">{quantity || 0}</div>
            </div>
          </div>

          {treasure?.magical && !treasure?.identified ? (
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-sm text-muted-fg">
                This item is magical but not identified.
              </div>
              <Button
                type="button"
                variant="accent"
                className="mt-3"
                onClick={handleIdentify}
                disabled={busy}
              >
                {busy ? "Identifying..." : "Identify Item"}
              </Button>
            </div>
          ) : null}

          {isOwner && treasure?.gm_notes ? (
            <div className="rounded-xl border border-border bg-card p-4 text-sm">
              <div className="text-xs uppercase tracking-wide text-muted-fg">
                GM notes
              </div>
              <div className="mt-1 text-fg">{treasure.gm_notes}</div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

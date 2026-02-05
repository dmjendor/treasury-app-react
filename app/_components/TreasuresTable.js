"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { LinkButton } from "@/app/_components/LinkButton";
import IconComponent from "@/app/_components/IconComponent";
import {
  HiCurrencyDollar,
  HiOutlineCurrencyDollar,
  HiOutlineDocumentCurrencyDollar,
  HiOutlinePencilSquare,
  HiOutlineTrash,
} from "react-icons/hi2";
import { Button } from "@/app/_components/Button";
import ValueUnitToggle from "@/app/_components/ValueUnitToggle";
import { useVault } from "@/app/_context/VaultProvider";
import { useValueUnit } from "@/app/_context/ValueUnitProvider";
import { sellTreasureAction } from "@/app/_lib/actions/treasures";

function fmtMoney(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function normalizeCode(code) {
  return String(code ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

function resolveCurrency({ currencies, baseCurrencyId, commonCurrencyId }) {
  const list = Array.isArray(currencies) ? currencies : [];
  const base =
    list.find((c) => String(c.id) === String(baseCurrencyId)) ||
    list.find((c) => Number(c.rate) === 1) ||
    null;
  const common =
    list.find((c) => String(c.id) === String(commonCurrencyId)) || null;

  return {
    baseRate: Number(base?.rate) || 1,
    baseCode: normalizeCode(base?.code || base?.abbreviation || ""),
    commonRate: Number(common?.rate) || 0,
    commonCode: normalizeCode(common?.code || common?.abbreviation || ""),
  };
}

export default function TreasuresTable({
  vaultId,
  treasures,
  activeContainerId,
}) {
  const router = useRouter();
  const { vault, invalidateHoldings } = useVault();
  const { valueUnit } = useValueUnit();
  const [sellingIds, setSellingIds] = useState(() => new Set());
  const rows = Array.isArray(treasures) ? treasures : [];

  const currencyInfo = resolveCurrency({
    currencies: vault?.currencyList ?? [],
    baseCurrencyId: vault?.base_currency_id,
    commonCurrencyId: vault?.common_currency_id,
  });

  function displayValue(value) {
    const baseValue = Number(value) || 0;
    if (valueUnit === "base" || currencyInfo.commonRate <= 0) {
      return {
        amount: fmtMoney(baseValue),
        code: currencyInfo.baseCode || "BASE",
      };
    }

    return {
      amount: fmtMoney(baseValue / currencyInfo.commonRate),
      code: currencyInfo.commonCode || "COMMON",
    };
  }

  function updateSelling(id, next) {
    setSellingIds((prev) => {
      const nextSet = new Set(prev);
      if (next) nextSet.add(id);
      else nextSet.delete(id);
      return nextSet;
    });
  }

  async function handleSellTreasure(treasure) {
    if (!vaultId) {
      toast.error("Missing vault id.");
      return;
    }
    if (!treasure?.id) {
      toast.error("Missing treasure.");
      return;
    }

    const id = String(treasure.id);
    if (sellingIds.has(id)) return;

    updateSelling(id, true);

    try {
      const res = await sellTreasureAction({
        vaultId: String(vaultId),
        treasureId: id,
      });

      if (!res?.ok) {
        toast.error(res?.error || "Failed to sell treasure.");
        return;
      }

      toast.success(`${treasure?.name || "Treasure"} sold.`);
      invalidateHoldings?.();
      router.refresh();
    } catch (error) {
      toast.error(error?.message || "Failed to sell treasure.");
    } finally {
      updateSelling(id, false);
    }
  }
  return (
    <div className="rounded-2xl border border-primary-700 overflow-hidden bg-primary-700 text-primary-50">
      <div className="px-4 py-3 flex items-center justify-between border-b border-primary-900">
        <div className="text-sm opacity-90">
          {rows.length} treasure item{rows.length === 1 ? "" : "s"}
        </div>
        <ValueUnitToggle label="Display Values in: " />
        <LinkButton
          href={`/account/vaults/${vaultId}/treasures/new${
            activeContainerId ? `?containerId=${activeContainerId}` : ""
          }`}
          variant="accent"
          size="sm"
        >
          Add
        </LinkButton>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-accent-500 border-b border-primary-900">
            <tr className="text-left text-fg">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Magical</th>
              <th className="px-4 py-3">Identified</th>
              <th className="px-4 py-3 w-40">Actions</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-6 text-muted-fg bg-card"
                  colSpan={5}
                >
                  No treasure in this container yet.
                </td>
              </tr>
            ) : (
              rows.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-border last:border-b-0 hover:bg-surface hover:text-fg transition-colors bg-card text-muted-fg"
                >
                  <td
                    className={`px-4 py-3 font-medium ${t.magical ? "text-accent-600" : ""}`}
                  >
                    {t.name}
                  </td>
                  <td className="px-4 py-3">
                    {(() => {
                      const display = displayValue(t.value);
                      return (
                        <>
                          {display.amount} {display.code}
                        </>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3">{t.quantity ?? 0}</td>
                  <td className="px-4 py-3">{t.magical && "🪄"}</td>
                  <td className="px-4 py-3">
                    {t.identified && t.magical && "🔎"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="accent"
                        onClick={() => handleSellTreasure(t)}
                        className="px-4"
                        title="Sell Treasure"
                        disabled={sellingIds.has(String(t.id))}
                      >
                        <span className="text-lg">
                          {sellingIds.has(String(t.id)) ? "..." : "$"}
                        </span>
                      </Button>
                      <LinkButton
                        href={`/account/vaults/${vaultId}/treasures/${t.id}/edit`}
                        variant="primary"
                        size="sm"
                      >
                        <IconComponent icon={HiOutlinePencilSquare} />
                      </LinkButton>

                      <LinkButton
                        href={`/account/vaults/${vaultId}/treasures/${t.id}/delete`}
                        variant="danger"
                        size="sm"
                      >
                        <IconComponent icon={HiOutlineTrash} />
                      </LinkButton>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

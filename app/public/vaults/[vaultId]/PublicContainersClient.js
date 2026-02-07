// app/public/vaults/[vaultId]/PublicContainersClient.js
"use client";

import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import IconComponent from "@/app/_components/IconComponent";
import BackpackIcon from "@/app/_components/icons/BackpackIcon";
import { LinkButton } from "@/app/_components/LinkButton";
import { Button } from "@/app/_components/Button";
import {
  moveTreasureToContainerAction,
  sellTreasureAction,
} from "@/app/_lib/actions/treasures";
import {
  moveValuableToContainerAction,
  sellValuableAction,
} from "@/app/_lib/actions/valuables";
import { useValueUnit } from "@/app/_context/ValueUnitProvider";
import { HiMiniArrowRightStartOnRectangle } from "react-icons/hi2";

function normalizeItems(treasures, valuables) {
  const treasureItems = (treasures || []).map((t) => ({
    id: String(t.id),
    name: t.name || "Unnamed treasure",
    genericname: t.genericname || "",
    value: Number(t.value) || 0,
    quantity: Number(t.quantity) || 1,
    container_id: t.container_id ? String(t.container_id) : "",
    magical: t.magical,
    identified: t.identified,
    type: "treasure",
  }));
  const valuableItems = (valuables || []).map((v) => ({
    id: String(v.id),
    name: v.name || "Unnamed valuable",
    container_id: v.container_id ? String(v.container_id) : "",
    type: "valuable",
    value: Number(v.value) || 0,
    quantity: Number(v.quantity) || 1,
  }));
  return [...treasureItems, ...valuableItems];
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

function formatAmount(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num.toLocaleString() : "0";
}

/**
 * Render container cards with draggable item lists.
 * @param {{ vaultId: string, containers: Array<any>, treasures: Array<any>, valuables: Array<any>, currencies?: Array<any>, baseCurrencyId?: string, commonCurrencyId?: string, isOwner?: boolean, canTransferTreasureOut?: boolean, canTransferValuableOut?: boolean, canSellTreasure?: boolean, canSellValuable?: boolean, readOnly?: boolean, demoMode?: boolean, onDemoSell?: (payload: { currencyId: string, amount: number }) => void }} props
 * @returns {JSX.Element}
 */
export default function PublicContainersClient({
  vaultId,
  containers,
  treasures,
  valuables,
  currencies,
  baseCurrencyId,
  commonCurrencyId,
  isOwner = false,
  canTransferTreasureOut = false,
  canTransferValuableOut = false,
  canSellTreasure = false,
  canSellValuable = false,
  readOnly = false,
  demoMode = false,
  onDemoSell,
}) {
  const { valueUnit } = useValueUnit();
  const [items, setItems] = useState(() =>
    normalizeItems(treasures, valuables),
  );
  const [sellingIds, setSellingIds] = useState(() => new Set());

  useEffect(() => {
    if (demoMode) return;
    setItems(normalizeItems(treasures, valuables));
  }, [demoMode, treasures, valuables]);

  const itemsByContainer = useMemo(() => {
    const map = new Map();
    for (const container of containers || []) {
      map.set(String(container.id), []);
    }
    for (const item of items) {
      if (!item.container_id) continue;
      if (!map.has(item.container_id)) map.set(item.container_id, []);
      map.get(item.container_id).push(item);
    }
    return map;
  }, [containers, items]);

  const currencyInfo = useMemo(
    () =>
      resolveCurrency({
        currencies,
        baseCurrencyId,
        commonCurrencyId,
      }),
    [currencies, baseCurrencyId, commonCurrencyId],
  );

  function displayValue(value) {
    const baseValue = Number(value) || 0;
    if (valueUnit === "base" || currencyInfo.commonRate <= 0) {
      return {
        amount: formatAmount(baseValue),
        code: currencyInfo.baseCode || "BASE",
      };
    }

    return {
      amount: formatAmount(baseValue / currencyInfo.commonRate),
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

  async function handleSellItem(item) {
    if (readOnly) return;
    if (!vaultId) {
      toast.error("Missing vault id.");
      return;
    }
    if (!item?.id || !item?.type) {
      toast.error("Missing item.");
      return;
    }

    const id = `${item.type}-${String(item.id)}`;
    if (sellingIds.has(id)) return;

    updateSelling(id, true);

    try {
      if (demoMode) {
        const baseValue = Number(item.value) || 0;
        const qtyRaw = Number(item.quantity);
        const quantity = Number.isFinite(qtyRaw) && qtyRaw > 0 ? qtyRaw : 1;
        const saleBaseValue = baseValue * quantity;
        const saleCommonValue =
          currencyInfo.commonRate > 0
            ? saleBaseValue / currencyInfo.commonRate
            : saleBaseValue;

        setItems((prev) =>
          prev.filter(
            (row) =>
              !(String(row.id) === String(item.id) && row.type === item.type),
          ),
        );

        if (typeof onDemoSell === "function") {
          onDemoSell({
            currencyId: String(commonCurrencyId || ""),
            amount: saleCommonValue,
          });
        }

        toast.success(`${item?.name || "Item"} sold (demo).`);
        return;
      }

      const res =
        item.type === "treasure"
          ? await sellTreasureAction({
              vaultId: String(vaultId),
              treasureId: String(item.id),
            })
          : await sellValuableAction({
              vaultId: String(vaultId),
              valuableId: String(item.id),
            });

      if (!res?.ok) {
        toast.error(res?.error || "Failed to sell item.");
        return;
      }

      setItems((prev) =>
        prev.filter(
          (row) =>
            !(String(row.id) === String(item.id) && row.type === item.type),
        ),
      );
      toast.success(`${item?.name || "Item"} sold.`);

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("vault:holdings:invalidate", {
            detail: { vaultId },
          }),
        );
      }
    } catch (error) {
      toast.error(error?.message || "Failed to sell item.");
    } finally {
      updateSelling(id, false);
    }
  }

  function handleDragStart(event, item) {
    if (readOnly) return;
    const displayName =
      item.type === "treasure" && item.magical && !item.identified
        ? item.genericname || item.name
        : item.name;
    event.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        id: item.id,
        type: item.type,
        name: displayName,
        fromContainerId: item.container_id || "",
      }),
    );
    event.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(event) {
    if (readOnly) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  async function handleDrop(event, containerId) {
    if (readOnly) return;
    event.preventDefault();
    if (!vaultId) return;

    let payload = null;
    try {
      payload = JSON.parse(event.dataTransfer.getData("text/plain"));
    } catch {
      return;
    }

    if (!payload?.id || !payload?.type) return;
    if (String(containerId) === String(payload.fromContainerId)) return;

    const previous = items;
    setItems((prev) =>
      prev.map((item) =>
        item.id === payload.id && item.type === payload.type
          ? { ...item, container_id: String(containerId) }
          : item,
      ),
    );

    if (demoMode) return;

    const actionInput = {
      vaultId,
      containerId: String(containerId),
    };
    console.log(payload);
    console.log(containers);

    const res =
      payload.type === "treasure"
        ? await moveTreasureToContainerAction({
            ...actionInput,
            treasureName: payload.name,
            treasureId: payload.id,
            fromContainerName: containers.find(
              (container) =>
                String(container.id) === String(payload.fromContainerId),
            )?.name,
            toContainerName: containers.find(
              (container) => String(container.id) === String(containerId),
            )?.name,
          })
        : await moveValuableToContainerAction({
            ...actionInput,
            valuableId: payload.id,
            valuableName: payload.name,
            fromContainerName: containers.find(
              (container) =>
                String(container.id) === String(payload.fromContainerId),
            )?.name,
            toContainerName: containers.find(
              (container) => String(container.id) === String(containerId),
            )?.name,
          });

    if (!res?.ok) {
      setItems(previous);
      toast.error(res?.error || "Failed to move item.");
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {(containers || [])
        .filter((container) => (isOwner ? true : !container?.is_hidden))
        .map((container) => {
          const containerId = String(container.id);
          const containerItems = itemsByContainer.get(containerId) || [];
          return (
            <article
              key={container.id}
              onDragOver={readOnly ? undefined : handleDragOver}
              onDrop={
                readOnly ? undefined : (event) => handleDrop(event, containerId)
              }
              className="rounded-2xl border border-border bg-primary-600 p-5 text-primary-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-primary-50">
                    {container?.name || "Unnamed container"}
                  </div>
                  {isOwner && (
                    <div className="mt-2 text-xs uppercase tracking-wide text-primary-200">
                      {container?.is_hidden ? "Hidden" : "Visible"}
                    </div>
                  )}
                </div>
                <div className="rounded-xl border border-border bg-primary-700 p-2">
                  <IconComponent
                    icon={BackpackIcon}
                    size="sm"
                    variant="accent"
                  />
                </div>
              </div>

              {containerItems.length === 0 ? (
                <div className="mt-4 text-xs text-primary-200">
                  Drag items here.
                </div>
              ) : (
                <ul className="mt-4 space-y-2 text-sm text-primary-100">
                  {containerItems.map((item) => {
                    const display = displayValue(item.value);
                    const canTransfer =
                      (item.type === "treasure" && canTransferTreasureOut) ||
                      (item.type === "valuable" && canTransferValuableOut);
                    const canSell =
                      (item.type === "treasure" && canSellTreasure) ||
                      (item.type === "valuable" && canSellValuable) ||
                      isOwner;
                    const transferHref =
                      item.type === "treasure"
                        ? `/public/vaults/${vaultId}/transfer/treasures/${item.id}`
                        : `/public/vaults/${vaultId}/transfer/valuables/${item.id}`;
                    const sellId = `${item.type}-${String(item.id)}`;
                    return (
                      <li
                        key={`${item.type}-${item.id}`}
                        draggable={!readOnly}
                        onDragStart={
                          readOnly
                            ? undefined
                            : (event) => handleDragStart(event, item)
                        }
                        className={`flex items-center gap-2 rounded-lg border border-border bg-primary-700 px-3 py-2 cursor-move ${
                          item.type === "treasure" && item.magical
                            ? "text-accent-400"
                            : ""
                        }`}
                      >
                        <span className="truncate">
                          {item.magical && !item.identified
                            ? item.genericname
                            : item.name}
                        </span>
                        <span className="ml-auto text-primary-200 whitespace-nowrap">
                          {display.amount} {display.code}
                        </span>
                        {canSell && !readOnly ? (
                          <Button
                            variant="accent"
                            size="sm"
                            className="px-2"
                            title="Sell"
                            onClick={() => handleSellItem(item)}
                            disabled={sellingIds.has(sellId)}
                          >
                            {sellingIds.has(sellId) ? "..." : "$"}
                          </Button>
                        ) : null}
                        {canTransfer && !readOnly ? (
                          <LinkButton
                            href={transferHref}
                            size="sm"
                            variant="accent"
                            icon={HiMiniArrowRightStartOnRectangle}
                            iconLabel="Transfer"
                            iconSize="md"
                          ></LinkButton>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </article>
          );
        })}
    </div>
  );
}

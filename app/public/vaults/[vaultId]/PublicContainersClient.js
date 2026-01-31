// app/public/vaults/[vaultId]/PublicContainersClient.js
"use client";

import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import IconComponent from "@/app/_components/IconComponent";
import BackpackIcon from "@/app/_components/icons/BackpackIcon";
import { LinkButton } from "@/app/_components/LinkButton";
import { moveTreasureToContainerAction } from "@/app/_lib/actions/treasures";
import { moveValuableToContainerAction } from "@/app/_lib/actions/valuables";
import { usePublicValueUnit } from "@/app/public/vaults/[vaultId]/PublicValueUnitProvider";
import RobberIcon from "@/app/_components/icons/BackpackIcon copy";
import { HiMiniArrowRightStartOnRectangle } from "react-icons/hi2";

function normalizeItems(treasures, valuables) {
  const treasureItems = (treasures || []).map((t) => ({
    id: String(t.id),
    name: t.name || "Unnamed treasure",
    genericname: t.genericname || "",
    value: Number(t.value) || 0,
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
 * @param {{ vaultId: string, containers: Array<any>, treasures: Array<any>, valuables: Array<any>, currencies?: Array<any>, baseCurrencyId?: string, commonCurrencyId?: string, isOwner?: boolean, canTransferTreasureOut?: boolean, canTransferValuableOut?: boolean }} props
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
}) {
  const { valueUnit } = usePublicValueUnit();
  const [items, setItems] = useState(() =>
    normalizeItems(treasures, valuables),
  );

  useEffect(() => {
    setItems(normalizeItems(treasures, valuables));
  }, [treasures, valuables]);

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

  function handleDragStart(event, item) {
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
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  async function handleDrop(event, containerId) {
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
              onDragOver={handleDragOver}
              onDrop={(event) => handleDrop(event, containerId)}
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
                    const transferHref =
                      item.type === "treasure"
                        ? `/public/vaults/${vaultId}/transfer/treasures/${item.id}`
                        : `/public/vaults/${vaultId}/transfer/valuables/${item.id}`;
                    return (
                      <li
                        key={`${item.type}-${item.id}`}
                        draggable
                        onDragStart={(event) => handleDragStart(event, item)}
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
                        {canTransfer ? (
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

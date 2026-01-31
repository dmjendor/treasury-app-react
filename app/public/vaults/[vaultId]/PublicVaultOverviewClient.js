// app/public/vaults/[vaultId]/PublicVaultOverviewClient.js
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import IconComponent from "@/app/_components/IconComponent";
import { LinkButton } from "@/app/_components/LinkButton";
import CashIcon from "@/app/_components/icons/CashIcon";
import BackpackIcon from "@/app/_components/icons/BackpackIcon";
import ChestIcon from "@/app/_components/icons/ChestIcon";
import PublicContainersClient from "@/app/public/vaults/[vaultId]/PublicContainersClient";
import PublicValueUnitToggle from "@/app/public/vaults/[vaultId]/PublicValueUnitToggle";
import { PublicValueUnitProvider } from "@/app/public/vaults/[vaultId]/PublicValueUnitProvider";
import { normalizeCode } from "@/app/utils/currencyUtils";

const cardStyles = {
  primary:
    "rounded-2xl border border-border bg-primary-400 p-6 text-primary-100",
  accent: "rounded-2xl border border-border bg-accent-400 p-6 text-accent-100",
};

const titleStyles = {
  primary: "text-primary-700",
  accent: "text-accent-700",
};

const iconWrapStyles = {
  primary: "border border-border bg-primary-600",
  accent: "border border-border bg-acent-600",
};

function SectionCard({ title, icon, tone = "primary", action, children }) {
  return (
    <section className={cardStyles[tone] ?? cardStyles.primary}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {icon ? (
            <div className={`rounded-xl p-2 ${iconWrapStyles[tone]}`}>
              <IconComponent
                icon={icon}
                size="md"
              />
            </div>
          ) : null}
          <h2
            className={`text-sm font-semibold uppercase tracking-wide ${
              titleStyles[tone] ?? titleStyles.primary
            }`}
          >
            {title}
          </h2>
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-primary-700">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-primary-700">{value}</div>
    </div>
  );
}

function StatPill({ label, value }) {
  return (
    <div className="rounded-xl border border-border bg-primary-600 px-3 py-2">
      <div className="text-xs uppercase tracking-wide text-primary-100 font-semibold">
        {label}
      </div>
      <div className="text-lg font-semibold text-primary-100">{value}</div>
    </div>
  );
}

function formatAmount(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num.toLocaleString() : "0";
}

function findCurrencyLabel(currencies, currencyId, fallbackLabel) {
  const list = Array.isArray(currencies) ? currencies : [];
  const match = list.find((c) => String(c.id) === String(currencyId));
  return match?.name || fallbackLabel;
}

function EmptyState({ title, message }) {
  return (
    <div className="rounded-xl border border-border bg-primary-600 p-4 text-sm text-primary-100">
      <div className="font-semibold text-primary-50">{title}</div>
      <div className="mt-1 text-primary-200">{message}</div>
    </div>
  );
}

/**
 * Render the public vault overview.
 * @param {{ vaultId: string, vault: any, balances: any[], containers: any[], currencies: any[], treasures: any[], valuables: any[], isOwner: boolean, canTransferTreasureOut?: boolean, canTransferValuableOut?: boolean }} props
 * @returns {JSX.Element}
 */
export default function PublicVaultOverviewClient({
  vaultId,
  vault,
  balances,
  containers,
  currencies,
  treasures,
  valuables,
  isOwner,
  canTransferTreasureOut = false,
  canTransferValuableOut = false,
}) {
  const router = useRouter();

  useEffect(() => {
    function handleInvalidate(event) {
      const targetId = event?.detail?.vaultId;
      if (!targetId || !vaultId) return;
      if (String(targetId) !== String(vaultId)) return;
      router.refresh();
    }

    if (typeof window === "undefined") return;
    window.addEventListener("vault:holdings:invalidate", handleInvalidate);
    return () => {
      window.removeEventListener("vault:holdings:invalidate", handleInvalidate);
    };
  }, [router, vaultId]);

  const balanceMap = new Map(
    (Array.isArray(balances) ? balances : []).map((balance) => [
      String(balance.currency_id),
      balance,
    ]),
  );

  const baseLabel = findCurrencyLabel(
    vault?.currencyList,
    vault?.base_currency_id,
    "Base",
  );
  const commonLabel = findCurrencyLabel(
    vault?.currencyList,
    vault?.common_currency_id,
    "Common",
  );

  return (
    <div className="space-y-6">
      <PublicValueUnitProvider defaultUnit="common">
        <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <SectionCard
            title="Vault details"
            icon={ChestIcon}
            tone="primary"
          >
            <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
              <div>
                <h1 className="mt-1 text-2xl font-semibold text-primary-700">
                  {vault?.name || "Untitled vault"}
                </h1>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <DetailItem
                    label="System"
                    value={vault?.system?.name || "Unknown"}
                  />
                  <DetailItem
                    label="Theme"
                    value={vault?.theme?.name || "Default"}
                  />
                  <DetailItem
                    label="Status"
                    value={vault?.active ? "Active" : "Inactive"}
                  />
                  <DetailItem
                    label="Access"
                    value={`${isOwner ? "Owner" : "Member"}`}
                  />
                </div>
                <div className="mt-3 font-semibold text-primary-700">
                  <PublicValueUnitToggle
                    label="Displaying item values in: "
                    commonLabel={commonLabel}
                    baseLabel={baseLabel}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <StatPill
                  label="Containers"
                  value={vault?.containers_count ?? 0}
                />

                <StatPill
                  label="Treasures"
                  value={vault?.treasures_count ?? 0}
                />
                <StatPill
                  label="Valuables"
                  value={vault?.valuables_count ?? 0}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Holdings"
            icon={CashIcon}
            action={
              <LinkButton
                href={`/account/vaults/${vaultId}/holdings/split`}
                variant="accent"
                size="sm"
              >
                Split Holdings
              </LinkButton>
            }
          >
            {currencies.length === 0 ? (
              <EmptyState
                title="No coins yet"
                message="Coins added by the GM will appear here."
              />
            ) : (
              <div className="grid gap-3">
                {currencies.map((currency) => (
                  <div
                    key={currency.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-primary-600 px-4 py-3"
                  >
                    <div>
                      <div className="text-sm font-semibold text-primary-50">
                        {currency.name || "Unnamed coin"}
                      </div>
                    </div>
                    <div className="text-sm text-primary-100">
                      Balance:{" "}
                      {formatAmount(
                        balanceMap.get(String(currency.id))?.total_value ?? 0,
                      )}{" "}
                      {normalizeCode(currency.code || "") || "NO CODE"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        <SectionCard
          title="Containers"
          icon={BackpackIcon}
        >
          {containers.length === 0 ? (
            <EmptyState
              title="No containers yet"
              message="When containers are created, they will show up here."
            />
          ) : (
            <PublicContainersClient
              vaultId={String(vaultId)}
              containers={containers}
              treasures={Array.isArray(treasures) ? treasures : []}
              valuables={Array.isArray(valuables) ? valuables : []}
              currencies={vault?.currencyList ?? []}
              baseCurrencyId={vault?.base_currency_id}
              commonCurrencyId={vault?.common_currency_id}
              isOwner={isOwner}
              canTransferTreasureOut={canTransferTreasureOut}
              canTransferValuableOut={canTransferValuableOut}
            />
          )}
        </SectionCard>
      </PublicValueUnitProvider>
    </div>
  );
}

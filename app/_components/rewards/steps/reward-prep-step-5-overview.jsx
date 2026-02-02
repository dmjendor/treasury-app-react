/**
 * Reward prep wizard step 5.
 */
"use client";

import Pill from "@/app/_components/Pill";
import SubCard from "@/app/_components/SubCard";

function nameFor(options, id) {
  return options.find((option) => option.id === id)?.name || "Unknown";
}

function codeFor(options, id) {
  return options.find((option) => option.id === id)?.code || "";
}

function containerNameFor(options, id) {
  return options.find((option) => option.id === id)?.name || "Unknown";
}

function formatNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function groupByContainer(rows, containerOptions) {
  const groups = new Map();
  rows.forEach((row) => {
    const key = row?.container_id ? String(row.container_id) : "unassigned";
    const label = row?.container_id
      ? containerNameFor(containerOptions, row.container_id)
      : "Unassigned";
    if (!groups.has(key)) {
      groups.set(key, { label, rows: [] });
    }
    groups.get(key).rows.push(row);
  });
  return Array.from(groups.values());
}

/**
 * Reward prep wizard step 5.
 * @param {{ form: any }} props
 * @returns {JSX.Element}
 */
export default function RewardPrepStepOverview({ form, vault }) {
  const values = form.watch();
  const name = typeof values.name === "string" ? values.name.trim() : "";
  const description =
    typeof values.description === "string" ? values.description.trim() : "";
  const currencyOptions = vault?.currencyList;
  const containerOptions = Array.isArray(vault?.containerList)
    ? vault.containerList
    : [];

  const baseCurrency =
    currencyOptions?.find(
      (currency) =>
        String(currency.id) === String(vault?.base_currency_id ?? ""),
    ) || null;
  const baseLabel =
    baseCurrency?.code || baseCurrency?.symbol || baseCurrency?.name || "Base";
  const commonCurrency =
    currencyOptions?.find(
      (currency) =>
        String(currency.id) === String(vault?.common_currency_id ?? ""),
    ) || null;
  const commonLabel =
    commonCurrency?.code ||
    commonCurrency?.symbol ||
    commonCurrency?.name ||
    "Common";
  const commonRate = Number(commonCurrency?.rate) || 1;
  const valueUnit =
    typeof values?.value_unit === "string" ? values.value_unit : "common";
  const valueUnitLabel = valueUnit === "base" ? baseLabel : commonLabel;

  const holdings = Array.isArray(values.holdings) ? values.holdings : [];
  const treasures = Array.isArray(values.treasures) ? values.treasures : [];
  const valuables = Array.isArray(values.valuables) ? values.valuables : [];

  const hasDetails = Boolean(name || description);
  const hasHoldings = holdings.length > 0;
  const hasTreasures = treasures.length > 0;
  const hasValuables = valuables.length > 0;
  const treasureGroups = groupByContainer(treasures, containerOptions);
  const valuableGroups = groupByContainer(valuables, containerOptions);

  return (
    <div className="space-y-4">
      {hasDetails ? (
        <SubCard>
          <div className="text-sm font-semibold text-fg">Details</div>
          <div className="mt-2 space-y-1">
            {name ? (
              <div className="text-sm font-semibold text-fg">{name}</div>
            ) : null}
            {description ? (
              <div className="mt-1 text-sm text-muted-fg">{description}</div>
            ) : null}
          </div>
        </SubCard>
      ) : null}

      {hasHoldings ? (
        <SubCard>
          <div className="text-sm font-semibold text-fg">Holdings</div>
          <div className="mt-2 text-sm text-fg">
            {holdings.map((row, index) => (
              <div
                key={`${row.currency_id}-${index}`}
                className="flex items-center justify-between gap-3 border-b border-border py-2 last:border-b-0"
              >
                <div className="min-w-0 font-medium text-fg">
                  {nameFor(currencyOptions, row.currency_id)}
                </div>
                <Pill variant="accent">
                  {formatNumber(row.value)}{" "}
                  {codeFor(currencyOptions, row.currency_id)}
                </Pill>
              </div>
            ))}
          </div>
        </SubCard>
      ) : null}

      {hasTreasures ? (
        <SubCard>
          <div className="text-sm font-semibold text-fg">Treasures</div>
          <div className="mt-3 space-y-4">
            {treasureGroups.map((group) => (
              <div key={group.label}>
                <div className="text-xs font-semibold text-muted-fg">
                  {group.label}
                </div>
                <div className="mt-2 text-sm text-fg">
                  {group.rows.map((row, index) => {
                    const meta = [];
                    if (row.genericname) meta.push(row.genericname);
                    if (row.magical) meta.push("Magical");
                    if (row.identified && row.magical) meta.push("Identified");
                    if (row.archived) meta.push("Archived");
                    if (row.description) meta.push(row.description);
                    const valueDisplay =
                      typeof row.value === "number"
                        ? `${formatNumber(
                            valueUnit === "common"
                              ? row.value / (commonRate || 1)
                              : row.value,
                          )} ${valueUnitLabel}`
                        : "";

                    return (
                      <div
                        key={`${row.name}-${index}`}
                        className="flex items-start justify-between gap-3 border-b border-border py-2 last:border-b-0"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Pill variant="ghost">x{row.quantity ?? 0}</Pill>
                            <span className="font-semibold text-fg">
                              {row.name}
                            </span>
                          </div>
                          {meta.length > 0 ? (
                            <div className="mt-1 text-xs text-muted-fg">
                              {meta.join(" - ")}
                            </div>
                          ) : null}
                        </div>
                        {valueDisplay ? (
                          <Pill variant="accent">{valueDisplay}</Pill>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </SubCard>
      ) : null}

      {hasValuables ? (
        <SubCard>
          <div className="text-sm font-semibold text-fg">Valuables</div>
          <div className="mt-3 space-y-4">
            {valuableGroups.map((group) => (
              <div key={group.label}>
                <div className="text-xs font-semibold text-muted-fg">
                  {group.label}
                </div>
                <div className="mt-2 text-sm text-fg">
                  {group.rows.map((row, index) => {
                    const valueDisplay =
                      typeof row.value === "number"
                        ? `${formatNumber(
                            valueUnit === "common"
                              ? row.value / (commonRate || 1)
                              : row.value,
                          )} ${valueUnitLabel}`
                        : "";

                    return (
                      <div
                        key={`${row.name}-${index}`}
                        className="flex items-start justify-between gap-3 border-b border-border py-2 last:border-b-0"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Pill variant="ghost">x{row.quantity ?? 0}</Pill>
                            <span className="font-semibold text-fg">
                              {row.name}
                            </span>
                          </div>
                        </div>
                        {valueDisplay ? (
                          <Pill variant="accent">{valueDisplay}</Pill>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </SubCard>
      ) : null}

      {!hasDetails && !hasHoldings && !hasTreasures && !hasValuables ? (
        <div className="text-sm text-fg">Nothing to summarize yet.</div>
      ) : null}
    </div>
  );
}

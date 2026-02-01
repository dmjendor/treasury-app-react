/**
 * Reward prep wizard step 5.
 */
"use client";

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
  const holdings = Array.isArray(values.holdings) ? values.holdings : [];
  const treasures = Array.isArray(values.treasures) ? values.treasures : [];
  const valuables = Array.isArray(values.valuables) ? values.valuables : [];

  const hasDetails = Boolean(name || description);
  const hasHoldings = holdings.length > 0;
  const hasTreasures = treasures.length > 0;
  const hasValuables = valuables.length > 0;

  return (
    <div className="space-y-4">
      {hasDetails ? (
        <SubCard>
          <div className="text-sm font-semibold text-fg">Details</div>
          <div className="mt-2 text-sm text-fg">
            {name ? <div>{name}</div> : null}
            {description ? (
              <div className="mt-1 text-sm text-muted-fg">{description}</div>
            ) : null}
          </div>
        </SubCard>
      ) : null}

      {hasHoldings ? (
        <SubCard>
          <div className="text-sm font-semibold text-fg">Holdings</div>
          <div className="mt-2 space-y-1 text-sm text-fg">
            {holdings.map((row, index) => (
              <div key={`${row.currency_id}-${index}`}>
                {nameFor(currencyOptions, row.currency_id)}: {row.value}{" "}
                {codeFor(currencyOptions, row.currency_id)}
              </div>
            ))}
          </div>
        </SubCard>
      ) : null}

      {hasTreasures ? (
        <SubCard>
          <div className="text-sm font-semibold text-fg">Treasures</div>
          <div className="mt-2 space-y-1 text-sm text-fg">
            {treasures.map((row, index) => (
              <div key={`${row.name}-${index}`}>
                {row.name} x{row.quantity ?? 0}
                {row.genericname ? ` - ${row.genericname}` : ""}
                {row.container_id
                  ? ` - ${containerNameFor(
                      containerOptions,
                      row.container_id,
                    )}`
                  : ""}
                {typeof row.value === "number"
                  ? ` - ${row.value} ${baseLabel}`
                  : ""}
                {row.magical ? " - Magical" : ""}
                {row.identified && row.magical ? " - Identified" : ""}
                {row.archived ? " - Archived" : ""}
                {row.description ? ` - ${row.description}` : ""}
              </div>
            ))}
          </div>
        </SubCard>
      ) : null}

      {hasValuables ? (
        <SubCard>
          <div className="text-sm font-semibold text-fg">Valuables</div>
          <div className="mt-2 space-y-1 text-sm text-fg">
            {valuables.map((row, index) => (
              <div key={`${row.name}-${index}`}>
                {row.name} x{row.quantity}
                {typeof row.value === "number" ? ` • ${row.value}` : ""}
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





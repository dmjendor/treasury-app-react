/**
 * Reward prep wizard step 5.
 */
"use client";

import SubCard from "@/app/_components/SubCard";

const currencyOptions = [
  { id: "11111111-1111-1111-1111-111111111111", label: "Gold" },
  { id: "22222222-2222-2222-2222-222222222222", label: "Silver" },
  { id: "33333333-3333-3333-3333-333333333333", label: "Copper" },
];

const treasureOptions = [
  { id: "44444444-4444-4444-4444-444444444444", label: "Gem pouch" },
  { id: "55555555-5555-5555-5555-555555555555", label: "Ancient coin" },
  { id: "66666666-6666-6666-6666-666666666666", label: "Silver idol" },
];

const valuableOptions = [
  { id: "77777777-7777-7777-7777-777777777777", label: "Art object" },
  { id: "88888888-8888-8888-8888-888888888888", label: "Jeweled goblet" },
  { id: "99999999-9999-9999-9999-999999999999", label: "Rare tapestry" },
];

function labelFor(options, id) {
  return options.find((option) => option.id === id)?.label || "Unknown";
}

/**
 * Reward prep wizard step 5.
 * @param {{ form: any }} props
 * @returns {JSX.Element}
 */
export default function RewardPrepStepOverview({ form }) {
  const values = form.watch();
  const name = typeof values.name === "string" ? values.name.trim() : "";
  const description =
    typeof values.description === "string" ? values.description.trim() : "";
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
                {labelFor(currencyOptions, row.currency_id)}: {row.amount}
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
              <div key={`${row.defaulttreasure_id}-${index}`}>
                {labelFor(treasureOptions, row.defaulttreasure_id)} x
                {row.quantity}
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
              <div key={`${row.defaultvaluable_id}-${index}`}>
                {labelFor(valuableOptions, row.defaultvaluable_id)} x
                {row.quantity}
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

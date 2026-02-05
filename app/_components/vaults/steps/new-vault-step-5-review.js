// app/_components/vaults/steps/new-vault-step-5-review.js
"use client";

import SubCard from "@/app/_components/SubCard";
import ErrorMessage from "@/app/_components/ErrorMessage";

/**
 * Render the new vault wizard review step.
 * @param {object} props
 * @returns {JSX.Element}
 */
export default function NewVaultStepReview({
  name,
  selectedSystem,
  sortedThemes,
  themeId,
  currencies,
  baseCurrencyId,
  commonCurrencyId,
  containers,
  allowXferIn,
  allowXferOut,
  treasurySplitEnabled,
  rewardPrepEnabled,
  mergeSplit,
  submitError,
}) {
  return (
    <SubCard className="space-y-4">
      <div className="text-sm font-semibold text-fg">Step 5: Review</div>
      <div className="rounded-xl border border-border bg-card p-4 space-y-4 text-sm">
        <div>
          <div className="text-xs text-muted-fg">Name</div>
          <div className="font-semibold text-fg">
            {name || "Untitled vault"}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <div className="text-xs text-muted-fg">System</div>
            <div className="font-semibold text-fg">
              {selectedSystem?.name || "None"}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-fg">Theme</div>
            <div className="font-semibold text-fg">
              {sortedThemes.find((t) => String(t.id) === String(themeId))
                ?.name || "None"}
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-fg">Currencies</div>
          {currencies.length === 0 ? (
            <div className="text-muted-fg">None</div>
          ) : (
            <ul className="mt-1 space-y-1">
              {currencies.map((row) => (
                <li
                  key={row.localId}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="font-semibold">
                    {row.name || row.code || "Currency"}
                  </span>
                  <span className="text-xs text-muted-fg">
                    rate {row.rate || "1"}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-2 text-xs text-muted-fg">
            Base:{" "}
            {currencies.find(
              (row) => String(row.localId) === String(baseCurrencyId),
            )?.name || "None"}
            {" - "}
            Common:{" "}
            {currencies.find(
              (row) => String(row.localId) === String(commonCurrencyId),
            )?.name || "None"}
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-fg">Containers</div>
          {containers.length === 0 ? (
            <div className="text-muted-fg">None</div>
          ) : (
            <ul className="mt-1 space-y-1">
              {containers.map((row) => (
                <li
                  key={row.localId}
                  className="flex items-center gap-2"
                >
                  <span className="font-semibold">
                    {row.name || "Container"}
                  </span>
                  <span className="text-xs text-muted-fg">
                    {row.is_hidden ? "Hidden" : "Visible"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <div className="text-xs text-muted-fg">Settings</div>
          <ul className="mt-1 space-y-1 text-muted-fg">
            <li>Transfers in: {allowXferIn ? "Yes" : "No"}</li>
            <li>Transfers out: {allowXferOut ? "Yes" : "No"}</li>
            <li>Treasure split: {treasurySplitEnabled ? "On" : "Off"}</li>
            <li>Reward prep: {rewardPrepEnabled ? "On" : "Off"}</li>
            <li>
              Split method:{" "}
              {mergeSplit === "base" ? "Merge into base" : "Per currency"}
            </li>
          </ul>
        </div>
      </div>
      {submitError ? <ErrorMessage error={submitError} /> : null}
    </SubCard>
  );
}

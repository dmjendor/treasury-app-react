// app/_components/vaults/steps/new-vault-step-4-settings.js
"use client";

import InputComponent from "@/app/_components/InputComponent";
import Select from "@/app/_components/Select";
import SubCard from "@/app/_components/SubCard";

/**
 * Render the new vault wizard settings step.
 * @param {object} props
 * @returns {JSX.Element}
 */
export default function NewVaultStepSettings({
  allowXferIn,
  setAllowXferIn,
  allowXferOut,
  setAllowXferOut,
  treasurySplitEnabled,
  setTreasurySplitEnabled,
  rewardPrepEnabled,
  setRewardPrepEnabled,
  mergeSplit,
  setMergeSplit,
  stepErrors,
  setStepErrors,
}) {
  return (
    <SubCard className="space-y-4">
      <div className="text-sm font-semibold text-fg">Step 4: Settings</div>
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="text-sm font-semibold text-fg">Transfer settings</div>
        <div className="grid gap-2 sm:grid-cols-2">
          <InputComponent
            id="allow-xfer-in"
            label="Allow transfers in"
            type="checkbox"
            checked={allowXferIn}
            error={stepErrors.allow_xfer_in}
            onChange={(e) => {
              setAllowXferIn(e.target.checked);
              if (stepErrors.allow_xfer_in) {
                setStepErrors((prev) => {
                  const next = { ...prev };
                  delete next.allow_xfer_in;
                  return next;
                });
              }
            }}
          />
          <InputComponent
            id="allow-xfer-out"
            label="Allow transfers out"
            type="checkbox"
            checked={allowXferOut}
            error={stepErrors.allow_xfer_out}
            onChange={(e) => {
              setAllowXferOut(e.target.checked);
              if (stepErrors.allow_xfer_out) {
                setStepErrors((prev) => {
                  const next = { ...prev };
                  delete next.allow_xfer_out;
                  return next;
                });
              }
            }}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="text-sm font-semibold text-fg">Workflow settings</div>
        <div className="grid gap-2 sm:grid-cols-2">
          <InputComponent
            id="treasury-split"
            label="Enable splitting treasure"
            type="checkbox"
            checked={treasurySplitEnabled}
            error={stepErrors.treasury_split_enabled}
            onChange={(e) => {
              setTreasurySplitEnabled(e.target.checked);
              if (stepErrors.treasury_split_enabled) {
                setStepErrors((prev) => {
                  const next = { ...prev };
                  delete next.treasury_split_enabled;
                  return next;
                });
              }
            }}
          />
          <InputComponent
            id="reward-prep"
            label="Enable reward prep"
            type="checkbox"
            checked={rewardPrepEnabled}
            error={stepErrors.reward_prep_enabled}
            onChange={(e) => {
              setRewardPrepEnabled(e.target.checked);
              if (stepErrors.reward_prep_enabled) {
                setStepErrors((prev) => {
                  const next = { ...prev };
                  delete next.reward_prep_enabled;
                  return next;
                });
              }
            }}
          />
        </div>
        <Select
          id="merge-split"
          label="Split method"
          value={mergeSplit}
          error={stepErrors.merge_split}
          onChange={(e) => {
            setMergeSplit(e.target.value);
            if (stepErrors.merge_split) {
              setStepErrors((prev) => {
                const next = { ...prev };
                delete next.merge_split;
                return next;
              });
            }
          }}
        >
          <option value="per_currency">Split each currency independently</option>
          <option value="base">
            Merge all into base currency before splitting
          </option>
        </Select>
      </div>

      {/* Markups section will be added once implemented */}
    </SubCard>
  );
}

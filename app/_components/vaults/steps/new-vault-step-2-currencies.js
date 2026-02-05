// app/_components/vaults/steps/new-vault-step-2-currencies.js
"use client";

import { Button } from "@/app/_components/Button";
import ErrorMessage from "@/app/_components/ErrorMessage";
import InputComponent from "@/app/_components/InputComponent";
import Select from "@/app/_components/Select";
import SubCard from "@/app/_components/SubCard";

/**
 * Render the new vault wizard currencies step.
 * @param {object} props
 * @returns {JSX.Element}
 */
export default function NewVaultStepCurrencies({
  currencies,
  newCurrency,
  setNewCurrency,
  baseCurrencyId,
  setBaseCurrencyId,
  commonCurrencyId,
  setCommonCurrencyId,
  systemDefaults,
  stepErrors,
  setStepErrors,
  onAddCurrency,
  onRemoveCurrency,
  onUseSystemDefaults,
}) {
  return (
    <SubCard className="space-y-4">
      <div className="text-sm font-semibold text-fg">Step 2: Currencies</div>
      {currencies.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-fg">
          No currencies added yet.
        </div>
      ) : (
        <div className="space-y-2">
          {currencies.map((row) => (
            <div
              key={row.localId}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm"
            >
              <div>
                <div className="font-semibold text-fg">
                  {row.name || "Unnamed currency"}
                </div>
                <div className="text-xs text-muted-fg">
                  {row.code || "NO CODE"} - rate {row.rate || "1"}
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onRemoveCurrency(row.localId)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_auto]">
        <InputComponent
          id="new-currency-name"
          label="Currency name"
          value={newCurrency.name}
          onChange={(e) =>
            setNewCurrency((prev) => ({
              ...prev,
              name: e.target.value,
            }))
          }
        />
        <InputComponent
          id="new-currency-code"
          label="Code"
          value={newCurrency.code}
          onChange={(e) =>
            setNewCurrency((prev) => ({
              ...prev,
              code: e.target.value,
            }))
          }
        />
        <InputComponent
          id="new-currency-rate"
          label="Rate"
          type="number"
          step="any"
          value={newCurrency.rate}
          onChange={(e) =>
            setNewCurrency((prev) => ({
              ...prev,
              rate: e.target.value,
            }))
          }
        />
        <div className="flex items-end">
          <Button
            type="button"
            variant="primary"
            onClick={onAddCurrency}
          >
            Add
          </Button>
        </div>
      </div>

      {stepErrors.currencies ? (
        <ErrorMessage error={stepErrors.currencies} />
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={!systemDefaults.length}
          onClick={onUseSystemDefaults}
        >
          Use system defaults
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          id="vault-base-currency"
          label="Base currency"
          hint="Lowest denomination"
          value={baseCurrencyId}
          error={stepErrors.base_currency_id}
          onChange={(e) => {
            setBaseCurrencyId(e.target.value);
            if (stepErrors.base_currency_id) {
              setStepErrors((prev) => {
                const next = { ...prev };
                delete next.base_currency_id;
                return next;
              });
            }
          }}
        >
          <option value="">Select base currency...</option>
          {currencies.map((row) => (
            <option
              key={row.localId}
              value={row.localId}
            >
              {row.name || row.code || "Currency"}
            </option>
          ))}
        </Select>
        <Select
          id="vault-common-currency"
          label="Common currency"
          hint="Most common denomination"
          value={commonCurrencyId}
          error={stepErrors.common_currency_id}
          onChange={(e) => {
            setCommonCurrencyId(e.target.value);
            if (stepErrors.common_currency_id) {
              setStepErrors((prev) => {
                const next = { ...prev };
                delete next.common_currency_id;
                return next;
              });
            }
          }}
        >
          <option value="">Select common currency...</option>
          {currencies.map((row) => (
            <option
              key={row.localId}
              value={row.localId}
            >
              {row.name || row.code || "Currency"}
            </option>
          ))}
        </Select>
      </div>
      <div className="text-xs text-muted-fg">
        Currency selection is local only until submission wiring is added.
      </div>
    </SubCard>
  );
}

/**
 * Reward prep wizard step 2.
 */
"use client";

import { useFieldArray } from "react-hook-form";
import { Button } from "@/app/_components/Button";
import SubCard from "@/app/_components/SubCard";
import InputComponent from "@/app/_components/InputComponent";
import Select from "@/app/_components/Select";

/**
 * Reward prep wizard step 2.
 * @param {{ form: any, currencies?: Array<{id:string,name?:string,code?:string}>, baseCurrencyId?: string|null }} props
 * @returns {JSX.Element}
 */
export default function RewardPrepStepHoldings({ form, vault }) {
  const {
    control,
    register,
    formState: { errors },
  } = form;

  console.log(vault);
  const currencies = vault?.currencyList;
  const commonCurrencyId = vault?.common_currency_id;

  const currencyOptions = Array.isArray(currencies)
    ? currencies.sort((a, b) => a.rate - b.rate)
    : [];
  const commonId = commonCurrencyId != null ? String(commonCurrencyId) : "";
  const defaultCurrencyId =
    commonId &&
    currencyOptions.some((currency) => String(currency.id) === commonId)
      ? commonId
      : currencyOptions.length > 0
        ? String(currencyOptions[0].id)
        : "";

  const { fields, append, remove } = useFieldArray({
    control,
    name: "holdings",
  });

  return (
    <div className="space-y-4">
      {fields.length === 0 ? (
        <SubCard>
          <p className="text-sm">
            No currency rows yet. Add a row to stage coin for this reward.
          </p>
        </SubCard>
      ) : null}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <SubCard
            key={field.id}
            className="space-y-3"
          >
            <div className="grid gap-3 md:grid-cols-[2fr,1fr,auto]">
              <Select
                label="Currency"
                error={errors?.holdings?.[index]?.currency_id?.message}
                {...register(`holdings.${index}.currency_id`)}
              >
                {currencyOptions.map((option) => (
                  <option
                    key={option.id}
                    value={option.id}
                  >
                    {option.name || option.code || "Currency"}
                  </option>
                ))}
              </Select>

              <InputComponent
                label="Value"
                type="number"
                min={0}
                error={errors?.holdings?.[index]?.value?.message}
                {...register(`holdings.${index}.value`, {
                  valueAsNumber: true,
                })}
              />

              <div className="flex items-end">
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  Remove
                </Button>
              </div>
            </div>
          </SubCard>
        ))}
      </div>

      <Button
        type="button"
        variant="accent"
        size="sm"
        onClick={() =>
          append({
            currency_id: defaultCurrencyId,
            value: 0,
          })
        }
        disabled={!defaultCurrencyId}
      >
        Add currency
      </Button>
    </div>
  );
}

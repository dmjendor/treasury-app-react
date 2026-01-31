/**
 * Reward prep wizard step 2.
 */
"use client";

import { useFieldArray } from "react-hook-form";
import { Button } from "@/app/_components/Button";
import SubCard from "@/app/_components/SubCard";
import InputComponent from "@/app/_components/InputComponent";
import Select from "@/app/_components/Select";

const currencyOptions = [
  { id: "11111111-1111-1111-1111-111111111111", label: "Gold" },
  { id: "22222222-2222-2222-2222-222222222222", label: "Silver" },
  { id: "33333333-3333-3333-3333-333333333333", label: "Copper" },
];

/**
 * Reward prep wizard step 2.
 * @param {{ form: any }} props
 * @returns {JSX.Element}
 */
export default function RewardPrepStepHoldings({ form }) {
  const {
    control,
    register,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "holdings",
  });

  return (
    <div className="space-y-4">
      {fields.length === 0 ? (
        <SubCard>
          <p className="text-sm text-muted-fg">
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
                    {option.label}
                  </option>
                ))}
              </Select>

              <InputComponent
                label="Amount"
                type="number"
                min={0}
                error={errors?.holdings?.[index]?.amount?.message}
                {...register(`holdings.${index}.amount`, {
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
            currency_id: currencyOptions[0].id,
            amount: 0,
          })
        }
      >
        Add currency
      </Button>
    </div>
  );
}

/**
 * Reward prep wizard step 4.
 */
"use client";

import { useFieldArray } from "react-hook-form";
import { Button } from "@/app/_components/Button";
import SubCard from "@/app/_components/SubCard";
import InputComponent from "@/app/_components/InputComponent";
import Select from "@/app/_components/Select";
import Textarea from "@/app/_components/Textarea";

const valuableOptions = [
  { id: "77777777-7777-7777-7777-777777777777", label: "Art object" },
  { id: "88888888-8888-8888-8888-888888888888", label: "Jeweled goblet" },
  { id: "99999999-9999-9999-9999-999999999999", label: "Rare tapestry" },
];

/**
 * Reward prep wizard step 4.
 * @param {{ form: any }} props
 * @returns {JSX.Element}
 */
export default function RewardPrepStepValuables({ form }) {
  const {
    control,
    register,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "valuables",
  });

  return (
    <div className="space-y-4">
      {fields.length === 0 ? (
        <SubCard>
          <p className="text-sm text-muted-fg">
            No valuable rows yet. Add valuables to include with this reward.
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
                label="Item"
                error={errors?.valuables?.[index]?.defaultvaluable_id?.message}
                {...register(`valuables.${index}.defaultvaluable_id`)}
              >
                {valuableOptions.map((option) => (
                  <option
                    key={option.id}
                    value={option.id}
                  >
                    {option.label}
                  </option>
                ))}
              </Select>

              <InputComponent
                label="Qty"
                type="number"
                min={1}
                error={errors?.valuables?.[index]?.quantity?.message}
                {...register(`valuables.${index}.quantity`, {
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

            <Textarea
              label="Notes"
              rows={3}
              placeholder="Optional details"
              error={errors?.valuables?.[index]?.notes?.message}
              {...register(`valuables.${index}.notes`)}
            />
          </SubCard>
        ))}
      </div>

      <Button
        type="button"
        variant="accent"
        size="sm"
        onClick={() =>
          append({
            defaultvaluable_id: valuableOptions[0].id,
            quantity: 1,
            notes: "",
          })
        }
      >
        Add valuable
      </Button>
    </div>
  );
}

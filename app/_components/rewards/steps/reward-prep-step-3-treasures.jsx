/**
 * Reward prep wizard step 3.
 */
"use client";

import { useFieldArray } from "react-hook-form";
import { Button } from "@/app/_components/Button";
import SubCard from "@/app/_components/SubCard";
import InputComponent from "@/app/_components/InputComponent";
import Select from "@/app/_components/Select";
import Textarea from "@/app/_components/Textarea";

const treasureOptions = [
  { id: "44444444-4444-4444-4444-444444444444", label: "Gem pouch" },
  { id: "55555555-5555-5555-5555-555555555555", label: "Ancient coin" },
  { id: "66666666-6666-6666-6666-666666666666", label: "Silver idol" },
];

/**
 * Reward prep wizard step 3.
 * @param {{ form: any }} props
 * @returns {JSX.Element}
 */
export default function RewardPrepStepTreasures({ form }) {
  const {
    control,
    register,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "treasures",
  });

  return (
    <div className="space-y-4">
      {fields.length === 0 ? (
        <SubCard>
          <p className="text-sm text-muted-fg">
            No treasure rows yet. Add items to include with this reward.
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
                error={errors?.treasures?.[index]?.defaulttreasure_id?.message}
                {...register(`treasures.${index}.defaulttreasure_id`)}
              >
                {treasureOptions.map((option) => (
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
                error={errors?.treasures?.[index]?.quantity?.message}
                {...register(`treasures.${index}.quantity`, {
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
              error={errors?.treasures?.[index]?.notes?.message}
              {...register(`treasures.${index}.notes`)}
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
            defaulttreasure_id: treasureOptions[0].id,
            quantity: 1,
            notes: "",
          })
        }
      >
        Add treasure
      </Button>
    </div>
  );
}

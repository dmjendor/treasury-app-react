/**
 * Reward prep wizard step 1.
 */
"use client";

import InputComponent from "@/app/_components/InputComponent";
import Textarea from "@/app/_components/Textarea";

/**
 * Render reward details step.
 * @param {{ form: any }} props
 * @returns {JSX.Element}
 */
export default function RewardPrepStepDetails({ form }) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-4">
      <InputComponent
        label="Reward name"
        placeholder="Starter haul"
        error={errors?.name?.message}
        {...register("name")}
      />

      <Textarea
        label="Description"
        rows={4}
        placeholder="Short note about where this reward comes from."
        error={errors?.description?.message}
        {...register("description")}
      />
    </div>
  );
}

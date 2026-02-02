import { z } from "zod";

const uuidString = z.string().uuid();

/* --------------------------
   Step 1: Reward details
   -------------------------- */

const rewardDetailsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Reward name is required")
    .max(80, "Keep the name under 80 characters"),

  description: z
    .string()
    .trim()
    .max(500, "Keep the description under 500 characters")
    .optional()
    .default(""),

  value_unit: z.enum(["common", "base"]).default("common"),
});

/* --------------------------
   Step 2: Holdings
   -------------------------- */

const holdingRowSchema = z.object({
  currency_id: uuidString,
  value: z.coerce.number().int().min(0, "Value must be 0 or more"),
});

/* --------------------------
   Step 3: Treasures


   Matches TreasuresForm payload fields:
   container_id, name, genericname, description, value, quantity, identified, magical, archived
   UI-only valueUnit/displayValue are not stored here.
-------------------------- */
const prepTreasureRowSchema = z.object({
  container_id: z.string().uuid("Choose a valid container"),

  name: z
    .string()
    .trim()
    .min(1, "Treasure name is required")
    .max(120, "Treasure name must be under 120 characters"),

  genericname: z
    .string()
    .trim()
    .max(120, "Generic name must be under 120 characters")
    .optional()
    .nullable()
    .default(null),

  description: z
    .string()
    .trim()
    .max(1000, "Description must be under 1000 characters")
    .optional()
    .nullable()
    .default(null),

  // Stored in base units (same as TreasuresForm payload.value)
  value: z.coerce
    .number()
    .int("Value must be a whole number")
    .min(0, "Value must be 0 or greater")
    .default(0),

  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number")
    .min(0, "Quantity must be 0 or greater")
    .default(1),

  identified: z.coerce.boolean().default(false),
  magical: z.coerce.boolean().default(false),
});

/* --------------------------
   Step 4: Valuables
   -------------------------- */

const prepValuableRowSchema = z.object({
  container_id: z.string().uuid("Choose a valid container"),

  name: z
    .string()
    .trim()
    .min(1, "Valuable name is required")
    .max(120, "Valuable name must be under 120 characters"),

  // Stored in base units (same as ValuablesForm payload.value)
  value: z.coerce
    .number()
    .int("Value must be a whole number")
    .min(0, "Value must be 0 or greater")
    .default(0),

  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number")
    .min(0, "Quantity must be 0 or greater")
    .default(1),
});

/* --------------------------
   Draft schema (wizard state)
   -------------------------- */

export const rewardPrepDraftSchema = z.object({
  reward_prep_id: uuidString.optional(),

  ...rewardDetailsSchema.shape,

  holdings: z.array(holdingRowSchema).optional().default([]),

  treasures: z.array(prepTreasureRowSchema).optional().default([]),

  valuables: z.array(prepValuableRowSchema).optional().default([]),
});

/* --------------------------
   Finalize schema
   -------------------------- */

export const rewardPrepFinalizeSchema = rewardPrepDraftSchema.superRefine(
  (val, ctx) => {
    const hasHoldings = val.holdings.length > 0;
    const hasTreasures = val.treasures.length > 0;
    const hasValuables = val.valuables.length > 0;

    if (!hasHoldings && !hasTreasures && !hasValuables) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Add at least one holding, treasure, or valuable before submitting.",
        path: ["holdings"], // stable anchor for UI
      });
    }
  },
);

/* --------------------------
   Step → field mapping
   -------------------------- */

export const rewardPrepStepFieldNames = {
  1: ["name", "description", "value_unit"],
  2: ["holdings"],
  3: ["treasures"],
  4: ["valuables"],
  5: ["name", "description", "holdings", "treasures", "valuables"],
};

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
});

/* --------------------------
   Step 2: Holdings
   -------------------------- */

const holdingRowSchema = z.object({
  currency_code: z.string().trim().min(1, "Choose a currency"),

  amount: z.coerce.number().int().min(0, "Amount must be 0 or more"),
});

/* --------------------------
   Step 3: Treasures
   -------------------------- */

const prepTreasureRowSchema = z.object({
  name: z.string().trim().min(1, "Treasure name is required"),

  value_cp: z.coerce.number().int().min(0).optional().default(0),

  quantity: z.coerce
    .number()
    .int()
    .min(1, "Quantity must be at least 1")
    .default(1),

  notes: z.string().trim().max(200).optional().default(""),
});

/* --------------------------
   Step 4: Valuables
   -------------------------- */

const prepValuableRowSchema = z.object({
  name: z.string().trim().min(1, "Valuable name is required"),

  value_cp: z.coerce.number().int().min(0).optional().default(0),

  quantity: z.coerce
    .number()
    .int()
    .min(1, "Quantity must be at least 1")
    .default(1),

  notes: z.string().trim().max(200).optional().default(""),
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
  1: ["name", "description"],
  2: ["holdings"],
  3: ["treasures"],
  4: ["valuables"],
  5: ["name", "description", "holdings", "treasures", "valuables"],
};

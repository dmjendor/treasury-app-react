// app/_lib/validation/new-vault.schema.js
import { z } from "zod";

const uuidString = z.string().uuid();

const optionalUuid = z
  .string()
  .optional()
  .nullable()
  .refine(
    (value) =>
      value == null ||
      value === "" ||
      z.string().uuid().safeParse(value).success,
    { message: "Choose a valid id." },
  );

/* --------------------------
   Step 1: Basics
   -------------------------- */

const newVaultBasicsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Vault name is required")
    .max(80, "Keep the name under 80 characters"),
  system_id: optionalUuid,
  theme_id: optionalUuid,
});

/* --------------------------
   Step 2: Currencies
   -------------------------- */

const newVaultCurrencySchema = z.object({
  id: z.string().optional().nullable(),
  name: z
    .string()
    .trim()
    .min(1, "Currency name is required")
    .max(80, "Keep the currency name under 80 characters"),
  code: z
    .string()
    .trim()
    .min(1, "Currency code is required")
    .max(10, "Keep the currency code under 10 characters"),
  rate: z.coerce
    .number()
    .gt(0, "Rate must be greater than 0")
    .default(1),
});

/* --------------------------
   Step 3: Containers
   -------------------------- */

const newVaultContainerSchema = z.object({
  id: z.string().optional().nullable(),
  name: z
    .string()
    .trim()
    .min(2, "Container name is required")
    .max(80, "Keep the container name under 80 characters"),
  is_hidden: z.coerce.boolean().default(false),
});

/* --------------------------
   Step 4: Settings
   -------------------------- */

const newVaultSettingsSchema = z.object({
  allow_xfer_in: z.coerce.boolean().default(true),
  allow_xfer_out: z.coerce.boolean().default(false),
  treasury_split_enabled: z.coerce.boolean().default(true),
  reward_prep_enabled: z.coerce.boolean().default(true),
  merge_split: z.enum(["base", "per_currency"]).default("per_currency"),
  vo_buy_markup: z.coerce.number().min(0).default(0),
  vo_sell_markup: z.coerce.number().min(0).default(0),
  item_buy_markup: z.coerce.number().min(0).default(0),
  item_sell_markup: z.coerce.number().min(0).default(0),
});

/* --------------------------
   Draft schema (wizard state)
   -------------------------- */

export const newVaultDraftSchema = z.object({
  id: uuidString.optional(),
  ...newVaultBasicsSchema.shape,
  currencies: z.array(newVaultCurrencySchema).optional().default([]),
  base_currency_id: optionalUuid,
  common_currency_id: optionalUuid,
  containers: z.array(newVaultContainerSchema).optional().default([]),
  ...newVaultSettingsSchema.shape,
});

/* --------------------------
   Finalize schema
   -------------------------- */

export const newVaultFinalizeSchema = newVaultDraftSchema;

/* --------------------------
   Step → field mapping
   -------------------------- */

export const newVaultStepFieldNames = {
  1: ["name", "system_id", "theme_id"],
  2: ["currencies", "base_currency_id", "common_currency_id"],
  3: ["containers"],
  4: [
    "allow_xfer_in",
    "allow_xfer_out",
    "treasury_split_enabled",
    "reward_prep_enabled",
    "merge_split",
    "vo_buy_markup",
    "vo_sell_markup",
    "item_buy_markup",
    "item_sell_markup",
  ],
  5: [
    "name",
    "system_id",
    "theme_id",
    "currencies",
    "base_currency_id",
    "common_currency_id",
    "containers",
    "allow_xfer_in",
    "allow_xfer_out",
    "treasury_split_enabled",
    "reward_prep_enabled",
    "merge_split",
    "vo_buy_markup",
    "vo_sell_markup",
    "item_buy_markup",
    "item_sell_markup",
  ],
};

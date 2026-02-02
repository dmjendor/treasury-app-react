/**
 * Actions: reward prep.
 */
"use server";

import { auth } from "@/app/_lib/auth";
import {
  createPrepHoldingsDb,
  createPrepTreasuresDb,
  createRewardPrepDb,
} from "@/app/_lib/data/reward-prep.data";
import { createPrepValuablesDb } from "@/app/_lib/data/valuables.data";

/**
 * - Submit a reward prep with all prep items.
 * @param {{ vaultId: string, name: string, description?: string, value_unit?: string, holdings?: Array<any>, treasures?: Array<any>, valuables?: Array<any> }} input
 * @returns {Promise<{ ok: boolean, error: string|null, data: any }>}
 */
export async function submitRewardPrepAction(input) {
  try {
    const session = await auth();
    if (!session) {
      return { ok: false, error: "You must be logged in.", data: null };
    }

    const vaultId = input?.vaultId;
    if (!vaultId) {
      return { ok: false, error: "Missing vault id.", data: null };
    }

    const name = typeof input?.name === "string" ? input.name.trim() : "";
    if (!name) {
      return { ok: false, error: "Reward name is required.", data: null };
    }

    const description =
      typeof input?.description === "string" ? input.description.trim() : "";
    const valueUnit =
      typeof input?.value_unit === "string" ? input.value_unit : "common";

    const createdPrep = await createRewardPrepDb({
      vault_id: String(vaultId),
      name,
      description,
      value_unit: valueUnit,
    });

    if (!Array.isArray(createdPrep) || createdPrep.length === 0) {
      return { ok: false, error: "Reward prep could not be created.", data: null };
    }

    const rewardPrepId = createdPrep[0]?.id;
    if (!rewardPrepId) {
      return { ok: false, error: "Reward prep id missing.", data: null };
    }

    const holdings = Array.isArray(input?.holdings) ? input.holdings : [];
    const treasures = Array.isArray(input?.treasures) ? input.treasures : [];
    const valuables = Array.isArray(input?.valuables) ? input.valuables : [];

    const holdingRows = holdings.map((row) => ({
      vault_id: String(vaultId),
      reward_id: String(rewardPrepId),
      currency_id: row.currency_id,
      value: row.value ?? 0,
    }));

    const treasureRows = treasures.map((row) => ({
      vault_id: String(vaultId),
      reward_id: String(rewardPrepId),
      container_id: row.container_id,
      name: row.name,
      genericname: row.genericname ?? null,
      description: row.description ?? null,
      value: row.value ?? 0,
      quantity: row.quantity ?? 0,
      identified: Boolean(row.identified),
      magical: Boolean(row.magical),
      archived: Boolean(row.archived),
    }));

    const valuableRows = valuables.map((row) => ({
      vault_id: String(vaultId),
      reward_id: String(rewardPrepId),
      container_id: row.container_id,
      name: row.name,
      description: row.description ?? null,
      value: row.value ?? 0,
      quantity: row.quantity ?? 0,
    }));

    const [holdingRes, treasureRes, valuableRes] = await Promise.all([
      createPrepHoldingsDb(holdingRows),
      createPrepTreasuresDb(treasureRows),
      createPrepValuablesDb(valuableRows),
    ]);

    if (
      holdingRows.length !== holdingRes.length ||
      treasureRows.length !== treasureRes.length ||
      valuableRows.length !== valuableRes.length
    ) {
      return {
        ok: false,
        error: "Reward prep items could not be saved.",
        data: { reward_prep_id: rewardPrepId },
      };
    }

    return { ok: true, error: null, data: { reward_prep_id: rewardPrepId } };
  } catch (error) {
    console.error("submitRewardPrepAction failed", error);
    return {
      ok: false,
      error: error?.message || "Reward prep could not be saved.",
      data: null,
    };
  }
}

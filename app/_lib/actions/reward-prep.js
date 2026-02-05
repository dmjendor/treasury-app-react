/**
 * Actions: reward prep.
 */
"use server";

import { auth } from "@/app/_lib/auth";
import {
  createPrepHoldingsDb,
  createPrepTreasuresDb,
  createPrepValuablesDb,
  createRewardPrepDb,
  deleteRewardPrepDb,
  deleteRewardPrepItemsDb,
  getRewardPrepByIdDb,
  getRewardPrepListDb,
  giveRewardPrepDb,
  updateRewardPrepDb,
} from "@/app/_lib/data/reward-prep.data";

/**
 * - Submit a reward prep with all prep items.
 * @param {{ vaultId: string, name: string, description?: string, holdings?: Array<any>, treasures?: Array<any>, valuables?: Array<any> }} input
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
    const createdPrep = await createRewardPrepDb({
      vault_id: String(vaultId),
      name,
      description,
    });

    if (!Array.isArray(createdPrep) || createdPrep.length === 0) {
      return {
        ok: false,
        error: "Reward prep could not be created.",
        data: null,
      };
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

export async function fetchRewardPrepAction({ vaultId, showAll = true }) {
  try {
    if (!vaultId) return { ok: false, error: "Missing vaultId." };

    const data = await getRewardPrepListDb(vaultId, showAll);
    return data;
  } catch (err) {
    return {
      ok: false,
      data: null,
      error: err?.message || "Failed to load rewards.",
    };
  }
}

/**
 * Update a reward prep and its items.
 * @param {{ vaultId: string, rewardPrepId: string, name: string, description?: string, holdings?: Array<any>, treasures?: Array<any>, valuables?: Array<any> }} input
 * @returns {Promise<{ ok: boolean, error: string|null, data: any }>}
 */
export async function updateRewardPrepAction(input) {
  try {
    const session = await auth();
    if (!session) {
      return { ok: false, error: "You must be logged in.", data: null };
    }

    const vaultId = input?.vaultId;
    const rewardPrepId = input?.rewardPrepId;
    if (!vaultId || !rewardPrepId) {
      return { ok: false, error: "Missing reward prep id.", data: null };
    }

    const name = typeof input?.name === "string" ? input.name.trim() : "";
    if (!name) {
      return { ok: false, error: "Reward name is required.", data: null };
    }

    const description =
      typeof input?.description === "string" ? input.description.trim() : "";
    const rewardRes = await updateRewardPrepDb({
      vault_id: String(vaultId),
      reward_id: String(rewardPrepId),
      name,
      description,
    });

    if (!rewardRes?.ok) {
      return {
        ok: false,
        error: rewardRes?.error || "Reward prep could not be updated.",
        data: null,
      };
    }

    const clearRes = await deleteRewardPrepItemsDb({
      vaultId: String(vaultId),
      rewardPrepId: String(rewardPrepId),
    });

    if (!clearRes?.ok) {
      return {
        ok: false,
        error: clearRes?.error || "Reward prep items could not be cleared.",
        data: null,
      };
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
    console.error("updateRewardPrepAction failed", error);
    return {
      ok: false,
      error: error?.message || "Reward prep could not be saved.",
      data: null,
    };
  }
}

/**
 * Delete a reward prep and its items.
 * @param {{ vaultId: string, rewardPrepId: string }} input
 * @returns {Promise<{ ok: boolean, error: string|null, data: any }>}
 */
export async function deleteRewardPrepAction(input) {
  try {
    const session = await auth();
    if (!session) {
      return { ok: false, error: "You must be logged in.", data: null };
    }

    const vaultId = input?.vaultId;
    const rewardPrepId = input?.rewardPrepId;
    if (!vaultId || !rewardPrepId) {
      return { ok: false, error: "Missing reward prep id.", data: null };
    }

    const existing = await getRewardPrepByIdDb({
      vaultId: String(vaultId),
      rewardPrepId: String(rewardPrepId),
    });

    if (!existing?.ok || !existing?.data) {
      return {
        ok: false,
        error: existing?.error || "Reward prep could not be found.",
        data: null,
      };
    }

    const deleteRes = await deleteRewardPrepDb({
      vaultId: String(vaultId),
      rewardPrepId: String(rewardPrepId),
    });

    if (!deleteRes?.ok) {
      return {
        ok: false,
        error: deleteRes?.error || "Reward prep could not be deleted.",
        data: null,
      };
    }

    return { ok: true, error: null, data: { reward_prep_id: rewardPrepId } };
  } catch (error) {
    console.error("deleteRewardPrepAction failed", error);
    return {
      ok: false,
      error: error?.message || "Reward prep could not be deleted.",
      data: null,
    };
  }
}

/**
 * Give a prepared reward and archive it.
 * @param {{ vaultId: string, rewardPrepId: string }} input
 * @returns {Promise<{ ok: boolean, error: string|null, data: any }>}
 */
export async function giveRewardAction(input) {
  try {
    const session = await auth();
    if (!session) {
      return { ok: false, error: "You must be logged in.", data: null };
    }

    const vaultId = input?.vaultId;
    const rewardPrepId = input?.rewardPrepId;

    if (!vaultId || !rewardPrepId) {
      return { ok: false, error: "Missing reward prep id.", data: null };
    }

    const result = await giveRewardPrepDb({
      vaultId: String(vaultId),
      rewardPrepId: String(rewardPrepId),
    });

    if (!result?.ok) {
      return {
        ok: false,
        error: result?.error || "Reward could not be given.",
        data: null,
      };
    }

    return { ok: true, error: null, data: { reward_prep_id: rewardPrepId } };
  } catch (error) {
    console.error("giveRewardAction failed", error);
    return {
      ok: false,
      error: error?.message || "Reward could not be given.",
      data: null,
    };
  }
}

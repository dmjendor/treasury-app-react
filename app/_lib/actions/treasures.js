"use server";

import {
  createTreasureDb,
  getDefaultTreasures,
  updateTreasureForVaultById,
} from "@/app/_lib/data/treasures.data";
import { tryCreateVaultLog } from "@/app/_lib/data/logs.data";
import {
  buildVaultLogInput,
  safeCreateVaultLog,
} from "@/app/_lib/logging/createVaultLog";
import { auth } from "@/app/_lib/auth";

export async function createTreasureAction(payload) {
  try {
    const created = await createTreasureDb(payload);
    const createdTreasure = Array.isArray(created) ? created[0] : null;

    if (createdTreasure) {
      const logInput = await buildVaultLogInput({
        vaultId: createdTreasure.vault_id,
        source: "treasures",
        action: "create",
        entityType: "treasures",
        entityId: createdTreasure.id,
        after: createdTreasure,
        message: `Treasure ${createdTreasure.name} created`,
      });

      await safeCreateVaultLog({ tryCreateVaultLog, input: logInput });
    }

    return { ok: true, error: null, data: createdTreasure };
  } catch (e) {
    return {
      ok: false,
      error: e?.message || "Create treasure failed.",
      data: null,
    };
  }
}

export async function getDefaultTreasuresAction({ vaultId }) {
  try {
    if (!vaultId) return { ok: false, error: "Missing vaultId", data: null };

    const rows = await getDefaultTreasures(vaultId);
    return { ok: true, error: null, data: Array.isArray(rows) ? rows : [] };
  } catch (err) {
    return {
      ok: false,
      error: err?.message || "Failed to load default treasures",
      data: null,
    };
  }
}

export async function updateTreasureAction({ id, vaultId, patch }) {
  try {
    const session = await auth();
    if (!session) {
      return { ok: false, error: "You must be logged in.", data: null };
    }

    if (!id) return { ok: false, error: "Missing treasure id.", data: null };
    if (!vaultId) return { ok: false, error: "Missing vault id.", data: null };
    if (!patch || typeof patch !== "object") {
      return { ok: false, error: "Missing treasure updates.", data: null };
    }

    const updateResult = await updateTreasureForVaultById(vaultId, id, patch);

    if (!updateResult.ok) {
      return {
        ok: false,
        error: updateResult.error || "Update treasure failed.",
        data: null,
      };
    }

    const { before, after } = updateResult.data;

    const logInput = await buildVaultLogInput({
      vaultId,
      source: "treasures",
      action: "update",
      entityType: "treasures",
      entityId: id,
      before,
      after,
      labels: {
        name: "Name",
        description: "Description",
        value: "Value",
      },
      message: `Treasure ${after.name} updated`,
    });

    await safeCreateVaultLog({ tryCreateVaultLog, input: logInput });

    return { ok: true, error: null, data: after };
  } catch (error) {
    return {
      ok: false,
      error: error?.message || "Update treasure failed.",
      data: null,
    };
  }
}

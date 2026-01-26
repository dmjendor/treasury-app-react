"use server";

import {
  createTreasureDb,
  getDefaultTreasures,
} from "@/app/_lib/data/treasures.data";

export async function createTreasureAction(payload) {
  try {
    const result = await createTreasureDb(payload, { includeLog: true });
    return { ok: true, error: null, data: { log: result?.log ?? null } };
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

//TODO update the edit treasures workflow to use an updateTreasureAction so we can handle logging.
export async function updateTreasureAction(payload) {
  try {
    const updateResult = await updateTreasure({ id, vaultId, patch });

    if (updateResult.ok) {
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
        message: "Treasure updated",
      });

      await safeCreateVaultLog({ tryCreateVaultLog, input: logInput });
    }
  } catch (error) {}
}

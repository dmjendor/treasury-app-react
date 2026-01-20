"use server";

import {
  createTreasureDb,
  getDefaultTreasures,
} from "@/app/_lib/data/treasures.data";

export async function createTreasureAction(payload) {
  try {
    await createTreasureDb(payload);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e?.message || "Create treasure failed." };
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

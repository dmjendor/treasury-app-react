"use server";

import { createTreasureDb } from "@/app/_lib/data/treasures.data";
import { getDefaultTreasures } from "@/app/_lib/data/treasures.data";

export async function createTreasureAction(payload) {
  try {
    await createTreasureDb(payload);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e?.message || "Create treasure failed." };
  }
}

export async function getDefaultTreasuresAction({ systemId }) {
  try {
    if (!systemId) return { ok: false, error: "Missing systemId", data: null };

    const rows = await getDefaultTreasures(systemId);
    return { ok: true, error: null, data: Array.isArray(rows) ? rows : [] };
  } catch (err) {
    return {
      ok: false,
      error: err?.message || "Failed to load default treasures",
      data: null,
    };
  }
}

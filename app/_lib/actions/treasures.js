"use server";

import { createTreasureDb } from "@/app/_lib/data/treasures.data";

export async function createTreasureAction(payload) {
  try {
    await createTreasureDb(payload);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e?.message || "Create treasure failed." };
  }
}

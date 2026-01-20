"use server";

import {
  createValuableDb,
  getDefaultValuables,
} from "@/app/_lib/data/valuables.data";

export async function createValuableAction(payload) {
  try {
    await createValuableDb(payload);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e?.message || "Create valuable failed." };
  }
}

export async function getDefaultValuablesAction({ vaultId }) {
  try {
    if (!vaultId) return { ok: false, error: "Missing vaultId", data: null };

    const rows = await getDefaultValuables(vaultId);
    return { ok: true, error: null, data: Array.isArray(rows) ? rows : [] };
  } catch (err) {
    return {
      ok: false,
      error: err?.message || "Failed to load default valuables",
      data: null,
    };
  }
}

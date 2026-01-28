"use server";

import {
  createValuableDb,
  getDefaultValuables,
  updateValuableForVaultById,
} from "@/app/_lib/data/valuables.data";
import { auth } from "@/app/_lib/auth";

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

/**
 * - Move a valuable to a new container.
 * @param {{ vaultId: string, valuableId: string, containerId: string }} input
 * @returns {Promise<{ ok: boolean, error: string | null, data: any }>}
 */
export async function moveValuableToContainerAction({
  vaultId,
  valuableId,
  containerId,
}) {
  try {
    const session = await auth();
    if (!session) {
      return { ok: false, error: "You must be logged in.", data: null };
    }

    if (!vaultId) return { ok: false, error: "Missing vault id.", data: null };
    if (!valuableId)
      return { ok: false, error: "Missing valuable id.", data: null };

    const data = await updateValuableForVaultById(vaultId, valuableId, {
      container_id: containerId,
    });

    return { ok: true, error: null, data };
  } catch (error) {
    return {
      ok: false,
      error: error?.message || "Move valuable failed.",
      data: null,
    };
  }
}

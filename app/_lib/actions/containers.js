/**
 * Container Actions
 * Server actions for container mutations.
 */

"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/app/_lib/auth";
import { requireUserId, toBool } from "@/app/_lib/actions/_utils";
import {
  createContainerInDb,
  deleteContainerDb,
  getContainersForVault,
} from "@/app/_lib/data/containers.data";

/**
 * Create a container in a vault.
 * @param {FormData} formData
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
export async function createContainerAction(formData) {
  try {
    const userId = await requireUserId(auth);
    if (!userId) return { ok: false, error: "You must be logged in." };

    const vaultId = formData.get("vault_id")?.toString();
    const name = formData.get("name")?.toString().trim();
    const is_hidden = await toBool(formData.get("is_hidden"));

    if (!vaultId) return { ok: false, error: "Missing vault_id." };
    if (!name || name.length < 2)
      return { ok: false, error: "Container name is required." };

    const created = await createContainerInDb({
      vault_id: vaultId,
      name,
      is_hidden,
    });

    if (!Array.isArray(created) || created.length === 0) {
      return { ok: false, error: "Failed to create container." };
    }

    revalidatePath(`/account/vaults/${vaultId}/containers`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message || "Failed to create container." };
  }
}

/**
 * Delete a container and revalidate the containers page.
 * @param {string} containerId
 * @param {string} vaultId
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
export async function deleteContainerAction(containerId, vaultId) {
  try {
    const userId = await requireUserId(auth);
    if (!userId) return { ok: false, error: "You must be logged in." };

    if (!containerId || !vaultId) return { ok: false, error: "Missing id." };

    const result = await deleteContainerDb(containerId, vaultId);
    if (!result?.ok) {
      return { ok: false, error: result?.error || "Failed to delete container." };
    }

    revalidatePath(`/account/vaults/${vaultId}/containers`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message || "Failed to delete container." };
  }
}

/**
 * List containers for a vault.
 * @param {{ vaultId: string }} input
 * @returns {Promise<{ ok: boolean, error?: string, data?: any[] }>}
 */
export async function listContainersForVaultAction({ vaultId }) {
  try {
    const userId = await requireUserId(auth);
    if (!userId) return { ok: false, error: "You must be logged in." };
    if (!vaultId) return { ok: false, error: "Missing vaultId." };

    const data = await getContainersForVault(vaultId);
    return { ok: true, data: Array.isArray(data) ? data : [] };
  } catch (err) {
    return {
      ok: false,
      error: err?.message || "Failed to load containers.",
    };
  }
}

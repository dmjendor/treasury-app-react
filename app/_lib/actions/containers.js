/**
 * Container Actions
 * Server actions for container mutations.
 */

"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/app/_lib/auth";
import { requireUserId, toBool } from "@/app/_lib/actions/_utils";
import { deleteContainerDb } from "@/app/_lib/data/containers.data";

/**
 * Create a container in a vault.
 * @param {FormData} formData
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
export async function createContainerAction(formData) {
  try {
    await requireUserId(auth);

    const vaultId = formData.get("vault_id")?.toString();
    const name = formData.get("name")?.toString().trim();
    const is_hidden = await toBool(formData.get("is_hidden"));

    if (!vaultId) return { ok: false, error: "Missing vault_id." };
    if (!name || name.length < 2)
      return { ok: false, error: "Container name is required." };

    const res = await fetch(
      `/api/vaults/${encodeURIComponent(vaultId)}/containers`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ name, is_hidden }),
      }
    );

    if (!res.ok) {
      const raw = await res.text().catch(() => "");
      return { ok: false, error: raw || "Failed to create container." };
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
    await requireUserId(auth);

    if (!containerId || !vaultId) return { ok: false, error: "Missing id." };

    await deleteContainerDb(containerId);

    revalidatePath(`/account/vaults/${vaultId}/containers`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message || "Failed to delete container." };
  }
}

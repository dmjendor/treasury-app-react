/**
 * Vault Actions
 * Server actions for vault mutations.
 */

"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/app/_lib/auth";
import { formDataToObject, requireUserId } from "@/app/_lib/actions/_utils";

/**
 * Create a vault.
 * @param {FormData} formData
 * @returns {Promise<{ ok: boolean, data?: any, error?: string }>}
 */
export async function createVaultAction(formData) {
  try {
    const userId = await requireUserId(auth);
    const data = await formDataToObject(formData);

    // Add owner to object before creating vault.
    data.owner = userId;

    const res = await fetch("/api/vaults", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify(data),
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { ok: false, error: body?.error || "Failed to create vault." };
    }

    // Refresh list page cache
    revalidatePath("/account/vaults");

    // Return created vault so caller can navigate.
    return { ok: true, data: body?.vault || body?.data || body };
  } catch (err) {
    return { ok: false, error: err?.message || "Failed to create vault." };
  }
}

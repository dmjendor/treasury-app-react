"use server";
import { auth } from "@/app/_lib/auth";
import { requireUserId } from "@/app/_lib/actions/_utils";
import { deleteCurrencyForVaultById } from "@/app/_lib/data/currencies.data";
import { revalidatePath } from "next/cache";

/**
 * Delete a currency and revalidate the currencys page.
 * @param {string} currencyId
 * @param {string} vaultId
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
export async function deleteCurrencyAction({ vaultId, currencyId }) {
  try {
    await requireUserId(auth);

    if (!currencyId || !vaultId) return { ok: false, error: "Missing id." };

    await deleteCurrencyForVaultById(vaultId, currencyId);

    revalidatePath(`/account/vaults/${vaultId}/currencies`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message || "Failed to delete currency." };
  }
}

"use server";
import { auth } from "@/app/_lib/auth";
import { requireUserId } from "@/app/_lib/actions/_utils";
import {
  createCurrencyForVault,
  deleteCurrencyForVaultById,
  getCurrenciesForVault,
} from "@/app/_lib/data/currencies.data";
import { normalizeCode } from "@/app/utils/currencyUtils";
import { updateVaultSettingsDb } from "@/app/_lib/data/vaults.data";
import { revalidatePath } from "next/cache";

/**
 * Delete a currency and revalidate the currencys page.
 * @param {string} currencyId
 * @param {string} vaultId
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
export async function deleteCurrencyAction({ vaultId, currencyId }) {
  try {
    const userId = await requireUserId(auth);
    if (!userId) return { ok: false, error: "You must be logged in." };

    if (!currencyId || !vaultId) return { ok: false, error: "Missing id." };

    const deleted = await deleteCurrencyForVaultById(vaultId, currencyId);
    if (!deleted) {
      return { ok: false, error: "Failed to delete currency." };
    }

    revalidatePath(`/account/vaults/${vaultId}/currencies`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message || "Failed to delete currency." };
  }
}

/**
 * Create default currencies for a vault and update base/common if provided.
 * @param {{ vaultId: string, defaults: Array<{name: string, code: string, rate: number, base?: boolean, common?: boolean}> }} input
 * @returns {Promise<{ ok: boolean, error?: string, data?: { created: any[], baseCurrencyId?: string, commonCurrencyId?: string } }>}
 */
export async function addDefaultCurrenciesAction({ vaultId, defaults }) {
  try {
    const userId = await requireUserId(auth);
    if (!userId) return { ok: false, error: "You must be logged in." };

    if (!vaultId) return { ok: false, error: "Missing vault id." };
    if (!Array.isArray(defaults) || defaults.length === 0) {
      return { ok: false, error: "No default currencies provided." };
    }

    const existing = await getCurrenciesForVault(vaultId);
    const existingCodes = new Set(
      (existing || []).map((c) => normalizeCode(c.code)),
    );

    const created = [];
    let baseCurrencyId = null;
    let commonCurrencyId = null;

    for (const def of defaults) {
      const name = String(def?.name || "").trim();
      const code = normalizeCode(def?.code || "");
      const rate = Number(def?.rate);

      if (!name || !code || !Number.isFinite(rate) || rate <= 0) continue;
      if (existingCodes.has(code)) continue;

      const row = await createCurrencyForVault(vaultId, {
        name,
        code,
        rate,
      });

      if (row) {
        created.push(row);
        existingCodes.add(code);
        if (def?.base) baseCurrencyId = row.id;
        if (def?.common) commonCurrencyId = row.id;
      }
    }

    if (baseCurrencyId || commonCurrencyId) {
      await updateVaultSettingsDb({
        vaultId,
        base_currency_id: baseCurrencyId || undefined,
        common_currency_id: commonCurrencyId || undefined,
      });
    }

    revalidatePath(`/account/vaults/${vaultId}/currencies`);
    revalidatePath(`/account/vaults/${vaultId}/settings`);

    return {
      ok: true,
      data: { created, baseCurrencyId, commonCurrencyId },
    };
  } catch (err) {
    return {
      ok: false,
      error: err?.message || "Failed to add default currencies.",
    };
  }
}

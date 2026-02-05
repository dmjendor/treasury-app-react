/**
 * Vault Actions
 * Server actions for vault mutations.
 */

"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/app/_lib/auth";
import { formDataToObject, requireUserId, toBool } from "@/app/_lib/actions/_utils";
import {
  createVault,
  getMemberVaultsForUser,
  updateVaultSettingsDb,
} from "@/app/_lib/data/vaults.data";
import { createOwnerPermission } from "@/app/_lib/data/permissions.data";

/**
 * Create a vault.
 * @param {FormData} formData
 * @returns {Promise<{ ok: boolean, data?: any, error?: string }>}
 */
export async function createVaultAction(formData) {
  try {
    const userId = await requireUserId(auth);
    if (!userId) return { ok: false, error: "You must be logged in." };
    const data = await formDataToObject(formData);

    function toNumber(v, fallback = 0) {
      if (v === "" || v == null) return fallback;
      const n = Number(v);
      return Number.isFinite(n) ? n : fallback;
    }

    if (!data?.name || String(data.name).trim().length < 2) {
      return {
        ok: false,
        error: "Vault name must be at least 2 characters.",
      };
    }

    const payload = {
      name: String(data.name).trim(),
      user_id: userId,
      system_id: data.system_id || null,
      theme_id: data.theme_id || null,
      allow_xfer_in: await toBool(data.allow_xfer_in),
      allow_xfer_out: await toBool(data.allow_xfer_out),
      base_currency_id: data.base_currency_id || null,
      common_currency_id: data.common_currency_id || null,
      merge_split: data.merge_split === "base" ? "base" : "per_currency",
      treasury_split_enabled: await toBool(data.treasury_split_enabled),
      reward_prep_enabled: await toBool(data.reward_prep_enabled),
      vo_buy_markup: toNumber(data.vo_buy_markup, 0),
      vo_sell_markup: toNumber(data.vo_sell_markup, 0),
      item_buy_markup: toNumber(data.item_buy_markup, 0),
      item_sell_markup: toNumber(data.item_sell_markup, 0),
    };

    const created = await createVault(payload);
    if (!created?.id) {
      return { ok: false, error: "Failed to create vault." };
    }

    const permissionRes = await createOwnerPermission({
      vaultId: created.id,
      userId,
    });

    if (!permissionRes?.ok) {
      return {
        ok: false,
        error: permissionRes?.error || "Failed to add owner permission.",
      };
    }

    // Refresh list page cache
    revalidatePath("/account/vaults");

    // Return created vault so caller can navigate.
    return { ok: true, data: created };
  } catch (err) {
    return { ok: false, error: err?.message || "Failed to create vault." };
  }
}

/**
- Update vault settings.
- @param {object} input
- @returns {Promise<object>}
 */
export async function updateVaultSettingsAction(input) {
  try {
    const session = await auth();
    if (!session?.user?.userId)
      return { ok: false, error: "You must be logged in." };

    // Minimal validation
    if (!input?.id) return { ok: false, error: "Missing vault id." };

    const updated = await updateVaultSettingsDb({
      userId: session.user.userId,
      vaultId: input.id,
      ...input,
    });

    if (!updated) {
      return { ok: false, error: "Failed to update vault settings." };
    }

    revalidatePath(`/account/vaults/${input.id}`);
    revalidatePath(`/account/vaults/${input.id}/currencies`);

    return { ok: true, data: updated };
  } catch (e) {
    return {
      ok: false,
      error: e?.message || "Failed to update vault settings.",
    };
  }
}

export async function getMemberVaultNavItemsAction(userId) {
  const { data, error } = await getMemberVaultsForUser(userId);
  if (error) return { data: null, error };

  const items = data.map((v) => ({
    id: v.id,
    name: v.name,
    href: `/public/vaults/${v.id}`,
  }));

  return { data: items, error: null };
}

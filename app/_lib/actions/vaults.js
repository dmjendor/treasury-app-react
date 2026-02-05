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
  deleteVaultCascadeDb,
  getMemberVaultsForUser,
  getVaultNameForOwner,
  transferVaultOwnershipDb,
  assertVaultOwner,
  updateVaultSettingsDb,
} from "@/app/_lib/data/vaults.data";
import {
  createOwnerPermission,
  getVaultMembersWithPermissions,
} from "@/app/_lib/data/permissions.data";

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

/**
 * Fetch transfer candidates for a vault (owner only).
 * @param {{ vaultId: string }} input
 * @returns {Promise<{ ok: boolean, error: string | null, data: any }>}
 */
export async function getVaultTransferCandidatesAction(input) {
  try {
    const session = await auth();
    if (!session?.user?.userId)
      return { ok: false, error: "You must be logged in.", data: null };

    const vaultId = input?.vaultId ? String(input.vaultId) : "";
    if (!vaultId) {
      return { ok: false, error: "Missing vault id.", data: null };
    }

    const isOwner = await assertVaultOwner(vaultId, session.user.userId);
    if (!isOwner) {
      return { ok: false, error: "Vault access denied.", data: null };
    }

    const { data, error } = await getVaultMembersWithPermissions(
      vaultId,
      session.user.userId,
    );

    if (error) {
      return { ok: false, error, data: null };
    }

    const members = (data || []).map((row) => ({
      permissionId: row.id,
      userId: row.user_id,
      name: row?.users?.name || "",
      email: row?.users?.email || "",
    }));

    return { ok: true, error: null, data: members };
  } catch (error) {
    console.error("getVaultTransferCandidatesAction failed", error);
    return {
      ok: false,
      error: "Transfer candidates could not be loaded.",
      data: null,
    };
  }
}

/**
 * Transfer a vault to another user.
 * @param {{ vaultId: string, newOwnerId: string }} input
 * @returns {Promise<{ ok: boolean, error: string | null, data: any }>}
 */
export async function transferVaultOwnershipAction(input) {
  try {
    const session = await auth();
    if (!session?.user?.userId)
      return { ok: false, error: "You must be logged in.", data: null };

    const vaultId = input?.vaultId ? String(input.vaultId) : "";
    const newOwnerId = input?.newOwnerId ? String(input.newOwnerId) : "";

    if (!vaultId || !newOwnerId) {
      return { ok: false, error: "Missing transfer inputs.", data: null };
    }

    const isOwner = await assertVaultOwner(vaultId, session.user.userId);
    if (!isOwner) {
      return { ok: false, error: "Vault access denied.", data: null };
    }

    if (String(newOwnerId) === String(session.user.userId)) {
      return { ok: false, error: "Select a new owner.", data: null };
    }

    const { data: members, error: membersError } =
      await getVaultMembersWithPermissions(vaultId, session.user.userId);

    if (membersError) {
      return { ok: false, error: membersError, data: null };
    }

    const allowed = (members || []).some(
      (row) => String(row.user_id) === String(newOwnerId),
    );

    if (!allowed) {
      return { ok: false, error: "Selected user cannot receive this vault.", data: null };
    }

    const transferRes = await transferVaultOwnershipDb({
      vaultId,
      fromUserId: session.user.userId,
      toUserId: newOwnerId,
    });

    if (!transferRes.ok) {
      return {
        ok: false,
        error: transferRes.error || "Vault could not be transferred.",
        data: null,
      };
    }

    revalidatePath("/account/vaults");

    return { ok: true, error: null, data: { id: vaultId } };
  } catch (error) {
    console.error("transferVaultOwnershipAction failed", error);
    return { ok: false, error: "Vault could not be transferred.", data: null };
  }
}

/**
 * Delete a vault and all related data.
 * @param {{ vaultId: string, confirmName: string }} input
 * @returns {Promise<{ ok: boolean, error: string | null, data: any }>}
 */
export async function deleteVaultAction(input) {
  try {
    const session = await auth();
    if (!session?.user?.userId)
      return { ok: false, error: "You must be logged in.", data: null };

    const vaultId = input?.vaultId ? String(input.vaultId) : "";
    const confirmName = input?.confirmName ? String(input.confirmName) : "";

    if (!vaultId) {
      return { ok: false, error: "Missing vault id.", data: null };
    }

    const vaultName = await getVaultNameForOwner(
      vaultId,
      session.user.userId,
    );
    if (!vaultName) {
      return { ok: false, error: "Vault not found.", data: null };
    }

    if (vaultName.trim() !== confirmName.trim()) {
      return {
        ok: false,
        error: "Vault name does not match.",
        data: null,
      };
    }

    const deleteRes = await deleteVaultCascadeDb(vaultId);
    if (!deleteRes.ok) {
      return {
        ok: false,
        error: deleteRes.error || "Vault could not be deleted.",
        data: null,
      };
    }

    revalidatePath("/account/vaults");

    return { ok: true, error: null, data: { id: vaultId } };
  } catch (error) {
    console.error("deleteVaultAction failed", error);
    return { ok: false, error: "Vault could not be deleted.", data: null };
  }
}

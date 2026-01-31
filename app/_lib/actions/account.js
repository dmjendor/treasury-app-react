/**
 * Account Actions
 * Server actions for account preferences and cancellations.
 */

"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/app/_lib/auth";
import { getUserVaults } from "@/app/_lib/data/vaults.data";
import { upsertVaultMemberPreference } from "@/app/_lib/data/vaultMemberPreferences.data";
import { deletePermissionsForUser } from "@/app/_lib/data/permissions.data";
import { deleteUserById, updateUserTheme } from "@/app/_lib/data/users.data";
import { deleteVaultMemberPreferencesForUser } from "@/app/_lib/data/vaultMemberPreferences.data";

/**
 * - Upsert a vault member preference for the current user.
 * @param {{ vaultId: string, displayName: string|null, themeKey: string|null }} input
 * @returns {Promise<{ ok: boolean, error: string|null, data: any }>}
 */
export async function upsertVaultMemberPreferenceAction({
  vaultId,
  displayName,
  themeKey,
}) {
  try {
    const session = await auth();
    if (!session?.user?.userId)
      return { ok: false, error: "You must be logged in.", data: null };
    if (!vaultId)
      return { ok: false, error: "Vault id is required.", data: null };

    const data = await upsertVaultMemberPreference({
      userId: session.user.userId,
      vaultId,
      displayName,
      themeKey,
    });

    if (!data) {
      return { ok: false, error: "Could not save preferences.", data: null };
    }

    revalidatePath("/account");
    revalidatePath(`/account/vaults/${vaultId}`);
    revalidatePath(`/public/vaults/${vaultId}`);

    return { ok: true, error: null, data };
  } catch (e) {
    return {
      ok: false,
      error: e?.message || "Could not save preferences.",
      data: null,
    };
  }
}

/**
 * - Delete the current user's account data.
 * @returns {Promise<{ ok: boolean, error: string|null, data: any }>}
 */
export async function deleteAccountAction() {
  try {
    const session = await auth();
    if (!session?.user?.userId)
      return { ok: false, error: "You must be logged in.", data: null };

    const ownedVaults = await getUserVaults();
    if (Array.isArray(ownedVaults) && ownedVaults.length > 0) {
      return {
        ok: false,
        error: "Delete or transfer your owned vaults before cancelling.",
        data: null,
      };
    }

    const userId = session.user.userId;

    const prefsDeleted = await deleteVaultMemberPreferencesForUser({ userId });
    const permsDeleted = await deletePermissionsForUser({ userId });
    const userDeleted = await deleteUserById({ userId });

    if (userDeleted === false) {
      return { ok: false, error: "Could not cancel account.", data: null };
    }

    revalidatePath("/account");
    revalidatePath("/account/vaults");

    return { ok: true, error: null, data: { userId } };
  } catch (e) {
    return {
      ok: false,
      error: e?.message || "Could not cancel account.",
      data: null,
    };
  }
}

/**
 * - Update the current user's profile theme.
 * @param {{ themeId: string|null }} input
 * @returns {Promise<{ ok: boolean, error: string|null, data: any }>}
 */
export async function updateProfileThemeAction({ themeId }) {
  try {
    const session = await auth();
    if (!session?.user?.userId)
      return { ok: false, error: "You must be logged in.", data: null };

    const data = await updateUserTheme({
      userId: session.user.userId,
      themeId: themeId || null,
    });

    if (!data) {
      return { ok: false, error: "Could not update profile theme.", data: null };
    }

    revalidatePath("/account");

    return { ok: true, error: null, data };
  } catch (e) {
    return {
      ok: false,
      error: e?.message || "Could not update profile theme.",
      data: null,
    };
  }
}

export async function getUserVaultOverrides(vaultId) {
  try {
    const session = await auth();
    if (!session?.user?.userId)
      return { ok: false, error: "You must be logged in.", data: null };
    if (!vaultId)
      return { ok: false, error: "Vault id is required.", data: null };

    const data = await getVaultMemberPreferenceForUserAndVault(
      session.user.userId,
      vaultId,
    );

    return { ok: true, error: null, data };
  } catch (error) {
    return {
      ok: false,
      error: e?.message || "Could not get user vault preferences.",
      data: null,
    };
  }
}

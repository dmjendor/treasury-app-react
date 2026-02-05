"use server";

import { getSupabase } from "@/app/_lib/supabase";
import { createInviteToken, verifyInviteToken } from "@/app/_lib/invite-token";
import { sendInviteEmail } from "@/app/_lib/email/sendInviteEmail";
import {
  upsertPermissionInvite,
  getPermissionInvite,
  acceptPendingPermissionInvite,
  getVaultNameForInvite,
  getAllUsersForVault,
  getPermissionByVaultAndUserId,
} from "@/app/_lib/data/permissions.data";
import { auth } from "@/app/_lib/auth";
import { getVaultById } from "@/app/_lib/data/vaults.data"; // or wherever

export async function createPermissionAction(payload) {
  try {
    await createTreasureDb(payload);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e?.message || "Create treasure failed." };
  }
}

export async function getPermissionsForVaultAction({ vaultId }) {
  try {
    if (!vaultId) return { ok: false, error: "Missing vaultId", data: null };

    const rows = await getAllUsersForVault(vaultId);
    return { ok: true, error: null, data: Array.isArray(rows) ? rows : [] };
  } catch (err) {
    return {
      ok: false,
      error: err?.message || "Failed to load default treasures",
      data: null,
    };
  }
}

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

export async function inviteMemberAction({ vaultId, email }) {
  try {
    if (!vaultId) return { ok: false, error: "Vault is required.", data: null };

    const cleanEmail = normalizeEmail(email);
    if (!cleanEmail)
      return { ok: false, error: "Email is required.", data: null };

    const session = await auth();
    const userId = session?.user?.userId;
    if (!userId) return { ok: false, error: "Not signed in.", data: null };

    const upsertRes = await upsertPermissionInvite({
      vaultId,
      email: cleanEmail,
      createdBy: userId,
    });

    if (!upsertRes.ok) return upsertRes;

    const permissionId = upsertRes.data.id;

    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;

    const token = createInviteToken({
      vault_id: vaultId,
      email: cleanEmail,
      permission_id: permissionId,
      exp,
    });
    if (!token) {
      return {
        ok: false,
        error: "Invite token could not be created.",
        data: null,
      };
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://www.partytreasury.com";
    const inviteUrl = `${baseUrl}/invite?token=${encodeURIComponent(token)}`;

    const vaultNameRes = await getVaultNameForInvite({ vaultId });
    const vaultName = vaultNameRes.ok ? vaultNameRes.data.name : "";

    const emailResult = await sendInviteEmail({
      toEmail: cleanEmail,
      inviteUrl,
      vaultName,
    });
    if (!emailResult?.ok) {
      return {
        ok: false,
        error: emailResult?.error || "Failed to send invite.",
        data: null,
      };
    }

    return { ok: true, error: "", data: { inviteUrl } };
  } catch (e) {
    return {
      ok: false,
      error: e?.message || "Failed to send invite.",
      data: null,
    };
  }
}

export async function acceptInviteAction({ token }) {
  try {
    const verified = verifyInviteToken(token);
    if (!verified.ok) return { ok: false, error: verified.error, data: null };

    const payload = verified.data;
    const vaultId = String(payload.vault_id);
    const invitedEmail = normalizeEmail(payload.email);
    const permissionId = payload.permission_id
      ? String(payload.permission_id)
      : "";

    const session = await auth();
    const userId = session?.user?.userId;

    if (!userId) return { ok: false, error: "Not signed in.", data: null };

    const myEmail = normalizeEmail(session?.user?.email);
    if (!myEmail || myEmail !== invitedEmail) {
      return {
        ok: false,
        error: "This invite is for a different email.",
        data: null,
      };
    }

    const acceptRes = await acceptPendingPermissionInvite({
      permissionId,
      vaultId,
      email: invitedEmail,
      userId: userId,
    });

    if (acceptRes.ok) {
      return { ok: true, error: "", data: { vault_id: vaultId } };
    }

    if (permissionId) {
      const inviteRes = await getPermissionInvite({ permissionId });
      if (inviteRes.ok && inviteRes.data?.user_id) {
        return { ok: true, error: "", data: { vault_id: vaultId } };
      }
    }

    return acceptRes;
  } catch (e) {
    return {
      ok: false,
      error: e?.message || "Failed to accept invite.",
      data: null,
    };
  }
}

export async function removePermissionAction({ permissionId, vaultId }) {
  return null;
}

function pickAllowedFields(patch) {
  return {
    transfer_coin_in: patch.transfer_coin_in,
    transfer_coin_out: patch.transfer_coin_out,
    transfer_treasures_in: patch.transfer_treasures_in,
    transfer_treasures_out: patch.transfer_treasures_out,
    transfer_valuables_in: patch.transfer_valuables_in,
    transfer_valuables_out: patch.transfer_valuables_out,
    sell_treasures: patch.sell_treasures,
    sell_valuables: patch.sell_valuables,
  };
}

export async function updateMemberPermissions({
  vaultId,
  permissionId,
  patch,
}) {
  const session = await auth();
  const userId = session?.user?.userId;
  if (!userId) return { ok: false, error: "Not signed in.", data: null };

  // owner only
  const vault = await getVaultById(vaultId);

  if (!vault) return { ok: false, error: "Vault not found.", data: null };
  if (String(vault.user_id) !== String(userId)) {
    return {
      ok: false,
      error: "Only the vault owner can edit permissions.",
      data: null,
    };
  }

  const update = pickAllowedFields(patch);

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("permissions")
    .update(update)
    .eq("id", permissionId)
    .eq("vault_id", vaultId)
    .select("*")
    .single();

  console.log(error);
  if (error)
    return { ok: false, error: "Could not update permissions.", data: null };
  return { ok: true, error: null, data };
}

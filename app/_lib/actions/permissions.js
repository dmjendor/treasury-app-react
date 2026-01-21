"use server";

import { getSupabase } from "@/app/_lib/supabase";
import { createInviteToken, verifyInviteToken } from "@/app/_lib/invite-token";
import { sendInviteEmail } from "@/app/_lib/email/sendInviteEmail";
import {
  upsertPermissionInvite,
  getPermissionInvite,
  acceptPermissionInvite,
  getVaultNameForInvite,
  getAllUsersForVault,
} from "@/app/_lib/data/permissions.data";
import { auth } from "@/app/_lib/auth";

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
    console.log("gpfva", vaultId);
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

    const supabase = getSupabaseServer();
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes?.user;

    if (!user) return { ok: false, error: "Not signed in.", data: null };

    const upsertRes = await upsertPermissionInvite({
      vaultId,
      email: cleanEmail,
      createdBy: user.id,
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

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://www.partytreasury.com";
    const inviteUrl = `${baseUrl}/invite?token=${encodeURIComponent(token)}`;

    const vaultNameRes = await getVaultNameForInvite({ vaultId });
    const vaultName = vaultNameRes.ok ? vaultNameRes.data.name : "";

    await sendInviteEmail({ toEmail: cleanEmail, inviteUrl, vaultName });

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
    const user = session?.user?.user_id;

    if (!user) return { ok: false, error: "Not signed in.", data: null };

    const myEmail = normalizeEmail(session?.user?.email);
    if (!myEmail || myEmail !== invitedEmail) {
      return {
        ok: false,
        error: "This invite is for a different email.",
        data: null,
      };
    }

    const inviteRes = await getPermissionInvite({
      permissionId,
      vaultId,
      email: invitedEmail,
    });

    if (!inviteRes.ok) return inviteRes;

    const row = inviteRes.data;

    if (!row?.can_view) {
      return { ok: false, error: "Invite is no longer valid.", data: null };
    }

    if (row.user_id) {
      return { ok: true, error: "", data: { vault_id: vaultId } };
    }

    const acceptRes = await acceptPermissionInvite({
      permissionId: row.id,
      userId: user.id,
    });

    if (!acceptRes.ok) return acceptRes;

    return { ok: true, error: "", data: { vault_id: vaultId } };
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

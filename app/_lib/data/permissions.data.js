/**
 * Data: Permissions
 * Server only.
 */
import "server-only";
import { getSupabase } from "@/app/_lib/supabase";
import { getVaultById } from "@/app/_lib/data/vaults.data";

/**
 *
 * - Fetch all permission rows for a vault.
 * - @param {string} vaultId
 * - @returns {Promise<Array<object>>}
 */
export async function getAllUsersForVault(vaultId) {
  if (!vaultId) {
    return [];
  }
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("permissions")
    .select("*")
    .eq("vault_id", vaultId)
    .order("accepted_at", { ascending: false, nullsFirst: true })
    .order("invited_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

/**
 *
 * - Upsert a permission invite for a vault.
 * - @param {{ vaultId: string, email: string, createdBy: string }} payload
 * - @returns {Promise<{ ok: boolean, error: string, data: any }>}
 */
export async function upsertPermissionInvite({ vaultId, email, createdBy }) {
  if (!vaultId || !email || !createdBy) {
    return {
      ok: false,
      error: "Vault Id, Email and createdBy are required.",
      data: null,
    };
  }
  const supabase = await getSupabase();

  const cleanEmail = normalizeEmail(email);
  const invitedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("permissions")
    .upsert(
      {
        vault_id: vaultId,
        email: cleanEmail,
        user_id: null,
        can_view: true,
        created_by: createdBy,
        invited_at: invitedAt,
        accepted_at: null,
      },
      { onConflict: "vault_id,email" },
    )
    .select("id, vault_id, email, invited_at, accepted_at, can_view, user_id")
    .single();

  console.log(error);
  if (error) return { ok: false, error: error.message, data: null };

  return { ok: true, error: "", data };
}

/**
 *
 * - Fetch a permission invite by id or by vault and email.
 * - @param {{ permissionId?: string, vaultId?: string, email?: string }} params
 * - @returns {Promise<{ ok: boolean, error: string, data: any }>}
 */
export async function getPermissionInvite({ permissionId, vaultId, email }) {
  if (!permissionId && (!vaultId || !email)) {
    return {
      ok: false,
      error: "permissionId or vaultId and email are required.",
      data: null,
    };
  }
  const supabase = getSupabase();
  const cleanEmail = normalizeEmail(email);

  let q = supabase
    .from("permissions")
    .select("id, vault_id, email, user_id, accepted_at, invited_at, can_view")
    .single();

  if (permissionId) {
    q = q.eq("id", permissionId);
  } else {
    q = q.eq("vault_id", vaultId).eq("email", cleanEmail);
  }

  const { data, error } = await q;

  if (error) return { ok: false, error: error.message, data: null };
  return { ok: true, error: "", data };
}

/**
 *
 * - Accept a permission invite for a user.
 * - @param {{ permissionId: string, userId: string }} params
 * - @returns {Promise<{ ok: boolean, error: string, data: any }>}
 */
export async function acceptPermissionInvite({ permissionId, userId }) {
  if (!permissionId || !userId) {
    return {
      ok: false,
      error: "permissionId and userId are required.",
      data: null,
    };
  }
  const supabase = getSupabase();
  const acceptedAt = new Date().toISOString();

  const { error } = await supabase
    .from("permissions")
    .update({
      user_id: userId,
      email: null,
      accepted_at: acceptedAt,
    })
    .eq("id", permissionId);

  if (error) return { ok: false, error: error.message, data: null };

  return { ok: true, error: "", data: { accepted_at: acceptedAt } };
}

/**
 *
 * - Fetch a vault name for an invite.
 * - @param {{ vaultId: string }} params
 * - @returns {Promise<{ ok: boolean, error: string, data: { name: string } }>}
 */
export async function getVaultNameForInvite({ vaultId }) {
  if (!vaultId) {
    return { ok: false, error: "Vault is required.", data: null };
  }
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("vaults")
    .select("name")
    .eq("id", vaultId)
    .single();

  if (error) return { ok: false, error: error.message, data: null };
  return { ok: true, error: "", data: { name: data?.name || "" } };
}

/**
 *
 * - Fetch accepted members for a vault.
 * - @param {string} vaultId
 * - @returns {Promise<{ data: Array<object>, error: any }>}
 */
export async function getMembersByVaultId(vaultId) {
  if (!vaultId) {
    return { data: [], error: "vaultId is required." };
  }
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("permissions")
    .select("*")
    .eq("vault_id", vaultId)
    .eq("can_view", true)
    .not("user_id", "is", null)
    .order("accepted_at", { ascending: false });

  return { data: data || [], error };
}

/**
 *
 * - Fetch pending invites for a vault.
 * - @param {string} vaultId
 * - @returns {Promise<{ data: Array<object>, error: any }>}
 */
export async function getInvitesByVaultId(vaultId) {
  if (!vaultId) {
    return { data: [], error: "vaultId is required." };
  }
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("permissions")
    .select("*")
    .eq("vault_id", vaultId)
    .not("email", "is", null)
    .is("user_id", null)
    .order("invited_at", { ascending: false });

  return { data: data || [], error };
}

// 🧩 Core reads

/**
 *
 * - Fetch permissions for a user in a vault.
 * - @param {string} vaultId
 * - @param {string} userId
 * - @returns {Promise<{ data: Array<object>, error: any }>}
 */
export async function getPermissionByVaultAndUserId(vaultId, userId) {
  if (!vaultId || !userId) {
    return { data: [], error: "vaultId and userId are required." };
  }
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("permissions")
    .select("*")
    .eq("vault_id", vaultId)
    .eq("user_id", userId);

  return { data: data || [], error };
}

/**
 *
 * - Fetch invites for a vault.
 * - @param {string} vaultId
 * - @param {string} email
 * - @returns {Promise<{ data: Array<object>, error: any }>}
 */
export async function getInviteByVaultAndEmail(vaultId, email) {
  if (!vaultId || !email) {
    return { data: [], error: "vaultId and email are required." };
  }
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("permissions")
    .select("*")
    .eq("vault_id", vaultId)
    .not("email", "is", null)
    .is("user_id", null)
    .order("invited_at", { ascending: false });

  return { data: data || [], error };
}

// 🧩 Core writes
/**
 *
 * - Insert a permission invite for a vault.
 * - @param {{ vaultId: string, email: string, createdBy: string }} params
 * - @returns {Promise<{ ok: boolean, error: string, data: any }>}
 */
export async function insertInvite({ vaultId, email, createdBy }) {
  if (!vaultId || !email || !createdBy) {
    return {
      ok: false,
      error: "vaultId, email, and createdBy are required.",
      data: null,
    };
  }
  return { ok: false, error: "Not implemented.", data: null };
}

/**
 *
 * - Delete a permission invite for a vault.
 * - @param {{ vaultId: string, email: string }} params
 * - @returns {Promise<{ ok: boolean, error: string, data: any }>}
 */
export async function deleteInvite({ vaultId, email }) {
  if (!vaultId || !email) {
    return { ok: false, error: "vaultId and email are required.", data: null };
  }
  return { ok: false, error: "Not implemented.", data: null };
}

/**
 *
 * - Delete a vault member by user id.
 * - @param {{ vaultId: string, userId: string }} params
 * - @returns {Promise<{ ok: boolean, error: string, data: any }>}
 */
export async function deleteMember({ vaultId, userId }) {
  if (!vaultId || !userId) {
    return { ok: false, error: "vaultId and userId are required.", data: null };
  }
  return { ok: false, error: "Not implemented.", data: null };
}

/**
 *
 * - Accept a vault invite for a user.
 * - @param {{ vaultId: string, email: string, userId: string }} params
 * - @returns {Promise<{ ok: boolean, error: string, data: any }>}
 */
export async function acceptInvite({ vaultId, email, userId }) {
  if (!vaultId || !email || !userId) {
    return {
      ok: false,
      error: "vaultId, email, and userId are required.",
      data: null,
    };
  }
  return { ok: false, error: "Not implemented.", data: null };
}

/**
 *
 * - Upsert member permissions in a vault.
 * - @param {{ vaultId: string, userId: string, patch: object }} params
 * - @returns {Promise<{ ok: boolean, error: string, data: any }>}
 */
export async function upsertMemberPermissions({ vaultId, userId, patch }) {
  if (!vaultId || !userId || !patch) {
    return {
      ok: false,
      error: "vaultId, userId, and patch are required.",
      data: null,
    };
  }
  return { ok: false, error: "Not implemented.", data: null };
}

/**
 *
 * - Fetch vault members with permissions.
 * - @param {string} vaultId
 * - @param {string} userId
 * - @returns {Promise<{ data: Array<object>, error: any }>}
 */
export async function getVaultMembersWithPermissions(vaultId, userId) {
  if (!vaultId || !userId) {
    return { data: [], error: "vaultId and userId are required." };
  }
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("permissions")
    .select(
      `
      id,
      vault_id,
      user_id,
      can_view,
      transfer_coin_in,
      transfer_coin_out,
      transfer_treasures_in,
      transfer_treasures_out,
      transfer_valuables_in,
      transfer_valuables_out,
      accepted_at,
      users:user_id (
        id,
        name,
        email        
      )
    `,
    )
    .eq("vault_id", vaultId)
    .neq("user_id", userId)
    .not("user_id", "is", null)
    .order("accepted_at", { ascending: false });

  console.log(data, error);
  return { data: data || [], error };
}

/**
 * Data: Permissions
 * Server only.
 */
import "server-only";
import { getSupabase } from "@/app/_lib/supabase";
import { getVaultById } from "@/app/_lib/data/vaults.data";

/**
 * Fetch valuables for a vault.
 * @param {string} vaultId
 * @returns {Promise<Array<object>>}
 */
export async function getAllUsersForVault(vaultId) {
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

export async function upsertPermissionInvite({ vaultId, email, createdBy }) {
  const supabase = getSupabaseServer();

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

  if (error) return { ok: false, error: error.message, data: null };

  return { ok: true, error: "", data };
}

export async function getPermissionInvite({ permissionId, vaultId, email }) {
  const supabase = getSupabaseServer();
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

export async function acceptPermissionInvite({ permissionId, userId }) {
  const supabase = getSupabaseServer();
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

export async function getVaultNameForInvite({ vaultId }) {
  const supabase = getSupabaseServer();

  const { data, error } = await supabase
    .from("vaults")
    .select("name")
    .eq("id", vaultId)
    .single();

  if (error) return { ok: false, error: error.message, data: null };
  return { ok: true, error: "", data: { name: data?.name || "" } };
}

export async function getMembersByVaultId(vaultId) {
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

export async function getInvitesByVaultId(vaultId) {
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

export async function getPermissionByVaultAndUserId(vaultId, userId) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("permissions")
    .select("*")
    .eq("vault_id", vaultId)
    .eq("user_id", userId);

  return { data: data || [], error };
}

export async function getInviteByVaultAndEmail(vaultId, email) {
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
export async function insertInvite({ vaultId, email, createdBy }) {}
export async function deleteInvite({ vaultId, email }) {}
export async function deleteMember({ vaultId, userId }) {}
export async function acceptInvite({ vaultId, email, userId }) {}
export async function upsertMemberPermissions({ vaultId, userId, patch }) {}

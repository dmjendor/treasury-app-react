/**
 * Data: Permissions
 * Server only.
 */
import "server-only";
import { getSupabase } from "@/app/_lib/supabase";
import { getUserVaults } from "@/app/_lib/data/vaults.data";
import { getVaultById } from "@/app/_lib/data/vaults.data";
import { tryCreateVaultLog } from "@/app/_lib/data/logs.data";

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
    .select(
      `
        id,
        vault_id,
        user_id,
        email,
        can_view,
        invited_at,
        accepted_at,
        users:user_id (
          id,
          name,
          email
        )
      `,
    )
    .eq("vault_id", vaultId)
    .order("accepted_at", { ascending: false, nullsFirst: true })
    .order("invited_at", { ascending: false });

  if (error) {
    console.error("getAllUsersForVault failed", error);
    return [];
  }

  const rows = data ?? [];
  const userIds = rows
    .map((row) => row?.user_id)
    .filter((id) => id != null);

  if (userIds.length === 0) return rows;

  const { data: preferences, error: prefError } = await supabase
    .from("vault_member_preferences")
    .select("user_id, display_name")
    .eq("vault_id", vaultId)
    .in("user_id", userIds);

  if (prefError) {
    console.error("getAllUsersForVault prefs failed", prefError);
    return rows;
  }

  const prefMap = new Map(
    (preferences || []).map((row) => [String(row.user_id), row.display_name]),
  );

  return rows.map((row) => ({
    ...row,
    member_display_name: row?.user_id
      ? prefMap.get(String(row.user_id)) || null
      : null,
  }));
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

  if (error) {
    console.error("upsertPermissionInvite failed", error);
    return { ok: false, error: "Could not create invite.", data: null };
  }

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

  if (error) {
    console.error("getPermissionInvite failed", error);
    return { ok: false, error: "Invite could not be loaded.", data: null };
  }
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

  if (error) {
    console.error("acceptPermissionInvite failed", error);
    return { ok: false, error: "Invite could not be accepted.", data: null };
  }
  await tryCreateVaultLog({
    vaultId,
    source: "permissions",
    action: "invite_accepted",
    entityType: "permissions",
    entityId: permissionId,
  });

  return { ok: true, error: "", data: { accepted_at: acceptedAt } };
}

/**
- Accept a pending permission invite for a user.
- @param {{ permissionId?: string, vaultId: string, email: string, userId: string }} params
- @returns {Promise<{ ok: boolean, error: string, data: any }>}
  */
export async function acceptPendingPermissionInvite({
  permissionId,
  vaultId,
  email,
  userId,
}) {
  if (!vaultId || !email || !userId) {
    return {
      ok: false,
      error: "vaultId, email, and userId are required.",
      data: null,
    };
  }

  const supabase = getSupabase();
  const acceptedAt = new Date().toISOString();
  const cleanEmail = normalizeEmail(email);

  let q = supabase
    .from("permissions")
    .update({
      user_id: userId,
      email: null,
      accepted_at: acceptedAt,
    })
    .eq("vault_id", vaultId)
    .eq("can_view", true)
    .is("user_id", null);

  if (permissionId) {
    q = q.eq("id", permissionId);
  } else {
    q = q.eq("email", cleanEmail);
  }

  const { data, error } = await q.select(
    "id, vault_id, user_id, accepted_at, can_view",
  );

  if (error) {
    console.error("acceptPendingPermissionInvite failed", error);
    return { ok: false, error: "Invite could not be accepted.", data: null };
  }
  if (!data || data.length === 0) {
    return { ok: false, error: "Invite is no longer valid.", data: null };
  }

  return { ok: true, error: "", data: data[0] };
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

  if (error) {
    console.error("getVaultNameForInvite failed", error);
    return { ok: false, error: "Vault could not be loaded.", data: null };
  }
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

  if (error) {
    console.error("getMembersByVaultId failed", error);
    return { data: [], error: "Members could not be loaded." };
  }
  return { data: data || [], error: null };
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

  if (error) {
    console.error("getInvitesByVaultId failed", error);
    return { data: [], error: "Invites could not be loaded." };
  }
  return { data: data || [], error: null };
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

  if (error) {
    console.error("getPermissionByVaultAndUserId failed", error);
    return { data: [], error: "Permissions could not be loaded." };
  }
  return { data: data || [], error: null };
}

/**
 * - Fetch transfer permissions with vault info for a user.
 * @param {string} userId
 * @returns {Promise<{ data: Array<object>, error: any }>}
 */
export async function getTransferVaultsForUser(userId) {
  if (!userId) {
    return { data: [], error: "userId is required." };
  }
  const supabase = await getSupabase();
  const { data: permissionRows, error } = await supabase
    .from("permissions")
    .select(
      `
      vault_id,
      can_view,
      transfer_treasures_in,
      transfer_treasures_out,
      transfer_valuables_in,
      transfer_valuables_out,
      sell_treasures,
      sell_valuables,
      vaults:vault_id (
        id,
        name,
        user_id,
        allow_xfer_in,
        allow_xfer_out
      )
    `,
    )
    .eq("user_id", userId)
    .eq("can_view", true);

  if (error) {
    console.error("getTransferVaultsForUser failed", error);
    return { data: [], error: "Transfer vaults could not be loaded." };
  }

  const owned = await getUserVaults();
  const ownedRows = (owned || []).map((vault) => ({
    vault_id: vault.id,
    can_view: true,
    transfer_treasures_in: true,
    transfer_treasures_out: true,
    transfer_valuables_in: true,
    transfer_valuables_out: true,
    sell_treasures: true,
    sell_valuables: true,
    vaults: {
      id: vault.id,
      name: vault.name,
      user_id: vault.user_id,
      allow_xfer_in: vault.allow_xfer_in,
      allow_xfer_out: vault.allow_xfer_out,
    },
  }));

  const merged = new Map();
  for (const row of permissionRows || []) {
    if (!row?.vaults) continue;
    merged.set(String(row.vaults.id), row);
  }
  for (const row of ownedRows) {
    merged.set(String(row.vaults.id), row);
  }

  return { data: [...merged.values()], error: null };
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

  if (error) {
    console.error("getInviteByVaultAndEmail failed", error);
    return { data: [], error: "Invite could not be loaded." };
  }
  return { data: data || [], error: null };
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
      sell_treasures,
      sell_valuables,
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

  if (error) {
    console.error("getVaultMembersWithPermissions failed", error);
    return { data: [], error: "Permissions could not be loaded." };
  }
  return { data: data || [], error: null };
}

/**
 * - Create an owner permissions row for a vault.
 * @param {{ vaultId: string, userId: string }} params
 * @returns {Promise<{ ok: boolean, error: string, data: any }>}
 */
export async function createOwnerPermission({ vaultId, userId }) {
  if (!vaultId || !userId) {
    return {
      ok: false,
      error: "vaultId and userId are required.",
      data: null,
    };
  }

  const supabase = await getSupabase();
  const acceptedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("permissions")
    .insert({
      vault_id: vaultId,
      user_id: userId,
      email: null,
      can_view: true,
      transfer_coin_in: true,
      transfer_coin_out: true,
      transfer_treasures_in: true,
      transfer_treasures_out: true,
      transfer_valuables_in: true,
      transfer_valuables_out: true,
      sell_treasures: true,
      sell_valuables: true,
      created_by: userId,
      invited_at: acceptedAt,
      accepted_at: acceptedAt,
    })
    .select("*")
    .single();

  if (error) {
    console.error("createOwnerPermission failed", error);
    return { ok: false, error: "Owner permissions could not be created.", data: null };
  }
  return { ok: true, error: "", data };
}

/**
 * - Promote a member to owner permissions.
 * @param {{ vaultId: string, userId: string, actorUserId: string }} params
 * @returns {Promise<{ ok: boolean, error: string, data: any }>}
 */
export async function promoteToOwnerPermission({
  vaultId,
  userId,
  actorUserId,
}) {
  if (!vaultId || !userId || !actorUserId) {
    return {
      ok: false,
      error: "vaultId, userId, and actorUserId are required.",
      data: null,
    };
  }

  const supabase = await getSupabase();
  const acceptedAt = new Date().toISOString();
  const ownerPayload = {
    vault_id: vaultId,
    user_id: userId,
    email: null,
    can_view: true,
    transfer_coin_in: true,
    transfer_coin_out: true,
    transfer_treasures_in: true,
    transfer_treasures_out: true,
    transfer_valuables_in: true,
    transfer_valuables_out: true,
    sell_treasures: true,
    sell_valuables: true,
    created_by: actorUserId,
    invited_at: acceptedAt,
    accepted_at: acceptedAt,
  };

  const { data: existing, error: existingError } = await supabase
    .from("permissions")
    .select("id, invited_at, accepted_at")
    .eq("vault_id", vaultId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingError) {
    console.error("promoteToOwnerPermission lookup failed", existingError);
    return { ok: false, error: "Owner permissions could not be updated.", data: null };
  }

  if (existing?.id) {
    const updates = {
      ...ownerPayload,
      invited_at: existing.invited_at || acceptedAt,
      accepted_at: existing.accepted_at || acceptedAt,
    };
    const { data, error } = await supabase
      .from("permissions")
      .update(updates)
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error) {
      console.error("promoteToOwnerPermission update failed", error);
      return {
        ok: false,
        error: "Owner permissions could not be updated.",
        data: null,
      };
    }

    return { ok: true, error: "", data };
  }

  const { data, error } = await supabase
    .from("permissions")
    .insert(ownerPayload)
    .select("*")
    .single();

  if (error) {
    console.error("promoteToOwnerPermission insert failed", error);
    return { ok: false, error: "Owner permissions could not be created.", data: null };
  }

  return { ok: true, error: "", data };
}

/**
 * - Delete permissions rows for a user.
 * @param {{ userId: string }} input
 * @returns {Promise<number>}
 */
export async function deletePermissionsForUser({ userId }) {
  if (!userId) {
    console.error("deletePermissionsForUser failed: missing user id");
    return 0;
  }
  const supabase = await getSupabase();

  const { count, error } = await supabase
    .from("permissions")
    .delete()
    .eq("user_id", userId)
    .select("id", { count: "exact" });

  if (error) {
    console.error("deletePermissionsForUser failed", error);
    return 0;
  }
  return Number(count || 0);
}

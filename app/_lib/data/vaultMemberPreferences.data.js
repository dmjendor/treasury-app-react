/**
 * Data: Vault member preferences
 * Server only.
 */
import "server-only";
import { auth } from "@/app/_lib/auth";
import { getSupabase } from "@/app/_lib/supabase";

/**
 * - Fetch vault member preferences for a user.
 * @param {string} userId
 * @returns {Promise<Array<{id:string,vault_id:string,user_id:string,display_name:string|null,theme_key:string|null}>>}
 */
export async function getVaultMemberPreferencesForUser(userId) {
  if (!userId) {
    console.error("getVaultMemberPreferencesForUser failed: missing user id");
    return [];
  }
  const session = await auth();
  if (!session) {
    console.error("getVaultMemberPreferencesForUser failed: no session");
    return [];
  }

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("vault_member_preferences")
    .select("id,vault_id,user_id,display_name,theme_key")
    .eq("user_id", userId);

  if (error) {
    console.error("getVaultMemberPreferencesForUser failed", error);
    return [];
  }
  return data || [];
}

/**
 * - Upsert vault member preferences for a user and vault.
 * @param {{ userId:string, vaultId:string, displayName:string|null, themeKey:string|null }} input
 * @returns {Promise<{id:string,vault_id:string,user_id:string,display_name:string|null,theme_key:string|null}>}
 */
export async function upsertVaultMemberPreference({
  userId,
  vaultId,
  displayName,
  themeKey,
}) {
  if (!userId || !vaultId) {
    console.error("upsertVaultMemberPreference failed: missing ids");
    return null;
  }
  const session = await auth();
  if (!session) {
    console.error("upsertVaultMemberPreference failed: no session");
    return null;
  }
  if (String(session.user.userId) !== String(userId)) {
    console.error("upsertVaultMemberPreference failed: access denied");
    return null;
  }

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("vault_member_preferences")
    .upsert(
      {
        user_id: userId,
        vault_id: vaultId,
        display_name: displayName || null,
        theme_key: themeKey || null,
      },
      { onConflict: "user_id,vault_id" },
    )
    .select("id,vault_id,user_id,display_name,theme_key")
    .single();

  if (error) {
    console.error("upsertVaultMemberPreference failed", error);
    return null;
  }
  return data ?? null;
}

/**
 * - Fetch a vault member preference for a user and vault.
 * @param {{ userId:string, vaultId:string }} input
 * @returns {Promise<{id:string,vault_id:string,user_id:string,display_name:string|null,theme_key:string|null} | null>}
 */
export async function getVaultMemberPreferenceForUserAndVault({
  userId,
  vaultId,
}) {
  if (!userId || !vaultId) return null;
  const session = await auth();
  if (!session) {
    console.error("getVaultMemberPreferenceForUserAndVault failed: no session");
    return null;
  }

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("vault_member_preferences")
    .select("id,vault_id,user_id,display_name,theme_key")
    .eq("user_id", userId)
    .eq("vault_id", vaultId)
    .single();

  if (error?.code === "PGRST116") return null;
  if (error) {
    console.error("getVaultMemberPreferenceForUserAndVault failed", error);
    return null;
  }
  return data ?? null;
}

/**
 * - Delete vault member preferences for a user.
 * @param {{ userId:string }} input
 * @returns {Promise<number>}
 */
export async function deleteVaultMemberPreferencesForUser({ userId }) {
  if (!userId) {
    console.error("deleteVaultMemberPreferencesForUser failed: missing user id");
    return 0;
  }
  const session = await auth();
  if (!session) {
    console.error("deleteVaultMemberPreferencesForUser failed: no session");
    return 0;
  }

  const supabase = await getSupabase();
  const { count, error } = await supabase
    .from("vault_member_preferences")
    .delete()
    .eq("user_id", userId)
    .select("id", { count: "exact" });
  if (error) {
    console.error("deleteVaultMemberPreferencesForUser failed", error);
    return 0;
  }
  return Number(count || 0);
}

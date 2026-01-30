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
  if (!userId) throw new Error("User id is required.");
  const session = await auth();
  if (!session) throw new Error("You must be logged in.");

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("vault_member_preferences")
    .select("id,vault_id,user_id,display_name,theme_key")
    .eq("user_id", userId);

  if (error) throw error;
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
  if (!userId || !vaultId) throw new Error("User id and vault id are required.");
  const session = await auth();
  if (!session) throw new Error("You must be logged in.");
  if (String(session.user.userId) !== String(userId))
    throw new Error("You do not have access to update this preference.");

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

  if (error) throw error;
  return data;
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
  if (!session) throw new Error("You must be logged in.");

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("vault_member_preferences")
    .select("id,vault_id,user_id,display_name,theme_key")
    .eq("user_id", userId)
    .eq("vault_id", vaultId)
    .single();

  if (error?.code === "PGRST116") return null;
  if (error) throw error;
  return data;
}

/**
 * - Delete vault member preferences for a user.
 * @param {{ userId:string }} input
 * @returns {Promise<number>}
 */
export async function deleteVaultMemberPreferencesForUser({ userId }) {
  if (!userId) throw new Error("User id is required.");
  const session = await auth();
  if (!session) throw new Error("You must be logged in.");

  const supabase = await getSupabase();
  const { count, error } = await supabase
    .from("vault_member_preferences")
    .delete()
    .eq("user_id", userId)
    .select("id", { count: "exact" });
  if (error) throw error;
  return Number(count || 0);
}

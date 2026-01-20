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
export async function getPermissionsForVault(vaultId) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("permissions")
    .select("*")
    .eq("vault_id", vaultId);

  if (error) throw new Error(error.message);
  return data ?? [];
}

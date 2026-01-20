/**
 * Data: Valuables
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
export async function getValuablesForVault(vaultId) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("valuables")
    .select("*")
    .eq("vault_id", vaultId)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * Fetch valuables for a container in a vault.
 * @param {string} vaultId
 * @param {string} containerId
 * @returns {Promise<Array<object>>}
 */
export async function getValuablesForContainer(vaultId, containerId) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("valuables")
    .select("*")
    .eq("vault_id", vaultId)
    .eq("container_id", containerId)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * Create a valuable.
 * @param {object} valuableObj
 * @returns {Promise<Array<object>>}
 */
export async function createValuableDb(valuableObj) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("valuables")
    .insert([valuableObj])
    .select();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Fetch default valuables for a vault.
 * @param {string} vaultId
 * @returns {Promise<Array<object>>}
 */
export async function getDefaultValuables(vaultId) {
  const { system_id } = await getVaultById(vaultId);

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("defaultvaluables")
    .select("*")
    .eq("system_id", system_id);

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Fetch a valuable by id in a vault.
 * @param {string} vaultId
 * @param {string} valuableId
 * @returns {Promise<Array<object>>}
 */
export async function getValuableForVaultById(vaultId, valuableId) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("valuables")
    .select("*")
    .eq("vault_id", vaultId)
    .eq("id", valuableId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Delete a valuable by id in a vault.
 * @param {string} vaultId
 * @param {string} valuableId
 */
export async function deleteValuableForVaultById(vaultId, valuableId) {
  const supabase = await getSupabase();
  const { error } = await supabase
    .from("valuables")
    .delete()
    .eq("vault_id", vaultId)
    .eq("id", valuableId);
  if (error) throw new Error(error.message);
}

/**
 * Update a valuable by id in a vault.
 * @param {string} vaultId
 * @param {string} valuableId
 * @param {object} updates
 * @returns {Promise<object>}
 */
export async function updateValuableForVaultById(vaultId, valuableId, updates) {
  const supabase = await getSupabase();

  const safeUpdates = { ...updates };
  delete safeUpdates.id;
  delete safeUpdates.vault_id;

  const { data, error } = await supabase
    .from("valuables")
    .update(safeUpdates)
    .eq("id", valuableId)
    .eq("vault_id", vaultId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

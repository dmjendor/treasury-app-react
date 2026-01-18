/**
 * Data: Treasures
 * Server only.
 */
import "server-only";
import { getSupabase } from "@/app/_lib/supabase";
import { getVaultById } from "@/app/_lib/data/vaults.data";

/**
 * Fetch treasures for a vault.
 * @param {string} vaultId
 * @returns {Promise<Array<object>>}
 */
export async function getTreasuresForVault(vaultId) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("treasures")
    .select("*")
    .eq("vault_id", vaultId)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * Fetch treasures for a container in a vault.
 * @param {string} vaultId
 * @param {string} containerId
 * @returns {Promise<Array<object>>}
 */
export async function getTreasuresForContainer(vaultId, containerId) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("treasures")
    .select("*")
    .eq("vault_id", vaultId)
    .eq("container_id", containerId)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * Create a treasure.
 * @param {object} treasureObj
 * @returns {Promise<Array<object>>}
 */
export async function createTreasureDb(treasureObj) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("treasures")
    .insert([treasureObj])
    .select();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Fetch default treasures for a vault.
 * @param {string} vaultId
 * @returns {Promise<Array<object>>}
 */
export async function getDefaultTreasures(vaultId) {
  const { system_id } = await getVaultById(vaultId);

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("defaulttreasures")
    .select("*")
    .eq("system_id", system_id);

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Fetch a treasure by id in a vault.
 * @param {string} vaultId
 * @param {string} treasureId
 * @returns {Promise<Array<object>>}
 */
export async function getTreasureForVaultById(vaultId, treasureId) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("treasures")
    .select("*")
    .eq("vault_id", vaultId)
    .eq("id", treasureId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Delete a treasure by id in a vault.
 * @param {string} vaultId
 * @param {string} treasureId
 */
export async function deleteTreasureForVaultById(vaultId, treasureId) {
  const supabase = await getSupabase();
  const { error } = await supabase
    .from("treasures")
    .delete()
    .eq("vault_id", vaultId)
    .eq("id", treasureId);
  if (error) throw new Error(error.message);
}

/**
 * Update a treasure by id in a vault.
 * @param {string} vaultId
 * @param {string} treasureId
 * @param {object} updates
 * @returns {Promise<object>}
 */
export async function updateTreasureForVaultById(vaultId, treasureId, updates) {
  const supabase = await getSupabase();

  const safeUpdates = { ...updates };
  delete safeUpdates.id;
  delete safeUpdates.vault_id;

  const { data, error } = await supabase
    .from("treasures")
    .update(safeUpdates)
    .eq("id", treasureId)
    .eq("vault_id", vaultId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

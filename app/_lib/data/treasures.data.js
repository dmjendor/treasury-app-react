/**
 * Data: Treasures
 * Server only.
 */
import "server-only";
import { getSupabase } from "@/app/_lib/supabase";
import { getVaultById } from "@/app/_lib/data/vaults.data";
import { tryCreateVaultLog } from "@/app/_lib/data/logs.data";

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
    .or("archived.is.null,archived.eq.false")
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
    .or("archived.is.null,archived.eq.false")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * Create a treasure.
 * @param {object} treasureObj
 * @returns {Promise<Array<object>>}
 */
export async function createTreasureDb(treasureObj, options = {}) {
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
    .or("archived.is.null,archived.eq.false")
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
  const { data, error } = await supabase
    .from("treasures")
    .update({ archived: true })
    .eq("vault_id", vaultId)
    .eq("id", treasureId);
  if (error) throw new Error(error.message);

  await tryCreateVaultLog({
    vaultId,
    source: "treasures",
    action: "archive",
    entityType: "treasures",
    entityId: treasureId,
  });
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

  const { data: before, error: beforeError } = await supabase
    .from("treasures")
    .select("*")
    .eq("id", treasureId)
    .eq("vault_id", vaultId)
    .single();

  if (beforeError) return { ok: false, error: beforeError.message, data: null };

  const { data: after, error: updateError } = await supabase
    .from("treasures")
    .update(safeUpdates)
    .eq("id", treasureId)
    .eq("vault_id", vaultId)
    .select("*")
    .single();

  if (updateError) return { ok: false, error: updateError.message, data: null };

  return { ok: true, error: null, data: { before, after } };
}

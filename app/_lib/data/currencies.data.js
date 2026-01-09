/**
 * Data: Currencies
 * Server only.
 */
import "server-only";
import { getSupabase } from "@/app/_lib/supabase";

/**
 * - List currencies for a vault.
 * - @param {string} vaultId
 * - @returns {Promise<any[]>}
 */
export async function getCurrenciesForVault(vaultId) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("currencies")
    .select("*")
    .eq("vault_id", vaultId)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * - Get a currency for a vault by id (vault boundary enforced).
 * - @param {string} vaultId
 * - @param {string} currencyId
 * - @returns {Promise<any>}
 */
export async function getCurrencyForVaultById(vaultId, currencyId) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("currencies")
    .select("*")
    .eq("id", currencyId)
    .eq("vault_id", vaultId)
    .single();

  // PGRST116 = "Results contain 0 rows" for .single()
  if (error?.code === "PGRST116") return null;
  if (error) throw new Error(error.message);

  return data ?? null;
}

/**
 * - Create a currency in a vault.
 * - @param {string} vaultId
 * - @param {any} input
 * - @returns {Promise<any>}
 */
export async function createCurrencyForVault(vaultId, input) {
  const supabase = await getSupabase();

  const insertRow = { ...input, vault_id: vaultId };

  const { data, error } = await supabase
    .from("currencies")
    .insert(insertRow)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/////////////
// UPDATE
/**
 * - Update a currency for a vault by id (vault boundary enforced).
 * - @param {string} vaultId
 * - @param {string} currencyId
 * - @param {any} updates
 * - @returns {Promise<any|null>}
 */
export async function updateCurrencyForVaultById(vaultId, currencyId, updates) {
  const supabase = await getSupabase();

  const safeUpdates = { ...updates };
  delete safeUpdates.id;
  delete safeUpdates.vault_id;

  const { data, error } = await supabase
    .from("currencies")
    .update(safeUpdates)
    .eq("id", currencyId)
    .eq("vault_id", vaultId)
    .select("*")
    .single();

  if (error?.code === "PGRST116") return null;
  if (error) throw new Error(error.message);

  return data ?? null;
}

/**
 * - Delete a currency for a vault by id (vault boundary enforced).
 * - @param {string} vaultId
 * - @param {string} currencyId
 * - @returns {Promise<void>}
 */
export async function deleteCurrencyForVaultById(vaultId, currencyId) {
  const supabase = await getSupabase();

  const { error } = await supabase
    .from("currencies")
    .delete()
    .eq("id", currencyId)
    .eq("vault_id", vaultId);

  if (error) throw new Error(error.message);
}

/**
 * Data: Vaults
 * Server only.
 */
import "server-only";
import { getSupabase } from "@/app/_lib/supabase";

function normalizeVault(vault) {
  return {
    ...vault,
    containers_count: vault.containers?.[0]?.count ?? 0,
    treasure_count: vault.treasure?.[0]?.count ?? 0,
    currencies_count: vault.currency?.[0]?.count ?? 0,
    valuables_count: vault.valuables?.[0]?.count ?? 0,
  };
}

/**
 * - Get a vault by id.
 * - @param {string} id
 * - @returns {Promise<any>}
 */
export async function getVaultById(id) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("vaults")
    .select("*")
    .eq("id", id)
    .single();

  // For testing
  // await new Promise((res) => setTimeout(res, 1000));

  if (error) {
    console.error(error);
    notFound();
  }

  return data;
}

/**
 * - List vaults for the current user.
 * - @returns {Promise<any[]>}
 */
export const getUserVaults = async function () {
  const supabase = await getSupabase();
  const session = await auth();
  if (!session) throw new Error("You must be logged in.");
  console.log("session", session.user.userId);
  const { data: vaults, error } = await supabase
    .from("vaults")
    .select(
      "id, active, base_currency_id, common_currency_id, edition_id, name, theme_id, containers(count), treasure(count), currencies(count), valuables(count)"
    )
    .eq("user_id", session.user.userId)
    .order("name");

  console.log(error);
  if (error) throw new Error("Vaults could not be loaded");

  const normalizedVaults = Array.isArray(vaults)
    ? vaults.map(normalizeVault)
    : [];
  return normalizedVaults;
};

/**
 * - Assert that a vault is owned by a user.
 * - @param {string} vaultId
 * - @param {string} userId
 * - @returns {Promise<void>}
 */
export async function assertVaultOwner(vaultId, userId) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("vaults")
    .select("id")
    .eq("id", vaultId)
    .eq("owner_id", userId)
    .single();

  if (error || !data) throw new Error("Vault access denied.");
}

/**
 * - Create a vault.
 * - @param {any} newVault
 * - @returns {Promise<any>}
 */
export async function createVault(newVault) {
  const { data, error } = await supabase
    .from("vaults")
    .insert([newVault])
    .select();

  if (error) throw new Error("Vault could not be created");

  return data;
}

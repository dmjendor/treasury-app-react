/**
 * Data: Vaults
 * Server only.
 */
import "server-only";
import { getSupabase } from "@/app/_lib/supabase";
import { auth } from "@/app/_lib/auth";
import { notFound } from "next/navigation";
import { getThemes } from "@/app/_lib/data/themes.data";
import { getSystems } from "@/app/_lib/data/systems.data";
import { getCurrenciesForVault } from "@/app/_lib/data/currencies.data";
import { getContainersForVault } from "@/app/_lib/data/containers.data";

function normalizeVault(vault) {
  return {
    ...vault,
    containers_count: vault.containers?.[0]?.count ?? 0,
    treasures_count: vault.treasures?.[0]?.count ?? 0,
    currencies_count: vault.currencies?.[0]?.count ?? 0,
    valuables_count: vault.valuables?.[0]?.count ?? 0,
    themeKey: vault.theme?.theme_key,
  };
}

/**
 * - Get a vault by id.
 * - @param {string} id
 * - @returns {Promise<any>}
 */
export async function getVaultById(id) {
  if (!id) {
    throw new Error("getVaultById: missing vault id");
  }
  const supabase = await getSupabase();
  const { data: vault, error } = await supabase
    .from("vaults")
    .select(
      "id, user_id, active, base_currency_id, common_currency_id, system_id, name, theme_id, containers(count), treasures(count), currencies(count), valuables(count), theme:themes ( id, theme_key, name ), system:systems( id, name )",
    )
    .eq("id", id)
    .single();

  const [containerList, themeList, systemList, currencyList] =
    await Promise.all([
      getContainersForVault(id),
      getThemes(),
      getSystems(),
      getCurrenciesForVault(id),
    ]);

  const normalizedVault = normalizeVault(vault);
  const vaultCtx = {
    ...normalizedVault,
    containerList,
    themeList,
    systemList,
    currencyList,
  };

  if (error) {
    console.error(error);
  }

  return vaultCtx;
}

/**
 * - List vaults for the current user.
 * - @returns {Promise<any[]>}
 */
export const getUserVaults = async function () {
  const supabase = await getSupabase();
  const session = await auth();
  if (!session) throw new Error("You must be logged in.");
  const { data: vaults, error } = await supabase
    .from("vaults")
    .select(
      "id, active, base_currency_id, common_currency_id, system_id, name, theme_id, containers(count), treasures(count), currencies(count), valuables(count), theme:themes ( id, theme_key, name ), system: systems( id, name)",
    )
    .eq("user_id", session.user.userId)
    .order("name");

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
    .eq("user_id", userId)
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

export async function updateVaultSettingsDb({ userId, vaultId, ...patch }) {
  // Supabase server client in here
  const supabase = await getSupabase();

  // Only allow updating whitelisted columns
  const allowed = {
    active: patch.active,
    allow_xfer_in: patch.allow_xfer_in,
    allow_xfer_out: patch.allow_xfer_out,
    base_currency_id: patch.base_currency_id,
    common_currency_id: patch.common_currency_id,
    system_id: patch.system_id,
    vo_buy_markup: patch.vo_buy_markup,
    vo_sell_markup: patch.vo_sell_markup,
    item_buy_markup: patch.item_buy_markup,
    item_sell_markup: patch.item_sell_markup,
    merge_split: patch.merge_split,
    name: patch.name,
    reward_prep_enabled: patch.reward_prep_enabled,
    theme_id: patch.theme_id,
    treasury_split_enabled: patch.treasury_split_enabled,
  };

  // Remove undefined so we don’t overwrite unintentionally
  Object.keys(allowed).forEach((k) => {
    if (allowed[k] === undefined) delete allowed[k];
  });

  const { data, error } = await supabase
    .from("vaults")
    .update(allowed)
    .eq("id", vaultId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

/**
 * Vaults the user can access but does not own (player views).
 * A user is a member when permissions.user_id is set and can_view = true.
 */
export async function getMemberVaultsForUser(userId) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("permissions")
    .select(
      `
        vault_id,
        accepted_at,
        vaults:vault_id (
          id,
          name,
          user_id
        )
      `,
    )
    .eq("user_id", userId)
    .eq("can_view", true)
    .not("accepted_at", "is", null) // optional, but helps enforce "accepted"
    .order("name", { foreignTable: "vaults", ascending: true });

  if (error) return { data: null, error };

  const memberVaults = (data || [])
    .map((row) => row.vaults)
    .filter(Boolean)
    .filter((v) => String(v.user_id) !== String(userId));

  return { data: memberVaults, error: null };
}

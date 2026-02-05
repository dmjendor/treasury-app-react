/**
 * Data: Vaults
 * Server only.
 */
import "server-only";
import { getSupabase } from "@/app/_lib/supabase";
import { auth } from "@/app/_lib/auth";
import { getThemes } from "@/app/_lib/data/themes.data";
import { getSystems } from "@/app/_lib/data/systems.data";
import { getCurrenciesForVault } from "@/app/_lib/data/currencies.data";
import { getContainersForVault } from "@/app/_lib/data/containers.data";
import { promoteToOwnerPermission } from "@/app/_lib/data/permissions.data";

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
    console.error("getVaultById failed: missing vault id");
    return null;
  }
  const supabase = await getSupabase();
  const { data: vault, error } = await supabase
    .from("vaults")
    .select(
      "id, user_id, active, allow_xfer_in, allow_xfer_out, base_currency_id, common_currency_id, system_id, name, theme_id, merge_split, treasury_split_enabled, containers(count), treasures(count), currencies(count), valuables(count), theme:themes ( id, theme_key, name ), system:systems( id, name )",
    )
    .eq("id", id)
    .single();

  if (error) {
    if (error?.code === "PGRST116") return null;
    console.error("getVaultById failed", error);
    return null;
  }

  if (!vault) return null;

  const [containerList, themeList, systemList, currencyList] =
    await Promise.all([
      getContainersForVault(id),
      getThemes(),
      getSystems(),
      getCurrenciesForVault(id),
    ]);

  const normalizedVault = normalizeVault(vault);
  return {
    ...normalizedVault,
    containerList,
    themeList,
    systemList,
    currencyList,
  };
}

/**
 * - List vaults for the current user.
 * - @returns {Promise<any[]>}
 */
export const getUserVaults = async function () {
  const supabase = await getSupabase();
  const session = await auth();
  if (!session) {
    console.error("getUserVaults failed: no session");
    return [];
  }
  const { data: vaults, error } = await supabase
    .from("vaults")
    .select(
      "id, active, allow_xfer_in, allow_xfer_out, base_currency_id, common_currency_id, system_id, name, theme_id, containers(count), treasures(count), currencies(count), valuables(count), theme:themes ( id, theme_key, name ), system: systems( id, name)",
    )
    .eq("user_id", session.user.userId)
    .order("name");

  if (error) {
    console.error("getUserVaults failed", error);
    return [];
  }

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

  if (error || !data) {
    if (error) console.error("assertVaultOwner failed", error);
    return false;
  }
  return true;
}

/**
 * - Get a vault name for an owner.
 * - @param {string} vaultId
 * - @param {string} userId
 * - @returns {Promise<string|null>}
 */
export async function getVaultNameForOwner(vaultId, userId) {
  if (!vaultId || !userId) {
    console.error("getVaultNameForOwner failed: missing vaultId or userId");
    return null;
  }

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("vaults")
    .select("id,name")
    .eq("id", vaultId)
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("getVaultNameForOwner failed", error);
    return null;
  }

  return data?.name ?? null;
}

/**
 * - Delete a vault and all related data.
 * - @param {string} vaultId
 * - @returns {Promise<{ ok: boolean, error: string | null }>}
 */
export async function deleteVaultCascadeDb(vaultId) {
  if (!vaultId) {
    console.error("deleteVaultCascadeDb failed: missing vault id");
    return { ok: false, error: "Missing vault id." };
  }

  const supabase = await getSupabase();

  const { error: clearCurrencyError } = await supabase
    .from("vaults")
    .update({ base_currency_id: null, common_currency_id: null })
    .eq("id", vaultId);

  if (clearCurrencyError) {
    console.error("deleteVaultCascadeDb base/common clear failed", clearCurrencyError);
    return { ok: false, error: "Vault could not be prepared for deletion." };
  }

  const deleteSteps = [
    "prepholdings",
    "preptreasures",
    "prepvaluables",
    "rewardprep",
    "holdings",
    "treasures",
    "valuables",
    "logs",
    "permissions",
    "vault_member_preferences",
    "containers",
    "currencies",
  ];

  for (const table of deleteSteps) {
    const { error } = await supabase.from(table).delete().eq("vault_id", vaultId);
    if (error) {
      console.error("deleteVaultCascadeDb failed", { table, error });
      return { ok: false, error: "Vault data could not be deleted." };
    }
  }

  const { error: vaultError } = await supabase
    .from("vaults")
    .delete()
    .eq("id", vaultId);

  if (vaultError) {
    console.error("deleteVaultCascadeDb failed to delete vault", vaultError);
    return { ok: false, error: "Vault could not be deleted." };
  }

  return { ok: true, error: null };
}

/**
 * - Transfer a vault to a new owner.
 * - @param {{ vaultId: string, fromUserId: string, toUserId: string }} input
 * @returns {Promise<{ ok: boolean, error: string | null }>}
 */
export async function transferVaultOwnershipDb({
  vaultId,
  fromUserId,
  toUserId,
}) {
  if (!vaultId || !fromUserId || !toUserId) {
    return { ok: false, error: "Missing transfer inputs." };
  }

  const supabase = await getSupabase();

  const { data: vaultRow, error: vaultError } = await supabase
    .from("vaults")
    .select("id,user_id,name")
    .eq("id", vaultId)
    .eq("user_id", fromUserId)
    .single();

  if (vaultError || !vaultRow) {
    if (vaultError) console.error("transferVaultOwnershipDb load failed", vaultError);
    return { ok: false, error: "Vault could not be loaded." };
  }

  const { error: updateError } = await supabase
    .from("vaults")
    .update({ user_id: toUserId })
    .eq("id", vaultId)
    .eq("user_id", fromUserId);

  if (updateError) {
    console.error("transferVaultOwnershipDb update failed", updateError);
    return { ok: false, error: "Vault ownership could not be updated." };
  }

  const { error: rewardError } = await supabase
    .from("rewardprep")
    .update({ user_id: toUserId })
    .eq("vault_id", vaultId);

  if (rewardError) {
    console.error("transferVaultOwnershipDb rewardprep update failed", rewardError);
    return { ok: false, error: "Reward prep could not be transferred." };
  }

  const ownerPermRes = await promoteToOwnerPermission({
    vaultId,
    userId: toUserId,
    actorUserId: fromUserId,
  });

  if (!ownerPermRes.ok) {
    console.error("transferVaultOwnershipDb permission update failed", ownerPermRes.error);
  }

  return { ok: true, error: null };
}

/**
 * - Create a vault.
 * - @param {any} newVault
 * - @returns {Promise<any>}
 */
export async function createVault(newVault) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("vaults")
    .insert([newVault])
    .select("*")
    .single();

  if (error) {
    console.error("createVault failed", error);
    return null;
  }

  return data ?? null;
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

  if (error) {
    console.error("updateVaultSettingsDb failed", error);
    return null;
  }
  return data ?? null;
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

  if (error) {
    console.error("getMemberVaultsForUser failed", error);
    return { data: null, error: "Member vaults could not be loaded." };
  }

  const memberVaults = (data || []).map((row) => row.vaults);
  // .filter(Boolean)
  // .filter((v) => String(v.user_id) !== String(userId));

  return { data: memberVaults, error: null };
}

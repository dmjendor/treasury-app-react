/**
 * Data: Containers
 * Server only.
 */
import "server-only";
import { getSupabase } from "@/app/_lib/supabase";
import { auth } from "@/app/_lib/auth";

/**
 * - List containers for a vault.
 * - @param {string} vaultId
 * - @returns {Promise<any[]>}
 */
export const getContainersForVault = async function (vaultId) {
  const session = await auth();
  if (!session) {
    console.error("getContainersForVault failed: no session");
    return [];
  }
  const supabase = await getSupabase();
  const { data: containers, error } = await supabase
    .from("containers")
    .select("id,name,is_hidden, treasures(count), valuables(count)")
    .eq("vault_id", vaultId);
  if (error) {
    console.error("getContainersForVault failed", error);
    return [];
  }

  return containers ?? [];
};

/**
 * - Create a container.
 * - @param {any} newContainer
 * - @returns {Promise<any>}
 */
export async function createContainerInDb(newContainer) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("containers")
    .insert([newContainer])
    .select();

  if (error) {
    console.error("createContainerInDb failed", error);
    return null;
  }

  return data ?? null;
}

/**
 * - Delete a container by id.
 * - @param {string} containerId
 * - @param {string} vaultId
 * - @returns {Promise<{ ok: boolean }>}
 */
export async function deleteContainerDb(containerId, vaultId) {
  const session = await auth();
  if (!session) {
    console.error("deleteContainerDb failed: no session");
    return { ok: false, error: "You must be logged in." };
  }
  const supabase = await getSupabase();

  const { error } = await supabase
    .from("containers")
    .delete()
    .eq("id", containerId);
  if (error) {
    console.error("deleteContainerDb failed", error);
    return { ok: false, error: "Container could not be deleted." };
  }

  return { ok: true };
}

/**
 * - List default containers
 * - @param {string} vaultId
 * - @returns {Promise<any[]>}
 */
export const getDefaultContainers = async function () {
  const session = await auth();
  if (!session) {
    console.error("getDefaultContainers failed: no session");
    return [];
  }
  const supabase = await getSupabase();
  const { data: containers, error } = await supabase
    .from("defaultcontainers")
    .select("name");

  if (error) {
    console.error("getDefaultContainers failed", error);
    return [];
  }

  return containers ?? [];
};

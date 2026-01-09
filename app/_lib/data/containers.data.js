/**
 * Data: Containers
 * Server only.
 */
import "server-only";
import { getSupabase } from "@/app/_lib/supabase";

/**
 * - List containers for a vault.
 * - @param {string} vaultId
 * - @returns {Promise<any[]>}
 */
export const getContainersForVault = async function (vaultId) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in.");
  const supabase = await getSupabase();
  const { data: containers, error } = await supabase
    .from("containers")
    .select("id,name,is_hidden, treasure(count), valuables(count)")
    .eq("vault_id", vaultId);

  if (error) throw new Error("Containers could not be loaded");

  return containers;
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

  if (error) throw new Error("Container could not be created");

  return data;
}

/**
 * - Delete a container by id.
 * - @param {string} containerId
 * - @param {string} vaultId
 * - @returns {Promise<{ ok: boolean }>}
 */
export async function deleteContainerDb(containerId, vaultId) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in.");
  const supabase = await getSupabase();

  const { error } = await supabase
    .from("containers")
    .delete()
    .eq("id", containerId);
  if (error) throw new Error("Container could not be deleted");

  return { ok: true };
}

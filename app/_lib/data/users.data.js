/**
 * Data: Users
 * Server only.
 */
import "server-only";
import { getSupabase } from "@/app/_lib/supabase";

// Users are uniquely identified by their email address
/**
 * - Get a user by email.
 * - @param {string} email
 * - @returns {Promise<any>}
 */
export async function getUser(email) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();
  if (error) {
    console.error("getUser failed", error);
  }
  // No error here! We handle the possibility of no user in the sign in callback
  return data;
}

/**
 * - Create a user.
 * - @param {any} newUser
 * - @returns {Promise<any>}
 */
export async function createUser(newUser) {
  const supabase = await getSupabase();
  const { data, error } = await supabase.from("users").insert([newUser]);

  if (error) {
    console.error("createUser failed", error);
    return null;
  }

  return data ?? null;
}

/**
 * - Get a user by id.
 * @param {string} userId
 * @returns {Promise<any>}
 */
export async function getUserById(userId) {
  if (!userId) {
    console.error("getUserById failed: missing user id");
    return null;
  }
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) {
    console.error("getUserById failed", error);
    return null;
  }
  return data ?? null;
}

/**
 * - Fetch users by id list.
 * @param {string[]} userIds
 * @returns {Promise<Array<any>>}
 */
export async function getUsersByIds(userIds) {
  if (!Array.isArray(userIds) || userIds.length === 0) return [];
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .in("id", userIds);
  if (error) {
    console.error("getUsersByIds failed", error);
    return [];
  }
  return data ?? [];
}

/**
 * - Update the auth source for a user by email.
 * @param {{ email: string, source: string }} input
 * @returns {Promise<void>}
 */
export async function updateUserSourceByEmail({ email, source }) {
  if (!email || !source) return false;
  const supabase = await getSupabase();
  const { error } = await supabase
    .from("users")
    .update({ source })
    .eq("email", email);
  if (error) {
    console.error("updateUserSourceByEmail failed", error);
    return false;
  }
  return true;
}

/**
 * - Delete a user by id.
 * @param {{ userId: string }} input
 * @returns {Promise<void>}
 */
export async function deleteUserById({ userId }) {
  if (!userId) {
    console.error("deleteUserById failed: missing user id");
    return false;
  }
  const supabase = await getSupabase();
  const { error } = await supabase.from("users").delete().eq("id", userId);
  if (error) {
    console.error("deleteUserById failed", error);
    return false;
  }
  return true;
}

/**
 * - Update a user's profile theme.
 * @param {{ userId: string, themeId: string|null }} input
 * @returns {Promise<any>}
 */
export async function updateUserTheme({ userId, themeId }) {
  if (!userId) {
    console.error("updateUserTheme failed: missing user id");
    return null;
  }
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("users")
    .update({ theme_id: themeId || null })
    .eq("id", userId)
    .select("*")
    .single();
  if (error) {
    console.error("updateUserTheme failed", error);
    return null;
  }
  return data ?? null;
}

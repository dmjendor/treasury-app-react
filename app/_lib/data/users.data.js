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
    console.error(error);
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
    console.error(error);
    throw new Error("User could not be created");
  }

  return data;
}

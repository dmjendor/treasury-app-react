/**
 * Auth Actions
 * Server actions for sign in/out.
 */

"use server";

import { signIn, signOut } from "@/app/_lib/auth";

/**
 * Sign in with Google.
 * @returns {Promise<void>}
 */
export async function signInAction() {
  await signIn("google", { redirectTo: "/account" });
}

/**
 * Sign out.
 * @returns {Promise<void>}
 */
export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

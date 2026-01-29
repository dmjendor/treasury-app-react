/**
 * Auth Actions
 * Server actions for sign in/out.
 */

"use server";

import { signIn, signOut } from "@/app/_lib/auth";

/**
 * Sign in with an OAuth provider.
 * @param {string} provider
 * @param {string} [redirectTo]
 * @returns {Promise<void>}
 */
export async function signInAction(provider, redirectTo = "/account") {
  await signIn(provider, { redirectTo });
}

/**
 * Sign out.
 * @returns {Promise<void>}
 */
export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

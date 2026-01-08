"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, signIn, signOut } from "./auth";
import { supabase } from "./supabase";

// CREATE

export async function createVaultAction(formData) {
  const data = formDataToObject(formData);
  const session = await auth();

  if (!session) throw new Error("You must be logged in.");

  // Add owner to object before creating vault.
  data.owner = session?.user?.userId;

  // Call your local API route
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/vaults`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    // In a real app you’d return structured errors for the UI.
    // For now keep it simple.
    const msg = await res.json().catch(() => ({}));
    throw new Error(msg?.error || "Failed to create vault");
  }

  const { vault } = await res.json();

  // Refresh list page cache if you have it
  revalidatePath("/account/vaults");

  // Go to the vault overview
  redirect(`/account/vaults/${vault.id}`);
}

// UPDATE

export async function signInAction() {
  await signIn("google", { redirectTo: "/account" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

// const handleGoogleSignIn = () => {
//   signIn('google', { callbackUrl: '/dashboard' });
// };

// const handleGitHubSignIn = () => {
//   signIn('github', { callbackUrl: '/dashboard' });
// };

// Reusable functions
function formDataToObject(formData) {
  const obj = {};
  for (const [k, v] of formData.entries()) obj[k] = v;
  return obj;
}

function cleanInputs(text) {
  let observations = typeof text === "string" ? text.trim() : "";

  // Remove null bytes + most control chars (keep tab/newline/carriage return)
  observations = observations.replace(
    /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,
    ""
  );

  // Cap length
  if (observations.length > 1000) {
    observations = observations.slice(0, 1000);
  }
  return observations;
}

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/_components/Button";
import { acceptInviteAction } from "@/app/_lib/actions/permissions";

export default function InviteClient({ sessionEmail, invite, token }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(
    invite?.ok ? "" : invite?.error || "Invalid invite.",
  );

  const invitedEmail = invite?.ok ? String(invite.email || "") : "";
  const signedIn = !!sessionEmail;

  const emailMatches =
    signedIn &&
    invitedEmail &&
    sessionEmail.trim().toLowerCase() === invitedEmail.trim().toLowerCase();

  async function handleSignIn() {
    setError("");
    setBusy(true);

    const inviteUrl = `/invite?token=${encodeURIComponent(token)}`;
    router.push(
      `/login?callbackUrl=${encodeURIComponent(inviteUrl)}`,
    );
  }

  async function handleJoin() {
    setError("");
    setBusy(true);

    const res = await acceptInviteAction({ token });

    if (!res?.ok) {
      setError(res?.error || "Failed to join.");
      setBusy(false);
      return;
    }

    router.replace(`/account/vaults/${encodeURIComponent(res.data.vault_id)}`);
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-xl px-6 py-10">
      {/* outer frame */}
      <div className="rounded-3xl border border-primary-700 bg-primary-700 p-2 shadow-lg">
        {/* inner card */}
        <div className="relative overflow-hidden rounded-3xl border border-primary-700 bg-primary-200 p-6 shadow-md">
          {/* subtle corner glow */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent-200 opacity-60 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-primary-100 opacity-70 blur-3xl" />

          <div className="relative">
            {/* title + status */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xl font-semibold text-primary-900">
                  Vault invite
                </div>
                <div className="mt-1 text-sm text-primary-800">
                  {invite?.ok
                    ? "The party is waiting for you to join."
                    : "This link does not appear to be valid."}
                </div>
              </div>

              <div className="shrink-0 rounded-full border border-primary-700 bg-primary-400 px-3 py-1 text-xs font-semibold text-primary-900">
                {invite?.ok ? "Invite" : "Invalid"}
              </div>
            </div>

            {/* details block */}
            <div className="mt-5 rounded-2xl border border-primary-700 bg-surface-50 p-4">
              {invite?.ok ? (
                <div className="text-sm text-primary-900">
                  This invite is for{" "}
                  <span className="font-semibold text-primary-900">
                    {invitedEmail}
                  </span>
                  .
                </div>
              ) : (
                <div className="text-sm text-primary-900">
                  Invite link is not valid.
                </div>
              )}

              {signedIn ? (
                <div className="mt-2 text-sm text-primary-900">
                  Signed in as{" "}
                  <span className="font-semibold text-primary-900">
                    {sessionEmail}
                  </span>
                  .
                </div>
              ) : (
                <div className="mt-2 text-sm text-primary-900">
                  You are not signed in.
                </div>
              )}

              {!invite?.ok ? null : signedIn && !emailMatches ? (
                <div className="mt-3 rounded-xl border border-warning-600 bg-warning-100 p-3 text-sm text-primary-900">
                  The signed in email does not match this invite.
                </div>
              ) : null}

              {error ? (
                <div className="mt-3 rounded-xl border border-danger-600 bg-danger-100 p-3 text-sm text-danger-700">
                  {error}
                </div>
              ) : null}
            </div>

            {/* actions */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {!invite?.ok ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled
                >
                  Invite unavailable
                </Button>
              ) : !signedIn ? (
                <Button
                  type="button"
                  variant="accent"
                  disabled={busy}
                  onClick={handleSignIn}
                >
                  {busy ? "Opening sign in…" : "Sign in to join"}
                </Button>
              ) : !emailMatches ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled
                >
                  Email does not match invite
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="accent"
                  disabled={busy}
                  onClick={handleJoin}
                >
                  {busy ? "Joining…" : "Join vault"}
                </Button>
              )}

              {/* small helper note */}
              <div className="ml-auto text-xs text-primary-800">
                {invite?.ok
                  ? "You will be added as a member after joining."
                  : "Request a fresh invite from the vault owner."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

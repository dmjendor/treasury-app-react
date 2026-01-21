"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/app/_components/Button";
import { acceptInviteAction } from "@/app/_lib/actions/permissions";

export default function InviteClient({ token, invite, sessionEmail }) {
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

    // redirect back to this invite after OAuth
    await signIn("google", {
      callbackUrl: `/invite?token=${encodeURIComponent(token)}`,
    });
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
    <div className="mx-auto w-full max-w-xl space-y-6 p-6 text-fg">
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="text-xl font-semibold text-fg">Vault invite</div>

        {invite?.ok ? (
          <div className="mt-2 text-sm text-muted-fg">
            This invite is for{" "}
            <span className="font-semibold text-fg">{invitedEmail}</span>.
          </div>
        ) : (
          <div className="mt-2 text-sm text-muted-fg">
            Invite link is not valid.
          </div>
        )}

        {signedIn ? (
          <div className="mt-2 text-sm text-muted-fg">
            Signed in as{" "}
            <span className="font-semibold text-fg">{sessionEmail}</span>.
          </div>
        ) : (
          <div className="mt-2 text-sm text-muted-fg">
            You are not signed in.
          </div>
        )}

        {error ? (
          <div className="mt-4 rounded-xl border border-danger-600 bg-danger-100 p-3 text-sm text-danger-700">
            {error}
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          {!invite?.ok ? null : !signedIn ? (
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
        </div>
      </div>
    </div>
  );
}

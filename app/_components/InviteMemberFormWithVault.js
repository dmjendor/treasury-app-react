"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import InputComponent from "@/app/_components/InputComponent";
import { Button } from "@/app/_components/Button";
import { inviteMemberAction } from "@/app/_lib/actions/permissions";

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

export default function InviteMemberFormWithVault({
  vaultId,
  onClose,
  onCloseHref, // optional fallback route
  isModal = true, // default: assume modal
}) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState("");

  function close() {
    if (typeof onClose === "function") return onClose();

    if (onCloseHref) {
      router.replace(onCloseHref);
      router.refresh();
      return;
    }

    if (isModal) {
      router.back();
      router.refresh();
      return;
    }

    router.replace(`/account/vaults/${encodeURIComponent(vaultId)}/members`);
    router.refresh();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSentTo("");

    const clean = normalizeEmail(email);

    if (!clean) return setError("Email is required.");
    if (!vaultId) return setError("Vault is required.");

    setBusy(true);

    const res = await inviteMemberAction({
      vaultId: String(vaultId),
      email: clean,
    });

    if (!res?.ok) {
      setError(res?.error || "Failed to send invite.");
      setBusy(false);
      return;
    }

    setBusy(false);
    setSentTo(clean);
    setEmail("");

    // Refresh members list behind the modal / after returning
    router.refresh();

    // If modal, close after successful send
    if (isModal) close();
  }

  return (
    <div className="space-y-4 text-fg">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="text-sm font-semibold text-fg">Invite by email</div>
        <div className="mt-1 text-xs text-muted-fg">
          The invite can only be accepted by signing in with the same email.
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-danger-600 bg-danger-100 p-3 text-sm text-danger-700">
            {error}
          </div>
        ) : null}

        {sentTo ? (
          <div className="mt-4 rounded-xl border border-success-600 bg-success-100 p-3 text-sm text-success-700">
            Invite sent to {sentTo}.
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="mt-4 space-y-4"
        >
          <InputComponent
            id="invite-email"
            label="Email"
            hint="Example: player@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              type="submit"
              variant="accent"
              disabled={busy}
            >
              {busy ? "Sending…" : "Send invite"}
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={close}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

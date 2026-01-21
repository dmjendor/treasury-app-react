// app/_components/MembersClient.js
"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/_components/Button";
import { LinkButton } from "@/app/_components/LinkButton";
import IconComponent from "@/app/_components/IconComponent";
import { HiOutlineTrash } from "react-icons/hi2";
import { removePermissionAction } from "@/app/_lib/actions/permissions";

function Badge({ status }) {
  const label = status === "invited" ? "Invited" : "Active";

  const cls =
    status === "invited"
      ? "border border-warning-600 bg-warning-100 text-warning-700"
      : "border border-success-600 bg-success-100 text-success-700";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${cls}`}
    >
      {label}
    </span>
  );
}

export default function MembersClient({ vaultId, members, loadError }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState(loadError || "");

  const rows = useMemo(
    () => (Array.isArray(members) ? members : []),
    [members],
  );

  async function handleRemove(permissionId) {
    setError("");
    setBusyId(permissionId);

    const res = await removePermissionAction({
      id: permissionId,
      vault_id: vaultId,
    });

    if (!res?.ok) {
      setError(res?.error || "Failed to remove member.");
      setBusyId("");
      return;
    }

    setBusyId("");
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-6 text-fg">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-fg">Members</h1>
          <p className="text-sm text-muted-fg">
            People who can view this vault, plus any pending invites.
          </p>
        </div>

        <div className="flex gap-2">
          <LinkButton
            href={`/account/vaults/${encodeURIComponent(vaultId)}/members/invite`}
            variant="accent"
          >
            Invite
          </LinkButton>
        </div>
      </header>

      {error ? (
        <div className="rounded-xl border border-danger-600 bg-danger-100 p-3 text-sm text-danger-700">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr className="text-left text-muted-fg">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-4 text-muted-fg"
                    colSpan={4}
                  >
                    No members yet.
                  </td>
                </tr>
              ) : (
                rows.map((m) => (
                  <tr
                    key={m.id}
                    className="border-t border-border"
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-fg">{m.name}</div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-muted-fg">{m.email || "—"}</div>
                    </td>

                    <td className="px-4 py-3">
                      <Badge status={m.status} />
                    </td>

                    <td className="px-4 py-3 text-right">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={busyId === m.id}
                        onClick={() => handleRemove(m.id)}
                        className="inline-flex items-center gap-2"
                        aria-label="Remove"
                        title="Remove"
                      >
                        <IconComponent icon={HiOutlineTrash} />
                        <span className="hidden sm:inline">
                          {busyId === m.id ? "Removing…" : "Remove"}
                        </span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-muted-fg">
        Tip: invites are rows with an email but no user_id. When the user signs
        in, you can “claim” the invite by attaching user_id and setting
        accepted_at.
      </p>
    </div>
  );
}

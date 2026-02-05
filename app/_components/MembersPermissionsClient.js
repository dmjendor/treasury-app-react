"use client";

import { useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import Toggle from "@/app/_components/Toggle";
import { updateMemberPermissions } from "@/app/_lib/actions/permissions";
import { Button } from "@/app/_components/Button";

const FIELDS = [
  {
    key: "can_view",
    label: "Can View",
    hint: "Can view the vault and its contents",
  },
  {
    key: "transfer_coin_in",
    label: "Coin in",
    hint: "Allow transfering coin to the vault",
  },
  {
    key: "transfer_coin_out",
    label: "Coin out",
    hint: "Allow transfering coin from the vault",
  },
  {
    key: "transfer_treasures_in",
    label: "Treasure in",
    hint: "Allow transfering treasure to the vault",
  },
  {
    key: "transfer_treasures_out",
    label: "Treasure out",
    hint: "Allow transfering treasure from the vault",
  },
  {
    key: "transfer_valuables_in",
    label: "Valuables in",
    hint: "Allow transfering valuables to the vault",
  },
  {
    key: "transfer_valuables_out",
    label: "Valuables out",
    hint: "Allow transfering valuables from the vault",
  },
  {
    key: "sell_treasures",
    label: "Sell treasure",
    hint: "Allow selling treasures",
  },
  {
    key: "sell_valuables",
    label: "Sell valuables",
    hint: "Allow selling valuables",
  },
];

function safeBool(v) {
  return Boolean(v);
}

/**
 * - Render member permission toggles for a vault.
 * - Left column: members list (single-select)
 * - Right column: permissions editor for selected member
 * - Only one member can be open at a time
 */
export default function MembersPermissionsClient({ vaultId, members }) {
  const initial = useMemo(() => {
    const map = {};
    for (const m of members || []) {
      map[m.id] = {
        can_view: safeBool(m.can_view),
        transfer_coin_in: safeBool(m.transfer_coin_in),
        transfer_coin_out: safeBool(m.transfer_coin_out),
        transfer_treasures_in: safeBool(m.transfer_treasures_in),
        transfer_treasures_out: safeBool(m.transfer_treasures_out),
        transfer_valuables_in: safeBool(m.transfer_valuables_in),
        transfer_valuables_out: safeBool(m.transfer_valuables_out),
        sell_treasures: safeBool(m.sell_treasures),
        sell_valuables: safeBool(m.sell_valuables),
      };
    }
    return map;
  }, [members]);

  const [values, setValues] = useState(initial);
  const [errorById, setErrorById] = useState({});
  const requestSeqRef = useRef({});
  const [activeId, setActiveId] = useState(() =>
    members?.[0]?.id ? String(members[0].id) : "",
  );

  function recordRequest(permissionId, field) {
    const key = `${permissionId}:${field}`;
    const current = requestSeqRef.current[key] || 0;
    const next = current + 1;
    requestSeqRef.current[key] = next;
    return { key, seq: next };
  }

  function isLatestRequest(key, seq) {
    return requestSeqRef.current[key] === seq;
  }

  async function onToggle(permissionId, field, nextValue) {
    setErrorById((p) => ({ ...p, [permissionId]: "" }));

    setValues((prev) => ({
      ...prev,
      [permissionId]: { ...(prev[permissionId] || {}), [field]: nextValue },
    }));

    const { key, seq } = recordRequest(permissionId, field);

    const res = await updateMemberPermissions({
      vaultId,
      permissionId,
      patch: { [field]: nextValue },
    });

    if (!res?.ok) {
      if (isLatestRequest(key, seq)) {
        setValues((prev) => ({
          ...prev,
          [permissionId]: {
            ...(prev[permissionId] || {}),
            [field]: !nextValue,
          },
        }));

        setErrorById((p) => ({
          ...p,
          [permissionId]: res?.error || "Could not update permissions.",
        }));

        toast.error(res?.error || "Could not update permissions.", { id: key });
      }
      return;
    }

    if (isLatestRequest(key, seq)) {
      toast.success("Permissions updated.", { id: key });
    }
  }

  if (!members?.length) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="text-sm text-muted-fg">
          No members yet. Invite someone first, then adjust their permissions
          here.
        </div>
      </div>
    );
  }

  const activeMember =
    (members || []).find((m) => String(m.id) === String(activeId)) || null;
  const activeUser = activeMember?.users || {};
  const activeValues =
    (activeId && values?.[activeId]) ||
    (activeMember
      ? {
          can_view: safeBool(activeMember.can_view),
          transfer_coin_in: safeBool(activeMember.transfer_coin_in),
          transfer_coin_out: safeBool(activeMember.transfer_coin_out),
          transfer_treasures_in: safeBool(activeMember.transfer_treasures_in),
          transfer_treasures_out: safeBool(activeMember.transfer_treasures_out),
          transfer_valuables_in: safeBool(activeMember.transfer_valuables_in),
          transfer_valuables_out: safeBool(activeMember.transfer_valuables_out),
          sell_treasures: safeBool(activeMember.sell_treasures),
          sell_valuables: safeBool(activeMember.sell_valuables),
        }
      : null);

  const activeErr = activeId ? errorById?.[activeId] || "" : "";

  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      {/* Left column: members */}
      <div className="rounded-2xl border border-border bg-card p-3">
        <div className="px-2 pb-2 text-sm font-semibold text-fg">Members</div>

        <div className="space-y-2">
          {(members || []).map((m) => {
            const user = m.users || {};
            const id = String(m.id);
            const isActive = id === String(activeId);

            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveId(id)}
                className={[
                  "w-full rounded-2xl border p-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  isActive
                    ? "border-accent-800 bg-accent-500"
                    : "border-border bg-surface hover:bg-accent-50",
                ].join(" ")}
                aria-current={isActive ? "true" : undefined}
              >
                <div className={isActive ? "text-accent-900" : "text-fg"}>
                  <div className="truncate font-semibold">
                    {user?.name || "Member"}
                  </div>
                  <div
                    className={[
                      "truncate text-sm",
                      isActive ? "text-accent-900" : "text-muted-fg",
                    ].join(" ")}
                  >
                    {user?.email || ""}
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <div
                    className={[
                      "text-xs",
                      isActive ? "text-accent-900" : "text-muted-fg",
                    ].join(" ")}
                  >
                    {isActive ? "Editing" : "Select to edit"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right column: editor */}
      <div className="rounded-2xl border border-border bg-card p-4">
        {!activeMember ? (
          <div className="text-sm text-muted-fg">
            Select a member to edit permissions.
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3 rounded-2xl border border-accent-800 bg-accent-500 p-3">
              <div className="min-w-0">
                <div className="truncate font-semibold text-accent-900">
                  {activeUser?.name || "Member"}
                </div>
                <div className="truncate text-sm text-accent-900">
                  {activeUser?.email || ""}
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveId("")}
                className="bg-accent-100 text-accent-900 hover:bg-accent-200"
              >
                Close
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              {FIELDS.map((f) => {
                const current = Boolean(activeValues?.[f.key]);
                const toggleId = `${activeId}_${f.key}`;

                return (
                  <Toggle
                    key={toggleId}
                    name={f.key}
                    id={toggleId}
                    label={f.label}
                    hint={f.hint}
                    checked={current}
                    disabled={false}
                    className="rounded-xl border border-border bg-surface px-3 py-2"
                    onChange={(e) =>
                      onToggle(activeId, f.key, e.target.checked)
                    }
                  />
                );
              })}
            </div>

            {activeErr ? (
              <div className="mt-3 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                {activeErr}
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

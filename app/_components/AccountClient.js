// app/_components/AccountClient.js
"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import Section from "@/app/_components/Section";
import InputComponent from "@/app/_components/InputComponent";
import Select from "@/app/_components/Select";
import { Button } from "@/app/_components/Button";
import {
  deleteAccountAction,
  upsertVaultMemberPreferenceAction,
  updateProfileThemeAction,
} from "@/app/_lib/actions/account";
import { signOutAction } from "@/app/_lib/actions/auth";

function normalizeProvider(value) {
  if (!value) return "Unknown";
  const label = String(value).replace(/[_-]/g, " ");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/**
 * Render the account page client UI.
 * @param {{ user: { id: string, name: string, email: string, source?: string|null, theme_id?: string|null }, vaults: Array<{ id: string, name: string, role: string, displayName: string, themeKey: string|null }>, themes: Array<{ id: string, name: string, theme_key?: string }> }} props
 * @returns {JSX.Element}
 */
export default function AccountClient({ user, vaults, themes }) {
  const [rows, setRows] = useState(Array.isArray(vaults) ? vaults : []);
  const [busyId, setBusyId] = useState("");
  const [cancelBusy, setCancelBusy] = useState(false);
  const [profileThemeId, setProfileThemeId] = useState(
    user?.theme_id || "",
  );
  const [profileBusy, setProfileBusy] = useState(false);

  const themeOptions = useMemo(
    () => (Array.isArray(themes) ? themes : []),
    [themes],
  );

  function updateRow(vaultId, patch) {
    setRows((prev) =>
      prev.map((row) =>
        String(row.id) === String(vaultId) ? { ...row, ...patch } : row,
      ),
    );
  }

  async function handleSave(vaultId) {
    const row = rows.find((r) => String(r.id) === String(vaultId));
    if (!row) return;

    setBusyId(vaultId);
    const res = await upsertVaultMemberPreferenceAction({
      vaultId,
      displayName: row.displayName || null,
      themeKey: row.themeKey || null,
    });
    setBusyId("");

    if (!res?.ok) {
      toast.error(res?.error || "Failed to save preferences.");
      return;
    }

    toast.success("Preferences saved.");
  }

  async function handleCancelAccount() {
    const confirmed =
      typeof window !== "undefined"
        ? window.confirm(
            "Cancel your account? This removes your user record and preferences.",
          )
        : false;
    if (!confirmed) return;

    setCancelBusy(true);
    const res = await deleteAccountAction();
    setCancelBusy(false);

    if (!res?.ok) {
      toast.error(res?.error || "Could not cancel account.");
      return;
    }

    toast.success("Account cancelled.");
    await signOutAction();
  }

  async function handleProfileThemeSave() {
    setProfileBusy(true);
    const res = await updateProfileThemeAction({
      themeId: profileThemeId || null,
    });
    setProfileBusy(false);

    if (!res?.ok) {
      toast.error(res?.error || "Could not update profile theme.");
      return;
    }

    toast.success("Profile theme updated.");
  }

  return (
    <div className="p-6 max-w-5xl mx-auto text-fg space-y-6">
      <Section>
        <div className="text-sm font-semibold text-fg">Profile</div>
        <div className="grid gap-4 sm:grid-cols-2">
          <InputComponent
            label="Name"
            value={user?.name || ""}
            readOnly
            disabled
          />
          <InputComponent
            label="Email"
            value={user?.email || ""}
            readOnly
            disabled
          />
          <InputComponent
            label="Sign-in provider"
            value={normalizeProvider(user?.source)}
            readOnly
            disabled
          />
          <Select
            label="Profile theme"
            value={profileThemeId || ""}
            onChange={(e) => setProfileThemeId(e.target.value)}
          >
            <option value="">Use default</option>
            {themeOptions.map((theme) => (
              <option
                key={theme.id}
                value={theme.id}
              >
                {theme.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex justify-end">
          <Button
            type="button"
            variant="accent"
            size="sm"
            disabled={profileBusy}
            onClick={handleProfileThemeSave}
          >
            {profileBusy ? "Saving..." : "Save profile theme"}
          </Button>
        </div>
      </Section>

      <Section>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-semibold text-fg">Vault preferences</div>
          <div className="text-xs text-muted-fg">
            Set a custom display name or theme override per vault.
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="text-sm text-muted-fg">
            You are not a member of any vaults yet.
          </div>
        ) : (
          <div className="grid gap-4">
            {rows.map((row) => (
              <div
                key={row.id}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-fg">
                      {row.name}
                    </div>
                    <div className="text-xs text-muted-fg">{row.role}</div>
                  </div>
                  <Button
                    type="button"
                    variant="accent"
                    size="sm"
                    disabled={busyId === row.id}
                    onClick={() => handleSave(row.id)}
                  >
                    {busyId === row.id ? "Saving..." : "Save"}
                  </Button>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <InputComponent
                    label="Display name"
                    value={row.displayName || ""}
                    onChange={(e) =>
                      updateRow(row.id, { displayName: e.target.value })
                    }
                  />
                  <Select
                    label="Theme override"
                    value={row.themeKey || ""}
                    onChange={(e) =>
                      updateRow(row.id, { themeKey: e.target.value || "" })
                    }
                  >
                    <option value="">Use vault default</option>
                    {themeOptions.map((theme) => (
                      <option
                        key={theme.id}
                        value={theme.theme_key || ""}
                      >
                        {theme.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section className="border-danger-600 bg-danger-100 text-danger-700">
        <div className="text-sm font-semibold">Cancel account</div>
        <p className="text-sm">
          This removes your user record and membership preferences. Vaults you
          own must be deleted or transferred first.
        </p>
        <div className="pt-2">
          <Button
            type="button"
            variant="danger"
            disabled={cancelBusy}
            onClick={handleCancelAccount}
          >
            {cancelBusy ? "Cancelling..." : "Cancel account"}
          </Button>
        </div>
      </Section>
    </div>
  );
}

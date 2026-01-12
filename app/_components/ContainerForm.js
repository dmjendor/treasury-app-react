"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import InputComponent from "@/app/_components/InputComponent";

/**
 * ContainerForm
 *
 * Unified form for creating and editing containers.
 * - Renders the form fields
 * - Submits via a server action
 * - On success either closes an intercepted modal or navigates elsewhere
 */
export default function ContainerForm({
  action,
  vaultId,
  container,
  submitLabel = "Save",
  successMode = "close-modal", // "close-modal" | "navigate"
  successHref,
}) {
  const router = useRouter();
  const listId = useId();

  const initialState = { ok: false, error: null };
  const [state, formAction, isPending] = useActionState(action, initialState);

  const [defaultNames, setDefaultNames] = useState([]);
  const [loadingDefaults, setLoadingDefaults] = useState(true);

  useEffect(() => {
    if (!state?.ok) return;

    if (successMode === "close-modal") {
      router.back();
      return;
    }

    if (successMode === "navigate" && successHref) {
      router.push(successHref);
    }
  }, [state, successMode, successHref, router]);

  const defaults = {
    name: container?.name ?? "",
    is_hidden: container?.is_hidden ?? false,
  };

  // Fetch default container names (recommended approach: API route)
  useEffect(() => {
    let cancelled = false;

    async function loadDefaults() {
      try {
        setLoadingDefaults(true);

        const res = await fetch("/api/default-containers", {
          method: "GET",
          headers: { Accept: "application/json" },
        });

        if (!res.ok) throw new Error("Failed to load default containers.");

        const data = await res.json();
        const names = Array.isArray(data?.names) ? data.names : [];
        names.sort();

        if (!cancelled) setDefaultNames(names);
      } catch {
        if (!cancelled) setDefaultNames([]);
      } finally {
        if (!cancelled) setLoadingDefaults(false);
      }
    }

    loadDefaults();
    return () => {
      cancelled = true;
    };
  }, []);

  const options = useMemo(() => {
    // Deduplicate, trim, and drop empties
    const cleaned = (defaultNames || [])
      .map((s) => (typeof s === "string" ? s.trim() : ""))
      .filter(Boolean);

    return Array.from(new Set(cleaned)).slice(0, 200);
  }, [defaultNames]);

  return (
    <form
      action={formAction}
      className="space-y-6"
    >
      {/* Required for create and edit */}
      <InputComponent
        type="hidden"
        name="vault_id"
        value={vaultId}
      />
      {container?.id ? (
        <InputComponent
          type="hidden"
          name="id"
          value={container.id}
        />
      ) : null}

      <div className="space-y-1">
        <div className="text-sm font-semibold text-ink-900">Container name</div>
        <div className="mt-2">
          <InputComponent
            name="name"
            type="text"
            required
            minLength={2}
            maxLength={80}
            defaultValue={defaults.name}
            placeholder={loadingDefaults ? "Loading suggestions…" : "Backpack"}
            list={listId}
            autoComplete="off"
          />

          <datalist id={listId}>
            {options.map((name) => (
              <option
                key={name}
                value={name}
              />
            ))}
          </datalist>

          {/* Optional helper text */}
          <div className="mt-2 text-xs text-ink-700">
            Pick a suggestion or type your own.
          </div>
        </div>
      </div>

      <InputComponent
        type="checkbox"
        name="is_hidden"
        defaultChecked={defaults.is_hidden}
        label="Hidden from players"
      />

      {state?.error ? (
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-ink-800">
          {state.error}
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-primary-500 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-60"
        >
          {isPending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

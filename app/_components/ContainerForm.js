"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";

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

  const initialState = { ok: false, error: null };
  const [state, formAction, isPending] = useActionState(action, initialState);

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

  return (
    <form
      action={formAction}
      className="space-y-6"
    >
      {/* Required for create and edit */}
      <input
        type="hidden"
        name="vault_id"
        value={vaultId}
      />
      {container?.id ? (
        <input
          type="hidden"
          name="id"
          value={container.id}
        />
      ) : null}

      <div className="space-y-1">
        <div className="text-sm font-semibold text-ink-900">Container name</div>
        <div className="mt-2">
          <input
            name="name"
            required
            minLength={2}
            maxLength={80}
            defaultValue={defaults.name}
            placeholder="Bag of Holding"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-ink-900 placeholder:text-ink-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          />
        </div>
      </div>

      <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
        <input
          type="checkbox"
          name="is_hidden"
          defaultChecked={defaults.is_hidden}
          className="h-4 w-4 accent-primary-500"
        />
        <span className="text-sm text-ink-800">Hidden from players</span>
      </label>

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

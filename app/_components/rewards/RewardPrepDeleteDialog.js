/**
 * Reward prep delete dialog.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/_components/Button";
import ErrorMessage from "@/app/_components/ErrorMessage";
import { deleteRewardPrepAction } from "@/app/_lib/actions/reward-prep";

/**
 * Render the reward prep delete dialog.
 * @param {{ vaultId: string, rewardPrepId: string, rewardName?: string, isModal?: boolean }} props
 * @returns {JSX.Element}
 */
export default function RewardPrepDeleteDialog({
  vaultId,
  rewardPrepId,
  rewardName,
  isModal = false,
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const close = () => {
    if (isModal) {
      router.back();
      return;
    }
    if (vaultId) {
      router.replace(`/account/vaults/${vaultId}/preprewards`);
      return;
    }
    router.back();
  };

  const confirmDelete = async () => {
    setError("");
    setBusy(true);

    const result = await deleteRewardPrepAction({
      vaultId,
      rewardPrepId,
    });

    if (!result?.ok) {
      setError(result?.error || "Reward prep could not be deleted.");
      setBusy(false);
      return;
    }

    router.refresh();
    close();
  };

  return (
    <div className="space-y-4 p-6 text-fg">
      <div className="space-y-1">
        <div className="text-sm text-muted-fg">This can't be undone.</div>
        <div className="text-sm">
          Delete reward <span className="font-semibold">{rewardName}</span>?
        </div>
      </div>

      {error ? <ErrorMessage error={error} /> : null}

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={close}
          disabled={busy}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="danger"
          onClick={confirmDelete}
          disabled={busy}
        >
          {busy ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </div>
  );
}

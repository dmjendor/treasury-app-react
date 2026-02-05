// app/account/vaults/[vaultId]/delete/page.js
"use client";

import { useParams, useRouter } from "next/navigation";
import DeleteVault from "@/app/_components/DeleteVault";

/**
 * Render the delete vault page.
 * @returns {JSX.Element}
 */
export default function Page() {
  const router = useRouter();
  const params = useParams();

  const vaultId = params?.vaultId ? String(params.vaultId) : "";

  function handleClose() {
    if (!vaultId) {
      router.back();
      return;
    }

    router.replace(`/account/vaults/${encodeURIComponent(vaultId)}/settings`);
    router.refresh();
  }

  function handleDeleted() {
    if (typeof window !== "undefined") {
      window.location.assign("/account/vaults");
      return;
    }
    router.replace("/account/vaults");
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <DeleteVault
        vaultId={vaultId}
        onClose={handleClose}
        onDeleted={handleDeleted}
      />
    </div>
  );
}

// app/@modal/(.)account/vaults/[vaultId]/members/page.js
import Modal from "@/app/_components/Modal";
import MembersClient from "@/app/_components/MembersClient";
import { getPermissionsForVaultAction } from "@/app/_lib/actions/permissions";

/**
 * Render the members modal.
 * @param {{ params: { vaultId: string } }} props
 * @returns {Promise<JSX.Element>}
 */
export default async function Page({ params }) {
  const resolvedParams =
    typeof params?.then === "function" ? await params : params;
  const { vaultId } = resolvedParams;
  const { data, error } = await getPermissionsForVaultAction({ vaultId });
  const rows = Array.isArray(data) ? data : [];
  const members = rows.map((r) => {
    const isInvite = !r?.user_id;
    const displayName = r?.member_display_name || r?.users?.name || "";
    const email = r?.user_id ? r?.users?.email || "" : r?.email || "";

    return {
      id: r.id,
      userId: r.user_id ? String(r.user_id) : null,
      name: isInvite ? "Invited" : displayName || "Member",
      email: email,
      status: isInvite ? "invited" : "active",
      invitedAt: r.invited_at,
      acceptedAt: r.accepted_at,
    };
  });

  return (
    <Modal title="Members">
      <MembersClient
        vaultId={String(vaultId)}
        members={members}
        loadError={error || ""}
      />
    </Modal>
  );
}

import Modal from "@/app/_components/Modal";
import InviteMemberFormWithVault from "@/app/_components/InviteMemberFormWithVault";

export default async function Page({ params }) {
  const resolvedParams =
    typeof params?.then === "function" ? await params : params;
  const { vaultId } = resolvedParams;

  return (
    <Modal title="Invite member">
      <InviteMemberFormWithVault
        vaultId={vaultId}
        onCloseHref={`/account/vaults/${vaultId}/members`}
      />
    </Modal>
  );
}

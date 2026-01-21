import InviteMemberFormWithVault from "@/app/_components/InviteMemberFormWithVault";

export default async function Page({ params }) {
  const { vaultId } = params;
  return <InviteMemberFormWithVault vaultId={vaultId} />;
}

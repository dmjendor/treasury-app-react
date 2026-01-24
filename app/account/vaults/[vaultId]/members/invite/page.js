import InviteMemberFormWithVault from "@/app/_components/InviteMemberFormWithVault";

export default async function Page({ params }) {
  const resolvedParams =
    typeof params?.then === "function" ? await params : params;
  const { vaultId } = resolvedParams;

  return <InviteMemberFormWithVault vaultId={vaultId} />;
}

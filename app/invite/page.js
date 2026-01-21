import InviteClient from "@/app/_components/InviteClient";
import { verifyInviteToken } from "@/app/_lib/invite-token";
import { auth } from "@/app/_lib/auth";

export default async function Page({ searchParams }) {
  const token = searchParams?.token ? String(searchParams.token) : "";
  const verified = verifyInviteToken(token);

  const invite = verified.ok
    ? {
        ok: true,
        vaultId: String(verified.data.vault_id),
        email: String(verified.data.email),
      }
    : { ok: false, error: verified.error || "Invalid invite link." };

  const session = await auth();
  const sessionEmail = session?.user?.email ? String(session.user.email) : "";

  return (
    <InviteClient
      token={token}
      invite={invite}
      sessionEmail={sessionEmail}
    />
  );
}
g;

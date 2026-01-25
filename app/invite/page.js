import InviteClient from "@/app/_components/InviteClient";
import { verifyInviteToken } from "@/app/_lib/invite-token";
import { auth } from "@/app/_lib/auth";

/**
 * Render the invite page with server-verified token details.
 * @param {Object} props
 * @returns {Promise<JSX.Element>}
 */
export default async function Page({ searchParams }) {
  const session = await auth();
  const sessionEmail = session?.user?.email ? String(session.user.email) : "";
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const token = resolvedSearchParams?.token ? String(resolvedSearchParams.token) : "";
  const verified = verifyInviteToken(token);
  const invite = verified.ok
    ? {
        ok: true,
        vaultId: String(verified.data.vault_id),
        email: String(verified.data.email),
      }
    : { ok: false, error: verified.error || "Invalid invite link." };

  return (
    <InviteClient sessionEmail={sessionEmail} invite={invite} token={token} />
  );
}

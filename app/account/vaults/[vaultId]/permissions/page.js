import MembersPermissionsClient from "@/app/_components/MembersPermissionsClient";
import { auth } from "@/app/_lib/auth";
import { getVaultMembersWithPermissions } from "@/app/_lib/data/permissions.data";
import { getVaultById } from "@/app/_lib/data/vaults.data";

export const dynamic = "force-dynamic";

export default async function Page({ params }) {
  const resolvedParams =
    typeof params?.then === "function" ? await params : params;
  const { vaultId } = resolvedParams;
  const session = await auth();
  const userId = session?.user?.userId;

  const vault = await getVaultById(vaultId);

  if (!vault) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-5">
        <div className="rounded-2xl border border-border bg-card p-6 text-fg">
          <div className="text-base font-semibold">Vault not found</div>
          <div className="mt-2 text-sm text-muted-fg">
            This vault could not be loaded.
          </div>
        </div>
      </main>
    );
  }

  const { data: rows, error } = await getVaultMembersWithPermissions(
    vaultId,
    userId,
  );
  if (error) {
    return (
      <main className="mx-auto max-w-6xl p-5">
        <div className="rounded-2xl border border-border bg-card p-6 text-fg">
          <div className="text-base font-semibold">
            Could not load permissions
          </div>
          <div className="mt-2 text-sm text-muted-fg">
            Please try again in a moment.
          </div>
        </div>
      </main>
    );
  }

  const members = (rows || [])
    .filter((r) => r?.user_id)
    .filter((r) => String(r.user_id) !== String(vault.user_id));

  return (
    <main className="mx-auto max-w-6xl p-5">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-fg">Member permissions</h1>
        <p className="text-sm text-muted-fg">
          Toggle what each member can do inside this vault.
        </p>
      </div>

      <div className="mt-6">
        <MembersPermissionsClient
          vaultId={vaultId}
          members={members}
        />
      </div>
    </main>
  );
}

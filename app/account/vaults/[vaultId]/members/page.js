// app/(account)/vaults/[vaultId]/members/page.js
import MembersClient from "@/app/_components/MembersClient";
import { getSupabase } from "@/app/_lib/data-service";

/**
 * Members page
 * Lists people (and invites) who currently have can_view=true for this vault.
 */
export default async function Page({ params }) {
  const { vaultId } = params;

  const supabase = getSupabase();

  // Pull permissions rows and enrich with profile name (if you have profiles).
  // Adjust the join/select to match your schema (profiles table name + columns).
  const { data, error } = await supabase
    .from("permissions")
    .select(
      `
        id,
        user_id,
        email,
        can_view,
        accepted_at,
        invited_at,
        created_by,
        transfer_coin_in,
        transfer_coin_out,
        transfer_treasure_in,
        transfer_treasure_out,
        transfer_valubles_in,
        transfer_valuables_out,
        profiles:user_id (
          id,
          name,
          full_name
        )
      `,
    )
    .eq("vault_id", vaultId)
    .eq("can_view", true)
    .order("accepted_at", { ascending: false, nullsFirst: true })
    .order("invited_at", { ascending: false });

  const rows = Array.isArray(data) ? data : [];
  const members = rows.map((r) => {
    const profileName = r?.profiles?.full_name || r?.profiles?.name || "";
    const email = r?.email || "";
    const isInvite = !r?.user_id;

    return {
      id: r.id,
      userId: r.user_id ? String(r.user_id) : null,
      name: isInvite ? "Invited" : profileName || "Member",
      email: email,
      status: isInvite ? "invited" : "active",
      invitedAt: r.invited_at,
      acceptedAt: r.accepted_at,
    };
  });

  return (
    <MembersClient
      vaultId={String(vaultId)}
      members={members}
      loadError={error?.message || ""}
    />
  );
}

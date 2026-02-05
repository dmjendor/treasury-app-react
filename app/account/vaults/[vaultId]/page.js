import {
  HiOutlineBolt,
  HiOutlineClock,
  HiOutlineBookOpen,
  HiOutlineSwatch,
} from "react-icons/hi2";
import Link from "next/link";
import Card from "@/app/_components/Card";
import { LinkButton } from "@/app/_components/LinkButton";
import IconComponent from "@/app/_components/IconComponent";
import SubCard from "@/app/_components/SubCard";
import { getVaultById } from "@/app/_lib/data/vaults.data";
import { listVaultLogs } from "@/app/_lib/data/logs.data";
import {
  getInvitesByVaultId,
  getMembersByVaultId,
} from "@/app/_lib/data/permissions.data";
import { getUsersByIds } from "@/app/_lib/data/users.data";
import { getVaultMemberPreferencesForVaultAndUsers } from "@/app/_lib/data/vaultMemberPreferences.data";
import BackpackIcon from "@/app/_components/icons/BackpackIcon";
import BattleGearIcon from "@/app/_components/icons/BattleGearIcon";
import GemsIcon from "@/app/_components/icons/GemsIcon";
import { notFound } from "next/navigation";

function Panel({ title, icon: Icon, children }) {
  return (
    <Card className="rounded-2xl p-6">
      <div className="flex items-center gap-2">
        {Icon ? <Icon className="h-5 w-5 text-accent-500" /> : null}
        <h2 className="text-sm font-semibold text-fg">{title}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </Card>
  );
}

function StatCard({ label, value, icon, href }) {
  const content = (
    <Card className="rounded-2xl p-5 transition-shadow hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-fg">{label}</div>
          <div className="mt-1 text-2xl font-semibold text-fg">{value}</div>
        </div>

        <div className="rounded-xl bg-accent-600 p-2 text-accent-50">
          <IconComponent
            icon={icon}
            title={label}
            size="lg"
          />
        </div>
      </div>
    </Card>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function EmptyList({ title, hint }) {
  return (
    <SubCard className="py-4 text-sm">
      <div className="font-semibold">{title}</div>
      <div className="mt-1 text-subcard-fg/80">{hint}</div>
    </SubCard>
  );
}

function DetailCard({ icon, label, value, hint }) {
  return (
    <SubCard>
      <div className="flex items-center gap-2 text-xs text-subcard-fg/80">
        {icon ? (
          <IconComponent
            icon={icon}
            size="lg"
            variant="accent"
          />
        ) : null}
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
      {hint ? (
        <div className="mt-1 text-xs text-subcard-fg/80">{hint}</div>
      ) : null}
    </SubCard>
  );
}

export default async function VaultOverviewPage({ params }) {
  const resolvedParams =
    typeof params?.then === "function" ? await params : params;
  const { vaultId } = resolvedParams;
  const vault = await getVaultById(vaultId);
  if (!vault) notFound();

  const {
    id,
    active,
    name,
    system_id,
    theme_id,
    system,
    theme,
    containers_count,
    treasure_count,
    currencies_count,
    valuables_count,
  } = vault;

  const logsRes = await listVaultLogs({ vaultId, limit: 5 });
  const logs = logsRes?.ok && Array.isArray(logsRes.data) ? logsRes.data : [];
  const actorIds = Array.from(
    new Set(
      logs
        .map((log) => log?.actor_user_id)
        .filter((id) => id != null)
        .map((id) => String(id)),
    ),
  );
  const [users, preferences] = await Promise.all([
    actorIds.length ? getUsersByIds(actorIds) : [],
    actorIds.length
      ? getVaultMemberPreferencesForVaultAndUsers({
          vaultId,
          userIds: actorIds,
        })
      : [],
  ]);
  const userMap = new Map(
    (users || []).map((user) => [String(user.id), user]),
  );
  const prefMap = new Map(
    (preferences || []).map((pref) => [String(pref.user_id), pref]),
  );

  function resolveActorName(log) {
    const actorId = log?.actor_user_id ? String(log.actor_user_id) : "";
    const pref = actorId ? prefMap.get(actorId) : null;
    if (pref?.display_name) return pref.display_name;
    const user = actorId ? userMap.get(actorId) : null;
    if (user?.name) return user.name;
    if (log?.actor_email) return log.actor_email;
    return "Unknown";
  }

  function formatLogDate(value) {
    const date = value ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) return "";
    return date.toLocaleString();
  }

  const [membersRes, invitesRes] = await Promise.all([
    getMembersByVaultId(vaultId),
    getInvitesByVaultId(vaultId),
  ]);
  const members = Array.isArray(membersRes?.data) ? membersRes.data : [];
  const invites = Array.isArray(invitesRes?.data) ? invitesRes.data : [];
  const memberIds = Array.from(
    new Set(
      members
        .map((row) => row?.user_id)
        .filter((id) => id != null)
        .map((id) => String(id)),
    ),
  );
  const [memberUsers, memberPrefs] = await Promise.all([
    memberIds.length ? getUsersByIds(memberIds) : [],
    memberIds.length
      ? getVaultMemberPreferencesForVaultAndUsers({
          vaultId,
          userIds: memberIds,
        })
      : [],
  ]);
  const memberUserMap = new Map(
    (memberUsers || []).map((user) => [String(user.id), user]),
  );
  const memberPrefMap = new Map(
    (memberPrefs || []).map((pref) => [String(pref.user_id), pref]),
  );

  const playerRows = [
    ...members.map((row) => ({ ...row, status: "accepted" })),
    ...invites.map((row) => ({ ...row, status: "pending" })),
  ];

  function resolvePlayerName(row) {
    const userId = row?.user_id ? String(row.user_id) : "";
    const pref = userId ? memberPrefMap.get(userId) : null;
    if (pref?.display_name) return pref.display_name;
    const user = userId ? memberUserMap.get(userId) : null;
    if (user?.name) return user.name;
    return row?.email || "Unknown";
  }

  return (
    <div className="space-y-8 text-fg">
      {/* Top: quick stats */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Currencies"
          value={currencies_count}
          icon={BackpackIcon}
          href={`/account/vaults/${vaultId}/currencies`}
        />
        <StatCard
          label="Containers"
          value={containers_count}
          icon={BackpackIcon}
          href={`/account/vaults/${vaultId}/containers`}
        />
        <StatCard
          label="Treasures"
          value={treasure_count}
          icon={BattleGearIcon}
          href={`/account/vaults/${vaultId}/treasures`}
        />

        <StatCard
          label="Valuables"
          value={valuables_count}
          icon={GemsIcon}
          href={`/account/vaults/${vaultId}/valuables`}
        />
      </div>

      {/* Middle: two columns */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Recent activity"
          icon={HiOutlineClock}
        >
          <div className="space-y-3">
            {logs.length === 0 ? (
              <EmptyList
                title="No activity yet"
                hint="Once you start adding treasure, edits and changes will show up here."
              />
            ) : (
              logs.map((log) => (
                <SubCard key={log.id} className="space-y-1 text-sm">
                  <div className="font-semibold">
                    {log?.message || "Activity"}
                  </div>
                  <div className="text-xs text-subcard-fg/80">
                    {formatLogDate(log?.created_at)} · {resolveActorName(log)}
                  </div>
                </SubCard>
              ))
            )}
          </div>
        </Panel>

        <Panel
          title="Vault details"
          icon={HiOutlineBolt}
        >
          <div className="grid gap-3">
            <DetailCard
              icon={HiOutlineBookOpen}
              label="System"
              value={system?.name}
            />

            <DetailCard
              icon={HiOutlineSwatch}
              label="Theme"
              value={theme?.name}
            />

            <SubCard>
              <div className="text-xs text-subcard-fg/80">Players</div>
              {playerRows.length === 0 ? (
                <div className="mt-2 text-sm text-subcard-fg/80">
                  No players yet.
                </div>
              ) : (
                <ul className="mt-2 space-y-2 text-sm">
                  {playerRows.map((row) => {
                    const accepted = row.status === "accepted";
                    return (
                      <li
                        key={row.id}
                        className="flex items-center gap-2"
                      >
                        <span
                          className={`inline-block h-2 w-2 rounded-full ${
                            accepted ? "bg-success-500" : "bg-warning-500"
                          }`}
                          aria-hidden="true"
                        />
                        <span className="font-semibold">
                          {resolvePlayerName(row)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </SubCard>
          </div>
        </Panel>
      </div>

      {/* Bottom: next actions */}
      <Panel
        title="Next actions"
        icon={HiOutlineBolt}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <LinkButton
            href={`/account/vaults/${vaultId}/containers/new`}
            variant="primary"
          >
            Create container
          </LinkButton>

          <LinkButton
            href={`/account/vaults/${vaultId}/currencies/new`}
            variant="accent"
          >
            Add currency
          </LinkButton>

          <LinkButton
            href={`/account/vaults/${vaultId}/treasures/new`}
            variant="primary"
          >
            Add treasure
          </LinkButton>

          <LinkButton
            href={`/account/vaults/${vaultId}/settings`}
            variant="outline"
          >
            Vault settings
          </LinkButton>
        </div>

        <div className="mt-4 text-xs text-muted-fg">
          These are placeholders now. Later, you can conditionally show the best
          next step based on what&apos;s missing.
        </div>
      </Panel>
    </div>
  );
}

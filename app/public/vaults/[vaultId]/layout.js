// Public vault scoped layout.
import { ThemeScope } from "@/app/_components/ThemeScope";
import { auth } from "@/app/_lib/auth";
import { getThemeById } from "@/app/_lib/data/themes.data";
import { getUserById } from "@/app/_lib/data/users.data";
import { getVaultMemberPreferenceForUserAndVault } from "@/app/_lib/data/vaultMemberPreferences.data";
import { getVaultById } from "@/app/_lib/data/vaults.data";
import { getRouteParams } from "@/app/_lib/routing/params";
import { notFound } from "next/navigation";

/**
 * Render the public vault layout with theme scope.
 * @param {{ children: React.ReactNode, params: Promise<Record<string,string>> | Record<string,string> }} props
 * @returns {Promise<JSX.Element>}
 */
export default async function Layout({ children, params }) {
  const { vaultId } = await getRouteParams(params);
  const [vault, session] = await Promise.all([
    getVaultById(vaultId),
    auth(),
  ]);
  if (!vault) notFound();

  const userId = session?.user?.userId || null;
  const [memberPreference, profileTheme] = await Promise.all([
    userId
      ? getVaultMemberPreferenceForUserAndVault({ userId, vaultId })
      : null,
    userId
      ? (async () => {
          const user = await getUserById(userId);
          return user?.theme_id ? await getThemeById(user.theme_id) : null;
        })()
      : null,
  ]);

  if (session?.user) {
    session.user.theme_key = memberPreference?.theme_key || null;
    session.user.profile_theme_key = profileTheme?.theme_key || null;
  }

  const themeKeyValue =
    memberPreference?.theme_key ||
    profileTheme?.theme_key ||
    vault?.themeKey ||
    "night";
  const themeKey = String(themeKeyValue).startsWith("theme-")
    ? String(themeKeyValue)
    : `theme-${themeKeyValue}`;

  return <ThemeScope themeKey={themeKey}>{children}</ThemeScope>;
}

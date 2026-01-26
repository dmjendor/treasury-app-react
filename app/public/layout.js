// Public vault shell layout.
import SideNavServer from "@/app/_components/SideNavServer";

/**
 * Render the public vault shell.
 * @param {{ children: React.ReactNode }} props
 * @returns {Promise<JSX.Element>}
 */
export default async function Layout({ children }) {
  return (
    <div className="min-h-screen grid grid-cols-[16rem_1fr] gap-12">
      <SideNavServer />
      <main className="py-1">{children}</main>
    </div>
  );
}

import SideNavServer from "@/app/_components/SideNavServer";

async function Layout({ children, params }) {
  const resolvedParams =
    typeof params?.then === "function" ? await params : params;
  const vaultId = resolvedParams?.vaultId;

  return (
    <div className="min-h-screen grid grid-cols-[16rem_1fr] gap-12">
      <SideNavServer vaultId={vaultId} />
      <main className="py-1">{children}</main>
    </div>
  );
}

export default Layout;

import SideNavigation from "../_components/SideNavigation";

function Layout({ children }) {
  return (
    <div className="min-h-screen grid grid-cols-[16rem_1fr] gap-12">
      <SideNavigation />
      <main className="py-1">{children}</main>
    </div>
  );
}

export default Layout;

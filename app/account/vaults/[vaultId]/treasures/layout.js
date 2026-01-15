/**
 * Treasures layout
 * Renders the main page plus the @modal parallel route.
 */
export default function Layout({ children, modal }) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}

import { Suspense } from "react";
import Spinner from "../../_components/Spinner";
import VaultList from "../../_components/VaultList";

export const metadata = {
  title: "Vaults",
};

function page() {
  return (
    <div>
      <h1 className="text-4xl mb-5 text-accent-400 font-medium">Your Vaults</h1>
      <Suspense fallback={<Spinner />}>
        <VaultList />
      </Suspense>
    </div>
  );
}

export default page;

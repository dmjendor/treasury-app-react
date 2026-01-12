import Spinner from "@/app/_components/Spinner";
import VaultList from "@/app/_components/VaultList";
import { Suspense } from "react";

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

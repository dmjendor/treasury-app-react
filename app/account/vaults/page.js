import Spinner from "@/app/_components/Spinner";
import VaultList from "@/app/_components/VaultList";
import { Suspense } from "react";

export const metadata = {
  title: "Vaults",
};

function page() {
  return (
    <div>
      <Suspense fallback={<Spinner />}>
        <VaultList />
      </Suspense>
    </div>
  );
}

export default page;

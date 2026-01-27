import SpinnerGate from "@/app/_components/SpinnerGate";
import VaultList from "@/app/_components/VaultList";
import { Suspense } from "react";

export const metadata = {
  title: "Vaults",
};

function page() {
  return (
    <div>
      <Suspense fallback={<SpinnerGate />}>
        <VaultList />
      </Suspense>
    </div>
  );
}

export default page;

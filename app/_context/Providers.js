"use client";

import { GlobalUIProvider } from "@/app/_context/GlobalUIProvider";
import { SessionProvider } from "next-auth/react";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <GlobalUIProvider>{children}</GlobalUIProvider>
    </SessionProvider>
  );
}

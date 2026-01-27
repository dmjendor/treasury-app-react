"use client";

import { GlobalUIProvider } from "@/app/_context/GlobalUIProvider";

export default function Providers({ children }) {
  return <GlobalUIProvider>{children}</GlobalUIProvider>;
}

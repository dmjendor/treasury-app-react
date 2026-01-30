import { Geist, Geist_Mono } from "next/font/google";
import "@/app/_styles/globals.css";
import "@/app/_styles/rpg-awesome.min.css";
import Header from "./_components/Header";
import ToasterProvider from "@/app/_components/ToasterProvider";
import Providers from "@/app/_context/Providers";

export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    template: "%s - Party Treasury",
    default: "Welcome - Party Treasury",
  },
  description:
    "Track shared loot without spreadsheets or arguments. Keep a shared ledger for treasure, items, and expenses so your party always knows what happened and who has what.",
};

export default function RootLayout({ children, modal }) {
  return (
    <html lang="en">
      <body
        className={`bg-bg text-fg min-h-screen antialiased flex flex-col relative `}
      >
        <Providers>
          <Header />
          {children}
          {modal}
          <ToasterProvider />
        </Providers>
      </body>
    </html>
  );
}

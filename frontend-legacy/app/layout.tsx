import type { Metadata } from "next";
import { Geist_Mono, Roboto } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Providers } from "@/components/Providers";

const roboto = Roboto({ subsets: ["latin"], variable: "--font-sans" });

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Noteqo — Encrypted Note Workspace",
  description:
    "Securely encrypt and sync your documents across all devices with E2E encryption.",
};

import { SerwistProvider } from "./serwist";
import { AxeCore } from "@/components/AxeCore";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        roboto.variable,
        geistMono.variable,
        "font-sans",
      )}
    >
      <body className="min-h-full flex flex-col">
        <SerwistProvider
          swUrl="/sw.js"
          disable={process.env.NODE_ENV === "development"}
        >
          <AxeCore />
          <Providers>
            <TooltipProvider>{children}</TooltipProvider>
          </Providers>
        </SerwistProvider>
      </body>
    </html>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Book02Icon,
  HelpCircleIcon,
  Store01Icon,
} from "@hugeicons/core-free-icons";

export const metadata = {
  title: "Noteqo - Secure Encrypted Note Workspace",
  description:
    "Securely encrypt and sync your documents across all devices with E2E encryption.",
  keywords: [
    "E2E encryption",
    "secure notes",
    "encrypted workspace",
    "privacy-first notes",
    "offline note taking app",
    "Noteqo",
  ],
  authors: [{ name: "Noteqo Team" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://noteqo.com",
    title: "Noteqo - Secure Encrypted Note Workspace",
    description:
      "Securely encrypt and sync your documents across all devices with E2E encryption.",
    siteName: "Noteqo",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Noteqo Open Graph Image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Noteqo - Secure Encrypted Note Workspace",
    description:
      "Securely encrypt and sync your documents across all devices with E2E encryption.",
    images: ["/og-image.png"],
  },
};

export default function PublicLandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-xl tracking-tight text-primary">
              Noteqo
            </span>
          </div>
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Sign up</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-24 md:py-32 flex flex-col items-center text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Your notes, <span className="text-primary">securely</span> yours.
          </h1>
          <p className="mt-6 max-w-[600px] text-lg text-muted-foreground md:text-xl">
            End-to-end encrypted workspace for your thoughts, ideas, and
            documents. Never worry about privacy again.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/register">Get Started for Free</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              asChild
            >
              <Link href="/login">Go to Workspace</Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl border">
              <div className="p-3 bg-primary/10 rounded-full mb-4 text-primary">
                <HugeiconsIcon icon={HelpCircleIcon} size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">E2E Encryption</h3>
              <p className="text-muted-foreground">
                Your data is encrypted before it ever leaves your device. Only
                you hold the keys to your notes.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl border">
              <div className="p-3 bg-primary/10 rounded-full mb-4 text-primary">
                <HugeiconsIcon icon={Book02Icon} size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">
                Private & Shared Spaces
              </h3>
              <p className="text-muted-foreground">
                Keep personal notes secure in your private vault, or safely
                collaborate in shared encrypted spaces.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl border">
              <div className="p-3 bg-primary/10 rounded-full mb-4 text-primary">
                <HugeiconsIcon icon={Store01Icon} size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Offline First</h3>
              <p className="text-muted-foreground">
                Access and edit your notes even when you're offline. Everything
                syncs seamlessly once you're back.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row px-4">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} Noteqo. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

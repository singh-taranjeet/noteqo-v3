import {
  ShieldCheck,
  WifiOff,
  FileText,
  RefreshCw,
  Users,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

const FEATURES = [
  {
    title: "End-to-End Encrypted",
    description:
      "Your data is encrypted locally before it leaves your device. We have absolutely zero access to your notes or keys.",
    icon: <ShieldCheck className="h-6 w-6 text-primary" />,
  },
  {
    title: "Offline-First Architecture",
    description:
      "Access, create, and edit your notes without an internet connection. Everything syncs seamlessly once you are back online.",
    icon: <WifiOff className="h-6 w-6 text-primary" />,
  },
  {
    title: "Rich Document Editor",
    description:
      "A powerful block-based editor with native markdown support, tables, media embeds, and deep customization.",
    icon: <FileText className="h-6 w-6 text-primary" />,
  },
  {
    title: "Real-time Synchronization",
    description:
      "Your notes are instantly and securely synchronized across all your mobile and desktop devices in the background.",
    icon: <RefreshCw className="h-6 w-6 text-primary" />,
  },
  {
    title: "Secure Shared Spaces",
    description:
      "Create shared workspaces to collaborate with your team or family without compromising on your security standards.",
    icon: <Users className="h-6 w-6 text-primary" />,
  },
  {
    title: "Organization & Search",
    description:
      "Navigate your workspace with hierarchical folders, responsive sidebars, and a lightning-fast global search.",
    icon: <Search className="h-6 w-6 text-primary" />,
  },
];

export default function PublicLandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary overflow-hidden">
              <img
                src="/icon-192x192.png"
                alt="Noteqo Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-bold text-xl tracking-tight">Noteqo</span>
          </div>
          <nav className="flex items-center space-x-2 sm:space-x-4">
            <Button variant="ghost" className="hidden sm:inline-flex" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Sign up</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 md:pt-32 pb-20 md:pb-32">
          {/* Decorative background elements */}
          <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-background to-background" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="container relative z-10 mx-auto px-4 lg:px-8 flex flex-col items-center text-center">
            <Badge
              variant="outline"
              className="px-4 py-1.5 text-sm font-medium bg-background/50 backdrop-blur-sm mb-8 shadow-sm rounded-full"
            >
              <Sparkles className="h-4 w-4 mr-2 text-primary" />
              <span className="text-muted-foreground">
                The future of secure note-taking
              </span>
            </Badge>

            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl max-w-5xl mb-6">
              Your thoughts, <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                securely encrypted.
              </span>
            </h1>

            <p className="max-w-2xl text-lg sm:text-xl text-muted-foreground mb-10 leading-relaxed">
              End-to-end encrypted workspace for your thoughts, ideas, and
              documents. Built for speed, designed for privacy. Never worry
              about your data again.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button
                size="lg"
                className="h-12 px-8 text-base shadow-lg transition-transform hover:scale-105"
                asChild
              >
                <Link href="/register">Get Started for Free</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base bg-background/50 backdrop-blur-sm hover:bg-accent"
                asChild
              >
                <Link href="/login">Go to Workspace</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 lg:px-8 py-20 md:py-32">
          <div className="flex flex-col items-center text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Everything you need to work securely
            </h2>
            <p className="text-muted-foreground max-w-2xl text-lg">
              Noteqo combines military-grade encryption with a beautiful,
              responsive, and blazing-fast user experience.
            </p>
          </div>

          <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, index) => (
              <Card
                key={index}
                className="bg-card/50 backdrop-blur-sm border-muted hover:border-primary/50 transition-colors duration-300"
              >
                <CardHeader>
                  <div className="p-3 bg-primary/10 w-fit rounded-xl mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden border-t bg-muted/30 py-20 md:py-32">
          <div className="container relative z-10 mx-auto px-4 lg:px-8 flex flex-col items-center text-center">
            <Zap className="h-12 w-12 text-primary mb-6" />
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 max-w-3xl">
              Ready to take control of your digital privacy?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl">
              Join thousands of users who trust Noteqo to keep their most
              important ideas secure and accessible everywhere.
            </p>
            <Button size="lg" className="h-14 px-10 text-lg shadow-xl" asChild>
              <Link href="/register">Create Your Secure Account</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 bg-background">
        <div className="container mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-primary overflow-hidden">
              <img
                src="/icon-192x192.png"
                alt="Noteqo Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-semibold tracking-tight">Noteqo</span>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Noteqo. Built for privacy. All rights
            reserved.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

import {
  ShieldCheck,
  WifiOff,
  FileText,
  RefreshCw,
  Users,
  Search,
  Sparkles,
  ArrowRight,
  Check,
  Zap,
  Lock,
  Globe,
  Loader2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CollaborationMockup } from "./CollaborationMockup";
import { StatsStrip } from "./StatsStrip";
import { useFadeUpOnScroll } from "../hooks/useFadeUpOnScroll";
import { useRegister } from "@/features/auth";
import { KeysService } from "@/features/auth";
import { spaceService } from "@/features/spaces";
import { ROUTES } from "@/constants/routes.constants";
import "../landing.css";
import { useLogout } from "@/features/auth";
import { noteService } from "@/features/workspace";
import { logService } from "@/services/log.service";
const { storageService, STORAGE_KEYS } = await import("@/features/storage");

/* ─── Feature data ─── */

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
  isHero?: boolean;
}

const FEATURES: Feature[] = [
  {
    title: "Real-Time Collaboration",
    description:
      "Work together in shared spaces with live cursors, instant sync, and conflict-free editing. See your team's changes as they happen.",
    icon: <Users className="size-6" />,
    isHero: true,
  },
  {
    title: "End-to-End Encrypted",
    description:
      "Your data is encrypted on-device before it ever leaves. We have zero access to your notes or keys.",
    icon: <ShieldCheck className="size-6" />,
  },
  {
    title: "Offline-First Architecture",
    description:
      "Create, edit, and organize without an internet connection. Everything syncs seamlessly when you're back online.",
    icon: <WifiOff className="size-6" />,
  },
  {
    title: "Rich Document Editor",
    description:
      "A powerful block-based editor with markdown support, tables, media embeds, and deep customization.",
    icon: <FileText className="size-6" />,
  },
  {
    title: "Instant Sync Across Devices",
    description:
      "Your notes are securely synchronized across all your mobile and desktop devices in real-time.",
    icon: <RefreshCw className="size-6" />,
  },
  {
    title: "Organization & Search",
    description:
      "Navigate with hierarchical folders, responsive sidebars, and a lightning-fast global search.",
    icon: <Search className="size-6" />,
  },
];

const COLLAB_BULLETS = [
  {
    icon: <Users className="size-3.5" />,
    text: "Invite your team to shared spaces with role-based permissions",
  },
  {
    icon: <RefreshCw className="size-3.5" />,
    text: "See live cursors and edits from collaborators in real-time",
  },
  {
    icon: <Lock className="size-3.5" />,
    text: "All collaboration traffic is end-to-end encrypted",
  },
  {
    icon: <Globe className="size-3.5" />,
    text: "Works offline — changes merge conflict-free when you reconnect",
  },
];

/* ─── Component ─── */

export function PublicLandingView() {
  const containerRef = useFadeUpOnScroll();
  const navigate = useNavigate();
  const { mutateAsync: register } = useRegister();
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const { logout } = useLogout();

  const handleDemoClick = useCallback(async () => {
    try {
      setIsDemoLoading(true);
      await logout(false, false);

      const randomString = Math.random().toString(36).substring(7);
      const email = `demo_${randomString}@noteqo.com`;
      const password = `demoP@ssw0rd_${randomString}`;
      const name = "Demo User";

      const result = await register({
        name,
        email,
        authCredential: password,
      });

      await KeysService.store({
        accessToken: result.response.data.accessToken,
        publicKey: result.response.data.user.publicKey,
        privateKey: result.response.data.user.privateKey,
        masterKey: result.masterKey,
      });

      await storageService.put(
        STORAGE_KEYS.USER_PROFILE,
        result.response.data.user,
      );

      const newSpace = await spaceService.createSpace();

      const newNote = await noteService.createNote(
        newSpace.id,
        "Demo Note",
      );

      // Create rich demo content
      const demoContent = {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Welcome to Noteqo 🚀" }],
          },
          {
            type: "paragraph",
            content: [
              { type: "text", text: "This demo note shows how various components look in our block-based editor. Feel free to play around!" },
            ],
          },
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "1. Text Formatting" }],
          },
          {
            type: "paragraph",
            content: [
              { type: "text", text: "You can easily format text as " },
              { type: "text", marks: [{ type: "bold" }], text: "bold" },
              { type: "text", text: ", " },
              { type: "text", marks: [{ type: "italic" }], text: "italic" },
              { type: "text", text: ", " },
              { type: "text", marks: [{ type: "strike" }], text: "strikethrough" },
              { type: "text", text: ", or " },
              { type: "text", marks: [{ type: "code" }], text: "inline code" },
              { type: "text", text: "." },
            ],
          },
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "2. Callouts" }],
          },
          {
            type: "callout",
            attrs: { emoji: "💡", variant: "info" },
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Callouts are great for highlighting important information, tips, or warnings." }],
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "3. Lists & Tasks" }],
          },
          {
            type: "bulletList",
            content: [
              {
                type: "listItem",
                content: [{ type: "paragraph", content: [{ type: "text", text: "Organize your thoughts with bullet lists" }] }],
              },
              {
                type: "listItem",
                content: [{ type: "paragraph", content: [{ type: "text", text: "Keep things clear and concise" }] }],
              },
            ],
          },
          {
            type: "taskList",
            content: [
              {
                type: "taskItem",
                attrs: { checked: true },
                content: [{ type: "paragraph", content: [{ type: "text", text: "Plan the project roadmap" }] }],
              },
              {
                type: "taskItem",
                attrs: { checked: false },
                content: [{ type: "paragraph", content: [{ type: "text", text: "Execute the first phase" }] }],
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "4. Code Blocks" }],
          },
          {
            type: "codeBlock",
            attrs: { language: "typescript" },
            content: [
              { type: "text", text: "function greet(name: string) {\n  console.log(`Hello, ${name}!`);\n}\n\ngreet('Noteqo User');" },
            ],
          },
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "5. Quotes & Dividers" }],
          },
          {
            type: "blockquote",
            content: [
              { type: "paragraph", content: [{ type: "text", text: "Simplicity is the ultimate sophistication. - Leonardo da Vinci" }] },
            ],
          },
          {
            type: "horizontalRule",
          },
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "6. Interactive Blocks" }],
          },
          {
            type: "shadcnAccordion",
            attrs: { title: "Click me to expand!", isOpen: false },
            content: [
              { type: "paragraph", content: [{ type: "text", text: "You can place any content inside an accordion to keep your notes tidy." }] },
            ],
          },
        ],
      };

      await noteService.saveContentLocally(newNote.id, demoContent);

      setTimeout(() => {
        navigate(`${ROUTES.NOTES}/${newNote.id}`);
      }, 2000);
    } catch (error) {
      logService.error("Demo login failed:", error);
      setIsDemoLoading(false);
    }
  }, [register, navigate, logout]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col min-h-screen bg-background selection:bg-primary/20"
    >
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
          <div className="flex items-center space-x-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary overflow-hidden">
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
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Sign up</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* ══════════════════════════════════════════════════════
            HERO SECTION
        ══════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden pt-24 md:pt-36 pb-16 md:pb-28">
          {/* Animated gradient orbs */}
          <div className="landing-orb landing-orb-1" />
          <div className="landing-orb landing-orb-2" />
          <div className="landing-orb landing-orb-3" />

          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 z-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          <div className="container relative z-10 mx-auto px-4 lg:px-8 flex flex-col items-center text-center">
            {/* Badge */}
            <Badge
              variant="outline"
              className="landing-hero-badge px-4 py-1.5 text-sm bg-background/60 backdrop-blur-sm mb-8 shadow-sm rounded-full border-primary/30"
            >
              <Sparkles className="size-4 mr-2 text-primary" />
              <span className="text-muted-foreground">
                NEW — Real-time Collaboration is here
              </span>
            </Badge>

            {/* Headline */}
            <h1 className="landing-hero-headline text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl max-w-5xl mb-6">
              Your thoughts, <br className="hidden sm:block" />
              <span className="landing-gradient-text">securely encrypted.</span>
            </h1>

            {/* Subheadline */}
            <p className="landing-hero-subheadline max-w-2xl text-lg sm:text-xl text-muted-foreground mb-10 leading-relaxed">
              The end-to-end encrypted workspace for your ideas, documents, and
              team collaboration. Offline-first, blazing fast, and built for the
              way you work.
            </p>

            {/* CTAs */}
            <div className="landing-hero-cta flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center">
              <Button
                size="lg"
                className="h-13 px-8 text-base shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                asChild
              >
                <Link to="/register">
                  Get Started for Free
                  <ArrowRight className="size-4 ml-2" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-13 px-8 text-base transition-all duration-300 hover:scale-105 shadow-sm bg-primary/5 text-primary border-primary/30 hover:bg-primary/15 hover:border-primary/50 font-medium"
                onClick={handleDemoClick}
                disabled={isDemoLoading}
              >
                {isDemoLoading ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Zap className="mr-2 size-4 fill-primary/20" />
                )}
                Try Interactive Demo
              </Button>
            </div>

            {/* Mock editor preview */}
            <div className="landing-hero-preview top-8 md:top-14 mt-16 md:mt-20 w-full landing-hero-preview-card">
              <CollaborationMockup />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            STATS STRIP
        ══════════════════════════════════════════════════════ */}
        <div className="landing-section-divider" />
        <section className="container mx-auto px-4 lg:px-8 py-6 md:py-8">
          <div className="landing-fade-up">
            <StatsStrip />
          </div>
        </section>
        <div className="landing-section-divider" />

        {/* ══════════════════════════════════════════════════════
            FEATURES — BENTO GRID
        ══════════════════════════════════════════════════════ */}
        <section className="container mx-auto px-4 lg:px-8 py-20 md:py-32">
          <div className="flex flex-col items-center text-center mb-16 landing-fade-up">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Everything you need to{" "}
              <span className="landing-gradient-text">work securely</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl text-lg">
              Military-grade encryption meets a beautiful, responsive, and
              blazing-fast user experience.
            </p>
          </div>

          <div className="landing-bento-grid landing-fade-up-stagger">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className={`landing-feature-card landing-fade-up ${feature.isHero ? "landing-bento-hero" : ""}`}
              >
                <div className="landing-feature-icon">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-[0.95rem] leading-relaxed">
                  {feature.description}
                </p>
                {feature.isHero && (
                  <Badge
                    variant="outline"
                    className="mt-4 bg-primary/10 border-primary/30 text-primary text-xs"
                  >
                    <Sparkles className="size-3 mr-1" />
                    New Feature
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            COLLABORATION SHOWCASE
        ══════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden py-20 md:py-32 bg-muted/20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="landing-collab-section">
              {/* Left — copy */}
              <div className="landing-fade-up">
                <Badge
                  variant="outline"
                  className="mb-6 bg-primary/10 border-primary/30 text-primary rounded-full text-xs px-3 py-1"
                >
                  <Users className="size-3 mr-1.5" />
                  Collaboration
                </Badge>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                  Work together,{" "}
                  <span className="landing-gradient-text">in real time</span>
                </h2>
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed max-w-lg">
                  Invite your team into shared, encrypted spaces. See live
                  cursors, edits, and comments — all without sacrificing
                  privacy.
                </p>

                <div className="space-y-1">
                  {COLLAB_BULLETS.map((bullet) => (
                    <div key={bullet.text} className="landing-collab-bullet">
                      <div className="landing-collab-bullet-icon">
                        <Check className="size-3.5" />
                      </div>
                      <p className="text-sm text-foreground/90 leading-relaxed">
                        {bullet.text}
                      </p>
                    </div>
                  ))}
                </div>

                <Button
                  size="lg"
                  className="mt-8 h-12 px-8 shadow-lg transition-all duration-300 hover:scale-105"
                  asChild
                >
                  <Link to="/register">
                    Start Collaborating
                    <ArrowRight className="size-4 ml-2" />
                  </Link>
                </Button>
              </div>

              {/* Right — mock editor */}
              <div className="landing-fade-up">
                <CollaborationMockup />
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            CTA SECTION
        ══════════════════════════════════════════════════════ */}
        <section className="landing-cta-section relative border-t py-24 md:py-36">
          <div className="landing-cta-glow" />

          <div className="container relative z-10 mx-auto px-4 lg:px-8 flex flex-col items-center text-center landing-fade-up">
            <Zap className="size-12 text-primary mb-6" />
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 max-w-4xl">
              Ready to take control of your{" "}
              <span className="landing-gradient-text">digital privacy</span>?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
              Join thousands of users who trust Noteqo to keep their most
              important ideas secure, synced, and accessible everywhere.
            </p>
            <div className="landing-cta-button">
              <Button
                size="lg"
                className="h-14 px-10 text-lg shadow-xl transition-all duration-300 hover:scale-105"
                asChild
              >
                <Link to="/register">
                  Create Your Secure Account
                  <ArrowRight className="size-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t py-10 bg-background">
        <div className="container mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex size-5 items-center justify-center rounded bg-primary overflow-hidden">
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
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="#" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="#" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

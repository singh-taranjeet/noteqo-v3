import { PublicLandingView } from "@/features/landing";

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
  return <PublicLandingView />;
}

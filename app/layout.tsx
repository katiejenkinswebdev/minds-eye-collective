import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import "./tokens.css";
import "./theme.css";
import "./globals.css";

// No webfonts: BRAND.md pins the stack to Helvetica Neue with system fallbacks.

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: SITE.title,
  description: SITE.description,
  icons: {
    icon: [{ url: "/logos/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    url: SITE.url,
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

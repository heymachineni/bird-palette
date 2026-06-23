import type { Metadata } from "next";
import { Suspense } from "react";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { ToastProvider } from "@/components/ui/toast";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Bird Palette",
    template: "%s — Bird Palette",
  },
  description: "Color inspiration from nature.",
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon-32.png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "Bird Palette",
    description: "Color inspiration from nature.",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1024,
        height: 682,
        alt: "Bird Palette — color inspiration from nature",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bird Palette",
    description: "Color inspiration from nature.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <body className="min-h-screen antialiased">
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        <ToastProvider>
          <SiteHeader />
          <main>{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}

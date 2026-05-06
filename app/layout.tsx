import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { generateWebSiteSchema, generateOrganizationSchema } from "@/lib/seo/schema";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aiscribe.dev";
const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "AIScribe";
const siteDesc = process.env.NEXT_PUBLIC_SITE_DESCRIPTION ?? "AI-powered tech blog";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${siteName} — AI-Powered Tech Blog`, template: `%s | ${siteName}` },
  description: siteDesc,
  keywords: ["AI", "Technology", "Machine Learning", "Web Development", "Tutorials"],
  authors: [{ name: "AIScribe Team", url: siteUrl }],
  creator: "AIScribe",
  publisher: "AIScribe",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName,
    title: `${siteName} — AI-Powered Tech Blog`,
    description: siteDesc,
    images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: siteName }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} — AI-Powered Tech Blog`,
    description: siteDesc,
    images: ["/og-default.jpg"],
    creator: "@aiscribe",
  },
  alternates: { canonical: siteUrl },
  verification: { google: "" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const websiteSchema = generateWebSiteSchema();
  const orgSchema = generateOrganizationSchema();

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
      </head>
      <body className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

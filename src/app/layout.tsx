import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nutm-nexus.vercel.app";
const description =
  "Notes, past exams, assignments and quizzes for NUTM courses — organised by department, level and cohort.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NUTM Nexus — course materials, past papers & quizzes",
    template: "%s · NUTM Nexus",
  },
  description,
  applicationName: "NUTM Nexus",
  openGraph: {
    type: "website",
    siteName: "NUTM Nexus",
    url: siteUrl,
    title: "NUTM Nexus",
    description: "Every NUTM course's notes, past papers and quizzes in one place.",
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: "NUTM Nexus",
    description: "Every NUTM course's notes, past papers and quizzes in one place.",
  },
};

import AuthProvider from "@/components/auth/AuthProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans bg-background text-foreground flex flex-col min-h-screen bg-grid-pattern`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <Navbar />
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-8 flex-grow">
            {children}
          </main>
          <Footer />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}

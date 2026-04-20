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

export const metadata: Metadata = {
  title: "NUTM Nexus — Peer-2-Peer Tutorial",
  description: "The official platform of NUTM's Peer-2-Peer Tutorial. Access course materials, study resources, and interactive quizzes.",
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

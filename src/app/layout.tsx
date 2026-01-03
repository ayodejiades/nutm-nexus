import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import Link from "next/link";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "NUTM Nexus",
  description: "Your NUTM Course Hub",
};

const SiteFooter = () => {
  const linkStyle =
    "text-sm text-foreground/70 hover:text-primary transition-colors";
  return (
    <footer className="border-t border-white/5 mt-16 bg-black/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <Link
              href="/"
              className="text-xl font-bold text-primary hover:opacity-90 transition-opacity flex-shrink-0 mb-4 inline-block"
            >
              NUTM Nexus
            </Link>
            <p className="text-sm text-foreground/50 leading-relaxed max-w-xs">
              Providing students with a centralized, modern platform for
              academic resources.
            </p>
            <p className="mt-6 text-xs text-foreground/40">
              © {new Date().getFullYear()} NUTM Nexus. Made by Ayodeji.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground/90 mb-4 text-sm uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className={linkStyle}>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className={linkStyle}>
                  About
                </Link>
              </li>
              <li>
                <Link href="/team" className={linkStyle}>
                  Team
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground/90 mb-4 text-sm uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://nutm.edu.ng/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkStyle}
                >
                  Official Site
                </a>
              </li>
              <li>
                <a href="#" className={linkStyle}>
                  Resource Disclaimer
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans bg-background text-foreground flex flex-col min-h-screen`}
      >
        <Navbar />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-8 flex-grow">
          {children}
        </main>
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}

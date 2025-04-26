import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NUTM Nexus",
  description: "Your NUTM Course Hub",
};

const SiteFooter = () => {
  const linkStyle = "text-sm text-foreground/70 dark:text-foreground/60 hover:text-primary dark:hover:text-primary-light transition-colors";
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="text-lg font-bold text-primary hover:opacity-90 transition-opacity flex-shrink-0 mb-2 inline-block">
              NUTM Nexus
            </Link>
            <p className="text-xs text-foreground/60 dark:text-foreground/50">
              © {new Date().getFullYear()} NUTM Nexus.
              <br />
              Made by <Link href="https://ayodejiades.vercel.app/" className={linkStyle}>Ayodeji</Link>.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground/90 dark:text-foreground/80 mb-3 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/" className={linkStyle}>Home</Link></li>
              <li><Link href="/about" className={linkStyle}>About</Link></li>
              <li><Link href="/team" className={linkStyle}>Team</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground/90 dark:text-foreground/80 mb-3 text-sm uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2">
              <li><a href="https://nutm.edu.ng/" target="_blank" rel="noopener noreferrer" className={linkStyle}>NUTM Website</a></li>
              <li><a href="#" className={linkStyle}>Report an Issue</a></li>
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
      <body className={`${inter.className} bg-background text-foreground flex flex-col min-h-screen`}>
        <Navbar />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 flex-grow">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
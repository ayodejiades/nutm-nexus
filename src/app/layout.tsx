// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NUTM Nexus",
  description: "Your NUTM Course Hub",
  // metadataBase: new URL('https://your-deployment-url.com'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="text-center py-4 mt-8 text-foreground/70 dark:text-foreground/50 text-sm">
            © {new Date().getFullYear()} NUTM Nexus. Made by <a href="https://ayodejiades.vercel.app/" target="_blank" rel="noopener noreferrer" className="font-medium text-primary dark:text-primary-light underline hover:text-primary-dark dark:hover:text-primary transition-colors">Ayodeji</a>.
          </footer>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
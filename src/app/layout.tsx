import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar"; // Import Navbar
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NUTM Nexus",
  description: "Your NUTM Course Hub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider> {/* Wrap everything inside AuthProvider */}
          <Navbar />
          <main className="container mx-auto px-6 py-8">
            {children}
          </main>
          <footer className="text-center py-4 mt-8 text-gray-500 text-sm">
            © {new Date().getFullYear()} NUTM Nexus. Made by Ayodeji.
          </footer>
        </AuthProvider> {/* Close AuthProvider */}
      </body>
    </html>
  );
}
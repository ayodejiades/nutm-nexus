"use client";

import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="fixed w-full top-0 z-50 bg-[#151a21] border-b border-white/5 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                <Image
                  src="/nexus-icon.png"
                  alt="Nexus"
                  width={28}
                  height={28}
                  className="h-7 w-auto"
                  priority
                />
              </div>
              <span className="text-xl font-bold text-primary tracking-tight">
                NUTM Nexus
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-8">
            <Link
              href="/about"
              className="text-sm font-medium text-foreground/70 hover:text-white transition-colors"
            >
              About
            </Link>
            <Link
              href="/team"
              className="text-sm font-medium text-foreground/70 hover:text-white transition-colors"
            >
              Team
            </Link>
            <Link
              href="https://nutm.edu.ng/"
              target="_blank"
              className="hidden sm:block text-xs font-bold px-4 py-2 border border-primary/30 text-primary hover:bg-primary hover:text-white rounded-md transition-all"
            >
              NUTM SITE
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

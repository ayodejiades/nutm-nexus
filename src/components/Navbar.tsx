"use client";

import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="fixed w-full top-0 z-50 glass-nav border-b border-white/5 transition-all duration-300">
      <div className="section-container">
        <div className="flex justify-between items-center h-20">
          {/* Logo Section */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="bg-primary/20 p-2 rounded-xl group-hover:bg-primary/30 transition-all duration-300 transform group-hover:scale-110">
                <Image
                  src="/nexus-icon.png"
                  alt="Nexus"
                  width={28}
                  height={28}
                  className="h-7 w-auto"
                  priority
                />
              </div>
              <div className="flex flex-col -space-y-1">
                <span className="text-xl font-black text-white tracking-tighter uppercase">
                  NUTM
                </span>
                <span className="text-xs font-bold text-primary tracking-[0.2em] uppercase">
                  Nexus
                </span>
              </div>
            </Link>

            {/* Main Navigation */}
            <div className="hidden md:flex items-center space-x-6 border-l border-white/10 pl-8">
              <Link
                href="/"
                className="text-sm font-bold text-foreground/60 hover:text-primary transition-colors uppercase tracking-wider"
              >
                Browse
              </Link>
              <Link
                href="/about"
                className="text-sm font-bold text-foreground/60 hover:text-primary transition-colors uppercase tracking-wider"
              >
                About
              </Link>
              <Link
                href="/team"
                className="text-sm font-bold text-foreground/60 hover:text-primary transition-colors uppercase tracking-wider"
              >
                Team
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

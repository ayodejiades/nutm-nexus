// src/components/Navbar.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ThemeSwitcher } from './ThemeSwitcher';

export default function Navbar() {
  const secondaryLinkClasses = "text-sm font-medium text-foreground/80 hover:text-primary dark:text-foreground/70 dark:hover:text-white transition-colors duration-150";

  return (
    // Explicitly set solid backgrounds for light/dark mode for debugging
    // Remove bg-background temporarily
    <nav className="fixed w-full top-0 z-50 text-foreground shadow-sm border-b border-gray-200 dark:border-gray-800 transition-colors duration-300 bg-white dark:bg-[#151a21]"> {/* Explicit fallback colors */}
    {/*  ^-- Applied bg-white dark:bg-[#151a21] directly (example dark HSL 220 15% 12%) */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Left Section: Logo + Text */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <Image
                src="/nexus-icon.png" // Ensure path is correct
                alt="Nexus Icon"
                width={32} height={32}
                className="h-8 w-auto group-hover:opacity-90 transition-opacity"
                priority
              />
              <span className="text-xl font-bold text-primary group-hover:opacity-90 transition-opacity flex-shrink-0">
                NUTM Nexus
              </span>
            </Link>
          </div>

          {/* Right Section: Nav + Theme */}
          <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-6">
             <Link href="/about" className={secondaryLinkClasses}>About</Link>
             <Link href="/team" className={secondaryLinkClasses}>Team</Link>
             <ThemeSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
}
"use client"; 

import Link from 'next/link';
import { ThemeSwitcher } from './ThemeSwitcher'; 

export default function Navbar() {
  const secondaryLinkClasses = "text-sm font-medium text-foreground/80 hover:text-primary dark:text-foreground/70 dark:hover:text-white transition-colors duration-150";

  return (
    <nav className="bg-background text-foreground shadow-sm sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Left Section: Logo Only */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary hover:opacity-90 transition-opacity flex-shrink-0">
              NUTM Nexus
            </Link>
          </div>

          {/* Right Section: Nav Links + Theme Toggle */}
          <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-6">

            {/* Navigation Links */}
             <Link href="/about" className={secondaryLinkClasses}>
              About
            </Link>
            <Link href="/team" className={secondaryLinkClasses}>
              Team
            </Link>

            {/* Theme Toggle Button */}
             <ThemeSwitcher />

             {/* REMOVED Divider and Auth Buttons/Status Section */}

          </div>
        </div>
      </div>
    </nav>
  );
}
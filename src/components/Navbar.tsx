"use client";

import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/images/nexus-icon.png";
import { useState } from "react";

import { useSession, signOut } from "next-auth/react";
import { UserCircleIcon, ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed w-full top-0 z-50 bg-background border-b border-white/5 transition-all duration-300">
      <div className="section-container">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo Section */}
          <div className="flex items-center gap-4 sm:gap-8">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group">
              <div className="transition-all duration-300 transform group-hover:scale-110">
                <Image
                  src={logo}
                  alt="Nexus"
                  className="h-6 sm:h-7 w-auto"
                  priority
                />
              </div>
              <div className="flex flex-col -space-y-1">
                <span className="text-lg sm:text-xl font-black text-white tracking-tighter uppercase">
                  NUTM
                </span>
                <span className="text-[9px] sm:text-xs font-bold text-primary tracking-[0.2em] uppercase">
                  Nexus
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
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

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {session && (
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-black text-white">{session.user?.name}</span>
                </div>
                <div className="relative group/user">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-white/10 group-hover/user:border-primary/50 transition-colors cursor-pointer">
                    {session.user?.image ? (
                      <Image src={session.user.image} alt={session.user.name || "User"} width={40} height={40} />
                    ) : (
                      <UserCircleIcon className="w-full h-full text-foreground/20" />
                    )}
                  </div>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-surface-1 border border-white/5 rounded-2xl p-2 shadow-2xl opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all duration-300 transform translate-y-2 group-hover/user:translate-y-0 z-50">
                    <div className="p-3 border-b border-white/5 mb-2">
                       <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Signed in as</p>
                       <p className="text-xs font-bold text-white truncate">{session.user?.email}</p>
                    </div>
                    <button
                      onClick={() => signOut()}
                      className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-foreground/60 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-foreground/50 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 py-4 space-y-1 animate-fade-in">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-sm font-bold text-foreground/60 hover:text-primary hover:bg-white/5 rounded-xl transition-all uppercase tracking-wider"
            >
              Browse
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-sm font-bold text-foreground/60 hover:text-primary hover:bg-white/5 rounded-xl transition-all uppercase tracking-wider"
            >
              About
            </Link>
            <Link
              href="/team"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-sm font-bold text-foreground/60 hover:text-primary hover:bg-white/5 rounded-xl transition-all uppercase tracking-wider"
            >
              Team
            </Link>
            {session && (
              <button
                onClick={() => { signOut(); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-3 text-sm font-bold text-red-400/60 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all uppercase tracking-wider"
              >
                Sign Out
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/images/nexus-icon.png";
import {
  GlobeAltIcon,
  AcademicCapIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const linkStyle = "text-sm text-foreground/50 hover:text-primary transition-all hover:translate-x-1 flex items-center gap-2 group/link";
  const headerStyle = "text-[10px] font-black text-white uppercase tracking-[0.3em] mb-6 flex items-center gap-3";

  return (
    <footer className="relative border-t border-white/5 mt-20 bg-surface-1/30 backdrop-blur-xl overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">

          {/* Column 1: Academic Identity (Larger span) */}
          <div className="lg:col-span-5 space-y-6">
            <Link href="/" className="flex items-center space-x-3 group w-fit">
              <div className="transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3">
                <Image
                  src={logo}
                  alt="Nexus"
                  className="h-7 w-auto"
                />
              </div>
              <div className="flex flex-col -space-y-1">
                <span className="text-xl font-black text-white tracking-tighter uppercase leading-none">NUTM</span>
                <span className="text-[11px] font-bold text-primary tracking-[0.25em] uppercase leading-none mt-1">Nexus</span>
              </div>
            </Link>
            <p className="text-sm text-foreground/50 leading-relaxed max-w-sm font-medium">
              The official academic resource platform of NUTM&apos;s Peer-2-Peer Tutorial Club. Empowering students through collective intelligence.
            </p>
          </div>

          {/* Column 2: Quick Navigation */}
          <div className="lg:col-span-3">
            <h4 className={headerStyle}>
              <div className="w-9 h-9 rounded-lg bg-transparent flex items-center justify-center border border-primary/20">
                <InformationCircleIcon className="w-5 h-5 text-primary" />
              </div>
              Navigation
            </h4>
            <ul className="space-y-4">
              <li>
                <Link href="/" className={linkStyle}>
                  <div className="w-1 h-1 rounded-full bg-primary/40 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className={linkStyle}>
                  <div className="w-1 h-1 rounded-full bg-primary/40 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                  About Nexus
                </Link>
              </li>
              <li>
                <Link href="/team" className={linkStyle}>
                  <div className="w-1 h-1 rounded-full bg-primary/40 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                  The Team
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Academic Portals */}
          <div className="lg:col-span-4">
            <h4 className={headerStyle}>
              <div className="w-9 h-9 rounded-lg bg-transparent flex items-center justify-center border border-primary/20">
                <GlobeAltIcon className="w-5 h-5 text-primary" />
              </div>
              Official Portals
            </h4>
            <ul className="space-y-4">
              <li>
                <a href="https://nutm.edu.ng/" target="_blank" rel="noopener noreferrer" className={linkStyle}>
                  <div className="w-1 h-1 rounded-full bg-accent/40 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                  Official NUTM Website
                </a>
              </li>
              <li>
                <a href="https://nutm.edu.ng/elearn/" target="_blank" rel="noopener noreferrer" className={linkStyle}>
                  <div className="w-1 h-1 rounded-full bg-accent/40 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                  E-Learning Platform
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold text-foreground/20 uppercase tracking-[0.3em]">
            © {currentYear} NUTM NEXUS. Developed by <span className="text-primary/60 hover:text-white transition-colors cursor-default">Ayodeji Adesegun</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

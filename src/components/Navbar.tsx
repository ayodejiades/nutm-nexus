// src/components/Navbar.tsx
"use client";

import Link from 'next/link';
import { useSession, signIn, signOut } from "next-auth/react";
import Image from 'next/image';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  // Green button styling
  const greenButtonClasses = "bg-primary-dark text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-primary-light transition duration-150 ease-in-out disabled:opacity-70 shadow-sm";
  const secondaryLinkClasses = "text-sm font-medium text-gray-700 hover:text-primary transition-colors duration-150";


  return (
    // Changed background to white, added bottom border
    <nav className="bg-white text-foreground shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Increased height slightly */}
        <div className="flex justify-between items-center h-16">

          {/* Left Section: Logo + Main Nav */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-xl font-bold text-primary hover:opacity-90 transition-opacity">
              NUTM Nexus
            </Link>
            {/* Example placeholder nav link */}
            {/* <Link href="/explore" className={secondaryLinkClasses}>
              Explore
            </Link> */}
          </div>

          {/* Center Section: Search Bar (Placeholder) */}
          <div className="flex-1 px-4 lg:px-8 hidden sm:block"> {/* Hide on small screens */}
            <div className="relative">
              <input
                type="search"
                placeholder="Search courses..." // Placeholder text
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-full bg-gray-50 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                // Search functionality is not implemented yet
                disabled
              />
               <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Right Section: Secondary Nav + Auth */}
          <div className="flex items-center space-x-4">
            <Link href="/about" className={secondaryLinkClasses}>
              About
            </Link>

            {/* Auth Buttons */}
            <div className="flex items-center">
              {isLoading ? (
                 // More subtle loading indicator for buttons
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
                    {/* Add skeleton for avatar if needed */}
                </div>
              ) : session ? (
                // User is logged in
                <div className="flex items-center space-x-3">
                   {session.user?.image && (
                     <Image
                        src={session.user.image}
                        alt={session.user.name || 'User avatar'}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full border border-gray-300"
                        unoptimized={true}
                     />
                   )}
                   {/* <span className="hidden md:inline text-sm font-medium text-gray-700">
                      {session.user?.name?.split(' ')[0] || session.user?.email}
                   </span> */}
                   <button
                     onClick={() => signOut()}
                     className={greenButtonClasses} // Use defined GREEN button classes
                     disabled={isLoading}
                   >
                     Sign Out
                   </button>
                </div>
              ) : (
                // User is logged out
                <div className="flex items-center space-x-2">
                    {/* Optional "Log In" Text Button if needed */}
                    {/* <button onClick={() => signIn('github')} className={secondaryLinkClasses}>Log In</button> */}
                    <button
                        onClick={() => signIn('github')}
                        className={greenButtonClasses} // Use defined GREEN button classes
                        disabled={isLoading}
                    >
                        Sign In {/* Changed from "Join for Free" */}
                    </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
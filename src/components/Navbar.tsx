"use client";

import Link from 'next/link'; // Ensure Link is imported
import { useSession, signIn, signOut } from "next-auth/react";
import Image from 'next/image';

export default function Navbar() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const buttonClasses = "bg-primary text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-white transition duration-150 ease-in-out disabled:opacity-70";

  return (
    <nav className="bg-primary text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4"> {/* Group Brand and About Link */}
            <Link href="/" className="text-xl font-bold hover:opacity-90 transition-opacity">
              NUTM Nexus
            </Link>
            <Link href="/about" className="text-sm font-medium hover:opacity-90 transition-opacity">
              About {/* Add the About link here */}
            </Link>
          </div>
          <div className="flex items-center">
            {/* ... (Authentication Buttons - No changes here) ... */}
             {isLoading ? (
               <div className="w-20 h-8 bg-white bg-opacity-30 rounded animate-pulse"></div>
             ) : session ? (
               <div className="flex items-center space-x-3 sm:space-x-4">
                  {session.user?.image && (
                    <Image
                       src={session.user.image}
                       alt={session.user.name || 'User avatar'}
                       width={32}
                       height={32}
                       className="w-8 h-8 rounded-full border-2 border-white border-opacity-50"
                       unoptimized={true}
                    />
                  )}
                  <span className="hidden sm:inline text-sm font-medium">
                     {session.user?.name?.split(' ')[0] || session.user?.email}
                  </span>
                  <button onClick={() => signOut()} className={buttonClasses} disabled={isLoading}>
                    Sign Out
                  </button>
               </div>
             ) : (
               <button onClick={() => signIn('github')} className={buttonClasses} disabled={isLoading}>
                 Sign In with GitHub
               </button>
             )}
          </div>
        </div>
      </div>
    </nav>
  );
}
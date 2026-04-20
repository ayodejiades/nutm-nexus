"use client";

import React from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const ERROR_MESSAGES: Record<string, string> = {
  OAuthSignin: "Could not start the sign-in process. Please try again.",
  OAuthCallback: "Google sign-in was interrupted. Please try again.",
  OAuthCreateAccount: "Could not create your account. Please contact support.",
  OAuthAccountNotLinked: "This email is already linked to another account.",
  Callback: "Something went wrong during sign-in. Please try again.",
  AccessDenied: "Access denied. You may not have permission to sign in.",
  default: "An unexpected error occurred. Please try again.",
};

export default function LoginPage() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const errorMessage = errorParam
    ? ERROR_MESSAGES[errorParam] || ERROR_MESSAGES.default
    : null;

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full animate-pulse" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="bg-surface-1/40 backdrop-blur-2xl border border-white/5 rounded-[2rem] sm:rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-black/50 text-center">

          {/* Logo Section */}
          <div className="flex flex-col items-center mb-8 sm:mb-10">
            <div className="transition-all duration-300 transform hover:scale-110 mb-5">
              <Image
                src="/nexus-icon.png"
                alt="Nexus"
                width={48}
                height={48}
                className="w-12 h-12"
              />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase mb-2">
              NUTM <span className="text-primary">Nexus</span>
            </h1>
          </div>

          <div className="space-y-6">
            {/* Auth Error Banner */}
            {errorMessage && (
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-left animate-fade-in">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-400">Sign-in Failed</p>
                  <p className="text-xs text-red-400/70 mt-1">{errorMessage}</p>
                </div>
              </div>
            )}

            <div className="text-left space-y-2 mb-8">
              <h2 className="text-xl font-bold text-white tracking-tight">Welcome</h2>
              <p className="text-sm text-foreground/50 font-medium">
                Sign in with your Google account to access peer tutoring resources, study groups, and exclusive course materials.
              </p>
            </div>

            {/* Google Sign In Button */}
            <button
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="w-full h-14 bg-white hover:bg-white/90 text-black rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-4 group shadow-xl shadow-white/5 active:scale-95 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign In
            </button>

            <div className="pt-6 border-t border-white/5">
              <p className="text-[10px] text-foreground/20 leading-relaxed font-medium">
                By signing in, you agree to the NUTM Peer-2-Peer Tutorial  Guidelines and Nexus Community Standards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

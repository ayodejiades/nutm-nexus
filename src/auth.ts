import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ account, profile }: any) {
      if (account?.provider === "google") {
        return true;
      }
      return true;
    },
    async session({ session }: any) {
      return session;
    },
    authorized({ auth, request }: any) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      // Allow access to login page and auth API routes without authentication
      const isPublicRoute = pathname.startsWith("/login") || pathname.startsWith("/api/auth");

      if (isPublicRoute) return true;
      if (isLoggedIn) return true;

      // Redirect unauthenticated users to login
      return false;
    },
  },
});

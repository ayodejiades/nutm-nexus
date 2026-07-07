import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
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
      if (account?.provider !== "google") return false;
      // Only allow verified NUTM accounts. Domains are configurable via env
      // (comma-separated); default covers nutm.edu.ng and any subdomain
      // (e.g. student.nutm.edu.ng). Add your own domain locally to test.
      if (profile?.email_verified === false) return false;
      const allowed = (process.env.ALLOWED_EMAIL_DOMAINS ?? "nutm.edu.ng")
        .split(",")
        .map((d: string) => d.trim().toLowerCase())
        .filter(Boolean);
      const domain = String(profile?.email ?? "").toLowerCase().split("@")[1];
      if (!domain) return false;
      return allowed.some((d: string) => domain === d || domain.endsWith(`.${d}`));
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

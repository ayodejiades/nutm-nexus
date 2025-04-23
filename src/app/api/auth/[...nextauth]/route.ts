import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"

if (!process.env.GITHUB_ID || !process.env.GITHUB_SECRET) {
    throw new Error("GitHub OAuth credentials (GITHUB_ID, GITHUB_SECRET) are not set in environment variables.");
}
if (!process.env.NEXTAUTH_SECRET) {
    console.warn("WARN: NEXTAUTH_SECRET environment variable is not set. Generating a temporary one for development. SET THIS IN PRODUCTION!");
}

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    // Add other providers if needed
  ],
  // Optional: Add callbacks for custom logic (e.g., saving user to db)
  // callbacks: {
  //   async jwt({ token, account }) { ... }
  //   async session({ session, token, user }) { ... }
  // }
  secret: process.env.NEXTAUTH_SECRET, // For JWT signing/encryption
  // Optional: Configure session strategy (jwt is default)
  // session: {
  //   strategy: "jwt",
  // }
  // Optional: Add custom pages
  // pages: {
  //   signIn: '/auth/signin', // Example custom sign-in page
  // }
})

export { handler as GET, handler as POST }
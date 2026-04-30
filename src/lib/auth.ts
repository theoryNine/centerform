import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import Credentials from "next-auth/providers/credentials";
import { SupabaseAdapter } from "@auth/supabase-adapter";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.RESEND_FROM_EMAIL,
    }),
    // Dev-only: allows sign-in without a real email/magic link in local development.
    // Remove or disable in production.
    ...(process.env.NODE_ENV === "development"
      ? [
          Credentials({
            name: "Dev Credentials",
            credentials: {
              email: { label: "Email", type: "email" },
              password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
              if (credentials?.email && credentials?.password) {
                return {
                  id: "00000000-0000-0000-0000-000000000001",
                  email: credentials.email as string,
                  name: "Dev User",
                };
              }
              return null;
            },
          }),
        ]
      : []),
  ],
  pages: {
    signIn: "/sign-in",
    verifyRequest: "/invite/check-email",
    error: "/invite/error",
  },
  session: {
    // JWT strategy: adapter handles verification token persistence for magic link,
    // but sessions are stored client-side as JWTs (no sessions table needed).
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isDashboard = nextUrl.pathname.startsWith("/dashboard");
      if (isDashboard && !isLoggedIn) {
        return false;
      }
      return true;
    },
  },
});

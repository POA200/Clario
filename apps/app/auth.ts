import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  secret:
    process.env.NEXTAUTH_SECRET ||
    process.env.AUTH_SECRET ||
    "clario-jwt-secret-key-2026",
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 365 * 24 * 60 * 60, // 365 days persistent session
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production" &&
        process.env.NEXTAUTH_URL?.startsWith("https")
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure:
          process.env.NODE_ENV === "production" &&
          process.env.NEXTAUTH_URL?.startsWith("https"),
        maxAge: 365 * 24 * 60 * 60,
      },
    },
  },
  pages: { signIn: "/login" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      if (!token.id && token.sub) {
        token.id = token.sub;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || (token.sub as string) || "";
      }

      return session;
    },
  },

  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials.password) {
            console.error("[Auth] Missing credentials");
            return null;
          }

          const email = credentials.email.toLowerCase().trim();
          console.log("[Auth] Attempting login for email:", email);

          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            console.error("[Auth] User not found:", email);
            return null;
          }

          if (!user?.password) {
            console.error("[Auth] User has no password set:", email);
            return null;
          }

          const passwordMatches = await bcrypt.compare(
            credentials.password,
            user.password,
          );

          console.log("[Auth] Password match result:", passwordMatches);

          if (!passwordMatches) {
            console.error("[Auth] Password mismatch for:", email);
            return null;
          }

          console.log("[Auth] Login successful for:", email);
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          };
        } catch (error) {
          console.error("[Auth] Authorization error:", error);
          return null;
        }
      },
    }),
  ],
};
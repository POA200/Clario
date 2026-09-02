import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { prisma } from "@/lib/prisma";

const isProd = process.env.NODE_ENV === "production";
const useSecureCookies =
  isProd &&
  (process.env.NEXTAUTH_URL?.startsWith("https://") ||
    process.env.VERCEL_ENV === "production" ||
    Boolean(process.env.VERCEL) ||
    Boolean(process.env.VERCEL_URL) ||
    !process.env.NEXTAUTH_URL?.startsWith("http://"));

const cookiePrefix = useSecureCookies ? "__Secure-" : "";

export const authOptions: NextAuthOptions = {
  secret:
    process.env.NEXTAUTH_SECRET ||
    process.env.AUTH_SECRET ||
    "clario-jwt-secret-key-2026",
  session: {
    strategy: "jwt",
    maxAge: 365 * 24 * 60 * 60, // 365 days persistent session
  },
  useSecureCookies,
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
        maxAge: 365 * 24 * 60 * 60,
      },
    },
  },
  pages: { signIn: "/login" },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          const email = user.email.toLowerCase().trim();
          const existingUser = await prisma.user.findUnique({
            where: { email },
          });

          if (!existingUser) {
            const username =
              email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "") +
              "_" +
              Math.floor(Math.random() * 1000);
            const newUser = await prisma.user.create({
              data: {
                email,
                name: user.name || email.split("@")[0],
                username,
                image: user.image || null,
              },
            });
            user.id = newUser.id;
          } else {
            user.id = existingUser.id;
          }
        } catch (err) {
          console.error("[Auth] Error handling Google sign in user:", err);
        }
      }
      return true;
    },

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
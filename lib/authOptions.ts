import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./DB";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: { label: "email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email or password is not found.");
        }

        try {
          const exist = await prisma.user.findFirst({
            where: { email: credentials.email },
          });

          if (!exist) {
            throw new Error("User  not found.");
          }

          const isvalid = await bcrypt.compare(
            credentials.password,
            exist.password
          );
          if (!isvalid) {
            throw new Error("Email or password is not found.");
          }

          return {
            id: exist.id.toString(),
            email: exist.email,
            username: exist.username,
          };
        } catch (error) {
          console.log("Auth Error");
          throw error;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ token, session }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  secret: process.env.NEXT_AUTH_SECRET,
};

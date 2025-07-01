import { DefaultSession, DefaultUser } from "next-auth";


// Extend the Session and User interfaces
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    username?: string | null;
  }
}

// Extend the JWT interface
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username?: string | null;
  }
}
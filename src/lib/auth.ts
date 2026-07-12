import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { authenticateUser } from "@/lib/data";

declare module "next-auth" {
  interface User {
    role: "admin" | "staff" | "ambassador";
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: "admin" | "staff" | "ambassador";
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: "admin" | "staff" | "ambassador";
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await authenticateUser(
          credentials.email as string,
          credentials.password as string
        );

        if (!user) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
});

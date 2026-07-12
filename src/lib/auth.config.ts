import type { NextAuthConfig } from "next-auth";

function getRoleHome(role?: string) {
  if (role === "ambassador") return "/ambassador";
  return "/admin";
}

export const authConfig = {
  // Required on Vercel so Auth.js trusts the deployment host headers.
  trustHost: true,
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],

  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const pathname = nextUrl.pathname;

      const isAdminRoute = pathname.startsWith("/admin");
      const isAdminLoginPage = pathname === "/admin/login";
      const isAmbassadorRoute = pathname.startsWith("/ambassador");
      const isAmbassadorLoginPage = pathname === "/ambassador/login";

      if (isAdminRoute && !isAdminLoginPage) {
        if (!isLoggedIn) return false;
        if (role === "ambassador") {
          return Response.redirect(new URL("/ambassador", nextUrl));
        }
        return true;
      }

      if (isAmbassadorRoute && !isAmbassadorLoginPage) {
        if (!isLoggedIn) return false;
        if (role !== "ambassador") {
          return Response.redirect(new URL("/admin", nextUrl));
        }
        return true;
      }

      if (isAdminLoginPage && isLoggedIn) {
        return Response.redirect(new URL(getRoleHome(role), nextUrl));
      }

      if (isAmbassadorLoginPage && isLoggedIn) {
        return Response.redirect(new URL(getRoleHome(role), nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "admin" | "staff" | "ambassador";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

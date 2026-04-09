import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const ALLOWED_EMAILS = [
  "brian@no-bshomes.com",
  "shawn@no-bshomes.com",
  "admin@no-bshomes.com",
  "contact@no-bshomes.com",
];

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt" },
  callbacks: {
    signIn({ user }) {
      return ALLOWED_EMAILS.includes(user.email ?? "");
    },
    jwt({ token }) {
      return token;
    },
    session({ session }) {
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
});

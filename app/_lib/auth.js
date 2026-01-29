import NextAuth from "next-auth";
import { createUser, getUser } from "@/app/_lib/data/users.data";
import { getAuthProviderConfigs } from "@/app/_lib/authProviders";

const authConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: getAuthProviderConfigs(),
  callbacks: {
    authorized({ auth, request }) {
      return !!auth?.user;
    },
    async signIn({ user, account, profiler }) {
      try {
        if (!user?.email) return false;
        const existingUser = await getUser(user.email);

        if (!existingUser)
          await createUser({
            email: user.email,
            name: user.name,
            theme: "1ab5b137-55f5-473c-b8e0-d42831caa668",
          });
        return true;
      } catch (error) {
        return false;
      }
    },
    async session({ session, user }) {
      const sessionUser = await getUser(session.user.email);
      session.user.userId = sessionUser.id;

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth(authConfig);

import { convexAuth } from "@convex-dev/auth/server";
import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Google({
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
      // Force account selection on every login to prevent auto-skipping
      authorization: { params: { prompt: "select_account" } }
    }),
    Password,
  ],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      if (args.existingUserId) {
        return args.existingUserId;
      }
      
      // Filter out undefined values that crash the schema
      const userData: any = {
        email: args.profile.email,
        isProfileComplete: false,
      };
      
      return await ctx.db.insert("users", userData);
    },
  },
});

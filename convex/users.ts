import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const current = query({
  args: {},
  handler: async (ctx) => {
    try {
      const userId = await getAuthUserId(ctx);
      if (userId === null) {
        return null;
      }
      return await ctx.db.get(userId);
    } catch (error) {
      console.error("Auth Exception:", error);
      return null;
    }
  },
});

export const updateProfile = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    phone: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    gender: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }
    
    await ctx.db.patch(userId, {
      firstName: args.firstName,
      lastName: args.lastName,
      phone: args.phone,
      dateOfBirth: args.dateOfBirth,
      gender: args.gender,
      image: args.image,
      isProfileComplete: true,
      // name is optionally constructed here if needed but let's just keep original or update it
      name: `${args.firstName} ${args.lastName}`.trim()
    });
    
    return { success: true };
  },
});

export const generateNextJoinCode = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    if (user.nextSeasonJoinCode) {
      return user.nextSeasonJoinCode;
    }

    // Generate a new code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    let isUnique = false;

    while (!isUnique) {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      // We must ensure the code isn't currently used by any season
      const existingSeason = await ctx.db
        .query("seasons")
        .withIndex("by_joinCode", (q) => q.eq("joinCode", code))
        .first();
        
      if (!existingSeason) {
        isUnique = true;
      }
    }

    await ctx.db.patch(userId, {
      nextSeasonJoinCode: code
    });

    return code;
  }
});

import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const checkEmailAvailable = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();
    
    return { available: user === null };
  },
});

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
    otpCode: v.optional(v.string()), // Added for the verification flow
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }
    
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    // Check OTP if email is present and not verified AND profile is not already complete
    const isEmailLogin = user.email && !user.isAnonymous;
    const needsVerification = isEmailLogin && !user.emailVerificationTime && !user.isProfileComplete;

    if (needsVerification) {
      if (!args.otpCode || args.otpCode !== user.emailVerificationCode) {
        return { success: false, error: "Neveljavna ali prazna potrditvena koda." };
      }
    }
    
    await ctx.db.patch(userId, {
      firstName: args.firstName,
      lastName: args.lastName,
      phone: args.phone,
      dateOfBirth: args.dateOfBirth,
      gender: args.gender,
      image: args.image,
      isProfileComplete: true,
      name: `${args.firstName} ${args.lastName}`.trim(),
      ...(needsVerification ? { emailVerificationTime: Date.now(), emailVerificationCode: undefined } : {})
    });

    // If we just verified them, send the welcome email
    if (needsVerification && user.email) {
      await ctx.scheduler.runAfter(0, api.emails.sendWelcomeEmail, {
        email: user.email,
        name: args.firstName
      });
    }
    
    return { success: true };
  },
});

export const generateOtp = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const user = await ctx.db.get(userId);
    if (!user || !user.email) return { success: false };

    // If already verified, do nothing
    if (user.emailVerificationTime) return { success: false, reason: "Already verified" };

    // Generate random 6-digit number
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    await ctx.db.patch(userId, { emailVerificationCode: code });
    
    await ctx.scheduler.runAfter(0, api.emails.sendVerificationEmail, {
      email: user.email,
      code: code
    });

    return { success: true };
  }
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

export const updatePresence = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return; // Do nothing if not logged in
    await ctx.db.patch(userId, { lastSeen: Date.now() });
  }
});

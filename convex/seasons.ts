import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Generate a random 6-character alphanumeric code for invites
function generateJoinCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Ensure the code is unique in the given table
async function getUniqueJoinCode(ctx: any, tableName: "teams" | "seasons" | "events", requestedCode?: string) {
  let code = requestedCode || generateJoinCode();
  let isUnique = false;
  while (!isUnique) {
    const existing = await ctx.db
      .query(tableName)
      .withIndex("by_joinCode", (q: any) => q.eq("joinCode", code))
      .first();
    if (!existing) {
      isUnique = true;
    } else {
      code = generateJoinCode(); // if requested is taken, fallback to random
    }
  }
  return code;
}

export const createSeason = mutation({
  args: {
    teamId: v.id("teams"),
    name: v.string(), // e.g. "Jesen 2025"
    desc: v.optional(v.string()), // Optional description not in schema yet, but good to have
    dateStart: v.optional(v.string()), // Optional, could map to something or just store in desc
    dateEnd: v.optional(v.string()),
    isActive: v.boolean(),
    seasonJoinCode: v.optional(v.string()), // User can provide exactly the join code from the modal
    newPlayers: v.optional(v.array(v.object({
      firstName: v.string(),
      lastName: v.string(),
      email: v.string()
    }))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Verify user is an admin of the team
    const adminMembership = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("teamId"), args.teamId))
      .first();

    if (!adminMembership || adminMembership.role !== "admin") {
      throw new Error("Only team admins can create a season.");
    }

    // 1. Create Season
    const seasonJoinCode = await getUniqueJoinCode(ctx, "seasons", args.seasonJoinCode);
    const seasonId = await ctx.db.insert("seasons", {
      teamId: args.teamId,
      name: args.name,
      isActive: args.isActive,
      joinCode: seasonJoinCode,
      dateStart: args.dateStart,
      dateEnd: args.dateEnd,
    });

    // 2. Add the creator (admin) as an admin member of the season
    await ctx.db.insert("memberships", {
      userId,
      teamId: args.teamId,
      seasonId,
      role: "admin",
      status: "active",
    });

    // 3. Add offline/invited players
    if (args.newPlayers && args.newPlayers.length > 0) {
      for (const player of args.newPlayers) {
        let actualUserId = null;
        
        // If email is provided, check if user already exists
        if (player.email) {
          const existingUser = await ctx.db
            .query("users")
            .withIndex("email", (q: any) => q.eq("email", player.email))
            .first();
          if (existingUser) {
            actualUserId = existingUser._id;
          }
        }

        // If no user found, create an anonymous/offline user
        if (!actualUserId) {
          const fullName = [player.firstName, player.lastName].filter(Boolean).join(" ");
          actualUserId = await ctx.db.insert("users", {
            name: fullName || "Neznan igralec",
            email: player.email || undefined,
            firstName: player.firstName || undefined,
            lastName: player.lastName || undefined,
            isAnonymous: true, // mark as an offline placeholder
          });
        }

        // Check if user is already in this specific season
        const existingMembership = await ctx.db
          .query("memberships")
          .withIndex("by_user", (q) => q.eq("userId", actualUserId))
          .filter((q) => q.eq(q.field("teamId"), args.teamId))
          .filter((q) => q.eq(q.field("seasonId"), seasonId))
          .first();

        // If not in this season, insert
        if (!existingMembership) {
          await ctx.db.insert("memberships", {
            userId: actualUserId,
            teamId: args.teamId,
            seasonId: seasonId,
            role: "player",
            status: "active",
          });
        }
      }
    }

    return {
      seasonId,
      joinCode: seasonJoinCode
    };
  },
});

export const getSeasonsByTeam = query({
  args: {
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    // 1. Fetch seasons
    const seasons = await ctx.db
      .query("seasons")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    // 2. Augment with participant counts
    return Promise.all(
      seasons.map(async (season) => {
        // Find memberships that map to this specific seasonId using the index
        const members = await ctx.db
          .query("memberships")
          .withIndex("by_season", (q) => q.eq("seasonId", season._id))
          .filter((q) => q.eq(q.field("teamId"), args.teamId))
          .collect();
        
        // Ensure unique user counts (though usually 1 user per 1 season membership)
        const uniqueUsers = new Set(members.map((m) => m.userId));

        return {
          ...season,
          memberCount: uniqueUsers.size,
        };
      })
    );
  },
});

export const getSeason = query({
  args: { seasonId: v.id("seasons") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.seasonId);
  },
});

export const getSeasonByJoinCode = query({
  args: { joinCode: v.string() },
  handler: async (ctx, args) => {
    const season = await ctx.db
      .query("seasons")
      .withIndex("by_joinCode", (q) => q.eq("joinCode", args.joinCode))
      .first();

    if (!season) return null;

    const team = await ctx.db.get(season.teamId);
    
    return {
      season,
      team
    };
  },
});

export const updateSeason = mutation({
  args: {
    seasonId: v.id("seasons"),
    name: v.string(),
    desc: v.optional(v.string()),
    dateStart: v.optional(v.string()),
    dateEnd: v.optional(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const season = await ctx.db.get(args.seasonId);
    if (!season) throw new Error("Season not found");

    // Check if user is an admin of the team
    const adminMembership = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("teamId"), season.teamId))
      .first();

    if (!adminMembership || adminMembership.role !== "admin") {
      throw new Error("Only team admins can edit a season.");
    }

    await ctx.db.patch(args.seasonId, {
      name: args.name,
      isActive: args.isActive,
      dateStart: args.dateStart,
      dateEnd: args.dateEnd,
      // desc is not in schema directly but we accept it above. We can just ignore or add to schema.
    });

    return args.seasonId;
  },
});

export const deleteSeason = mutation({
  args: {
    seasonId: v.id("seasons"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const season = await ctx.db.get(args.seasonId);
    if (!season) throw new Error("Season not found");

    // Check if user is an admin of the team
    const adminMembership = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("teamId"), season.teamId))
      .first();

    if (!adminMembership || adminMembership.role !== "admin") {
      throw new Error("Only team admins can delete a season.");
    }

    // Delete members of the season
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_season", (q) => q.eq("seasonId", args.seasonId))
      .collect();

    for (const member of memberships) {
      await ctx.db.delete(member._id);
    }

    // Delete the season
    await ctx.db.delete(args.seasonId);
  },
});

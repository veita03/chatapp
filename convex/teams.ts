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
async function getUniqueJoinCode(ctx: any, tableName: "teams" | "seasons" | "events") {
  let code = generateJoinCode();
  let isUnique = false;
  while (!isUnique) {
    const existing = await ctx.db
      .query(tableName)
      .withIndex("by_joinCode", (q: any) => q.eq("joinCode", code))
      .first();
    if (!existing) {
      isUnique = true;
    } else {
      code = generateJoinCode();
    }
  }
  return code;
}

export const createTeam = mutation({
  args: {
    name: v.string(),
    sport: v.string(),
    desc: v.optional(v.string()),
    image: v.optional(v.string()),
    seasonName: v.string(), // "pri obrazcu za kreiranje ekipe ... kreiral ekipo in prvo sezono"
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // 1. Create Team
    const teamJoinCode = await getUniqueJoinCode(ctx, "teams");
    const teamId = await ctx.db.insert("teams", {
      name: args.name,
      sport: args.sport,
      desc: args.desc,
      image: args.image,
      joinCode: teamJoinCode,
      creatorId: userId,
    });

    // 2. Create Initial Season
    const seasonJoinCode = await getUniqueJoinCode(ctx, "seasons");
    const seasonId = await ctx.db.insert("seasons", {
      teamId,
      name: args.seasonName,
      isActive: true,
      joinCode: seasonJoinCode,
    });

    // 3. Add User as Admin of the Team & Season
    await ctx.db.insert("memberships", {
      userId,
      teamId,
      seasonId,
      role: "admin",
      status: "active",
    });

    return teamId;
  },
});

export const getUserTeams = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    // 1. Find all memberships for this user
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // 2. Fetch all unique teams for those memberships
    const teamIds = Array.from(new Set(memberships.map((m) => m.teamId)));
    
    // We fetch the latest active season for each team along the way to know stats
    const teamsWithDetails = await Promise.all(
      teamIds.map(async (tId) => {
        const team = await ctx.db.get(tId);
        if (!team) return null;

        // Count members
        const members = await ctx.db
          .query("memberships")
          .withIndex("by_team", (q) => q.eq("teamId", tId))
          .collect();
        // Since memberships can duplicate for diff seasons, filter to unique users
        const uniqueMemberIds = new Set(members.map(m => m.userId));

        // Get Seasons
        const seasons = await ctx.db
          .query("seasons")
          .withIndex("by_team", (q) => q.eq("teamId", tId))
          .collect();

        // Get user's role in this team (highest role, or just look at admin)
        const userMem = members.find(m => m.userId === userId && m.role === "admin");
        const role = userMem ? "admin" : "player";

        return {
          ...team,
          memberCount: uniqueMemberIds.size,
          seasonCount: seasons.length,
          userRole: role,
        };
      })
    );

    // Filter out nulls if team was deleted externally
    return teamsWithDetails.filter((t) => t !== null);
  },
});

export const deleteTeam = mutation({
  args: {
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // 1. Check if user is an admin for this team
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("teamId"), args.teamId))
      .first();

    if (!membership || membership.role !== "admin") {
      throw new Error("Nemate pravic za brisanje te ekipe.");
    }

    // 2. We can proceed to cascade delete things related to this team
    // Delete memberships
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();
    for (const mem of memberships) {
      await ctx.db.delete(mem._id);
    }

    // Delete seasons
    const seasons = await ctx.db
      .query("seasons")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();
    for (const sea of seasons) {
      await ctx.db.delete(sea._id);
    }

    // Delete messages associated with team chat
    // Note: since messages are not indexed by teamId strictly, we can query all messages with this filter.
    // If the DB gets huge, an index on teamId inside messages might be needed.
    const messages = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("teamId"), args.teamId))
      .collect();
    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }

    // Finally delete the team
    await ctx.db.delete(args.teamId);
  },
});

export const getTeam = query({
  args: {
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("teamId"), args.teamId))
      .first();

    if (!membership) return null;

    const team = await ctx.db.get(args.teamId);
    return team;
  },
});

export const updateTeam = mutation({
  args: {
    teamId: v.id("teams"),
    name: v.string(),
    sport: v.string(),
    desc: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("teamId"), args.teamId))
      .first();

    if (!membership || membership.role !== "admin") {
      throw new Error("Samo administratorji lahko urejajo ekipo.");
    }

    await ctx.db.patch(args.teamId, {
      name: args.name,
      sport: args.sport,
      desc: args.desc,
      image: args.image,
    });
  },
});

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

export const createTeam = mutation({
  args: {
    name: v.string(),
    sport: v.string(),
    desc: v.optional(v.string()),
    image: v.optional(v.string()),
    seasonName: v.string(), // "pri obrazcu za kreiranje ekipe ... kreiral ekipo in prvo sezono"
    seasonJoinCode: v.optional(v.string()),
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
    const seasonJoinCode = await getUniqueJoinCode(ctx, "seasons", args.seasonJoinCode);
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

    // 4. Add offline/invited players
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
            firstName: player.firstName,
            lastName: player.lastName,
            name: fullName,
            email: player.email || undefined,
            isAnonymous: true,
          });
        }

        // Add membership to team and season
        if (actualUserId) {
          await ctx.db.insert("memberships", {
            userId: actualUserId,
            teamId,
            seasonId,
            role: "player",
            status: "active",
          });
        }
      }
    }

    // 5. Clear the user's pre-generated join code so they get a fresh one next time
    await ctx.db.patch(userId, {
      nextSeasonJoinCode: undefined,
    });

    return teamId;
  },
});

export const getTeamParticipants = query({
  args: {
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    // 1. Get all memberships for the team
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    // 2. Extract unique user IDs
    const uniqueUserIds = Array.from(new Set(memberships.map((m) => m.userId)));

    // 3. Fetch user details
    const participants = await Promise.all(
      uniqueUserIds.map(async (uid) => {
        const user = await ctx.db.get(uid);
        if (!user) return null;
        
        // Find their highest role in the team (if they have admin in any season/team level)
        const userMemberships = memberships.filter(m => m.userId === uid);
        const isAdmin = userMemberships.some(m => m.role === "admin");
        
        // Get name
        const name = user.name || user.email?.split("@")[0] || "Uporabnik";
        
        return {
          _id: user._id,
          name,
          image: user.image,
          role: isAdmin ? "admin" : "player",
          lastSeen: user.lastSeen
        };
      })
    );

    // Filter out nulls and sort (admins first, then alphabetically)
    return participants
      .filter((p) => p !== null)
      .sort((a, b) => {
        if (a!.role === "admin" && b!.role !== "admin") return -1;
        if (a!.role !== "admin" && b!.role === "admin") return 1;
        return a!.name.localeCompare(b!.name);
      });
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

        // Get user's role and lastReadTime in this team
        let role = "player";
        let maxLastReadTime = 0;
        for (const m of members) {
          if (m.userId === userId) {
            if (m.role === "admin") role = "admin";
            if (m.lastReadTime && m.lastReadTime > maxLastReadTime) {
              maxLastReadTime = m.lastReadTime;
            }
          }
        }

        // Calculate unread count (cap at 99 to avoid massive scans)
        const unreadMessages = await ctx.db
          .query("messages")
          .withIndex("by_team", (q) => q.eq("teamId", tId))
          .filter(q => q.gt(q.field("_creationTime"), maxLastReadTime))
          .take(99);
          
        const unreadCount = maxLastReadTime === 0 ? 0 : unreadMessages.length;

        // Fetch last message for the inbox preview
        const lastMessage = await ctx.db
          .query("messages")
          .withIndex("by_team", (q) => q.eq("teamId", tId))
          .order("desc")
          .first();

        let lastMessageAuthor = lastMessage?.author;
        if (lastMessage?.authorId) {
           const authorUser = await ctx.db.get(lastMessage.authorId);
           if (authorUser) {
              lastMessageAuthor = authorUser.name || authorUser.email?.split("@")[0] || lastMessage.author;
           }
        }

        return {
          ...team,
          memberCount: uniqueMemberIds.size,
          seasonCount: seasons.length,
          userRole: role,
          unreadCount,
          lastMessage: lastMessage ? {
             text: lastMessage.text,
             author: lastMessageAuthor,
             creationTime: lastMessage._creationTime,
             type: lastMessage.type,
          } : null,
        };
      })
    );

    // Filter out nulls if team was deleted externally
    const filteredTeams = teamsWithDetails.filter((t) => t !== null) as NonNullable<typeof teamsWithDetails[0]>[];

    // Sort by unread status first, then by latest message descending. 
    // If no message, push to the bottom based on creationTime of the team itself.
    filteredTeams.sort((a, b) => {
      // 1. Unread prioritized above all
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (b.unreadCount > 0 && a.unreadCount === 0) return 1;

      // 2. Fall back to timestamp
      const timeA = a.lastMessage ? a.lastMessage.creationTime : a._creationTime;
      const timeB = b.lastMessage ? b.lastMessage.creationTime : b._creationTime;
      return timeB - timeA; // Descending
    });

    return filteredTeams;
  },
});

export const markTeamRead = mutation({
  args: {
    teamId: v.id("teams")
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;

    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_user_team", (q) => q.eq("userId", userId).eq("teamId", args.teamId))
      .collect();

    const now = Date.now();
    await Promise.all(
      memberships.map((m) => ctx.db.patch(m._id, { lastReadTime: now }))
    );
  }
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

    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("teamId"), args.teamId))
      .collect();

    if (memberships.length === 0) return null;

    let maxLastReadTime = 0;
    for (const m of memberships) {
      if (m.lastReadTime && m.lastReadTime > maxLastReadTime) {
         maxLastReadTime = m.lastReadTime;
      }
    }

    const team = await ctx.db.get(args.teamId);
    if (!team) return null;
    
    return {
      ...team,
      lastReadTime: maxLastReadTime
    };
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

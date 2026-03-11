import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Helper to generate a unique code if needed (even though events might not strictly use it yet)
function generateJoinCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const createEvent = mutation({
  args: {
    teamId: v.id("teams"),
    title: v.string(),
    date: v.number(), // timestamp
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Uporabnik ne obstaja");

    // 1. Check if user is an admin of the team/season
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user_team", (q) => q.eq("userId", userId).eq("teamId", args.teamId))
      .first();

    if (!membership || membership.role !== "admin") {
       throw new Error("Samo administratorji lahko ustvarjajo dogodke.");
    }

    // Lookup active season for team
    const season = await ctx.db
       .query("seasons")
       .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
       .filter((q) => q.eq(q.field("isActive"), true))
       .first();

    if (!season) {
       throw new Error("Ekipa nima aktivne sezone za dogodke.");
    }

    // 2. Create the internal event record
    const eventJoinCode = generateJoinCode();
    const eventId = await ctx.db.insert("events", {
      teamId: args.teamId,
      seasonId: season._id,
      title: args.title,
      date: args.date,
      joinCode: eventJoinCode,
    });

    // 3. Automatically broadcast a rich "Event" message into the Team's chat
    const authorName = user.name || user.firstName || user.email?.split("@")[0] || "Admin";
    const authorImage = user.image || "";

    await ctx.db.insert("messages", {
      teamId: args.teamId,
      authorId: userId,
      author: authorName,
      authorImage: authorImage,
      text: `Ustvaril/a je nov dogodek: ${args.title}`,
      type: "event",
      eventData: {
         eventId: eventId,
         title: args.title,
         date: args.date,
      }
    });

    // Also auto-RSVP the creator as "attending"
    await ctx.db.insert("memberships", {
      userId,
      teamId: args.teamId,
      eventId: eventId,
      role: "player",
      attendance: "attending",
    });

    return eventId;
  },
});

export const updateRSVP = mutation({
   args: {
     eventId: v.id("events"),
     attendance: v.union(v.literal("attending"), v.literal("declined"), v.literal("undecided")),
   },
   handler: async (ctx, args) => {
      const userId = await getAuthUserId(ctx);
      if (!userId) {
         throw new Error("Unauthorized");
      }

      const event = await ctx.db.get(args.eventId);
      if (!event) throw new Error("Dogodek ne obstaja");

      // Check if user is already a member of this event
      const existingMembership = await ctx.db
         .query("memberships")
         .withIndex("by_user", (q) => q.eq("userId", userId))
         .filter((q) => q.eq(q.field("eventId"), args.eventId))
         .first();

      if (existingMembership) {
         // Update existing RSVP
         if (existingMembership.attendance !== args.attendance) {
            await ctx.db.patch(existingMembership._id, {
               attendance: args.attendance
            });
         }
      } else {
         // Create new event-level RSVP
         await ctx.db.insert("memberships", {
            userId,
            teamId: event.teamId,
            eventId: args.eventId,
            role: "player",
            attendance: args.attendance,
         });
      }
   }
});

// Query to get RSVP stats for a single event to render in the chat
export const getEventRSVPs = query({
   args: {
      eventId: v.id("events"),
   },
   handler: async (ctx, args) => {
      const memberships = await ctx.db
         .query("memberships")
         .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
         .collect();

      const rsvps = {
         attending: [] as { id: string, name: string, image?: string }[],
         declined: [] as { id: string, name: string, image?: string }[],
         undecided: [] as { id: string, name: string, image?: string }[],
      };

      for (const m of memberships) {
         if (m.attendance && (m.attendance === "attending" || m.attendance === "declined" || m.attendance === "undecided")) {
            const user = await ctx.db.get(m.userId);
            if (user) {
               rsvps[m.attendance].push({
                  id: user._id,
                  name: user.name || user.firstName || "Uporabnik",
                  image: user.image,
               });
            }
         }
      }

      return rsvps;
   }
});

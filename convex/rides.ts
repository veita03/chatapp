import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getRides = query({
  args: {},
  handler: async (ctx) => {
    const rides = await ctx.db
      .query("rides")
      .order("desc") // could order by departure time when supported
      .collect();

    // Map authors for display
    const ridesWithAuthor = await Promise.all(
      rides.map(async (ride) => {
        const author = await ctx.db.get(ride.authorId);
        return {
          ...ride,
          authorName: author?.name || "Neznanec",
          authorImage: author?.image,
        };
      })
    );
    
    // Sort by departure time ascending
    return ridesWithAuthor.sort((a, b) => a.departureTime - b.departureTime);
  },
});

export const getRide = query({
  args: { id: v.id("rides") },
  handler: async (ctx, args) => {
    const ride = await ctx.db.get(args.id);
    if (!ride) return null;
    return ride;
  },
});

export const createRide = mutation({
  args: {
    departure: v.string(),
    departureLat: v.number(),
    departureLng: v.number(),
    destination: v.string(),
    destinationLat: v.number(),
    destinationLng: v.number(),
    departureTime: v.number(),
    distanceText: v.optional(v.string()),
    durationText: v.optional(v.string()),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Ni prijavljen");

    const newRideId = await ctx.db.insert("rides", {
      authorId: userId,
      departure: args.departure,
      departureLat: args.departureLat,
      departureLng: args.departureLng,
      destination: args.destination,
      destinationLat: args.destinationLat,
      destinationLng: args.destinationLng,
      departureTime: args.departureTime,
      distanceText: args.distanceText,
      durationText: args.durationText,
      comment: args.comment,
    });
    return newRideId;
  },
});

export const updateRide = mutation({
  args: {
    id: v.id("rides"),
    departure: v.string(),
    departureLat: v.number(),
    departureLng: v.number(),
    destination: v.string(),
    destinationLat: v.number(),
    destinationLng: v.number(),
    departureTime: v.number(),
    distanceText: v.optional(v.string()),
    durationText: v.optional(v.string()),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Ni prijavljen");

    const ride = await ctx.db.get(args.id);
    if (!ride) throw new Error("Prevoz ne obstaja");
    if (ride.authorId !== userId) throw new Error("Nimate pravic za urejanje");

    await ctx.db.patch(args.id, {
      departure: args.departure,
      departureLat: args.departureLat,
      departureLng: args.departureLng,
      destination: args.destination,
      destinationLat: args.destinationLat,
      destinationLng: args.destinationLng,
      departureTime: args.departureTime,
      distanceText: args.distanceText,
      durationText: args.durationText,
      comment: args.comment,
    });
  },
});

export const deleteRide = mutation({
  args: { id: v.id("rides") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Ni prijavljen");

    const ride = await ctx.db.get(args.id);
    if (!ride) throw new Error("Prevoz ne obstaja");
    if (ride.authorId !== userId) throw new Error("Nimate pravic za brisanje");

    await ctx.db.delete(args.id);
  },
});

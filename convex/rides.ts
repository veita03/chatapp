import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
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
        let author = null;
        try {
          if (ride.authorId) {
            author = await ctx.db.get(ride.authorId);
          }
        } catch (e) {
          console.error("Failed to fetch author for ride:", ride._id, e);
        }
        
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

export const insertDebugRides = mutation({
  args: {},
  handler: async (ctx) => {
    // Inject 3 Maribor test rides, associating with any user if needed or just a fake one. 
    // We'll use a mocked 'system' user Id or just the first user we find
    const firstUser = await ctx.db.query("users").first();
    const mockAuthorId = firstUser?._id || ("jc76yxdvvw858v8s7zz0g4b39x7av92r" as unknown as Id<"users">);

    const mariborRides = [
      {
        authorId: mockAuthorId,
        departure: "Ljubljana, Slovenija",
        departureLat: 46.0569465,
        departureLng: 14.5057515,
        destination: "Maribor, Slovenija",
        destinationLat: 46.5620177,
        destinationLng: 15.6366,
        departureTime: Date.now() + 86400000 * 2,
        distanceText: "128 km",
        durationText: "1 ura 20 min",
        comment: "Gremo iz Ljubljane direkt v center MB.",
      },
      {
        authorId: mockAuthorId,
        departure: "Celje, Slovenija",
        departureLat: 46.22915,
        departureLng: 15.267711,
        destination: "Maribor, Slovenija (Europark)",
        destinationLat: 46.556208,
        destinationLng: 15.654876,
        departureTime: Date.now() + 86400000 * 3,
        distanceText: "54 km",
        durationText: "45 min",
        comment: "Poberem na bencisnki pumpi.",
      },
      {
        authorId: mockAuthorId,
        departure: "Murska Sobota, Slovenija",
        departureLat: 46.6625,
        departureLng: 16.1654,
        destination: "Titova cesta 50, Maribor",
        destinationLat: 46.54922,
        destinationLng: 15.64293,
        departureTime: Date.now() + 86400000 * 1,
        distanceText: "59 km",
        durationText: "40 min",
        comment: "Zjutraj pred faksom. Prispevek za cestnino.",
      }
    ];

    for (const r of mariborRides) {
      await ctx.db.insert("rides", r);
    }
  }
});

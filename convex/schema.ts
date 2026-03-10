import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // Profile extension
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    gender: v.optional(v.string()), // 'male', 'female', etc.
    isProfileComplete: v.optional(v.boolean()),
    nextSeasonJoinCode: v.optional(v.string()), // Used to statically persist the join code during team creation
    lastSeen: v.optional(v.number()), // For online presence indicator
  }).index("email", ["email"]).index("phone", ["phone"]),
  messages: defineTable({
    teamId: v.optional(v.id("teams")), // Added for per-team scoping
    author: v.string(),
    authorImage: v.optional(v.string()),
    text: v.string(),
    type: v.optional(v.string()), // 'text', 'poll', 'location'
    pollData: v.optional(
      v.object({
        question: v.string(),
        options: v.array(
          v.object({
            id: v.string(),
            text: v.string(),
            votes: v.array(v.string()), // array of author names that voted
          })
        ),
      })
    ),
    locationData: v.optional(
      v.object({
        lat: v.number(),
        lng: v.number(),
      })
    ),
    reactions: v.optional(
      v.array(
        v.object({
          emoji: v.string(),
          users: v.array(v.string()),
        })
      )
    ),
    isPinned: v.optional(v.boolean()),
  }).index("by_team", ["teamId"]),

  teams: defineTable({
    name: v.string(),
    sport: v.string(), // football, basketball, padel, etc.
    desc: v.optional(v.string()),
    image: v.optional(v.string()),
    joinCode: v.string(), // 6-char unique code
    creatorId: v.id("users"),
  }).index("by_joinCode", ["joinCode"]),

  seasons: defineTable({
    teamId: v.id("teams"),
    name: v.string(), // e.g., "Jesen 2025"
    isActive: v.boolean(),
    joinCode: v.string(),
  }).index("by_team", ["teamId"]).index("by_joinCode", ["joinCode"]),

  events: defineTable({
    seasonId: v.id("seasons"),
    teamId: v.id("teams"), // denormalized for easier querying
    title: v.string(),
    date: v.number(), // timestamp
    joinCode: v.string(),
  }).index("by_season", ["seasonId"]).index("by_team", ["teamId"]).index("by_joinCode", ["joinCode"]),

  memberships: defineTable({
    userId: v.id("users"),
    teamId: v.id("teams"),
    seasonId: v.optional(v.id("seasons")), // If empty, it's just an event-level temp member
    eventId: v.optional(v.id("events")),   // If set, they only RSVP'd to one specific event
    role: v.string(), // 'admin' | 'player'
    status: v.optional(v.string()), // 'active' | 'injured' | 'reserve'
    attendance: v.optional(v.string()) // 'attending' | 'declined' | 'undecided' (for event-only logic)
  })
    .index("by_user", ["userId"])
    .index("by_team", ["teamId"])
    .index("by_season", ["seasonId"])
    .index("by_event", ["eventId"])
    .index("by_user_team", ["userId", "teamId"]),

  rides: defineTable({
    authorId: v.id("users"),
    departure: v.string(),     // Human readable location
    departureLat: v.number(),
    departureLng: v.number(),
    destination: v.string(),   // Human readable location
    destinationLat: v.number(),
    destinationLng: v.number(),
    departureTime: v.number(), // Timestamp in ms
    distanceText: v.optional(v.string()), // e.g. "45 km"
    durationText: v.optional(v.string()), // e.g. "40 min"
    comment: v.optional(v.string())
  }).index("by_author", ["authorId"]),
});

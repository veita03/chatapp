import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  messages: defineTable({
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
  }),
});

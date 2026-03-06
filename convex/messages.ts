import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    // Fetch most recent 50 messages
    return await ctx.db.query("messages").order("desc").take(50);
  },
});

export const send = mutation({
  args: { text: v.string(), author: v.string() },
  handler: async (ctx, args) => {
    // Insert a new message into the database
    await ctx.db.insert("messages", {
      text: args.text,
      author: args.author,
    });
  },
});

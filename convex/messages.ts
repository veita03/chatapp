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
  args: {
    text: v.string(),
    author: v.string(),
    type: v.optional(v.string()),
    pollData: v.optional(
      v.object({
        question: v.string(),
        options: v.array(
          v.object({
            id: v.string(),
            text: v.string(),
            votes: v.array(v.string()),
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
  },
  handler: async (ctx, args) => {
    // Insert a new message into the database
    await ctx.db.insert("messages", {
      text: args.text,
      author: args.author,
      ...(args.type && { type: args.type }),
      ...(args.pollData && { pollData: args.pollData }),
      ...(args.locationData && { locationData: args.locationData }),
    });
  },
});

export const votePoll = mutation({
  args: {
    messageId: v.id("messages"),
    optionId: v.string(),
    author: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);

    if (!message || message.type !== "poll" || !message.pollData) {
      throw new Error("Povezano sporočilo ni anketa.");
    }

    // Toggle vote logic: if user already voted for this option, remove it.
    // Otherwise, remove them from all other options, and add to this one.
    const newOptions = message.pollData.options.map((option) => {
      // Remove author from all existing options first
      const cleanVotes = option.votes.filter((voter) => voter !== args.author);

      // If this is the option they clicked
      if (option.id === args.optionId) {
        // If they were already in THIS option's original votes, it means they are toggling off
        // So we keep cleanVotes without them (already done above).
        // BUT if they were NOT in this option originally, we add them now.
        if (!option.votes.includes(args.author)) {
          cleanVotes.push(args.author);
        }
      }

      return {
        ...option,
        votes: cleanVotes,
      };
    });

    await ctx.db.patch(args.messageId, {
      pollData: {
        ...message.pollData,
        options: newOptions,
      },
    });
  },
});

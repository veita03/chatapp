import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

export const get = query({
  args: {
    teamId: v.optional(v.id("teams")),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    if (args.teamId) {
      return await ctx.db.query("messages")
        .withIndex("by_team", q => q.eq("teamId", args.teamId))
        .order("desc")
        .paginate(args.paginationOpts);
    } else {
      return await ctx.db.query("messages")
        .filter(q => q.eq(q.field("teamId"), undefined))
        .order("desc")
        .paginate(args.paginationOpts);
    }
  },
});

export const send = mutation({
  args: {
    teamId: v.optional(v.id("teams")),
    author: v.string(),
    authorImage: v.optional(v.string()),
    text: v.string(),
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
      ...(args.authorImage && { authorImage: args.authorImage }),
      ...(args.teamId && { teamId: args.teamId }),
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

export const toggleReaction = mutation({
  args: {
    messageId: v.id("messages"),
    emoji: v.string(),
    author: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Sporočilo ne obstaja.");

    const currentReactions = message.reactions || [];
    const existingIndex = currentReactions.findIndex(r => r.emoji === args.emoji);
    let newReactions = [...currentReactions];

    if (existingIndex >= 0) {
      const users = currentReactions[existingIndex].users;
      if (users.includes(args.author)) {
        // Remove user
        const newUsers = users.filter(u => u !== args.author);
        if (newUsers.length === 0) {
          newReactions.splice(existingIndex, 1);
        } else {
          newReactions[existingIndex] = { emoji: args.emoji, users: newUsers };
        }
      } else {
        // Add user
        newReactions[existingIndex] = { emoji: args.emoji, users: [...users, args.author] };
      }
    } else {
      // Add new emoji entry
      newReactions.push({ emoji: args.emoji, users: [args.author] });
    }

    await ctx.db.patch(args.messageId, { reactions: newReactions.length > 0 ? newReactions : undefined });
  },
});

export const togglePin = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Sporočilo ne obstaja.");

    await ctx.db.patch(args.messageId, { isPinned: !message.isPinned });
  },
});

export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    // Check if message exists
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Sporočilo ne obstaja.");

    // Delete message
    await ctx.db.delete(args.messageId);
  },
});

export const getPinnedMessage = query({
  args: {
    teamId: v.optional(v.id("teams")),
  },
  handler: async (ctx, args) => {
    if (!args.teamId) return null;
    
    // Fetch all pinned messages for the team and return the latest one
    const pinnedMessages = await ctx.db
      .query("messages")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .filter((q) => q.eq(q.field("isPinned"), true))
      .order("desc")
      .first();

    return pinnedMessages;
  },
});

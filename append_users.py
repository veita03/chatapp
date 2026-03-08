import sys

with open('convex/users.ts', 'r') as f:
    content = f.read()

new_content = """
export const generateNextJoinCode = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    if (user.nextSeasonJoinCode) {
      return user.nextSeasonJoinCode;
    }

    // Generate a new code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    let isUnique = false;

    while (!isUnique) {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      // We must ensure the code isn't currently used by any season
      const existingSeason = await ctx.db
        .query("seasons")
        .withIndex("by_joinCode", (q) => q.eq("joinCode", code))
        .first();
        
      if (!existingSeason) {
        isUnique = true;
      }
    }

    await ctx.db.patch(userId, {
      nextSeasonJoinCode: code
    });

    return code;
  }
});
"""

with open('convex/users.ts', 'w') as f:
    f.write(content + new_content)


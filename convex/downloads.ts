import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getDailyUsage = query({
  args: {
    clientId: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const usage = await ctx.db
      .query("usage")
      .withIndex("by_client_date", (q) => 
        q.eq("clientId", args.clientId).eq("date", args.date)
      )
      .unique();

    if (!usage) {
      return {
        count: 0,
        remaining: 5,
        aiSearchCount: 0,
        aiSearchRemaining: 3,
        aiSummaryCount: 0,
        aiSummaryRemaining: 2,
      };
    }

    return {
      count: usage.count,
      remaining: Math.max(0, 5 - usage.count),
      aiSearchCount: usage.aiSearchCount,
      aiSearchRemaining: Math.max(0, 3 - usage.aiSearchCount),
      aiSummaryCount: usage.aiSummaryCount,
      aiSummaryRemaining: Math.max(0, 2 - usage.aiSummaryCount),
    };
  },
});

export const listDownloads = query({
  args: { clientId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("downloads")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .order("desc")
      .collect();
  },
});

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Creates or updates a subscription record for a client.
 * Called after a successful purchase or restoration from Google Play.
 */
export const createOrUpdateSubscription = mutation({
  args: {
    clientId: v.string(),
    plan: v.string(),            // 'free', 'pro'
    purchaseToken: v.optional(v.string()),
    productId: v.optional(v.string()),
    expiryDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .unique();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        plan: args.plan,
        purchaseToken: args.purchaseToken ?? existing.purchaseToken,
        productId: args.productId ?? existing.productId,
        expiryDate: args.expiryDate ?? existing.expiryDate,
        updatedAt: now,
      });
      return await ctx.db.get(existing._id);
    } else {
      const id = await ctx.db.insert("subscriptions", {
        clientId: args.clientId,
        plan: args.plan,
        purchaseToken: args.purchaseToken,
        productId: args.productId,
        expiryDate: args.expiryDate,
        createdAt: now,
        updatedAt: now,
      });
      return await ctx.db.get(id);
    }
  },
});

/**
 * Retrieves the subscription status for a client.
 * Automatically handles expiration and downgrades to 'free' plan if necessary.
 */
export const getSubscriptionStatus = query({
  args: {
    clientId: v.string(),
  },
  handler: async (ctx, args) => {
    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .unique();

    if (!sub) {
      return {
        isProUser: false,
        expiryDate: null,
        plan: "free",
        daysRemaining: null,
      };
    }

    const now = Date.now();
    const isExpired = sub.expiryDate ? sub.expiryDate < now : false;

    if (sub.plan === "pro" && isExpired) {
      // In a query, we can't perform side effects like mutations.
      // But the requirement says "auto-downgrade to free in the same query response".
      // This usually means the return value should reflect the downgraded state.
      return {
        isProUser: false,
        expiryDate: sub.expiryDate ?? null,
        plan: "free",
        daysRemaining: 0,
      };
    }

    const daysRemaining = sub.expiryDate 
      ? Math.max(0, Math.ceil((sub.expiryDate - now) / (1000 * 60 * 60 * 24)))
      : null;

    return {
      isProUser: sub.plan === "pro" && !isExpired,
      expiryDate: sub.expiryDate ?? null,
      plan: sub.plan,
      daysRemaining,
    };
  },
});

/**
 * Cancels a subscription for a client.
 * Resets the plan to 'free' and clears sensitive billing data.
 */
export const cancelSubscription = mutation({
  args: {
    clientId: v.string(),
  },
  handler: async (ctx, args) => {
    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .unique();

    if (sub) {
      await ctx.db.patch(sub._id, {
        plan: "free",
        purchaseToken: undefined,
        expiryDate: undefined,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

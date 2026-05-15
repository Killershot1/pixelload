import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Logs content saved from social media (e.g., WhatsApp Status).
 */
export const logSavedContent = mutation({
  args: {
    clientId: v.string(),
    platform: v.string(),
    contentType: v.string(),
    fileSizeBytes: v.number(),
    localFilePath: v.string(),
    thumbnail: v.optional(v.string()),
    savedAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("savedContent", {
      clientId: args.clientId,
      platform: args.platform,
      contentType: args.contentType,
      fileSizeBytes: args.fileSizeBytes,
      localFilePath: args.localFilePath,
      thumbnail: args.thumbnail,
      savedAt: args.savedAt,
    });
  },
});

/**
 * Retrieves saved content for a specific client with optional filters.
 */
export const getSavedContent = query({
  args: {
    clientId: v.string(),
    platform: v.optional(v.string()),
    contentType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("savedContent")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .order("desc");

    const results = await q.collect();

    let filtered = results;
    if (args.platform && args.platform !== "All") {
      filtered = filtered.filter((c) => c.platform.toLowerCase() === args.platform?.toLowerCase());
    }
    if (args.contentType && args.contentType !== "All") {
      filtered = filtered.filter((c) => c.contentType.toLowerCase() === args.contentType?.toLowerCase());
    }

    return filtered;
  },
});

/**
 * Deletes a saved content record.
 */
export const deleteSavedContent = mutation({
  args: {
    savedContentId: v.id("savedContent"),
    clientId: v.string(),
  },
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.savedContentId);
    if (!record) {
      throw new Error("CONTENT_NOT_FOUND");
    }
    if (record.clientId !== args.clientId) {
      throw new Error("UNAUTHORIZED_ACCESS");
    }

    await ctx.db.delete(args.savedContentId);
    return { success: true };
  },
});

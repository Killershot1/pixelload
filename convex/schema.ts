import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Tracks the metadata and status of every download for a specific client
  downloads: defineTable({
    clientId: v.string(),        // Device fingerprint (UUID)
    title: v.string(),           // Video/Audio title
    thumbnail: v.string(),       // URL to thumbnail
    quality: v.string(),         // e.g., "1080p", "720p", "audio"
    fileSizeBytes: v.number(),   // Estimated or actual file size
    sourceUrl: v.string(),       // Original source URL (e.g., YouTube link)
    downloadedAt: v.number(),    // Timestamp of download start
    updatedAt: v.number(),       // Timestamp of last status update
    progressPercent: v.number(), // 0 to 100
    status: v.union(
      v.literal("analyzing"),
      v.literal("queued"),
      v.literal("downloading"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("failed")
    ),
    errorReason: v.optional(v.string()), // Optional error message if status is "failed"
  })
    .index("by_client", ["clientId"])
    .index("by_client_status", ["clientId", "status"]),

  // Tracks daily usage limits for free tier enforcement
  usage: defineTable({
    clientId: v.string(),
    date: v.string(),            // YYYY-MM-DD format (UTC)
    count: v.number(),           // Number of downloads performed on this date
    aiSearchCount: v.number(),   // Number of AI searches performed
    aiSummaryCount: v.number(),  // Number of AI summaries performed
    lastReset: v.number(),       // Timestamp of the last reset/update
  }).index("by_client_date", ["clientId", "date"]),

  // Stores history of AI searches
  aiSearchHistory: defineTable({
    clientId: v.string(),
    query: v.string(),
    resultsCount: v.number(),
    timestamp: v.number(),
  }).index("by_client", ["clientId"]),

  // Stores content saved from social media or other sources
  savedContent: defineTable({
    clientId: v.string(),
    platform: v.string(),      // 'whatsapp', 'general', etc.
    contentType: v.string(),   // 'image', 'video'
    fileSizeBytes: v.number(),
    localFilePath: v.string(),
    thumbnail: v.optional(v.string()),
    savedAt: v.number(),
  }).index("by_client", ["clientId"])
    .index("by_client_platform", ["clientId", "platform"]),

  // Stores subscription details for Google Play Billing
  subscriptions: defineTable({
    clientId: v.string(),
    plan: v.string(),            // 'free', 'pro'
    purchaseToken: v.optional(v.string()),
    productId: v.optional(v.string()),
    expiryDate: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_client", ["clientId"]),

  // Stores client-specific configuration and subscription status
  profiles: defineTable({
    clientId: v.string(),
    isPro: v.boolean(),          // True if user has purchased PixelLoad Pro
    proExpiresAt: v.optional(v.number()), // Expiration timestamp for subscription
    regionCode: v.string(),      // Preferred trending region (default: "ZW")
  }).index("by_client", ["clientId"]),
});

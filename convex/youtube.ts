import { v } from "convex/values";
import { action } from "./_generated/server";

export const getTrendingVideos = action({
  args: { regionCode: v.string() },
  handler: async (_ctx: any, _args: { regionCode: string }) => {
    return [
      {
        id: "v1",
        title: "How Visionco AI is Changing the World",
        thumbnail: "https://picsum.photos/seed/yt1/800/450",
        channel: "Vision Pixels Tech",
        views: "1.2M",
        duration: "10:24",
        publishedAt: "2 hours ago"
      },
      {
        id: "v2",
        title: "Top 10 Zimbabwe Comedy Skits 2025",
        thumbnail: "https://picsum.photos/seed/yt2/800/450",
        channel: "ZimJoy Africa",
        views: "850K",
        duration: "15:45",
        publishedAt: "5 hours ago"
      },
      {
        id: "v3",
        title: "Borehole Pump Repair Masterclass",
        thumbnail: "https://picsum.photos/seed/yt3/800/450",
        channel: "Village Engineering",
        views: "240K",
        duration: "25:10",
        publishedAt: "1 day ago"
      },
      {
        id: "v4",
        title: "Afrobeat Mix 2025 - Summer Vibes",
        thumbnail: "https://picsum.photos/seed/yt4/800/450",
        channel: "Music Global",
        views: "3.4M",
        duration: "1:20:00",
        publishedAt: "3 days ago"
      }
    ];
  },
});

import { v } from "convex/values";
import { action } from "./_generated/server";

export const aiSearch = action({
  args: {
    query: v.string(),
    clientId: v.string(),
  },
  handler: async (ctx, args) => {
    // Mock implementation for demo
    return {
      results: [
        {
          id: "v1",
          title: "Funny Zimbabwe Comedy 2025 - Best Moments",
          thumbnail: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=300",
          channel: "ZimTV",
          duration: "10:24",
          viewCount: "1.2M",
          relevanceScore: 0.95,
          aiReason: "Top trending comedy from Zimbabwe with high engagement.",
        },
        {
          id: "v2",
          title: "How to drill a borehole in Zimbabwe - Step by Step",
          thumbnail: "https://images.unsplash.com/photo-1541933224312-0595a4968102?q=80&w=300",
          channel: "DrillPro",
          duration: "15:45",
          viewCount: "50K",
          relevanceScore: 0.82,
          aiReason: "Directly answers your 'how to' query about boreholes.",
        }
      ]
    };
  },
});

export const summarizeVideo = action({
  args: {
    url: v.string(),
    clientId: v.string(),
  },
  handler: async (ctx, args) => {
    return {
      title: "Zimbabwe's Tech Boom 2025",
      thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600",
      duration: "8:12",
      channel: "TechZim",
      summary: "This video discusses the rapid growth of the technology sector in Zimbabwe, focusing on mobile payments and internet infrastructure.",
      keyPoints: [
        "Internet penetration reached 75%",
        "Mobile money transactions are at an all-time high",
        "New startup hubs opening in Bulawayo"
      ],
      sentiment: 'positive',
      topics: ['Tech', 'Africa', 'Economy'],
      confidence: 0.98,
    };
  },
});

export const getRecommendations = action({
  args: {
    clientId: v.string(),
    watchHistory: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return {
      recommendations: [
        {
          id: "r1",
          title: "Exploring Victoria Falls in 2025",
          thumbnail: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?q=80&w=300",
          channel: "TravelWorld",
          duration: "5:30",
          aiReason: "Matches your interest in Zimbabwean landmarks.",
        }
      ]
    };
  },
});

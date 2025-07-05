import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema defines your data model for the database.
// For more information, see https://docs.convex.dev/database/schema
export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
  }).index("by_clerkId", ["clerkId"]),
  
  conversations: defineTable({
    userId: v.id("users"),
    title: v.string(),
    messages: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
      timestamp: v.number(),
    })),
    analysis: v.array(v.object({
      messageIndex: v.number(),
      manipulationScore: v.number(),
      patterns: v.array(v.string()),
      explanation: v.string(),
      timestamp: v.number(),
    })),
  }).index("by_userId", ["userId"]),
  
  apiKeys: defineTable({
    userId: v.id("users"),
    openaiApiKey: v.string(),
  }).index("by_userId", ["userId"]),
});

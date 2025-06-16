// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - handles both registered users and guests
  users: defineTable({
    // Required fields for all users
    username: v.string(),
    age: v.number(),
    gender: v.union(v.literal("male"), v.literal("female"), v.literal("other")),
    isGuest: v.boolean(),
    
    // Authentication fields (only for registered users)
    email: v.optional(v.string()),
    passwordHash: v.optional(v.string()),
  
    
    bio: v.optional(v.string()),

    // Location fields
    countryCode: v.optional(v.string()), // ISO country code (e.g., "US", "IN")
    countryName: v.optional(v.string()), // Full country name (e.g., "United States", "India")
    stateCode: v.optional(v.string()),   // State/region code (e.g., "CA", "MH")
    stateName: v.optional(v.string()),   // Full state/region name (e.g., "California", "Maharashtra")

    // Enhanced status fields for real-world approach
    isOnline: v.boolean(),
    lastSeen: v.number(), // timestamp
    lastActivity: v.optional(v.number()), // last meaningful activity (typing, sending, reading)
    currentStatus: v.optional(v.union(
      v.literal("online"),      // actively using ChatNow (< 2 minutes)
      v.literal("recently_active"), // used recently (2-15 minutes)
      v.literal("away"),        // last seen 15 minutes - 24 hours
      v.literal("offline")      // last seen 24+ hours or never
    )),
    
    // Privacy settings
    allowGuestMessages: v.boolean(),
    showOnlineStatus: v.boolean(),
    
    // Account management
    isActive: v.boolean(), // for soft delete
    isBanned: v.boolean(),
    banReason: v.optional(v.string()),
    banExpiresAt: v.optional(v.number()),
    
    // Guest-specific fields
    guestSessionId: v.optional(v.string()), // for guest session management
    guestExpiresAt: v.optional(v.number()), // when guest session expires
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_username", ["username"])
  .index("by_email", ["email"])
  .index("by_online_status", ["isOnline", "isActive"])
  .index("by_current_status", ["currentStatus", "isActive"])
  .index("by_last_activity", ["lastActivity"])
  .index("by_guest_session", ["guestSessionId"])
  .index("by_guest_status", ["isGuest", "lastActivity"])
  .index("by_creation", ["createdAt"]),

  // Chat rooms/conversations
  conversations: defineTable({
    // Participants
    participantIds: v.array(v.id("users")),
    
    // Conversation metadata
    type: v.union(v.literal("direct"), v.literal("group")), // for future group chat support
    name: v.optional(v.string()), // for group chats
    
    // Last activity
    lastMessageId: v.optional(v.id("messages")),
    lastMessageAt: v.number(),
    
    // Status
    isActive: v.boolean(),
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_participants", ["participantIds"])
  .index("by_last_activity", ["lastMessageAt"])
  .index("by_creation", ["createdAt"]),

  // Messages
  messages: defineTable({
    // Core message data
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    
    // Message type and metadata
    type: v.union(
      v.literal("text"), 
      v.literal("image"), 
      v.literal("file"),
      v.literal("system") // for system messages like "user joined"
    ),
    
    fileUrl: v.optional(v.string()),
    fileName: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    fileMimeType: v.optional(v.string()),
    
    isDeleted: v.boolean(),
    deletedAt: v.optional(v.number()),
    deletedBy: v.optional(v.id("users")),
    
    readBy: v.array(v.object({
      userId: v.id("users"),
      readAt: v.number(),
    })),
    
    replyToMessageId: v.optional(v.id("messages")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_conversation", ["conversationId", "createdAt"])
  .index("by_sender", ["senderId", "createdAt"])
  .index("by_timestamp", ["createdAt"]),

  // User sessions (for tracking online status and guest sessions)
  sessions: defineTable({
    userId: v.id("users"),
    sessionToken: v.string(),
    deviceInfo: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    
    // Session status
    isActive: v.boolean(),
    lastActivity: v.number(),
    
    // Timestamps
    createdAt: v.number(),
    expiresAt: v.number(),
  })
  .index("by_user", ["userId"])
  .index("by_token", ["sessionToken"])
  .index("by_expiry", ["expiresAt"])
  .index("by_activity", ["lastActivity"]),

  activityLogs: defineTable({
    userId: v.id("users"),
    action: v.string(),
    metadata: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    createdAt: v.number(),
  })
  .index("by_user", ["userId", "createdAt"])
  .index("by_action", ["action", "createdAt"])
  .index("by_timestamp", ["createdAt"]),

  // Database cleanup logs
  cleanupLogs: defineTable({
    taskType: v.string(), // "expired_sessions", "old_messages", "typing_indicators", etc.
    itemsProcessed: v.number(),
    itemsDeleted: v.number(),
    status: v.union(v.literal("success"), v.literal("error"), v.literal("partial")),
    errorMessage: v.optional(v.string()),
    executionTimeMs: v.number(),
    dryRun: v.boolean(),
    createdAt: v.number(),
  })
  .index("by_task_type", ["taskType", "createdAt"])
  .index("by_timestamp", ["createdAt"])
  .index("by_status", ["status", "createdAt"]),

  blocks: defineTable({
    blockerId: v.id("users"),
    blockedId: v.id("users"),
    createdAt: v.number(),
  })
  .index("by_blocker", ["blockerId"])
  .index("by_blocked", ["blockedId"])
  .index("by_creation", ["createdAt"]),

  reports: defineTable({
    reporterId: v.id("users"),
    reportedUserId: v.optional(v.id("users")),
    reportedMessageId: v.optional(v.id("messages")),
    reason: v.union(
      v.literal("spam"),
      v.literal("harassment"),
      v.literal("inappropriate_content"),
      v.literal("fake_profile"),
      v.literal("underage"),
      v.literal("other")
    ),
    description: v.string(),
    screenshots: v.optional(v.array(v.string())), 
    status: v.union(
      v.literal("pending"),
      v.literal("under_review"),
      v.literal("resolved"),
      v.literal("dismissed")
    ),
    moderatorId: v.optional(v.id("users")),
    moderatorNotes: v.optional(v.string()),
    actionTaken: v.optional(v.union(
      v.literal("warning"),
      v.literal("temporary_ban"),
      v.literal("permanent_ban"),
      v.literal("content_removed"),
      v.literal("no_action")
    )),
    createdAt: v.number(),
    updatedAt: v.number(),
    resolvedAt: v.optional(v.number()),
  })
  .index("by_reporter", ["reporterId"])
  .index("by_reported_user", ["reportedUserId"])
  .index("by_reported_message", ["reportedMessageId"])
  .index("by_status", ["status", "createdAt"])
  .index("by_moderator", ["moderatorId"]),

  // Typing indicators
  typingIndicators: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    username: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_conversation", ["conversationId"])
  .index("by_conversation_user", ["conversationId", "userId"])
  .index("by_expiry", ["expiresAt"]),

});

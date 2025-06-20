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

    // Group restrictions
    hasCreatedGroup: v.optional(v.boolean()), // to enforce one group per user limit
    createdGroupId: v.optional(v.id("groups")), // reference to user's created group

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
  .index("by_creation", ["createdAt"])
  .index("by_group_creation", ["hasCreatedGroup"]),

  // Groups table for managing group chats
  groups: defineTable({
    name: v.string(),
    description: v.optional(v.string()),

    // Group type and ownership
    type: v.union(
      v.literal("permanent"), // App-managed permanent groups
      v.literal("user_created") // User-created groups
    ),
    creatorId: v.optional(v.id("users")), // null for permanent groups

    // Group settings
    maxMembers: v.number(), // member limit
    isPublic: v.boolean(), // can anyone join or invite-only
    requiresApproval: v.boolean(), // does creator need to approve joins

    // Group avatar/image
    avatarUrl: v.optional(v.string()),

    // Activity tracking
    lastActivity: v.number(), // for cleanup automation
    memberCount: v.number(), // denormalized for performance

    // Status
    isActive: v.boolean(),
    isArchived: v.boolean(), // for soft delete
    archivedReason: v.optional(v.string()),

    // Automation settings for user-created groups
    inactivityThresholdDays: v.optional(v.number()), // days before deletion
    markedForDeletion: v.boolean(),
    deletionScheduledAt: v.optional(v.number()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_type", ["type", "isActive"])
  .index("by_creator", ["creatorId"])
  .index("by_activity", ["lastActivity", "type"])
  .index("by_deletion_schedule", ["markedForDeletion", "deletionScheduledAt"])
  .index("by_public", ["isPublic", "isActive"])
  .index("by_creation", ["createdAt"]),

  // Group memberships - separate table for better performance and flexibility
  groupMemberships: defineTable({
    groupId: v.id("groups"),
    userId: v.id("users"),

    // Membership role and permissions
    role: v.union(
      v.literal("creator"), // group creator (for user-created groups)
      v.literal("admin"),   // can manage group settings and members
      v.literal("moderator"), // can manage messages and kick members
      v.literal("member")   // regular member
    ),

    // Membership status
    status: v.union(
      v.literal("active"),
      v.literal("pending"), // waiting for approval
      v.literal("banned"),
      v.literal("left")
    ),

    // Join metadata
    joinedAt: v.number(),
    invitedBy: v.optional(v.id("users")),

    // Activity in group
    lastReadMessageId: v.optional(v.id("messages")),
    lastSeenAt: v.number(),

    // Notifications
    mutedUntil: v.optional(v.number()), // mute notifications until timestamp

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_group", ["groupId", "status"])
  .index("by_user", ["userId", "status"])
  .index("by_group_user", ["groupId", "userId"])
  .index("by_role", ["role", "status"])
  .index("by_join_date", ["joinedAt"]),

  // Chat rooms/conversations - updated to support groups
  conversations: defineTable({
    // Participants (for direct messages only)
    participantIds: v.optional(v.array(v.id("users"))),

    // Group reference (for group conversations)
    groupId: v.optional(v.id("groups")),

    // Conversation metadata
    type: v.union(
      v.literal("direct"),
      v.literal("group")
    ),
    name: v.optional(v.string()), // for group chats, derived from group name

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
  .index("by_group", ["groupId"])
  .index("by_type", ["type", "isActive"])
  .index("by_last_activity", ["lastMessageAt"])
  .index("by_creation", ["createdAt"]),

  // Messages - updated to support group context
  messages: defineTable({
    // Core message data
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),

    // Group context (denormalized for performance)
    groupId: v.optional(v.id("groups")),

    // Message type and metadata
    type: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("file"),
      v.literal("system") // for system messages like "user joined", "user left", etc.
    ),

    fileUrl: v.optional(v.string()),
    fileName: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    fileMimeType: v.optional(v.string()),

    isDeleted: v.boolean(),
    deletedAt: v.optional(v.number()),
    deletedBy: v.optional(v.id("users")),

    // Read receipts (for group messages, this will be in separate table for performance)
    readBy: v.array(v.object({
      userId: v.id("users"),
      readAt: v.number(),
    })),

    replyToMessageId: v.optional(v.id("messages")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_conversation", ["conversationId", "createdAt"])
  .index("by_group", ["groupId", "createdAt"])
  .index("by_sender", ["senderId", "createdAt"])
  .index("by_timestamp", ["createdAt"]),

  // Separate table for group message read receipts (better performance for large groups)
  groupMessageReads: defineTable({
    messageId: v.id("messages"),
    groupId: v.id("groups"),
    userId: v.id("users"),
    readAt: v.number(),
  })
  .index("by_message", ["messageId"])
  .index("by_group_user", ["groupId", "userId"])
  .index("by_user_read_time", ["userId", "readAt"]),

  // Group invitations
  groupInvitations: defineTable({
    groupId: v.id("groups"),
    inviterUserId: v.id("users"),
    invitedUserId: v.optional(v.id("users")), // null if invited by username/email
    invitedUsername: v.optional(v.string()),
    invitedEmail: v.optional(v.string()),

    // Invitation details
    inviteCode: v.optional(v.string()), // for public group invites
    message: v.optional(v.string()), // custom invitation message

    // Status
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("expired"),
      v.literal("cancelled")
    ),

    // Expiry
    expiresAt: v.number(),

    // Response
    respondedAt: v.optional(v.number()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_group", ["groupId", "status"])
  .index("by_inviter", ["inviterUserId"])
  .index("by_invited_user", ["invitedUserId", "status"])
  .index("by_invited_username", ["invitedUsername", "status"])
  .index("by_invite_code", ["inviteCode"])
  .index("by_expiry", ["expiresAt", "status"])
  .index("by_creation", ["createdAt"]),

  // Group activity logs
  groupActivityLogs: defineTable({
    groupId: v.id("groups"),
    userId: v.optional(v.id("users")), // null for system actions
    action: v.union(
      v.literal("created"),
      v.literal("deleted"),
      v.literal("updated"),
      v.literal("member_joined"),
      v.literal("member_left"),
      v.literal("member_removed"),
      v.literal("member_promoted"),
      v.literal("member_demoted"),
      v.literal("member_banned"),
      v.literal("archived"),
      v.literal("unarchived"),
      v.literal("scheduled_for_deletion")
    ),
    targetUserId: v.optional(v.id("users")), // for member-related actions
    metadata: v.optional(v.string()), // JSON string with additional details

    createdAt: v.number(),
  })
  .index("by_group", ["groupId", "createdAt"])
  .index("by_user", ["userId", "createdAt"])
  .index("by_action", ["action", "createdAt"])
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

  // Database cleanup logs - enhanced for group cleanup
  cleanupLogs: defineTable({
    taskType: v.string(), // "expired_sessions", "old_messages", "inactive_groups", "typing_indicators", etc.
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
    reportedGroupId: v.optional(v.id("groups")), // for reporting groups
    reason: v.union(
      v.literal("spam"),
      v.literal("harassment"),
      v.literal("inappropriate_content"),
      v.literal("fake_profile"),
      v.literal("underage"),
      v.literal("inappropriate_group_content"),
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
      v.literal("group_deleted"),
      v.literal("no_action")
    )),
    createdAt: v.number(),
    updatedAt: v.number(),
    resolvedAt: v.optional(v.number()),
  })
  .index("by_reporter", ["reporterId"])
  .index("by_reported_user", ["reportedUserId"])
  .index("by_reported_message", ["reportedMessageId"])
  .index("by_reported_group", ["reportedGroupId"])
  .index("by_status", ["status", "createdAt"])
  .index("by_moderator", ["moderatorId"]),

  // Typing indicators - enhanced for groups
  typingIndicators: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    username: v.string(),
    groupId: v.optional(v.id("groups")), // for group typing indicators
    createdAt: v.number(),
    expiresAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_conversation", ["conversationId"])
  .index("by_group", ["groupId"])
  .index("by_conversation_user", ["conversationId", "userId"])
  .index("by_group_user", ["groupId", "userId"])
  .index("by_expiry", ["expiresAt"]),

  // Contact form submissions
  contactSubmissions: defineTable({
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),

    // Metadata
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),

    // Timestamps
    createdAt: v.number(),
  })
  .index("by_email", ["email"])
  .index("by_creation", ["createdAt"]),

  // Blog posts
  blogPosts: defineTable({
    title: v.string(),
    slug: v.string(), // URL-friendly version of title
    excerpt: v.string(), // Short description
    content: v.string(), // Full blog content (markdown)
    coverImage: v.optional(v.string()), // Cover image URL

    // Author info
    author: v.string(),
    authorImage: v.optional(v.string()),

    // Categories and tags
    category: v.string(),
    tags: v.array(v.string()),

    // Publishing
    isPublished: v.boolean(),
    publishedAt: v.optional(v.number()),

    // SEO
    metaDescription: v.optional(v.string()),

    // Engagement
    readTime: v.number(), // estimated read time in minutes
    views: v.number(),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_slug", ["slug"])
  .index("by_published", ["isPublished", "publishedAt"])
  .index("by_category", ["category", "isPublished"])
  .index("by_author", ["author", "publishedAt"])
  .index("by_creation", ["createdAt"]),

});

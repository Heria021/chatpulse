import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Get all active users (for Users tab)
export const getActiveUsers = query({
  args: { 
    sessionToken: v.string(),
    searchQuery: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // First, verify the session and get current user
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("sessionToken", args.sessionToken))
      .first();

    if (!session || !session.isActive || session.expiresAt < Date.now()) {
      throw new Error("Invalid or expired session");
    }

    const currentUser = await ctx.db.get(session.userId);
    if (!currentUser || !currentUser.isActive) {
      throw new Error("Current user not found or inactive");
    }

    // Query for active users (excluding current user)
    let usersQuery = ctx.db
      .query("users")
      .withIndex("by_online_status", (q) => q.eq("isOnline", true).eq("isActive", true));

    const users = await usersQuery.collect();

    // Get blocked users by current user
    const blockedUsers = await ctx.db
      .query("blocks")
      .withIndex("by_blocker", (q) => q.eq("blockerId", currentUser._id))
      .collect();

    const blockedUserIds = new Set(blockedUsers.map(block => block.blockedId));

    // Filter out current user, blocked users, and apply other filters
    let filteredUsers = users.filter(user =>
      user._id !== currentUser._id &&
      !user.isBanned &&
      !blockedUserIds.has(user._id) &&
      user.showOnlineStatus // Respect privacy settings
    );

    // Apply search filter if provided
    if (args.searchQuery && args.searchQuery.trim()) {
      const searchLower = args.searchQuery.toLowerCase().trim();
      filteredUsers = filteredUsers.filter(user =>
        user.username.toLowerCase().includes(searchLower)
      );
    }

    // Return user data with necessary fields
    return filteredUsers.map(user => ({
      _id: user._id,
      username: user.username,
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
      isGuest: user.isGuest,
      bio: user.bio,
      age: user.age,
      gender: user.gender,
      allowGuestMessages: user.allowGuestMessages,
      showOnlineStatus: user.showOnlineStatus
    }));
  },
});

// Get users with mutual chat history (for Chats tab)
export const getUsersWithMutualChats = query({
  args: { 
    sessionToken: v.string(),
    searchQuery: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // First, verify the session and get current user
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("sessionToken", args.sessionToken))
      .first();

    if (!session || !session.isActive || session.expiresAt < Date.now()) {
      throw new Error("Invalid or expired session");
    }

    const currentUser = await ctx.db.get(session.userId);
    if (!currentUser || !currentUser.isActive) {
      throw new Error("Current user not found or inactive");
    }

    // Find all conversations where current user is a participant
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_participants", (q) => q.eq("participantIds", [currentUser._id]))
      .collect();

    // Also find conversations where current user is in the participants array
    const allConversations = await ctx.db
      .query("conversations")
      .collect();

    const userConversations = allConversations.filter(conv =>
      conv.participantIds.includes(currentUser._id) &&
      conv.isActive &&
      conv.type === "direct" // Only direct conversations for now
    );

    // Get blocked users by current user
    const blockedUsers = await ctx.db
      .query("blocks")
      .withIndex("by_blocker", (q) => q.eq("blockerId", currentUser._id))
      .collect();

    const blockedUserIds = new Set(blockedUsers.map(block => block.blockedId));

    // For each conversation, check if there are mutual messages
    const mutualChatUsers = [];
    
    for (const conversation of userConversations) {
      // Get other participant(s)
      const otherParticipantIds = conversation.participantIds.filter(id => id !== currentUser._id);
      
      for (const otherUserId of otherParticipantIds) {
        // Check if both users have sent messages in this conversation
        const currentUserMessages = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) => q.eq("conversationId", conversation._id))
          .filter((q) => q.eq(q.field("senderId"), currentUser._id))
          .filter((q) => q.eq(q.field("isDeleted"), false))
          .first();

        const otherUserMessages = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) => q.eq("conversationId", conversation._id))
          .filter((q) => q.eq(q.field("senderId"), otherUserId))
          .filter((q) => q.eq(q.field("isDeleted"), false))
          .first();

        // Only include if both users have sent messages (mutual conversation)
        if (currentUserMessages && otherUserMessages) {
          const otherUser = await ctx.db.get(otherUserId);
          if (otherUser && otherUser.isActive && !otherUser.isBanned && !blockedUserIds.has(otherUserId)) {
            // Get the last message in this conversation
            const lastMessage = await ctx.db
              .query("messages")
              .withIndex("by_conversation", (q) => q.eq("conversationId", conversation._id))
              .filter((q) => q.eq(q.field("isDeleted"), false))
              .order("desc")
              .first();

            // Count unread messages for current user
            const unreadMessages = await ctx.db
              .query("messages")
              .withIndex("by_conversation", (q) => q.eq("conversationId", conversation._id))
              .filter((q) => q.neq(q.field("senderId"), currentUser._id))
              .filter((q) => q.eq(q.field("isDeleted"), false))
              .collect();

            const unreadCount = unreadMessages.filter(msg => 
              !msg.readBy.some(read => read.userId === currentUser._id)
            ).length;

            mutualChatUsers.push({
              _id: otherUser._id,
              username: otherUser.username,
              isOnline: otherUser.isOnline,
              lastSeen: otherUser.lastSeen,
              isGuest: otherUser.isGuest,
              bio: otherUser.bio,
              age: otherUser.age,
              gender: otherUser.gender,
              allowGuestMessages: otherUser.allowGuestMessages,
              showOnlineStatus: otherUser.showOnlineStatus,
              conversationId: conversation._id,
              lastMessage: lastMessage ? {
                content: lastMessage.content,
                timestamp: lastMessage.createdAt,
                senderId: lastMessage.senderId
              } : null,
              lastMessageAt: conversation.lastMessageAt,
              unreadCount
            });
          }
        }
      }
    }

    // Remove duplicates and sort by last message time
    const uniqueUsers = mutualChatUsers.reduce((acc, user) => {
      const existing = acc.find(u => u._id === user._id);
      if (!existing || user.lastMessageAt > existing.lastMessageAt) {
        return [...acc.filter(u => u._id !== user._id), user];
      }
      return acc;
    }, [] as typeof mutualChatUsers);

    // Apply search filter if provided
    let filteredUsers = uniqueUsers;
    if (args.searchQuery && args.searchQuery.trim()) {
      const searchLower = args.searchQuery.toLowerCase().trim();
      filteredUsers = uniqueUsers.filter(user =>
        user.username.toLowerCase().includes(searchLower)
      );
    }

    // Sort by last message time (most recent first)
    return filteredUsers.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  },
});

// Report a user (automatically blocks them too)
export const reportUser = mutation({
  args: {
    sessionToken: v.string(),
    reportedUserId: v.id("users"),
    reason: v.union(
      v.literal("spam"),
      v.literal("harassment"),
      v.literal("inappropriate_content"),
      v.literal("fake_profile"),
      v.literal("underage"),
      v.literal("other")
    ),
    description: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // Verify session and get current user
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("sessionToken", args.sessionToken))
      .first();

    if (!session || !session.isActive || session.expiresAt < Date.now()) {
      throw new ConvexError("Authentication required. Please sign in again.");
    }

    const currentUser = await ctx.db.get(session.userId);
    if (!currentUser || !currentUser.isActive) {
      throw new ConvexError("User account not found or deactivated");
    }

    // Check if user is banned (banned users can't report)
    if (currentUser.isBanned) {
      throw new ConvexError("Your account is restricted and cannot submit reports");
    }

    // Verify reported user exists and is active
    const reportedUser = await ctx.db.get(args.reportedUserId);
    if (!reportedUser || !reportedUser.isActive) {
      throw new ConvexError("The user you're trying to report no longer exists");
    }

    // Can't report yourself
    if (currentUser._id === args.reportedUserId) {
      throw new ConvexError("You cannot report yourself");
    }

    // Rate limiting: Check if user has reported too many users recently (last 24 hours)
    const recentReports = await ctx.db
      .query("reports")
      .withIndex("by_reporter", (q) => q.eq("reporterId", currentUser._id))
      .filter((q) => q.gt(q.field("createdAt"), Date.now() - 24 * 60 * 60 * 1000))
      .collect();

    if (recentReports.length >= 5) {
      throw new ConvexError("You have reached the daily limit for reports. Please try again tomorrow.");
    }

    // Check if user has already reported this person
    const existingReport = await ctx.db
      .query("reports")
      .withIndex("by_reporter", (q) => q.eq("reporterId", currentUser._id))
      .filter((q) => q.eq(q.field("reportedUserId"), args.reportedUserId))
      .first();

    if (existingReport) {
      throw new ConvexError("You have already reported this user");
    }

    // Validate description length
    if (args.description && args.description.length > 500) {
      throw new ConvexError("Description must be 500 characters or less");
    }

    const now = Date.now();

    try {
      // Create report record
      await ctx.db.insert("reports", {
        reporterId: currentUser._id,
        reportedUserId: args.reportedUserId,
        reason: args.reason,
        description: args.description || "",
        status: "pending",
        createdAt: now,
        updatedAt: now
      });

      // Check if user is already blocked to avoid duplicate blocks
      const existingBlock = await ctx.db
        .query("blocks")
        .withIndex("by_blocker", (q) => q.eq("blockerId", currentUser._id))
        .filter((q) => q.eq(q.field("blockedId"), args.reportedUserId))
        .first();

      // Auto-block the reported user for the reporter (if not already blocked)
      if (!existingBlock) {
        await ctx.db.insert("blocks", {
          blockerId: currentUser._id,
          blockedId: args.reportedUserId,
          createdAt: now
        });
      }

      // Log the activity with more details
      await ctx.db.insert("activityLogs", {
        userId: currentUser._id,
        action: "report_user",
        metadata: JSON.stringify({
          reportedUserId: args.reportedUserId,
          reportedUsername: reportedUser.username,
          reason: args.reason,
          hasDescription: !!args.description,
          autoBlocked: !existingBlock
        }),
        createdAt: now
      });

      return {
        success: true,
        message: "Report submitted successfully. The user has been blocked and our moderation team will review your report.",
        autoBlocked: !existingBlock
      };
    } catch (error) {
      // Log failed report attempts for security monitoring
      await ctx.db.insert("activityLogs", {
        userId: currentUser._id,
        action: "report_user_failed",
        metadata: JSON.stringify({
          reportedUserId: args.reportedUserId,
          reason: args.reason,
          error: error instanceof Error ? error.message : "Unknown error"
        }),
        createdAt: now
      });

      throw new ConvexError("Failed to submit report. Please try again.");
    }
  }
});

// Block a user
export const blockUser = mutation({
  args: {
    sessionToken: v.string(),
    blockedUserId: v.id("users"),
    reason: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // Verify session and get current user
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("sessionToken", args.sessionToken))
      .first();

    if (!session || !session.isActive || session.expiresAt < Date.now()) {
      throw new ConvexError("Authentication required. Please sign in again.");
    }

    const currentUser = await ctx.db.get(session.userId);
    if (!currentUser || !currentUser.isActive) {
      throw new ConvexError("User account not found or deactivated");
    }

    // Check if user is banned
    if (currentUser.isBanned) {
      throw new ConvexError("Your account is restricted and cannot block users");
    }

    // Verify blocked user exists and is active
    const blockedUser = await ctx.db.get(args.blockedUserId);
    if (!blockedUser || !blockedUser.isActive) {
      throw new ConvexError("The user you're trying to block no longer exists");
    }

    // Can't block yourself
    if (currentUser._id === args.blockedUserId) {
      throw new ConvexError("You cannot block yourself");
    }

    // Rate limiting: Check if user has blocked too many users recently (last 24 hours)
    const recentBlocks = await ctx.db
      .query("blocks")
      .withIndex("by_blocker", (q) => q.eq("blockerId", currentUser._id))
      .filter((q) => q.gt(q.field("createdAt"), Date.now() - 24 * 60 * 60 * 1000))
      .collect();

    if (recentBlocks.length >= 10) {
      throw new ConvexError("You have reached the daily limit for blocking users. Please try again tomorrow.");
    }

    // Check if already blocked
    const existingBlock = await ctx.db
      .query("blocks")
      .withIndex("by_blocker", (q) => q.eq("blockerId", currentUser._id))
      .filter((q) => q.eq(q.field("blockedId"), args.blockedUserId))
      .first();

    if (existingBlock) {
      throw new ConvexError("This user is already blocked");
    }

    const now = Date.now();

    try {
      // Create block record
      await ctx.db.insert("blocks", {
        blockerId: currentUser._id,
        blockedId: args.blockedUserId,
        createdAt: now
      });

      // Log the activity with more details
      await ctx.db.insert("activityLogs", {
        userId: currentUser._id,
        action: "block_user",
        metadata: JSON.stringify({
          blockedUserId: args.blockedUserId,
          blockedUsername: blockedUser.username,
          reason: args.reason || "Manual block",
          blockedUserType: blockedUser.isGuest ? "guest" : "registered"
        }),
        createdAt: now
      });

      return {
        success: true,
        message: `${blockedUser.username} has been blocked successfully`,
        blockedUsername: blockedUser.username
      };
    } catch (error) {
      // Log failed block attempts
      await ctx.db.insert("activityLogs", {
        userId: currentUser._id,
        action: "block_user_failed",
        metadata: JSON.stringify({
          blockedUserId: args.blockedUserId,
          reason: args.reason,
          error: error instanceof Error ? error.message : "Unknown error"
        }),
        createdAt: now
      });

      throw new ConvexError("Failed to block user. Please try again.");
    }
  }
});

// Update user profile
export const updateProfile = mutation({
  args: {
    sessionToken: v.string(),
    username: v.string(),
    bio: v.optional(v.string()),
    age: v.number(),
    gender: v.union(v.literal("male"), v.literal("female"), v.literal("other")),
    allowGuestMessages: v.boolean(),
    showOnlineStatus: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Verify session and get current user
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("sessionToken", args.sessionToken))
      .first();

    if (!session || !session.isActive || session.expiresAt < Date.now()) {
      throw new ConvexError("Authentication required. Please sign in again.");
    }

    const currentUser = await ctx.db.get(session.userId);
    if (!currentUser || !currentUser.isActive) {
      throw new ConvexError("User account not found or deactivated");
    }

    // Check if username is being changed and if it's available
    if (args.username !== currentUser.username) {
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", args.username))
        .first();

      if (existingUser && existingUser._id !== currentUser._id) {
        throw new ConvexError("Username is already taken");
      }
    }

    try {
      const now = Date.now();

      // Update user profile
      await ctx.db.patch(currentUser._id, {
        username: args.username,
        bio: args.bio || undefined,
        age: args.age,
        gender: args.gender,
        allowGuestMessages: args.allowGuestMessages,
        showOnlineStatus: args.showOnlineStatus,
        updatedAt: now,
      });

      // Log activity
      await ctx.db.insert("activityLogs", {
        userId: currentUser._id,
        action: "update_profile",
        metadata: JSON.stringify({
          updatedFields: {
            username: args.username !== currentUser.username,
            bio: args.bio !== currentUser.bio,
            age: args.age !== currentUser.age,
            gender: args.gender !== currentUser.gender,
            allowGuestMessages: args.allowGuestMessages !== currentUser.allowGuestMessages,
            showOnlineStatus: args.showOnlineStatus !== currentUser.showOnlineStatus,
          }
        }),
        createdAt: now
      });

      return { success: true };
    } catch (error) {
      // Log failed update attempts
      await ctx.db.insert("activityLogs", {
        userId: currentUser._id,
        action: "update_profile_failed",
        metadata: JSON.stringify({
          error: error instanceof Error ? error.message : "Unknown error"
        }),
        createdAt: Date.now()
      });

      throw new ConvexError("Failed to update profile. Please try again.");
    }
  }
});

// Unblock a user
export const unblockUser = mutation({
  args: {
    sessionToken: v.string(),
    blockedUserId: v.id("users")
  },
  handler: async (ctx, args) => {
    // Verify session and get current user
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("sessionToken", args.sessionToken))
      .first();

    if (!session || !session.isActive || session.expiresAt < Date.now()) {
      throw new ConvexError("Authentication required. Please sign in again.");
    }

    const currentUser = await ctx.db.get(session.userId);
    if (!currentUser || !currentUser.isActive) {
      throw new ConvexError("User account not found or deactivated");
    }

    // Get the blocked user info for logging
    const blockedUser = await ctx.db.get(args.blockedUserId);
    const blockedUsername = blockedUser?.username || "Unknown User";

    // Find the block record
    const blockRecord = await ctx.db
      .query("blocks")
      .withIndex("by_blocker", (q) => q.eq("blockerId", currentUser._id))
      .filter((q) => q.eq(q.field("blockedId"), args.blockedUserId))
      .first();

    if (!blockRecord) {
      throw new ConvexError("This user is not currently blocked");
    }

    const now = Date.now();

    try {
      // Remove the block
      await ctx.db.delete(blockRecord._id);

      // Log the activity with more details
      await ctx.db.insert("activityLogs", {
        userId: currentUser._id,
        action: "unblock_user",
        metadata: JSON.stringify({
          blockedUserId: args.blockedUserId,
          blockedUsername: blockedUsername,
          blockDuration: now - blockRecord.createdAt
        }),
        createdAt: now
      });

      return {
        success: true,
        message: `${blockedUsername} has been unblocked successfully`,
        unblockedUsername: blockedUsername
      };
    } catch (error) {
      // Log failed unblock attempts
      await ctx.db.insert("activityLogs", {
        userId: currentUser._id,
        action: "unblock_user_failed",
        metadata: JSON.stringify({
          blockedUserId: args.blockedUserId,
          error: error instanceof Error ? error.message : "Unknown error"
        }),
        createdAt: now
      });

      throw new ConvexError("Failed to unblock user. Please try again.");
    }
  }
});

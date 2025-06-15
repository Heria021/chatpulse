import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Get or create a conversation between two users
export const getOrCreateConversation = mutation({
  args: {
    sessionToken: v.string(),
    otherUserId: v.id("users")
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

    // Verify other user exists and is active
    const otherUser = await ctx.db.get(args.otherUserId);
    if (!otherUser || !otherUser.isActive) {
      throw new ConvexError("The user you're trying to chat with no longer exists");
    }

    // Can't chat with yourself
    if (currentUser._id === args.otherUserId) {
      throw new ConvexError("You cannot start a conversation with yourself");
    }

    // Check if current user is blocked by the other user
    const isBlockedByOther = await ctx.db
      .query("blocks")
      .withIndex("by_blocker", (q) => q.eq("blockerId", args.otherUserId))
      .filter((q) => q.eq(q.field("blockedId"), currentUser._id))
      .first();

    if (isBlockedByOther) {
      throw new ConvexError("This user has blocked you");
    }

    // Check if other user is blocked by current user
    const hasBlockedOther = await ctx.db
      .query("blocks")
      .withIndex("by_blocker", (q) => q.eq("blockerId", currentUser._id))
      .filter((q) => q.eq(q.field("blockedId"), args.otherUserId))
      .first();

    if (hasBlockedOther) {
      throw new ConvexError("You have blocked this user");
    }

    // Check privacy settings for guest users
    if (currentUser.isGuest && !otherUser.allowGuestMessages) {
      throw new ConvexError("This user doesn't accept messages from guest users");
    }

    // Look for existing conversation
    const allConversations = await ctx.db
      .query("conversations")
      .collect();

    const existingConversation = allConversations.find(conv => 
      conv.type === "direct" &&
      conv.isActive &&
      conv.participantIds.includes(currentUser._id) &&
      conv.participantIds.includes(args.otherUserId) &&
      conv.participantIds.length === 2
    );

    if (existingConversation) {
      // Calculate current status based on activity
      const now = Date.now();
      const timeSinceActivity = now - (otherUser.lastActivity || otherUser.lastSeen);
      let currentStatus: "online" | "recently_active" | "away" | "offline" = "offline";

      if (timeSinceActivity < 2 * 60 * 1000) { // 2 minutes
        currentStatus = "online";
      } else if (timeSinceActivity < 5 * 60 * 1000) { // 5 minutes
        currentStatus = "recently_active";
      } else if (timeSinceActivity < 24 * 60 * 60 * 1000) { // 24 hours
        currentStatus = "away";
      }

      return {
        conversationId: existingConversation._id,
        otherUser: {
          _id: otherUser._id,
          username: otherUser.username,
          isOnline: otherUser.isOnline,
          lastSeen: otherUser.lastSeen,
          lastActivity: otherUser.lastActivity || otherUser.lastSeen,
          currentStatus,
          showOnlineStatus: otherUser.showOnlineStatus ?? true,
          isGuest: otherUser.isGuest,
          bio: otherUser.bio,
          age: otherUser.age,
          gender: otherUser.gender
        }
      };
    }

    // Create new conversation
    const conversationNow = Date.now();
    const conversationId = await ctx.db.insert("conversations", {
      participantIds: [currentUser._id, args.otherUserId],
      type: "direct",
      lastMessageAt: conversationNow,
      isActive: true,
      createdAt: conversationNow,
      updatedAt: conversationNow
    });

    // Calculate current status for new conversation
    const statusNow = Date.now();
    const timeSinceActivity = statusNow - (otherUser.lastActivity || otherUser.lastSeen);
    let currentStatus: "online" | "recently_active" | "away" | "offline" = "offline";

    if (timeSinceActivity < 2 * 60 * 1000) { // 2 minutes
      currentStatus = "online";
    } else if (timeSinceActivity < 5 * 60 * 1000) { // 5 minutes
      currentStatus = "recently_active";
    } else if (timeSinceActivity < 24 * 60 * 60 * 1000) { // 24 hours
      currentStatus = "away";
    }

    return {
      conversationId,
      otherUser: {
        _id: otherUser._id,
        username: otherUser.username,
        isOnline: otherUser.isOnline,
        lastSeen: otherUser.lastSeen,
        lastActivity: otherUser.lastActivity || otherUser.lastSeen,
        currentStatus,
        showOnlineStatus: otherUser.showOnlineStatus ?? true,
        isGuest: otherUser.isGuest,
        bio: otherUser.bio,
        age: otherUser.age,
        gender: otherUser.gender
      }
    };
  }
});

// Get messages for a conversation
export const getMessages = query({
  args: {
    sessionToken: v.string(),
    conversationId: v.id("conversations"),
    limit: v.optional(v.number())
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

    // Verify conversation exists and user is a participant
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || !conversation.isActive) {
      throw new ConvexError("Conversation not found");
    }

    if (!conversation.participantIds.includes(currentUser._id)) {
      throw new ConvexError("You don't have access to this conversation");
    }

    // Get messages
    const limit = args.limit || 50;
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .order("desc")
      .take(limit);

    // Reverse to get chronological order (oldest first)
    const chronologicalMessages = messages.reverse();

    // Get sender information and reply details for each message
    const messagesWithSenders = await Promise.all(
      chronologicalMessages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);

        // Get reply details if this message is a reply
        let replyToMessage = null;
        if (message.replyToMessageId) {
          const originalMessage = await ctx.db.get(message.replyToMessageId);
          if (originalMessage) {
            const originalSender = await ctx.db.get(originalMessage.senderId);
            replyToMessage = {
              _id: originalMessage._id,
              content: originalMessage.content,
              type: originalMessage.type,
              senderUsername: originalSender?.username || "Unknown User",
              fileName: originalMessage.fileName,
              fileMimeType: originalMessage.fileMimeType
            };
          }
        }

        return {
          _id: message._id,
          content: message.content,
          type: message.type,
          senderId: message.senderId,
          senderUsername: sender?.username || "Unknown User",
          isOwn: message.senderId === currentUser._id,
          createdAt: message.createdAt,
          readBy: message.readBy,
          replyToMessageId: message.replyToMessageId,
          replyToMessage,
          fileUrl: message.fileUrl,
          fileName: message.fileName,
          fileSize: message.fileSize,
          fileMimeType: message.fileMimeType
        };
      })
    );

    return messagesWithSenders;
  }
});

// Generate upload URL for file attachments
export const generateUploadUrl = mutation({
  args: {
    sessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify session
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("sessionToken", args.sessionToken))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (!session) {
      throw new ConvexError("Invalid session");
    }

    // Check if session is expired
    if (session.expiresAt < Date.now()) {
      throw new ConvexError("Session expired");
    }

    // Generate and return upload URL
    return await ctx.storage.generateUploadUrl();
  }
});

// Send a new message
export const sendMessage = mutation({
  args: {
    sessionToken: v.string(),
    conversationId: v.id("conversations"),
    content: v.string(),
    type: v.optional(v.union(v.literal("text"), v.literal("image"), v.literal("file"))),
    replyToMessageId: v.optional(v.id("messages")),
    // File attachment fields
    storageId: v.optional(v.id("_storage")),
    fileName: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    fileMimeType: v.optional(v.string())
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
    if (!currentUser || !currentUser.isActive || currentUser.isBanned) {
      throw new ConvexError("User account not found, deactivated, or banned");
    }

    // Verify conversation exists and user is a participant
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || !conversation.isActive) {
      throw new ConvexError("Conversation not found");
    }

    if (!conversation.participantIds.includes(currentUser._id)) {
      throw new ConvexError("You don't have access to this conversation");
    }

    // Get the other participant to check blocking status
    const otherUserId = conversation.participantIds.find(id => id !== currentUser._id);
    if (otherUserId) {
      // Check if current user is blocked by the other user
      const isBlockedByOther = await ctx.db
        .query("blocks")
        .withIndex("by_blocker", (q) => q.eq("blockerId", otherUserId))
        .filter((q) => q.eq(q.field("blockedId"), currentUser._id))
        .first();

      if (isBlockedByOther) {
        throw new ConvexError("This user has blocked you");
      }

      // Check if other user is blocked by current user
      const hasBlockedOther = await ctx.db
        .query("blocks")
        .withIndex("by_blocker", (q) => q.eq("blockerId", currentUser._id))
        .filter((q) => q.eq(q.field("blockedId"), otherUserId))
        .first();

      if (hasBlockedOther) {
        throw new ConvexError("You have blocked this user");
      }
    }

    // Validate message content
    const isFileMessage = args.type === "image" || args.type === "file";

    if (!isFileMessage && !args.content.trim()) {
      throw new ConvexError("Message cannot be empty");
    }

    if (!isFileMessage && args.content.length > 2000) {
      throw new ConvexError("Message is too long (max 2000 characters)");
    }

    // Validate file attachment
    if (isFileMessage) {
      if (!args.storageId) {
        throw new ConvexError("File attachment is required for file messages");
      }
      if (!args.fileName) {
        throw new ConvexError("File name is required for file messages");
      }
      if (!args.fileSize) {
        throw new ConvexError("File size is required for file messages");
      }
      if (!args.fileMimeType) {
        throw new ConvexError("File MIME type is required for file messages");
      }

      // Validate file size (50MB limit)
      if (args.fileSize > 50 * 1024 * 1024) {
        throw new ConvexError("File size too large (max 50MB)");
      }
    }

    // Check if replying to a valid message
    if (args.replyToMessageId) {
      const replyToMessage = await ctx.db.get(args.replyToMessageId);
      if (!replyToMessage || replyToMessage.conversationId !== args.conversationId) {
        throw new ConvexError("Invalid reply message");
      }
    }

    const now = Date.now();

    // Create the message
    const messageData: any = {
      conversationId: args.conversationId,
      senderId: currentUser._id,
      content: args.content?.trim() || "",
      type: args.type || "text",
      isDeleted: false,
      readBy: [{
        userId: currentUser._id,
        readAt: now
      }],
      replyToMessageId: args.replyToMessageId,
      createdAt: now,
      updatedAt: now
    };

    // Add file fields if it's a file message
    if (isFileMessage && args.storageId) {
      messageData.fileUrl = await ctx.storage.getUrl(args.storageId);
      messageData.fileName = args.fileName;
      messageData.fileSize = args.fileSize;
      messageData.fileMimeType = args.fileMimeType;
    }

    const messageId = await ctx.db.insert("messages", messageData);

    // Update conversation's last message info
    await ctx.db.patch(args.conversationId, {
      lastMessageId: messageId,
      lastMessageAt: now,
      updatedAt: now
    });

    // Log the activity
    await ctx.db.insert("activityLogs", {
      userId: currentUser._id,
      action: "send_message",
      metadata: JSON.stringify({
        conversationId: args.conversationId,
        messageId: messageId,
        messageType: args.type || "text",
        hasReply: !!args.replyToMessageId
      }),
      createdAt: now
    });

    return { messageId, success: true };
  }
});

// Mark messages as read
export const markMessagesAsRead = mutation({
  args: {
    sessionToken: v.string(),
    conversationId: v.id("conversations")
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

    // Verify conversation exists and user is a participant
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || !conversation.isActive) {
      throw new ConvexError("Conversation not found");
    }

    if (!conversation.participantIds.includes(currentUser._id)) {
      throw new ConvexError("You don't have access to this conversation");
    }

    // Get unread messages in this conversation
    const unreadMessages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect();

    const now = Date.now();

    // Mark messages as read
    for (const message of unreadMessages) {
      // Skip if already read by current user
      if (message.readBy.some(read => read.userId === currentUser._id)) {
        continue;
      }

      // Add read receipt
      await ctx.db.patch(message._id, {
        readBy: [
          ...message.readBy,
          {
            userId: currentUser._id,
            readAt: now
          }
        ]
      });
    }

    return { success: true };
  }
});

// Get current user info for chat
export const getCurrentUser = query({
  args: {
    sessionToken: v.string()
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

    return {
      _id: currentUser._id,
      username: currentUser.username,
      isOnline: currentUser.isOnline,
      isGuest: currentUser.isGuest
    };
  }
});

// Start typing indicator
export const startTyping = mutation({
  args: {
    sessionToken: v.string(),
    conversationId: v.id("conversations")
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

    // Verify conversation exists and user is a participant
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || !conversation.isActive) {
      throw new ConvexError("Conversation not found");
    }

    if (!conversation.participantIds.includes(currentUser._id)) {
      throw new ConvexError("You don't have access to this conversation");
    }

    const now = Date.now();
    const expiresAt = now + 10000; // Typing indicator expires in 10 seconds

    // Check if typing indicator already exists
    const existingTyping = await ctx.db
      .query("typingIndicators")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", currentUser._id)
      )
      .first();

    if (existingTyping) {
      // Update existing typing indicator
      await ctx.db.patch(existingTyping._id, {
        expiresAt,
        updatedAt: now
      });
    } else {
      // Create new typing indicator
      await ctx.db.insert("typingIndicators", {
        conversationId: args.conversationId,
        userId: currentUser._id,
        username: currentUser.username,
        createdAt: now,
        expiresAt,
        updatedAt: now
      });
    }

    return { success: true };
  }
});

// Stop typing indicator
export const stopTyping = mutation({
  args: {
    sessionToken: v.string(),
    conversationId: v.id("conversations")
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

    // Find and remove typing indicator
    const typingIndicator = await ctx.db
      .query("typingIndicators")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", currentUser._id)
      )
      .first();

    if (typingIndicator) {
      await ctx.db.delete(typingIndicator._id);
    }

    return { success: true };
  }
});

// Get typing indicators for a conversation
export const getTypingIndicators = query({
  args: {
    sessionToken: v.string(),
    conversationId: v.id("conversations")
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

    // Verify conversation exists and user is a participant
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || !conversation.isActive) {
      throw new ConvexError("Conversation not found");
    }

    if (!conversation.participantIds.includes(currentUser._id)) {
      throw new ConvexError("You don't have access to this conversation");
    }

    const now = Date.now();

    // Get active typing indicators (excluding current user and expired ones)
    const typingIndicators = await ctx.db
      .query("typingIndicators")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .filter((q) => q.neq(q.field("userId"), currentUser._id))
      .filter((q) => q.gt(q.field("expiresAt"), now))
      .collect();

    return typingIndicators.map(indicator => ({
      userId: indicator.userId,
      username: indicator.username,
      expiresAt: indicator.expiresAt
    }));
  }
});

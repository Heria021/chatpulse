import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { ConvexError } from "convex/values";
import { internal } from "./_generated/api";

// Status thresholds (in milliseconds)
const ONLINE_THRESHOLD = 2 * 60 * 1000; // 2 minutes
const RECENTLY_ACTIVE_THRESHOLD = 5 * 60 * 1000; // 5 minutes
const AWAY_THRESHOLD = 24 * 60 * 60 * 1000; // 24 hours

// Activity types that count as "meaningful activity" for ranking
const MEANINGFUL_ACTIVITIES = [
  "message_sent",
  "message_read",
  "typing_started",
  "file_uploaded"
];

// Activities that only maintain online status but don't affect ranking
const MAINTENANCE_ACTIVITIES = [
  "heartbeat",
  "conversation_opened"
];

// Special activities that are meaningful on first occurrence (page load)
const PAGE_LOAD_ACTIVITIES = [
  "page_load"
];

// Calculate user status based on last activity
function calculateUserStatus(lastActivity: number, currentTime: number): "online" | "recently_active" | "away" | "offline" {
  const timeSinceActivity = currentTime - lastActivity;
  
  if (timeSinceActivity < ONLINE_THRESHOLD) {
    return "online";
  } else if (timeSinceActivity < RECENTLY_ACTIVE_THRESHOLD) {
    return "recently_active";
  } else if (timeSinceActivity < AWAY_THRESHOLD) {
    return "away";
  } else {
    return "offline";
  }
}

// Update user activity and status
export const updateUserActivity = mutation({
  args: {
    sessionToken: v.string(),
    activity: v.string(), // type of activity
    metadata: v.optional(v.string()) // additional context
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
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
    if (session.expiresAt < now) {
      throw new ConvexError("Session expired");
    }

    // Get user
    const user = await ctx.db.get(session.userId);
    if (!user || !user.isActive) {
      throw new ConvexError("User not found or inactive");
    }

    // Update session activity
    await ctx.db.patch(session._id, {
      lastActivity: now
    });

    // Update user activity based on activity type
    const isMeaningfulActivity = MEANINGFUL_ACTIVITIES.includes(args.activity);
    const isMaintenanceActivity = MAINTENANCE_ACTIVITIES.includes(args.activity);
    const isPageLoadActivity = PAGE_LOAD_ACTIVITIES.includes(args.activity);

    if (isMeaningfulActivity || isMaintenanceActivity || isPageLoadActivity) {
      const newStatus = calculateUserStatus(now, now); // Will be "online" since it's current activity

      // For meaningful activities and page loads, update lastActivity (affects ranking)
      // For maintenance activities, only update lastSeen and status
      const updateData: any = {
        lastSeen: now,
        isOnline: true,
        currentStatus: newStatus,
        updatedAt: now
      };

      // Update lastActivity for meaningful interactions AND page loads
      if (isMeaningfulActivity || isPageLoadActivity) {
        updateData.lastActivity = now;
      }

      await ctx.db.patch(session.userId, updateData);

      // Log activity for analytics (optional)
      await ctx.db.insert("activityLogs", {
        userId: session.userId,
        action: args.activity,
        metadata: args.metadata,
        createdAt: now
      });
    }

    return { success: true, status: "online" };
  }
});

// Heartbeat to maintain online status
export const heartbeat = mutation({
  args: {
    sessionToken: v.string()
  },
  handler: async (ctx, args): Promise<{ success: boolean; status: string }> => {
    const now = Date.now();

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
    if (session.expiresAt < now) {
      throw new ConvexError("Session expired");
    }

    // Get user
    const user = await ctx.db.get(session.userId);
    if (!user || !user.isActive) {
      throw new ConvexError("User not found or inactive");
    }

    // Update session activity
    await ctx.db.patch(session._id, {
      lastActivity: now
    });

    // Update user status but don't update lastActivity for heartbeat
    // This maintains online status without affecting user ranking
    const newStatus = calculateUserStatus(now, now); // Will be "online" since it's current activity

    await ctx.db.patch(session.userId, {
      lastSeen: now,
      isOnline: true,
      currentStatus: newStatus,
      updatedAt: now
    });

    return { success: true, status: "online" };
  }
});

// Get online users for a conversation
export const getOnlineUsersInConversation = query({
  args: {
    sessionToken: v.string(),
    conversationId: v.id("conversations")
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

    // Get conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new ConvexError("Conversation not found");
    }

    // Check if user is participant
    if (!conversation.participantIds || !conversation.participantIds.includes(session.userId)) {
      throw new ConvexError("Not a participant in this conversation");
    }

    // Get all participants with their status
    const participants = await Promise.all(
      conversation.participantIds!.map(async (userId) => {
        const user = await ctx.db.get(userId);
        if (!user || !user.isActive) return null;

        const now = Date.now();
        const currentStatus = calculateUserStatus(user.lastActivity || user.lastSeen, now);

        return {
          userId: user._id,
          username: user.username,
          currentStatus,
          lastSeen: user.lastSeen,
          lastActivity: user.lastActivity,
          showOnlineStatus: user.showOnlineStatus
        };
      })
    );

    return participants.filter(p => p !== null);
  }
});

// Get user's current status
export const getUserStatus = query({
  args: {
    sessionToken: v.string(),
    userId: v.id("users")
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

    // Get target user
    const user = await ctx.db.get(args.userId);
    if (!user || !user.isActive) {
      throw new ConvexError("User not found");
    }

    // Check privacy settings
    if (!user.showOnlineStatus) {
      return {
        userId: user._id,
        username: user.username,
        currentStatus: "offline" as const,
        showOnlineStatus: false
      };
    }

    const now = Date.now();
    const currentStatus = calculateUserStatus(user.lastActivity || user.lastSeen, now);

    return {
      userId: user._id,
      username: user.username,
      currentStatus,
      lastSeen: user.lastSeen,
      lastActivity: user.lastActivity,
      showOnlineStatus: user.showOnlineStatus
    };
  }
});



// Cleanup inactive sessions and update user statuses
export const cleanupInactiveSessions = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const inactiveThreshold = now - (5 * 60 * 1000); // 5 minutes of inactivity

    // Find inactive sessions
    const inactiveSessions = await ctx.db
      .query("sessions")
      .withIndex("by_activity")
      .filter((q) => 
        q.and(
          q.eq(q.field("isActive"), true),
          q.lt(q.field("lastActivity"), inactiveThreshold)
        )
      )
      .collect();

    // Update user statuses based on their sessions
    const userUpdates = new Map();

    for (const session of inactiveSessions) {
      const user = await ctx.db.get(session.userId);
      if (!user) continue;

      const newStatus = calculateUserStatus(user.lastActivity || user.lastSeen, now);
      const isOnline = newStatus === "online";

      if (!userUpdates.has(session.userId)) {
        userUpdates.set(session.userId, {
          currentStatus: newStatus,
          isOnline,
          updatedAt: now
        });
      }
    }

    // Apply user updates
    for (const [userId, updates] of userUpdates) {
      await ctx.db.patch(userId, updates);
    }

    return {
      inactiveSessionsFound: inactiveSessions.length,
      usersUpdated: userUpdates.size
    };
  }
});

// Get all online users (for admin/debugging)
export const getAllOnlineUsers = query({
  args: {
    sessionToken: v.string()
  },
  handler: async (ctx, args) => {
    // Verify session (admin only - you might want to add admin check)
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("sessionToken", args.sessionToken))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (!session) {
      throw new ConvexError("Invalid session");
    }

    const now = Date.now();

    // Get all active users
    const users = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return users
      .map(user => {
        const currentStatus = calculateUserStatus(user.lastActivity || user.lastSeen, now);
        return {
          userId: user._id,
          username: user.username,
          currentStatus,
          lastSeen: user.lastSeen,
          lastActivity: user.lastActivity,
          showOnlineStatus: user.showOnlineStatus
        };
      })
      .filter(user => user.currentStatus !== "offline")
      .sort((a, b) => {
        // Sort by status priority: online > recently_active > away
        const statusPriority = { online: 3, recently_active: 2, away: 1, offline: 0 };
        return statusPriority[b.currentStatus] - statusPriority[a.currentStatus];
      });
  }
});

// Bootstrap user online status immediately on page load
export const bootstrapOnlineStatus = mutation({
  args: {
    sessionToken: v.string()
  },
  handler: async (ctx, args): Promise<{ success: boolean; status: string }> => {
    const now = Date.now();

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
    if (session.expiresAt < now) {
      throw new ConvexError("Session expired");
    }

    // Get user
    const user = await ctx.db.get(session.userId);
    if (!user || !user.isActive) {
      throw new ConvexError("User not found or inactive");
    }

    // Update session activity
    await ctx.db.patch(session._id, {
      lastActivity: now
    });

    // Immediately mark user as online with current activity
    // Page load is meaningful activity that affects ranking
    const newStatus = calculateUserStatus(now, now);

    await ctx.db.patch(session.userId, {
      lastActivity: now,
      lastSeen: now,
      isOnline: true,
      currentStatus: newStatus,
      updatedAt: now
    });

    // Log the page load activity
    await ctx.db.insert("activityLogs", {
      userId: session.userId,
      action: "page_load",
      metadata: "immediate_bootstrap",
      createdAt: now
    });

    return { success: true, status: "online" };
  }
});

import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Production Configuration
const RETENTION_PERIODS = {
  MESSAGES: 7 * 24 * 60 * 60 * 1000, // 7 days - removes old messages
  GUEST_USERS: 24 * 60 * 60 * 1000, // 24 hours - removes inactive guests
  ACTIVITY_LOGS: 30 * 24 * 60 * 60 * 1000, // 30 days - keeps security logs longer
  TYPING_INDICATORS: 30 * 1000, // 30 seconds - quick cleanup for real-time data
};

const BATCH_SIZE = 100; // Optimized batch size for production performance

// Helper function to log cleanup operations
async function logCleanupOperation(
  ctx: any,
  taskType: string,
  itemsProcessed: number,
  itemsDeleted: number,
  status: "success" | "error" | "partial",
  executionTimeMs: number,
  dryRun: boolean,
  errorMessage?: string
) {
  await ctx.db.insert("cleanupLogs", {
    taskType,
    itemsProcessed,
    itemsDeleted,
    status,
    errorMessage,
    executionTimeMs,
    dryRun,
    createdAt: Date.now(),
  });
}

// Helper function to execute cleanup for expired sessions
async function executeCleanupExpiredSessions(ctx: any, args: { dryRun?: boolean }) {
  const startTime = Date.now();
  const dryRun = args.dryRun ?? false;
  const now = Date.now();
  
  try {
    // Find expired sessions
    const expiredSessions = await ctx.db
      .query("sessions")
      .withIndex("by_expiry")
      .filter((q: any) => q.lt(q.field("expiresAt"), now))
      .take(BATCH_SIZE);

    // Find inactive sessions (older than 30 days)
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    const inactiveSessions = await ctx.db
      .query("sessions")
      .withIndex("by_activity")
      .filter((q: any) => q.lt(q.field("lastActivity"), thirtyDaysAgo))
      .take(BATCH_SIZE);

    const allSessionsToDelete = [...expiredSessions, ...inactiveSessions];
    const uniqueSessions = Array.from(
      new Map(allSessionsToDelete.map(s => [s._id, s])).values()
    );

    let deletedCount = 0;
    
    if (!dryRun) {
      for (const session of uniqueSessions) {
        await ctx.db.delete(session._id);
        deletedCount++;
      }
    } else {
      deletedCount = uniqueSessions.length;
    }

    const executionTime = Date.now() - startTime;
    
    await logCleanupOperation(
      ctx,
      "expired_sessions",
      uniqueSessions.length,
      deletedCount,
      "success",
      executionTime,
      dryRun
    );

    return {
      success: true,
      processed: uniqueSessions.length,
      deleted: deletedCount,
      dryRun,
      executionTimeMs: executionTime,
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    await logCleanupOperation(
      ctx,
      "expired_sessions",
      0,
      0,
      "error",
      executionTime,
      dryRun,
      errorMessage
    );

    throw new ConvexError(`Session cleanup failed: ${errorMessage}`);
  }
}

// Helper function to execute cleanup for typing indicators
async function executeCleanupTypingIndicators(ctx: any, args: { dryRun?: boolean }) {
  const startTime = Date.now();
  const dryRun = args.dryRun ?? false;
  const now = Date.now();
  
  try {
    // Find expired typing indicators
    const expiredIndicators = await ctx.db
      .query("typingIndicators")
      .filter((q: any) => q.lt(q.field("expiresAt"), now))
      .take(BATCH_SIZE);

    // Find old typing indicators (older than 30 seconds as backup)
    const oldThreshold = now - RETENTION_PERIODS.TYPING_INDICATORS;
    const oldIndicators = await ctx.db
      .query("typingIndicators")
      .filter((q: any) => q.lt(q.field("createdAt"), oldThreshold))
      .take(BATCH_SIZE);

    const allIndicatorsToDelete = [...expiredIndicators, ...oldIndicators];
    const uniqueIndicators = Array.from(
      new Map(allIndicatorsToDelete.map(i => [i._id, i])).values()
    );

    let deletedCount = 0;
    
    if (!dryRun) {
      for (const indicator of uniqueIndicators) {
        await ctx.db.delete(indicator._id);
        deletedCount++;
      }
    } else {
      deletedCount = uniqueIndicators.length;
    }

    const executionTime = Date.now() - startTime;
    
    await logCleanupOperation(
      ctx,
      "typing_indicators",
      uniqueIndicators.length,
      deletedCount,
      "success",
      executionTime,
      dryRun
    );

    return {
      success: true,
      processed: uniqueIndicators.length,
      deleted: deletedCount,
      dryRun,
      executionTimeMs: executionTime,
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    await logCleanupOperation(
      ctx,
      "typing_indicators",
      0,
      0,
      "error",
      executionTime,
      dryRun,
      errorMessage
    );

    throw new ConvexError(`Typing indicators cleanup failed: ${errorMessage}`);
  }
}

// Helper function to execute cleanup for old messages
async function executeCleanupOldMessages(ctx: any, args: { dryRun?: boolean }) {
  const startTime = Date.now();
  const dryRun = args.dryRun ?? false;
  const cutoffTime = Date.now() - RETENTION_PERIODS.MESSAGES;
  
  try {
    // Find old messages (older than 7 days)
    const oldMessages = await ctx.db
      .query("messages")
      .withIndex("by_timestamp")
      .filter((q: any) => q.lt(q.field("createdAt"), cutoffTime))
      .take(BATCH_SIZE);

    let deletedCount = 0;
    const conversationsToUpdate = new Set<string>();
    
    if (!dryRun) {
      for (const message of oldMessages) {
        // Track conversations that need lastMessageAt updates
        conversationsToUpdate.add(message.conversationId);
        
        // Delete the message
        await ctx.db.delete(message._id);
        deletedCount++;
      }

      // Update conversations' lastMessageAt if their last message was deleted
      for (const conversationId of conversationsToUpdate) {
        const conversation = await ctx.db.get(conversationId as any);
        if (!conversation) continue;

        // Find the most recent remaining message in this conversation
        const latestMessage = await ctx.db
          .query("messages")
          .withIndex("by_conversation")
          .filter((q: any) => q.eq(q.field("conversationId"), conversationId as any))
          .order("desc")
          .first();

        if (latestMessage) {
          // Update conversation with the latest remaining message
          await ctx.db.patch(conversationId as any, {
            lastMessageId: latestMessage._id,
            lastMessageAt: latestMessage.createdAt,
            updatedAt: Date.now(),
          });
        } else {
          // No messages left, update to conversation creation time
          await ctx.db.patch(conversationId as any, {
            lastMessageId: undefined,
            lastMessageAt: conversation.createdAt,
            updatedAt: Date.now(),
          });
        }
      }
    } else {
      deletedCount = oldMessages.length;
    }

    const executionTime = Date.now() - startTime;
    
    await logCleanupOperation(
      ctx,
      "old_messages",
      oldMessages.length,
      deletedCount,
      "success",
      executionTime,
      dryRun
    );

    return {
      success: true,
      processed: oldMessages.length,
      deleted: deletedCount,
      conversationsUpdated: conversationsToUpdate.size,
      dryRun,
      executionTimeMs: executionTime,
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    await logCleanupOperation(
      ctx,
      "old_messages",
      0,
      0,
      "error",
      executionTime,
      dryRun,
      errorMessage
    );

    throw new ConvexError(`Message cleanup failed: ${errorMessage}`);
  }
}

// Helper function to execute cleanup for inactive guests
async function executeCleanupInactiveGuests(ctx: any, args: { dryRun?: boolean }) {
  const startTime = Date.now();
  const dryRun = args.dryRun ?? false;
  const cutoffTime = Date.now() - RETENTION_PERIODS.GUEST_USERS;

  try {
    // Find inactive guest users (older than 24 hours)
    const inactiveGuests = await ctx.db
      .query("users")
      .withIndex("by_guest_status")
      .filter((q: any) =>
        q.and(
          q.eq(q.field("isGuest"), true),
          q.lt(q.field("lastActivity"), cutoffTime)
        )
      )
      .take(BATCH_SIZE);

    let deletedUsersCount = 0;
    let deletedSessionsCount = 0;
    let deletedConversationsCount = 0;

    if (!dryRun) {
      for (const guestUser of inactiveGuests) {
        // Delete user's sessions
        const userSessions = await ctx.db
          .query("sessions")
          .withIndex("by_user")
          .filter((q: any) => q.eq(q.field("userId"), guestUser._id))
          .collect();

        for (const session of userSessions) {
          await ctx.db.delete(session._id);
          deletedSessionsCount++;
        }

        // Find and delete conversations where this user is a participant
        const userConversations = await ctx.db
          .query("conversations")
          .withIndex("by_participants")
          .filter((q: any) => q.eq(q.field("participantIds"), [guestUser._id]))
          .collect();

        for (const conversation of userConversations) {
          // Delete messages in this conversation
          const conversationMessages = await ctx.db
            .query("messages")
            .withIndex("by_conversation")
            .filter((q: any) => q.eq(q.field("conversationId"), conversation._id))
            .collect();

          for (const message of conversationMessages) {
            await ctx.db.delete(message._id);
          }

          await ctx.db.delete(conversation._id);
          deletedConversationsCount++;
        }

        // Delete the user
        await ctx.db.delete(guestUser._id);
        deletedUsersCount++;
      }
    } else {
      deletedUsersCount = inactiveGuests.length;
      // For dry run, estimate related data
      for (const guestUser of inactiveGuests) {
        const userSessions = await ctx.db
          .query("sessions")
          .withIndex("by_user")
          .filter((q: any) => q.eq(q.field("userId"), guestUser._id))
          .collect();
        deletedSessionsCount += userSessions.length;

        const userConversations = await ctx.db
          .query("conversations")
          .withIndex("by_participants")
          .filter((q: any) => q.eq(q.field("participantIds"), [guestUser._id]))
          .collect();
        deletedConversationsCount += userConversations.length;
      }
    }

    const executionTime = Date.now() - startTime;

    await logCleanupOperation(
      ctx,
      "inactive_guests",
      inactiveGuests.length,
      deletedUsersCount,
      "success",
      executionTime,
      dryRun
    );

    return {
      success: true,
      processed: inactiveGuests.length,
      deletedUsers: deletedUsersCount,
      deletedSessions: deletedSessionsCount,
      deletedConversations: deletedConversationsCount,
      dryRun,
      executionTimeMs: executionTime,
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    await logCleanupOperation(
      ctx,
      "inactive_guests",
      0,
      0,
      "error",
      executionTime,
      dryRun,
      errorMessage
    );

    throw new ConvexError(`Inactive guests cleanup failed: ${errorMessage}`);
  }
}

// Helper function to execute cleanup for old activity logs
async function executeCleanupOldActivityLogs(ctx: any, args: { dryRun?: boolean }) {
  const startTime = Date.now();
  const dryRun = args.dryRun ?? false;
  const cutoffTime = Date.now() - RETENTION_PERIODS.ACTIVITY_LOGS;

  try {
    // Find old activity logs (older than 30 days), but preserve security-related logs
    const oldLogs = await ctx.db
      .query("activityLogs")
      .withIndex("by_timestamp")
      .filter((q: any) =>
        q.and(
          q.lt(q.field("createdAt"), cutoffTime),
          q.neq(q.field("action"), "login"),
          q.neq(q.field("action"), "register"),
          q.neq(q.field("action"), "password_change"),
          q.neq(q.field("action"), "account_delete")
        )
      )
      .take(BATCH_SIZE);

    let deletedCount = 0;

    if (!dryRun) {
      for (const log of oldLogs) {
        await ctx.db.delete(log._id);
        deletedCount++;
      }
    } else {
      deletedCount = oldLogs.length;
    }

    const executionTime = Date.now() - startTime;

    await logCleanupOperation(
      ctx,
      "old_activity_logs",
      oldLogs.length,
      deletedCount,
      "success",
      executionTime,
      dryRun
    );

    return {
      success: true,
      processed: oldLogs.length,
      deleted: deletedCount,
      dryRun,
      executionTimeMs: executionTime,
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    await logCleanupOperation(
      ctx,
      "old_activity_logs",
      0,
      0,
      "error",
      executionTime,
      dryRun,
      errorMessage
    );

    throw new ConvexError(`Activity logs cleanup failed: ${errorMessage}`);
  }
}

// Internal versions for cron jobs
export const runFullCleanupInternal = internalMutation({
  args: {
    dryRun: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const startTime = Date.now();
    const dryRun = args.dryRun ?? false;
    const results: any[] = [];

    try {
      // 1. Clean up expired sessions
      const sessionsResult = await executeCleanupExpiredSessions(ctx, { dryRun });
      results.push({ task: "expired_sessions", ...sessionsResult });

      // 2. Clean up typing indicators
      const typingResult = await executeCleanupTypingIndicators(ctx, { dryRun });
      results.push({ task: "typing_indicators", ...typingResult });

      // 3. Clean up old messages (7 days)
      const messagesResult = await executeCleanupOldMessages(ctx, { dryRun });
      results.push({ task: "old_messages", ...messagesResult });

      // 4. Clean up inactive guest users
      const guestsResult = await executeCleanupInactiveGuests(ctx, { dryRun });
      results.push({ task: "inactive_guests", ...guestsResult });

      // 5. Clean up old activity logs
      const logsResult = await executeCleanupOldActivityLogs(ctx, { dryRun });
      results.push({ task: "old_activity_logs", ...logsResult });

      const totalExecutionTime = Date.now() - startTime;

      // Log the master cleanup operation
      const totalProcessed = results.reduce((sum, r) => sum + r.processed, 0);
      const totalDeleted = results.reduce((sum, r) => sum + (r.deleted || r.deletedUsers || 0), 0);

      await logCleanupOperation(
        ctx,
        "full_cleanup",
        totalProcessed,
        totalDeleted,
        "success",
        totalExecutionTime,
        dryRun
      );

      return {
        success: true,
        dryRun,
        totalExecutionTimeMs: totalExecutionTime,
        totalProcessed,
        totalDeleted,
        results,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      await logCleanupOperation(
        ctx,
        "full_cleanup",
        0,
        0,
        "error",
        executionTime,
        dryRun,
        errorMessage
      );

      throw new ConvexError(`Full cleanup failed: ${errorMessage}`);
    }
  },
});

export const cleanupExpiredSessionsInternal = internalMutation({
  args: {
    dryRun: v.optional(v.boolean()),
  },
  handler: executeCleanupExpiredSessions,
});

export const cleanupTypingIndicatorsInternal = internalMutation({
  args: {
    dryRun: v.optional(v.boolean()),
  },
  handler: executeCleanupTypingIndicators,
});





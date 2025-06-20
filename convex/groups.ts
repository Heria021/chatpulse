import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Helper function to validate session and get user
async function validateSessionAndGetUser(ctx: any, sessionToken: string) {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q: any) => q.eq("sessionToken", sessionToken))
    .first();

  if (!session || !session.isActive || session.expiresAt < Date.now()) {
    throw new ConvexError("Authentication required. Please sign in again.");
  }

  const currentUser = await ctx.db.get(session.userId);
  if (!currentUser || !currentUser.isActive) {
    throw new ConvexError("User account not found or deactivated");
  }

  return currentUser;
}

// Get all groups (permanent and user-created) with user's membership status
export const getGroups = query({
  args: {
    sessionToken: v.string(),
    searchQuery: v.optional(v.string()),
    typeFilter: v.optional(v.union(v.literal("all"), v.literal("permanent"), v.literal("user_created"))),
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

    // Get groups based on filter
    let groups;

    if (args.typeFilter && args.typeFilter !== "all") {
      groups = await ctx.db
        .query("groups")
        .withIndex("by_type", (q) =>
          q.eq("type", args.typeFilter as "permanent" | "user_created").eq("isActive", true)
        )
        .collect();
    } else {
      groups = await ctx.db
        .query("groups")
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
    }

    // Filter by search query if provided
    const filteredGroups = args.searchQuery
      ? groups.filter(group =>
          group.name.toLowerCase().includes(args.searchQuery!.toLowerCase()) ||
          (group.description && group.description.toLowerCase().includes(args.searchQuery!.toLowerCase()))
        )
      : groups;

    // Get user's memberships for these groups
    const groupIds = filteredGroups.map(g => g._id);
    const memberships = await Promise.all(
      groupIds.map(groupId =>
        ctx.db
          .query("groupMemberships")
          .withIndex("by_group_user", (q) => q.eq("groupId", groupId).eq("userId", currentUser._id))
          .first()
      )
    );

    // Get unread counts and last messages for groups user is member of
    const memberGroupIds = memberships
      .map((membership, index) => membership ? groupIds[index] : null)
      .filter(Boolean);

    const conversationsPromises = memberGroupIds.map(groupId =>
      ctx.db
        .query("conversations")
        .withIndex("by_group", (q) => q.eq("groupId", groupId!))
        .first()
    );

    const conversations = await Promise.all(conversationsPromises);

    // Get last messages for each conversation
    const lastMessagesPromises = conversations.map(conv =>
      conv?.lastMessageId ? ctx.db.get(conv.lastMessageId) : null
    );

    const lastMessages = await Promise.all(lastMessagesPromises);

    // Calculate unread counts
    const unreadCountsPromises = memberships.map(async (membership, index) => {
      if (!membership || membership.status !== "active") return 0;
      
      const conversation = conversations[memberships.indexOf(membership)];
      if (!conversation) return 0;

      const unreadMessages = await ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) => q.eq("conversationId", conversation._id))
        .filter((q) => q.gt(q.field("createdAt"), membership.lastSeenAt))
        .filter((q) => q.neq(q.field("senderId"), currentUser._id))
        .collect();

      return unreadMessages.length;
    });

    const unreadCounts = await Promise.all(unreadCountsPromises);

    // Combine data
    const result = filteredGroups.map((group, index) => {
      const membership = memberships[index];
      const conversationIndex = memberGroupIds.indexOf(group._id);
      const lastMessage = conversationIndex >= 0 ? lastMessages[conversationIndex] : null;
      const unreadCount = membership ? unreadCounts[index] : 0;

      return {
        ...group,
        membership,
        unreadCount,
        lastMessage: lastMessage ? {
          _id: lastMessage._id,
          content: lastMessage.content,
          senderId: lastMessage.senderId,
          type: lastMessage.type,
          createdAt: lastMessage.createdAt,
        } : undefined,
        lastMessageAt: lastMessage?.createdAt,
      };
    });

    // Sort: user's groups first (by last activity), then other groups (by member count)
    result.sort((a, b) => {
      const aIsMember = a.membership?.status === "active";
      const bIsMember = b.membership?.status === "active";

      if (aIsMember && !bIsMember) return -1;
      if (!aIsMember && bIsMember) return 1;

      if (aIsMember && bIsMember) {
        // Both are member groups - sort by last message time
        return (b.lastMessageAt || 0) - (a.lastMessageAt || 0);
      } else {
        // Both are non-member groups - sort by member count
        return b.memberCount - a.memberCount;
      }
    });

    return result;
  },
});

// Create a new group (user-created only)
export const createGroup = mutation({
  args: {
    sessionToken: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    isPublic: v.boolean(),
    requiresApproval: v.boolean(),
    maxMembers: v.optional(v.number()),
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

    // Check if user already has a group
    if (currentUser.hasCreatedGroup === true) {
      throw new ConvexError("You can only create one group. Please delete your existing group first.");
    }

    // Validate input
    if (!args.name.trim()) {
      throw new ConvexError("Group name is required");
    }

    if (args.name.length > 50) {
      throw new ConvexError("Group name must be 50 characters or less");
    }

    if (args.description && args.description.length > 200) {
      throw new ConvexError("Group description must be 200 characters or less");
    }

    const maxMembers = args.maxMembers || 50;
    if (maxMembers < 2 || maxMembers > 100) {
      throw new ConvexError("Group must allow between 2 and 100 members");
    }

    // Check for duplicate group names
    const existingGroup = await ctx.db
      .query("groups")
      .filter((q) => q.eq(q.field("name"), args.name.trim()))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (existingGroup) {
      throw new ConvexError("A group with this name already exists");
    }

    const now = Date.now();

    // Create the group
    const groupId = await ctx.db.insert("groups", {
      name: args.name.trim(),
      description: args.description?.trim(),
      type: "user_created",
      creatorId: currentUser._id,
      maxMembers,
      isPublic: args.isPublic,
      requiresApproval: args.requiresApproval,
      lastActivity: now,
      memberCount: 1, // Creator is the first member
      isActive: true,
      isArchived: false,
      inactivityThresholdDays: 30, // Default 30 days
      markedForDeletion: false,
      createdAt: now,
      updatedAt: now,
    });

    // Create group membership for creator
    await ctx.db.insert("groupMemberships", {
      groupId,
      userId: currentUser._id,
      role: "creator",
      status: "active",
      joinedAt: now,
      lastSeenAt: now,
      createdAt: now,
      updatedAt: now,
    });

    // Create group conversation
    const conversationId = await ctx.db.insert("conversations", {
      groupId,
      type: "group",
      name: args.name.trim(),
      lastMessageAt: now,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // Update user to mark they have created a group
    await ctx.db.patch(currentUser._id, {
      hasCreatedGroup: true,
      createdGroupId: groupId,
      updatedAt: now,
    });

    // Log group creation
    await ctx.db.insert("groupActivityLogs", {
      groupId,
      userId: currentUser._id,
      action: "created",
      createdAt: now,
    });

    return {
      groupId,
      conversationId,
      message: "Group created successfully!",
    };
  },
});

// Join a public group
export const joinGroup = mutation({
  args: {
    sessionToken: v.string(),
    groupId: v.id("groups"),
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

    // Get the group
    const group = await ctx.db.get(args.groupId);
    if (!group || !group.isActive) {
      throw new ConvexError("Group not found or inactive");
    }

    // Check if group is public
    if (!group.isPublic) {
      throw new ConvexError("This group is private. You need an invitation to join.");
    }

    // Check if user is already a member
    const existingMembership = await ctx.db
      .query("groupMemberships")
      .withIndex("by_group_user", (q) => q.eq("groupId", args.groupId).eq("userId", currentUser._id))
      .first();

    if (existingMembership) {
      if (existingMembership.status === "active") {
        throw new ConvexError("You are already a member of this group");
      } else if (existingMembership.status === "banned") {
        throw new ConvexError("You are banned from this group");
      } else if (existingMembership.status === "pending") {
        throw new ConvexError("Your membership request is pending approval");
      }
    }

    // Check member limit
    if (group.memberCount >= group.maxMembers) {
      throw new ConvexError("This group has reached its member limit");
    }

    const now = Date.now();
    const membershipStatus = group.requiresApproval ? "pending" : "active";

    // Create or update membership
    if (existingMembership) {
      await ctx.db.patch(existingMembership._id, {
        status: membershipStatus,
        joinedAt: now,
        lastSeenAt: now,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("groupMemberships", {
        groupId: args.groupId,
        userId: currentUser._id,
        role: "member",
        status: membershipStatus,
        joinedAt: now,
        lastSeenAt: now,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Update group member count if approved immediately
    if (membershipStatus === "active") {
      await ctx.db.patch(args.groupId, {
        memberCount: group.memberCount + 1,
        lastActivity: now,
        updatedAt: now,
      });

      // Log member joined
      await ctx.db.insert("groupActivityLogs", {
        groupId: args.groupId,
        userId: currentUser._id,
        action: "member_joined",
        createdAt: now,
      });
    }

    return {
      success: true,
      status: membershipStatus,
      message: membershipStatus === "active"
        ? "Successfully joined the group!"
        : "Membership request sent. Waiting for approval.",
    };
  },
});

// Get a group conversation (query version)
export const getGroupConversation = query({
  args: {
    sessionToken: v.string(),
    groupId: v.id("groups"),
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

    // Get the group
    const group = await ctx.db.get(args.groupId);
    if (!group || !group.isActive) {
      return null; // Group not found or inactive
    }

    // Check if user is an active member
    const membership = await ctx.db
      .query("groupMemberships")
      .withIndex("by_group_user", (q) => q.eq("groupId", args.groupId).eq("userId", currentUser._id))
      .first();

    if (!membership || membership.status !== "active") {
      return null; // User is not a member
    }

    // Get the conversation
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .first();

    if (!conversation) {
      return null; // No conversation found
    }

    return {
      conversationId: conversation._id,
      group: {
        _id: group._id,
        name: group.name,
        description: group.description,
        type: group.type,
        memberCount: group.memberCount,
        isPublic: group.isPublic,
        avatarUrl: group.avatarUrl,
      },
      membership,
    };
  },
});

// Get or create a group conversation
export const getOrCreateGroupConversation = mutation({
  args: {
    sessionToken: v.string(),
    groupId: v.id("groups"),
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

    // Get the group
    const group = await ctx.db.get(args.groupId);
    if (!group || !group.isActive) {
      throw new ConvexError("Group not found or inactive");
    }

    // Check if user is an active member
    const membership = await ctx.db
      .query("groupMemberships")
      .withIndex("by_group_user", (q) => q.eq("groupId", args.groupId).eq("userId", currentUser._id))
      .first();

    if (!membership || membership.status !== "active") {
      throw new ConvexError("You are not a member of this group");
    }

    // Check if conversation already exists
    const existingConversation = await ctx.db
      .query("conversations")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .first();

    if (existingConversation) {
      return {
        conversationId: existingConversation._id,
        group: {
          _id: group._id,
          name: group.name,
          description: group.description,
          type: group.type,
          memberCount: group.memberCount,
          isPublic: group.isPublic,
          avatarUrl: group.avatarUrl,
        },
        membership,
      };
    }

    // Create new conversation
    const now = Date.now();
    const conversationId = await ctx.db.insert("conversations", {
      groupId: args.groupId,
      type: "group",
      name: group.name,
      lastMessageAt: now,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return {
      conversationId,
      group: {
        _id: group._id,
        name: group.name,
        description: group.description,
        type: group.type,
        memberCount: group.memberCount,
        isPublic: group.isPublic,
        avatarUrl: group.avatarUrl,
      },
      membership,
    };
  },
});

// Leave a group
export const leaveGroup = mutation({
  args: {
    sessionToken: v.string(),
    groupId: v.id("groups"),
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

    // Get the group
    const group = await ctx.db.get(args.groupId);
    if (!group || !group.isActive) {
      throw new ConvexError("Group not found or inactive");
    }

    // Get user's membership
    const membership = await ctx.db
      .query("groupMemberships")
      .withIndex("by_group_user", (q) => q.eq("groupId", args.groupId).eq("userId", currentUser._id))
      .first();

    if (!membership || membership.status !== "active") {
      throw new ConvexError("You are not a member of this group");
    }

    const now = Date.now();

    // If user is the creator of a user-created group, handle group deletion
    if (membership.role === "creator" && group.type === "user_created") {
      // Mark group for deletion and archive it
      await ctx.db.patch(args.groupId, {
        isArchived: true,
        archivedReason: "Creator left the group",
        markedForDeletion: true,
        deletionScheduledAt: now + (7 * 24 * 60 * 60 * 1000), // 7 days from now
        updatedAt: now,
      });

      // Update user to allow creating a new group
      await ctx.db.patch(currentUser._id, {
        hasCreatedGroup: false,
        createdGroupId: undefined,
        updatedAt: now,
      });

      // Log group scheduled for deletion
      await ctx.db.insert("groupActivityLogs", {
        groupId: args.groupId,
        userId: currentUser._id,
        action: "scheduled_for_deletion",
        metadata: JSON.stringify({ reason: "Creator left the group" }),
        createdAt: now,
      });

      return {
        success: true,
        message: "You have left the group. Since you were the creator, the group has been scheduled for deletion in 7 days.",
      };
    }

    // For regular members, just update membership status
    await ctx.db.patch(membership._id, {
      status: "left",
      updatedAt: now,
    });

    // Update group member count
    await ctx.db.patch(args.groupId, {
      memberCount: Math.max(0, group.memberCount - 1),
      lastActivity: now,
      updatedAt: now,
    });

    // Log member left
    await ctx.db.insert("groupActivityLogs", {
      groupId: args.groupId,
      userId: currentUser._id,
      action: "member_left",
      createdAt: now,
    });

    return {
      success: true,
      message: "You have successfully left the group.",
    };
  },
});

// Get group members
export const getGroupMembers = query({
  args: {
    sessionToken: v.string(),
    groupId: v.id("groups"),
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

    // Get the group
    const group = await ctx.db.get(args.groupId);
    if (!group || !group.isActive) {
      throw new ConvexError("Group not found or inactive");
    }

    // Check if user is a member (to view member list)
    const userMembership = await ctx.db
      .query("groupMemberships")
      .withIndex("by_group_user", (q) => q.eq("groupId", args.groupId).eq("userId", currentUser._id))
      .first();

    // Handle non-members based on group type
    if (!userMembership || userMembership.status !== "active") {
      // Return group info for access handler to determine what to show
      return {
        canJoin: group.isPublic || group.type === "permanent",
        groupInfo: {
          _id: group._id,
          name: group.name,
          description: group.description,
          memberCount: group.memberCount,
          maxMembers: group.maxMembers,
          isPublic: group.isPublic,
          type: group.type,
        },
        members: [],
        isNonMember: true,
        isPrivateGroup: !group.isPublic && group.type !== "permanent",
      };
    }

    // Get all active memberships
    const memberships = await ctx.db
      .query("groupMemberships")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId).eq("status", "active"))
      .collect();

    // Get user details for each member
    const membersWithDetails = await Promise.all(
      memberships.map(async (membership) => {
        const user = await ctx.db.get(membership.userId);
        if (!user || !user.isActive) return null;

        // Calculate current status
        const now = Date.now();
        const timeSinceActivity = now - (user.lastActivity || user.lastSeen);
        let currentStatus: "online" | "recently_active" | "away" | "offline" = "offline";

        if (timeSinceActivity < 2 * 60 * 1000) { // 2 minutes
          currentStatus = "online";
        } else if (timeSinceActivity < 15 * 60 * 1000) { // 15 minutes
          currentStatus = "recently_active";
        } else if (timeSinceActivity < 24 * 60 * 60 * 1000) { // 24 hours
          currentStatus = "away";
        }

        return {
          _id: user._id,
          username: user.username,
          isOnline: user.isOnline,
          currentStatus,
          lastSeen: user.lastSeen,
          lastActivity: user.lastActivity,
          isGuest: user.isGuest,
          bio: user.bio,
          age: user.age,
          gender: user.gender,
          showOnlineStatus: user.showOnlineStatus ?? true,
          membership: {
            _id: membership._id,
            role: membership.role,
            joinedAt: membership.joinedAt,
            lastSeenAt: membership.lastSeenAt,
          },
        };
      })
    );

    // Filter out null results and sort by role priority, then by join date
    const validMembers = membersWithDetails.filter(Boolean);

    const rolePriority = { creator: 4, admin: 3, moderator: 2, member: 1 };
    validMembers.sort((a, b) => {
      const aPriority = rolePriority[a!.membership.role];
      const bPriority = rolePriority[b!.membership.role];

      if (aPriority !== bPriority) {
        return bPriority - aPriority; // Higher priority first
      }

      return a!.membership.joinedAt - b!.membership.joinedAt; // Earlier joiners first
    });

    return validMembers;
  },
});

// Get group invitations (for group admins)
export const getGroupInvitations = query({
  args: {
    sessionToken: v.string(),
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    // Validate session and get current user
    const currentUser = await validateSessionAndGetUser(ctx, args.sessionToken);

    // Get group
    const group = await ctx.db.get(args.groupId);
    if (!group || !group.isActive) {
      throw new ConvexError("Group not found");
    }

    // Check if user is a member with permission to view invitations
    const membership = await ctx.db
      .query("groupMemberships")
      .withIndex("by_group_user", (q) => q.eq("groupId", args.groupId).eq("userId", currentUser._id))
      .first();

    if (!membership || membership.status !== "active") {
      throw new ConvexError("You are not a member of this group");
    }

    if (!["creator", "admin"].includes(membership.role)) {
      throw new ConvexError("Only creators and admins can view invitations");
    }

    // Get pending invitations
    const invitations = await ctx.db
      .query("groupInvitations")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId).eq("status", "pending"))
      .collect();

    // Get inviter details for each invitation
    const invitationsWithDetails = await Promise.all(
      invitations.map(async (invitation) => {
        const inviter = await ctx.db.get(invitation.inviterUserId);
        const invitedUser = invitation.invitedUserId ? await ctx.db.get(invitation.invitedUserId) : null;

        return {
          ...invitation,
          inviter: inviter ? {
            _id: inviter._id,
            username: inviter.username,
          } : null,
          invitedUser: invitedUser ? {
            _id: invitedUser._id,
            username: invitedUser.username,
          } : null,
        };
      })
    );

    return invitationsWithDetails;
  },
});

// Get user's pending invitations
export const getUserInvitations = query({
  args: {
    sessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate session and get current user
    const currentUser = await validateSessionAndGetUser(ctx, args.sessionToken);

    // Get pending invitations for the user
    const invitations = await ctx.db
      .query("groupInvitations")
      .withIndex("by_invited_user", (q) => q.eq("invitedUserId", currentUser._id).eq("status", "pending"))
      .filter((q) => q.gt(q.field("expiresAt"), Date.now())) // Only non-expired
      .collect();

    // Get group and inviter details for each invitation
    const invitationsWithDetails = await Promise.all(
      invitations.map(async (invitation) => {
        const group = await ctx.db.get(invitation.groupId);
        const inviter = await ctx.db.get(invitation.inviterUserId);

        return {
          ...invitation,
          group: group ? {
            _id: group._id,
            name: group.name,
            description: group.description,
            memberCount: group.memberCount,
            isPublic: group.isPublic,
          } : null,
          inviter: inviter ? {
            _id: inviter._id,
            username: inviter.username,
          } : null,
        };
      })
    );

    return invitationsWithDetails.filter(inv => inv.group && inv.inviter);
  },
});

// Invite users to a group
export const inviteToGroup = mutation({
  args: {
    sessionToken: v.string(),
    groupId: v.id("groups"),
    invitedUsernames: v.array(v.string()),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate session and get current user
    const currentUser = await validateSessionAndGetUser(ctx, args.sessionToken);

    // Get group
    const group = await ctx.db.get(args.groupId);
    if (!group || !group.isActive) {
      throw new ConvexError("Group not found");
    }

    // Check if user is a member with permission to invite
    const membership = await ctx.db
      .query("groupMemberships")
      .withIndex("by_group_user", (q) => q.eq("groupId", args.groupId).eq("userId", currentUser._id))
      .first();

    if (!membership || membership.status !== "active") {
      throw new ConvexError("You are not a member of this group");
    }

    // Check permissions - only creators and admins can invite to private groups
    if (!group.isPublic && !["creator", "admin"].includes(membership.role)) {
      throw new ConvexError("Only creators and admins can invite members to private groups");
    }

    const now = Date.now();
    const expiresAt = now + (7 * 24 * 60 * 60 * 1000); // 7 days
    const invitations = [];
    const errors = [];

    for (const username of args.invitedUsernames) {
      try {
        // Find user by username
        const invitedUser = await ctx.db
          .query("users")
          .withIndex("by_username", (q) => q.eq("username", username))
          .first();

        if (!invitedUser) {
          errors.push(`User "${username}" not found`);
          continue;
        }

        if (!invitedUser.isActive) {
          errors.push(`User "${username}" is not active`);
          continue;
        }

        // Check if user is already a member
        const existingMembership = await ctx.db
          .query("groupMemberships")
          .withIndex("by_group_user", (q) => q.eq("groupId", args.groupId).eq("userId", invitedUser._id))
          .first();

        if (existingMembership && existingMembership.status === "active") {
          errors.push(`"${username}" is already a member`);
          continue;
        }

        if (existingMembership && existingMembership.status === "banned") {
          errors.push(`"${username}" is banned from this group`);
          continue;
        }

        // Check if there's already a pending invitation
        const existingInvitation = await ctx.db
          .query("groupInvitations")
          .withIndex("by_invited_user", (q) => q.eq("invitedUserId", invitedUser._id).eq("status", "pending"))
          .filter((q) => q.eq(q.field("groupId"), args.groupId))
          .first();

        if (existingInvitation) {
          errors.push(`"${username}" already has a pending invitation`);
          continue;
        }

        // Create invitation
        const invitationId = await ctx.db.insert("groupInvitations", {
          groupId: args.groupId,
          inviterUserId: currentUser._id,
          invitedUserId: invitedUser._id,
          invitedUsername: username,
          message: args.message,
          status: "pending",
          expiresAt,
          createdAt: now,
          updatedAt: now,
        });

        invitations.push({
          invitationId,
          username,
          userId: invitedUser._id,
        });

        // Log invitation
        await ctx.db.insert("groupActivityLogs", {
          groupId: args.groupId,
          userId: currentUser._id,
          action: "member_joined", // Using existing action type
          metadata: `Invited ${username}`,
          createdAt: now,
        });

      } catch (error: any) {
        errors.push(`Failed to invite "${username}": ${error?.message || "Unknown error"}`);
      }
    }

    return {
      success: invitations.length > 0,
      invitations,
      errors,
      message: invitations.length > 0
        ? `Successfully sent ${invitations.length} invitation(s)`
        : "No invitations were sent",
    };
  },
});

// Accept a group invitation
export const acceptGroupInvitation = mutation({
  args: {
    sessionToken: v.string(),
    invitationId: v.id("groupInvitations"),
  },
  handler: async (ctx, args) => {
    // Validate session and get current user
    const currentUser = await validateSessionAndGetUser(ctx, args.sessionToken);

    // Get invitation
    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) {
      throw new ConvexError("Invitation not found");
    }

    if (invitation.invitedUserId !== currentUser._id) {
      throw new ConvexError("This invitation is not for you");
    }

    if (invitation.status !== "pending") {
      throw new ConvexError("This invitation is no longer valid");
    }

    if (invitation.expiresAt < Date.now()) {
      throw new ConvexError("This invitation has expired");
    }

    // Get group
    const group = await ctx.db.get(invitation.groupId);
    if (!group || !group.isActive) {
      throw new ConvexError("Group not found or inactive");
    }

    // Check if user is already a member
    const existingMembership = await ctx.db
      .query("groupMemberships")
      .withIndex("by_group_user", (q) => q.eq("groupId", invitation.groupId).eq("userId", currentUser._id))
      .first();

    if (existingMembership && existingMembership.status === "active") {
      throw new ConvexError("You are already a member of this group");
    }

    // Check member limit
    if (group.memberCount >= group.maxMembers) {
      throw new ConvexError("This group has reached its member limit");
    }

    const now = Date.now();

    // Create or update membership
    if (existingMembership) {
      await ctx.db.patch(existingMembership._id, {
        status: "active",
        role: "member",
        joinedAt: now,
        lastSeenAt: now,
        invitedBy: invitation.inviterUserId,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("groupMemberships", {
        groupId: invitation.groupId,
        userId: currentUser._id,
        role: "member",
        status: "active",
        joinedAt: now,
        lastSeenAt: now,
        invitedBy: invitation.inviterUserId,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Update invitation status
    await ctx.db.patch(args.invitationId, {
      status: "accepted",
      respondedAt: now,
      updatedAt: now,
    });

    // Update group member count
    await ctx.db.patch(invitation.groupId, {
      memberCount: group.memberCount + 1,
      lastActivity: now,
      updatedAt: now,
    });

    // Log member joined
    await ctx.db.insert("groupActivityLogs", {
      groupId: invitation.groupId,
      userId: currentUser._id,
      action: "member_joined",
      metadata: "Joined via invitation",
      createdAt: now,
    });

    return {
      success: true,
      message: "Successfully joined the group!",
      groupId: invitation.groupId,
    };
  },
});

// Update group membership last seen timestamp
export const updateGroupLastSeen = mutation({
  args: {
    sessionToken: v.string(),
    groupId: v.id("groups"),
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

    // Get the group
    const group = await ctx.db.get(args.groupId);
    if (!group || !group.isActive) {
      throw new ConvexError("Group not found or inactive");
    }

    // Get user's membership
    const membership = await ctx.db
      .query("groupMemberships")
      .withIndex("by_group_user", (q) => q.eq("groupId", args.groupId).eq("userId", currentUser._id))
      .first();

    if (!membership || membership.status !== "active") {
      throw new ConvexError("You are not a member of this group");
    }

    // Update last seen timestamp
    await ctx.db.patch(membership._id, {
      lastSeenAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Auto-join public/official groups
export const autoJoinGroup = mutation({
  args: {
    sessionToken: v.string(),
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    // Validate session and get current user
    const currentUser = await validateSessionAndGetUser(ctx, args.sessionToken);

    // Get group
    const group = await ctx.db.get(args.groupId);
    if (!group || !group.isActive) {
      throw new ConvexError("Group not found or inactive");
    }

    // Only allow auto-join for public groups or official groups
    if (!group.isPublic && group.type !== "permanent") {
      throw new ConvexError("This group requires an invitation to join");
    }

    // Check if user is already a member
    const existingMembership = await ctx.db
      .query("groupMemberships")
      .withIndex("by_group_user", (q) => q.eq("groupId", args.groupId).eq("userId", currentUser._id))
      .first();

    if (existingMembership && existingMembership.status === "active") {
      return {
        success: true,
        message: "You are already a member of this group",
        alreadyMember: true,
      };
    }

    if (existingMembership && existingMembership.status === "banned") {
      throw new ConvexError("You are banned from this group");
    }

    // Check member limit
    if (group.memberCount >= group.maxMembers) {
      throw new ConvexError("This group has reached its member limit");
    }

    const now = Date.now();

    // Create or update membership
    if (existingMembership) {
      await ctx.db.patch(existingMembership._id, {
        status: "active",
        role: "member",
        joinedAt: now,
        lastSeenAt: now,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("groupMemberships", {
        groupId: args.groupId,
        userId: currentUser._id,
        role: "member",
        status: "active",
        joinedAt: now,
        lastSeenAt: now,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Update group member count
    await ctx.db.patch(args.groupId, {
      memberCount: group.memberCount + 1,
      lastActivity: now,
      updatedAt: now,
    });

    // Log member joined
    await ctx.db.insert("groupActivityLogs", {
      groupId: args.groupId,
      userId: currentUser._id,
      action: "member_joined",
      metadata: "Auto-joined public group",
      createdAt: now,
    });

    return {
      success: true,
      message: "Successfully joined the group!",
      alreadyMember: false,
    };
  },
});

// Decline a group invitation
export const declineGroupInvitation = mutation({
  args: {
    sessionToken: v.string(),
    invitationId: v.id("groupInvitations"),
  },
  handler: async (ctx, args) => {
    // Validate session and get current user
    const currentUser = await validateSessionAndGetUser(ctx, args.sessionToken);

    // Get invitation
    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) {
      throw new ConvexError("Invitation not found");
    }

    if (invitation.invitedUserId !== currentUser._id) {
      throw new ConvexError("This invitation is not for you");
    }

    if (invitation.status !== "pending") {
      throw new ConvexError("This invitation is no longer valid");
    }

    const now = Date.now();

    // Update invitation status
    await ctx.db.patch(args.invitationId, {
      status: "declined",
      respondedAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      message: "Invitation declined",
    };
  },
});

// Delete a group (creator only)
export const deleteGroup = mutation({
  args: {
    sessionToken: v.string(),
    groupId: v.id("groups"),
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

    // Get the group
    const group = await ctx.db.get(args.groupId);
    if (!group || !group.isActive) {
      throw new ConvexError("Group not found or inactive");
    }

    // Check if user is the creator
    const membership = await ctx.db
      .query("groupMemberships")
      .withIndex("by_group_user", (q) => q.eq("groupId", args.groupId).eq("userId", currentUser._id))
      .first();

    if (!membership || membership.role !== "creator") {
      throw new ConvexError("Only the group creator can delete the group");
    }

    // Can't delete permanent groups
    if (group.type === "permanent") {
      throw new ConvexError("Permanent groups cannot be deleted");
    }

    const now = Date.now();

    // Mark group as inactive and archived
    await ctx.db.patch(args.groupId, {
      isActive: false,
      isArchived: true,
      archivedReason: "Deleted by creator",
      updatedAt: now,
    });

    // Update user to allow creating a new group
    await ctx.db.patch(currentUser._id, {
      hasCreatedGroup: false,
      createdGroupId: undefined,
      updatedAt: now,
    });

    // Mark conversation as inactive
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .first();

    if (conversation) {
      await ctx.db.patch(conversation._id, {
        isActive: false,
        updatedAt: now,
      });
    }

    // Log group deletion
    await ctx.db.insert("groupActivityLogs", {
      groupId: args.groupId,
      userId: currentUser._id,
      action: "deleted",
      createdAt: now,
    });

    return {
      success: true,
      message: "Group has been successfully deleted.",
    };
  },
});

// Create default permanent groups (internal function)
export const createDefaultGroups = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Check if default groups already exist
    const existingGroups = await ctx.db
      .query("groups")
      .withIndex("by_type", (q) => q.eq("type", "permanent").eq("isActive", true))
      .collect();

    if (existingGroups.length > 0) {
      return { message: "Default groups already exist" };
    }

    // Create default permanent groups
    const defaultGroups = [
      {
        name: "General Chat",
        description: "Welcome to ChatNow! Introduce yourself and chat with everyone.",
        maxMembers: 1000,
        isPublic: true,
        requiresApproval: false,
      },
      {
        name: "Tech Talk",
        description: "Discuss technology, programming, and digital trends.",
        maxMembers: 500,
        isPublic: true,
        requiresApproval: false,
      },
      {
        name: "Random",
        description: "Off-topic discussions and random conversations.",
        maxMembers: 500,
        isPublic: true,
        requiresApproval: false,
      },
      {
        name: "Help & Support",
        description: "Get help with ChatNow or ask questions.",
        maxMembers: 300,
        isPublic: true,
        requiresApproval: false,
      },
    ];

    const createdGroups = [];

    for (const groupData of defaultGroups) {
      // Create the group
      const groupId = await ctx.db.insert("groups", {
        name: groupData.name,
        description: groupData.description,
        type: "permanent",
        creatorId: undefined, // No creator for permanent groups
        maxMembers: groupData.maxMembers,
        isPublic: groupData.isPublic,
        requiresApproval: groupData.requiresApproval,
        lastActivity: now,
        memberCount: 0, // Start with 0 members
        isActive: true,
        isArchived: false,
        markedForDeletion: false,
        createdAt: now,
        updatedAt: now,
      });

      // Create group conversation
      const conversationId = await ctx.db.insert("conversations", {
        groupId,
        type: "group",
        name: groupData.name,
        lastMessageAt: now,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });

      // Log group creation
      await ctx.db.insert("groupActivityLogs", {
        groupId,
        userId: undefined, // System action
        action: "created",
        createdAt: now,
      });

      createdGroups.push({ groupId, conversationId, name: groupData.name });
    }

    return {
      success: true,
      message: `Created ${createdGroups.length} default groups`,
      groups: createdGroups,
    };
  },
});

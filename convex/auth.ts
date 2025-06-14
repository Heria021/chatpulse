import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Helper function to hash passwords (simplified for demo - in production use bcrypt)
function hashPassword(password: string): string {
  // Simple hash with salt for better security than plain base64
  const salt = "chatnow_salt_2024"; // In production, use random salt per user
  const combined = password + salt;
  return Buffer.from(combined).toString('base64');
}

// Helper function to verify passwords
function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Helper function to generate session token
function generateSessionToken(): string {
  // More secure token generation
  const randomPart = Math.random().toString(36).substring(2);
  const timestampPart = Date.now().toString(36);
  const extraRandom = Math.random().toString(36).substring(2);
  return `${randomPart}_${timestampPart}_${extraRandom}`;
}

// Helper function to generate guest session ID
function generateGuestSessionId(): string {
  return 'guest_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Register a new user
export const registerUser = mutation({
  args: {
    username: v.string(),
    email: v.string(),
    password: v.string(),
    age: v.number(),
    gender: v.union(v.literal("male"), v.literal("female"), v.literal("other")),
  },
  handler: async (ctx, args) => {
    // Check if username already exists
    const existingUsername = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (existingUsername) {
      throw new ConvexError("Username already exists");
    }

    // Check if email already exists
    const existingEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingEmail) {
      throw new ConvexError("Email already exists");
    }

    // Validate age
    if (args.age < 18) {
      throw new ConvexError("You must be at least 18 years old");
    }

    // Hash password
    const passwordHash = hashPassword(args.password);

    // Create user
    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      username: args.username,
      email: args.email,
      passwordHash,
      age: args.age,
      gender: args.gender,
      isGuest: false,
      isOnline: true,
      lastSeen: now,
      allowGuestMessages: true,
      showOnlineStatus: true,
      isActive: true,
      isBanned: false,
      createdAt: now,
      updatedAt: now,
    });

    // Create session
    const sessionToken = generateSessionToken();
    await ctx.db.insert("sessions", {
      userId,
      sessionToken,
      isActive: true,
      lastActivity: now,
      createdAt: now,
      expiresAt: now + (30 * 24 * 60 * 60 * 1000), // 30 days
    });

    // Log activity
    await ctx.db.insert("activityLogs", {
      userId,
      action: "register",
      createdAt: now,
    });

    // Get the created user
    const user = await ctx.db.get(userId);
    return { user, sessionToken };
  },
});

// Sign in user
export const signInUser = mutation({
  args: {
    emailOrUsername: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by email or username
    let user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.emailOrUsername))
      .first();

    if (!user) {
      user = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", args.emailOrUsername))
        .first();
    }

    if (!user) {
      throw new ConvexError("Invalid credentials");
    }

    // Check if user is banned
    if (user.isBanned) {
      const banMessage = user.banReason || "Your account has been banned";
      if (user.banExpiresAt && user.banExpiresAt > Date.now()) {
        throw new ConvexError(`${banMessage}. Ban expires: ${new Date(user.banExpiresAt).toLocaleDateString()}`);
      } else if (!user.banExpiresAt) {
        throw new ConvexError(`${banMessage}. This is a permanent ban.`);
      }
    }

    // Check if account is active
    if (!user.isActive) {
      throw new ConvexError("Account is deactivated");
    }

    // Verify password
    if (!user.passwordHash || !verifyPassword(args.password, user.passwordHash)) {
      throw new ConvexError("Invalid credentials");
    }

    // Update user status
    const now = Date.now();
    await ctx.db.patch(user._id, {
      isOnline: true,
      lastSeen: now,
      updatedAt: now,
    });

    // Create session
    const sessionToken = generateSessionToken();
    await ctx.db.insert("sessions", {
      userId: user._id,
      sessionToken,
      isActive: true,
      lastActivity: now,
      createdAt: now,
      expiresAt: now + (30 * 24 * 60 * 60 * 1000), // 30 days
    });

    // Log activity
    await ctx.db.insert("activityLogs", {
      userId: user._id,
      action: "login",
      createdAt: now,
    });

    // Get updated user
    const updatedUser = await ctx.db.get(user._id);
    return { user: updatedUser, sessionToken };
  },
});

// Create guest user
export const createGuestUser = mutation({
  args: {
    username: v.string(),
    age: v.number(),
    gender: v.union(v.literal("male"), v.literal("female"), v.literal("other")),
  },
  handler: async (ctx, args) => {
    // Validate age
    if (args.age < 18) {
      throw new ConvexError("You must be at least 18 years old");
    }

    // Generate unique guest username if needed
    let guestUsername = `Guest_${args.username}`;
    let counter = 1;
    
    while (true) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", guestUsername))
        .first();
      
      if (!existing) break;
      
      guestUsername = `Guest_${args.username}_${counter}`;
      counter++;
    }

    // Create guest user
    const now = Date.now();
    const guestSessionId = generateGuestSessionId();
    const guestExpiresAt = now + (24 * 60 * 60 * 1000); // 24 hours

    const userId = await ctx.db.insert("users", {
      username: guestUsername,
      age: args.age,
      gender: args.gender,
      isGuest: true,
      guestSessionId,
      guestExpiresAt,
      isOnline: true,
      lastSeen: now,
      allowGuestMessages: true,
      showOnlineStatus: true,
      isActive: true,
      isBanned: false,
      createdAt: now,
      updatedAt: now,
    });

    // Create session
    const sessionToken = generateSessionToken();
    await ctx.db.insert("sessions", {
      userId,
      sessionToken,
      isActive: true,
      lastActivity: now,
      createdAt: now,
      expiresAt: guestExpiresAt,
    });

    // Get the created user
    const user = await ctx.db.get(userId);
    return { user, sessionToken };
  },
});

// Check username availability
export const checkUsernameAvailability = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();
    
    return { available: !existing };
  },
});

// Get user by session token
export const getUserBySession = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("sessionToken", args.sessionToken))
      .first();

    if (!session || !session.isActive || session.expiresAt < Date.now()) {
      return null;
    }

    const user = await ctx.db.get(session.userId);
    if (!user || !user.isActive) {
      return null;
    }

    return user;
  },
});

// Sign out user
export const signOutUser = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("sessionToken", args.sessionToken))
      .first();

    if (session) {
      // Deactivate session
      await ctx.db.patch(session._id, {
        isActive: false,
      });

      // Update user status
      const user = await ctx.db.get(session.userId);
      if (user) {
        const now = Date.now();
        await ctx.db.patch(user._id, {
          isOnline: false,
          lastSeen: now,
          updatedAt: now,
        });

        // Log activity
        await ctx.db.insert("activityLogs", {
          userId: user._id,
          action: "logout",
          createdAt: now,
        });
      }
    }

    return { success: true };
  },
});

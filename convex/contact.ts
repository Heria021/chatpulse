import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Submit a new contact form
export const submitContactForm = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate email format (basic validation)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new Error("Invalid email format");
    }

    // Validate required fields
    if (!args.name.trim() || !args.subject.trim() || !args.message.trim()) {
      throw new Error("All fields are required");
    }

    // Create the contact submission
    const submissionId = await ctx.db.insert("contactSubmissions", {
      name: args.name.trim(),
      email: args.email.toLowerCase().trim(),
      subject: args.subject.trim(),
      message: args.message.trim(),
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      createdAt: Date.now(),
    });

    return submissionId;
  },
});

// Get all contact submissions (simple query for basic tracking)
export const getContactSubmissions = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const submissions = await ctx.db
      .query("contactSubmissions")
      .withIndex("by_creation")
      .order("desc")
      .take(args.limit || 50);
    return submissions;
  },
});

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Rich content section schema for validation
const contentSectionSchema = v.object({
  id: v.string(),
  type: v.union(
    v.literal("heading"),
    v.literal("subheading"),
    v.literal("paragraph"),
    v.literal("code"),
    v.literal("image"),
    v.literal("quote"),
    v.literal("list")
  ),
  content: v.string(),
  level: v.optional(v.number()),
  codeBlock: v.optional(v.object({
    language: v.string(),
    code: v.string(),
    title: v.optional(v.string()),
    showLineNumbers: v.optional(v.boolean()),
    highlightLines: v.optional(v.array(v.number())),
  })),
  imageUrl: v.optional(v.string()),
  imageAlt: v.optional(v.string()),
  listItems: v.optional(v.array(v.string())),
  listType: v.optional(v.union(v.literal("ordered"), v.literal("unordered"))),
  order: v.number(),
});

// Get all published blog posts
export const getBlogPosts = query({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.category) {
      const posts = await ctx.db
        .query("blogPosts")
        .withIndex("by_category", (q) =>
          q.eq("category", args.category!).eq("isPublished", true)
        )
        .order("desc")
        .take(args.limit || 20);
      return posts;
    } else {
      const posts = await ctx.db
        .query("blogPosts")
        .filter((q) => q.eq(q.field("isPublished"), true))
        .order("desc")
        .take(args.limit || 20);
      return posts;
    }
  },
});

// Get a single blog post by slug
export const getBlogPost = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("blogPosts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .filter((q) => q.eq(q.field("isPublished"), true))
      .first();

    return post;
  },
});

// Increment view count for a blog post
export const incrementBlogPostViews = mutation({
  args: {
    postId: v.id("blogPosts"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (post) {
      await ctx.db.patch(args.postId, {
        views: post.views + 1,
        updatedAt: Date.now(),
      });
    }
  },
});

// Get featured blog posts (latest 3)
export const getFeaturedPosts = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("blogPosts")
      .filter((q) => q.eq(q.field("isPublished"), true))
      .order("desc")
      .take(3);

    return posts;
  },
});

// Get blog categories with post counts
export const getBlogCategories = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("blogPosts")
      .filter((q) => q.eq(q.field("isPublished"), true))
      .collect();

    const categoryCount: Record<string, number> = {};
    
    posts.forEach(post => {
      categoryCount[post.category] = (categoryCount[post.category] || 0) + 1;
    });
    
    return Object.entries(categoryCount).map(([category, count]) => ({
      category,
      count,
    }));
  },
});

// Search blog posts
export const searchBlogPosts = query({
  args: {
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("blogPosts")
      .filter((q) => q.eq(q.field("isPublished"), true))
      .collect();

    const searchTerm = args.searchTerm.toLowerCase();

    const filteredPosts = posts.filter(post => {
      // Search in title, excerpt, and tags
      const titleMatch = post.title.toLowerCase().includes(searchTerm);
      const excerptMatch = post.excerpt.toLowerCase().includes(searchTerm);
      const tagMatch = post.tags.some(tag => tag.toLowerCase().includes(searchTerm));

      // Search in rich content
      const contentMatch = post.richContent.some(section =>
        section.content.toLowerCase().includes(searchTerm) ||
        (section.listItems && section.listItems.some(item =>
          item.toLowerCase().includes(searchTerm)
        )) ||
        (section.codeBlock && section.codeBlock.code.toLowerCase().includes(searchTerm))
      );

      return titleMatch || excerptMatch || tagMatch || contentMatch;
    });

    return filteredPosts
      .sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0))
      .slice(0, args.limit || 10);
  },
});

// Admin functions removed - blog posts are now managed directly through Convex dashboard







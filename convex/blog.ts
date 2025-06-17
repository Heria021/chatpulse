import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
        .withIndex("by_published", (q) =>
          q.eq("isPublished", true)
        )
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
      .withIndex("by_published", (q) => q.eq("isPublished", true))
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
      .withIndex("by_published", (q) => q.eq("isPublished", true))
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
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect();
    
    const searchTerm = args.searchTerm.toLowerCase();
    
    const filteredPosts = posts.filter(post => 
      post.title.toLowerCase().includes(searchTerm) ||
      post.excerpt.toLowerCase().includes(searchTerm) ||
      post.content.toLowerCase().includes(searchTerm) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
    
    return filteredPosts
      .sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0))
      .slice(0, args.limit || 10);
  },
});



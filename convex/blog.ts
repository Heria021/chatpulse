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

// Create a new blog post
export const createBlogPost = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    excerpt: v.string(),
    content: v.string(),
    richContent: v.optional(v.array(contentSectionSchema)),
    coverImage: v.optional(v.string()),
    author: v.string(),
    authorImage: v.optional(v.string()),
    category: v.string(),
    tags: v.array(v.string()),
    isPublished: v.boolean(),
    metaDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Calculate reading time
    const calculateReadingTime = (content: string, richContent?: any[]) => {
      const wordsPerMinute = 200;
      let totalWords = content.split(/\s+/).length;

      if (richContent) {
        richContent.forEach(section => {
          if (section.type === 'code' && section.codeBlock) {
            totalWords += Math.ceil(section.codeBlock.code.split(/\s+/).length * 1.5);
          } else if (section.listItems) {
            totalWords += section.listItems.join(' ').split(/\s+/).length;
          }
        });
      }

      return Math.max(1, Math.ceil(totalWords / wordsPerMinute));
    };

    const readTime = calculateReadingTime(args.content, args.richContent);
    const now = Date.now();

    const postId = await ctx.db.insert("blogPosts", {
      title: args.title,
      slug: args.slug,
      excerpt: args.excerpt,
      content: args.content,
      richContent: args.richContent,
      coverImage: args.coverImage,
      author: args.author,
      authorImage: args.authorImage,
      category: args.category,
      tags: args.tags,
      isPublished: args.isPublished,
      publishedAt: args.isPublished ? now : undefined,
      metaDescription: args.metaDescription,
      readTime,
      views: 0,
      createdAt: now,
      updatedAt: now,
    });

    return { postId, message: "Blog post created successfully" };
  },
});

// Update a blog post
export const updateBlogPost = mutation({
  args: {
    postId: v.id("blogPosts"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    content: v.optional(v.string()),
    richContent: v.optional(v.array(contentSectionSchema)),
    coverImage: v.optional(v.string()),
    author: v.optional(v.string()),
    authorImage: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isPublished: v.optional(v.boolean()),
    metaDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Blog post not found");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    // Update fields if provided
    if (args.title !== undefined) updates.title = args.title;
    if (args.slug !== undefined) updates.slug = args.slug;
    if (args.excerpt !== undefined) updates.excerpt = args.excerpt;
    if (args.content !== undefined) updates.content = args.content;
    if (args.richContent !== undefined) updates.richContent = args.richContent;
    if (args.coverImage !== undefined) updates.coverImage = args.coverImage;
    if (args.author !== undefined) updates.author = args.author;
    if (args.authorImage !== undefined) updates.authorImage = args.authorImage;
    if (args.category !== undefined) updates.category = args.category;
    if (args.tags !== undefined) updates.tags = args.tags;
    if (args.metaDescription !== undefined) updates.metaDescription = args.metaDescription;

    // Handle publishing status
    if (args.isPublished !== undefined) {
      updates.isPublished = args.isPublished;
      if (args.isPublished && !post.publishedAt) {
        updates.publishedAt = Date.now();
      } else if (!args.isPublished) {
        updates.publishedAt = undefined;
      }
    }

    // Recalculate reading time if content changed
    if (args.content !== undefined || args.richContent !== undefined) {
      const content = args.content || post.content;
      const richContent = args.richContent || post.richContent;

      const wordsPerMinute = 200;
      let totalWords = content.split(/\s+/).length;

      if (richContent) {
        richContent.forEach((section: any) => {
          if (section.type === 'code' && section.codeBlock) {
            totalWords += Math.ceil(section.codeBlock.code.split(/\s+/).length * 1.5);
          } else if (section.listItems) {
            totalWords += section.listItems.join(' ').split(/\s+/).length;
          }
        });
      }

      updates.readTime = Math.max(1, Math.ceil(totalWords / wordsPerMinute));
    }

    await ctx.db.patch(args.postId, updates);
    return { message: "Blog post updated successfully" };
  },
});

// Delete a blog post
export const deleteBlogPost = mutation({
  args: {
    postId: v.id("blogPosts"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Blog post not found");
    }

    await ctx.db.delete(args.postId);
    return { message: "Blog post deleted successfully" };
  },
});

// Get all blog posts (including drafts) - for admin use
export const getAllBlogPosts = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("blogPosts")
      .order("desc")
      .take(args.limit || 50);

    return posts;
  },
});

// Get blog stats
export const getBlogStats = query({
  args: {},
  handler: async (ctx) => {
    const allPosts = await ctx.db.query("blogPosts").collect();
    const publishedPosts = allPosts.filter(post => post.isPublished);

    const totalViews = allPosts.reduce((sum, post) => sum + post.views, 0);
    const avgReadTime = publishedPosts.length > 0
      ? Math.round(publishedPosts.reduce((sum, post) => sum + post.readTime, 0) / publishedPosts.length)
      : 0;

    return {
      totalPosts: allPosts.length,
      publishedPosts: publishedPosts.length,
      draftPosts: allPosts.length - publishedPosts.length,
      totalViews,
      avgReadTime,
    };
  },
});



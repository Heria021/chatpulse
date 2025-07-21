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

// Internal helper function to create blog posts
async function createBlogPostInternal(ctx: any, args: {
  title: string,
  excerpt: string,
  richContent: any[],
  author: string,
  category: string,
  tags: string[],
  metaDescription: string,
  coverImage?: string,
  coverImageAlt?: string,
  authorImage?: string,
  authorBio?: string,
  metaKeywords?: string[],
  canonicalUrl?: string,
  ogTitle?: string,
  ogDescription?: string,
  ogImage?: string,
  twitterCard?: string,
  featured?: boolean,
  isPublished?: boolean,
}) {
  // Generate SEO-optimized slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 60)
  }

  const slug = generateSlug(args.title)

  // Check if slug already exists
  const existingPost = await ctx.db
    .query("blogPosts")
    .withIndex("by_slug", (q: any) => q.eq("slug", slug))
    .first()

  if (existingPost) {
    throw new Error(`A post with slug "${slug}" already exists. Please use a different title.`)
  }

  // Calculate reading time based on content
  const calculateReadingTime = (richContent: any[]) => {
    const wordsPerMinute = 200
    let totalWords = 0

    richContent.forEach(section => {
      switch (section.type) {
        case 'heading':
        case 'subheading':
        case 'paragraph':
        case 'quote':
          totalWords += section.content.split(/\s+/).filter((word: string) => word.length > 0).length
          break
        case 'code':
          if (section.codeBlock) {
            totalWords += Math.ceil(section.codeBlock.code.split(/\s+/).length * 0.5)
          }
          break
        case 'list':
          if (section.listItems) {
            totalWords += section.listItems.join(' ').split(/\s+/).filter((word: string) => word.length > 0).length
          }
          break
      }
    })

    return Math.max(1, Math.ceil(totalWords / wordsPerMinute))
  }

  const readTime = calculateReadingTime(args.richContent)
  const now = Date.now()

  const postId = await ctx.db.insert("blogPosts", {
    title: args.title,
    slug,
    excerpt: args.excerpt,
    richContent: args.richContent,
    coverImage: args.coverImage,
    coverImageAlt: args.coverImageAlt,
    author: args.author,
    authorImage: args.authorImage,
    authorBio: args.authorBio,
    category: args.category,
    tags: args.tags,
    isPublished: args.isPublished ?? true, // Default to published
    publishedAt: (args.isPublished ?? true) ? now : undefined,
    metaDescription: args.metaDescription,
    metaKeywords: args.metaKeywords,
    canonicalUrl: args.canonicalUrl,
    ogTitle: args.ogTitle,
    ogDescription: args.ogDescription,
    ogImage: args.ogImage,
    twitterCard: args.twitterCard,
    readTime,
    views: 0,
    featured: args.featured ?? false,
    createdAt: now,
    updatedAt: now,
  })

  return {
    postId,
    slug,
    message: `Blog post "${args.title}" created successfully!`,
    url: `/blog/${slug}`
  }
}

// Removed individual createBlogPost - use createSampleBlogPosts for content creation

// Removed individual createSampleBlogPost - use createSampleBlogPosts for content creation

// Create comprehensive production-ready blog posts - enhanced version
export const createSampleBlogPosts = mutation({
  args: {},
  handler: async (ctx) => {
    const productionPosts = [
      // Random Chat App SEO-Focused Content
      {
        title: "Best Random Chat Apps 2025: Connect with Strangers Instantly",
        category: "reviews",
        excerpt: "Discover the top random chat apps for meeting new people online. Compare features, safety measures, and user experiences across leading platforms.",
        tags: ["random-chat-app", "chat-with-strangers", "stranger-chat", "meet-new-people", "anonymous-chat"],
        featured: true
      },
      {
        title: "How to Chat with Strangers Safely: Complete Guide for Random Chat Apps",
        category: "safety",
        excerpt: "Essential safety tips for using random chat applications. Learn how to protect your privacy while meeting new people online through stranger chat platforms.",
        tags: ["chat-with-strangers", "online-safety", "anonymous-chat", "stranger-chat-safety", "privacy-protection"],
        featured: true
      },
      {
        title: "Random Video Chat vs Text Chat: Which is Better for Meeting Strangers?",
        category: "comparison",
        excerpt: "Compare random video chat and text-based stranger chat platforms. Discover the pros and cons of each approach for connecting with random people online.",
        tags: ["random-video-chat", "text-chat", "video-chat-strangers", "chat-comparison", "online-communication"],
        featured: false
      },
      {
        title: "Free Random Chat Apps: Top Platforms to Talk with Strangers Without Registration",
        category: "free-apps",
        excerpt: "Explore the best free random chat applications that don't require registration. Start chatting with strangers instantly on these anonymous platforms.",
        tags: ["free-random-chat", "no-registration-chat", "anonymous-chat-free", "instant-chat", "stranger-chat-free"],
        featured: false
      },
      {
        title: "Anonymous Chat: How to Stay Private While Meeting New People Online",
        category: "privacy",
        excerpt: "Master anonymous chatting techniques for random chat apps. Learn how to maintain privacy while building meaningful connections with strangers online.",
        tags: ["anonymous-chat", "privacy-chat", "secure-stranger-chat", "anonymous-messaging", "private-chat"],
        featured: false
      },
      {
        title: "Random Chat App Development: Building the Next Generation of Stranger Chat Platforms",
        category: "development",
        excerpt: "Technical guide to developing random chat applications. Learn about matching algorithms, real-time messaging, and safety features for stranger chat apps.",
        tags: ["chat-app-development", "random-chat-algorithm", "stranger-matching", "real-time-chat", "chat-platform"],
        featured: false
      },
      {
        title: "Psychology of Random Chat: Why People Love Talking to Strangers Online",
        category: "psychology",
        excerpt: "Explore the psychological factors that drive people to use random chat apps. Understand user motivations and behaviors in stranger chat environments.",
        tags: ["chat-psychology", "stranger-interaction", "online-socialization", "random-connections", "social-behavior"],
        featured: false
      },
      {
        title: "Mobile Random Chat Apps: Best Stranger Chat Experiences on iOS and Android",
        category: "mobile-apps",
        excerpt: "Review the top mobile random chat applications for smartphones. Compare features, user interfaces, and performance across iOS and Android platforms.",
        tags: ["mobile-chat-app", "ios-random-chat", "android-stranger-chat", "mobile-stranger-chat", "chat-app-mobile"],
        featured: false
      },
      {
        title: "Random Chat Etiquette: How to Be Respectful When Talking to Strangers Online",
        category: "etiquette",
        excerpt: "Learn proper etiquette for random chat applications. Discover how to have meaningful conversations and build positive connections with strangers online.",
        tags: ["chat-etiquette", "online-manners", "stranger-chat-tips", "respectful-chatting", "conversation-skills"],
        featured: false
      },
      {
        title: "The Evolution of Random Chat: From Chat Roulette to Modern Stranger Chat Apps",
        category: "history",
        excerpt: "Trace the history and evolution of random chat platforms. From early chat roulette sites to today's sophisticated stranger chat applications.",
        tags: ["chat-roulette", "random-chat-history", "stranger-chat-evolution", "chat-platform-history", "online-chat-trends"],
        featured: false
      },
      {
        title: "Random Chat for Language Learning: Practice Speaking with Native Strangers",
        category: "language-learning",
        excerpt: "Use random chat apps to improve language skills by talking with native speakers. Discover the best stranger chat platforms for language exchange.",
        tags: ["language-exchange-chat", "practice-languages", "chat-language-learning", "speak-with-natives", "language-chat-app"],
        featured: false
      },
      {
        title: "Building Meaningful Connections: From Random Chat to Real Friendships",
        category: "relationships",
        excerpt: "Transform random stranger conversations into lasting friendships. Learn strategies for building genuine connections through random chat applications.",
        tags: ["online-friendships", "meaningful-connections", "stranger-to-friend", "chat-relationships", "social-connections"],
        featured: false
      },
      {
        title: "Random Chat App Monetization: How Stranger Chat Platforms Make Money",
        category: "business",
        excerpt: "Explore revenue models for random chat applications. Learn how stranger chat platforms monetize their services while maintaining user experience.",
        tags: ["chat-app-monetization", "random-chat-revenue", "stranger-chat-business", "chat-platform-profits", "app-business-model"],
        featured: false
      },
      {
        title: "AI-Powered Random Chat: The Future of Stranger Matching Algorithms",
        category: "ai-technology",
        excerpt: "Discover how artificial intelligence is revolutionizing random chat apps. Learn about smart matching algorithms and AI-enhanced stranger chat experiences.",
        tags: ["ai-chat-matching", "smart-stranger-chat", "ai-random-chat", "intelligent-matching", "chat-ai-technology"],
        featured: false
      },
      {
        title: "Random Chat Moderation: Keeping Stranger Chat Platforms Safe and Clean",
        category: "moderation",
        excerpt: "Understand content moderation strategies for random chat applications. Learn how platforms maintain safety while preserving the spontaneity of stranger chat.",
        tags: ["chat-moderation", "stranger-chat-safety", "content-filtering", "chat-platform-security", "safe-random-chat"],
        featured: false
      }
    ]

    const results = []

    for (const post of productionPosts) {
      try {
        // Generate rich, detailed content for each post
        const richContent = await generateDetailedContent(post.title, post.category)

        const result = await createBlogPostInternal(ctx, {
          title: post.title,
          excerpt: post.excerpt,
          richContent,
          author: getAuthorForCategory(post.category),
          authorBio: getAuthorBio(post.category),
          authorImage: getAuthorImage(post.category),
          category: post.category,
          tags: post.tags,
          metaDescription: post.excerpt,
          metaKeywords: post.tags,
          coverImage: getCoverImage(post.category),
          coverImageAlt: `Professional illustration for ${post.title}`,
          featured: post.featured,
          isPublished: true
        })

        results.push(result)
      } catch (error) {
        console.error(`Failed to create post "${post.title}":`, error)
        results.push({ error: `Failed to create "${post.title}": ${error}` })
      }
    }

    return {
      message: `Created ${results.filter((r: any) => !r.error).length} production-ready blog posts`,
      results,
      categories: [...new Set(productionPosts.map(p => p.category))],
      totalPosts: productionPosts.length
    }
  },
})

// Removed createProductionBlogContent - use enhanced createSampleBlogPosts instead

// Generate detailed, production-ready content for each post
async function generateDetailedContent(title: string, category: string) {
  const baseId = Date.now()

  // Random Chat App SEO-focused content
  if (category === "reviews") {
    return [
      {
        id: `heading-${baseId}`,
        type: "heading" as const,
        content: title,
        level: 1,
        order: 0
      },
      {
        id: `paragraph-intro-${baseId}`,
        type: "paragraph" as const,
        content: "🌟 **Updated for 2025** - Looking for the best random chat apps to meet new people and chat with strangers? You're in the right place! This comprehensive guide reviews the top stranger chat platforms, comparing features, safety measures, and user experiences to help you find the perfect random chat app for your needs.",
        order: 1
      },
      {
        id: `heading-why-${baseId}`,
        type: "heading" as const,
        content: "Why Use Random Chat Apps?",
        level: 2,
        order: 2
      },
      {
        id: `paragraph-why-${baseId}`,
        type: "paragraph" as const,
        content: "Random chat applications have revolutionized how we connect with people worldwide. Whether you're looking to practice a new language, make friends from different cultures, or simply have interesting conversations with strangers, these platforms offer unique opportunities for spontaneous social interaction.",
        order: 3
      },
      {
        id: `list-benefits-${baseId}`,
        type: "list" as const,
        content: "Key benefits of random chat apps:",
        listType: "unordered" as const,
        listItems: [
          "Meet people from around the world instantly",
          "Practice languages with native speakers",
          "Overcome social anxiety in a low-pressure environment",
          "Discover new perspectives and cultures",
          "Make genuine friendships and connections",
          "Available 24/7 with global user base"
        ],
        order: 4
      },
      {
        id: `heading-top-apps-${baseId}`,
        type: "heading" as const,
        content: "Top 10 Random Chat Apps in 2025",
        level: 2,
        order: 5
      },
      {
        id: `heading-chatnow-${baseId}`,
        type: "heading" as const,
        content: "1. ChatNow - Best Overall Random Chat Experience",
        level: 3,
        order: 6
      },
      {
        id: `paragraph-chatnow-${baseId}`,
        type: "paragraph" as const,
        content: "**ChatNow** leads the pack with its intuitive interface, advanced matching algorithms, and robust safety features. This platform excels at connecting users based on interests and preferences, making conversations more meaningful and engaging.",
        order: 7
      },
      {
        id: `list-chatnow-features-${baseId}`,
        type: "list" as const,
        content: "ChatNow Features:",
        listType: "unordered" as const,
        listItems: [
          "✅ Smart interest-based matching",
          "✅ Real-time translation support",
          "✅ Advanced privacy controls",
          "✅ Mobile and web platforms",
          "✅ 24/7 moderation system",
          "✅ Free and premium tiers"
        ],
        order: 8
      },
      {
        id: `heading-safety-${baseId}`,
        type: "heading" as const,
        content: "Safety Features to Look For",
        level: 2,
        order: 9
      },
      {
        id: `paragraph-safety-${baseId}`,
        type: "paragraph" as const,
        content: "When choosing a random chat app, safety should be your top priority. The best stranger chat platforms implement multiple layers of protection to ensure users can chat with strangers safely and securely.",
        order: 10
      },
      {
        id: `list-safety-${baseId}`,
        type: "list" as const,
        content: "Essential safety features:",
        listType: "unordered" as const,
        listItems: [
          "Real-time content moderation and AI filtering",
          "Easy reporting and blocking mechanisms",
          "Anonymous chat options to protect identity",
          "Age verification and parental controls",
          "Encrypted messaging for privacy protection",
          "Clear community guidelines and enforcement"
        ],
        order: 11
      },
      {
        id: `heading-tips-${baseId}`,
        type: "heading" as const,
        content: "Tips for Better Random Chat Experiences",
        level: 2,
        order: 12
      },
      {
        id: `paragraph-tips-${baseId}`,
        type: "paragraph" as const,
        content: "To make the most of your random chat app experience, follow these proven strategies for meaningful conversations and safe interactions with strangers online.",
        order: 13
      },
      {
        id: `list-tips-${baseId}`,
        type: "list" as const,
        content: "Best practices for random chatting:",
        listType: "unordered" as const,
        listItems: [
          "Be respectful and open-minded in conversations",
          "Never share personal information like address or phone",
          "Use the app's built-in safety features",
          "Report inappropriate behavior immediately",
          "Start with light topics before deeper conversations",
          "Trust your instincts and leave uncomfortable chats"
        ],
        order: 14
      },
      {
        id: `heading-conclusion-${baseId}`,
        type: "heading" as const,
        content: "Start Your Random Chat Journey Today",
        level: 2,
        order: 15
      },
      {
        id: `paragraph-conclusion-${baseId}`,
        type: "paragraph" as const,
        content: "Random chat apps offer incredible opportunities to connect with people worldwide, learn about different cultures, and make lasting friendships. Choose a platform that prioritizes safety, offers the features you need, and aligns with your communication preferences. Remember to chat responsibly and enjoy the amazing connections you'll make!",
        order: 16
      }
    ]
  }

  if (category === "safety") {
    return [
      {
        id: `heading-${baseId}`,
        type: "heading" as const,
        content: title,
        level: 1,
        order: 0
      },
      {
        id: `paragraph-intro-${baseId}`,
        type: "paragraph" as const,
        content: "🛡️ **Your Safety Guide** - Random chat apps offer exciting opportunities to meet new people, but staying safe while chatting with strangers online is crucial. This comprehensive guide covers essential safety tips, privacy protection strategies, and best practices for secure anonymous chatting.",
        order: 1
      },
      {
        id: `heading-risks-${baseId}`,
        type: "heading" as const,
        content: "Understanding the Risks of Random Chat",
        level: 2,
        order: 2
      },
      {
        id: `paragraph-risks-${baseId}`,
        type: "paragraph" as const,
        content: "While most random chat experiences are positive, it's important to understand potential risks when talking to strangers online. Being aware of these risks helps you make informed decisions and stay protected.",
        order: 3
      },
      {
        id: `list-risks-${baseId}`,
        type: "list" as const,
        content: "Common risks in stranger chat apps:",
        listType: "unordered" as const,
        listItems: [
          "Privacy breaches and personal information exposure",
          "Inappropriate content or harassment",
          "Scams and fraudulent activities",
          "Cyberbullying and emotional manipulation",
          "Malicious links and malware distribution",
          "Identity theft and impersonation"
        ],
        order: 4
      },
      {
        id: `heading-protection-${baseId}`,
        type: "heading" as const,
        content: "Essential Privacy Protection Strategies",
        level: 2,
        order: 5
      },
      {
        id: `paragraph-protection-${baseId}`,
        type: "paragraph" as const,
        content: "Protecting your privacy while using random chat apps requires a multi-layered approach. These strategies will help you maintain anonymity while still enjoying meaningful conversations with strangers.",
        order: 6
      },
      {
        id: `code-privacy-${baseId}`,
        type: "code" as const,
        content: "Privacy checklist for random chat apps:",
        codeBlock: {
          language: "markdown",
          code: `# Privacy Protection Checklist

## Personal Information
- [ ] Never share your real name
- [ ] Don't reveal your location or address
- [ ] Keep phone numbers private
- [ ] Avoid sharing social media profiles
- [ ] Don't mention workplace or school

## Technical Protection
- [ ] Use a VPN for additional anonymity
- [ ] Enable app privacy settings
- [ ] Use anonymous usernames
- [ ] Disable location services
- [ ] Clear chat history regularly

## Safe Communication
- [ ] Stick to the platform's chat system
- [ ] Avoid moving to external platforms quickly
- [ ] Don't share photos with identifying information
- [ ] Be cautious with video chat
- [ ] Trust your instincts about conversations`,
          title: "Random Chat Safety Checklist",
          showLineNumbers: true
        },
        order: 7
      },
      {
        id: `heading-red-flags-${baseId}`,
        type: "heading" as const,
        content: "Red Flags to Watch Out For",
        level: 2,
        order: 8
      },
      {
        id: `paragraph-red-flags-${baseId}`,
        type: "paragraph" as const,
        content: "Recognizing warning signs early can prevent dangerous situations. Here are the most common red flags to watch for when chatting with strangers on random chat platforms.",
        order: 9
      },
      {
        id: `list-red-flags-${baseId}`,
        type: "list" as const,
        content: "Warning signs in stranger chat conversations:",
        listType: "unordered" as const,
        listItems: [
          "🚩 Asking for personal information immediately",
          "🚩 Pressuring you to move to other platforms",
          "🚩 Requesting money or financial information",
          "🚩 Sending inappropriate or explicit content",
          "🚩 Claiming to be in emergency situations",
          "🚩 Refusing to respect your boundaries",
          "🚩 Stories that don't add up or seem fake",
          "🚩 Pushing for real-life meetings too quickly"
        ],
        order: 10
      },
      {
        id: `heading-safe-practices-${baseId}`,
        type: "heading" as const,
        content: "Best Practices for Safe Random Chatting",
        level: 2,
        order: 11
      },
      {
        id: `paragraph-safe-practices-${baseId}`,
        type: "paragraph" as const,
        content: "Following these proven safety practices will help you enjoy random chat apps while minimizing risks. These guidelines are based on security expert recommendations and user experiences.",
        order: 12
      },
      {
        id: `quote-safety-${baseId}`,
        type: "quote" as const,
        content: "The key to safe random chatting is maintaining healthy skepticism while remaining open to genuine connections. Trust your instincts and prioritize your safety above all else.",
        order: 13
      },
      {
        id: `heading-conclusion-safety-${baseId}`,
        type: "heading" as const,
        content: "Enjoy Random Chat Safely",
        level: 2,
        order: 14
      },
      {
        id: `paragraph-conclusion-safety-${baseId}`,
        type: "paragraph" as const,
        content: "Random chat apps can be incredibly rewarding when used safely. By following these guidelines, staying aware of potential risks, and trusting your instincts, you can enjoy meaningful conversations with strangers while protecting your privacy and security. Remember: your safety is always more important than any conversation.",
        order: 15
      }
    ]
  }

  if (category === "tutorials") {
    return [
      {
        id: `heading-${baseId}`,
        type: "heading" as const,
        content: title,
        level: 1,
        order: 0
      },
      {
        id: `paragraph-intro-${baseId}`,
        type: "paragraph" as const,
        content: "🚀 **Difficulty Level: Intermediate**\n\nWelcome to this comprehensive tutorial where we'll dive deep into building production-ready real-time chat applications. This guide covers everything from basic WebSocket implementation to advanced scaling strategies used by major platforms.",
        order: 1
      },
      {
        id: `heading-overview-${baseId}`,
        type: "heading" as const,
        content: "What You'll Learn",
        level: 2,
        order: 2
      },
      {
        id: `list-learning-${baseId}`,
        type: "list" as const,
        content: "By the end of this tutorial, you will master:",
        listType: "unordered" as const,
        listItems: [
          "WebSocket fundamentals and advanced patterns",
          "Real-time message handling and state management",
          "Connection management and error recovery",
          "Performance optimization and scaling strategies",
          "Security best practices for chat applications",
          "Testing and monitoring real-time systems"
        ],
        order: 3
      },
      {
        id: `heading-setup-${baseId}`,
        type: "heading" as const,
        content: "Setting Up Your Development Environment",
        level: 2,
        order: 4
      },
      {
        id: `paragraph-setup-${baseId}`,
        type: "paragraph" as const,
        content: "Before we dive into the implementation, let's set up a robust development environment that will support our real-time chat application development.",
        order: 5
      },
      {
        id: `code-setup-${baseId}`,
        type: "code" as const,
        content: "Initial project setup and dependencies:",
        codeBlock: {
          language: "bash",
          code: `# Create new project
npm create next-app@latest chat-app --typescript --tailwind --eslint

# Install WebSocket dependencies
npm install ws socket.io-client
npm install -D @types/ws

# Install additional utilities
npm install uuid date-fns
npm install -D @types/uuid

cd chat-app
npm run dev`,
          title: "Project Setup",
          showLineNumbers: true
        },
        order: 6
      },
      {
        id: `heading-implementation-${baseId}`,
        type: "heading" as const,
        content: "Core WebSocket Implementation",
        level: 2,
        order: 7
      },
      {
        id: `paragraph-implementation-${baseId}`,
        type: "paragraph" as const,
        content: "Now let's implement the core WebSocket functionality. We'll create a robust connection manager that handles reconnection, message queuing, and error recovery.",
        order: 8
      },
      {
        id: `code-websocket-${baseId}`,
        type: "code" as const,
        content: "WebSocket connection manager with advanced features:",
        codeBlock: {
          language: "typescript",
          code: `class ChatWebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private messageQueue: Array<any> = [];
  private isConnected = false;

  constructor(private url: string) {
    this.connect();
  }

  private connect() {
    try {
      this.ws = new WebSocket(this.url);
      this.setupEventHandlers();
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.handleReconnect();
    }
  }

  private setupEventHandlers() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.flushMessageQueue();
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.isConnected = false;
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000;

      setTimeout(() => {
        console.log(\`Reconnecting... Attempt \${this.reconnectAttempts}\`);
        this.connect();
      }, delay);
    }
  }

  public sendMessage(message: any) {
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(message);
    }
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.sendMessage(message);
    }
  }

  private handleMessage(message: any) {
    // Handle different message types
    switch (message.type) {
      case 'chat':
        this.onChatMessage(message);
        break;
      case 'user_joined':
        this.onUserJoined(message);
        break;
      case 'user_left':
        this.onUserLeft(message);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private onChatMessage(message: any) {
    // Emit to UI components
    document.dispatchEvent(new CustomEvent('chatMessage', {
      detail: message
    }));
  }

  private onUserJoined(message: any) {
    document.dispatchEvent(new CustomEvent('userJoined', {
      detail: message
    }));
  }

  private onUserLeft(message: any) {
    document.dispatchEvent(new CustomEvent('userLeft', {
      detail: message
    }));
  }
}

// Usage
const chatManager = new ChatWebSocketManager('ws://localhost:8080');`,
          title: "Advanced WebSocket Manager",
          showLineNumbers: true
        },
        order: 9
      },
      {
        id: `heading-best-practices-${baseId}`,
        type: "heading" as const,
        content: "Production Best Practices",
        level: 2,
        order: 10
      },
      {
        id: `list-best-practices-${baseId}`,
        type: "list" as const,
        content: "Essential practices for production deployment:",
        listType: "unordered" as const,
        listItems: [
          "Implement proper authentication and authorization",
          "Use connection pooling and load balancing",
          "Add comprehensive error handling and logging",
          "Implement rate limiting and abuse prevention",
          "Monitor connection health and performance metrics",
          "Use SSL/TLS for secure connections",
          "Implement graceful degradation for network issues"
        ],
        order: 11
      },
      {
        id: `heading-conclusion-${baseId}`,
        type: "heading" as const,
        content: "Conclusion and Next Steps",
        level: 2,
        order: 12
      },
      {
        id: `paragraph-conclusion-${baseId}`,
        type: "paragraph" as const,
        content: "Congratulations! You've built a robust real-time chat application with advanced WebSocket management. This foundation will serve you well as you scale to support thousands of concurrent users. Next, consider implementing features like message persistence, user presence indicators, and file sharing capabilities.",
        order: 13
      }
    ]
  }

  if (category === "case-studies") {
    return [
      {
        id: `heading-${baseId}`,
        type: "heading" as const,
        content: title,
        level: 1,
        order: 0
      },
      {
        id: `paragraph-intro-${baseId}`,
        type: "paragraph" as const,
        content: "In this comprehensive case study, we examine how Discord transformed from a gaming-focused chat app to one of the world's largest communication platforms, supporting over 140 million monthly active users with innovative technical solutions.",
        order: 1
      },
      {
        id: `heading-background-${baseId}`,
        type: "heading" as const,
        content: "The Challenge: Scaling Beyond Gaming",
        level: 2,
        order: 2
      },
      {
        id: `paragraph-background-${baseId}`,
        type: "paragraph" as const,
        content: "Discord started as a solution for gamers who needed low-latency voice chat during gameplay. However, as the platform grew beyond gaming communities, they faced unprecedented scaling challenges that required innovative architectural decisions.",
        order: 3
      },
      {
        id: `list-challenges-${baseId}`,
        type: "list" as const,
        content: "Key technical challenges Discord faced:",
        listType: "unordered" as const,
        listItems: [
          "Supporting millions of concurrent voice and text connections",
          "Maintaining sub-100ms latency for voice communication",
          "Handling massive message throughput (billions per day)",
          "Ensuring 99.99% uptime across global infrastructure",
          "Managing explosive user growth (10x year-over-year)",
          "Scaling real-time features like screen sharing and video calls"
        ],
        order: 4
      },
      {
        id: `heading-architecture-${baseId}`,
        type: "heading" as const,
        content: "Technical Architecture Solutions",
        level: 2,
        order: 5
      },
      {
        id: `paragraph-architecture-${baseId}`,
        type: "paragraph" as const,
        content: "Discord's engineering team implemented several innovative solutions to handle their scale. Their architecture combines custom-built systems with proven technologies, optimized for real-time communication.",
        order: 6
      },
      {
        id: `code-architecture-${baseId}`,
        type: "code" as const,
        content: "Discord's simplified architecture overview:",
        codeBlock: {
          language: "yaml",
          code: `# Discord's High-Level Architecture
Gateway Service:
  - WebSocket connections (millions concurrent)
  - Connection management and load balancing
  - Real-time event distribution

Voice Infrastructure:
  - Custom UDP-based voice protocol
  - Global edge servers for low latency
  - Adaptive bitrate and codec selection

Message Storage:
  - Cassandra for message persistence
  - Redis for real-time caching
  - Elasticsearch for search functionality

API Layer:
  - REST API for standard operations
  - GraphQL for complex queries
  - Rate limiting and authentication

Microservices:
  - User management service
  - Guild (server) management
  - Notification service
  - Media processing pipeline`,
          title: "Architecture Overview",
          showLineNumbers: true
        },
        order: 7
      },
      {
        id: `heading-results-${baseId}`,
        type: "heading" as const,
        content: "Results and Impact",
        level: 2,
        order: 8
      },
      {
        id: `list-results-${baseId}`,
        type: "list" as const,
        content: "Discord's architectural decisions delivered impressive results:",
        listType: "unordered" as const,
        listItems: [
          "99.99% uptime across all services",
          "Sub-100ms voice latency globally",
          "Support for 140+ million monthly active users",
          "Billions of messages processed daily",
          "Seamless scaling during viral growth periods",
          "Industry-leading real-time performance metrics"
        ],
        order: 9
      },
      {
        id: `heading-lessons-${baseId}`,
        type: "heading" as const,
        content: "Key Lessons for Developers",
        level: 2,
        order: 10
      },
      {
        id: `paragraph-lessons-${baseId}`,
        type: "paragraph" as const,
        content: "Discord's success demonstrates the importance of building for scale from day one, investing in custom solutions when necessary, and maintaining a relentless focus on user experience. Their journey shows that with the right technical decisions and execution, it's possible to build communication platforms that serve hundreds of millions of users reliably.",
        order: 11
      }
    ]
  }

  // Random chat app specific content for other categories
  if (category === "comparison") {
    return [
      {
        id: `heading-${baseId}`,
        type: "heading" as const,
        content: title,
        level: 1,
        order: 0
      },
      {
        id: `paragraph-intro-${baseId}`,
        type: "paragraph" as const,
        content: "📹 vs 💬 **The Ultimate Comparison** - Choosing between random video chat and text-based stranger chat can significantly impact your online social experience. This detailed comparison explores the advantages, disadvantages, and best use cases for each type of random chat platform.",
        order: 1
      },
      {
        id: `heading-video-pros-${baseId}`,
        type: "heading" as const,
        content: "Random Video Chat: Advantages",
        level: 2,
        order: 2
      },
      {
        id: `list-video-pros-${baseId}`,
        type: "list" as const,
        content: "Benefits of video-based stranger chat:",
        listType: "unordered" as const,
        listItems: [
          "More authentic and personal connections",
          "Non-verbal communication and body language",
          "Harder for users to misrepresent themselves",
          "More engaging and immersive experience",
          "Better for language learning and practice",
          "Instant visual verification of the person"
        ],
        order: 3
      },
      {
        id: `heading-text-pros-${baseId}`,
        type: "heading" as const,
        content: "Text Chat: Advantages",
        level: 2,
        order: 4
      },
      {
        id: `list-text-pros-${baseId}`,
        type: "list" as const,
        content: "Benefits of text-based random chat:",
        listType: "unordered" as const,
        listItems: [
          "Greater privacy and anonymity protection",
          "More comfortable for shy or introverted users",
          "Better for deep, thoughtful conversations",
          "No appearance-based judgments",
          "Easier to use in public or quiet environments",
          "Lower bandwidth requirements"
        ],
        order: 5
      },
      {
        id: `heading-recommendation-${baseId}`,
        type: "heading" as const,
        content: "Which Should You Choose?",
        level: 2,
        order: 6
      },
      {
        id: `paragraph-recommendation-${baseId}`,
        type: "paragraph" as const,
        content: "The choice between random video chat and text chat depends on your personal preferences, comfort level, and goals. Many users find success using both types of platforms for different purposes and situations.",
        order: 7
      }
    ]
  }

  if (category === "free-apps") {
    return [
      {
        id: `heading-${baseId}`,
        type: "heading" as const,
        content: title,
        level: 1,
        order: 0
      },
      {
        id: `paragraph-intro-${baseId}`,
        type: "paragraph" as const,
        content: "💰 **Completely Free** - Discover the best free random chat apps that let you talk with strangers without registration, payment, or lengthy sign-up processes. These platforms offer instant access to global communities of people looking to chat and make new connections.",
        order: 1
      },
      {
        id: `heading-no-registration-${baseId}`,
        type: "heading" as const,
        content: "Why Choose No-Registration Chat Apps?",
        level: 2,
        order: 2
      },
      {
        id: `paragraph-no-registration-${baseId}`,
        type: "paragraph" as const,
        content: "No-registration random chat apps offer the ultimate in convenience and privacy. You can start chatting with strangers immediately without providing personal information, creating accounts, or going through verification processes.",
        order: 3
      },
      {
        id: `list-benefits-free-${baseId}`,
        type: "list" as const,
        content: "Benefits of free, no-registration chat:",
        listType: "unordered" as const,
        listItems: [
          "Instant access - start chatting immediately",
          "Complete anonymity - no personal data required",
          "No email verification or phone numbers needed",
          "Try before you commit to any platform",
          "Perfect for one-time conversations",
          "No spam or marketing emails"
        ],
        order: 4
      }
    ]
  }

  if (category === "privacy") {
    return [
      {
        id: `heading-${baseId}`,
        type: "heading" as const,
        content: title,
        level: 1,
        order: 0
      },
      {
        id: `paragraph-intro-${baseId}`,
        type: "paragraph" as const,
        content: "🔒 **Privacy First** - Anonymous chatting is essential for safe online interactions with strangers. Learn advanced privacy techniques, anonymous chat strategies, and how to protect your identity while building meaningful connections on random chat platforms.",
        order: 1
      },
      {
        id: `heading-anonymous-benefits-${baseId}`,
        type: "heading" as const,
        content: "Benefits of Anonymous Chat",
        level: 2,
        order: 2
      },
      {
        id: `paragraph-anonymous-benefits-${baseId}`,
        type: "paragraph" as const,
        content: "Anonymous chatting provides a safe space for authentic self-expression without fear of judgment or consequences. This freedom often leads to more honest, meaningful conversations with strangers.",
        order: 3
      },
      {
        id: `list-anonymous-benefits-${baseId}`,
        type: "list" as const,
        content: "Why anonymous chat matters:",
        listType: "unordered" as const,
        listItems: [
          "Express yourself freely without social pressure",
          "Protect your real identity and personal information",
          "Avoid unwanted contact outside the platform",
          "Experiment with different conversation styles",
          "Discuss sensitive topics safely",
          "Build confidence in social interactions"
        ],
        order: 4
      }
    ]
  }

  // Default content for remaining categories
  return [
    {
      id: `heading-${baseId}`,
      type: "heading" as const,
      content: title,
      level: 1,
      order: 0
    },
    {
      id: `paragraph-intro-${baseId}`,
      type: "paragraph" as const,
      content: `🌟 Welcome to this comprehensive guide about ${title.toLowerCase()}. Whether you're new to random chat apps or looking to enhance your stranger chat experience, this article provides valuable insights and practical advice for connecting with people worldwide.`,
      order: 1
    },
    {
      id: `heading-overview-${baseId}`,
      type: "heading" as const,
      content: "Key Insights",
      level: 2,
      order: 2
    },
    {
      id: `paragraph-overview-${baseId}`,
      type: "paragraph" as const,
      content: "The world of random chat and stranger communication continues to evolve, offering new opportunities for global connections, cultural exchange, and meaningful relationships. Understanding these platforms helps you make the most of your online social experiences.",
      order: 3
    },
    {
      id: `list-insights-${baseId}`,
      type: "list" as const,
      content: "Important considerations for random chat users:",
      listType: "unordered" as const,
      listItems: [
        "Safety and privacy protection strategies",
        "Choosing the right platform for your needs",
        "Building meaningful connections with strangers",
        "Understanding cultural differences and etiquette",
        "Maximizing positive interactions and experiences",
        "Staying safe while meeting new people online"
      ],
      order: 4
    },
    {
      id: `heading-best-practices-${baseId}`,
      type: "heading" as const,
      content: "Best Practices for Random Chat",
      level: 2,
      order: 5
    },
    {
      id: `paragraph-best-practices-${baseId}`,
      type: "paragraph" as const,
      content: "Success in random chat platforms comes from understanding both the technology and the human element. The best experiences happen when users approach stranger chat with the right mindset, proper safety measures, and genuine interest in connecting with others.",
      order: 6
    },
    {
      id: `quote-${baseId}`,
      type: "quote" as const,
      content: "The magic of random chat lies in the unexpected connections and conversations that can change your perspective, teach you something new, or simply brighten your day.",
      order: 7
    },
    {
      id: `heading-conclusion-${baseId}`,
      type: "heading" as const,
      content: "Start Your Random Chat Journey",
      level: 2,
      order: 8
    },
    {
      id: `paragraph-conclusion-${baseId}`,
      type: "paragraph" as const,
      content: "Random chat apps offer incredible opportunities to connect with people from all walks of life, learn about different cultures, and make lasting friendships. By following best practices, prioritizing safety, and approaching conversations with an open mind, you can have amazing experiences that enrich your life and broaden your horizons.",
      order: 9
    }
  ]
}

// Simplified helper functions for metadata generation

function getAuthorForCategory(category: string): string {
  const authors = {
    tutorials: 'ChatNow Development Team',
    'case-studies': 'ChatNow Research Team',
    'product-updates': 'ChatNow Product Team',
    'industry-news': 'ChatNow Editorial Team',
    opinion: 'ChatNow Leadership Team',
    technical: 'ChatNow Engineering Team',
    security: 'ChatNow Security Team',
    design: 'ChatNow Design Team',
    business: 'ChatNow Strategy Team'
  }

  return authors[category as keyof typeof authors] || 'ChatNow Team'
}

function getAuthorBio(category: string): string {
  const bios = {
    tutorials: 'Expert developers specializing in real-time communication technologies and modern web development.',
    'case-studies': 'Dedicated to analyzing successful implementations and sharing insights from industry leaders.',
    'product-updates': 'Focused on delivering innovative features and improvements to enhance user experience.',
    'industry-news': 'Keeping you informed about the latest developments in real-time communication technology.',
    opinion: 'Industry veterans sharing insights and perspectives on the future of real-time communication.',
    technical: 'Deep technical expertise in scalable real-time systems and distributed architectures.',
    security: 'Cybersecurity specialists focused on protecting real-time communication platforms.',
    design: 'UX/UI experts passionate about creating intuitive and engaging user experiences.',
    business: 'Strategic thinkers focused on sustainable growth and business model innovation.'
  }

  return bios[category as keyof typeof bios] || 'Passionate about real-time communication technology and user experience.'
}

function getAuthorImage(category: string): string {
  const images = {
    tutorials: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    'case-studies': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    'product-updates': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
    'industry-news': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    opinion: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    technical: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    security: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    design: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    business: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face'
  }

  return images[category as keyof typeof images] || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
}

function generateTags(post: any): string[] {
  const baseTags = [post.category]

  if (post.type === 'tutorial') {
    baseTags.push('tutorial', 'guide', post.difficulty || 'intermediate')
    if (post.topic) {
      baseTags.push(post.topic.toLowerCase().replace(/\s+/g, '-'))
    }
  } else if (post.type === 'case-study') {
    baseTags.push('case-study', 'success-story', 'implementation')
    if (post.company) {
      baseTags.push(post.company.toLowerCase().replace(/\s+/g, '-'))
    }
  } else if (post.type === 'news') {
    baseTags.push('news', 'update', 'announcement')
  } else if (post.type === 'opinion') {
    baseTags.push('opinion', 'thought-leadership', 'analysis')
  }

  // Add category-specific tags
  const categoryTags = {
    tutorials: ['how-to', 'step-by-step'],
    technical: ['deep-dive', 'advanced'],
    security: ['security', 'best-practices'],
    design: ['ux', 'ui', 'design'],
    business: ['strategy', 'business-model']
  }

  const additionalTags = categoryTags[post.category as keyof typeof categoryTags] || []

  return [...new Set([...baseTags, ...additionalTags])]
}

function generateMetaDescription(post: any): string {
  const descriptions = {
    tutorials: `Learn ${post.topic || post.title.toLowerCase()} with this comprehensive tutorial. Step-by-step guide with examples and best practices.`,
    'case-studies': `${post.company || 'Company'} case study: Learn how they solved ${post.challenge || 'technical challenges'} with ${post.solution || 'innovative solutions'}.`,
    'product-updates': `Latest ChatNow updates: ${post.title}. Enhanced features and improved user experience.`,
    'industry-news': `Stay updated with ${post.title}. Latest industry insights and technology trends.`,
    opinion: `Expert opinion on ${post.topic || post.title.toLowerCase()}: ${post.perspective || 'industry insights and analysis'}.`,
    technical: `Deep technical dive into ${post.topic || post.title.toLowerCase()}. Advanced concepts and implementation strategies.`,
    security: `Essential security guide: ${post.title}. Best practices and implementation guidelines.`,
    design: `UX/UI design guide: ${post.title}. Design principles and user experience best practices.`,
    business: `Business strategy insights: ${post.title}. Strategic analysis and growth recommendations.`
  }

  return descriptions[post.category as keyof typeof descriptions] || `Comprehensive guide to ${post.title.toLowerCase()}. Expert insights and practical advice.`
}

function generateKeywords(post: any): string[] {
  const baseKeywords = ['real-time chat', 'messaging', 'communication', 'web development']

  const categoryKeywords = {
    tutorials: ['tutorial', 'guide', 'how-to', 'step-by-step', 'learning'],
    'case-studies': ['case study', 'success story', 'implementation', 'best practices'],
    'product-updates': ['product update', 'new features', 'improvements', 'release'],
    'industry-news': ['industry news', 'trends', 'technology', 'innovation'],
    opinion: ['opinion', 'analysis', 'insights', 'thought leadership'],
    technical: ['technical', 'advanced', 'architecture', 'engineering'],
    security: ['security', 'encryption', 'privacy', 'protection'],
    design: ['design', 'ux', 'ui', 'user experience'],
    business: ['business', 'strategy', 'growth', 'monetization']
  }

  const additionalKeywords = categoryKeywords[post.category as keyof typeof categoryKeywords] || []

  return [...baseKeywords, ...additionalKeywords]
}

function getCoverImage(category: string): string {
  const images = {
    tutorials: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=630&fit=crop',
    'case-studies': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop',
    'product-updates': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=630&fit=crop',
    'industry-news': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=630&fit=crop',
    opinion: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=630&fit=crop',
    technical: 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=1200&h=630&fit=crop',
    security: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&h=630&fit=crop',
    design: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&h=630&fit=crop',
    business: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=630&fit=crop'
  }

  return images[category as keyof typeof images] || 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1200&h=630&fit=crop'
}

function shouldBeFeatured(post: any): boolean {
  // Feature beginner tutorials, product updates, and major case studies
  return post.type === 'tutorial' && post.difficulty === 'beginner' ||
         post.type === 'news' && post.newsType === 'product-update' ||
         post.type === 'case-study' && ['Slack', 'Discord', 'WhatsApp'].includes(post.company)
}







import { BlogPost } from "./types/blog"

// Analytics event types
export interface BlogAnalyticsEvent {
  type: 'view' | 'share' | 'like' | 'comment' | 'time_spent' | 'scroll_depth'
  postId: string
  postSlug: string
  timestamp: number
  metadata?: {
    source?: string
    platform?: string
    timeSpent?: number
    scrollDepth?: number
    referrer?: string
    userAgent?: string
  }
}

// Blog performance metrics
export interface BlogMetrics {
  totalViews: number
  uniqueViews: number
  averageTimeSpent: number
  bounceRate: number
  shareCount: number
  engagementRate: number
  topReferrers: Array<{ source: string; count: number }>
  popularPosts: Array<{ post: BlogPost; metrics: PostMetrics }>
}

export interface PostMetrics {
  views: number
  uniqueViews: number
  shares: number
  averageTimeSpent: number
  scrollDepth: number
  engagementScore: number
}

// Analytics tracking class
export class BlogAnalytics {
  private events: BlogAnalyticsEvent[] = []
  private sessionId: string
  private startTime: number

  constructor() {
    this.sessionId = this.generateSessionId()
    this.startTime = Date.now()
    this.initializeTracking()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private initializeTracking() {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackTimeSpent()
      }
    })

    // Track scroll depth
    let maxScrollDepth = 0
    const trackScroll = () => {
      const scrollDepth = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      )
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth
      }
    }

    window.addEventListener('scroll', trackScroll, { passive: true })

    // Track time spent before page unload
    window.addEventListener('beforeunload', () => {
      this.trackTimeSpent()
      this.trackScrollDepth(maxScrollDepth)
    })
  }

  // Track blog post view
  trackView(postId: string, postSlug: string, source?: string) {
    const event: BlogAnalyticsEvent = {
      type: 'view',
      postId,
      postSlug,
      timestamp: Date.now(),
      metadata: {
        source,
        referrer: document.referrer,
        userAgent: navigator.userAgent
      }
    }

    this.events.push(event)
    this.sendEvent(event)
  }

  // Track social sharing
  trackShare(postId: string, postSlug: string, platform: string) {
    const event: BlogAnalyticsEvent = {
      type: 'share',
      postId,
      postSlug,
      timestamp: Date.now(),
      metadata: {
        platform
      }
    }

    this.events.push(event)
    this.sendEvent(event)
  }

  // Track time spent on page
  trackTimeSpent() {
    const timeSpent = Date.now() - this.startTime
    const currentPost = this.getCurrentPost()
    
    if (currentPost && timeSpent > 5000) { // Only track if spent more than 5 seconds
      const event: BlogAnalyticsEvent = {
        type: 'time_spent',
        postId: currentPost.id,
        postSlug: currentPost.slug,
        timestamp: Date.now(),
        metadata: {
          timeSpent
        }
      }

      this.events.push(event)
      this.sendEvent(event)
    }
  }

  // Track scroll depth
  trackScrollDepth(depth: number) {
    const currentPost = this.getCurrentPost()
    
    if (currentPost && depth > 25) { // Only track meaningful scroll depth
      const event: BlogAnalyticsEvent = {
        type: 'scroll_depth',
        postId: currentPost.id,
        postSlug: currentPost.slug,
        timestamp: Date.now(),
        metadata: {
          scrollDepth: depth
        }
      }

      this.events.push(event)
      this.sendEvent(event)
    }
  }

  // Get current post from URL
  private getCurrentPost(): { id: string; slug: string } | null {
    const path = window.location.pathname
    const blogMatch = path.match(/\/blog\/([^\/]+)/)
    
    if (blogMatch) {
      return {
        id: `post_${blogMatch[1]}`, // This would be the actual post ID in a real app
        slug: blogMatch[1]
      }
    }
    
    return null
  }

  // Send event to analytics service
  private async sendEvent(event: BlogAnalyticsEvent) {
    try {
      // In a real application, this would send to your analytics service
      await fetch('/api/analytics/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...event,
          sessionId: this.sessionId
        })
      })
    } catch (error) {
      console.error('Failed to send analytics event:', error)
    }
  }

  // Calculate engagement score for a post
  static calculateEngagementScore(metrics: PostMetrics): number {
    const {
      views,
      shares,
      averageTimeSpent,
      scrollDepth
    } = metrics

    if (views === 0) return 0

    // Weighted scoring system
    const shareScore = (shares / views) * 40 // 40% weight for shares
    const timeScore = Math.min(averageTimeSpent / 60000, 1) * 30 // 30% weight for time (capped at 1 minute)
    const scrollScore = (scrollDepth / 100) * 30 // 30% weight for scroll depth

    return Math.round(shareScore + timeScore + scrollScore)
  }

  // Get popular posts based on engagement
  static getPopularPosts(posts: BlogPost[], limit: number = 5): BlogPost[] {
    return posts
      .sort((a, b) => {
        // Simple popularity score based on views and recency
        const aScore = a.views + (Date.now() - (a.publishedAt || a.createdAt)) / (1000 * 60 * 60 * 24) // Views + days since published
        const bScore = b.views + (Date.now() - (b.publishedAt || b.createdAt)) / (1000 * 60 * 60 * 24)
        return bScore - aScore
      })
      .slice(0, limit)
  }

  // Get trending posts (high engagement in recent period)
  static getTrendingPosts(posts: BlogPost[], days: number = 7, limit: number = 5): BlogPost[] {
    const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000)
    
    return posts
      .filter(post => (post.publishedAt || post.createdAt) > cutoffDate)
      .sort((a, b) => {
        // Trending score based on views per day since publication
        const aDaysOld = Math.max(1, (Date.now() - (a.publishedAt || a.createdAt)) / (1000 * 60 * 60 * 24))
        const bDaysOld = Math.max(1, (Date.now() - (b.publishedAt || b.createdAt)) / (1000 * 60 * 60 * 24))
        
        const aScore = a.views / aDaysOld
        const bScore = b.views / bDaysOld
        
        return bScore - aScore
      })
      .slice(0, limit)
  }

  // Generate SEO insights
  static generateSEOInsights(post: BlogPost): {
    score: number
    recommendations: string[]
  } {
    const recommendations: string[] = []
    let score = 100

    // Title optimization
    if (post.title.length < 30) {
      recommendations.push("Consider making your title longer (30-60 characters)")
      score -= 10
    } else if (post.title.length > 60) {
      recommendations.push("Consider shortening your title (under 60 characters)")
      score -= 5
    }

    // Meta description
    if (!post.metaDescription) {
      recommendations.push("Add a meta description for better SEO")
      score -= 15
    } else if (post.metaDescription.length < 120) {
      recommendations.push("Make your meta description longer (120-160 characters)")
      score -= 10
    }

    // Content length
    const wordCount = post.richContent.reduce((count, section) => {
      if (section.type === 'paragraph') {
        return count + section.content.split(' ').length
      }
      return count
    }, 0)

    if (wordCount < 300) {
      recommendations.push("Add more content (aim for 600+ words)")
      score -= 20
    }

    // Images
    const hasImages = post.richContent.some(section => section.type === 'image')
    if (!hasImages && !post.coverImage) {
      recommendations.push("Add images to make your content more engaging")
      score -= 10
    }

    // Internal links (simplified check)
    const hasInternalLinks = post.richContent.some(section => 
      section.content.includes('](/') || section.content.includes('href="/')
    )
    if (!hasInternalLinks) {
      recommendations.push("Add internal links to other relevant posts")
      score -= 5
    }

    return {
      score: Math.max(0, score),
      recommendations
    }
  }
}

// Initialize global analytics instance
export const blogAnalytics = typeof window !== 'undefined' ? new BlogAnalytics() : null

// Utility functions for tracking
export const trackBlogView = (postId: string, postSlug: string, source?: string) => {
  blogAnalytics?.trackView(postId, postSlug, source)
}

export const trackBlogShare = (postId: string, postSlug: string, platform: string) => {
  blogAnalytics?.trackShare(postId, postSlug, platform)
}

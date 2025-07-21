import { BlogPost, BlogSEOData, BlogStructuredData } from "./types/blog"

// App configuration
const APP_CONFIG = {
  name: 'ChatNow',
  description: 'Real-time chat application with advanced features',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://chatnow.com',
  logo: '/logo.png',
  twitterHandle: '@chatnow',
  defaultImage: '/og-default.png',
}

// Generate comprehensive SEO metadata for blog posts
export function generateBlogSEO(post: BlogPost): BlogSEOData {
  const postUrl = `${APP_CONFIG.baseUrl}/blog/${post.slug}`
  const imageUrl = post.coverImage || post.ogImage || APP_CONFIG.defaultImage

  // Use custom OG data if available, otherwise fall back to post data
  const ogTitle = post.ogTitle || post.title
  const ogDescription = post.ogDescription || post.metaDescription
  const twitterCard = post.twitterCard || 'summary_large_image'

  return {
    title: `${post.title} | ${APP_CONFIG.name} Blog`,
    description: post.metaDescription,
    keywords: [...post.tags, ...(post.metaKeywords || [])],
    canonicalUrl: post.canonicalUrl || postUrl,

    // Open Graph
    ogTitle: `${ogTitle} | ${APP_CONFIG.name}`,
    ogDescription,
    ogImage: imageUrl,
    ogType: 'article',

    // Twitter Card
    twitterCard,
    twitterTitle: ogTitle,
    twitterDescription: ogDescription,
    twitterImage: imageUrl,

    // Article metadata
    author: post.author,
    publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
    modifiedTime: new Date(post.updatedAt).toISOString(),
    section: post.category,
    tags: post.tags,
  }
}

// Generate Next.js metadata object
export function generateNextMetadata(post: BlogPost) {
  const seoData = generateBlogSEO(post)
  const postUrl = `${APP_CONFIG.baseUrl}/blog/${post.slug}`

  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords?.join(', '),
    authors: [{ name: post.author }],
    creator: post.author,
    publisher: APP_CONFIG.name,

    alternates: {
      canonical: seoData.canonicalUrl,
    },

    openGraph: {
      title: seoData.ogTitle,
      description: seoData.ogDescription,
      url: postUrl,
      siteName: APP_CONFIG.name,
      type: 'article',
      images: [
        {
          url: seoData.ogImage!,
          width: 1200,
          height: 630,
          alt: post.coverImageAlt || post.title,
        }
      ],
      publishedTime: seoData.publishedTime,
      modifiedTime: seoData.modifiedTime,
      authors: [post.author],
      section: post.category,
      tags: post.tags,
    },

    twitter: {
      card: seoData.twitterCard as any,
      title: seoData.twitterTitle,
      description: seoData.twitterDescription,
      images: [seoData.twitterImage!],
      creator: APP_CONFIG.twitterHandle,
      site: APP_CONFIG.twitterHandle,
    },

    robots: {
      index: post.isPublished,
      follow: post.isPublished,
      googleBot: {
        index: post.isPublished,
        follow: post.isPublished,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    other: {
      'article:author': post.author,
      'article:published_time': seoData.publishedTime,
      'article:modified_time': seoData.modifiedTime,
      'article:section': post.category,
      'article:tag': post.tags.join(','),
      'reading-time': `${post.readTime} min read`,
    }
  }
}

// Generate comprehensive structured data (JSON-LD) for blog posts
export function generateBlogStructuredData(post: BlogPost): BlogStructuredData {
  const postUrl = `${APP_CONFIG.baseUrl}/blog/${post.slug}`
  const imageUrl = post.coverImage || post.ogImage || APP_CONFIG.defaultImage

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription,
    image: imageUrl ? [imageUrl] : [],

    author: {
      "@type": "Person",
      name: post.author,
      image: post.authorImage,
      description: post.authorBio,
    },

    publisher: {
      "@type": "Organization",
      name: APP_CONFIG.name,
      logo: {
        "@type": "ImageObject",
        url: `${APP_CONFIG.baseUrl}${APP_CONFIG.logo}`,
      },
    },

    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },

    datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
    dateModified: new Date(post.updatedAt).toISOString(),
    articleSection: post.category,
    keywords: [...post.tags, ...(post.metaKeywords || [])],
    wordCount: estimateWordCount(post),
    timeRequired: `PT${post.readTime}M`,
  }
}

// Generate breadcrumb structured data
export function generateBreadcrumbStructuredData(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: APP_CONFIG.baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${APP_CONFIG.baseUrl}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.category,
        item: `${APP_CONFIG.baseUrl}/blog?category=${encodeURIComponent(post.category)}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: post.title,
        item: `${APP_CONFIG.baseUrl}/blog/${post.slug}`,
      },
    ],
  }
}

// Generate FAQ structured data from blog content
export function generateFAQStructuredData(post: BlogPost) {
  // Extract FAQ-like content from rich content sections
  const faqItems: Array<{ question: string; answer: string }> = []

  post.richContent.forEach((section, index) => {
    if (section.type === 'heading' && section.level === 2) {
      // Look for the next paragraph as the answer
      const nextSection = post.richContent[index + 1]
      if (nextSection && nextSection.type === 'paragraph') {
        faqItems.push({
          question: section.content,
          answer: nextSection.content,
        })
      }
    }
  })

  if (faqItems.length === 0) return null

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }
}

// Estimate word count from rich content (no legacy content)
function estimateWordCount(post: BlogPost): number {
  let wordCount = 0

  post.richContent.forEach(section => {
    switch (section.type) {
      case 'heading':
      case 'subheading':
      case 'paragraph':
      case 'quote':
        wordCount += section.content.split(/\s+/).filter(word => word.length > 0).length
        break
      case 'code':
        if (section.codeBlock) {
          // Code blocks count as fewer words for reading time
          wordCount += Math.ceil(section.codeBlock.code.split(/\s+/).length * 0.5)
        }
        break
      case 'list':
        if (section.listItems) {
          wordCount += section.listItems.join(' ').split(/\s+/).filter(word => word.length > 0).length
        }
        break
    }
  })

  return wordCount
}

// Generate sitemap entry for blog post
export function generateSitemapEntry(post: BlogPost) {
  return {
    url: `${APP_CONFIG.baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: post.featured ? 0.9 : 0.7,
  }
}

// Generate RSS feed item
export function generateRSSItem(post: BlogPost) {
  const postUrl = `${APP_CONFIG.baseUrl}/blog/${post.slug}`

  return {
    title: post.title,
    description: post.metaDescription,
    link: postUrl,
    guid: postUrl,
    pubDate: post.publishedAt ? new Date(post.publishedAt) : new Date(post.createdAt),
    author: post.author,
    category: post.category,
    enclosure: post.coverImage ? {
      url: post.coverImage,
      type: 'image/jpeg',
    } : undefined,
  }
}

// Validate SEO requirements
export function validateBlogSEO(post: BlogPost): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Title validation
  if (!post.title || post.title.length < 10) {
    errors.push('Title should be at least 10 characters long')
  }
  if (post.title && post.title.length > 60) {
    errors.push('Title should be less than 60 characters for optimal SEO')
  }

  // Meta description validation
  if (!post.metaDescription) {
    errors.push('Meta description is required')
  } else if (post.metaDescription.length < 120) {
    errors.push('Meta description should be at least 120 characters long')
  } else if (post.metaDescription.length > 160) {
    errors.push('Meta description should be less than 160 characters')
  }

  // Content validation
  if (!post.richContent || post.richContent.length === 0) {
    errors.push('Rich content is required')
  }

  // Image validation
  if (!post.coverImage) {
    errors.push('Cover image is recommended for social sharing')
  }

  // Tags validation
  if (post.tags.length === 0) {
    errors.push('At least one tag is recommended')
  }
  if (post.tags.length > 10) {
    errors.push('Too many tags (max 10 recommended)')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}



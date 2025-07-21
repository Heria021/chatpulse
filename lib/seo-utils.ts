import { BlogPost } from "./types/blog"

// Generate SEO-optimized meta tags for blog posts
export function generateBlogSEO(post: BlogPost) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://chatnow.com'
  const postUrl = `${baseUrl}/blog/${post.slug}`
  
  return {
    title: `${post.title} | ChatPulse Blog`,
    description: post.metaDescription || post.excerpt,
    canonical: postUrl,
    openGraph: {
      title: post.title,
      description: post.metaDescription || post.excerpt,
      url: postUrl,
      type: 'article',
      images: post.coverImage ? [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ] : [],
      article: {
        publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
        modifiedTime: new Date(post.updatedAt).toISOString(),
        authors: [post.author],
        tags: post.tags,
        section: post.category,
      },
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.metaDescription || post.excerpt,
      images: post.coverImage ? [post.coverImage] : [],
    },
    other: {
      'article:author': post.author,
      'article:published_time': post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
      'article:modified_time': new Date(post.updatedAt).toISOString(),
      'article:section': post.category,
      'article:tag': post.tags.join(','),
    }
  }
}

// Generate structured data (JSON-LD) for blog posts
export function generateBlogStructuredData(post: BlogPost) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://chatnow.com'
  const postUrl = `${baseUrl}/blog/${post.slug}`
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    image: post.coverImage ? [post.coverImage] : [],
    author: {
      '@type': 'Person',
      name: post.author,
      image: post.authorImage,
    },
    publisher: {
      '@type': 'Organization',
      name: 'ChatPulse',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    url: postUrl,
    datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
    dateModified: new Date(post.updatedAt).toISOString(),
    articleSection: post.category,
    keywords: post.tags.join(', '),
    wordCount: estimateWordCount(post),
    timeRequired: `PT${post.readTime}M`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
  }
}

// Estimate word count from content
function estimateWordCount(post: BlogPost): number {
  let wordCount = post.content.split(/\s+/).length
  
  if (post.richContent) {
    post.richContent.forEach(section => {
      switch (section.type) {
        case 'heading':
        case 'subheading':
        case 'paragraph':
        case 'quote':
          wordCount += section.content.split(/\s+/).length
          break
        case 'code':
          if (section.codeBlock) {
            wordCount += section.codeBlock.code.split(/\s+/).length
          }
          break
        case 'list':
          if (section.listItems) {
            wordCount += section.listItems.join(' ').split(/\s+/).length
          }
          break
      }
    })
  }
  
  return wordCount
}



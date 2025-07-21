import { BlogContentSection, BlogPost } from "./types/blog"

// Generate SEO-optimized slug from title
export function generateSEOSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    // Remove special characters except hyphens and spaces
    .replace(/[^\w\s-]/g, '')
    // Replace spaces and multiple hyphens with single hyphen
    .replace(/[\s_-]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Limit length for SEO
    .substring(0, 60)
}

// Calculate reading time based on content
export function calculateReadingTime(richContent: BlogContentSection[]): number {
  const wordsPerMinute = 200
  let totalWords = 0

  richContent.forEach(section => {
    switch (section.type) {
      case 'heading':
      case 'subheading':
      case 'paragraph':
      case 'quote':
        totalWords += section.content.split(/\s+/).filter(word => word.length > 0).length
        break
      case 'code':
        if (section.codeBlock) {
          // Code takes longer to read
          totalWords += Math.ceil(section.codeBlock.code.split(/\s+/).length * 1.5)
        }
        break
      case 'list':
        if (section.listItems) {
          totalWords += section.listItems.join(' ').split(/\s+/).filter(word => word.length > 0).length
        }
        break
    }
  })

  return Math.max(1, Math.ceil(totalWords / wordsPerMinute))
}

// Extract headings for table of contents
export function extractTableOfContents(richContent: BlogContentSection[]): Array<{
  id: string
  text: string
  level: number
}> {
  return richContent
    .filter(section => section.type === 'heading' || section.type === 'subheading')
    .map(section => ({
      id: section.id,
      text: section.content,
      level: section.level || (section.type === 'heading' ? 1 : 2)
    }))
}

// Validate heading hierarchy for SEO
export function validateHeadingHierarchy(richContent: BlogContentSection[]): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  const headings = richContent.filter(section => 
    section.type === 'heading' || section.type === 'subheading'
  )

  if (headings.length === 0) {
    errors.push('At least one heading is required for proper content structure')
    return { isValid: false, errors }
  }

  // Check if first heading is H1
  const firstHeading = headings[0]
  if (firstHeading.level !== 1) {
    errors.push('First heading should be H1 for proper SEO structure')
  }

  // Check for proper hierarchy (no skipping levels)
  for (let i = 1; i < headings.length; i++) {
    const currentLevel = headings[i].level || 2
    const previousLevel = headings[i - 1].level || 1
    
    if (currentLevel > previousLevel + 1) {
      errors.push(`Heading level skipped: H${previousLevel} followed by H${currentLevel}`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Generate excerpt from rich content
export function generateExcerpt(richContent: BlogContentSection[], maxLength: number = 160): string {
  let excerpt = ''
  
  for (const section of richContent) {
    if (section.type === 'paragraph') {
      excerpt += section.content + ' '
      if (excerpt.length >= maxLength) break
    }
  }
  
  // Trim to word boundary
  if (excerpt.length > maxLength) {
    excerpt = excerpt.substring(0, maxLength)
    const lastSpace = excerpt.lastIndexOf(' ')
    if (lastSpace > 0) {
      excerpt = excerpt.substring(0, lastSpace)
    }
  }
  
  return excerpt.trim() + (excerpt.length >= maxLength ? '...' : '')
}

// Optimize images in content for SEO
export function optimizeContentImages(richContent: BlogContentSection[]): BlogContentSection[] {
  return richContent.map(section => {
    if (section.type === 'image') {
      return {
        ...section,
        imageAlt: section.imageAlt || `Image for ${section.content}`,
        // Add loading="lazy" and other optimizations would be handled in the renderer
      }
    }
    return section
  })
}

// Generate content outline for SEO
export function generateContentOutline(richContent: BlogContentSection[]): {
  headingCount: number
  paragraphCount: number
  codeBlockCount: number
  imageCount: number
  listCount: number
  totalSections: number
  estimatedReadTime: number
} {
  const counts = {
    headingCount: 0,
    paragraphCount: 0,
    codeBlockCount: 0,
    imageCount: 0,
    listCount: 0,
    totalSections: richContent.length,
    estimatedReadTime: calculateReadingTime(richContent)
  }

  richContent.forEach(section => {
    switch (section.type) {
      case 'heading':
      case 'subheading':
        counts.headingCount++
        break
      case 'paragraph':
        counts.paragraphCount++
        break
      case 'code':
        counts.codeBlockCount++
        break
      case 'image':
        counts.imageCount++
        break
      case 'list':
        counts.listCount++
        break
    }
  })

  return counts
}

// Validate content for SEO best practices
export function validateContentSEO(post: BlogPost): {
  isValid: boolean
  errors: string[]
  warnings: string[]
  score: number
} {
  const errors: string[] = []
  const warnings: string[] = []
  let score = 100

  // Content length validation
  const wordCount = post.richContent.reduce((count, section) => {
    if (section.type === 'paragraph') {
      return count + section.content.split(/\s+/).length
    }
    return count
  }, 0)

  if (wordCount < 300) {
    errors.push('Content should be at least 300 words for good SEO')
    score -= 20
  } else if (wordCount < 600) {
    warnings.push('Content under 600 words may not rank as well')
    score -= 5
  }

  // Heading validation
  const headingValidation = validateHeadingHierarchy(post.richContent)
  if (!headingValidation.isValid) {
    errors.push(...headingValidation.errors)
    score -= 15
  }

  // Image optimization
  const images = post.richContent.filter(section => section.type === 'image')
  const imagesWithoutAlt = images.filter(img => !img.imageAlt)
  if (imagesWithoutAlt.length > 0) {
    warnings.push(`${imagesWithoutAlt.length} images missing alt text`)
    score -= imagesWithoutAlt.length * 5
  }

  // Internal linking (would need to be implemented based on content analysis)
  const paragraphs = post.richContent.filter(section => section.type === 'paragraph')
  const hasInternalLinks = paragraphs.some(p => p.content.includes('](/'))
  if (!hasInternalLinks && paragraphs.length > 3) {
    warnings.push('Consider adding internal links to improve SEO')
    score -= 5
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, score)
  }
}

// Blog post template utilities removed - posts are now created directly in Convex dashboard

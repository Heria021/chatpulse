// Rich content types for blog posts
export interface BlogCodeBlock {
  language: string;
  code: string;
  title?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
}

export interface BlogContentSection {
  id: string;
  type: 'heading' | 'subheading' | 'paragraph' | 'code' | 'image' | 'quote' | 'list';
  content: string;
  level?: number; // For headings (1-6)
  codeBlock?: BlogCodeBlock; // For code sections
  imageUrl?: string; // For image sections
  imageAlt?: string; // For image sections
  listItems?: string[]; // For list sections
  listType?: 'ordered' | 'unordered'; // For list sections
  order: number; // For ordering sections
}

// SEO-optimized blog post type (matches Convex schema)
export interface BlogPost {
  _id: string;

  // Core content
  title: string;
  slug: string;
  excerpt: string;
  richContent: BlogContentSection[]; // Required rich content structure

  // Media
  coverImage?: string;
  coverImageAlt?: string; // SEO-friendly alt text

  // Author info
  author: string;
  authorImage?: string;
  authorBio?: string; // For author schema markup

  // Categories and tags for SEO
  category: string;
  tags: string[];

  // Publishing
  isPublished: boolean;
  publishedAt?: number;

  // SEO optimization
  metaDescription: string; // Required for SEO
  metaKeywords?: string[]; // Additional SEO keywords
  canonicalUrl?: string; // For duplicate content handling

  // Social media optimization
  ogTitle?: string; // Open Graph title
  ogDescription?: string; // Open Graph description
  ogImage?: string; // Open Graph image
  twitterCard?: string; // Twitter card type

  // Engagement and analytics
  readTime: number;
  views: number;
  featured?: boolean; // For featured posts

  // Timestamps
  createdAt: number;
  updatedAt: number;
}

// Blog category with count
export interface BlogCategory {
  category: string;
  count: number;
}

// Blog post preview (for lists) - SEO optimized
export interface BlogPostPreview {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  coverImageAlt?: string;
  author: string;
  authorImage?: string;
  category: string;
  tags: string[];
  publishedAt?: number;
  readTime: number;
  views: number;
  featured?: boolean;
  metaDescription: string; // For SEO previews
}

// Blog page props
export interface BlogPageProps {
  posts: BlogPost[];
  categories: BlogCategory[];
  featuredPosts: BlogPost[];
}

// Blog post page props
export interface BlogPostPageProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
}

// SEO metadata for blog posts
export interface BlogSEOData {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

// Structured data for blog posts (JSON-LD)
export interface BlogStructuredData {
  "@context": string;
  "@type": string;
  headline: string;
  description: string;
  image?: string[];
  datePublished?: string;
  dateModified?: string;
  author: {
    "@type": string;
    name: string;
    image?: string;
    description?: string;
  };
  publisher?: {
    "@type": string;
    name: string;
    logo?: {
      "@type": string;
      url: string;
    };
  };
  mainEntityOfPage?: {
    "@type": string;
    "@id": string;
  };
  keywords?: string[];
  articleSection?: string;
  wordCount?: number;
  timeRequired?: string;
}

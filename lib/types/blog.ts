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

// Blog post type (matches Convex schema)
export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // Legacy content field for backward compatibility
  richContent?: BlogContentSection[]; // New rich content structure
  coverImage?: string;
  author: string;
  authorImage?: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  publishedAt?: number;
  metaDescription?: string;
  readTime: number;
  views: number;
  createdAt: number;
  updatedAt: number;
}

// Blog category with count
export interface BlogCategory {
  category: string;
  count: number;
}

// Blog post preview (for lists)
export interface BlogPostPreview {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  author: string;
  authorImage?: string;
  category: string;
  tags: string[];
  publishedAt?: number;
  readTime: number;
  views: number;
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

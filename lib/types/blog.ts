// Blog post type (matches Convex schema)
export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
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

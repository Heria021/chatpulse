"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Eye, ArrowRight, TrendingUp, Star } from "lucide-react"
import { BlogPost } from "@/lib/types/blog"
import { formatBlogDate } from "@/lib/blog-utils"

interface RelatedPostsProps {
  currentPost: BlogPost
  relatedPosts: BlogPost[]
  className?: string
}

export function RelatedPosts({ currentPost, relatedPosts, className = "" }: RelatedPostsProps) {
  if (relatedPosts.length === 0) return null

  return (
    <section className={`space-y-6 ${className}`}>
      <div className="flex items-center space-x-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold">Related Articles</h2>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedPosts.map((post) => (
          <RelatedPostCard key={post._id} post={post} />
        ))}
      </div>
      
      <div className="text-center pt-4">
        <Button variant="outline" asChild>
          <Link href="/blog">
            <ArrowRight className="h-4 w-4 mr-2" />
            View All Articles
          </Link>
        </Button>
      </div>
    </section>
  )
}

function RelatedPostCard({ post }: { post: BlogPost }) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
      {post.featured && (
        <div className="absolute top-2 right-2 z-10">
          <Badge className="bg-yellow-500 text-yellow-50">
            <Star className="h-3 w-3 mr-1" />
            Featured
          </Badge>
        </div>
      )}
      
      <CardHeader className="pb-4">
        {post.coverImage && (
          <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden relative">
            <img 
              src={post.coverImage} 
              alt={post.coverImageAlt || post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </div>
        )}
        
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary">{post.category}</Badge>
          <div className="flex items-center space-x-3 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{post.readTime} min</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>{post.views}</span>
            </div>
          </div>
        </div>
        
        <CardTitle className="line-clamp-2 text-lg">
          <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
            {post.title}
          </Link>
        </CardTitle>
        
        <CardDescription className="line-clamp-2">
          {post.metaDescription || post.excerpt}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {post.authorImage && (
              <img 
                src={post.authorImage} 
                alt={post.author}
                className="w-6 h-6 rounded-full"
              />
            )}
            <span className="text-sm text-muted-foreground">{post.author}</span>
          </div>
          
          <time className="text-xs text-muted-foreground">
            {formatBlogDate(post.publishedAt || post.createdAt)}
          </time>
        </div>
        
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {post.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {post.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{post.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Popular posts component
interface PopularPostsProps {
  posts: BlogPost[]
  title?: string
  className?: string
}

export function PopularPosts({ posts, title = "Popular Articles", className = "" }: PopularPostsProps) {
  if (posts.length === 0) return null

  return (
    <section className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold flex items-center">
        <TrendingUp className="h-4 w-4 mr-2 text-primary" />
        {title}
      </h3>
      
      <div className="space-y-3">
        {posts.slice(0, 5).map((post, index) => (
          <div key={post._id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary">{index + 1}</span>
            </div>
            
            <div className="flex-1 min-w-0">
              <Link 
                href={`/blog/${post.slug}`}
                className="font-medium text-sm hover:text-primary transition-colors line-clamp-2"
              >
                {post.title}
              </Link>
              
              <div className="flex items-center space-x-3 mt-1 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Eye className="h-3 w-3" />
                  <span>{post.views}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{post.readTime} min</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {post.category}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// Recent posts component
export function RecentPosts({ posts, title = "Recent Articles", className = "" }: PopularPostsProps) {
  if (posts.length === 0) return null

  return (
    <section className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold">
        {title}
      </h3>
      
      <div className="space-y-4">
        {posts.slice(0, 4).map((post) => (
          <div key={post._id} className="flex space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            {post.coverImage && (
              <div className="flex-shrink-0 w-16 h-16 bg-muted rounded-lg overflow-hidden">
                <img 
                  src={post.coverImage} 
                  alt={post.coverImageAlt || post.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <Link 
                href={`/blog/${post.slug}`}
                className="font-medium text-sm hover:text-primary transition-colors line-clamp-2 block mb-1"
              >
                {post.title}
              </Link>
              
              <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                <time>{formatBlogDate(post.publishedAt || post.createdAt)}</time>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{post.readTime} min</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {post.category}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

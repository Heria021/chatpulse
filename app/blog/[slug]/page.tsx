"use client"

import Link from "next/link"
import { useEffect, use } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { TooltipProvider } from "@/components/ui/tooltip"
import { RichContentRenderer, TableOfContents } from "@/components/blog/rich-content-renderer"
import { generateNextMetadata, generateBlogStructuredData, generateBreadcrumbStructuredData, generateFAQStructuredData } from "@/lib/seo-utils"
import { extractTableOfContents } from "@/lib/blog-content-utils"
import { trackBlogView, trackBlogShare } from "@/lib/blog-analytics"
import { toast } from "sonner"

import { RelatedPosts } from "@/components/blog/related-posts"
import { AuthorCard, AuthorBio } from "@/components/blog/author-profile"
import { SocialSharing, NewsletterSignup, Comments } from "@/components/blog/social-sharing"
import { formatBlogDate } from "@/lib/blog-utils"
import { BlogPostSkeleton } from "@/components/blog/blog-skeletons"
import { Footer } from "@/components/ui/footer"

import {
  MessageCircle,
  Calendar,
  Clock,
  Eye,
  User,
  ArrowLeft,
  Share2,
  BookOpen,
  Tag
} from "lucide-react"

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = use(params)
  const post = useQuery(api.blog.getBlogPost, { slug: resolvedParams.slug })
  const relatedPosts = useQuery(api.blog.getBlogPosts, {
    category: post?.category,
    limit: 3
  })
  const incrementViews = useMutation(api.blog.incrementBlogPostViews)

  // Increment view count and track analytics when post loads
  useEffect(() => {
    if (post?._id) {
      incrementViews({ postId: post._id })
      // Track view for analytics
      trackBlogView(post._id, post.slug, document.referrer)
    }
  }, [post?._id, incrementViews, post?.slug])

  // SEO and structured data
  const structuredData = post ? generateBlogStructuredData(post) : null
  const breadcrumbData = post ? generateBreadcrumbStructuredData(post) : null
  const faqData = post ? generateFAQStructuredData(post) : null

  // Get rich content sections and table of contents
  const contentSections = post?.richContent || []
  const tableOfContents = post ? extractTableOfContents(post.richContent) : []

  // Loading state
  if (post === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14 sm:h-16">
              <Link href="/" className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity">
                <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                  <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <span className="font-bold text-lg sm:text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  ChatNow
                </span>
              </Link>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <TooltipProvider>
                  <ThemeToggle />
                </TooltipProvider>
                <Button asChild size="sm" className="text-xs sm:text-sm">
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Content Spacer for Fixed Header */}
        <div className="h-14 sm:h-16"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
          <div className="max-w-4xl mx-auto">
            <BlogPostSkeleton />
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    )
  }

  // Post not found
  if (post === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14 sm:h-16">
              <Link href="/" className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity">
                <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                  <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <span className="font-bold text-lg sm:text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  ChatNow
                </span>
              </Link>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <TooltipProvider>
                  <ThemeToggle />
                </TooltipProvider>
                <Button asChild size="sm" className="text-xs sm:text-sm">
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Content Spacer for Fixed Header */}
        <div className="h-14 sm:h-16"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center">
            <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4 sm:mb-6" />
            <h1 className="text-2xl sm:text-3xl font-bold mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
              The article you're looking for doesn't exist or may have been moved.
              Explore our other articles or return to the blog homepage.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-center">
              <Button asChild variant="outline" size="sm">
                <Link href="/blog">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Blog
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/">
                  Go Home
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Structured Data for SEO */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      {breadcrumbData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
        />
      )}
      {faqData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
        />
      )}

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity">
              <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <span className="font-bold text-lg sm:text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                ChatNow
              </span>
            </Link>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <TooltipProvider>
                <ThemeToggle />
              </TooltipProvider>
              <Button asChild size="sm" className="text-xs sm:text-sm">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content Spacer for Fixed Header */}
      <div className="h-14 sm:h-16"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Back Button */}
        <div className="mb-6 sm:mb-8">
          <Button variant="ghost" asChild size="sm">
            <Link href="/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Back to Blog</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Article Header */}
          <article className="mb-8 sm:mb-12">
            <header className="mb-6 sm:mb-8">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge variant="secondary" className="text-xs sm:text-sm">{post.category}</Badge>
                <div className="flex items-center space-x-1 text-xs sm:text-sm text-muted-foreground">
                  <Eye className="h-3 w-3" />
                  <span>{post.views} views</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                {post.title}
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground mb-6">
                {post.excerpt}
              </p>

              {/* Author and Share Button */}
              <div className="flex items-center justify-between gap-4">
                <AuthorCard
                  author={{
                    name: post.author,
                    bio: post.authorBio,
                    image: post.authorImage
                  }}
                  publishedAt={post.publishedAt || post.createdAt}
                  readTime={post.readTime}
                  className="flex-1"
                />

                <Button
                  variant="outline"
                  onClick={async () => {
                    if (navigator.share) {
                      try {
                        await navigator.share({
                          title: post.title,
                          text: post.metaDescription || post.title,
                          url: `${window.location.origin}/blog/${post.slug}`
                        })
                      } catch (err) {
                        // Fallback to copy URL
                        navigator.clipboard.writeText(`${window.location.origin}/blog/${post.slug}`)
                        toast.success("Link copied to clipboard!")
                      }
                    } else {
                      // Fallback to copy URL
                      navigator.clipboard.writeText(`${window.location.origin}/blog/${post.slug}`)
                      toast.success("Link copied to clipboard!")
                    }
                  }}
                  className="flex items-center space-x-2 flex-shrink-0"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </Button>
              </div>
            </header>

            {/* Cover Image */}
            {post.coverImage && (
              <div className="aspect-video bg-muted rounded-lg mb-6 sm:mb-8 overflow-hidden">
                <img
                  src={post.coverImage}
                  alt={post.coverImageAlt || post.title}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
            )}

            {/* Table of Contents */}
            {tableOfContents.length > 0 && (
              <div className="bg-muted/30 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
                <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Table of Contents
                </h2>
                <nav className="space-y-1 sm:space-y-2">
                  {tableOfContents.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`block text-sm hover:text-primary transition-colors ${
                        item.level === 1 ? 'font-medium' : 'ml-3 sm:ml-4 text-muted-foreground'
                      }`}
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* Article Content */}
            <div className="max-w-none">
              {contentSections.length > 0 ? (
                <RichContentRenderer sections={contentSections} />
              ) : (
                <div className="prose prose-sm sm:prose-lg max-w-none [&_ul]:text-sm sm:[&_ul]:text-base [&_ol]:text-sm sm:[&_ol]:text-base [&_li]:text-sm sm:[&_li]:text-base">
                  {post.content.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 leading-relaxed text-sm sm:text-base">
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t">
                <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs sm:text-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Newsletter Signup - Inline */}
            <NewsletterSignup variant="inline" className="my-8 sm:my-12" />

            {/* Author Bio */}
            <AuthorBio
              author={{
                name: post.author,
                bio: post.authorBio || `${post.author} is a passionate writer and expert in real-time communication technologies.`,
                image: post.authorImage,
                website: "https://chatnow.com",
                twitter: "chatnow",
                linkedin: "https://linkedin.com/company/chatnow"
              }}
              className="my-8 sm:my-12"
            />

            {/* Social Sharing - Extended */}
            <div className="my-8 sm:my-12 p-4 sm:p-6 bg-muted/30 rounded-lg">
              <SocialSharing
                title={post.title}
                url={`${window.location.origin}/blog/${post.slug}`}
                description={post.metaDescription}
                postId={post._id}
                postSlug={post.slug}
              />
            </div>

            {/* Comments Section */}
            <Comments postId={post._id} className="my-8 sm:my-12" />
          </article>

          {/* Related Posts */}
          {relatedPosts && relatedPosts.filter(relatedPost => relatedPost._id !== post._id).length > 0 && (
            <div>
              <Separator className="mb-6 sm:mb-8" />
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {relatedPosts
                  .filter(relatedPost => relatedPost._id !== post._id)
                  .slice(0, 3)
                  .map((relatedPost) => (
                    <Card key={relatedPost._id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <CardHeader className="pb-3 sm:pb-4">
                        {relatedPost.coverImage && (
                          <div className="aspect-video bg-muted rounded-lg mb-3 sm:mb-4 overflow-hidden">
                            <img
                              src={relatedPost.coverImage}
                              alt={relatedPost.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <Badge variant="secondary" className="w-fit mb-2 text-xs sm:text-sm">
                          {relatedPost.category}
                        </Badge>
                        <CardTitle className="line-clamp-2 text-base sm:text-lg">
                          <Link href={`/blog/${relatedPost.slug}`} className="hover:text-primary transition-colors">
                            {relatedPost.title}
                          </Link>
                        </CardTitle>
                        <CardDescription className="line-clamp-3 text-sm">
                          {relatedPost.excerpt}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <Clock className="h-3 w-3" />
                            <span>{relatedPost.readTime} min</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{relatedPost.views}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

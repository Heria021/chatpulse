"use client"

import Link from "next/link"
import { useState, useMemo } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { BlogListSkeleton } from "@/components/blog/blog-skeletons"
import { formatBlogDate } from "@/lib/blog-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { TooltipProvider } from "@/components/ui/tooltip"
import { toast } from "sonner"
import {
  MessageCircle,
  Search,
  Calendar,
  Clock,
  Eye,
  User,
  BookOpen,
  TrendingUp,
  Star,
  Filter,
  SortAsc,
  Share2
} from "lucide-react"

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"latest" | "popular" | "featured">("latest")

  const posts = useQuery(api.blog.getBlogPosts, {
    category: selectedCategory || undefined,
    limit: 24
  })
  const featuredPosts = useQuery(api.blog.getFeaturedPosts)
  const categories = useQuery(api.blog.getBlogCategories)

  // Filter and sort posts
  const filteredAndSortedPosts = useMemo(() => {
    if (!posts) return []

    let filtered = posts

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(term) ||
        post.excerpt.toLowerCase().includes(term) ||
        post.tags.some(tag => tag.toLowerCase().includes(term))
      )
    }

    // Sort posts
    switch (sortBy) {
      case "popular":
        return [...filtered].sort((a, b) => b.views - a.views)
      case "featured":
        return [...filtered].sort((a, b) => {
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return (b.publishedAt || b.createdAt) - (a.publishedAt || a.createdAt)
        })
      case "latest":
      default:
        return [...filtered].sort((a, b) => (b.publishedAt || b.createdAt) - (a.publishedAt || a.createdAt))
    }
  }, [posts, searchTerm, sortBy])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is handled by the useMemo above
  }

  // Loading state
  if (posts === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  ChatPulse
                </span>
              </Link>
              <div className="flex items-center space-x-4">
                <TooltipProvider>
                  <ThemeToggle />
                </TooltipProvider>
                <Button asChild>
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Blog</h1>
            <p className="text-xl text-muted-foreground">Loading articles...</p>
          </div>
          <BlogListSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                ChatPulse
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <TooltipProvider>
                <ThemeToggle />
              </TooltipProvider>
              <Button asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">ChatPulse Blog</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Insights, updates, and stories from the world of instant communication
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-12">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            
            {/* Categories */}
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                All Posts
              </Button>
              {categories?.map((cat) => (
                <Button
                  key={cat.category}
                  variant={selectedCategory === cat.category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.category)}
                >
                  {cat.category} ({cat.count})
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Posts */}
        {featuredPosts && featuredPosts.length > 0 && !selectedCategory && (
          <div className="mb-16">
            <div className="flex items-center space-x-2 mb-8">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Featured Articles</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <Card key={post._id} className="blog-card">
                  <CardHeader className="pb-4">
                    {post.coverImage && (
                      <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden">
                        <img 
                          src={post.coverImage} 
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <Badge variant="secondary" className="w-fit mb-2">
                      {post.category}
                    </Badge>
                    <CardTitle className="line-clamp-2">
                      <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                        {post.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-3">
                      {post.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatBlogDate(post.publishedAt || post.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{post.readTime} min</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{post.views}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Separator className="mt-12" />
          </div>
        )}

        {/* All Posts */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">
                {selectedCategory ? `${selectedCategory} Articles` : 'Latest Articles'}
              </h2>
              <Badge variant="outline" className="ml-2">
                {filteredAndSortedPosts.length} posts
              </Badge>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center space-x-2">
              <SortAsc className="h-4 w-4 text-muted-foreground" />
              <div className="flex space-x-1">
                <Button
                  variant={sortBy === "latest" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("latest")}
                >
                  Latest
                </Button>
                <Button
                  variant={sortBy === "popular" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("popular")}
                >
                  Popular
                </Button>
                <Button
                  variant={sortBy === "featured" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("featured")}
                >
                  Featured
                </Button>
              </div>
            </div>
          </div>

          {filteredAndSortedPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedPosts.map((post) => (
                <Card key={post._id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative">
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
                      <Badge variant="secondary">
                        {post.category}
                      </Badge>
                      <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{post.views}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.preventDefault()
                            navigator.share?.({
                              title: post.title,
                              text: post.excerpt,
                              url: `${window.location.origin}/blog/${post.slug}`
                            }).catch(() => {
                              navigator.clipboard.writeText(`${window.location.origin}/blog/${post.slug}`)
                              toast.success("Link copied to clipboard!")
                            })
                          }}
                        >
                          <Share2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <CardTitle className="line-clamp-2 mb-2">
                      <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                        {post.title}
                      </Link>
                    </CardTitle>

                    <CardDescription className="line-clamp-3">
                      {post.metaDescription || post.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{post.author}</span>
                        <span>•</span>
                        <Calendar className="h-3 w-3" />
                        <span>{formatBlogDate(post.publishedAt || post.createdAt)}</span>
                        <span>•</span>
                        <Clock className="h-3 w-3" />
                        <span>{post.readTime} min</span>
                      </div>
                      
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
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
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No articles found</h3>
              <p className="text-muted-foreground mb-6">
                {selectedCategory
                  ? `No articles in the "${selectedCategory}" category yet. Check back soon for new content!`
                  : "We're working on creating amazing content for you. Check back soon for our latest articles!"
                }
              </p>
              {!selectedCategory && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    In the meantime, explore ChatPulse's features:
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Button variant="outline" asChild>
                      <Link href="/auth/signup">Sign Up</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/auth/guest">Try Guest Mode</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

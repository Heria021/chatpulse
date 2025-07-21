"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Calendar, BookOpen, Eye, Twitter, Linkedin, Github, Globe } from "lucide-react"
import { BlogPost } from "@/lib/types/blog"

interface AuthorProfileProps {
  author: {
    name: string
    bio?: string
    image?: string
    email?: string
    website?: string
    twitter?: string
    linkedin?: string
    github?: string
    joinDate?: number
    totalPosts?: number
    totalViews?: number
    specialties?: string[]
  }
  recentPosts?: BlogPost[]
  className?: string
}

export function AuthorProfile({ author, recentPosts = [], className = "" }: AuthorProfileProps) {
  const initials = author.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <div className="flex items-start space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={author.image} alt={author.name} />
            <AvatarFallback className="text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <CardTitle className="text-xl">{author.name}</CardTitle>
            {author.bio && (
              <CardDescription className="mt-2 text-sm leading-relaxed">
                {author.bio}
              </CardDescription>
            )}
            
            {/* Author Stats */}
            <div className="flex items-center space-x-4 mt-3 text-sm text-muted-foreground">
              {author.totalPosts && (
                <div className="flex items-center space-x-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{author.totalPosts} articles</span>
                </div>
              )}
              {author.totalViews && (
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{author.totalViews.toLocaleString()} views</span>
                </div>
              )}
              {author.joinDate && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Since {new Date(author.joinDate).getFullYear()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Specialties */}
        {author.specialties && author.specialties.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Specialties</h4>
            <div className="flex flex-wrap gap-2">
              {author.specialties.map((specialty) => (
                <Badge key={specialty} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Social Links */}
        <div className="flex items-center space-x-2">
          {author.website && (
            <Button variant="outline" size="sm" asChild>
              <a href={author.website} target="_blank" rel="noopener noreferrer">
                <Globe className="h-4 w-4" />
              </a>
            </Button>
          )}
          {author.twitter && (
            <Button variant="outline" size="sm" asChild>
              <a href={`https://twitter.com/${author.twitter}`} target="_blank" rel="noopener noreferrer">
                <Twitter className="h-4 w-4" />
              </a>
            </Button>
          )}
          {author.linkedin && (
            <Button variant="outline" size="sm" asChild>
              <a href={author.linkedin} target="_blank" rel="noopener noreferrer">
                <Linkedin className="h-4 w-4" />
              </a>
            </Button>
          )}
          {author.github && (
            <Button variant="outline" size="sm" asChild>
              <a href={`https://github.com/${author.github}`} target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
        
        {/* Recent Posts */}
        {recentPosts.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">Recent Articles</h4>
            <div className="space-y-3">
              {recentPosts.slice(0, 3).map((post) => (
                <div key={post._id} className="flex items-start space-x-3">
                  {post.coverImage && (
                    <div className="flex-shrink-0 w-12 h-12 bg-muted rounded overflow-hidden">
                      <img 
                        src={post.coverImage} 
                        alt={post.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="text-sm font-medium hover:text-primary transition-colors line-clamp-2 block"
                    >
                      {post.title}
                    </Link>
                    <div className="flex items-center space-x-2 mt-1 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {post.category}
                      </Badge>
                      <span>{post.readTime} min read</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Compact author card for use in post headers
interface AuthorCardProps {
  author: {
    name: string
    bio?: string
    image?: string
  }
  publishedAt?: number
  readTime?: number
  className?: string
}

export function AuthorCard({ author, publishedAt, readTime, className = "" }: AuthorCardProps) {
  const initials = author.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <Avatar className="w-10 h-10">
        <AvatarImage src={author.image} alt={author.name} />
        <AvatarFallback className="text-sm font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="font-medium text-sm">{author.name}</div>
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          {publishedAt && (
            <time>
              {new Date(publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
          )}
          {readTime && (
            <>
              <span>•</span>
              <span>{readTime} min read</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Author bio section for end of articles
export function AuthorBio({ author, className = "" }: { author: AuthorProfileProps['author'], className?: string }) {
  const initials = author.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()

  return (
    <div className={`border rounded-lg p-6 bg-muted/30 ${className}`}>
      <div className="flex items-start space-x-4">
        <Avatar className="w-16 h-16">
          <AvatarImage src={author.image} alt={author.name} />
          <AvatarFallback className="text-lg font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">About {author.name}</h3>
          {author.bio && (
            <p className="text-muted-foreground mb-4 leading-relaxed">
              {author.bio}
            </p>
          )}
          
          {/* Social Links */}
          <div className="flex items-center space-x-3">
            {author.website && (
              <Button variant="outline" size="sm" asChild>
                <a href={author.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-4 w-4 mr-2" />
                  Website
                </a>
              </Button>
            )}
            {author.twitter && (
              <Button variant="outline" size="sm" asChild>
                <a href={`https://twitter.com/${author.twitter}`} target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-4 w-4 mr-2" />
                  Twitter
                </a>
              </Button>
            )}
            {author.linkedin && (
              <Button variant="outline" size="sm" asChild>
                <a href={author.linkedin} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

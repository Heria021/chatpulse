"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Share2, 
  Twitter, 
  Linkedin, 
  Facebook, 
  Copy, 
  Mail, 
  MessageCircle,
  Heart,
  Bookmark,
  Send,
  User,
  Calendar
} from "lucide-react"
import { toast } from "sonner"
import { trackBlogShare } from "@/lib/blog-analytics"

interface SocialSharingProps {
  title: string
  url: string
  description?: string
  postId?: string
  postSlug?: string
  className?: string
}

export function SocialSharing({ title, url, description, postId, postSlug, className = "" }: SocialSharingProps) {
  const [isSharing, setIsSharing] = useState(false)

  const shareData = {
    title,
    text: description || title,
    url
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData)
        if (postId && postSlug) {
          trackBlogShare(postId, postSlug, 'native')
        }
        toast.success("Shared successfully!")
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      handleCopyLink()
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      if (postId && postSlug) {
        trackBlogShare(postId, postSlug, 'clipboard')
      }
      toast.success("Link copied to clipboard!")
    } catch (error) {
      toast.error("Failed to copy link")
    }
  }

  const handleSocialShare = (platform: string, shareUrl: string) => {
    window.open(shareUrl, '_blank', 'width=600,height=400')
    if (postId && postSlug) {
      trackBlogShare(postId, postSlug, platform)
    }
  }

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  const emailUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this article: ${title}\n\n${url}`)}`

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <Share2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Share this article</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleNativeShare}
          className="flex items-center space-x-2"
        >
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSocialShare('twitter', twitterUrl)}
          className="flex items-center space-x-2"
        >
          <Twitter className="h-4 w-4" />
          <span>Twitter</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSocialShare('linkedin', linkedinUrl)}
          className="flex items-center space-x-2"
        >
          <Linkedin className="h-4 w-4" />
          <span>LinkedIn</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSocialShare('facebook', facebookUrl)}
          className="flex items-center space-x-2"
        >
          <Facebook className="h-4 w-4" />
          <span>Facebook</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSocialShare('email', emailUrl)}
          className="flex items-center space-x-2"
        >
          <Mail className="h-4 w-4" />
          <span>Email</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className="flex items-center space-x-2"
        >
          <Copy className="h-4 w-4" />
          <span>Copy</span>
        </Button>
      </div>
    </div>
  )
}

// Newsletter signup component
interface NewsletterSignupProps {
  className?: string
  variant?: 'default' | 'compact' | 'inline'
}

export function NewsletterSignup({ className = "", variant = 'default' }: NewsletterSignupProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsSubscribed(true)
      toast.success("Successfully subscribed to newsletter!")
      setEmail("")
    } catch (error) {
      toast.error("Failed to subscribe. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubscribed) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Thanks for subscribing!</h3>
          <p className="text-muted-foreground">
            You'll receive our latest articles and insights directly in your inbox.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={`bg-muted/30 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <Mail className="h-5 w-5 text-primary flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-medium text-sm">Stay Updated</h4>
            <p className="text-xs text-muted-foreground">Get our latest articles</p>
          </div>
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-32"
              required
            />
            <Button type="submit" size="sm" disabled={isLoading}>
              {isLoading ? "..." : "Subscribe"}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={`border-l-4 border-primary bg-primary/5 p-4 sm:p-6 rounded-r-lg ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
          <Mail className="h-6 w-6 text-primary flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-base sm:text-lg mb-2">Enjoying this article?</h4>
            <p className="text-sm sm:text-base text-muted-foreground mb-4">
              Subscribe to get more insights like this delivered to your inbox.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="flex-1"
                required
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Stay in the Loop</CardTitle>
        <CardDescription>
          Get the latest articles and insights delivered directly to your inbox. 
          Join thousands of developers staying updated with ChatPulse.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Subscribing..." : "Subscribe to Newsletter"}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            No spam, unsubscribe at any time. We respect your privacy.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

// Simple comments component (placeholder for future implementation)
interface CommentsProps {
  postId: string
  className?: string
}

export function Comments({ postId, className = "" }: CommentsProps) {
  const [comments, setComments] = useState([
    {
      id: '1',
      author: 'Alex Johnson',
      content: 'Great article! This really helped me understand the concepts better.',
      timestamp: Date.now() - 86400000, // 1 day ago
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: '2', 
      author: 'Sarah Chen',
      content: 'Thanks for the detailed explanation. Looking forward to implementing this in my project.',
      timestamp: Date.now() - 172800000, // 2 days ago
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
    }
  ])
  
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsSubmitting(true)
    
    // Simulate comment submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const comment = {
      id: Date.now().toString(),
      author: 'You',
      content: newComment,
      timestamp: Date.now(),
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
    }
    
    setComments([comment, ...comments])
    setNewComment("")
    setIsSubmitting(false)
    toast.success("Comment posted!")
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center space-x-2">
        <MessageCircle className="h-5 w-5 text-primary" />
        <h3 className="text-lg sm:text-xl font-semibold">Comments ({comments.length})</h3>
      </div>

      {/* Comment form */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="Share your thoughts..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={isSubmitting}
              rows={3}
              className="resize-none"
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                Be respectful and constructive in your comments.
              </p>
              <Button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
              >
                {isSubmitting ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex space-x-3 p-4 bg-muted/30 rounded-lg">
            <img
              src={comment.avatar}
              alt={comment.author}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-medium text-sm">{comment.author}</span>
                <time className="text-xs text-muted-foreground">
                  {new Date(comment.timestamp).toLocaleDateString()}
                </time>
              </div>
              <p className="text-sm leading-relaxed">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

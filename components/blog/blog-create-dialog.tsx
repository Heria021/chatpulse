"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { X, Plus } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface BlogCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BlogCreateDialog({ open, onOpenChange }: BlogCreateDialogProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  // Form state
  const [title, setTitle] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [author, setAuthor] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [metaDescription, setMetaDescription] = useState("")
  const [isPublished, setIsPublished] = useState(false)

  const createBlogPost = useMutation(api.blog.createBlogPost)

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !excerpt.trim() || !content.trim() || !author.trim() || !category) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsLoading(true)

    try {
      const slug = generateSlug(title)
      
      const result = await createBlogPost({
        title: title.trim(),
        slug,
        excerpt: excerpt.trim(),
        content: content.trim(),
        category,
        tags,
        author: author.trim(),
        coverImage: coverImage.trim() || undefined,
        metaDescription: metaDescription.trim() || undefined,
        isPublished,
      })

      toast.success("Blog post created successfully!")
      
      // Reset form
      setTitle("")
      setExcerpt("")
      setContent("")
      setCategory("")
      setTags([])
      setAuthor("")
      setCoverImage("")
      setMetaDescription("")
      setIsPublished(false)
      
      onOpenChange(false)
      
      // Navigate to edit page for rich content editing
      router.push(`/admin/blog/edit/${result.postId}`)
      
    } catch (error: any) {
      toast.error(error.message || "Failed to create blog post")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Blog Post</DialogTitle>
          <DialogDescription>
            Create a new blog post. You can add rich content after creation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter blog post title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt *</Label>
            <Textarea
              id="excerpt"
              placeholder="Brief description of the blog post..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              disabled={isLoading}
              rows={3}
              required
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              placeholder="Write your blog post content here... (You can enhance with rich content after creation)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isLoading}
              rows={8}
              required
            />
          </div>

          {/* Author and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                placeholder="Author name"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="programming">Programming</SelectItem>
                  <SelectItem value="web-development">Web Development</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="tutorials">Tutorials</SelectItem>
                  <SelectItem value="news">News</SelectItem>
                  <SelectItem value="opinion">Opinion</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                disabled={isLoading}
              />
              <Button type="button" variant="outline" onClick={addTag} disabled={isLoading}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <Label htmlFor="coverImage">Cover Image URL</Label>
            <Input
              id="coverImage"
              placeholder="https://example.com/image.jpg"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Meta Description */}
          <div className="space-y-2">
            <Label htmlFor="metaDescription">Meta Description (SEO)</Label>
            <Textarea
              id="metaDescription"
              placeholder="SEO description for search engines..."
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              disabled={isLoading}
              rows={2}
            />
          </div>

          {/* Publish Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="publish"
              checked={isPublished}
              onCheckedChange={setIsPublished}
              disabled={isLoading}
            />
            <Label htmlFor="publish">Publish immediately</Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Post"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

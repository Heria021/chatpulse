"use client"

import Link from "next/link"
import { useEffect, use, useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { RichContentRenderer } from "@/components/blog/rich-content-renderer"
import { generateBlogStructuredData, generateBreadcrumbStructuredData, generateFAQStructuredData } from "@/lib/seo-utils"
import { extractTableOfContents } from "@/lib/blog-content-utils"
import { trackBlogView } from "@/lib/blog-analytics"
import { toast } from "sonner"
import { formatBlogDate } from "@/lib/blog-utils"

import {
  MessageCircle, Calendar, Clock, Eye, User, 
  ArrowLeft, Share2, BookOpen, Tag, Activity, Menu, 
  Terminal, ChevronRight, Hash
} from "lucide-react"

// --- COMPONENTS ---

const BlogPostHeader = ({ post }: { post: any }) => (
  <div className="border-b border-neutral-200 pb-12 mb-12">
     <div className="flex flex-wrap items-center gap-3 mb-6 font-mono text-xs font-bold uppercase tracking-widest text-neutral-500">
        <Link href="/blog" className="hover:text-black transition-colors flex items-center gap-1">
           <ArrowLeft className="w-3 h-3" /> Back
        </Link>
        <span>/</span>
        <span className="text-black">{post.category}</span>
        <span>/</span>
        <span>{post.readTime} MIN READ</span>
     </div>

     <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.1] mb-8 text-black">
        {post.title}
     </h1>

     <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-t border-neutral-100 pt-6">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white font-bold text-lg">
              {post.author?.[0] || 'A'}
           </div>
           <div>
              <div className="font-bold text-sm uppercase">{post.author}</div>
              <div className="text-xs text-neutral-500 font-mono">
                 {formatBlogDate(post.publishedAt || post.createdAt)}
              </div>
           </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 text-xs font-bold uppercase bg-neutral-100 px-3 py-1.5 rounded-full">
              <Eye className="w-3 h-3" /> {post.views} Views
           </div>
           <button 
              onClick={() => {
                 navigator.clipboard.writeText(window.location.href);
                 toast.success("Link copied to clipboard");
              }}
              className="flex items-center gap-2 text-xs font-bold uppercase bg-black text-white px-4 py-2 rounded-full hover:bg-neutral-800 transition-colors"
           >
              <Share2 className="w-3 h-3" /> Share
           </button>
        </div>
     </div>
  </div>
);

const TableOfContents = ({ items }: { items: any[] }) => (
  <div className="hidden lg:block sticky top-32 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto w-64 p-6 bg-neutral-50 border border-neutral-200 rounded-xl">
     <div className="flex items-center gap-2 font-bold text-sm mb-4 uppercase tracking-widest">
        <BookOpen className="w-4 h-4" /> Contents
     </div>
     <nav className="space-y-3">
        {items.map((item) => (
           <a
              key={item.id}
              href={`#${item.id}`}
              className={`block text-xs transition-colors hover:text-black leading-relaxed ${
                 item.level === 1 ? 'font-bold text-neutral-800' : 'pl-3 text-neutral-500'
              }`}
           >
              {item.text}
           </a>
        ))}
     </nav>
  </div>
);

// --- MAIN PAGE ---

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = use(params)
  const [scrolled, setScrolled] = useState(false);
  
  const post = useQuery(api.blog.getBlogPost, { slug: resolvedParams.slug })
  const relatedPosts = useQuery(api.blog.getBlogPosts, {
    category: post?.category,
    limit: 3
  })
  const incrementViews = useMutation(api.blog.incrementBlogPostViews)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (post?._id) {
      incrementViews({ postId: post._id })
      trackBlogView(post._id, post.slug, document.referrer)
    }
  }, [post?._id, incrementViews, post?.slug])

  // Content extraction
  const contentSections = post?.richContent || []
  const tableOfContents = post ? extractTableOfContents(post.richContent) : []
  
  // SEO Data
  const structuredData = post ? generateBlogStructuredData(post) : null

  if (post === undefined) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
         <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (post === null) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center">
         <h1 className="text-4xl font-black mb-4">404: DATA_NOT_FOUND</h1>
         <p className="text-neutral-500 mb-8">The article you requested has been archived or deleted.</p>
         <Link href="/blog" className="px-6 py-3 bg-black text-white font-bold rounded-full hover:bg-neutral-800">
            Return to Archive
         </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white font-sans text-black selection:bg-black selection:text-white">
      
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}

      {/* --- Navigation --- */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md py-4 border-b border-neutral-100' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-2 rounded-lg bg-black text-white group-hover:scale-110 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight">ChatPulse.</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/blog" className="text-sm font-bold text-neutral-600 hover:text-black transition-colors">BLOG</Link>
            <Link href="/about" className="text-sm font-bold text-neutral-600 hover:text-black transition-colors">ABOUT</Link>
            <button className="bg-black text-white hover:bg-neutral-800 px-6 py-2.5 rounded-full text-sm font-bold transition-colors">
              LOGIN
            </button>
          </div>
          <button className="md:hidden"><Menu /></button>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="pt-32 pb-24 px-4">
         <div className="max-w-7xl mx-auto">
            
            <BlogPostHeader post={post} />

            <div className="flex gap-16 relative">
               {/* Sidebar (TOC) */}
               <aside className="hidden lg:block w-64 flex-shrink-0">
                  <TableOfContents items={tableOfContents} />
               </aside>

               {/* Article Body */}
               <div className="flex-1 max-w-3xl">
                  {/* Cover Image */}
                  {post.coverImage && (
                     <div className="aspect-[16/9] bg-neutral-100 rounded-2xl overflow-hidden mb-12 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <img 
                           src={post.coverImage} 
                           alt={post.coverImageAlt || post.title}
                           className="w-full h-full object-cover"
                        />
                     </div>
                  )}

                  {/* Rich Text Content */}
                  <div className="prose prose-lg prose-neutral max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-blue-600 hover:prose-a:text-blue-800 prose-img:rounded-xl">
                     {contentSections.length > 0 ? (
                        <RichContentRenderer sections={contentSections} />
                     ) : (
                        <p className="text-neutral-500 font-mono text-center py-12">
                           -- END OF TRANSMISSION --
                        </p>
                     )}
                  </div>

                  {/* Tags Footer */}
                  {post.tags.length > 0 && (
                     <div className="mt-16 pt-8 border-t border-neutral-200">
                        <div className="flex items-center gap-2 mb-4 font-bold text-sm uppercase text-neutral-500">
                           <Hash className="w-4 h-4" /> Related Topics
                        </div>
                        <div className="flex flex-wrap gap-2">
                           {post.tags.map((tag: string) => (
                              <span key={tag} className="px-4 py-2 bg-neutral-100 text-black font-bold text-sm rounded-full border border-neutral-200">
                                 #{tag}
                              </span>
                           ))}
                        </div>
                     </div>
                  )}
               </div>
            </div>

         </div>
      </main>

      {/* --- Footer --- */}
      <footer className="py-24 bg-black text-white border-t border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 text-center">
           <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-8">
             Stay in the loop.
           </h2>
           <p className="text-neutral-400 mb-12">
             Join our newsletter for the latest updates on ChatPulse features and engineering.
           </p>
           
           <div className="pt-10 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-bold uppercase tracking-wider text-neutral-500">
              <span>© 2025 ChatPulse Inc.</span>
              <div className="flex gap-8">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              </div>
           </div>
        </div>
      </footer>

    </div>
  )
}
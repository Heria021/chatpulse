"use client"

import Link from "next/link"
import { useState, useMemo, useEffect } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { formatBlogDate } from "@/lib/blog-utils"
import {
  Search, Calendar, Clock, Eye, 
  ArrowRight, Hash, TrendingUp, 
  ChevronRight, LayoutGrid, List, User,
  Menu,
  Activity
} from "lucide-react"

// --- COMPONENTS ---

const CategoryTag = ({ active, label, onClick }: { active: boolean, label: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`px-5 py-2 text-sm font-bold border rounded-full transition-all duration-200 ${
      active 
        ? "bg-black text-white border-black" 
        : "bg-transparent text-neutral-600 border-neutral-200 hover:border-black hover:text-black"
    }`}
  >
    {label}
  </button>
);

const BlogPostCard = ({ post }: { post: any }) => (
  <Link href={`/blog/${post.slug}`} className="group flex flex-col h-full">
    {/* Image Container */}
    <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-neutral-100 mb-6">
      {post.coverImage && (
        <img 
          src={post.coverImage} 
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      )}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md border border-neutral-200">
        {post.category}
      </div>
    </div>

    {/* Content */}
    <div className="flex flex-col flex-grow">
      <div className="flex items-center gap-3 text-xs font-medium text-neutral-500 mb-3 uppercase tracking-wide">
        <span>{formatBlogDate(post.publishedAt || post.createdAt)}</span>
        <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
        <span>{post.readTime} min read</span>
      </div>

      <h3 className="text-2xl font-bold leading-tight mb-3 group-hover:text-neutral-600 transition-colors">
        {post.title}
      </h3>

      <p className="text-neutral-600 leading-relaxed mb-6 line-clamp-2">
        {post.excerpt}
      </p>

      {/* Author */}
      <div className="mt-auto flex items-center gap-2 pt-4 border-t border-neutral-100">
         <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 text-xs font-bold">
            {post.author?.[0] || 'A'}
         </div>
         <span className="text-sm font-bold text-neutral-900">{post.author}</span>
      </div>
    </div>
  </Link>
);

const FeaturedPostCard = ({ post }: { post: any }) => (
  <Link href={`/blog/${post.slug}`} className="group relative block w-full overflow-hidden rounded-3xl bg-neutral-900 text-white shadow-xl">
     {/* Background Image with Overlay */}
     <div className="absolute inset-0 z-0">
        {post.coverImage && (
            <img 
                src={post.coverImage} 
                className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105" 
                alt="" 
            />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
     </div>
     
     <div className="relative z-10 p-8 md:p-12 lg:p-16 flex flex-col justify-end min-h-[500px]">
        <div className="flex items-center gap-2 mb-6">
            <span className="bg-white text-black px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full">
                Featured
            </span>
            <span className="text-neutral-300 text-xs font-bold uppercase tracking-widest">
                {post.category}
            </span>
        </div>
        
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none mb-6 max-w-4xl group-hover:underline decoration-2 underline-offset-8">
           {post.title}
        </h2>
        
        <p className="text-lg text-neutral-200 font-medium max-w-2xl mb-8 line-clamp-2">
           {post.excerpt}
        </p>

        <div className="flex items-center gap-4 text-sm font-bold">
           <span className="flex items-center gap-2">
              Read Article <ArrowRight className="w-4 h-4" />
           </span>
        </div>
     </div>
  </Link>
);

// --- MAIN PAGE ---

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false);

  const posts = useQuery(api.blog.getBlogPosts, {
    category: selectedCategory || undefined,
    limit: 24
  })
  const featuredPosts = useQuery(api.blog.getFeaturedPosts)
  const categories = useQuery(api.blog.getBlogCategories)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredPosts = useMemo(() => {
    if (!posts) return []
    let filtered = posts
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(term) ||
        post.excerpt.toLowerCase().includes(term) ||
        post.tags.some(tag => tag.toLowerCase().includes(term))
      )
    }
    return filtered.sort((a, b) => (b.publishedAt || b.createdAt) - (a.publishedAt || a.createdAt))
  }, [posts, searchTerm])

  if (posts === undefined) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
         <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white font-sans text-black selection:bg-black selection:text-white">
      
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
            <Link href="/" className="text-sm font-bold text-neutral-600 hover:text-black transition-colors">HOME</Link>
            <Link href="/about" className="text-sm font-bold text-neutral-600 hover:text-black transition-colors">ABOUT</Link>
            <button className="bg-black text-white hover:bg-neutral-800 px-6 py-2.5 rounded-full text-sm font-bold transition-colors">
              LOGIN
            </button>
          </div>
          <button className="md:hidden"><Menu /></button>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="pt-40 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
           <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6">
             THE PULSE.
           </h1>
           <p className="text-xl text-neutral-600 font-medium max-w-2xl mx-auto leading-relaxed">
             Engineering, design, and stories from the team building the future of connection.
           </p>
        </div>
      </section>

      {/* --- Featured Section --- */}
      {featuredPosts && featuredPosts.length > 0 && !selectedCategory && !searchTerm && (
        <section className="px-4 pb-20">
           <div className="max-w-7xl mx-auto">
              <FeaturedPostCard post={featuredPosts[0]} />
           </div>
        </section>
      )}

      {/* --- Filter Bar --- */}
      <section className="sticky top-20 z-40 bg-white/90 backdrop-blur-xl border-y border-neutral-100 py-6 mb-16">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
               <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 w-full md:w-auto no-scrollbar">
                  <CategoryTag 
                     active={selectedCategory === null} 
                     label="All Stories" 
                     onClick={() => setSelectedCategory(null)} 
                  />
                  {categories?.map((cat) => (
                     <CategoryTag 
                        key={cat.category}
                        active={selectedCategory === cat.category}
                        label={cat.category}
                        onClick={() => setSelectedCategory(cat.category)}
                     />
                  ))}
               </div>

               <div className="relative w-full md:w-64 min-w-64">
                  <input
                     type="text"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full pl-10 pr-4 py-2 bg-neutral-100 border-none rounded-full text-sm font-medium focus:ring-2 focus:ring-black/5 transition-all"
                     placeholder="Search articles..."
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
               </div>
            </div>
         </div>
      </section>

      {/* --- Main Grid --- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
         {filteredPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
               {filteredPosts.map((post) => (
                  <BlogPostCard key={post._id} post={post} />
               ))}
            </div>
         ) : (
            <div className="py-24 text-center">
               <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4">
                  <Search className="w-6 h-6 text-neutral-400" />
               </div>
               <h3 className="text-xl font-bold mb-2">No articles found</h3>
               <p className="text-neutral-500 mb-6">Try adjusting your search or category filter.</p>
               <button 
                  onClick={() => {setSearchTerm(''); setSelectedCategory(null)}}
                  className="text-sm font-bold underline hover:text-black text-neutral-500"
               >
                  Clear all filters
               </button>
            </div>
         )}
      </section>

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
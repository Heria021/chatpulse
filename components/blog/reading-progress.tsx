"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface ReadingProgressProps {
  target?: string // CSS selector for the content element
}

export function ReadingProgress({ target = "article" }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const updateProgress = () => {
      const element = document.querySelector(target)
      if (!element) return

      const rect = element.getBoundingClientRect()
      const elementTop = rect.top + window.scrollY
      const elementHeight = rect.height
      const windowHeight = window.innerHeight
      const scrollTop = window.scrollY

      // Calculate how much of the element has been scrolled past
      const scrolled = Math.max(0, scrollTop + windowHeight - elementTop)
      const totalScrollable = elementHeight + windowHeight
      const progressPercentage = Math.min(100, (scrolled / totalScrollable) * 100)

      setProgress(progressPercentage)
    }

    // Update on scroll
    window.addEventListener("scroll", updateProgress, { passive: true })
    // Update on resize
    window.addEventListener("resize", updateProgress, { passive: true })
    // Initial calculation
    updateProgress()

    return () => {
      window.removeEventListener("scroll", updateProgress)
      window.removeEventListener("resize", updateProgress)
    }
  }, [target])

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-muted">
      <motion.div
        className="h-full bg-gradient-to-r from-primary to-primary/70"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.1, ease: "easeOut" }}
      />
    </div>
  )
}

// Reading time estimator component
interface ReadingTimeProps {
  content: any[] // Rich content array
  className?: string
}

export function ReadingTime({ content, className = "" }: ReadingTimeProps) {
  const calculateReadingTime = (richContent: any[]) => {
    const wordsPerMinute = 200
    let totalWords = 0

    richContent.forEach(section => {
      switch (section.type) {
        case 'heading':
        case 'subheading':
        case 'paragraph':
        case 'quote':
          totalWords += section.content.split(/\s+/).filter((word: string) => word.length > 0).length
          break
        case 'code':
          if (section.codeBlock) {
            // Code takes longer to read
            totalWords += Math.ceil(section.codeBlock.code.split(/\s+/).length * 1.5)
          }
          break
        case 'list':
          if (section.listItems) {
            totalWords += section.listItems.join(' ').split(/\s+/).filter((word: string) => word.length > 0).length
          }
          break
      }
    })

    return Math.max(1, Math.ceil(totalWords / wordsPerMinute))
  }

  const readTime = calculateReadingTime(content)

  return (
    <span className={`text-sm text-muted-foreground ${className}`}>
      {readTime} min read
    </span>
  )
}

// Table of contents with progress tracking
interface TableOfContentsProps {
  headings: Array<{
    id: string
    text: string
    level: number
  }>
  className?: string
}

export function TableOfContentsWithProgress({ headings, className = "" }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: "-20% 0% -35% 0%",
        threshold: 0
      }
    )

    // Observe all heading elements
    headings.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav className={`space-y-2 ${className}`}>
      <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-4">
        Table of Contents
      </h3>
      <ul className="space-y-2">
        {headings.map(({ id, text, level }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={`block text-sm transition-colors hover:text-primary ${
                level === 1 ? 'font-medium' : 'ml-4 text-muted-foreground'
              } ${
                activeId === id ? 'text-primary font-medium' : ''
              }`}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(id)?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start'
                })
              }}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

// Reading progress indicator with time remaining
export function ReadingProgressIndicator({ content }: { content: any[] }) {
  const [progress, setProgress] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)

  const totalReadTime = Math.max(1, Math.ceil(
    content.reduce((total, section) => {
      let words = 0
      switch (section.type) {
        case 'heading':
        case 'subheading':
        case 'paragraph':
        case 'quote':
          words = section.content.split(/\s+/).length
          break
        case 'code':
          words = section.codeBlock ? section.codeBlock.code.split(/\s+/).length * 1.5 : 0
          break
        case 'list':
          words = section.listItems ? section.listItems.join(' ').split(/\s+/).length : 0
          break
      }
      return total + words
    }, 0) / 200
  ))

  useEffect(() => {
    const updateProgress = () => {
      const article = document.querySelector('article')
      if (!article) return

      const rect = article.getBoundingClientRect()
      const articleTop = rect.top + window.scrollY
      const articleHeight = rect.height
      const windowHeight = window.innerHeight
      const scrollTop = window.scrollY

      const scrolled = Math.max(0, scrollTop + windowHeight - articleTop)
      const totalScrollable = articleHeight + windowHeight
      const progressPercentage = Math.min(100, (scrolled / totalScrollable) * 100)

      setProgress(progressPercentage)
      setTimeRemaining(Math.ceil(totalReadTime * (1 - progressPercentage / 100)))
    }

    window.addEventListener("scroll", updateProgress, { passive: true })
    updateProgress()

    return () => window.removeEventListener("scroll", updateProgress)
  }, [totalReadTime])

  return (
    <div className="fixed bottom-4 right-4 bg-background/95 backdrop-blur border rounded-lg p-3 shadow-lg">
      <div className="flex items-center space-x-3">
        <div className="relative w-12 h-12">
          <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={`${progress}, 100`}
              className="text-primary"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium">{Math.round(progress)}%</span>
          </div>
        </div>
        <div className="text-sm">
          <div className="font-medium">{timeRemaining} min left</div>
          <div className="text-muted-foreground">{totalReadTime} min total</div>
        </div>
      </div>
    </div>
  )
}

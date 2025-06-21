"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { BlogContentSection } from "@/lib/types/blog"
import { CodeBlock, InlineCode } from "./code-block"
import { Quote, List } from "lucide-react"

interface RichContentRendererProps {
  sections: BlogContentSection[]
  className?: string
}

export function RichContentRenderer({ sections, className }: RichContentRendererProps) {
  const sortedSections = sections.sort((a, b) => a.order - b.order)

  const renderSection = (section: BlogContentSection) => {
    switch (section.type) {
      case 'heading':
        return renderHeading(section)
      case 'subheading':
        return renderSubheading(section)
      case 'paragraph':
        return renderParagraph(section)
      case 'code':
        return renderCodeSection(section)
      case 'image':
        return renderImage(section)
      case 'quote':
        return renderQuote(section)
      case 'list':
        return renderList(section)
      default:
        return null
    }
  }

  const renderHeading = (section: BlogContentSection) => {
    const level = section.level || 1
    const HeadingTag = `h${Math.min(Math.max(level, 1), 6)}` as keyof React.JSX.IntrinsicElements
    
    const headingClasses = {
      1: "text-4xl font-bold mb-6 mt-8 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent",
      2: "text-3xl font-bold mb-5 mt-7 text-foreground",
      3: "text-2xl font-semibold mb-4 mt-6 text-foreground",
      4: "text-xl font-semibold mb-3 mt-5 text-foreground",
      5: "text-lg font-medium mb-3 mt-4 text-foreground",
      6: "text-base font-medium mb-2 mt-3 text-foreground"
    }

    return (
      <HeadingTag 
        key={section.id}
        className={cn(headingClasses[level as keyof typeof headingClasses], "scroll-mt-20")}
        id={section.id}
      >
        {section.content}
      </HeadingTag>
    )
  }

  const renderSubheading = (section: BlogContentSection) => {
    return (
      <h3 
        key={section.id}
        className="text-xl font-semibold mb-3 mt-6 text-foreground/90 border-l-4 border-primary/30 pl-4"
        id={section.id}
      >
        {section.content}
      </h3>
    )
  }

  const renderParagraph = (section: BlogContentSection) => {
    // Enhanced paragraph with support for inline formatting
    const formatInlineContent = (content: string) => {
      // Simple inline code detection
      const parts = content.split(/(`[^`]+`)/g)
      return parts.map((part, index) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          return <InlineCode key={index}>{part.slice(1, -1)}</InlineCode>
        }
        return part
      })
    }

    return (
      <p 
        key={section.id}
        className="mb-4 leading-relaxed text-foreground/90 text-base"
      >
        {formatInlineContent(section.content)}
      </p>
    )
  }

  const renderCodeSection = (section: BlogContentSection) => {
    if (!section.codeBlock) return null

    return (
      <div key={section.id} className="my-6">
        <CodeBlock codeBlock={section.codeBlock} />
      </div>
    )
  }

  const renderImage = (section: BlogContentSection) => {
    if (!section.imageUrl) return null

    return (
      <div key={section.id} className="my-8">
        <div className="relative overflow-hidden rounded-xl border border-border/50 bg-muted/20">
          <img
            src={section.imageUrl}
            alt={section.imageAlt || section.content}
            className="w-full h-auto object-cover"
          />
          {section.content && (
            <div className="p-4 bg-muted/30 border-t border-border/50">
              <p className="text-sm text-muted-foreground text-center italic">
                {section.content}
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderQuote = (section: BlogContentSection) => {
    return (
      <blockquote 
        key={section.id}
        className="my-6 border-l-4 border-primary/50 bg-muted/30 p-4 rounded-r-lg"
      >
        <div className="flex items-start space-x-3">
          <Quote className="h-5 w-5 text-primary/70 mt-1 flex-shrink-0" />
          <p className="text-foreground/90 italic text-base leading-relaxed">
            {section.content}
          </p>
        </div>
      </blockquote>
    )
  }

  const renderList = (section: BlogContentSection) => {
    if (!section.listItems || section.listItems.length === 0) return null

    const ListTag = section.listType === 'ordered' ? 'ol' : 'ul'
    const listClasses = section.listType === 'ordered' 
      ? "list-decimal list-inside space-y-2 mb-4 ml-4"
      : "list-disc list-inside space-y-2 mb-4 ml-4"

    return (
      <div key={section.id} className="my-4">
        {section.content && (
          <p className="font-medium text-foreground mb-2">{section.content}</p>
        )}
        <ListTag className={listClasses}>
          {section.listItems.map((item, index) => (
            <li key={index} className="text-foreground/90 leading-relaxed">
              {item}
            </li>
          ))}
        </ListTag>
      </div>
    )
  }

  return (
    <div className={cn("prose prose-lg max-w-none", className)}>
      {sortedSections.map(renderSection)}
    </div>
  )
}

// Table of Contents component
export function TableOfContents({ sections }: { sections: BlogContentSection[] }) {
  const headings = sections
    .filter(section => section.type === 'heading' || section.type === 'subheading')
    .sort((a, b) => a.order - b.order)

  if (headings.length === 0) return null

  return (
    <div className="bg-muted/30 rounded-lg p-4 mb-8">
      <h3 className="font-semibold text-foreground mb-3 flex items-center">
        <List className="h-4 w-4 mr-2" />
        Table of Contents
      </h3>
      <nav>
        <ul className="space-y-1">
          {headings.map((heading) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className={cn(
                  "block text-sm hover:text-primary transition-colors",
                  heading.type === 'heading' ? "font-medium" : "ml-4 text-muted-foreground"
                )}
              >
                {heading.content}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

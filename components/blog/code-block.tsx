"use client"

import React, { useState } from "react"
import { Copy, Check, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BlogCodeBlock } from "@/lib/types/blog"

interface CodeBlockProps {
  codeBlock: BlogCodeBlock
  className?: string
}

export function CodeBlock({ codeBlock, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(codeBlock.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  const getLanguageIcon = (language: string) => {
    switch (language.toLowerCase()) {
      case 'javascript':
      case 'js':
        return '🟨'
      case 'typescript':
      case 'ts':
        return '🔷'
      case 'python':
      case 'py':
        return '🐍'
      case 'react':
      case 'jsx':
      case 'tsx':
        return '⚛️'
      case 'html':
        return '🌐'
      case 'css':
        return '🎨'
      case 'bash':
      case 'shell':
        return '💻'
      default:
        return '📄'
    }
  }

  const formatCode = (code: string) => {
    const lines = code.split('\n')
    return lines.map((line, index) => {
      const lineNumber = index + 1
      const isHighlighted = codeBlock.highlightLines?.includes(lineNumber)
      
      return (
        <div
          key={index}
          className={cn(
            "flex",
            isHighlighted && "bg-blue-500/10 border-l-2 border-l-blue-500"
          )}
        >
          {codeBlock.showLineNumbers && (
            <span className="select-none text-muted-foreground text-sm mr-4 w-8 text-right flex-shrink-0">
              {lineNumber}
            </span>
          )}
          <span className="flex-1 whitespace-pre-wrap break-all">
            {line || ' '}
          </span>
        </div>
      )
    })
  }

  return (
    <div className={cn("group relative", className)}>
      {/* Code block container with Aceternity-style design */}
      <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-background via-background to-muted/20 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <span className="text-lg">{getLanguageIcon(codeBlock.language)}</span>
              <span className="text-sm font-medium text-muted-foreground">
                {codeBlock.title || codeBlock.language}
              </span>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Code content */}
        <div className="relative">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
          
          <pre className="relative p-4 text-sm font-mono overflow-x-auto">
            <code className="block">
              {formatCode(codeBlock.code)}
            </code>
          </pre>
        </div>

        {/* Gradient overlay for visual effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5" />
        </div>
      </div>
    </div>
  )
}

// Utility component for inline code
export function InlineCode({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <code className={cn(
      "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
      "before:absolute before:inset-0 before:rounded before:bg-gradient-to-r before:from-blue-500/10 before:to-purple-500/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity",
      className
    )}>
      {children}
    </code>
  )
}

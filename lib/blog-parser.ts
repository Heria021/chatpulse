import { BlogContentSection, BlogCodeBlock } from "./types/blog"

// Parse legacy markdown-like content into rich content sections
export function parseLegacyContent(content: string): BlogContentSection[] {
  const sections: BlogContentSection[] = []
  const lines = content.split('\n')
  let currentSection: Partial<BlogContentSection> | null = null
  let order = 0

  const generateId = () => `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  const finishCurrentSection = () => {
    if (currentSection && currentSection.content?.trim()) {
      sections.push({
        id: generateId(),
        type: currentSection.type!,
        content: currentSection.content.trim(),
        order: order++,
        ...currentSection
      })
    }
    currentSection = null
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmedLine = line.trim()

    // Skip empty lines
    if (!trimmedLine) {
      if (currentSection?.type === 'paragraph') {
        finishCurrentSection()
      }
      continue
    }

    // Detect headings
    if (trimmedLine.startsWith('#')) {
      finishCurrentSection()
      const level = trimmedLine.match(/^#+/)?.[0].length || 1
      const content = trimmedLine.replace(/^#+\s*/, '')
      
      currentSection = {
        type: level <= 2 ? 'heading' : 'subheading',
        content,
        level
      }
      finishCurrentSection()
      continue
    }

    // Detect code blocks
    if (trimmedLine.startsWith('```')) {
      finishCurrentSection()
      const language = trimmedLine.replace('```', '').trim() || 'text'
      const codeLines: string[] = []
      
      // Collect code lines
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }

      const codeBlock: BlogCodeBlock = {
        language,
        code: codeLines.join('\n'),
        showLineNumbers: true
      }

      sections.push({
        id: generateId(),
        type: 'code',
        content: `Code block (${language})`,
        codeBlock,
        order: order++
      })
      continue
    }

    // Detect quotes
    if (trimmedLine.startsWith('>')) {
      finishCurrentSection()
      const content = trimmedLine.replace(/^>\s*/, '')
      
      currentSection = {
        type: 'quote',
        content
      }
      finishCurrentSection()
      continue
    }

    // Detect lists
    if (trimmedLine.match(/^[-*+]\s/) || trimmedLine.match(/^\d+\.\s/)) {
      if (currentSection?.type !== 'list') {
        finishCurrentSection()
        currentSection = {
          type: 'list',
          content: '',
          listItems: [],
          listType: trimmedLine.match(/^\d+\.\s/) ? 'ordered' : 'unordered'
        }
      }
      
      const item = trimmedLine.replace(/^[-*+\d+\.]\s*/, '')
      currentSection.listItems = currentSection.listItems || []
      currentSection.listItems.push(item)
      continue
    }

    // Regular paragraph
    if (currentSection?.type === 'list') {
      finishCurrentSection()
    }

    if (currentSection?.type !== 'paragraph') {
      finishCurrentSection()
      currentSection = {
        type: 'paragraph',
        content: trimmedLine
      }
    } else {
      currentSection.content += ' ' + trimmedLine
    }
  }

  // Finish the last section
  finishCurrentSection()

  return sections
}

// Convert rich content sections back to markdown (for editing)
export function sectionsToMarkdown(sections: BlogContentSection[]): string {
  const sortedSections = sections.sort((a, b) => a.order - b.order)
  const lines: string[] = []

  for (const section of sortedSections) {
    switch (section.type) {
      case 'heading':
      case 'subheading':
        const level = section.level || (section.type === 'heading' ? 1 : 3)
        lines.push('#'.repeat(level) + ' ' + section.content)
        lines.push('')
        break

      case 'paragraph':
        lines.push(section.content)
        lines.push('')
        break

      case 'code':
        if (section.codeBlock) {
          lines.push('```' + section.codeBlock.language)
          lines.push(section.codeBlock.code)
          lines.push('```')
          lines.push('')
        }
        break

      case 'quote':
        lines.push('> ' + section.content)
        lines.push('')
        break

      case 'list':
        if (section.listItems) {
          section.listItems.forEach((item, index) => {
            const prefix = section.listType === 'ordered' ? `${index + 1}. ` : '- '
            lines.push(prefix + item)
          })
          lines.push('')
        }
        break

      case 'image':
        if (section.imageUrl) {
          lines.push(`![${section.imageAlt || section.content}](${section.imageUrl})`)
          if (section.content && section.content !== section.imageAlt) {
            lines.push(`*${section.content}*`)
          }
          lines.push('')
        }
        break
    }
  }

  return lines.join('\n').trim()
}

// Estimate reading time based on content sections
export function calculateReadingTime(sections: BlogContentSection[]): number {
  const wordsPerMinute = 200
  let totalWords = 0

  for (const section of sections) {
    switch (section.type) {
      case 'heading':
      case 'subheading':
      case 'paragraph':
      case 'quote':
        totalWords += section.content.split(/\s+/).length
        break

      case 'code':
        // Code blocks take longer to read
        if (section.codeBlock) {
          const codeWords = section.codeBlock.code.split(/\s+/).length
          totalWords += Math.ceil(codeWords * 1.5) // 50% more time for code
        }
        break

      case 'list':
        if (section.listItems) {
          totalWords += section.listItems.join(' ').split(/\s+/).length
        }
        break

      case 'image':
        // Images add some reading time
        totalWords += 10
        if (section.content) {
          totalWords += section.content.split(/\s+/).length
        }
        break
    }
  }

  return Math.max(1, Math.ceil(totalWords / wordsPerMinute))
}

// Validate content sections
export function validateContentSections(sections: BlogContentSection[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  for (const section of sections) {
    if (!section.id) {
      errors.push('Section missing ID')
    }

    if (!section.type) {
      errors.push('Section missing type')
    }

    if (section.type === 'code' && !section.codeBlock) {
      errors.push('Code section missing code block data')
    }

    if (section.type === 'image' && !section.imageUrl) {
      errors.push('Image section missing image URL')
    }

    if (section.type === 'list' && (!section.listItems || section.listItems.length === 0)) {
      errors.push('List section missing list items')
    }

    if ((section.type === 'heading' || section.type === 'subheading') && section.level && (section.level < 1 || section.level > 6)) {
      errors.push('Invalid heading level (must be 1-6)')
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

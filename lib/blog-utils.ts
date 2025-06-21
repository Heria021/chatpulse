// Format date for display
export function formatBlogDate(timestamp: number, format: 'short' | 'long' | 'relative' = 'long'): string {
  const date = new Date(timestamp)
  const now = new Date()

  switch (format) {
    case 'short':
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })

    case 'relative':
      const diffMs = now.getTime() - date.getTime()
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diffDays === 0) return 'Today'
      if (diffDays === 1) return 'Yesterday'
      if (diffDays < 7) return `${diffDays} days ago`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
      return `${Math.floor(diffDays / 365)} years ago`

    case 'long':
    default:
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
  }
}



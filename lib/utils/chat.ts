/**
 * Chat utility functions
 */

/**
 * Generate avatar initials from a name
 */
export function getAvatarInitials(name: string): string {
  if (!name || typeof name !== 'string') return '?';
  
  const words = name.trim().split(/\s+/);
  
  if (words.length === 1) {
    // Single word - take first two characters
    return words[0].substring(0, 2).toUpperCase();
  } else {
    // Multiple words - take first character of first two words
    return words
      .slice(0, 2)
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  }
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  // Less than 1 minute
  if (diff < 60 * 1000) {
    return 'now';
  }
  
  // Less than 1 hour
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes}m`;
  }
  
  // Less than 24 hours
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours}h`;
  }
  
  // Less than 7 days
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days}d`;
  }
  
  // More than 7 days - show date
  const date = new Date(timestamp);
  const today = new Date();
  
  // Same year - show month and day
  if (date.getFullYear() === today.getFullYear()) {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
  
  // Different year - show month, day, and year
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Format timestamp for detailed display (e.g., in message headers)
 */
export function formatDetailedTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  
  // Today - show time only
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
  
  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday ${date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })}`;
  }
  
  // This week
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  if (date > weekAgo) {
    return `${date.toLocaleDateString('en-US', { weekday: 'long' })} ${date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })}`;
  }
  
  // Older - show full date and time
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Truncate text to a specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Check if a message is from today
 */
export function isToday(timestamp: number): boolean {
  const date = new Date(timestamp);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

/**
 * Check if a message is from yesterday
 */
export function isYesterday(timestamp: number): boolean {
  const date = new Date(timestamp);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
}

/**
 * Get relative time string (e.g., "2 minutes ago", "1 hour ago")
 */
export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  if (diff < 60 * 1000) {
    return 'just now';
  }
  
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }
  
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }
  
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }
  
  const weeks = Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
  if (weeks < 4) {
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  }
  
  const months = Math.floor(diff / (30 * 24 * 60 * 60 * 1000));
  if (months < 12) {
    return `${months} month${months === 1 ? '' : 's'} ago`;
  }
  
  const years = Math.floor(diff / (365 * 24 * 60 * 60 * 1000));
  return `${years} year${years === 1 ? '' : 's'} ago`;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Get file type from MIME type
 */
export function getFileType(mimeType: string): 'image' | 'video' | 'audio' | 'document' | 'other' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
  return 'other';
}

/**
 * Check if a file is an image
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * Check if a file is a video
 */
export function isVideoFile(mimeType: string): boolean {
  return mimeType.startsWith('video/');
}

/**
 * Validate message content
 */
export function validateMessageContent(content: string): { isValid: boolean; error?: string } {
  if (!content || typeof content !== 'string') {
    return { isValid: false, error: 'Message content is required' };
  }
  
  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return { isValid: false, error: 'Message cannot be empty' };
  }
  
  if (trimmed.length > 2000) {
    return { isValid: false, error: 'Message is too long (max 2000 characters)' };
  }
  
  return { isValid: true };
}

/**
 * Extract mentions from message content
 */
export function extractMentions(content: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;
  
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }
  
  return mentions;
}

/**
 * Highlight mentions in message content
 */
export function highlightMentions(content: string): string {
  return content.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
}

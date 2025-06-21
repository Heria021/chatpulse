"use client";

import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface Mention {
  userId: Id<"users">;
  username: string;
  startIndex: number;
  endIndex: number;
}

interface MessageContentProps {
  content: string;
  mentions?: Mention[];
  isOwn: boolean;
  className?: string;
}

export function MessageContent({ content, mentions, isOwn, className }: MessageContentProps) {
  // If no mentions, return plain content
  if (!mentions || mentions.length === 0) {
    return <span className={className}>{content}</span>;
  }

  // Sort mentions by start index to process them in order
  const sortedMentions = [...mentions].sort((a, b) => a.startIndex - b.startIndex);
  
  const parts = [];
  let lastIndex = 0;

  for (const mention of sortedMentions) {
    // Add text before mention
    if (mention.startIndex > lastIndex) {
      parts.push(content.substring(lastIndex, mention.startIndex));
    }

    // Add mention with highlighting
    const mentionText = content.substring(mention.startIndex, mention.endIndex);
    parts.push(
      <span
        key={`mention-${mention.userId}-${mention.startIndex}`}
        className={cn(
          "font-medium px-1 py-0.5 rounded text-xs",
          isOwn
            ? "bg-primary-foreground/20 text-primary-foreground"
            : "bg-primary/10 text-primary"
        )}
        title={`Mentioned user: ${mention.username}`}
      >
        {mentionText}
      </span>
    );

    lastIndex = mention.endIndex;
  }

  // Add remaining text after last mention
  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex));
  }

  return <span className={className}>{parts}</span>;
}

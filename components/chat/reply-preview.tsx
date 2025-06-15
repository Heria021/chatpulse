"use client";

import { FileText, Image as ImageIcon, Video, Music, Archive, File } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReplyPreviewProps {
  replyToMessage: {
    _id: string;
    content: string;
    type: "text" | "image" | "file" | "system";
    senderUsername: string;
    fileName?: string;
    fileMimeType?: string;
  };
  isOwn: boolean;
  className?: string;
}

// Helper function to get file type icon
function getFileIcon(mimeType: string, fileName: string) {
  const extension = fileName?.split('.').pop()?.toLowerCase() || '';
  
  if (mimeType?.startsWith('image/')) {
    return ImageIcon;
  }
  
  if (mimeType?.startsWith('video/')) {
    return Video;
  }
  
  if (mimeType?.startsWith('audio/')) {
    return Music;
  }
  
  if (mimeType === 'application/pdf') {
    return FileText;
  }
  
  if (mimeType?.includes('zip') || mimeType?.includes('rar') || mimeType?.includes('archive')) {
    return Archive;
  }
  
  if (mimeType?.includes('document') || mimeType?.includes('word') || 
      ['doc', 'docx', 'txt', 'rtf'].includes(extension)) {
    return FileText;
  }
  
  return File;
}

// Helper function to get reply content preview
function getReplyPreview(message: ReplyPreviewProps['replyToMessage']) {
  if (message.type === 'image') {
    return message.fileName ? `📷 ${message.fileName}` : '📷 Image';
  }
  
  if (message.type === 'file') {
    return message.fileName ? `📎 ${message.fileName}` : '📎 File';
  }
  
  // For text messages, truncate if too long
  if (message.content) {
    return message.content.length > 50 
      ? `${message.content.substring(0, 50)}...` 
      : message.content;
  }
  
  return 'Message';
}

export function ReplyPreview({ replyToMessage, isOwn, className }: ReplyPreviewProps) {
  const FileIcon = getFileIcon(replyToMessage.fileMimeType || '', replyToMessage.fileName || '');
  const previewText = getReplyPreview(replyToMessage);
  
  return (
    <div className={cn(
      "text-xs mb-2 p-2 rounded border-l-2 relative",
      isOwn
        ? "bg-primary-foreground/10 border-primary-foreground/30"
        : "bg-background border-border",
      className
    )}>
      {/* Reply indicator line */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-0.5 rounded-full",
        isOwn ? "bg-primary-foreground/30" : "bg-primary/30"
      )} />
      
      <div className="pl-1">
        {/* Sender name */}
        <p className={cn(
          "font-medium mb-1",
          isOwn ? "text-primary-foreground/80" : "text-foreground/80"
        )}>
          {replyToMessage.senderUsername}
        </p>
        
        {/* Message preview */}
        <div className="flex items-center space-x-1">
          {/* File icon for file messages */}
          {(replyToMessage.type === 'image' || replyToMessage.type === 'file') && (
            <FileIcon className={cn(
              "h-3 w-3 flex-shrink-0",
              isOwn ? "text-primary-foreground/60" : "text-muted-foreground"
            )} />
          )}
          
          {/* Preview text */}
          <p className={cn(
            "truncate",
            isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
          )}>
            {previewText}
          </p>
        </div>
      </div>
    </div>
  );
}

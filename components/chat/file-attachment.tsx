"use client";

import { useState } from "react";
import { Download, FileText, Image as ImageIcon, Video, Music, Archive, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface FileAttachmentProps {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileMimeType: string;
  isOwn: boolean;
  className?: string;
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper function to get file type and icon
function getFileTypeInfo(mimeType: string, fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  if (mimeType.startsWith('image/')) {
    return { type: 'image', icon: ImageIcon, color: 'text-green-600' };
  }
  
  if (mimeType.startsWith('video/')) {
    return { type: 'video', icon: Video, color: 'text-red-600' };
  }
  
  if (mimeType.startsWith('audio/')) {
    return { type: 'audio', icon: Music, color: 'text-purple-600' };
  }
  
  if (mimeType === 'application/pdf') {
    return { type: 'pdf', icon: FileText, color: 'text-red-500' };
  }
  
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) {
    return { type: 'archive', icon: Archive, color: 'text-orange-600' };
  }
  
  if (mimeType.includes('document') || mimeType.includes('word') || 
      ['doc', 'docx', 'txt', 'rtf'].includes(extension)) {
    return { type: 'document', icon: FileText, color: 'text-blue-600' };
  }
  
  return { type: 'file', icon: File, color: 'text-gray-600' };
}

export function FileAttachment({
  fileUrl,
  fileName,
  fileSize,
  fileMimeType,
  isOwn,
  className
}: FileAttachmentProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const { type, icon: Icon, color } = getFileTypeInfo(fileMimeType, fileName);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // For images, show preview
  if (type === 'image') {
    return (
      <div className={cn("max-w-xs lg:max-w-sm", className)}>
        <div className="relative group">
          {/* Skeleton loading */}
          {imageLoading && !imageError && (
            <Skeleton className="rounded-lg h-64 w-full" />
          )}

          {/* Image */}
          <img
            src={fileUrl}
            alt={fileName}
            className={cn(
              "rounded-lg max-h-64 w-auto object-cover cursor-pointer transition-opacity",
              imageLoading ? "opacity-0 absolute inset-0" : "opacity-100"
            )}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
            }}
            onClick={() => !imageLoading && !imageError && window.open(fileUrl, '_blank')}
          />

          {/* Error state */}
          {imageError && (
            <div className="rounded-lg h-64 w-full bg-muted flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Failed to load image</p>
              </div>
            </div>
          )}

          {/* Image details overlay at bottom */}
          {!imageLoading && !imageError && (
            <>
              {/* Hover overlay with download button */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                <Button
                  variant="secondary"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>

              {/* Details overlay at bottom with thin padding */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent rounded-b-lg px-2 py-1">
                <p className="text-white text-xs truncate font-medium">
                  {fileName}
                </p>
                <p className="text-white/80 text-xs">
                  {formatFileSize(fileSize)}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // For other files, show file info with download button
  return (
    <div className={cn(
      "flex items-center space-x-3 p-2 rounded-lg border max-w-xs lg:max-w-sm",
      isOwn
        ? "bg-primary-foreground/10 border-primary-foreground/20"
        : "bg-background border-border",
      className
    )}>
      <div className={cn("flex-shrink-0", color)}>
        <Icon className="h-8 w-8" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium truncate",
          isOwn ? "text-primary-foreground" : "text-foreground"
        )}>
          {fileName}
        </p>
        <p className={cn(
          "text-xs",
          isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
        )}>
          {formatFileSize(fileSize)}
        </p>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDownload}
        className={cn(
          "h-8 w-8 flex-shrink-0",
          isOwn 
            ? "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );
}

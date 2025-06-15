"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { Send, Paperclip, Smile, Loader2, X, FileText, Image as ImageIcon, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { ChatConversation } from "@/lib/types/auth";
import { getSessionToken } from "@/lib/utils/auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  conversation: ChatConversation;
  onSendMessage: () => void;
  onTyping: () => void;
  isSending: boolean;
  replyToMessage?: {
    _id: string;
    content: string;
    type: "text" | "image" | "file" | "system";
    senderUsername: string;
    fileName?: string;
    fileMimeType?: string;
  } | null;
  onCancelReply?: () => void;
  className?: string;
}

interface FilePreview {
  file: File;
  preview?: string;
  type: 'image' | 'file';
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper function to check if file is an image
function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

export function MessageInput({
  conversation,
  onSendMessage,
  onTyping,
  isSending,
  replyToMessage,
  onCancelReply,
  className
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [filePreview, setFilePreview] = useState<FilePreview | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sessionToken = getSessionToken();

  // Mutations
  const generateUploadUrl = useMutation(api.chat.generateUploadUrl);
  const sendMessageMutation = useMutation(api.chat.sendMessage);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File size too large (max 50MB)");
      return;
    }

    // Create preview
    const preview: FilePreview = {
      file,
      type: isImageFile(file) ? 'image' : 'file'
    };

    // Generate preview URL for images
    if (preview.type === 'image') {
      preview.preview = URL.createObjectURL(file);
    }

    setFilePreview(preview);
    
    // Clear the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = () => {
    if (filePreview?.preview) {
      URL.revokeObjectURL(filePreview.preview);
    }
    setFilePreview(null);
  };

  const handleSendMessage = async () => {
    if (!sessionToken || isSending || isUploading) return;
    
    const hasText = message.trim();
    const hasFile = filePreview;
    
    if (!hasText && !hasFile) return;

    try {
      setIsUploading(true);
      
      let fileData = null;
      
      // Upload file if present
      if (hasFile) {
        // Step 1: Get upload URL
        const uploadUrl = await generateUploadUrl({ sessionToken });
        
        // Step 2: Upload file
        const uploadResponse = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": hasFile.file.type },
          body: hasFile.file,
        });
        
        if (!uploadResponse.ok) {
          throw new Error("Failed to upload file");
        }
        
        const { storageId } = await uploadResponse.json();
        
        fileData = {
          storageId,
          fileName: hasFile.file.name,
          fileSize: hasFile.file.size,
          fileMimeType: hasFile.file.type
        };
      }
      
      // Step 3: Send message
      await sendMessageMutation({
        sessionToken,
        conversationId: conversation.conversationId,
        content: hasText ? message.trim() : (hasFile ? `Sent ${hasFile.file.name}` : ""),
        type: hasFile ? (hasFile.type === 'image' ? 'image' : 'file') : 'text',
        replyToMessageId: replyToMessage?._id,
        ...fileData
      });

      // Clear inputs
      setMessage("");
      handleRemoveFile();
      if (onCancelReply) {
        onCancelReply();
      }
      onSendMessage();
      
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send message");
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isDisabled = isSending || isUploading;
  const canSend = (message.trim() || filePreview) && !isDisabled;

  return (
    <div className={cn("border-t border-border bg-card", className)}>
      {/* Reply Preview */}
      {replyToMessage && (
        <div className="px-3 lg:px-4 pt-3 lg:pt-4 pb-2">
          <div className="flex items-start space-x-2 p-2 bg-muted/50 rounded-lg border-l-2 border-primary/30">
            <Reply className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground/80 mb-1">
                Replying to {replyToMessage.senderUsername}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {replyToMessage.type === 'image' ? '📷 Image' :
                 replyToMessage.type === 'file' ? `📎 ${replyToMessage.fileName || 'File'}` :
                 replyToMessage.content}
              </p>
            </div>
            {onCancelReply && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onCancelReply}
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="p-3 lg:p-4">
        {/* File Preview */}
        {filePreview && (
        <div className="mb-3 p-3 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {filePreview.type === 'image' && filePreview.preview ? (
                <div className="relative">
                  <img 
                    src={filePreview.preview} 
                    alt="Preview" 
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="absolute inset-0 bg-black/20 rounded flex items-center justify-center">
                    <ImageIcon className="h-4 w-4 text-white" />
                  </div>
                </div>
              ) : (
                <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{filePreview.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(filePreview.file.size)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemoveFile}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        )}

        {/* Input Area */}
      <div className="flex items-center space-x-2">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
        />
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 lg:h-10 lg:w-10"
          onClick={() => fileInputRef.current?.click()}
          disabled={isDisabled}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        <div className="flex-1 relative">
          <Input
            placeholder={`Message ${conversation.otherUser.username}...`}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (e.target.value.trim()) {
                onTyping();
              }
            }}
            onKeyDown={handleKeyDown}
            className="pr-10 h-9 lg:h-10"
            disabled={isDisabled}
            maxLength={2000}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 lg:h-8 lg:w-8 hidden lg:flex"
            disabled
          >
            <Smile className="h-4 w-4" />
          </Button>
        </div>

        <Button
          onClick={handleSendMessage}
          disabled={!canSend}
          size="icon"
          className="h-9 w-9 lg:h-10 lg:w-10"
        >
          {isDisabled ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

        {/* Character count */}
        {message.length > 1800 && (
          <div className="text-xs text-muted-foreground mt-2 text-right">
            {message.length}/2000 characters
          </div>
        )}
      </div>
    </div>
  );
}

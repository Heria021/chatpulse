"use client";

import { forwardRef } from "react";
import { Send, Check, CheckCheck, Clock } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatMessage, ChatConversation } from "@/lib/types/auth";
import { User } from "@/lib/types/auth";
import { FileAttachment } from "./file-attachment";
import { ReplyPreview } from "./reply-preview";
import { MessageContent } from "./message-content";

// Helper function to format timestamp
function formatMessageTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isYesterday) {
      return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  }
}

// Helper function to generate avatar initials
function getAvatarInitials(username: string): string {
  return username
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Helper function to get message status
function getMessageStatus(message: ChatMessage, currentUserId: string, isSending?: boolean) {
  if (!message.isOwn) return null;

  // If message is currently being sent
  if (isSending) {
    return 'sending'; // Clock icon
  }

  // Check if message has been read by other participants (excluding sender)
  const readByOthers = message.readBy.filter(read => read.userId !== currentUserId);

  if (readByOthers.length > 0) {
    return 'seen'; // Double check, blue
  } else {
    return 'sent'; // Single check, gray
  }
}

// Typing indicator component
function TypingIndicator({ username }: { username: string }) {
  return (
    <div className="flex justify-start">
      <div className="flex items-end space-x-1.5 lg:space-x-2 max-w-xs lg:max-w-md">
        <Avatar className="h-5 w-5 lg:h-6 lg:w-6 mb-1">
          <AvatarFallback className="bg-muted text-muted-foreground text-xs">
            {getAvatarInitials(username)}
          </AvatarFallback>
        </Avatar>
        <div className="bg-muted px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg rounded-bl-sm">
          <div className="flex items-center space-x-1">
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Message skeleton component
function MessageSkeleton({ isOwn = false }: { isOwn?: boolean }) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div className="flex items-end space-x-1.5 lg:space-x-2 max-w-xs lg:max-w-md">
        {!isOwn && (
          <Skeleton className="h-5 w-5 lg:h-6 lg:w-6 rounded-full mb-1" />
        )}
        <div className="space-y-1">
          <Skeleton className={`h-10 lg:h-12 rounded-lg ${isOwn ? 'w-32 lg:w-40' : 'w-28 lg:w-36'}`} />
          <Skeleton className="h-3 w-12 lg:w-16" />
        </div>
      </div>
    </div>
  );
}

// Messages skeleton component
function MessagesSkeleton() {
  return (
    <div className="space-y-3 lg:space-y-4">
      <MessageSkeleton isOwn={false} />
      <MessageSkeleton isOwn={true} />
      <MessageSkeleton isOwn={false} />
      <MessageSkeleton isOwn={true} />
      <MessageSkeleton isOwn={false} />
    </div>
  );
}

// File attachment skeleton component
function FileAttachmentSkeleton({ isOwn = false }: { isOwn?: boolean }) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div className="flex items-end space-x-1.5 lg:space-x-2 max-w-xs lg:max-w-md">
        {!isOwn && (
          <Skeleton className="h-5 w-5 lg:h-6 lg:w-6 rounded-full mb-1" />
        )}
        <div className="space-y-2">
          {/* File preview skeleton */}
          <Skeleton className="h-32 w-48 lg:h-40 lg:w-56 rounded-lg" />
          {/* File info skeleton */}
          <div className="space-y-1">
            <Skeleton className="h-3 w-32 lg:w-40" />
            <Skeleton className="h-3 w-16 lg:w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface MessageAreaProps {
  messages: ChatMessage[] | undefined;
  conversation: ChatConversation;
  user: User | null;
  typingIndicators?: Array<{ userId: string; username: string }>;
  onReplyToMessage?: (message: ChatMessage) => void;
  className?: string;
}

export const MessageArea = forwardRef<HTMLDivElement, MessageAreaProps>(
  ({ messages, conversation, user, typingIndicators, onReplyToMessage, className }, ref) => {
    return (
      <div className={`flex-1 overflow-y-auto p-3 lg:p-4 space-y-3 lg:space-y-4 ${className || ''}`}>
        {messages === undefined ? (
          <MessagesSkeleton />
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Start the conversation</h3>
              <p className="text-sm text-muted-foreground">
                Send a message to {conversation.otherUser.username} to get started
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg: ChatMessage) => (
              <div
                key={msg._id}
                className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
              >
                <div className="flex items-end space-x-1.5 lg:space-x-2 max-w-xs lg:max-w-md">
                  {!msg.isOwn && (
                    <Avatar className="h-5 w-5 lg:h-6 lg:w-6 mb-1">
                      <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                        {getAvatarInitials(msg.senderUsername)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`
                      px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg cursor-pointer select-none
                      ${msg.isOwn
                        ? "bg-primary text-primary-foreground rounded-br-sm hover:bg-primary/90"
                        : "bg-muted rounded-bl-sm hover:bg-muted/80"
                      }
                    `}
                    onDoubleClick={() => onReplyToMessage?.(msg)}
                    title="Double-click to reply"
                  >
                    {msg.replyToMessage && (
                      <ReplyPreview
                        replyToMessage={msg.replyToMessage}
                        isOwn={msg.isOwn}
                      />
                    )}

                    {/* File attachment */}
                    {(msg.type === 'image' || msg.type === 'file') && msg.fileUrl ? (
                      <div className="mb-2">
                        <FileAttachment
                          fileUrl={msg.fileUrl}
                          fileName={msg.fileName || 'Unknown file'}
                          fileSize={msg.fileSize || 0}
                          fileMimeType={msg.fileMimeType || 'application/octet-stream'}
                          isOwn={msg.isOwn}
                        />
                      </div>
                    ) : (msg.type === 'image' || msg.type === 'file') && !msg.fileUrl ? (
                      // Show skeleton while file is loading
                      <div className="mb-2">
                        <FileAttachmentSkeleton isOwn={msg.isOwn} />
                      </div>
                    ) : null}

                    {/* Text content - only show if it's not just the filename for file messages */}
                    {msg.content && !(
                      (msg.type === 'image' || msg.type === 'file') &&
                      msg.content === `Sent ${msg.fileName}`
                    ) && (
                      <MessageContent
                        content={msg.content}
                        mentions={(msg as any).mentions}
                        isOwn={msg.isOwn}
                        className="text-sm whitespace-pre-wrap break-words"
                      />
                    )}
                    
                    <div className="flex items-center justify-between mt-1">
                      <p className={`text-xs ${
                        msg.isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}>
                        {formatMessageTime(msg.createdAt)}
                      </p>
                      {msg.isOwn && user && (
                        <div className="flex items-center ml-2">
                          {(() => {
                            const status = getMessageStatus(msg, user._id, false);
                            if (status === 'seen') {
                              return (
                                <div className="flex items-center" title="Seen">
                                  <CheckCheck className="h-3.5 w-3.5 text-blue-500 drop-shadow-sm" />
                                </div>
                              );
                            } else if (status === 'sent') {
                              return (
                                <div className="flex items-center" title="Sent">
                                  <Check className="h-3.5 w-3.5 text-primary-foreground/70" />
                                </div>
                              );
                            } else if (status === 'sending') {
                              return (
                                <div className="flex items-center" title="Sending">
                                  <Clock className="h-3 w-3 text-primary-foreground/50 animate-pulse" />
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicators */}
            {typingIndicators && typingIndicators.length > 0 && (
              <div className="space-y-2">
                {typingIndicators.map((indicator) => (
                  <TypingIndicator key={indicator.userId} username={indicator.username} />
                ))}
              </div>
            )}

            <div ref={ref} />
          </>
        )}
      </div>
    );
  }
);

MessageArea.displayName = "MessageArea";

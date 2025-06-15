"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

import { useAuth } from "@/lib/contexts/auth-context";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ChatConversation } from "@/lib/types/auth";
import { getSessionToken } from "@/lib/utils/auth";
import { UserOptionsMenu } from "@/components/ui/user-options-menu";
import { MessageInput } from "./message-input";
import { MessageArea } from "./message-area";
import { useOnlineStatus, ACTIVITY_TYPES } from "@/lib/hooks/use-online-status";
import { AvatarStatusIndicator } from "@/components/ui/status-indicator";





// Helper functions for chat header
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

function getAvatarInitials(username: string): string {
  return username
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Chat header skeleton component
export function ChatHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between p-3 lg:p-4 border-b border-border bg-card">
      <div className="flex items-center space-x-2 lg:space-x-3">
        <div className="relative">
          <Skeleton className="h-8 w-8 lg:h-10 lg:w-10 rounded-full" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-4 w-24 lg:w-32" />
          <Skeleton className="h-3 w-16 lg:w-20" />
        </div>
      </div>
      <Skeleton className="h-7 w-7 lg:h-8 lg:w-8 rounded-md" />
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



interface ChatInterfaceProps {
  userId: string;
}

export function ChatInterface({ userId }: ChatInterfaceProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<{
    _id: Id<"messages">;
    content: string;
    type: "text" | "image" | "file" | "system";
    senderUsername: string;
    fileName?: string;
    fileMimeType?: string;
  } | null>(null);

  // Online status management
  const { trackActivity } = useOnlineStatus({
    enabled: true,
    heartbeatInterval: 30000 // 30 seconds
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isAuthenticated, user } = useAuth();

  // Get session token for API calls
  const sessionToken = getSessionToken();

  // Get or create conversation
  const conversationMutation = useMutation(api.chat.getOrCreateConversation);
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get messages
  const messages = useQuery(
    api.chat.getMessages,
    conversation && sessionToken && isAuthenticated
      ? { sessionToken, conversationId: conversation.conversationId }
      : "skip"
  );

  // Mutations
  const markAsReadMutation = useMutation(api.chat.markMessagesAsRead);

  // Typing indicator mutations
  const startTypingMutation = useMutation(api.chat.startTyping);
  const stopTypingMutation = useMutation(api.chat.stopTyping);



  // Get typing indicators
  const typingIndicators = useQuery(
    api.chat.getTypingIndicators,
    conversation && sessionToken && isAuthenticated
      ? { sessionToken, conversationId: conversation.conversationId }
      : "skip"
  );

  // Initialize conversation
  useEffect(() => {
    const initializeConversation = async () => {
      if (!sessionToken || !isAuthenticated) return;

      try {
        setIsLoading(true);
        setError(null);
        const result = await conversationMutation({
          sessionToken,
          otherUserId: userId as any
        });
        setConversation(result);
      } catch (error) {
        console.error("Failed to initialize conversation:", error);
        setError(error instanceof Error ? error.message : "Failed to load conversation");
      } finally {
        setIsLoading(false);
      }
    };

    initializeConversation();
  }, [userId, sessionToken, isAuthenticated]);

  // Mark messages as read when conversation loads or new messages arrive
  useEffect(() => {
    const markAsRead = async () => {
      if (conversation && sessionToken && messages && messages.length > 0 && user) {
        // Only mark as read if there are unread messages from others
        const hasUnreadFromOthers = messages.some(msg =>
          !msg.isOwn && !msg.readBy.some(read => read.userId === user._id)
        );

        if (hasUnreadFromOthers) {
          try {
            await markAsReadMutation({
              sessionToken,
              conversationId: conversation.conversationId
            });
          } catch (error) {
            console.error("Failed to mark messages as read:", error);
          }
        }
      }
    };

    // Delay marking as read to ensure user actually sees the messages
    const timeoutId = setTimeout(markAsRead, 1000);
    return () => clearTimeout(timeoutId);
  }, [conversation, messages, sessionToken, user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark messages as read when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && conversation && sessionToken && messages && user) {
        const hasUnreadFromOthers = messages.some(msg =>
          !msg.isOwn && !msg.readBy.some(read => read.userId === user._id)
        );

        if (hasUnreadFromOthers) {
          markAsReadMutation({
            sessionToken,
            conversationId: conversation.conversationId
          }).catch(error => {
            console.error("Failed to mark messages as read:", error);
          });
          // Track message reading activity (meaningful activity)
          trackActivity(ACTIVITY_TYPES.MESSAGE_READ);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [conversation, messages, sessionToken, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    // Track message sending activity (this is meaningful activity)
    trackActivity(ACTIVITY_TYPES.MESSAGE_SENT);
    scrollToBottom();
  };

  const handleReplyToMessage = (message: any) => {
    setReplyToMessage({
      _id: message._id,
      content: message.content,
      type: message.type,
      senderUsername: message.senderUsername,
      fileName: message.fileName,
      fileMimeType: message.fileMimeType
    });
  };

  const handleCancelReply = () => {
    setReplyToMessage(null);
  };

  // Handle typing indicator
  const handleTyping = async () => {
    if (!conversation || !sessionToken) return;

    try {
      // Start typing indicator
      if (!isTyping) {
        setIsTyping(true);
        await startTypingMutation({
          sessionToken,
          conversationId: conversation.conversationId
        });
        // Track typing activity
        trackActivity(ACTIVITY_TYPES.TYPING_STARTED);
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(async () => {
        setIsTyping(false);
        try {
          await stopTypingMutation({
            sessionToken,
            conversationId: conversation.conversationId
          });
        } catch (error) {
          console.error("Failed to stop typing indicator:", error);
        }
      }, 3000);
    } catch (error) {
      console.error("Failed to start typing indicator:", error);
    }
  };

  // Stop typing when component unmounts or conversation changes
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping && conversation && sessionToken) {
        stopTypingMutation({
          sessionToken,
          conversationId: conversation.conversationId
        }).catch(error => {
          console.error("Failed to stop typing indicator on cleanup:", error);
        });
      }
    };
  }, [conversation?.conversationId]);



  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <ChatHeaderSkeleton />
        <div className="flex-1 overflow-y-auto p-3 lg:p-4">
          <MessagesSkeleton />
        </div>
        <div className="p-3 lg:p-4 border-t border-border bg-card">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8 lg:h-10 lg:w-10 rounded-md hidden lg:block" />
            <Skeleton className="flex-1 h-9 lg:h-10 rounded-md" />
            <Skeleton className="h-9 w-9 lg:h-10 lg:w-10 rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Unable to load conversation</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // No conversation state
  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">User not found</h3>
          <p className="text-muted-foreground">The user you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3 lg:p-4 border-b border-border bg-card">
        <div className="flex items-center space-x-2 lg:space-x-3">
          <div className="relative">
            <Avatar className="h-8 w-8 lg:h-10 lg:w-10">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs lg:text-sm">
                {getAvatarInitials(conversation.otherUser.username)}
              </AvatarFallback>
            </Avatar>
            <AvatarStatusIndicator
              status={conversation.otherUser.currentStatus || (conversation.otherUser.isOnline ? "online" : "offline")}
              showOnlineStatus={conversation.otherUser.showOnlineStatus ?? true}
            />
          </div>
          <div>
            <h3 className="font-semibold text-sm lg:text-base">{conversation.otherUser.username}</h3>
            <p className="text-xs lg:text-sm text-muted-foreground">
              {(() => {
                const status = conversation.otherUser.currentStatus || (conversation.otherUser.isOnline ? "online" : "offline");
                if (status === "online" || status === "recently_active") {
                  return "Online";
                } else if (status === "away") {
                  return "Away";
                } else {
                  return `Last seen ${formatMessageTime(conversation.otherUser.lastSeen)}`;
                }
              })()}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <UserOptionsMenu
            userId={conversation.otherUser._id}
            username={conversation.otherUser.username}
            align="end"
            triggerClassName="h-7 w-7 lg:h-8 lg:w-8"
          />
        </div>
      </div>

      {/* Messages Area */}
      <MessageArea
        messages={messages}
        conversation={conversation}
        user={user}
        typingIndicators={typingIndicators}
        onReplyToMessage={handleReplyToMessage}
        ref={messagesEndRef}
      />

      {/* Message Input */}
      <MessageInput
        conversation={conversation}
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        isSending={false}
        replyToMessage={replyToMessage}
        onCancelReply={handleCancelReply}
      />


    </div>
  );
}

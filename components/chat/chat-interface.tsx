"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { Send, Paperclip, Smile, Loader2, AlertCircle, Check, CheckCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { useAuth } from "@/lib/contexts/auth-context";
import { api } from "@/convex/_generated/api";
import { ChatMessage, ChatConversation } from "@/lib/types/auth";
import { getSessionToken } from "@/lib/utils/auth";
import { toast } from "sonner";
import { UserOptionsMenu } from "@/components/ui/user-options-menu";

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

interface ChatInterfaceProps {
  userId: string;
}

export function ChatInterface({ userId }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sendingMessageId, setSendingMessageId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

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

  // Send message mutation
  const sendMessageMutation = useMutation(api.chat.sendMessage);
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
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [conversation, messages, sessionToken, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !conversation || !sessionToken || isSending) return;

    const tempMessageId = `temp-${Date.now()}`;

    try {
      setIsSending(true);
      setSendingMessageId(tempMessageId);

      // Stop typing indicator
      if (isTyping) {
        setIsTyping(false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        try {
          await stopTypingMutation({
            sessionToken,
            conversationId: conversation.conversationId
          });
        } catch (error) {
          console.error("Failed to stop typing indicator:", error);
        }
      }

      await sendMessageMutation({
        sessionToken,
        conversationId: conversation.conversationId,
        content: message.trim(),
        type: "text"
      });

      setMessage("");
      scrollToBottom();
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send message");
    } finally {
      setIsSending(false);
      setSendingMessageId(null);
    }
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
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading conversation...</p>
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
            {conversation.otherUser.isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 lg:-bottom-1 lg:-right-1 h-2.5 w-2.5 lg:h-3 lg:w-3 bg-green-500 border-2 border-background rounded-full" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-sm lg:text-base">{conversation.otherUser.username}</h3>
            <p className="text-xs lg:text-sm text-muted-foreground">
              {conversation.otherUser.isOnline
                ? "Online"
                : `Last seen ${formatMessageTime(conversation.otherUser.lastSeen)}`
              }
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
      <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-3 lg:space-y-4">
        {messages === undefined ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading messages...</p>
            </div>
          </div>
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
                      px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg
                      ${msg.isOwn
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted rounded-bl-sm"
                      }
                    `}
                  >
                    {msg.replyToMessageId && (
                      <div className={`text-xs mb-2 p-2 rounded border-l-2 ${
                        msg.isOwn
                          ? "bg-primary-foreground/10 border-primary-foreground/30"
                          : "bg-background border-border"
                      }`}>
                        <p className="opacity-70">Replying to message</p>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className={`text-xs ${
                        msg.isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}>
                        {formatMessageTime(msg.createdAt)}
                      </p>
                      {msg.isOwn && user && (
                        <div className="flex items-center ml-2">
                          {(() => {
                            const isCurrentlySending = sendingMessageId === msg._id;
                            const status = getMessageStatus(msg, user._id, isCurrentlySending);
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

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="p-3 lg:p-4 border-t border-border bg-card">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 lg:h-10 lg:w-10 hidden lg:flex" disabled>
            <Paperclip className="h-4 w-4" />
          </Button>

          <div className="flex-1 relative">
            <Input
              placeholder={`Message ${conversation.otherUser.username}...`}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (e.target.value.trim()) {
                  handleTyping();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="pr-10 h-9 lg:h-10"
              disabled={isSending}
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
            disabled={!message.trim() || isSending}
            size="icon"
            className="h-9 w-9 lg:h-10 lg:w-10"
          >
            {isSending ? (
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

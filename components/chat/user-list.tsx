"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { Search, Plus, MoreVertical, MessageCircle, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserOptionsMenu } from "@/components/ui/user-options-menu";
import { useAuth } from "@/lib/contexts/auth-context";
import { api } from "@/convex/_generated/api";
import { ActiveUser, ChatUser } from "@/lib/types/auth";
import { getSessionToken } from "@/lib/utils/auth";
import { useUnreadCounts } from "@/lib/hooks/use-unread-counts";


// Helper function to format timestamp
function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));

  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return `${weeks}w ago`;
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

export function UserList() {
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  // Get current selected user ID from pathname
  const selectedUserId = pathname.split('/')[2] || null;

  // Get session token for API calls
  const sessionToken = getSessionToken();

  // Fetch active users
  const activeUsers = useQuery(
    api.users.getActiveUsers,
    sessionToken && isAuthenticated
      ? { sessionToken, searchQuery: searchQuery || undefined }
      : "skip"
  );

  // Fetch users with mutual chats
  const chatUsers = useQuery(
    api.users.getUsersWithMutualChats,
    sessionToken && isAuthenticated
      ? { sessionToken, searchQuery: searchQuery || undefined }
      : "skip"
  );

  // Get unread counts from hook
  const { totalUnreadCount, usersWithNewMessages } = useUnreadCounts();



  const handleUserClick = (userId: string) => {
    router.push(`/chat/${userId}`);
  };

  // Loading state
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground">Please sign in to view users</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-card w-full overflow-hidden">
      {/* Header */}
      <div className="p-3 lg:p-3 p-2 border-b border-border">
        <div className="flex items-center justify-between mb-2 lg:mb-3">
          <h2 className="text-sm lg:text-base font-semibold">Messages</h2>
          <div className="flex items-center space-x-1 hidden lg:flex">
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Plus className="h-3 w-3" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>New Group</DropdownMenuItem>
                <DropdownMenuItem>Mark All as Read</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-7 lg:h-8 text-sm"
            autoFocus={false}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users" className="flex-1 flex flex-col min-h-0 w-full overflow-hidden">
        <div className="px-2 mt-1 lg:mt-2 flex-shrink-0">
          <TabsList className="grid w-full grid-cols-2 h-8 lg:h-9">
            <TabsTrigger value="users" className="flex items-center justify-center gap-1 text-xs px-1 data-[state=active]:bg-background">
              <Users className="h-3 w-3 flex-shrink-0" />
              <span className="truncate min-w-0">Users</span>
            </TabsTrigger>
            <TabsTrigger value="chats" className="flex items-center justify-center gap-1 text-xs px-1 data-[state=active]:bg-background">
              <MessageCircle className="h-3 w-3 flex-shrink-0" />
              <span className="truncate min-w-0">Chats</span>
              {totalUnreadCount > 0 && (
                <Badge variant="default" className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-xs">
                  {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Active Users Tab */}
        <TabsContent value="users" className="flex-1 overflow-hidden mt-2 data-[state=active]:flex data-[state=active]:flex-col">
          {activeUsers === undefined ? (
            <div className="flex items-center justify-center flex-1">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : activeUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center p-6">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No active users found</p>
              <p className="text-sm text-muted-foreground">Users will appear here when they're online</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <div className="space-y-0.5 lg:space-y-1 p-1">
                {activeUsers.map((user: ActiveUser) => (
                  <div
                    key={user._id}
                    className={`
                      flex items-center space-x-2 lg:space-x-2 space-x-1.5 p-1.5 lg:p-2 rounded-lg transition-colors group
                      ${selectedUserId === user._id
                        ? 'bg-secondary text-secondary-foreground'
                        : 'hover:bg-muted/50'
                      }
                    `}
                  >
                    {/* Avatar */}
                    <div
                      className="relative flex-shrink-0 cursor-pointer"
                      onClick={() => handleUserClick(user._id)}
                    >
                      <Avatar className="h-8 w-8 lg:h-10 lg:w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs lg:text-sm">
                          {getAvatarInitials(user.username)}
                        </AvatarFallback>
                      </Avatar>
                      {user.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 lg:h-3 lg:w-3 bg-green-500 border-2 border-background rounded-full" />
                      )}
                    </div>

                    {/* User Info */}
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => handleUserClick(user._id)}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate text-sm lg:text-base">{user.username}</p>
                        {user.unreadCount > 0 && (
                          <Badge variant="default" className="ml-2 h-4 w-4 lg:h-5 lg:w-5 p-0 flex items-center justify-center text-xs flex-shrink-0">
                            {user.unreadCount > 99 ? '99+' : user.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs lg:text-sm text-muted-foreground truncate">
                        {user.bio || `${user.age} years old, ${user.gender}`}
                      </p>
                    </div>

                    {/* Options Menu */}
                    <div className="flex-shrink-0">
                      <UserOptionsMenu
                        userId={user._id}
                        username={user.username}
                        triggerClassName="h-7 w-7 lg:h-8 lg:w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        align="end"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Chat History Tab */}
        <TabsContent value="chats" className="flex-1 overflow-hidden mt-2 data-[state=active]:flex data-[state=active]:flex-col">
          {chatUsers === undefined ? (
            <div className="flex items-center justify-center flex-1">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : chatUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center p-6">
              <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No conversations found</p>
              <p className="text-sm text-muted-foreground">Start a new chat to get started</p>
            </div>
          ) : (
            <>
              {/* Chat Summary */}
              {usersWithNewMessages > 0 && (
                <div className="px-3 py-2 bg-muted/30 border-b">
                  <p className="text-xs text-muted-foreground">
                    {usersWithNewMessages} {usersWithNewMessages === 1 ? 'person has' : 'people have'} sent new messages
                  </p>
                </div>
              )}
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="space-y-0.5 lg:space-y-1 p-1">
                  {chatUsers.map((user: ChatUser) => (
                  <div
                    key={user._id}
                    className={`
                      flex items-center space-x-2 lg:space-x-2 space-x-1.5 p-1.5 lg:p-2 rounded-lg transition-colors group
                      ${selectedUserId === user._id
                        ? 'bg-secondary text-secondary-foreground'
                        : 'hover:bg-muted/50'
                      }
                    `}
                  >
                    {/* Avatar */}
                    <div
                      className="relative flex-shrink-0 cursor-pointer"
                      onClick={() => handleUserClick(user._id)}
                    >
                      <Avatar className="h-8 w-8 lg:h-10 lg:w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs lg:text-sm">
                          {getAvatarInitials(user.username)}
                        </AvatarFallback>
                      </Avatar>
                      {user.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 lg:h-3 lg:w-3 bg-green-500 border-2 border-background rounded-full" />
                      )}
                    </div>

                    {/* User Info */}
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => handleUserClick(user._id)}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate text-sm lg:text-base">{user.username}</p>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {formatTimestamp(user.lastMessageAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs lg:text-sm text-muted-foreground truncate">
                          {user.lastMessage?.content || "No messages yet"}
                        </p>
                        {user.unreadCount > 0 && (
                          <Badge variant="default" className="ml-2 h-4 w-4 lg:h-5 lg:w-5 p-0 flex items-center justify-center text-xs flex-shrink-0">
                            {user.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Options Menu */}
                    <div className="flex-shrink-0">
                      <UserOptionsMenu
                        userId={user._id}
                        username={user.username}
                        triggerClassName="h-7 w-7 lg:h-8 lg:w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        align="end"
                      />
                    </div>
                  </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

    </div>
  );
}

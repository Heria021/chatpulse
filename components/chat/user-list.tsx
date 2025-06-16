"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { Search, Plus, MoreVertical, MessageCircle, Users, Filter, ChevronDown, ChevronUp } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserOptionsMenu } from "@/components/ui/user-options-menu";
import { AvatarStatusIndicator } from "@/components/ui/status-indicator";
import { useAuth } from "@/lib/contexts/auth-context";
import { api } from "@/convex/_generated/api";
import { ActiveUser, ChatUser } from "@/lib/types/auth";
import { getSessionToken } from "@/lib/utils/auth";
import { useUnreadCounts } from "@/lib/hooks/use-unread-counts";
import { UserListTabSkeleton } from "@/components/ui/skeletons";


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

interface UserListProps {
  onClose?: () => void;
  skipAuthCheck?: boolean; // Skip the internal auth check when controlled by parent
}

export function UserList({ onClose, skipAuthCheck = false }: UserListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<"all" | "male" | "female">("all");
  const [ageRangeFilter, setAgeRangeFilter] = useState<"all" | "18-25" | "26-35" | "36-45" | "46-55" | "56+">("all");
  const [showFilters, setShowFilters] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  // Get current selected user ID from pathname
  const selectedUserId = pathname.split('/')[2] || null;

  // Get session token for API calls
  const sessionToken = getSessionToken();

  // Fetch active users
  const activeUsers = useQuery(
    api.users.getActiveUsers,
    sessionToken && isAuthenticated
      ? {
          sessionToken,
          searchQuery: searchQuery || undefined,
          genderFilter: genderFilter !== "all" ? genderFilter : undefined,
          ageRangeFilter: ageRangeFilter !== "all" ? ageRangeFilter : undefined
        }
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
    // Close mobile user list when a user is selected
    onClose?.();
  };

  // Loading state - only show "please sign in" if we're not loading and not authenticated
  // Skip this check if the parent is controlling the auth state
  if (!skipAuthCheck && !isLoading && !isAuthenticated) {
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

        {/* Filters */}
        <div className="mt-3 lg:mt-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 hover:bg-muted/50 px-2 py-1 rounded-md transition-colors"
            >
              <Filter className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-foreground">Filters</span>
              {showFilters ? (
                <ChevronUp className="h-3 w-3 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              )}
              {(genderFilter !== "all" || ageRangeFilter !== "all") && (
                <div className="w-1.5 h-1.5 bg-primary rounded-full ml-1"></div>
              )}
            </button>
            {showFilters && (genderFilter !== "all" || ageRangeFilter !== "all") && (
              <button
                onClick={() => {
                  setGenderFilter("all");
                  setAgeRangeFilter("all");
                }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted/50"
              >
                Clear all
              </button>
            )}
          </div>

          {showFilters && (
            <div className="mt-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-2 gap-2">
                {/* Gender Filter */}
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-medium">Gender</label>
                  <Select value={genderFilter} onValueChange={(value: "all" | "male" | "female") => setGenderFilter(value)}>
                    <SelectTrigger className="h-8 text-xs bg-background border-border hover:border-primary/50 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                          <span>All Genders</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="male">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span>Male</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="female">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                          <span>Female</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Age Range Filter */}
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-medium">Age Range</label>
                  <Select value={ageRangeFilter} onValueChange={(value: "all" | "18-25" | "26-35" | "36-45" | "46-55" | "56+") => setAgeRangeFilter(value)}>
                    <SelectTrigger className="h-8 text-xs bg-background border-border hover:border-primary/50 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                          <span>All Ages</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="18-25">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span>18-25</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="26-35">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                          <span>26-35</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="36-45">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                          <span>36-45</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="46-55">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <span>46-55</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="56+">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                          <span>56+</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active Filters Display */}
              {(genderFilter !== "all" || ageRangeFilter !== "all") && (
                <div className="flex items-center gap-1 mt-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">Active:</span>
                  {genderFilter !== "all" && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        genderFilter === "male" ? "bg-blue-500" : "bg-pink-500"
                      }`}></div>
                      <span className="capitalize">{genderFilter}</span>
                      <button
                        onClick={() => setGenderFilter("all")}
                        className="ml-1 hover:text-primary/70 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  {ageRangeFilter !== "all" && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        ageRangeFilter === "18-25" ? "bg-green-500" :
                        ageRangeFilter === "26-35" ? "bg-yellow-500" :
                        ageRangeFilter === "36-45" ? "bg-orange-500" :
                        ageRangeFilter === "46-55" ? "bg-red-500" : "bg-purple-500"
                      }`}></div>
                      <span>{ageRangeFilter}</span>
                      <button
                        onClick={() => setAgeRangeFilter("all")}
                        className="ml-1 hover:text-primary/70 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Quick Filter Summary when collapsed */}
          {!showFilters && (genderFilter !== "all" || ageRangeFilter !== "all") && (
            <div className="mt-2 flex items-center gap-1 flex-wrap">
              <span className="text-xs text-muted-foreground">Active:</span>
              {genderFilter !== "all" && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-primary/10 text-primary rounded text-xs">
                  <div className={`w-1 h-1 rounded-full ${
                    genderFilter === "male" ? "bg-blue-500" : "bg-pink-500"
                  }`}></div>
                  <span className="capitalize">{genderFilter}</span>
                </div>
              )}
              {ageRangeFilter !== "all" && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-primary/10 text-primary rounded text-xs">
                  <div className={`w-1 h-1 rounded-full ${
                    ageRangeFilter === "18-25" ? "bg-green-500" :
                    ageRangeFilter === "26-35" ? "bg-yellow-500" :
                    ageRangeFilter === "36-45" ? "bg-orange-500" :
                    ageRangeFilter === "46-55" ? "bg-red-500" : "bg-purple-500"
                  }`}></div>
                  <span>{ageRangeFilter}</span>
                </div>
              )}
            </div>
          )}
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
            <UserListTabSkeleton />
          ) : activeUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center p-6">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No active users found</p>
              <p className="text-sm text-muted-foreground">Users appear here when active within the last 5 minutes</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <div className="space-y-0.5 lg:space-y-1 p-1">
                {activeUsers.map((user: ActiveUser, index: number) => {
                  // Show section header if this is the first user in a new section
                  const showSectionHeader = user.section && (
                    index === 0 || activeUsers[index - 1]?.section !== user.section
                  );

                  return (
                    <div key={user._id}>
                      {showSectionHeader && (
                        <div className="px-2 py-1 mt-2 first:mt-0">
                          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            {user.section}
                          </h3>
                        </div>
                      )}
                      <div
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
                      <AvatarStatusIndicator
                        status={user.currentStatus}
                        showOnlineStatus={user.showOnlineStatus}
                      />
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
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Chat History Tab */}
        <TabsContent value="chats" className="flex-1 overflow-hidden mt-2 data-[state=active]:flex data-[state=active]:flex-col">
          {chatUsers === undefined ? (
            <UserListTabSkeleton />
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
                      <AvatarStatusIndicator
                        status={user.currentStatus || (user.isOnline ? "online" : "offline")}
                        showOnlineStatus={user.showOnlineStatus}
                      />
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

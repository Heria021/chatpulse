"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { Search, Plus, Users, Lock, Globe, Crown, Shield, UserCheck, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/contexts/auth-context";
import { getSessionToken } from "@/lib/utils/auth";
import { getAvatarInitials, formatTimestamp } from "@/lib/utils/chat";
import { CreateGroupDialog } from "./create-group-dialog";

interface GroupListProps {
  onClose?: () => void;
}

export function GroupList({ onClose }: GroupListProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"permanent" | "user_created">("permanent");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Get session token
  const sessionToken = getSessionToken();

  // Get current group ID from pathname
  const selectedGroupId = pathname.startsWith('/groups/') ? pathname.split('/')[2] : null;

  // Fetch groups
  const groups = useQuery(
    api.groups.getGroups,
    sessionToken && isAuthenticated
      ? {
          sessionToken,
          searchQuery: searchQuery || undefined,
          typeFilter: typeFilter
        }
      : "skip"
  );

  const handleGroupClick = (groupId: string) => {
    router.push(`/groups/${groupId}`);
    onClose?.();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "creator":
        return <Crown className="h-3 w-3 text-yellow-500" />;
      case "admin":
        return <Shield className="h-3 w-3 text-blue-500" />;
      case "moderator":
        return <UserCheck className="h-3 w-3 text-green-500" />;
      default:
        return null;
    }
  };

  const getGroupBadge = (group: any) => {
    if (group.type === "permanent") {
      return <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4">Official</Badge>;
    }
    return group.isPublic ?
      <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4">Public</Badge> :
      <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4">Private</Badge>;
  };

  // Separate groups into categories
  const myGroups = groups?.filter(group => group.membership?.status === "active") || [];
  const availableGroups = groups?.filter(group => !group.membership || group.membership.status !== "active") || [];

  if (!user) return null;

  return (
    <div className="flex flex-col h-full bg-card w-full overflow-hidden">
      {/* Header */}
      <div className="p-3 lg:p-3 p-2 border-b border-border">
        <div className="flex items-center justify-between mb-2 lg:mb-3">
          <h2 className="text-sm lg:text-base font-semibold">Groups</h2>
          <Button
            size="sm"
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-1 h-7 w-7 lg:h-8 lg:w-8 p-0 lg:p-2 lg:w-auto"
            disabled={user.hasCreatedGroup === true}
          >
            <Plus className="h-3 w-3 lg:h-4 lg:w-4" />
            <span className="hidden lg:inline ml-1">Create</span>
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-7 lg:h-8 text-sm"
            autoFocus={false}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={typeFilter} onValueChange={(value) => setTypeFilter(value as any)} className="flex-1 flex flex-col min-h-0 w-full overflow-hidden">
        <div className="px-2 mt-1 lg:mt-2 flex-shrink-0">
          <TabsList className="grid w-full grid-cols-2 h-8 lg:h-9">
            <TabsTrigger value="permanent" className="flex items-center justify-center gap-1 text-xs px-1 data-[state=active]:bg-background">
              <Users className="h-3 w-3 flex-shrink-0" />
              <span className="truncate min-w-0">Official</span>
            </TabsTrigger>
            <TabsTrigger value="user_created" className="flex items-center justify-center gap-1 text-xs px-1 data-[state=active]:bg-background">
              <Globe className="h-3 w-3 flex-shrink-0" />
              <span className="truncate min-w-0">Community</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Official Groups Tab */}
        <TabsContent value="permanent" className="flex-1 overflow-hidden mt-2 data-[state=active]:flex data-[state=active]:flex-col">
          {groups === undefined ? (
            <div className="flex items-center justify-center flex-1">
              <div className="text-center">
                <p className="text-muted-foreground">Loading groups...</p>
              </div>
            </div>
          ) : groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center p-6">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No official groups found</p>
              <p className="text-sm text-muted-foreground">Official groups will appear here</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <div className="space-y-0.5 lg:space-y-1 p-1">
                {/* My Groups */}
                {myGroups.length > 0 && (
                  <>
                    <div className="px-2 py-1 mt-2 first:mt-0">
                      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">My Groups</h3>
                    </div>
                    {myGroups.map((group) => (
                      <div
                        key={group._id}
                        className={`
                          flex items-center space-x-2 p-1.5 rounded-md transition-colors group cursor-pointer
                          ${selectedGroupId === group._id
                            ? 'bg-secondary text-secondary-foreground'
                            : 'hover:bg-muted/50'
                          }
                        `}
                        onClick={() => handleGroupClick(group._id)}
                      >
                        {/* Group Avatar */}
                        <div className="relative flex-shrink-0">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {getAvatarInitials(group.name)}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        {/* Group Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <p className="font-medium truncate text-sm">{group.name}</p>
                              {group.membership && getRoleIcon(group.membership.role)}
                            </div>
                            <div className="flex items-center gap-1.5">
                              {getGroupBadge(group)}
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                {group.lastMessageAt ? formatTimestamp(group.lastMessageAt) : ''}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground truncate">
                              {group.lastMessage?.content || `${group.memberCount} members`}
                            </p>
                            {group.unreadCount > 0 && (
                              <Badge variant="default" className="ml-2 h-4 w-4 lg:h-5 lg:w-5 p-0 flex items-center justify-center text-xs flex-shrink-0">
                                {group.unreadCount > 99 ? '99+' : group.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* Available Groups */}
                {availableGroups.length > 0 && (
                  <>
                    {myGroups.length > 0 && (
                      <div className="px-2 py-1 mt-4">
                        <Separator />
                      </div>
                    )}
                    <div className="px-2 py-1 mt-2">
                      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Official Groups</h3>
                    </div>
                    {availableGroups.map((group) => (
                      <div
                        key={group._id}
                        className="flex items-center space-x-2 p-1.5 rounded-md transition-colors group cursor-pointer hover:bg-muted/50"
                        onClick={() => handleGroupClick(group._id)}
                      >
                        {/* Group Avatar */}
                        <div className="relative flex-shrink-0">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                              {getAvatarInitials(group.name)}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        {/* Group Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate text-sm">{group.name}</p>
                            <div className="flex items-center gap-1.5">
                              {getGroupBadge(group)}
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                {group.memberCount} members
                              </span>
                            </div>
                          </div>
                          <p className="text-xs lg:text-sm text-muted-foreground truncate">
                            {group.description || "No description"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Community Groups Tab */}
        <TabsContent value="user_created" className="flex-1 overflow-hidden mt-2 data-[state=active]:flex data-[state=active]:flex-col">
          {groups === undefined ? (
            <div className="flex items-center justify-center flex-1">
              <div className="text-center">
                <p className="text-muted-foreground">Loading groups...</p>
              </div>
            </div>
          ) : groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center p-6">
              <Globe className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No community groups found</p>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery ? "Try a different search term" : "Create a group or browse available groups"}
              </p>
              {!searchQuery && (
                <Button
                  size="sm"
                  onClick={() => setShowCreateDialog(true)}
                  disabled={user.hasCreatedGroup === true}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create Group
                </Button>
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <div className="space-y-0.5 lg:space-y-1 p-1">
                {/* My Groups */}
                {myGroups.length > 0 && (
                  <>
                    <div className="px-2 py-1 mt-2 first:mt-0">
                      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">My Groups</h3>
                    </div>
                    {myGroups.map((group) => (
                      <div
                        key={group._id}
                        className={`
                          flex items-center space-x-2 p-1.5 rounded-md transition-colors group cursor-pointer
                          ${selectedGroupId === group._id
                            ? 'bg-secondary text-secondary-foreground'
                            : 'hover:bg-muted/50'
                          }
                        `}
                        onClick={() => handleGroupClick(group._id)}
                      >
                        {/* Group Avatar */}
                        <div className="relative flex-shrink-0">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {getAvatarInitials(group.name)}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        {/* Group Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <p className="font-medium truncate text-sm">{group.name}</p>
                              {group.membership && getRoleIcon(group.membership.role)}
                            </div>
                            <div className="flex items-center gap-1.5">
                              {getGroupBadge(group)}
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                {group.lastMessageAt ? formatTimestamp(group.lastMessageAt) : ''}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground truncate">
                              {group.lastMessage?.content || `${group.memberCount} members`}
                            </p>
                            {group.unreadCount > 0 && (
                              <Badge variant="default" className="ml-2 h-4 w-4 lg:h-5 lg:w-5 p-0 flex items-center justify-center text-xs flex-shrink-0">
                                {group.unreadCount > 99 ? '99+' : group.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* Available Groups */}
                {availableGroups.length > 0 && (
                  <>
                    {myGroups.length > 0 && (
                      <div className="px-2 py-1 mt-4">
                        <Separator />
                      </div>
                    )}
                    <div className="px-2 py-1 mt-2">
                      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Community Groups</h3>
                    </div>
                    {availableGroups.map((group) => (
                      <div
                        key={group._id}
                        className="flex items-center space-x-2 p-1.5 rounded-md transition-colors group cursor-pointer hover:bg-muted/50"
                        onClick={() => handleGroupClick(group._id)}
                      >
                        {/* Group Avatar */}
                        <div className="relative flex-shrink-0">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                              {getAvatarInitials(group.name)}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        {/* Group Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate text-sm">{group.name}</p>
                            <div className="flex items-center gap-1.5">
                              {getGroupBadge(group)}
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                {group.memberCount} members
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {group.description || "No description"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Group Dialog */}
      <CreateGroupDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}

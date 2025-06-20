"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import {
  Users,
  LogOut,
  Crown,
  Shield,
  UserCheck,
  Globe,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/lib/contexts/auth-context";
import { getSessionToken } from "@/lib/utils/auth";
import { getAvatarInitials } from "@/lib/utils/chat";
import { MessageArea } from "@/components/chat/message-area";
import { MessageInput } from "@/components/chat/message-input";
import { GroupMembersPanel } from "./group-members-panel";
import { GroupAccessHandler } from "./group-access-handler";
import { toast } from "sonner";

interface GroupInterfaceProps {
  groupId: string;
}

export function GroupInterface({ groupId }: GroupInterfaceProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isMembersPanelOpen, setIsMembersPanelOpen] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [groupInfo, setGroupInfo] = useState<any>(null);
  const [hasJustJoined, setHasJustJoined] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sessionToken = getSessionToken();

  // Get group conversation
  const groupConversation = useQuery(
    api.groups.getGroupConversation,
    sessionToken && user ? { sessionToken, groupId: groupId as Id<"groups"> } : "skip"
  );

  // Get messages for the group
  const messages = useQuery(
    api.chat.getMessages,
    groupConversation?.conversationId && sessionToken
      ? { sessionToken, conversationId: groupConversation.conversationId }
      : "skip"
  );

  // Get group members (this will handle access control)
  const membersResult = useQuery(
    api.groups.getGroupMembers,
    sessionToken && user ? { sessionToken, groupId: groupId as Id<"groups"> } : "skip"
  );

  // Handle the new response format
  const members = Array.isArray(membersResult) ? membersResult : membersResult?.members || [];
  const isNonMember = membersResult?.isNonMember || false;
  const canJoin = membersResult?.canJoin || false;
  const isPrivateGroup = membersResult?.isPrivateGroup || false;

  // Reset hasJustJoined when we get fresh data
  useEffect(() => {
    if (hasJustJoined && groupConversation && !isNonMember) {
      setHasJustJoined(false);
    }
  }, [hasJustJoined, groupConversation, isNonMember]);

  // Mutations
  const leaveGroup = useMutation(api.groups.leaveGroup);
  const updateGroupLastSeen = useMutation(api.groups.updateGroupLastSeen);

  // Handle access errors
  useEffect(() => {
    if (membersResult && typeof membersResult === 'object' && 'groupInfo' in membersResult) {
      setGroupInfo(membersResult.groupInfo);
    }
  }, [membersResult]);

  // Update last seen when user enters the group
  useEffect(() => {
    if (sessionToken && groupConversation?.membership && groupConversation.membership.status === "active") {
      updateGroupLastSeen({
        sessionToken,
        groupId: groupId as Id<"groups">,
      }).catch((error) => {
        console.error("Failed to update group last seen:", error);
      });
    }
  }, [sessionToken, groupConversation, groupId, updateGroupLastSeen]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);



  const handleLeaveGroup = async () => {
    if (!sessionToken) {
      toast.error("Authentication required");
      return;
    }

    if (!confirm("Are you sure you want to leave this group?")) {
      return;
    }

    try {
      const result = await leaveGroup({
        sessionToken,
        groupId: groupId as Id<"groups">,
      });
      toast.success(result.message);
      router.push("/groups");
    } catch (error: any) {
      toast.error(error.message || "Failed to leave group");
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "creator":
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case "admin":
        return <Shield className="h-4 w-4 text-blue-500" />;
      case "moderator":
        return <UserCheck className="h-4 w-4 text-green-500" />;
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

  // Handle access control for non-members
  if (isNonMember && groupInfo) {
    return (
      <GroupAccessHandler
        groupId={groupId as Id<"groups">}
        groupInfo={groupInfo}
        error={isPrivateGroup ? "PRIVATE_GROUP_ACCESS_DENIED" : undefined}
        onJoinSuccess={() => {
          // Trigger data refetch without page refresh
          setHasJustJoined(true);
        }}
      />
    );
  }

  // Loading state
  if (!groupConversation || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-2">Loading group...</h3>
        </div>
      </div>
    );
  }

  const { group, membership } = groupConversation;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 lg:p-4 border-b bg-background">
        <div className="flex items-center space-x-3">
          {/* Group Avatar */}
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getAvatarInitials(group.name)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Group Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-semibold truncate">{group.name}</h1>
              {getGroupBadge(group)}
              {membership && getRoleIcon(membership.role)}
            </div>
            <p className="text-sm text-muted-foreground">
              {group.memberCount} member{group.memberCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Members Panel */}
          <Sheet open={isMembersPanelOpen} onOpenChange={setIsMembersPanelOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Members</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0 gap-0">
              <VisuallyHidden>
                <SheetTitle>Group Members</SheetTitle>
                <SheetDescription>View and manage group members</SheetDescription>
              </VisuallyHidden>
              <GroupMembersPanel
                groupId={groupId as Id<"groups">}
                groupName={group?.name || "Group"}
                members={(members || []).filter(Boolean) as any[]}
                currentUserMembership={membership}
              />
            </SheetContent>
          </Sheet>

          {/* Leave Group */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLeaveGroup}
            className="text-destructive hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Leave</span>
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <MessageArea
        messages={messages}
        conversation={{
          conversationId: groupConversation.conversationId,
          otherUser: {
            _id: group._id as any,
            username: group.name,
            isOnline: true,
            lastSeen: Date.now(),
            showOnlineStatus: true,
            isGuest: false,
            bio: group.description,
            age: 0,
            gender: "other" as const,
          }
        }}
        user={user}
        ref={messagesEndRef}
      />

      {/* Message Input */}
      <MessageInput
        conversation={{
          conversationId: groupConversation.conversationId,
          otherUser: {
            _id: group._id as any,
            username: group.name,
            isOnline: true,
            lastSeen: Date.now(),
            showOnlineStatus: true,
            isGuest: false,
            bio: group.description,
            age: 0,
            gender: "other" as const,
          }
        }}
        onSendMessage={() => {}}
        onTyping={() => {}}
        isSending={false}
      />
    </div>
  );
}

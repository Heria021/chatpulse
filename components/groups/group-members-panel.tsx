"use client";

import { useState } from "react";
import { Crown, Shield, UserCheck, User, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Id } from "@/convex/_generated/dataModel";
import { GroupMembership } from "@/lib/types/auth";
import { getAvatarInitials, formatTimestamp } from "@/lib/utils/chat";
import { AvatarStatusIndicator } from "@/components/ui/status-indicator";
import { InviteMembersDialog } from "./invite-members-dialog";

interface GroupMember {
  _id: Id<"users">;
  username: string;
  isOnline: boolean;
  currentStatus: "online" | "recently_active" | "away" | "offline";
  lastSeen: number;
  lastActivity?: number;
  isGuest: boolean;
  bio?: string;
  age: number;
  gender: "male" | "female" | "other";
  showOnlineStatus: boolean;
  membership: {
    _id: Id<"groupMemberships">;
    role: "creator" | "admin" | "moderator" | "member";
    joinedAt: number;
    lastSeenAt: number;
  };
}

interface GroupMembersPanelProps {
  groupId: Id<"groups">;
  groupName: string;
  members: GroupMember[];
  currentUserMembership: GroupMembership;
}

export function GroupMembersPanel({ groupId, groupName, members, currentUserMembership }: GroupMembersPanelProps) {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "creator":
        return <Crown className="h-3 w-3 text-yellow-500" />;
      case "admin":
        return <Shield className="h-3 w-3 text-blue-500" />;
      case "moderator":
        return <UserCheck className="h-3 w-3 text-green-500" />;
      default:
        return <User className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "creator":
        return <Badge variant="secondary" className="text-xs px-2 py-0.5 h-5">Creator</Badge>;
      case "admin":
        return <Badge variant="secondary" className="text-xs px-2 py-0.5 h-5">Admin</Badge>;
      case "moderator":
        return <Badge variant="secondary" className="text-xs px-2 py-0.5 h-5">Mod</Badge>;
      default:
        return null;
    }
  };

  const canManageMember = (memberRole: string) => {
    const currentRole = currentUserMembership.role;
    
    // Creator can manage everyone except other creators
    if (currentRole === "creator") {
      return memberRole !== "creator";
    }
    
    // Admin can manage moderators and members
    if (currentRole === "admin") {
      return memberRole === "moderator" || memberRole === "member";
    }
    
    // Moderator can manage members
    if (currentRole === "moderator") {
      return memberRole === "member";
    }
    
    return false;
  };

  // Group members by role
  const groupedMembers = {
    creator: members.filter(m => m.membership.role === "creator"),
    admin: members.filter(m => m.membership.role === "admin"),
    moderator: members.filter(m => m.membership.role === "moderator"),
    member: members.filter(m => m.membership.role === "member"),
  };

  const renderMemberGroup = (title: string, memberList: GroupMember[], showSeparator: boolean = true) => {
    if (memberList.length === 0) return null;

    return (
      <div className="w-full">
        {showSeparator && <Separator className="my-3" />}
        <h3 className="text-sm font-medium text-muted-foreground mb-2 px-3">{title}</h3>
        <div className="space-y-1">
          {memberList.map((member) => (
            <div
              key={member._id}
              className="flex items-center px-3 py-2 hover:bg-muted/50 transition-colors"
            >
              {/* Avatar with status */}
              <div className="relative flex-shrink-0 mr-3">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getAvatarInitials(member.username)}
                  </AvatarFallback>
                </Avatar>
                <AvatarStatusIndicator
                  status={member.currentStatus}
                  showOnlineStatus={member.showOnlineStatus}
                />
              </div>

              {/* Member Info - Stack layout for better space usage */}
              <div className="flex-1 min-w-0 mr-2">
                <div className="flex items-center gap-1">
                  <span
                    className="font-medium text-sm truncate block max-w-[100px]"
                    title={member.username}
                  >
                    {member.username}
                  </span>
                  <div className="flex-shrink-0">
                    {getRoleIcon(member.membership.role)}
                  </div>
                  {member.isGuest && (
                    <Badge variant="outline" className="text-xs h-4 px-1 flex-shrink-0">Guest</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {formatTimestamp(member.membership.joinedAt)}
                </p>
              </div>

              {/* Role Badge and Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {getRoleBadge(member.membership.role)}
                {/* Member Actions */}
                {canManageMember(member.membership.role) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        Send Message
                      </DropdownMenuItem>
                      <Separator />
                      {currentUserMembership.role === "creator" && member.membership.role === "member" && (
                        <>
                          <DropdownMenuItem>
                            Promote to Moderator
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Promote to Admin
                          </DropdownMenuItem>
                        </>
                      )}
                      {currentUserMembership.role === "creator" && member.membership.role === "moderator" && (
                        <>
                          <DropdownMenuItem>
                            Promote to Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Demote to Member
                          </DropdownMenuItem>
                        </>
                      )}
                      {currentUserMembership.role === "creator" && member.membership.role === "admin" && (
                        <DropdownMenuItem>
                          Demote to Moderator
                        </DropdownMenuItem>
                      )}
                      <Separator />
                      <DropdownMenuItem className="text-destructive">
                        Remove from Group
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b flex-shrink-0">
        <h2 className="font-semibold text-lg">Members ({members.length})</h2>
        <p className="text-sm text-muted-foreground">
          Manage group members and their roles
        </p>
      </div>

      {/* Members List */}
      <ScrollArea className="flex-1">
        <div className="py-2">
          {renderMemberGroup("Creator", groupedMembers.creator, false)}
          {renderMemberGroup("Admins", groupedMembers.admin)}
          {renderMemberGroup("Moderators", groupedMembers.moderator)}
          {renderMemberGroup("Members", groupedMembers.member)}

          {/* Empty State */}
          {members.length === 0 && (
            <div className="text-center py-8 px-4">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No members found</h3>
              <p className="text-sm text-muted-foreground">
                This group doesn't have any members yet.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      {(currentUserMembership.role === "creator" || currentUserMembership.role === "admin") && (
        <div className="p-4 border-t flex-shrink-0">
          <Button
            variant="outline"
            className="w-full"
            size="sm"
            onClick={() => setShowInviteDialog(true)}
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Invite Members
          </Button>
        </div>
      )}

      {/* Invite Members Dialog */}
      <InviteMembersDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        groupId={groupId}
        groupName={groupName}
      />
    </div>
  );
}

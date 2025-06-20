"use client";

import { useMutation, useQuery } from "convex/react";
import { Check, X, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/contexts/auth-context";
import { getSessionToken } from "@/lib/utils/auth";
import { getAvatarInitials, formatTimestamp } from "@/lib/utils/chat";
import { toast } from "sonner";

export function UserInvitationsPanel() {
  const { user } = useAuth();
  const sessionToken = getSessionToken();

  // Get user's pending invitations
  const invitations = useQuery(
    api.groups.getUserInvitations,
    sessionToken && user ? { sessionToken } : "skip"
  );

  const acceptInvitation = useMutation(api.groups.acceptGroupInvitation);
  const declineInvitation = useMutation(api.groups.declineGroupInvitation);

  const handleAccept = async (invitationId: string) => {
    if (!sessionToken) {
      toast.error("Authentication required");
      return;
    }

    try {
      const result = await acceptInvitation({
        sessionToken,
        invitationId: invitationId as any,
      });

      toast.success(result.message);
    } catch (error: any) {
      toast.error(error.message || "Failed to accept invitation");
    }
  };

  const handleDecline = async (invitationId: string) => {
    if (!sessionToken) {
      toast.error("Authentication required");
      return;
    }

    try {
      const result = await declineInvitation({
        sessionToken,
        invitationId: invitationId as any,
      });

      toast.success(result.message);
    } catch (error: any) {
      toast.error(error.message || "Failed to decline invitation");
    }
  };

  if (!invitations || invitations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <Users className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-medium mb-2">No pending invitations</h3>
        <p className="text-sm text-muted-foreground">
          Group invitations will appear here when you receive them.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Group Invitations</h2>
          <Badge variant="secondary" className="text-xs">
            {invitations.length} pending
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          You have been invited to join these groups
        </p>
      </div>

      {/* Invitations List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {invitations.map((invitation, index) => (
            <div key={invitation._id}>
              {index > 0 && <Separator className="mb-4" />}
              
              <div className="space-y-3">
                {/* Group Info */}
                <div className="flex items-start space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {getAvatarInitials(invitation.group?.name || "Group")}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate">{invitation.group?.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimestamp(invitation.createdAt)}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {invitation.group?.description || `${invitation.group?.memberCount} members`}
                    </p>
                    
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-muted-foreground">
                        Invited by {invitation.inviter?.username}
                      </span>
                      {invitation.group?.isPublic ? (
                        <Badge variant="outline" className="text-xs">Public</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Private</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Custom Message */}
                {invitation.message && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm italic">"{invitation.message}"</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleAccept(invitation._id)}
                    className="flex-1"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDecline(invitation._id)}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Decline
                  </Button>
                </div>

                {/* Expiry Warning */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    Expires {formatTimestamp(invitation.expiresAt)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

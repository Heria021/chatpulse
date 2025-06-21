"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Lock, Users, UserPlus, ArrowRight, Shield, Check, X, Clock, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/lib/contexts/auth-context";
import { getSessionToken } from "@/lib/utils/auth";
import { getAvatarInitials, formatTimestamp } from "@/lib/utils/chat";
import { toast } from "sonner";

interface GroupAccessHandlerProps {
  groupId: Id<"groups">;
  groupInfo: {
    _id: Id<"groups">;
    name: string;
    description: string;
    memberCount: number;
    maxMembers: number;
    isPublic: boolean;
    type: string;
  };
  error?: string;
  onJoinSuccess?: () => void;
}

export function GroupAccessHandler({
  groupId,
  groupInfo,
  error,
  onJoinSuccess
}: GroupAccessHandlerProps) {
  const { user } = useAuth();
  const [isJoining, setIsJoining] = useState(false);
  const [isRequestingAccess, setIsRequestingAccess] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [showRequestForm, setShowRequestForm] = useState(false);
  const sessionToken = getSessionToken();

  const autoJoinGroup = useMutation(api.groups.autoJoinGroup);
  const requestGroupAccess = useMutation(api.groups.requestGroupAccess);
  const acceptInvitation = useMutation(api.groups.acceptGroupInvitation);
  const declineInvitation = useMutation(api.groups.declineGroupInvitation);

  // Get invitation status for private groups
  const invitationStatus = useQuery(
    api.groups.getGroupInvitationStatus,
    sessionToken && user && (!groupInfo.isPublic && groupInfo.type !== "permanent")
      ? { sessionToken, groupId }
      : "skip"
  );

  const isPrivateGroup = error === "PRIVATE_GROUP_ACCESS_DENIED" || (!groupInfo.isPublic && groupInfo.type !== "permanent");
  const canAutoJoin = groupInfo.isPublic || groupInfo.type === "permanent";

  const handleRequestAccess = async () => {
    if (!sessionToken) {
      toast.error("Authentication required");
      return;
    }

    setIsRequestingAccess(true);

    try {
      const result = await requestGroupAccess({
        sessionToken,
        groupId,
        message: requestMessage.trim() || undefined,
      });

      toast.success(result.message);
      setShowRequestForm(false);
      setRequestMessage("");

    } catch (error: any) {
      toast.error(error.message || "Failed to request access");
    } finally {
      setIsRequestingAccess(false);
    }
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    if (!sessionToken) {
      toast.error("Authentication required");
      return;
    }

    setIsJoining(true);

    try {
      const result = await acceptInvitation({
        sessionToken,
        invitationId: invitationId as any,
      });

      toast.success(result.message);
      onJoinSuccess?.();

    } catch (error: any) {
      toast.error(error.message || "Failed to accept invitation");
    } finally {
      setIsJoining(false);
    }
  };

  const handleDeclineInvitation = async (invitationId: string) => {
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

  const handleJoinGroup = async () => {
    if (!sessionToken) {
      toast.error("Authentication required");
      return;
    }

    setIsJoining(true);

    try {
      const result = await autoJoinGroup({
        sessionToken,
        groupId,
      });

      if (result.success) {
        toast.success(result.message);
        onJoinSuccess?.();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to join group");
    } finally {
      setIsJoining(false);
    }
  };

  if (isPrivateGroup) {
    // Show loading while checking invitation status
    if (invitationStatus === undefined) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <Card className="w-full max-w-md">
            <CardContent className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </CardContent>
          </Card>
        </div>
      );
    }

    // User has a pending invitation
    if (invitationStatus?.invitation) {
      const invitation = invitationStatus.invitation;

      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-green-100 dark:bg-green-900/20 rounded-full w-fit">
                <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-xl">You're Invited!</CardTitle>
              <CardDescription>
                You have been invited to join <strong>{groupInfo.name}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Invitation Details */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {invitation.inviter ? getAvatarInitials(invitation.inviter.username) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      Invited by {invitation.inviter?.username || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(invitation.createdAt)}
                    </p>
                  </div>
                </div>

                {invitation.message && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground italic">
                      "{invitation.message}"
                    </p>
                  </div>
                )}
              </div>

              {/* Group Info */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Members:</span>
                  <span>{groupInfo.memberCount}/{groupInfo.maxMembers}</span>
                </div>
                {groupInfo.description && (
                  <div>
                    <span className="text-muted-foreground">About:</span>
                    <p className="text-sm mt-1">{groupInfo.description}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleAcceptInvitation(invitation._id)}
                  disabled={isJoining}
                  className="flex-1"
                >
                  {isJoining ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Accept
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDeclineInvitation(invitation._id)}
                  disabled={isJoining}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Decline
                </Button>
              </div>

              {/* Expiry Warning */}
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  This invitation expires {formatTimestamp(invitation.expiresAt)}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      );
    }

    // User has pending access request
    if (invitationStatus?.membershipStatus === "pending") {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full w-fit">
                <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <CardTitle className="text-xl">Request Pending</CardTitle>
              <CardDescription>
                Your request to join <strong>{groupInfo.name}</strong> is being reviewed
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Group admins will review your request and notify you of their decision.
                  This may take some time.
                </p>
              </div>

              <div className="text-xs text-muted-foreground">
                You'll receive a notification once your request is approved or declined.
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Default private group access (no invitation, no pending request)
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-muted rounded-full w-fit">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl">{groupInfo.name}</CardTitle>
            <CardDescription>
              This is a private group that requires permission to join.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Group Info */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Members:</span>
                <span>{groupInfo.memberCount}/{groupInfo.maxMembers}</span>
              </div>
              {groupInfo.description && (
                <div>
                  <span className="text-muted-foreground">About:</span>
                  <p className="text-sm mt-1">{groupInfo.description}</p>
                </div>
              )}
            </div>

            {!showRequestForm ? (
              <>
                {/* How to Join Info */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-medium text-sm mb-2">How to join:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Request access from group admins</li>
                    <li>• Ask a group member to invite you</li>
                    <li>• Contact the group creator</li>
                  </ul>
                </div>

                {/* Request Access Button */}
                <Button
                  onClick={() => setShowRequestForm(true)}
                  disabled={groupInfo.memberCount >= groupInfo.maxMembers}
                  className="w-full"
                >
                  {groupInfo.memberCount >= groupInfo.maxMembers ? (
                    "Group is Full"
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Request Access
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                {/* Request Form */}
                <div className="space-y-3">
                  <Label htmlFor="message">Message to Admins (Optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell the admins why you'd like to join this group..."
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    maxLength={500}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    {requestMessage.length}/500 characters
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleRequestAccess}
                    disabled={isRequestingAccess}
                    className="flex-1"
                  >
                    {isRequestingAccess ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    ) : (
                      <MessageSquare className="h-4 w-4 mr-2" />
                    )}
                    Send Request
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRequestForm(false);
                      setRequestMessage("");
                    }}
                    disabled={isRequestingAccess}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (canAutoJoin) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
              {groupInfo.type === "permanent" ? (
                <Shield className="h-8 w-8 text-primary" />
              ) : (
                <Users className="h-8 w-8 text-primary" />
              )}
            </div>
            <CardTitle className="text-xl">{groupInfo.name}</CardTitle>
            <CardDescription>
              {groupInfo.description || "Join this group to start chatting with members."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Group Info */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Members:</span>
              <span className="font-medium">
                {groupInfo.memberCount}/{groupInfo.maxMembers}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Type:</span>
              <Badge variant={groupInfo.type === "permanent" ? "default" : "secondary"}>
                {groupInfo.type === "permanent" ? "Official" : "Public"}
              </Badge>
            </div>

            {/* Join Button */}
            <Button
              onClick={handleJoinGroup}
              disabled={isJoining || groupInfo.memberCount >= groupInfo.maxMembers}
              className="w-full"
              size="lg"
            >
              {isJoining ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Joining...
                </>
              ) : groupInfo.memberCount >= groupInfo.maxMembers ? (
                "Group is Full"
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Join Group
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>

            {/* Additional Info */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                {groupInfo.type === "permanent" 
                  ? "Official groups are managed by the platform team"
                  : "Anyone can join this public group"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fallback for unknown scenarios
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-muted rounded-full w-fit">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">Access Restricted</CardTitle>
          <CardDescription>
            You don't have access to view this group.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            Please contact the group administrators for more information.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

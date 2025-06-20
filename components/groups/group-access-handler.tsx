"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { Lock, Users, UserPlus, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/lib/contexts/auth-context";
import { getSessionToken } from "@/lib/utils/auth";
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
  const sessionToken = getSessionToken();

  const autoJoinGroup = useMutation(api.groups.autoJoinGroup);

  const isPrivateGroup = error === "PRIVATE_GROUP_ACCESS_DENIED" || (!groupInfo.isPublic && groupInfo.type !== "permanent");
  const canAutoJoin = groupInfo.isPublic || groupInfo.type === "permanent";

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
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-muted rounded-full w-fit">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl">Private Group</CardTitle>
            <CardDescription>
              This is a private group that requires an invitation to join.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="font-medium text-sm mb-2">How to join:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Ask a group member to invite you</li>
                <li>• Contact a group admin or creator</li>
                <li>• Wait for an invitation to be sent</li>
              </ul>
            </div>
            <p className="text-xs text-muted-foreground">
              You'll receive a notification when you're invited to join this group.
            </p>
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

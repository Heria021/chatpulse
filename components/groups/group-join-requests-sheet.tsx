"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { 
  UserPlus, 
  Check, 
  X, 
  Clock, 
  User, 
  MessageSquare,
  AlertCircle,
  Loader2
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/lib/contexts/auth-context";
import { getSessionToken } from "@/lib/utils/auth";
import { getAvatarInitials, formatTimestamp } from "@/lib/utils/chat";
import { toast } from "sonner";

interface GroupJoinRequestsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: Id<"groups">;
  groupName: string;
}

interface JoinRequest {
  _id: Id<"groupMemberships">;
  userId: Id<"users">;
  groupId: Id<"groups">;
  status: string;
  joinedAt: number;
  createdAt: number;
  user: {
    _id: Id<"users">;
    username: string;
    isGuest: boolean;
    bio?: string;
    age?: number;
    gender?: string;
    currentStatus?: string;
    isOnline: boolean;
    lastActivity: number;
  };
}

export function GroupJoinRequestsSheet({ 
  open, 
  onOpenChange, 
  groupId, 
  groupName 
}: GroupJoinRequestsSheetProps) {
  const { user } = useAuth();
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [showDenyDialog, setShowDenyDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(null);
  const [denyReason, setDenyReason] = useState("");

  const sessionToken = getSessionToken();

  // Get pending join requests
  const joinRequests = useQuery(
    api.groups.getGroupJoinRequests,
    sessionToken && user ? { sessionToken, groupId } : "skip"
  ) as JoinRequest[] | undefined;

  const approveJoinRequest = useMutation(api.groups.approveJoinRequest);
  const denyJoinRequest = useMutation(api.groups.denyJoinRequest);

  const handleApprove = async (membershipId: Id<"groupMemberships">, username: string) => {
    if (!sessionToken) {
      toast.error("Authentication required");
      return;
    }

    setProcessingRequest(membershipId);

    try {
      const result = await approveJoinRequest({
        sessionToken,
        membershipId,
      });

      toast.success(result.message);
    } catch (error: any) {
      toast.error(error.message || "Failed to approve request");
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleDenyClick = (request: JoinRequest) => {
    setSelectedRequest(request);
    setShowDenyDialog(true);
  };

  const handleDenyConfirm = async () => {
    if (!sessionToken || !selectedRequest) {
      toast.error("Authentication required");
      return;
    }

    setProcessingRequest(selectedRequest._id);

    try {
      const result = await denyJoinRequest({
        sessionToken,
        membershipId: selectedRequest._id,
        reason: denyReason.trim() || undefined,
      });

      toast.success(result.message);
      setShowDenyDialog(false);
      setSelectedRequest(null);
      setDenyReason("");
    } catch (error: any) {
      toast.error(error.message || "Failed to deny request");
    } finally {
      setProcessingRequest(null);
    }
  };

  const getStatusBadge = (user: JoinRequest["user"]) => {
    if (user.isOnline) {
      return <Badge variant="default" className="text-xs">Online</Badge>;
    }
    
    const lastActivity = Date.now() - user.lastActivity;
    const hoursAgo = Math.floor(lastActivity / (1000 * 60 * 60));
    
    if (hoursAgo < 24) {
      return <Badge variant="secondary" className="text-xs">Recently Active</Badge>;
    }
    
    return <Badge variant="outline" className="text-xs">Offline</Badge>;
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Join Requests
            </SheetTitle>
            <SheetDescription>
              Manage pending requests to join <strong>{groupName}</strong>
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            {joinRequests === undefined ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : joinRequests.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-lg mb-2">No Pending Requests</h3>
                <p className="text-sm text-muted-foreground">
                  There are currently no pending join requests for this group.
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="space-y-4">
                  {joinRequests.map((request) => (
                    <div
                      key={request._id}
                      className="p-4 border rounded-lg space-y-3"
                    >
                      {/* User Info */}
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getAvatarInitials(request.user.username)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium truncate">
                              {request.user.username}
                            </h4>
                            {request.user.isGuest && (
                              <Badge variant="outline" className="text-xs">Guest</Badge>
                            )}
                            {getStatusBadge(request.user)}
                          </div>
                          
                          {request.user.bio && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {request.user.bio}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Requested {formatTimestamp(request.createdAt)}
                            </div>
                            {request.user.age && (
                              <span>Age: {request.user.age}</span>
                            )}
                            {request.user.gender && (
                              <span>{request.user.gender}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* User Status */}
                      {request.user.currentStatus && (
                        <div className="flex items-center gap-2 text-sm">
                          <MessageSquare className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground italic">
                            "{request.user.currentStatus}"
                          </span>
                        </div>
                      )}

                      <Separator />

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(request._id, request.user.username)}
                          disabled={processingRequest === request._id}
                          size="sm"
                          className="flex-1"
                        >
                          {processingRequest === request._id ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-2" />
                          ) : (
                            <Check className="h-3 w-3 mr-2" />
                          )}
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleDenyClick(request)}
                          disabled={processingRequest === request._id}
                          size="sm"
                          className="flex-1"
                        >
                          <X className="h-3 w-3 mr-2" />
                          Deny
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Deny Request Dialog */}
      <Dialog open={showDenyDialog} onOpenChange={setShowDenyDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <X className="h-5 w-5 text-red-500" />
              Deny Join Request
            </DialogTitle>
            <DialogDescription>
              You are about to deny <strong>{selectedRequest?.user.username}</strong>'s 
              request to join the group.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Textarea
                id="reason"
                placeholder="Why are you denying this request?"
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
                maxLength={500}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                {denyReason.length}/500 characters
              </p>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                The user will not be notified of the denial reason, but it will be logged for admin reference.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDenyDialog(false);
                setDenyReason("");
              }}
              disabled={processingRequest === selectedRequest?._id}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDenyConfirm}
              disabled={processingRequest === selectedRequest?._id}
            >
              {processingRequest === selectedRequest?._id && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Deny Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

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
  Loader2,
  AlertCircle,
  Users
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/lib/contexts/auth-context";
import { getSessionToken } from "@/lib/utils/auth";
import { getAvatarInitials, formatTimestamp } from "@/lib/utils/chat";
import { AvatarStatusIndicator, UserStatus } from "@/components/ui/status-indicator";
import { toast } from "sonner";

interface GroupRequestsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: Id<"groups">;
  groupName: string;
}

interface GroupRequest {
  _id: Id<"groupMemberships">;
  userId: Id<"users">;
  username: string;
  isGuest: boolean;
  bio?: string;
  age?: number;
  gender?: string;
  requestedAt: number;
  lastActivity: number;
  isOnline: boolean;
  currentStatus?: string;
  showOnlineStatus: boolean;
  requestMessage?: string;
}

export function GroupRequestsSheet({ 
  open, 
  onOpenChange, 
  groupId, 
  groupName 
}: GroupRequestsSheetProps) {
  const { user } = useAuth();
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [showDenyDialog, setShowDenyDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<GroupRequest | null>(null);
  const [denyReason, setDenyReason] = useState("");

  const sessionToken = getSessionToken();

  // Get pending requests
  const requests = useQuery(
    api.groups.getGroupRequests,
    sessionToken && user && open ? { sessionToken, groupId } : "skip"
  ) as GroupRequest[] | undefined;

  const approveRequest = useMutation(api.groups.approveGroupRequest);
  const denyRequest = useMutation(api.groups.denyGroupRequest);

  const handleApprove = async (request: GroupRequest) => {
    if (!sessionToken) {
      toast.error("Authentication required");
      return;
    }

    setProcessingRequest(request._id);

    try {
      const result = await approveRequest({
        sessionToken,
        groupId,
        membershipId: request._id,
      });

      toast.success(result.message);
    } catch (error: any) {
      toast.error(error.message || "Failed to approve request");
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleDeny = async () => {
    if (!sessionToken || !selectedRequest) {
      toast.error("Authentication required");
      return;
    }

    setProcessingRequest(selectedRequest._id);

    try {
      const result = await denyRequest({
        sessionToken,
        groupId,
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

  const openDenyDialog = (request: GroupRequest) => {
    setSelectedRequest(request);
    setShowDenyDialog(true);
  };

  const closeDenyDialog = () => {
    setShowDenyDialog(false);
    setSelectedRequest(null);
    setDenyReason("");
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[400px] sm:w-[500px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Join Requests
              {requests && requests.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {requests.length}
                </Badge>
              )}
            </SheetTitle>
            <SheetDescription>
              Manage pending requests to join <strong>{groupName}</strong>
              {requests && requests.length > 0 && (
                <span className="block mt-1 text-xs">
                  {requests.length} {requests.length === 1 ? 'request' : 'requests'} awaiting review
                </span>
              )}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            {requests === undefined ? (
              <div className="space-y-3">
                {/* Loading Skeletons */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 border rounded-lg animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-9 w-9 bg-muted rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-24" />
                        <div className="h-3 bg-muted rounded w-32" />
                      </div>
                      <div className="flex gap-1.5">
                        <div className="h-8 w-12 bg-muted rounded" />
                        <div className="h-8 w-12 bg-muted rounded" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-3 bg-muted rounded w-full" />
                      <div className="h-3 bg-muted rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto mb-4 p-3 bg-muted/50 rounded-full w-fit">
                  <UserPlus className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Pending Requests</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  There are currently no pending requests to join this group.
                  When users request access, their messages will appear here for your review.
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="space-y-3">
                  {requests.map((request) => (
                    <div
                      key={request._id}
                      className="p-3 border rounded-lg hover:bg-muted/50 transition-all duration-200 hover:shadow-sm"
                    >
                      {/* User Info */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="relative">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                              {getAvatarInitials(request.username)}
                            </AvatarFallback>
                          </Avatar>
                          {request.showOnlineStatus && (
                            <AvatarStatusIndicator
                              status={(request.currentStatus as UserStatus) || (request.isOnline ? "online" : "offline")}
                              showOnlineStatus={request.showOnlineStatus}
                              className="absolute -bottom-0.5 -right-0.5"
                            />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm truncate">
                              {request.username}
                            </h4>
                            {request.isGuest && (
                              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                                Guest
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimestamp(request.requestedAt)}</span>
                          </div>
                        </div>

                        {/* Action Buttons - Moved to top right */}
                        <div className="flex gap-1.5">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(request)}
                                  disabled={processingRequest === request._id}
                                  className="h-8 px-3"
                                >
                                  {processingRequest === request._id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Check className="h-3 w-3" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Approve {request.username}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openDenyDialog(request)}
                                  disabled={processingRequest === request._id}
                                  className="h-8 px-3"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Deny {request.username}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>

                      {/* Request Details - Compact */}
                      <div className="space-y-2 text-xs text-muted-foreground">
                          {/* Request Message */}
                          <div className="p-2 bg-muted/30 rounded border-l-2 border-primary/30">
                            <div className="flex items-center gap-1 mb-1">
                              <MessageSquare className="h-3 w-3 text-primary" />
                              <span className="font-medium text-primary text-xs">Request Message:</span>
                            </div>
                            <p className="line-clamp-3 leading-relaxed text-foreground/80">
                              {request.requestMessage && request.requestMessage.trim() ? (
                                `"${request.requestMessage.trim()}"`
                              ) : (
                                <span className="italic text-muted-foreground">No message provided</span>
                              )}
                            </p>
                          </div>

                          {/* User Info */}
                          <div className="flex items-center gap-3">
                            {(request.age || request.gender) && (
                              <div className="flex gap-2">
                                {request.age && <span>Age: {request.age}</span>}
                                {request.gender && <span>Gender: {request.gender}</span>}
                              </div>
                            )}

                            {request.currentStatus && (
                              <div className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                <span className="italic truncate">Status: "{request.currentStatus}"</span>
                              </div>
                            )}
                          </div>
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
      <Dialog open={showDenyDialog} onOpenChange={closeDenyDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
                <X className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              Deny Request
            </DialogTitle>
            <DialogDescription className="text-sm">
              Deny <strong>{selectedRequest?.username}</strong>'s request to join the group?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-sm text-amber-800 dark:text-amber-200">
                The user won't be notified, but the reason will be logged for admin reference.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm">Reason (Optional)</Label>
              <Textarea
                id="reason"
                placeholder="Why are you denying this request?"
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
                maxLength={300}
                rows={2}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {denyReason.length}/300 characters
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button
              variant="outline"
              onClick={closeDenyDialog}
              disabled={processingRequest === selectedRequest?._id}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeny}
              disabled={processingRequest === selectedRequest?._id}
              className="flex-1"
            >
              {processingRequest === selectedRequest?._id ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <X className="mr-2 h-4 w-4" />
              )}
              Deny
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

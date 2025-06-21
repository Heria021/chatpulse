"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { Loader2, UserX, Ban, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/lib/contexts/auth-context";
import { getSessionToken } from "@/lib/utils/auth";
import { toast } from "sonner";

interface MemberRemovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: Id<"groups">;
  member: {
    _id: Id<"users">;
    username: string;
    role: "creator" | "admin" | "moderator" | "member";
  };
  currentUserRole: "creator" | "admin" | "moderator" | "member";
}

export function MemberRemovalDialog({ 
  open, 
  onOpenChange, 
  groupId, 
  member, 
  currentUserRole 
}: MemberRemovalDialogProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [action, setAction] = useState<"remove" | "ban">("remove");
  const [reason, setReason] = useState("");
  const [banDuration, setBanDuration] = useState<string>("permanent");

  const sessionToken = getSessionToken();
  const removeMember = useMutation(api.groups.removeMember);
  const banMember = useMutation(api.groups.banMember);

  const canBan = currentUserRole === "creator" || currentUserRole === "admin";
  const canRemove = currentUserRole === "creator" || currentUserRole === "admin" || 
    (currentUserRole === "moderator" && member.role === "member");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionToken) {
      toast.error("Authentication required");
      return;
    }

    if (!reason.trim()) {
      toast.error("Please provide a reason");
      return;
    }

    setIsLoading(true);

    try {
      if (action === "remove") {
        const result = await removeMember({
          sessionToken,
          groupId,
          userId: member._id,
          reason: reason.trim(),
        });
        toast.success(result.message);
      } else {
        // Calculate ban duration in milliseconds
        let duration: number | undefined;
        if (banDuration !== "permanent") {
          const days = parseInt(banDuration);
          duration = days * 24 * 60 * 60 * 1000; // Convert days to milliseconds
        }

        const result = await banMember({
          sessionToken,
          groupId,
          userId: member._id,
          reason: reason.trim(),
          duration,
        });
        toast.success(result.message);
      }

      // Reset form and close dialog
      setReason("");
      setBanDuration("permanent");
      setAction("remove");
      onOpenChange(false);
      
    } catch (error: any) {
      toast.error(error.message || `Failed to ${action} member`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setReason("");
      setBanDuration("permanent");
      setAction("remove");
      onOpenChange(false);
    }
  };

  const getBanDurationText = (duration: string) => {
    switch (duration) {
      case "1": return "1 day";
      case "7": return "1 week";
      case "30": return "1 month";
      case "90": return "3 months";
      case "permanent": return "Permanent";
      default: return duration + " days";
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {action === "remove" ? (
              <UserX className="h-5 w-5 text-orange-500" />
            ) : (
              <Ban className="h-5 w-5 text-red-500" />
            )}
            {action === "remove" ? "Remove" : "Ban"} Member
          </DialogTitle>
          <DialogDescription>
            You are about to {action} <strong>{member.username}</strong> from the group.
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Action Selection */}
          <div className="space-y-3">
            <Label>Action</Label>
            <RadioGroup value={action} onValueChange={(value) => setAction(value as "remove" | "ban")}>
              {canRemove && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="remove" id="remove" disabled={isLoading} />
                  <Label htmlFor="remove" className="flex items-center gap-2 cursor-pointer">
                    <UserX className="h-4 w-4 text-orange-500" />
                    <div>
                      <div className="font-medium">Remove from group</div>
                      <div className="text-xs text-muted-foreground">
                        Member can rejoin if invited or if group is public
                      </div>
                    </div>
                  </Label>
                </div>
              )}
              
              {canBan && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ban" id="ban" disabled={isLoading} />
                  <Label htmlFor="ban" className="flex items-center gap-2 cursor-pointer">
                    <Ban className="h-4 w-4 text-red-500" />
                    <div>
                      <div className="font-medium">Ban from group</div>
                      <div className="text-xs text-muted-foreground">
                        Member cannot rejoin until ban expires or is lifted
                      </div>
                    </div>
                  </Label>
                </div>
              )}
            </RadioGroup>
          </div>

          {/* Ban Duration */}
          {action === "ban" && (
            <div className="space-y-2">
              <Label htmlFor="duration">Ban Duration</Label>
              <Select value={banDuration} onValueChange={setBanDuration} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="7">1 week</SelectItem>
                  <SelectItem value="30">1 month</SelectItem>
                  <SelectItem value="90">3 months</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Textarea
              id="reason"
              placeholder={`Why are you ${action === "remove" ? "removing" : "banning"} this member?`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
              disabled={isLoading}
              rows={3}
              required
            />
            <p className="text-xs text-muted-foreground">
              {reason.length}/500 characters
            </p>
          </div>

          {/* Warning */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {action === "remove" 
                ? "This will immediately remove the member from the group and all group conversations."
                : `This will ban the member ${getBanDurationText(banDuration).toLowerCase()} and remove them from the group.`
              }
            </AlertDescription>
          </Alert>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={action === "ban" ? "destructive" : "default"}
              disabled={isLoading || !reason.trim()}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {action === "remove" ? "Remove Member" : "Ban Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

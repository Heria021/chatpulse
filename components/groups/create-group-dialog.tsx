"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { Loader2, Users, Globe, Lock, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/contexts/auth-context";
import { getSessionToken } from "@/lib/utils/auth";
import { toast } from "sonner";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGroupDialog({ open, onOpenChange }: CreateGroupDialogProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [maxMembers, setMaxMembers] = useState([25]);

  const createGroup = useMutation(api.groups.createGroup);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be signed in to create a group");
      return;
    }

    if (user.hasCreatedGroup === true) {
      toast.error("You can only create one group. Please delete your existing group first.");
      return;
    }

    const sessionToken = getSessionToken();
    if (!sessionToken) {
      toast.error("Authentication required. Please sign in again.");
      return;
    }

    if (!name.trim()) {
      toast.error("Group name is required");
      return;
    }

    setIsLoading(true);

    try {
      const result = await createGroup({
        sessionToken,
        name: name.trim(),
        description: description.trim() || undefined,
        isPublic,
        requiresApproval,
        maxMembers: maxMembers[0],
      });

      toast.success(result.message);
      
      // Reset form
      setName("");
      setDescription("");
      setIsPublic(true);
      setRequiresApproval(false);
      setMaxMembers([25]);
      
      // Close dialog
      onOpenChange(false);
      
      // Navigate to the new group
      router.push(`/groups/${result.groupId}`);
      
    } catch (error: any) {
      toast.error(error.message || "Failed to create group");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Create New Group
          </DialogTitle>
          <DialogDescription>
            Create a group to chat with multiple people. You can only create one group at a time.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Group Name *</Label>
            <Input
              id="name"
              placeholder="Enter group name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              disabled={isLoading}
              required
            />
            <p className="text-xs text-muted-foreground">
              {name.length}/50 characters
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What's this group about? (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              disabled={isLoading}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/200 characters
            </p>
          </div>

          {/* Max Members */}
          <div className="space-y-3">
            <Label>Maximum Members: {maxMembers[0]}</Label>
            <Slider
              value={maxMembers}
              onValueChange={setMaxMembers}
              max={100}
              min={2}
              step={1}
              disabled={isLoading}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Choose between 2 and 100 members
            </p>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isPublic ? <Globe className="h-4 w-4 text-green-500" /> : <Lock className="h-4 w-4 text-orange-500" />}
                <div>
                  <Label htmlFor="isPublic">Public Group</Label>
                  <p className="text-xs text-muted-foreground">
                    {isPublic ? "Anyone can find and join" : "Invite-only group"}
                  </p>
                </div>
              </div>
              <Switch
                id="isPublic"
                checked={isPublic}
                onCheckedChange={setIsPublic}
                disabled={isLoading}
              />
            </div>

            {isPublic && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <div>
                    <Label htmlFor="requiresApproval">Require Approval</Label>
                    <p className="text-xs text-muted-foreground">
                      {requiresApproval ? "You approve new members" : "Anyone can join instantly"}
                    </p>
                  </div>
                </div>
                <Switch
                  id="requiresApproval"
                  checked={requiresApproval}
                  onCheckedChange={setRequiresApproval}
                  disabled={isLoading}
                />
              </div>
            )}
          </div>

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
              disabled={isLoading || !name.trim() || user?.hasCreatedGroup === true}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Group
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

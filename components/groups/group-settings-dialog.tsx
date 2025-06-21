"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { Loader2, Settings, Globe, Lock, Shield, Users, Save, X } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/lib/contexts/auth-context";
import { getSessionToken } from "@/lib/utils/auth";
import { toast } from "sonner";

interface GroupSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: Id<"groups">;
  userRole?: "creator" | "admin" | "moderator" | "member";
}

export function GroupSettingsDialog({ open, onOpenChange, groupId, userRole }: GroupSettingsDialogProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [maxMembers, setMaxMembers] = useState([25]);

  const sessionToken = getSessionToken();

  // Only fetch settings if user has permission
  const canViewSettings = userRole === "creator" || userRole === "admin";

  // Get group settings
  const groupSettings = useQuery(
    api.groups.getGroupSettings,
    sessionToken && user && canViewSettings ? { sessionToken, groupId } : "skip"
  );

  const updateGroupSettings = useMutation(api.groups.updateGroupSettings);

  // Initialize form with current settings
  useEffect(() => {
    if (groupSettings) {
      setName(groupSettings.name);
      setDescription(groupSettings.description || "");
      setIsPublic(groupSettings.isPublic);
      setRequiresApproval(groupSettings.requiresApproval);
      setMaxMembers([groupSettings.maxMembers]);
      setHasChanges(false);
    }
  }, [groupSettings]);

  // Track changes
  useEffect(() => {
    if (groupSettings) {
      const changed = 
        name !== groupSettings.name ||
        description !== (groupSettings.description || "") ||
        isPublic !== groupSettings.isPublic ||
        requiresApproval !== groupSettings.requiresApproval ||
        maxMembers[0] !== groupSettings.maxMembers;
      
      setHasChanges(changed);
    }
  }, [name, description, isPublic, requiresApproval, maxMembers, groupSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionToken || !groupSettings) {
      toast.error("Authentication required");
      return;
    }

    if (!name.trim()) {
      toast.error("Group name is required");
      return;
    }

    setIsLoading(true);

    try {
      const updates: any = {};
      
      // Only include changed fields
      if (name !== groupSettings.name) {
        updates.name = name.trim();
      }
      if (description !== (groupSettings.description || "")) {
        updates.description = description.trim() || undefined;
      }
      if (isPublic !== groupSettings.isPublic) {
        updates.isPublic = isPublic;
      }
      if (requiresApproval !== groupSettings.requiresApproval) {
        updates.requiresApproval = requiresApproval;
      }
      if (maxMembers[0] !== groupSettings.maxMembers) {
        updates.maxMembers = maxMembers[0];
      }

      await updateGroupSettings({
        sessionToken,
        groupId,
        ...updates,
      });

      toast.success("Group settings updated successfully");
      setHasChanges(false);
      
    } catch (error: any) {
      toast.error(error.message || "Failed to update group settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (hasChanges && !isLoading) {
      if (confirm("You have unsaved changes. Are you sure you want to close?")) {
        onOpenChange(false);
      }
    } else {
      onOpenChange(false);
    }
  };

  const handleReset = () => {
    if (groupSettings) {
      setName(groupSettings.name);
      setDescription(groupSettings.description || "");
      setIsPublic(groupSettings.isPublic);
      setRequiresApproval(groupSettings.requiresApproval);
      setMaxMembers([groupSettings.maxMembers]);
    }
  };

  // Handle permission check
  if (!canViewSettings) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Access Denied</DialogTitle>
            <DialogDescription>
              Only group creators and admins can view group settings.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (!groupSettings) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Group Settings
          </DialogTitle>
          <DialogDescription>
            Manage your group settings and preferences. Changes will be visible to all members.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">Group Information</h3>
              <Badge variant={groupSettings.type === "permanent" ? "secondary" : "default"}>
                {groupSettings.type === "permanent" ? "Permanent" : "User Created"}
              </Badge>
            </div>
            
            {/* Group Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Group Name *</Label>
              <Input
                id="name"
                placeholder="Enter group name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
                disabled={isLoading || !groupSettings.canEdit}
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
                disabled={isLoading || !groupSettings.canEdit}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                {description.length}/200 characters
              </p>
            </div>
          </div>

          <Separator />

          {/* Member Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <h3 className="font-medium">Member Settings</h3>
            </div>

            {/* Max Members */}
            <div className="space-y-3">
              <Label>Maximum Members: {maxMembers[0]}</Label>
              <Slider
                value={maxMembers}
                onValueChange={setMaxMembers}
                max={100}
                min={Math.max(2, groupSettings.memberCount)}
                step={1}
                disabled={isLoading || !groupSettings.canEdit}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Current members: {groupSettings.memberCount}. Minimum: {Math.max(2, groupSettings.memberCount)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Privacy Settings */}
          <div className="space-y-4">
            <h3 className="font-medium">Privacy & Access</h3>
            
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
                disabled={isLoading || !groupSettings.canEdit}
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
                  disabled={isLoading || !groupSettings.canEdit}
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
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            {hasChanges && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleReset}
                disabled={isLoading}
              >
                Reset
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading || !hasChanges || !groupSettings.canEdit}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

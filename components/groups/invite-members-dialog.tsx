"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Search, X, UserPlus, Loader2, Users } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/lib/contexts/auth-context";
import { getSessionToken } from "@/lib/utils/auth";
import { getAvatarInitials } from "@/lib/utils/chat";
import { toast } from "sonner";

interface InviteMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: Id<"groups">;
  groupName: string;
}

interface SelectedUser {
  _id: Id<"users">;
  username: string;
}

export function InviteMembersDialog({ 
  open, 
  onOpenChange, 
  groupId, 
  groupName 
}: InviteMembersDialogProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sessionToken = getSessionToken();

  // Get active users for search
  const activeUsers = useQuery(
    api.users.getActiveUsers,
    sessionToken && user
      ? {
          sessionToken,
          searchQuery: searchQuery || undefined,
        }
      : "skip"
  );

  const inviteToGroup = useMutation(api.groups.inviteToGroup);

  // Filter out users who are already selected
  const availableUsers = activeUsers?.filter(
    (activeUser) => !selectedUsers.some(selected => selected._id === activeUser._id)
  ) || [];

  const handleUserSelect = (user: any) => {
    if (selectedUsers.length >= 10) {
      toast.error("You can invite up to 10 users at once");
      return;
    }

    setSelectedUsers(prev => [...prev, {
      _id: user._id,
      username: user.username,
    }]);
  };

  const handleUserRemove = (userId: Id<"users">) => {
    setSelectedUsers(prev => prev.filter(user => user._id !== userId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user to invite");
      return;
    }

    if (!sessionToken) {
      toast.error("Authentication required");
      return;
    }

    setIsLoading(true);

    try {
      const result = await inviteToGroup({
        sessionToken,
        groupId,
        invitedUsernames: selectedUsers.map(user => user.username),
        message: message.trim() || undefined,
      });

      if (result.success) {
        toast.success(result.message);
        
        // Show errors if any
        if (result.errors.length > 0) {
          result.errors.forEach(error => toast.error(error));
        }

        // Reset form
        setSelectedUsers([]);
        setMessage("");
        setSearchQuery("");
        
        // Close dialog
        onOpenChange(false);
      } else {
        toast.error(result.message);
        result.errors.forEach(error => toast.error(error));
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send invitations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setSelectedUsers([]);
      setMessage("");
      setSearchQuery("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite Members to {groupName}
          </DialogTitle>
          <DialogDescription>
            Search for users and invite them to join this group.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* Search Users */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Users</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="space-y-2 mt-4">
              <Label>Selected Users ({selectedUsers.length}/10)</Label>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <Badge
                    key={user._id}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1"
                  >
                    <span>{user.username}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleUserRemove(user._id)}
                      disabled={isLoading}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Available Users List */}
          <div className="space-y-2 mt-4 flex-1 min-h-0">
            <Label>Available Users</Label>
            <ScrollArea className="h-48 border rounded-md">
              <div className="p-2 space-y-1">
                {availableUsers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">
                      {searchQuery ? "No users found" : "Start typing to search for users"}
                    </p>
                  </div>
                ) : (
                  availableUsers.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handleUserSelect(user)}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {getAvatarInitials(user.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">{user.username}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.bio || `${user.age} years old, ${user.gender}`}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0"
                        disabled={isLoading}
                      >
                        <UserPlus className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Custom Message */}
          <div className="space-y-2 mt-4">
            <Label htmlFor="message">Custom Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a personal message to your invitation..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={200}
              disabled={isLoading}
              className="resize-none"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              {message.length}/200 characters
            </p>
          </div>

          <DialogFooter className="mt-6">
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
              disabled={isLoading || selectedUsers.length === 0}
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send {selectedUsers.length > 0 ? `${selectedUsers.length} ` : ""}Invitation{selectedUsers.length !== 1 ? "s" : ""}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

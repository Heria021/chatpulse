"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth-context";
import { useGroupInvitations } from "@/lib/hooks/use-group-invitations";
import { UsersRound, Plus, ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DefaultChatSkeleton } from "@/components/ui/skeletons";

export default function GroupsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return <DefaultChatSkeleton />;
  }

  // Show nothing if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center h-full bg-muted/20">
      <div className="text-center space-y-4 p-4 lg:p-8 max-w-md">
        <div className="flex items-center justify-center mb-6">
          <div className="p-3 bg-primary/10 rounded-xl">
            <UsersRound className="h-12 w-12 lg:h-16 lg:w-16 text-primary" />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl lg:text-2xl font-bold">Welcome to Groups</h2>
          <p className="text-sm lg:text-base text-muted-foreground">
            Join existing groups or create your own to chat with multiple people at once.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Plus className="h-4 w-4" />
            <span>Create a group</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowRight className="h-4 w-4" />
            <span>Browse groups</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          Select a group from the sidebar to start chatting, or browse available groups to join.
        </p>
      </div>
    </div>
  );
}

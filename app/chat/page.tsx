
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth-context";
import { Loader2, MessageCircle, Users } from "lucide-react";

export default function ChatPage() {
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Show nothing if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center h-full bg-muted/20">
      <div className="text-center space-y-4 p-8">
        <div className="flex items-center justify-center space-x-2 mb-6">
          <MessageCircle className="h-12 w-12 text-primary" />
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold">Welcome to ChatNow</h2>
        <p className="text-muted-foreground max-w-md">
          Select a conversation from the sidebar to start chatting, or start a new conversation.
        </p>
        <div className="pt-4">
          <p className="text-sm text-muted-foreground">
            💡 Tip: Click on any user from the list to begin messaging
          </p>
        </div>
      </div>
    </div>
  );
}
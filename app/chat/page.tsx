
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth-context";
import { MessageCircle, Users, ArrowRight } from "lucide-react";
import { DefaultChatSkeleton } from "@/components/ui/skeletons";

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
            <MessageCircle className="h-12 w-12 lg:h-16 lg:w-16 text-primary" />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl lg:text-2xl font-bold">Welcome to ChatPulse</h2>
          <p className="text-sm lg:text-base text-muted-foreground">
            Select a conversation from the sidebar to start chatting, or start a new conversation.
          </p>
        </div>

        <div className="pt-4 space-y-2">
          <p className="text-xs lg:text-sm text-muted-foreground">
            💡 Tip: Click on any user from the list to begin messaging
          </p>
        </div>
      </div>
    </div>
  );
}
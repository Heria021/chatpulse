"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth-context";
import { Loader2 } from "lucide-react";
import { ChatInterface } from "@/components/chat/chat-interface";

interface ChatUserPageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default function ChatUserPage({ params }: ChatUserPageProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const resolvedParams = use(params);

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

  return <ChatInterface userId={resolvedParams.userId} />;
}

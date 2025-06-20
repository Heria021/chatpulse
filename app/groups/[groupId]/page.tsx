"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth-context";
import { GroupInterface } from "@/components/groups/group-interface";
import { ChatInterfaceSkeleton } from "@/components/ui/skeletons";

interface GroupPageProps {
  params: Promise<{
    groupId: string;
  }>;
}

export default function GroupPage({ params }: GroupPageProps) {
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
    return <ChatInterfaceSkeleton />;
  }

  // Show nothing if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return <GroupInterface groupId={resolvedParams.groupId} />;
}

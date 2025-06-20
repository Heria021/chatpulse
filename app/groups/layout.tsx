"use client";

import { useState } from "react";
import { UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { AppLayout } from "@/components/chat/app-layout";
import { GroupList } from "@/components/groups/group-list";
import { useAuth } from "@/lib/contexts/auth-context";
import { GroupListSkeleton } from "@/components/ui/skeletons";

interface GroupsLayoutProps {
  children: React.ReactNode;
}

export default function GroupsLayout({ children }: GroupsLayoutProps) {
  const { isLoading } = useAuth();
  const [isMobileGroupListOpen, setIsMobileGroupListOpen] = useState(false);

  return (
    <AppLayout
      sidebar={true}
      isLoading={isLoading}
      mobileHeaderExtra={
        !isLoading ? (
          <Sheet open={isMobileGroupListOpen} onOpenChange={setIsMobileGroupListOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2 relative">
                <UsersRound className="h-4 w-4" />
                <span>Groups</span>
              </Button>
            </SheetTrigger>
          </Sheet>
        ) : undefined
      }
    >
      <div className="flex h-full min-h-0">
        {/* Left Column - Group List (Desktop) */}
        <div className="w-80 max-w-80 border-r border-border flex-shrink-0 hidden lg:block h-full overflow-hidden">
          {isLoading ? <GroupListSkeleton /> : <GroupList />}
        </div>

        {/* Mobile Group List Sheet */}
        <Sheet open={isMobileGroupListOpen} onOpenChange={setIsMobileGroupListOpen}>
          <SheetContent
            side="left"
            className="w-80 p-0 lg:hidden"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <VisuallyHidden>
              <SheetTitle>Group List</SheetTitle>
              <SheetDescription>Browse and select groups to join conversations</SheetDescription>
            </VisuallyHidden>
            {isLoading ? <GroupListSkeleton /> : <GroupList onClose={() => setIsMobileGroupListOpen(false)} />}
          </SheetContent>
        </Sheet>

        {/* Right Column - Group Interface */}
        <div className="flex-1 flex flex-col min-h-0">
          {children}
        </div>
      </div>
    </AppLayout>
  );
}

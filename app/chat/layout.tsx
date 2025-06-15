"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { AppLayout } from "@/components/chat/app-layout";
import { UserList } from "@/components/chat/user-list";
import { useUnreadCounts } from "@/lib/hooks/use-unread-counts";

interface ChatLayoutProps {
  children: React.ReactNode;
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  const [isMobileUserListOpen, setIsMobileUserListOpen] = useState(false);
  const { totalUnreadCount } = useUnreadCounts();

  return (
    <AppLayout
      sidebar={true}
      mobileHeaderExtra={
        <Sheet open={isMobileUserListOpen} onOpenChange={setIsMobileUserListOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2 relative">
              <Users className="h-4 w-4" />
              <span>Users</span>
              {totalUnreadCount > 0 && (
                <Badge variant="default" className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-xs flex-shrink-0">
                  {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
        </Sheet>
      }
    >
      <div className="flex h-full min-h-0">
        {/* Left Column - User List (Desktop) */}
        <div className="w-80 max-w-80 border-r border-border flex-shrink-0 hidden lg:block h-full overflow-hidden">
          <UserList />
        </div>

        {/* Mobile User List Sheet */}
        <Sheet open={isMobileUserListOpen} onOpenChange={setIsMobileUserListOpen}>
          <SheetContent
            side="left"
            className="w-80 p-0 lg:hidden"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <VisuallyHidden>
              <SheetTitle>User List</SheetTitle>
              <SheetDescription>Browse and select users to start conversations</SheetDescription>
            </VisuallyHidden>
            <UserList onClose={() => setIsMobileUserListOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Right Column - Chat Interface */}
        <div className="flex-1 flex flex-col min-h-0">
          {children}
        </div>
      </div>
    </AppLayout>
  );
}

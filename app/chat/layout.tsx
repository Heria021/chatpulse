"use client";

import { AppLayout } from "@/components/chat/app-layout";
import { UserList } from "@/components/chat/user-list";

interface ChatLayoutProps {
  children: React.ReactNode;
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <AppLayout sidebar={true}>
      <div className="flex h-full min-h-0">
        {/* Left Column - User List */}
        <div className="w-80 max-w-80 border-r border-border flex-shrink-0 hidden lg:block h-full overflow-hidden">
          <UserList />
        </div>

        {/* Mobile User List Overlay */}
        <div className="lg:hidden">
          {/* This will be handled by mobile navigation */}
        </div>

        {/* Right Column - Chat Interface */}
        <div className="flex-1 flex flex-col min-h-0">
          {children}
        </div>
      </div>
    </AppLayout>
  );
}

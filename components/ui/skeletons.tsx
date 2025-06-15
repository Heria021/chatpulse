"use client";

import { Skeleton } from "@/components/ui/skeleton";

// Sidebar Skeleton Component
export function SidebarSkeleton() {
  return (
    <div className="fixed lg:relative inset-y-0 left-0 z-50 w-64 lg:w-16 bg-background border-r flex flex-col">
      {/* Header */}
      <div className="flex h-16 items-center justify-center lg:justify-center px-3">
        <div className="flex items-center space-x-3 lg:space-x-0">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-6 w-20 lg:hidden" />
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* User Avatar */}
      <div className="flex h-16 items-center justify-center lg:justify-center px-3">
        <div className="flex items-center w-full lg:w-12 space-x-3 lg:space-x-0">
          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
          <div className="lg:hidden space-y-1 flex-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1 p-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center w-full lg:w-12 h-12 px-3 lg:px-0 lg:justify-center">
            <Skeleton className="h-5 w-5 flex-shrink-0" />
            <Skeleton className="ml-3 lg:hidden h-4 w-16" />
          </div>
        ))}
      </nav>

      <div className="h-px bg-border" />

      {/* Sign Out */}
      <div className="p-2">
        <div className="flex items-center w-full lg:w-12 h-12 px-3 lg:px-0 lg:justify-center">
          <Skeleton className="h-5 w-5 flex-shrink-0" />
          <Skeleton className="ml-3 lg:hidden h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

// User List Skeleton Component (Full)
export function UserListSkeleton() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <Skeleton className="h-6 w-24 mb-2" />
        <div className="flex space-x-1">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        <div className="p-3 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-2">
              <div className="relative">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-3 w-32" />
              </div>
              {/* Show badge on specific items to avoid randomness */}
              {(i === 1 || i === 4 || i === 6) && (
                <Skeleton className="h-5 w-5 rounded-full" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// User List Tab Content Skeleton (for individual tabs)
export function UserListTabSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide">
      <div className="space-y-0.5 lg:space-y-1 p-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-2 lg:space-x-2 space-x-1.5 p-1.5 lg:p-2 rounded-lg">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <Skeleton className="h-8 w-8 lg:h-10 lg:w-10 rounded-full" />
              <Skeleton className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full" />
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <Skeleton className="h-4 w-20 lg:w-24" />
                {/* Show badge on specific items to avoid randomness */}
                {(i === 0 || i === 2 || i === 4) && (
                  <Skeleton className="h-4 w-4 lg:h-5 lg:w-5 rounded-full" />
                )}
              </div>
              <Skeleton className="h-3 w-32 lg:w-40" />
            </div>

            {/* Options Menu */}
            <div className="flex-shrink-0">
              <Skeleton className="h-7 w-7 lg:h-8 lg:w-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Default Chat Interface Skeleton
export function DefaultChatSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-muted/20">
      <div className="text-center space-y-4 p-8">
        <div className="flex items-center justify-center space-x-2 mb-6">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-48 mx-auto" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-64 mx-auto" />
          <Skeleton className="h-4 w-56 mx-auto" />
        </div>
        <div className="pt-4">
          <Skeleton className="h-4 w-72 mx-auto" />
        </div>
      </div>
    </div>
  );
}



// Chat Interface Loading Skeleton (for individual chat loading)
export function ChatInterfaceSkeleton() {
  return (
    <div className="flex flex-col h-full">
      {/* Chat Header Skeleton */}
      <div className="flex items-center justify-between p-3 lg:p-4 border-b border-border bg-card">
        <div className="flex items-center space-x-2 lg:space-x-3">
          <div className="relative">
            <Skeleton className="h-8 w-8 lg:h-10 lg:w-10 rounded-full" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-4 w-24 lg:w-32" />
            <Skeleton className="h-3 w-16 lg:w-20" />
          </div>
        </div>
        <Skeleton className="h-7 w-7 lg:h-8 lg:w-8 rounded-md" />
      </div>

      {/* Messages Area Skeleton */}
      <div className="flex-1 overflow-y-auto p-3 lg:p-4">
        <div className="space-y-3 lg:space-y-4">
          {/* Message skeletons */}
          <div className="flex justify-start">
            <div className="flex items-end space-x-1.5 lg:space-x-2 max-w-xs lg:max-w-md">
              <Skeleton className="h-5 w-5 lg:h-6 lg:w-6 rounded-full mb-1" />
              <div className="space-y-1">
                <Skeleton className="h-10 lg:h-12 w-28 lg:w-36 rounded-lg" />
                <Skeleton className="h-3 w-12 lg:w-16" />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <div className="flex items-end space-x-1.5 lg:space-x-2 max-w-xs lg:max-w-md">
              <div className="space-y-1">
                <Skeleton className="h-10 lg:h-12 w-32 lg:w-40 rounded-lg" />
                <Skeleton className="h-3 w-12 lg:w-16" />
              </div>
            </div>
          </div>
          <div className="flex justify-start">
            <div className="flex items-end space-x-1.5 lg:space-x-2 max-w-xs lg:max-w-md">
              <Skeleton className="h-5 w-5 lg:h-6 lg:w-6 rounded-full mb-1" />
              <div className="space-y-1">
                <Skeleton className="h-10 lg:h-12 w-36 lg:w-44 rounded-lg" />
                <Skeleton className="h-3 w-12 lg:w-16" />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <div className="flex items-end space-x-1.5 lg:space-x-2 max-w-xs lg:max-w-md">
              <div className="space-y-1">
                <Skeleton className="h-10 lg:h-12 w-28 lg:w-36 rounded-lg" />
                <Skeleton className="h-3 w-12 lg:w-16" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Input Skeleton */}
      <div className="p-3 lg:p-4 border-t border-border bg-card">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8 lg:h-10 lg:w-10 rounded-md hidden lg:block" />
          <Skeleton className="flex-1 h-9 lg:h-10 rounded-md" />
          <Skeleton className="h-9 w-9 lg:h-10 lg:w-10 rounded-md" />
        </div>
      </div>
    </div>
  );
}

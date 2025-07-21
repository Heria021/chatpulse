"use client";

import { useState } from "react";
import { MessageCircle, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "./sidebar";
import { SidebarSkeleton } from "@/components/ui/skeletons";

interface AppLayoutProps {
  children: React.ReactNode;
  sidebar?: boolean;
  mobileHeaderExtra?: React.ReactNode;
  isLoading?: boolean;
}

export function AppLayout({ children, sidebar = true, mobileHeaderExtra, isLoading = false }: AppLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <TooltipProvider>
      <div className="h-screen bg-background flex overflow-hidden">
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        {sidebar && (
          isLoading ? (
            <div className="hidden lg:block">
              <SidebarSkeleton />
            </div>
          ) : (
            <Sidebar
              isOpen={isMobileMenuOpen}
              onClose={() => setIsMobileMenuOpen(false)}
            />
          )
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-h-0">
          {/* Mobile Header - Loading State */}
          {sidebar && isLoading && (
            <header className="lg:hidden bg-card border-b border-border p-2 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 bg-muted rounded-md animate-pulse" />
                <div className="flex items-center space-x-2">
                  <div className="h-7 w-7 bg-muted rounded-md animate-pulse" />
                  <div className="h-5 w-20 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-10 w-10 bg-muted rounded-md animate-pulse" />
              </div>
            </header>
          )}

          {/* Mobile Header - Normal State */}
          {sidebar && !isLoading && (
            <header className="lg:hidden bg-card border-b border-border p-2 flex-shrink-0">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-primary rounded-md">
                    <MessageCircle className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <h1 className="font-bold">ChatPulse</h1>
                </div>
                {mobileHeaderExtra || (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 pointer-events-none"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </header>
          )}

          {/* Content Area */}
          <div className="flex-1 min-h-0">
            {children}
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}

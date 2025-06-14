"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth-context";
import { 
  MessageCircle, 
  Users, 
  Settings, 
  LogOut, 
  User,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Get current active section from pathname
  const activeSection = pathname.split('/')[1] || 'chat';

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const navigateToSection = (route: string) => {
    router.push(route);
    onClose?.();
  };

  const navigationItems = [
    {
      id: 'chat',
      label: 'Chats',
      icon: MessageCircle,
      description: 'View your conversations',
      route: '/chat'
    },
    {
      id: 'users',
      label: 'Users',
      icon: Users,
      description: 'Browse online users',
      route: '/users'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      description: 'Edit your profile',
      route: '/profile'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'App preferences',
      route: '/settings'
    }
  ];

  if (!user) return null;

  return (
    <TooltipProvider>
      <div className={cn(
        "fixed lg:relative inset-y-0 left-0 z-50 w-16",
        "bg-background border-r",
        "flex flex-col",
        "transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <MessageCircle className="h-5 w-5 text-primary-foreground" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 lg:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Separator />

        {/* User Avatar */}
        <div className="flex h-16 items-center justify-center px-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <div className="text-center">
                <p className="font-medium">{user.username}</p>
                <p className="text-xs text-muted-foreground">
                  {user.isGuest ? 'Guest User' : 'Registered User'}
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator />

        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-3">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <div key={item.id} className="flex justify-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      size="icon"
                      className="h-12 w-12"
                      onClick={() => navigateToSection(item.route)}
                    >
                      <Icon className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            );
          })}
        </nav>

        <Separator />

        {/* Sign Out */}
        <div className="flex h-16 items-center justify-center px-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <div>
                <p className="font-medium">Sign Out</p>
                <p className="text-xs text-muted-foreground">Leave ChatNow</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
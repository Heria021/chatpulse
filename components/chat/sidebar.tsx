"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth-context";
import { useGroupInvitations } from "@/lib/hooks/use-group-invitations";
import {
  MessageCircle,
  Search,
  Settings,
  LogOut,
  UserCircle,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { invitationCount } = useGroupInvitations();

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
      id: 'groups',
      label: 'Groups',
      icon: Users,
      description: 'Join and manage groups',
      route: '/groups'
    },
    {
      id: 'users',
      label: 'Users',
      icon: Search,
      description: 'Browse online users',
      route: '/users'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: UserCircle,
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
        "fixed lg:relative inset-y-0 left-0 z-50 w-64 lg:w-16",
        "bg-background border-r",
        "flex flex-col",
        "transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header */}
        <div className="flex h-16 items-center justify-center lg:justify-center px-3">
          <div className="flex items-center space-x-3 lg:space-x-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <MessageCircle className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="font-bold text-lg lg:hidden">ChatNow</h1>
          </div>
        </div>

        <Separator />

        {/* User Avatar */}
        <div className="flex h-16 items-center justify-center lg:justify-center px-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" className="h-12 w-full lg:w-12 rounded-full lg:rounded-full justify-start lg:justify-center px-3 lg:px-0">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarFallback>
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3 lg:hidden text-left">
                  <p className="font-medium text-sm">{user.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.isGuest ? 'Guest User' : 'Registered User'}
                  </p>
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="lg:block hidden">
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
              <div key={item.id} className="flex justify-center lg:justify-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className="h-12 w-full lg:w-12 justify-start lg:justify-center px-3 lg:px-0 relative"
                      onClick={() => navigateToSection(item.route)}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span className="ml-3 lg:hidden font-medium">{item.label}</span>
                      {item.id === 'groups' && invitationCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-1 -right-1 lg:-top-1 lg:-right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                        >
                          {invitationCount > 9 ? '9+' : invitationCount}
                        </Badge>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="lg:block hidden">
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

        {/* Theme Toggle */}
        <div className="flex h-16 items-center justify-center px-3">
          <ThemeToggle showTooltip={true} />
        </div>

        <Separator />

        {/* Sign Out */}
        <div className="flex h-16 items-center justify-center px-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="h-12 w-full lg:w-12 text-destructive hover:bg-destructive/10 hover:text-destructive justify-start lg:justify-center px-3 lg:px-0"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                <span className="ml-3 lg:hidden font-medium">Sign Out</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="lg:block hidden">
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
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/contexts/auth-context";
import { getSessionToken } from "@/lib/utils/auth";

export function useUnreadCounts() {
  const { isAuthenticated } = useAuth();
  const sessionToken = getSessionToken();

  // Fetch users with mutual chats to get unread counts
  const chatUsers = useQuery(
    api.users.getUsersWithMutualChats,
    sessionToken && isAuthenticated
      ? { sessionToken }
      : "skip"
  );

  // Calculate total unread messages and users with new messages
  const totalUnreadCount = chatUsers?.reduce((total, user) => total + user.unreadCount, 0) || 0;
  const usersWithNewMessages = chatUsers?.filter(user => user.unreadCount > 0).length || 0;

  return {
    totalUnreadCount,
    usersWithNewMessages,
    isLoading: chatUsers === undefined
  };
}

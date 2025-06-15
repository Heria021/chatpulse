"use client";

import { useEffect, useRef, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getSessionToken } from "@/lib/utils/auth";

// Activity types that should trigger status updates
export const ACTIVITY_TYPES = {
  MESSAGE_SENT: "message_sent",
  MESSAGE_READ: "message_read",
  TYPING_STARTED: "typing_started",
  CONVERSATION_OPENED: "conversation_opened",
  FILE_UPLOADED: "file_uploaded",
  HEARTBEAT: "heartbeat"
} as const;

export type ActivityType = typeof ACTIVITY_TYPES[keyof typeof ACTIVITY_TYPES];

interface UseOnlineStatusOptions {
  enabled?: boolean;
  heartbeatInterval?: number; // in milliseconds
}

export function useOnlineStatus(options: UseOnlineStatusOptions = {}) {
  const {
    enabled = true,
    heartbeatInterval = 30000 // 30 seconds
  } = options;

  const updateActivity = useMutation(api.presence.updateUserActivity);
  const heartbeat = useMutation(api.presence.heartbeat);
  const bootstrapOnlineStatus = useMutation(api.presence.bootstrapOnlineStatus);
  
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(true);
  const lastActivityRef = useRef(Date.now());

  // Track user activity
  const trackActivity = useCallback(async (activity: ActivityType, metadata?: string) => {
    if (!enabled) return;
    
    const sessionToken = getSessionToken();
    if (!sessionToken) return;

    try {
      await updateActivity({
        sessionToken,
        activity,
        metadata
      });
      lastActivityRef.current = Date.now();
    } catch (error) {
      console.error("Failed to track activity:", error);
    }
  }, [enabled, updateActivity]);

  // Send heartbeat
  const sendHeartbeat = useCallback(async () => {
    if (!enabled || !isActiveRef.current) return;
    
    const sessionToken = getSessionToken();
    if (!sessionToken) return;

    try {
      await heartbeat({ sessionToken });
    } catch (error) {
      console.error("Failed to send heartbeat:", error);
    }
  }, [enabled, heartbeat]);

  // Handle visibility change
  const handleVisibilityChange = useCallback(() => {
    const isVisible = !document.hidden;
    isActiveRef.current = isVisible;

    if (isVisible) {
      // User came back to the app
      trackActivity(ACTIVITY_TYPES.HEARTBEAT, "tab_visible");
      
      // Restart heartbeat
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      heartbeatIntervalRef.current = setInterval(sendHeartbeat, heartbeatInterval);
    } else {
      // User left the app
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    }
  }, [trackActivity, sendHeartbeat, heartbeatInterval]);

  // Handle user activity events
  const handleUserActivity = useCallback(() => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;

    // Only track if it's been more than 60 seconds since last activity
    // This prevents constant updates from minor interactions
    if (timeSinceLastActivity > 60000) {
      trackActivity(ACTIVITY_TYPES.HEARTBEAT, "user_interaction");
    }
  }, [trackActivity]);

  // Bootstrap online status immediately on page load
  const bootstrapStatus = useCallback(async () => {
    if (!enabled || typeof window === 'undefined') return;

    const sessionToken = getSessionToken();
    if (!sessionToken) return;

    try {
      // Immediately bootstrap online status - this happens first!
      await bootstrapOnlineStatus({ sessionToken });
      console.log("✅ Bootstrap online status successful");
    } catch (error) {
      console.error("❌ Failed to bootstrap online status:", error);
      // Fallback to regular activity tracking
      trackActivity(ACTIVITY_TYPES.HEARTBEAT, "page_load_fallback");
    }
  }, [enabled, bootstrapOnlineStatus, trackActivity]);

  // Setup and cleanup
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Immediately bootstrap online status on page load
    bootstrapStatus();

    // Start heartbeat for maintaining session
    heartbeatIntervalRef.current = setInterval(sendHeartbeat, heartbeatInterval);

    // Setup visibility change listener
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Setup user activity listeners
    const activityEvents = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    activityEvents.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Cleanup function
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
    };
  }, [enabled, trackActivity, sendHeartbeat, heartbeatInterval, handleVisibilityChange, handleUserActivity]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, []);

  return {
    trackActivity,
    sendHeartbeat,
    isActive: isActiveRef.current
  };
}

// Hook for getting user status
export function useUserStatus(userId?: string) {
  // This would be implemented with a query to get user status
  // For now, returning a placeholder
  return {
    status: "offline" as const,
    lastSeen: null,
    showOnlineStatus: true
  };
}

// Hook for getting online users in a conversation
export function useOnlineUsersInConversation(conversationId?: string) {
  // This would be implemented with a query to get online users
  // For now, returning a placeholder
  return {
    onlineUsers: [],
    isLoading: false
  };
}

"use client";

import { cn } from "@/lib/utils";

export type UserStatus = "online" | "recently_active" | "away" | "offline";

interface StatusIndicatorProps {
  status: UserStatus;
  showOnlineStatus?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  showLabel?: boolean;
  lastSeen?: number;
}

// Helper function to format last seen time
function formatLastSeen(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) {
    return "Just now";
  } else if (minutes < 60) {
    return `${minutes}m ago`;
  } else if (hours < 24) {
    return `${hours}h ago`;
  } else if (days < 7) {
    return `${days}d ago`;
  } else {
    return "Long time ago";
  }
}

// Get status display info
function getStatusInfo(status: UserStatus, lastSeen?: number) {
  switch (status) {
    case "online":
      return {
        color: "bg-green-500",
        label: "Online",
        description: "Active now"
      };
    case "recently_active":
      return {
        color: "bg-green-500", // Same green color as online
        label: "Online", // Same label as online
        description: "Active now" // Same description as online
      };
    case "away":
      return {
        color: "bg-gray-400",
        label: "Away",
        description: lastSeen ? formatLastSeen(lastSeen) : "Away"
      };
    case "offline":
    default:
      return {
        color: "bg-gray-300",
        label: "Offline",
        description: lastSeen ? `Last seen ${formatLastSeen(lastSeen)}` : "Offline"
      };
  }
}

export function StatusIndicator({
  status,
  showOnlineStatus = true,
  size = "md",
  className,
  showLabel = false,
  lastSeen
}: StatusIndicatorProps) {
  // Don't show anything if user has disabled online status
  if (!showOnlineStatus) {
    return null;
  }

  const statusInfo = getStatusInfo(status, lastSeen);
  
  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4"
  };

  const dotSize = sizeClasses[size];

  if (showLabel) {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <div className="relative">
          <div
            className={cn(
              "rounded-full border-2 border-white",
              statusInfo.color,
              dotSize
            )}
            title={statusInfo.description}
          />
          {status === "online" && (
            <div
              className={cn(
                "absolute inset-0 rounded-full animate-ping",
                statusInfo.color,
                "opacity-75"
              )}
            />
          )}
        </div>
        <span className="text-sm text-muted-foreground">
          {statusInfo.label}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)} title={statusInfo.description}>
      <div
        className={cn(
          "rounded-full border-2 border-white",
          statusInfo.color,
          dotSize
        )}
      />
      {status === "online" && (
        <div
          className={cn(
            "absolute inset-0 rounded-full animate-ping",
            statusInfo.color,
            "opacity-75"
          )}
        />
      )}
    </div>
  );
}

// Compact status indicator for avatars
export function AvatarStatusIndicator({
  status,
  showOnlineStatus = true,
  className
}: {
  status: UserStatus;
  showOnlineStatus?: boolean;
  className?: string;
}) {
  if (!showOnlineStatus || status === "offline") {
    return null;
  }

  const statusInfo = getStatusInfo(status);

  return (
    <div
      className={cn(
        "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white",
        statusInfo.color,
        className
      )}
      title={statusInfo.description}
    >
      {status === "online" && (
        <div
          className={cn(
            "absolute inset-0 rounded-full animate-ping opacity-75",
            statusInfo.color
          )}
        />
      )}
    </div>
  );
}

// Status badge for user lists
export function StatusBadge({
  status,
  showOnlineStatus = true,
  lastSeen,
  className
}: {
  status: UserStatus;
  showOnlineStatus?: boolean;
  lastSeen?: number;
  className?: string;
}) {
  if (!showOnlineStatus) {
    return null;
  }

  const statusInfo = getStatusInfo(status, lastSeen);

  return (
    <div
      className={cn(
        "inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium",
        {
          "bg-green-100 text-green-800": status === "online",
          "bg-green-100 text-green-800": status === "recently_active", // Same as online
          "bg-gray-100 text-gray-800": status === "away",
          "bg-gray-50 text-gray-600": status === "offline"
        },
        className
      )}
    >
      <div
        className={cn(
          "h-2 w-2 rounded-full",
          statusInfo.color
        )}
      />
      <span>{statusInfo.label}</span>
    </div>
  );
}

// Last seen text component
export function LastSeenText({
  lastSeen,
  status,
  className
}: {
  lastSeen?: number;
  status: UserStatus;
  className?: string;
}) {
  if (!lastSeen || status === "online") {
    return null;
  }

  return (
    <span className={cn("text-xs text-muted-foreground", className)}>
      Last seen {formatLastSeen(lastSeen)}
    </span>
  );
}

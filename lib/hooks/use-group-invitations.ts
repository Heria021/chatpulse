import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/contexts/auth-context";
import { getSessionToken } from "@/lib/utils/auth";

export function useGroupInvitations() {
  const { user, isAuthenticated } = useAuth();
  const sessionToken = getSessionToken();

  // Get user's pending invitations
  const invitations = useQuery(
    api.groups.getUserInvitations,
    sessionToken && isAuthenticated && user ? { sessionToken } : "skip"
  );

  const invitationCount = invitations?.length || 0;
  const hasInvitations = invitationCount > 0;

  return {
    invitations,
    invitationCount,
    hasInvitations,
  };
}

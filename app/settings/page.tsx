"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth-context";
import { Loader2, Settings } from "lucide-react";
import { AppLayout } from "@/components/chat/app-layout";
import { GuestSettings } from "@/components/settings/guest-settings";
import { UserSettings } from "@/components/settings/user-settings";

export default function SettingsPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Show nothing if not authenticated (will redirect)
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <AppLayout sidebar={true}>
      <div className="flex flex-col h-full min-h-0">
        <div className="flex-1 overflow-y-auto">
          <div className="p-2 lg:p-6">
            <div className="max-w-2xl mx-auto space-y-3 lg:space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg lg:text-3xl font-bold">Settings</h1>
                  <p className="text-xs lg:text-base text-muted-foreground">
                    {user.isGuest
                      ? "Manage your guest session and upgrade to a full account"
                      : "Manage your account and privacy settings"
                    }
                  </p>
                </div>
              </div>

              {/* Settings Content */}
              {user.isGuest ? (
                <GuestSettings user={user} />
              ) : (
                <UserSettings user={user} />
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

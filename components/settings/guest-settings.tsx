"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/contexts/auth-context";
import { toast } from "sonner";
import { User } from "@/lib/types/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  UserPlus, 
  Clock, 
  Eye, 
  MessageCircle, 
  Info,
  Loader2,
  Crown,
  Shield
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const upgradeSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type UpgradeFormData = z.infer<typeof upgradeSchema>;

interface GuestSettingsProps {
  user: User;
}

export function GuestSettings({ user }: GuestSettingsProps) {
  const router = useRouter();
  const { upgradeGuestAccount } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [showUpgradeForm, setShowUpgradeForm] = useState(false);
  const [settings, setSettings] = useState({
    allowGuestMessages: user.allowGuestMessages,
    showOnlineStatus: user.showOnlineStatus,
  });

  const form = useForm<UpgradeFormData>({
    resolver: zodResolver(upgradeSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const timeRemaining = user.guestExpiresAt ? user.guestExpiresAt - Date.now() : 0;
  const hoursRemaining = Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60)));
  const minutesRemaining = Math.max(0, Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60)));

  const handleUpgrade = async (data: UpgradeFormData) => {
    try {
      setIsUpgrading(true);
      await upgradeGuestAccount(data.email, data.password);

      toast.success("Account upgraded successfully!");
      router.push("/settings");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upgrade account";
      toast.error(message);
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="space-y-3 lg:space-y-6">
      {/* Guest Status */}
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
        <CardHeader className="pb-2 lg:pb-4">
          <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300 text-sm lg:text-lg">
            <Clock className="h-4 w-4 lg:h-5 lg:w-5" />
            Guest Session
          </CardTitle>
          <CardDescription className="text-amber-600 dark:text-amber-400 text-xs lg:text-sm">
            Your guest session will expire in {hoursRemaining}h {minutesRemaining}m
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 lg:space-y-4 pt-2 lg:pt-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm lg:text-base truncate">Username: {user.username}</p>
              <p className="text-xs lg:text-sm text-muted-foreground">
                Created {formatDistanceToNow(user.createdAt)} ago
              </p>
            </div>
            <Badge variant="outline" className="text-amber-600 border-amber-300 text-xs flex-shrink-0">
              Guest
            </Badge>
          </div>

          <Alert>
            <Info className="h-3 w-3 lg:h-4 lg:w-4" />
            <AlertDescription className="text-xs lg:text-sm">
              Guest accounts are temporary and will be deleted after 24 hours.
              Upgrade to a full account to keep your data and access all features.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Upgrade to Full Account */}
      <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
        <CardHeader className="pb-2 lg:pb-4">
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300 text-sm lg:text-lg">
            <Crown className="h-4 w-4 lg:h-5 lg:w-5" />
            Upgrade to Full Account
          </CardTitle>
          <CardDescription className="text-green-600 dark:text-green-400 text-xs lg:text-sm">
            Keep your data forever and unlock all features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 lg:space-y-4 pt-2 lg:pt-4">
          {!showUpgradeForm ? (
            <>
              <div className="space-y-2 lg:space-y-3">
                <h4 className="font-medium text-sm lg:text-base">Benefits of upgrading:</h4>
                <ul className="space-y-1.5 lg:space-y-2 text-xs lg:text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Shield className="h-3 w-3 lg:h-4 lg:w-4 text-green-500 flex-shrink-0" />
                    <span>Keep your username and chat history forever</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-3 w-3 lg:h-4 lg:w-4 text-green-500 flex-shrink-0" />
                    <span>Password protection for your account</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-3 w-3 lg:h-4 lg:w-4 text-green-500 flex-shrink-0" />
                    <span>Access from multiple devices</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-3 w-3 lg:h-4 lg:w-4 text-green-500 flex-shrink-0" />
                    <span>Advanced privacy and security settings</span>
                  </li>
                </ul>
              </div>

              <Button
                onClick={() => setShowUpgradeForm(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-xs lg:text-sm"
                size="sm"
              >
                <UserPlus className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                Upgrade Now
              </Button>
            </>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleUpgrade)} className="space-y-3 lg:space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs lg:text-sm">Email Address</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="Enter your email"
                          disabled={isUpgrading}
                          className="text-sm"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs lg:text-sm">Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Create a password"
                          disabled={isUpgrading}
                          className="text-sm"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs lg:text-sm">Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Confirm your password"
                          disabled={isUpgrading}
                          className="text-sm"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 pt-3 lg:pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowUpgradeForm(false)}
                    disabled={isUpgrading}
                    className="flex-1 text-xs lg:text-sm"
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isUpgrading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-xs lg:text-sm"
                    size="sm"
                  >
                    {isUpgrading && <Loader2 className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4 animate-spin" />}
                    Upgrade Account
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>

      {/* Basic Privacy Settings */}
      <Card>
        <CardHeader className="pb-2 lg:pb-4">
          <CardTitle className="flex items-center gap-2 text-sm lg:text-lg">
            <Eye className="h-4 w-4 lg:h-5 lg:w-5" />
            Privacy Settings
          </CardTitle>
          <CardDescription className="text-xs lg:text-sm">
            Basic privacy controls for your guest session
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 lg:space-y-6 pt-2 lg:pt-4">
          <div className="flex items-center justify-between rounded-lg border p-2 lg:p-3">
            <div className="space-y-0.5 min-w-0 flex-1">
              <Label htmlFor="show-online-status" className="text-xs lg:text-base font-medium">
                Show Online Status
              </Label>
              <p className="text-xs text-muted-foreground hidden lg:block">
                Let others see when you're online
              </p>
            </div>
            <Switch
              id="show-online-status"
              checked={settings.showOnlineStatus}
              onCheckedChange={(checked) =>
                setSettings(prev => ({ ...prev, showOnlineStatus: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-2 lg:p-3">
            <div className="space-y-0.5 min-w-0 flex-1">
              <Label htmlFor="allow-guest-messages" className="text-xs lg:text-base font-medium">
                Allow Messages from Other Guests
              </Label>
              <p className="text-xs text-muted-foreground hidden lg:block">
                Let other guest users message you
              </p>
            </div>
            <Switch
              id="allow-guest-messages"
              checked={settings.allowGuestMessages}
              onCheckedChange={(checked) =>
                setSettings(prev => ({ ...prev, allowGuestMessages: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Session Info */}
      <Card>
        <CardHeader className="pb-2 lg:pb-4">
          <CardTitle className="flex items-center gap-2 text-sm lg:text-lg">
            <MessageCircle className="h-4 w-4 lg:h-5 lg:w-5" />
            Session Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 lg:space-y-4 pt-2 lg:pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 text-xs lg:text-sm">
            <div>
              <p className="font-medium">Session Started</p>
              <p className="text-muted-foreground">
                {formatDistanceToNow(user.createdAt)} ago
              </p>
            </div>
            <div>
              <p className="font-medium">Expires In</p>
              <p className="text-muted-foreground">
                {hoursRemaining}h {minutesRemaining}m
              </p>
            </div>
          </div>

          <Alert>
            <Info className="h-3 w-3 lg:h-4 lg:w-4" />
            <AlertDescription className="text-xs lg:text-sm">
              All your messages and data will be permanently deleted when your guest session expires.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

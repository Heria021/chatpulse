"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Key,
  Eye,
  EyeOff,
  Shield,
  User as UserIcon,
  Trash2,
  Loader2,
  CheckCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

interface UserSettingsProps {
  user: User;
}

export function UserSettings({ user }: UserSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [settings, setSettings] = useState({
    allowGuestMessages: user.allowGuestMessages,
    showOnlineStatus: user.showOnlineStatus,
  });

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handlePasswordChange = async (data: ChangePasswordFormData) => {
    try {
      setIsLoading(true);
      // Add your password change logic here
      toast.success("Password changed successfully");
      form.reset();
      setShowChangePasswordForm(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to change password";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrivacyChange = async (setting: keyof typeof settings, value: boolean) => {
    try {
      setSettings(prev => ({ ...prev, [setting]: value }));
      // Add your privacy settings update logic here
      toast.success("Privacy settings updated");
    } catch (error) {
      setSettings(prev => ({ ...prev, [setting]: !value }));
      toast.error("Failed to update settings");
    }
  };

  return (
    <div className="space-y-3 lg:space-y-6">
      {/* Account Overview */}
      <Card>
        <CardHeader className="pb-2 lg:pb-4">
          <CardTitle className="flex items-center gap-2 text-sm lg:text-lg">
            <UserIcon className="h-4 w-4 lg:h-5 lg:w-5" />
            Account Overview
          </CardTitle>
          <CardDescription className="text-xs lg:text-sm">
            Your account information and status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 lg:space-y-4 pt-2 lg:pt-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm lg:text-base truncate">Username: {user.username}</p>
              <p className="text-xs lg:text-sm text-muted-foreground">
                Member since {formatDistanceToNow(user.createdAt)} ago
              </p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs flex-shrink-0">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          </div>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 text-xs lg:text-sm">
            <div>
              <p className="font-medium">Email</p>
              <p className="text-muted-foreground truncate">
                {user.email ? `${user.email.substring(0, 3)}***@${user.email.split('@')[1]}` : 'Not set'}
              </p>
            </div>
            <div>
              <p className="font-medium">Account Type</p>
              <p className="text-muted-foreground">Full Account</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader className="pb-2 lg:pb-4">
          <CardTitle className="flex items-center gap-2 text-sm lg:text-lg">
            <Shield className="h-4 w-4 lg:h-5 lg:w-5" />
            Security
          </CardTitle>
          <CardDescription className="text-xs lg:text-sm">
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 lg:space-y-4 pt-2 lg:pt-4">
          {!showChangePasswordForm ? (
            <div className="flex items-center justify-between p-2 lg:p-3 border rounded-lg">
              <div className="space-y-0.5 min-w-0 flex-1">
                <p className="font-medium text-sm lg:text-base">Password</p>
                <p className="text-xs text-muted-foreground">
                  Keep your account secure with a strong password
                </p>
              </div>
              <Button
                onClick={() => setShowChangePasswordForm(true)}
                variant="outline"
                size="sm"
                className="text-xs lg:text-sm flex-shrink-0"
              >
                <Key className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                Change
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handlePasswordChange)} className="space-y-3 lg:space-y-4">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs lg:text-sm">Current Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showCurrentPassword ? "text" : "password"}
                            placeholder="Enter current password"
                            disabled={isLoading}
                            className="text-sm"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            disabled={isLoading}
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="h-3 w-3 lg:h-4 lg:w-4" />
                            ) : (
                              <Eye className="h-3 w-3 lg:h-4 lg:w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs lg:text-sm">New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            disabled={isLoading}
                            className="text-sm"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            disabled={isLoading}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-3 w-3 lg:h-4 lg:w-4" />
                            ) : (
                              <Eye className="h-3 w-3 lg:h-4 lg:w-4" />
                            )}
                          </Button>
                        </div>
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
                      <FormLabel className="text-xs lg:text-sm">Confirm New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm new password"
                            disabled={isLoading}
                            className="text-sm"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={isLoading}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-3 w-3 lg:h-4 lg:w-4" />
                            ) : (
                              <Eye className="h-3 w-3 lg:h-4 lg:w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 pt-3 lg:pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowChangePasswordForm(false)}
                    disabled={isLoading}
                    className="flex-1 text-xs lg:text-sm"
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 text-xs lg:text-sm"
                    size="sm"
                  >
                    {isLoading && <Loader2 className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4 animate-spin" />}
                    Change Password
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader className="pb-2 lg:pb-4">
          <CardTitle className="flex items-center gap-2 text-sm lg:text-lg">
            <Eye className="h-4 w-4 lg:h-5 lg:w-5" />
            Privacy Settings
          </CardTitle>
          <CardDescription className="text-xs lg:text-sm">
            Control who can see your information and contact you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 lg:space-y-6 pt-2 lg:pt-4">
          <div className="flex items-center justify-between rounded-lg border p-2 lg:p-3">
            <div className="space-y-0.5 min-w-0 flex-1">
              <Label htmlFor="show-online-status" className="text-xs lg:text-base font-medium">
                Show Online Status
              </Label>
              <p className="text-xs text-muted-foreground hidden lg:block">
                Let others see when you're online and your last seen time
              </p>
            </div>
            <Switch
              id="show-online-status"
              checked={settings.showOnlineStatus}
              onCheckedChange={(checked) => handlePrivacyChange('showOnlineStatus', checked)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-2 lg:p-3">
            <div className="space-y-0.5 min-w-0 flex-1">
              <Label htmlFor="allow-guest-messages" className="text-xs lg:text-base font-medium">
                Allow Guest Messages
              </Label>
              <p className="text-xs text-muted-foreground hidden lg:block">
                Let guest users send you messages
              </p>
            </div>
            <Switch
              id="allow-guest-messages"
              checked={settings.allowGuestMessages}
              onCheckedChange={(checked) => handlePrivacyChange('allowGuestMessages', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <div className="pt-3 lg:pt-6">
        <div className="flex items-center justify-between p-3 lg:p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950/20">
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm lg:text-base text-red-700 dark:text-red-300">Delete Account</p>
            <p className="text-xs lg:text-sm text-red-600 dark:text-red-400">
              Permanently delete your account and all data
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="text-xs lg:text-sm flex-shrink-0">
                <Trash2 className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Your Account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your account and all your messages. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700">
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}

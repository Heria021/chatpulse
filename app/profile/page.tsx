"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { useAuth } from "@/lib/contexts/auth-context";
import { Loader2, User, Edit, Save, X, Calendar, Mail, Shield, Eye, Clock, Crown, ArrowUp } from "lucide-react";
import { AppLayout } from "@/components/chat/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { updateProfileSchema, UpdateProfileFormData } from "@/lib/types/auth";
import { api } from "@/convex/_generated/api";
import { getSessionToken } from "@/lib/utils/auth";
import { toast } from "sonner";

// Helper function to generate avatar initials
function getAvatarInitials(username: string): string {
  return username
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUpgradeForm, setShowUpgradeForm] = useState(false);

  // Get session token for API calls
  const sessionToken = getSessionToken();

  // Update profile mutation
  const updateProfileMutation = useMutation(api.users.updateProfile);

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [isAuthenticated, isLoading, router]);

  // Form setup
  const form = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      username: user?.username || "",
      bio: user?.bio || "",
      age: user?.age || 18,
      gender: user?.gender || "other",
      allowGuestMessages: user?.allowGuestMessages ?? true,
      showOnlineStatus: user?.showOnlineStatus ?? true,
    },
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username,
        bio: user.bio || "",
        age: user.age,
        gender: user.gender,
        allowGuestMessages: user.allowGuestMessages,
        showOnlineStatus: user.showOnlineStatus,
      });
    }
  }, [user, form]);

  const handleUpdateProfile = async (data: UpdateProfileFormData) => {
    if (!sessionToken) return;

    try {
      setIsSubmitting(true);
      await updateProfileMutation({
        sessionToken,
        username: data.username,
        bio: data.bio || undefined,
        age: data.age,
        gender: data.gender,
        allowGuestMessages: data.allowGuestMessages,
        showOnlineStatus: data.showOnlineStatus,
      });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    form.reset();
    setIsEditing(false);
  };

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
                  <h1 className="text-lg lg:text-3xl font-bold">Profile</h1>
                  <p className="text-xs lg:text-base text-muted-foreground">Manage your account information and preferences</p>
                </div>
                {!isEditing && (
                  <div className="flex items-center gap-2">
                    {user.isGuest && (
                      <Button
                        onClick={() => router.push('/settings')}
                        size="sm"
                        variant="default"
                        className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm flex-shrink-0 bg-gradient-to-r from-primary to-primary/80 shadow-lg"
                      >
                        <Crown className="h-3 w-3 lg:h-4 lg:w-4" />
                        <span className="hidden sm:inline">Upgrade Account</span>
                        <span className="sm:hidden">Upgrade</span>
                      </Button>
                    )}
                    <Button
                      onClick={() => setIsEditing(true)}
                      size="sm"
                      variant={user.isGuest ? "outline" : "default"}
                      className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm flex-shrink-0"
                    >
                      <Edit className="h-3 w-3 lg:h-4 lg:w-4" />
                      <span className="hidden sm:inline">Edit Profile</span>
                      <span className="sm:hidden">Edit</span>
                    </Button>
                  </div>
                )}
              </div>

              {/* Profile Card */}
              <Card className="shadow-lg">
                <CardHeader className="pb-3 lg:pb-4">
                  <div className="flex items-start space-x-3 lg:space-x-4">
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-14 w-14 lg:h-20 lg:w-20 ring-2 ring-primary/20">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-sm lg:text-xl font-semibold">
                          {getAvatarInitials(user.username)}
                        </AvatarFallback>
                      </Avatar>
                      {user.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 lg:h-5 lg:w-5 bg-green-500 border-2 border-background rounded-full" />
                      )}
                    </div>
                    <div className="space-y-1 lg:space-y-2 min-w-0 flex-1">
                      <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
                        <CardTitle className="text-lg lg:text-2xl truncate">{user.username}</CardTitle>
                        <div className="flex items-center gap-1.5">
                          <Badge variant={user.isGuest ? "secondary" : "default"} className="text-xs font-medium">
                            {user.isGuest ? "Guest" : "Member"}
                          </Badge>
                          {user.isOnline && (
                            <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                              Online
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Quick Info Row */}
                      <div className="flex items-center gap-3 lg:gap-4 text-xs lg:text-sm text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{user.age} years</span>
                        </div>
                        <div className="flex items-center gap-1 capitalize">
                          <User className="h-3 w-3" />
                          <span>{user.gender}</span>
                        </div>
                        {!user.isGuest && user.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span className="truncate max-w-[150px] lg:max-w-[200px]">{user.email}</span>
                          </div>
                        )}
                        {user.lastSeen && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Last seen {new Date(user.lastSeen).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {user.bio && (
                        <CardDescription className="text-xs lg:text-sm leading-relaxed line-clamp-2 pt-1">
                          {user.bio}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 lg:space-y-6 pt-3 lg:pt-4">
                  {!isEditing ? (
                    // View Mode
                    <div className="space-y-4 lg:space-y-6">
                      {/* Upgrade Notice for Guest Users */}
                      {user.isGuest && (
                        <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg">
                          <div className="flex items-start gap-3">
                            <Crown className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <div className="flex-1 space-y-2">
                              <h3 className="text-sm lg:text-base font-semibold text-primary">Upgrade to Full Account</h3>
                              <p className="text-xs lg:text-sm text-muted-foreground">
                                Get access to all features including permanent account, email notifications, and enhanced security.
                              </p>
                              <Button
                                onClick={() => router.push('/settings')}
                                size="sm"
                                className="bg-gradient-to-r from-primary to-primary/80 shadow-lg text-xs lg:text-sm"
                              >
                                <ArrowUp className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                                Upgrade Now
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Account Information */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          <h3 className="text-sm lg:text-base font-semibold">Account Information</h3>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="text-xs lg:text-sm font-medium">Account Type</span>
                            </div>
                            <Badge variant={user.isGuest ? "secondary" : "default"} className="text-xs">
                              {user.isGuest ? "Guest Account" : "Full Account"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-xs lg:text-sm font-medium">Age</span>
                            </div>
                            <span className="text-xs lg:text-sm font-semibold">{user.age} years old</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="text-xs lg:text-sm font-medium">Gender</span>
                            </div>
                            <span className="text-xs lg:text-sm font-semibold capitalize">{user.gender}</span>
                          </div>
                          {!user.isGuest && user.email && (
                            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs lg:text-sm font-medium">Email</span>
                              </div>
                              <span className="text-xs lg:text-sm font-semibold truncate max-w-[120px] lg:max-w-[200px]">{user.email}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Privacy Settings */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-primary" />
                          <h3 className="text-sm lg:text-base font-semibold">Privacy Settings</h3>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <Label className="text-xs lg:text-sm font-medium">Guest Messages</Label>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 hidden lg:block">
                                Allow guest users to send you messages
                              </p>
                            </div>
                            <Badge variant={user.allowGuestMessages ? "default" : "secondary"} className="text-xs flex-shrink-0">
                              {user.allowGuestMessages ? "Enabled" : "Disabled"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4 text-muted-foreground" />
                                <Label className="text-xs lg:text-sm font-medium">Online Status</Label>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 hidden lg:block">
                                Show others when you're online and active
                              </p>
                            </div>
                            <Badge variant={user.showOnlineStatus ? "default" : "secondary"} className="text-xs flex-shrink-0">
                              {user.showOnlineStatus ? "Visible" : "Hidden"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Edit Mode
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleUpdateProfile)} className="space-y-4 lg:space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-primary" />
                            <h3 className="text-sm lg:text-base font-semibold">Basic Information</h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                          <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs lg:text-sm">Username</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter username" className="text-sm" {...field} />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="age"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs lg:text-sm">Age</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="Enter age"
                                    className="text-sm"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 18)}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                          </div>
                        </div>

                        {/* Bio Section */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Edit className="h-4 w-4 text-primary" />
                            <h3 className="text-sm lg:text-base font-semibold">About</h3>
                          </div>
                          <FormField
                          control={form.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs lg:text-sm">Gender</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="text-sm">
                                    <SelectValue placeholder="Select gender" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="male">Male</SelectItem>
                                  <SelectItem value="female">Female</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="bio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs lg:text-sm">Bio</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Tell others about yourself..."
                                  className="resize-none text-sm"
                                  rows={2}
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription className="text-xs">
                                Optional. Maximum 200 characters.
                              </FormDescription>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                          />
                        </div>

                        <div className="space-y-3 lg:space-y-4 pt-4 border-t">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-primary" />
                            <h3 className="text-sm lg:text-base font-semibold">Privacy Settings</h3>
                          </div>

                          <FormField
                            control={form.control}
                            name="allowGuestMessages"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-2 lg:p-3">
                                <div className="space-y-0.5 min-w-0 flex-1">
                                  <FormLabel className="text-xs lg:text-base">Allow guest messages</FormLabel>
                                  <FormDescription className="text-xs hidden lg:block">
                                    Let guest users send you messages
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="showOnlineStatus"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-2 lg:p-3">
                                <div className="space-y-0.5 min-w-0 flex-1">
                                  <FormLabel className="text-xs lg:text-base">Show online status</FormLabel>
                                  <FormDescription className="text-xs hidden lg:block">
                                    Let others see when you're online
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex justify-end space-x-3 pt-6 border-t">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCancelEdit}
                            disabled={isSubmitting}
                            className="text-xs lg:text-sm px-4 lg:px-6"
                          >
                            <X className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            size="sm"
                            disabled={isSubmitting}
                            className="text-xs lg:text-sm px-4 lg:px-6 shadow-lg"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                                Save Changes
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

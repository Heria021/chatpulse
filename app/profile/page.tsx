"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { useAuth } from "@/lib/contexts/auth-context";
import { Loader2, User, Edit, Save, X } from "lucide-react";
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
                  <Button
                    onClick={() => setIsEditing(true)}
                    size="sm"
                    className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm flex-shrink-0"
                  >
                    <Edit className="h-3 w-3 lg:h-4 lg:w-4" />
                    <span className="hidden sm:inline">Edit Profile</span>
                    <span className="sm:hidden">Edit</span>
                  </Button>
                )}
              </div>

              {/* Profile Card */}
              <Card>
                <CardHeader className="pb-2 lg:pb-4">
                  <div className="flex items-center space-x-2 lg:space-x-4">
                    <Avatar className="h-12 w-12 lg:h-20 lg:w-20 flex-shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm lg:text-xl">
                        {getAvatarInitials(user.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-0.5 lg:space-y-1 min-w-0 flex-1">
                      <CardTitle className="text-base lg:text-2xl truncate">{user.username}</CardTitle>
                      <div className="flex items-center gap-1 lg:gap-2 flex-wrap">
                        <Badge variant={user.isGuest ? "secondary" : "default"} className="text-xs">
                          {user.isGuest ? "Guest" : "Member"}
                        </Badge>
                        {user.isOnline && (
                          <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                            Online
                          </Badge>
                        )}
                      </div>
                      {user.bio && (
                        <CardDescription className="text-xs lg:text-base line-clamp-2">
                          {user.bio}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 lg:space-y-6 pt-2 lg:pt-6">
                  {!isEditing ? (
                    // View Mode
                    <div className="space-y-3 lg:space-y-4">
                      <div className="grid grid-cols-2 gap-2 lg:gap-4">
                        <div>
                          <Label className="text-xs lg:text-sm font-medium text-muted-foreground">Age</Label>
                          <p className="text-sm lg:text-base">{user.age} years old</p>
                        </div>
                        <div>
                          <Label className="text-xs lg:text-sm font-medium text-muted-foreground">Gender</Label>
                          <p className="text-sm lg:text-base capitalize">{user.gender}</p>
                        </div>
                        {!user.isGuest && user.email && (
                          <div className="col-span-2">
                            <Label className="text-xs lg:text-sm font-medium text-muted-foreground">Email</Label>
                            <p className="text-sm lg:text-base truncate">{user.email}</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 lg:space-y-3 pt-2 border-t">
                        <h3 className="text-sm lg:text-base font-medium">Privacy Settings</h3>
                        <div className="space-y-1.5 lg:space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <Label className="text-xs lg:text-sm">Allow guest messages</Label>
                              <p className="text-xs text-muted-foreground hidden lg:block">
                                Let guest users send you messages
                              </p>
                            </div>
                            <Badge variant={user.allowGuestMessages ? "default" : "secondary"} className="text-xs flex-shrink-0">
                              {user.allowGuestMessages ? "On" : "Off"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <Label className="text-xs lg:text-sm">Show online status</Label>
                              <p className="text-xs text-muted-foreground hidden lg:block">
                                Let others see when you're online
                              </p>
                            </div>
                            <Badge variant={user.showOnlineStatus ? "default" : "secondary"} className="text-xs flex-shrink-0">
                              {user.showOnlineStatus ? "On" : "Off"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Edit Mode
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleUpdateProfile)} className="space-y-3 lg:space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 lg:gap-4">
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

                        <div className="space-y-2 lg:space-y-4 pt-2 border-t">
                          <h3 className="text-sm lg:text-base font-medium">Privacy Settings</h3>

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

                        <div className="flex justify-end space-x-2 pt-3 lg:pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCancelEdit}
                            disabled={isSubmitting}
                            className="text-xs lg:text-sm"
                          >
                            <X className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                            Cancel
                          </Button>
                          <Button type="submit" size="sm" disabled={isSubmitting} className="text-xs lg:text-sm">
                            {isSubmitting ? (
                              <>
                                <Loader2 className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                                Save
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
